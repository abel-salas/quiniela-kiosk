import { describe, expect, it, vi } from 'vitest';
import type { Draw } from '../../domain/draw';
import { createEntryCache, createMemoryStorage, ENTRY_TTL_MS, resultsKey, UPCOMING_KEY } from './entry-cache';

const NOW = new Date(2026, 9, 14, 10, 0);
const bono: Draw = {
  gameId: 'BONO', drawId: '1', date: '2026-10-13', source: 'selae', kind: 'numbers', numbers: [1], extras: [],
};

describe('createEntryCache', () => {
  it('stores one entry per prize and reads it back', () => {
    const storage = createMemoryStorage();
    const cache = createEntryCache(storage);
    cache.writeResults('BONO', [bono], NOW);
    cache.writeUpcoming([], NOW);

    expect(JSON.parse(storage.getItem(resultsKey('BONO')) ?? '')).toMatchObject({ version: 1, draws: [bono] });
    expect(cache.readResults('BONO', NOW)).toEqual({ savedAt: NOW.toISOString(), draws: [bono] });
    expect(cache.readUpcoming(NOW)).toEqual({ savedAt: NOW.toISOString(), upcoming: [] });
    expect(cache.readResults('EMIL', NOW)).toBeNull();
  });

  it('expires entries one week after the save and removes them', () => {
    const storage = createMemoryStorage();
    const cache = createEntryCache(storage);
    cache.writeResults('BONO', [bono], NOW);

    expect(cache.readResults('BONO', new Date(NOW.getTime() + ENTRY_TTL_MS))).not.toBeNull();
    expect(cache.readResults('BONO', new Date(NOW.getTime() + ENTRY_TTL_MS + 1))).toBeNull();
    expect(storage.getItem(resultsKey('BONO'))).toBeNull();
  });

  it('discards invalid JSON, unknown versions and draws of another game', () => {
    const storage = createMemoryStorage();
    const cache = createEntryCache(storage);
    storage.setItem(resultsKey('BONO'), '{');
    storage.setItem(resultsKey('EMIL'), JSON.stringify({ version: 1, savedAt: NOW.toISOString(), draws: [bono] }));
    storage.setItem(UPCOMING_KEY, JSON.stringify({ version: 2, savedAt: NOW.toISOString(), upcoming: [] }));

    expect(cache.readResults('BONO', NOW)).toBeNull();
    expect(cache.readResults('EMIL', NOW)).toBeNull();
    expect(cache.readUpcoming(NOW)).toBeNull();
    expect([resultsKey('BONO'), resultsKey('EMIL'), UPCOMING_KEY].map((key) => storage.getItem(key))).toEqual([null, null, null]);
  });

  it('keeps working when the storage throws', () => {
    const failing = {
      getItem: vi.fn(() => {
        throw new Error('denied');
      }),
      setItem: vi.fn(() => {
        throw new Error('quota');
      }),
      removeItem: vi.fn(),
    };
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const cache = createEntryCache(failing);

    expect(cache.writeResults('BONO', [bono], NOW).draws).toEqual([bono]);
    expect(cache.readResults('BONO', NOW)).toBeNull();
    warn.mockRestore();
  });
});
