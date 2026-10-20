import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSelaeFixtureRepository } from '../../data/selae/fixture-repository';
import { systemClock } from '../clock';
import { createBoardStore } from './board-store';
import { BOARD_CACHE_KEY, saveBoardCache } from './board-cache';
import { createInitialSnapshot, withGame } from './snapshot';

const manual = {
  getRecentDraws: async () => [],
  getForcedGames: async () => [],
  getSlides: async () => [],
};

const createStorage = () => {
  const values = new Map<string, string>();
  return {
    values,
    length: 0,
    key: () => null,
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => values.set(key, value)),
    removeItem: vi.fn((key: string) => values.delete(key)),
  };
};

describe('board-store cache integration', () => {
  beforeEach(() => vi.useFakeTimers({ now: new Date(2026, 9, 14, 22, 0) }));
  afterEach(() => vi.useRealTimers());

  it('hydrates before scheduling, avoiding a fetch for an up-to-date game', async () => {
    const fixture = createSelaeFixtureRepository();
    const draws = await fixture.getRecentDraws('BONO', '2026-09-14', '2026-10-14');
    const upcoming = await fixture.getUpcoming();
    const next = upcoming.find((draw) => draw.gameId === 'BONO') ?? null;
    const snapshot = withGame({ ...createInitialSnapshot(), upcoming }, 'BONO', { draws, next });
    const storage = createStorage();
    saveBoardCache(storage, snapshot, new Date());
    const selae = createSelaeFixtureRepository();
    const getRecentDraws = vi.spyOn(selae, 'getRecentDraws');
    const getUpcoming = vi.spyOn(selae, 'getUpcoming');
    const store = createBoardStore({
      selae,
      manual,
      clock: systemClock,
      storage,
      persist: true,
      reload: vi.fn(),
      events: { onWake: () => () => undefined },
    });

    store.start();
    await vi.advanceTimersByTimeAsync(15_000);

    expect(getRecentDraws.mock.calls.some(([gameId]) => gameId === 'BONO')).toBe(false);
    expect(getUpcoming).toHaveBeenCalledOnce();
    expect(store.getSnapshot().results.BONO.draws).toEqual(draws);
    expect(storage.values.has(BOARD_CACHE_KEY)).toBe(true);
    store.stop();
  });

  it('does not read or write the board cache when persistence is disabled', async () => {
    const storage = createStorage();
    const store = createBoardStore({
      selae: createSelaeFixtureRepository(),
      manual,
      clock: systemClock,
      storage,
      reload: vi.fn(),
      events: { onWake: () => () => undefined },
    });

    store.start();
    await vi.advanceTimersByTimeAsync(15_000);

    expect(storage.getItem).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();
    store.stop();
  });
});
