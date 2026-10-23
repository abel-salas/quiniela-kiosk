import type { Draw } from '../../domain/draw';
import type { ResultGameId } from '../../domain/games';
import type { NextDraw } from '../../domain/next-draw';
import type { StoredEntry, StoredResults } from '../refresh/calendar';
import { isDraw, isNextDraw, isRecord, isString } from './cache-guards';

export const CACHE_PREFIX = 'quiniela:';
export const ENTRY_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const UPCOMING_KEY = `${CACHE_PREFIX}upcoming`;
export const resultsKey = (gameId: ResultGameId): string => `${CACHE_PREFIX}results:${gameId}`;

export type CacheStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export interface StoredUpcoming extends StoredEntry {
  upcoming: NextDraw[];
}

/** One localStorage entry per prize, each valid for a week after its last successful save. */
export interface EntryCache {
  readResults(gameId: ResultGameId, now: Date): StoredResults | null;
  writeResults(gameId: ResultGameId, draws: Draw[], now: Date): StoredResults;
  readUpcoming(now: Date): StoredUpcoming | null;
  writeUpcoming(upcoming: NextDraw[], now: Date): StoredUpcoming;
}

/** In-memory storage for `?mock=1`, which never touches localStorage. */
export const createMemoryStorage = (): CacheStorage => {
  const items = new Map<string, string>();
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
    removeItem: (key) => void items.delete(key),
  };
};

const isFresh = (savedAt: unknown, now: Date): savedAt is string => {
  if (!isString(savedAt)) return false;
  const savedMs = Date.parse(savedAt);
  return Number.isFinite(savedMs) && savedMs <= now.getTime() && now.getTime() - savedMs <= ENTRY_TTL_MS;
};

export const createEntryCache = (storage: CacheStorage): EntryCache => {
  const remove = (key: string): void => {
    try {
      storage.removeItem(key);
    } catch (error) {
      console.warn(`Unable to remove cache entry ${key}:`, error);
    }
  };

  /** Valid entry or null; invalid or expired entries are removed. */
  const read = (key: string, now: Date): Record<string, unknown> | null => {
    let serialized: string | null;
    try {
      serialized = storage.getItem(key);
    } catch (error) {
      console.warn(`Unable to read cache entry ${key}:`, error);
      return null;
    }
    if (serialized === null) return null;
    let value: unknown = null;
    try {
      value = JSON.parse(serialized);
    } catch {
      // Handled below as an invalid entry.
    }
    if (isRecord(value) && value.version === 1 && isFresh(value.savedAt, now)) return value;
    remove(key);
    return null;
  };

  const write = (key: string, value: Record<string, unknown>): void => {
    try {
      storage.setItem(key, JSON.stringify({ version: 1, ...value }));
    } catch {
      // Persistence is best-effort; the live in-memory board remains usable.
    }
  };

  return {
    readResults(gameId, now) {
      const value = read(resultsKey(gameId), now);
      const valid = value
        && Array.isArray(value.draws)
        && value.draws.every((draw) => isDraw(draw) && draw.gameId === gameId);
      if (!value || !valid) {
        if (value) remove(resultsKey(gameId));
        return null;
      }
      return { savedAt: String(value.savedAt), draws: value.draws as Draw[] };
    },
    writeResults(gameId, draws, now) {
      const entry = { savedAt: now.toISOString(), draws };
      write(resultsKey(gameId), entry);
      return entry;
    },
    readUpcoming(now) {
      const value = read(UPCOMING_KEY, now);
      if (!value || !Array.isArray(value.upcoming) || !value.upcoming.every(isNextDraw)) {
        if (value) remove(UPCOMING_KEY);
        return null;
      }
      return { savedAt: String(value.savedAt), upcoming: value.upcoming as NextDraw[] };
    },
    writeUpcoming(upcoming, now) {
      const entry = { savedAt: now.toISOString(), upcoming };
      write(UPCOMING_KEY, entry);
      return entry;
    },
  };
};
