import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ResultGameId } from '../../domain/games';
import { ProviderError, type SelaeRepository } from '../../domain/repository';
import { createSelaeFixtureRepository } from '../../data/selae/fixture-repository';
import { systemClock } from '../clock';
import type { StorageEvents } from '../refresh/lifecycle';
import { createBoardStore, type BoardStoreDeps } from './board-store';
import { createEntryCache, createMemoryStorage, resultsKey } from './entry-cache';
import type { KioskStorage } from './legacy-cache';

// Wednesday 2026-10-14, same instant as the fixtures.
const NOW = new Date(2026, 9, 14, 22, 0);

const spySelae = (failing: ResultGameId[] = []) => {
  const fixture = createSelaeFixtureRepository();
  const calls: string[] = [];
  const selae = {
    getRecentDraws: vi.fn<SelaeRepository['getRecentDraws']>(async (gameId, from, to) => {
      calls.push(gameId);
      if (failing.includes(gameId)) throw new ProviderError('invalid', 'bad JSON');
      return fixture.getRecentDraws(gameId, from, to);
    }),
    getUpcoming: vi.fn<SelaeRepository['getUpcoming']>(async () => {
      calls.push('upcoming');
      return fixture.getUpcoming();
    }),
  };
  return { selae, calls };
};

const kioskStorage = (): KioskStorage => {
  const memory = createMemoryStorage();
  return { ...memory, length: 0, key: () => null };
};

const fakeEvents = () => {
  const listeners = new Set<(key: string | null) => void>();
  const events: StorageEvents = {
    onChange: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  return { events, emit: (key: string) => listeners.forEach((listener) => listener(key)), listeners };
};

const setup = (overrides: Partial<BoardStoreDeps> = {}) => {
  const { selae, calls } = spySelae();
  const storage = kioskStorage();
  const reload = vi.fn();
  const { events, emit, listeners } = fakeEvents();
  const deps: BoardStoreDeps = {
    selae, clock: systemClock, reload, storage, persist: true, events, wait: async () => undefined, ...overrides,
  };
  return { store: createBoardStore(deps), selae: deps.selae, calls, storage, reload, emit, listeners };
};

describe('createBoardStore', () => {
  beforeEach(() => vi.useFakeTimers({ now: NOW }));
  afterEach(() => vi.useRealTimers());

  it('calls every prize in the fixed order and stores each one with its own entry', async () => {
    const { store, selae, calls, storage } = setup();
    store.start();
    await vi.advanceTimersByTimeAsync(15_000);
    const snapshot = store.getSnapshot();

    expect(calls).toEqual(['upcoming', 'LAQU', 'QGOL', 'BONO', 'EMIL', 'LAPR', 'ELGR', 'EDMS']);
    expect(selae.getRecentDraws).toHaveBeenCalledWith('BONO', '2026-10-07', '2026-10-14');
    expect(selae.getRecentDraws).toHaveBeenCalledWith('LAQU', '2026-09-30', '2026-10-14');
    expect(snapshot.results.BONO.draws.map((draw) => draw.date)).toEqual(['2026-10-12', '2026-10-13', '2026-10-14']);
    expect(snapshot.upcoming).toHaveLength(20);
    expect(snapshot.lastUpdatedAt).toMatch(/^2026-10-14T22:00/);
    expect(storage.getItem(resultsKey('BONO'))).toContain('"draws"');
    store.stop();
  });

  it('checks the stored entries first and skips the calls that are not due', async () => {
    const first = setup();
    first.store.start();
    await vi.advanceTimersByTimeAsync(15_000);
    first.store.stop();

    const second = setup({ storage: first.storage });
    second.store.start();
    expect(second.store.getSnapshot().results.EMIL.draws.length).toBeGreaterThan(0);
    await vi.advanceTimersByTimeAsync(15_000);
    expect(second.calls).toEqual([]);
    second.store.stop();
  });

  it('skips a prize after two failed attempts and keeps its stored value', async () => {
    const { selae, calls } = spySelae(['QGOL']);
    const { store, storage } = setup({ selae });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const stored = createEntryCache(storage).writeResults('QGOL', [], new Date(2026, 9, 10, 10, 0));
    store.start();
    await vi.advanceTimersByTimeAsync(20_000);

    expect(calls).toEqual(['upcoming', 'LAQU', 'QGOL', 'QGOL', 'BONO', 'EMIL', 'LAPR', 'ELGR', 'EDMS']);
    expect(createEntryCache(storage).readResults('QGOL', NOW)).toEqual(stored);
    warn.mockRestore();
    store.stop();
  });

  it('runs the cycle again every morning at 09:15', async () => {
    const { store, calls } = setup();
    store.start();
    await vi.advanceTimersByTimeAsync(15_000);
    calls.length = 0;

    await vi.advanceTimersByTimeAsync(11 * 3_600_000);
    expect(calls).toEqual([]);
    await vi.advanceTimersByTimeAsync(20 * 60_000);
    expect(calls).toEqual(['upcoming']);
    store.stop();
  });

  it('shows entries saved from /cms in another tab', async () => {
    const { store, storage, emit } = setup();
    store.start();
    await vi.advanceTimersByTimeAsync(15_000);

    createEntryCache(storage).writeResults('BONO', [], new Date());
    emit(resultsKey('BONO'));
    expect(store.getSnapshot().results.BONO.draws).toEqual([]);
    store.stop();
  });

  it('keeps everything in memory without persistence', async () => {
    const { store, storage } = setup({ persist: false });
    store.start();
    await vi.advanceTimersByTimeAsync(15_000);
    expect(store.getSnapshot().results.BONO.draws).toHaveLength(3);
    expect(storage.getItem(resultsKey('BONO'))).toBeNull();
    store.stop();
  });

  it('reloads the page at 05:00 and stops every timer on stop', async () => {
    const { store, calls, reload, listeners } = setup();
    store.start();
    await vi.advanceTimersByTimeAsync(7 * 3_600_000 + 1_000);
    expect(reload).toHaveBeenCalledTimes(1);

    store.stop();
    expect(listeners.size).toBe(0);
    const count = calls.length;
    await vi.advanceTimersByTimeAsync(48 * 3_600_000);
    expect(calls).toHaveLength(count);
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
