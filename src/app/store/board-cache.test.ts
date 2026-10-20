import { describe, expect, it, vi } from 'vitest';
import { createSelaeFixtureRepository } from '../../data/selae/fixture-repository';
import { createInitialSnapshot, RESULT_GAMES, withGame } from './snapshot';
import { BOARD_CACHE_KEY, BOARD_CACHE_TTL_MS, loadBoardCache, saveBoardCache } from './board-cache';

const createStorage = () => {
  const values = new Map<string, string>();
  return {
    values,
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => values.set(key, value)),
    removeItem: vi.fn((key: string) => values.delete(key)),
  };
};

describe('board cache', () => {
  it('round-trips the persisted snapshot fields', () => {
    const storage = createStorage();
    const snapshot = {
      ...createInitialSnapshot(),
      lastUpdatedAt: '2026-10-14T22:00:00',
      upcoming: [{
        gameId: 'BONO' as const,
        date: '2026-10-15',
        drawAt: null,
        salesCloseAt: '2026-10-15T21:00:00',
        salesOpen: true,
        jackpot: 100_000,
        addOn: null,
        jornada: null,
        nacionalFirstPrize: null,
        nacionalSpecialPrize: null,
      }],
    };
    saveBoardCache(storage, snapshot, new Date('2026-10-14T22:00:00'));

    expect(storage.values.has(BOARD_CACHE_KEY)).toBe(true);
    const loaded = loadBoardCache(storage, new Date('2026-10-15T00:00:00'));
    expect(loaded).toMatchObject({
      lastUpdatedAt: snapshot.lastUpdatedAt,
      upcoming: snapshot.upcoming,
    });
    RESULT_GAMES.forEach((gameId) => {
      expect(loaded?.results[gameId]).toEqual({ draws: [], next: null });
    });
  });

  it('round-trips real mapped draws and upcoming draws from the fixtures', async () => {
    const storage = createStorage();
    const selae = createSelaeFixtureRepository();
    let snapshot = { ...createInitialSnapshot(), upcoming: await selae.getUpcoming() };
    for (const gameId of RESULT_GAMES) {
      const draws = await selae.getRecentDraws(gameId, '2026-09-01', '2026-10-31');
      const next = snapshot.upcoming.find((draw) => draw.gameId === gameId) ?? null;
      snapshot = withGame(snapshot, gameId, { draws, next });
    }
    const now = new Date('2026-10-14T22:00:00');
    saveBoardCache(storage, snapshot, now);

    const loaded = loadBoardCache(storage, now);
    expect(loaded?.upcoming).toEqual(snapshot.upcoming);
    RESULT_GAMES.forEach((gameId) => {
      expect(loaded?.results[gameId].draws.length).toBeGreaterThan(0);
      expect(loaded?.results[gameId]).toEqual({ draws: snapshot.results[gameId].draws, next: snapshot.results[gameId].next });
    });
  });

  it('removes a cache older than 12 hours', () => {
    const storage = createStorage();
    saveBoardCache(storage, createInitialSnapshot(), new Date('2026-10-14T00:00:00'));

    expect(loadBoardCache(storage, new Date('2026-10-14T12:00:00.001'))).toBeNull();
    expect(storage.values.has(BOARD_CACHE_KEY)).toBe(false);
  });

  it.each([
    ['broken JSON', '{'],
    ['unknown version', JSON.stringify({ version: 2 })],
    ['unknown game id', JSON.stringify({
      version: 1,
      savedAt: '2026-10-14T00:00:00.000Z',
      lastUpdatedAt: null,
      upcoming: [],
      results: {
        BONO: { draws: [{ gameId: 'UNKNOWN', date: '2026-10-14', kind: 'numbers' }], next: null },
      },
    })],
  ])('removes %s', (_label, serialized) => {
    const storage = createStorage();
    storage.setItem(BOARD_CACHE_KEY, serialized);

    expect(loadBoardCache(storage, new Date('2026-10-14T01:00:00'))).toBeNull();
    expect(storage.values.has(BOARD_CACHE_KEY)).toBe(false);
  });

  it('ignores storage quota errors when saving', () => {
    const storage = createStorage();
    storage.setItem.mockImplementation(() => {
      throw new Error('quota exceeded');
    });

    expect(() => saveBoardCache(storage, createInitialSnapshot(), new Date())).not.toThrow();
    expect(BOARD_CACHE_TTL_MS).toBe(43_200_000);
  });
});
