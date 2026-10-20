import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ResultGameId } from '../../domain/games';
import { ProviderError, type ManualRepository, type SelaeRepository } from '../../domain/repository';
import { createSanityFixtureRepository } from '../../data/sanity/fixture-repository';
import { createSelaeFixtureRepository } from '../../data/selae/fixture-repository';
import { systemClock } from '../clock';
import { createBoardStore, type BoardStoreDeps } from './board-store';

const spySelae = (failing: ResultGameId[] = []) => {
  const fixture = createSelaeFixtureRepository();
  const selae = {
    getRecentDraws: vi.fn<SelaeRepository['getRecentDraws']>(async (gameId, from, to) => {
      if (failing.includes(gameId)) throw new ProviderError('blocked', '403');
      return fixture.getRecentDraws(gameId, from, to);
    }),
    getUpcoming: vi.fn<SelaeRepository['getUpcoming']>(() => fixture.getUpcoming()),
  };
  return selae;
};

const spyManual = (forced: ResultGameId[] = []) => {
  const fixture = createSanityFixtureRepository();
  const manual = {
    getRecentDraws: vi.fn<ManualRepository['getRecentDraws']>((...args) => fixture.getRecentDraws(...args)),
    getForcedGames: vi.fn<ManualRepository['getForcedGames']>(async () => forced),
    getSlides: vi.fn<ManualRepository['getSlides']>(async () => []),
  };
  return manual;
};

const setup = (overrides: Partial<BoardStoreDeps> = {}) => {
  const selae = spySelae();
  const manual = spyManual();
  const reload = vi.fn();
  const store = createBoardStore({
    selae, manual, clock: systemClock, reload, storage: null, events: { onWake: () => () => undefined }, ...overrides,
  });
  return { store, selae, manual, reload };
};

const sources = (store: ReturnType<typeof createBoardStore>, gameId: ResultGameId) =>
  store.getSnapshot().results[gameId].draws.map((draw) => draw.source);

describe('createBoardStore', () => {
  beforeEach(() => vi.useFakeTimers({ now: new Date(2026, 9, 14, 22, 0) }));
  afterEach(() => vi.useRealTimers());

  it('loads every game from SELAE and the upcoming list with a single call', async () => {
    const { store, selae } = setup();
    const listener = vi.fn();
    store.subscribe(listener);
    store.start();
    // 8 SELAE requests, one at a time and 1.5 s apart.
    await vi.advanceTimersByTimeAsync(15_000);
    const snapshot = store.getSnapshot();

    expect(selae.getRecentDraws).toHaveBeenCalledTimes(7);
    expect(selae.getRecentDraws).toHaveBeenCalledWith('BONO', '2026-09-14', '2026-10-14');
    expect(selae.getUpcoming).toHaveBeenCalledTimes(1);
    expect(snapshot.results.BONO.draws.map((draw) => draw.date)).toEqual(['2026-10-12', '2026-10-13', '2026-10-14']);
    expect(snapshot.results.BONO.next?.date).toBe('2026-10-20');
    expect(snapshot.results.LAQU.phase).toBe('provisional');
    expect(snapshot.upcoming).toHaveLength(20);
    expect(snapshot.lastUpdatedAt).not.toBeNull();
    expect(listener).toHaveBeenCalled();
    store.stop();
  });

  it('keeps current data when SELAE fails and counts the error (no fallback to Sanity)', async () => {
    const selae = spySelae(['BONO']);
    const { store } = setup({ selae });
    store.start();
    await vi.advanceTimersByTimeAsync(75_000);

    const bono = store.getSnapshot().results.BONO;
    expect(selae.getRecentDraws.mock.calls.filter(([id]) => id === 'BONO')).toHaveLength(3);
    expect(bono).toMatchObject({ errorCount: 1, lastErrorKind: 'blocked' });
    expect(sources(store, 'BONO')).toEqual([]); // No data since no cache and SELAE failed
    expect(sources(store, 'EMIL').every((source) => source === 'selae')).toBe(true);

    await vi.advanceTimersByTimeAsync(90_000);
    expect(store.getSnapshot().results.BONO.errorCount).toBe(2);
    store.stop();
  });

  it('manualOnly reads results only from Sanity but upcoming from SELAE', async () => {
    const { store, selae } = setup({ sourceMode: 'manualOnly' });
    store.start();
    await vi.advanceTimersByTimeAsync(10_000);

    expect(selae.getRecentDraws).not.toHaveBeenCalled();
    expect(selae.getUpcoming).toHaveBeenCalledTimes(1);
    expect(sources(store, 'BONO')).toEqual(['sanity']);
    expect(sources(store, 'QGOL')).toEqual(['sanity']);
    store.stop();
  });

  it('reads forced games from Sanity and reacts when the list changes', async () => {
    const manual = spyManual(['BONO']);
    const { store, selae } = setup({ manual });
    store.start();
    await vi.advanceTimersByTimeAsync(10_000);

    expect(store.getSnapshot().forcedGames).toEqual(['BONO']);
    expect(selae.getRecentDraws.mock.calls.some(([id]) => id === 'BONO')).toBe(false);
    expect(sources(store, 'BONO')).toEqual(['sanity']);

    manual.getForcedGames.mockResolvedValue([]);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(store.getSnapshot().forcedGames).toEqual([]);
    expect(selae.getRecentDraws.mock.calls.some(([id]) => id === 'BONO')).toBe(true);
    store.stop();
  });

  it('reloads the page at 05:00 and stops every timer on stop', async () => {
    const { store, selae, reload } = setup();
    store.start();
    await vi.advanceTimersByTimeAsync(7 * 3_600_000);
    expect(reload).toHaveBeenCalledTimes(1);

    store.stop();
    const calls = selae.getRecentDraws.mock.calls.length + selae.getUpcoming.mock.calls.length;
    await vi.advanceTimersByTimeAsync(24 * 3_600_000);
    expect(selae.getRecentDraws.mock.calls.length + selae.getUpcoming.mock.calls.length).toBe(calls);
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
