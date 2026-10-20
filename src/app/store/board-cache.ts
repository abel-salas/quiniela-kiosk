import type { Draw, DrawExtra, Match } from '../../domain/draw';
import { GAMES, type ResultGameId } from '../../domain/games';
import type { NextDraw } from '../../domain/next-draw';
import type { BoardSnapshot } from './types';
import { RESULT_GAMES } from './snapshot';

export const BOARD_CACHE_KEY = 'quiniela:board:v1';
export const BOARD_CACHE_TTL_MS = 12 * 60 * 60 * 1000;

type CachedGame = Pick<BoardSnapshot['results'][ResultGameId], 'draws' | 'next'>;
export type BoardCacheData = Pick<BoardSnapshot, 'lastUpdatedAt' | 'upcoming'> & {
  results: Record<ResultGameId, CachedGame>;
};

type CacheStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === 'string';
const isNullableString = (value: unknown): value is string | null => value === null || isString(value);
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isNullableNumber = (value: unknown): value is number | null => value === null || isNumber(value);
const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(isString);

const isResultGameId = (value: unknown): value is ResultGameId =>
  isString(value) && RESULT_GAMES.some((gameId) => gameId === value);

const isNextDraw = (value: unknown): value is NextDraw => {
  if (!isRecord(value) || !isString(value.gameId) || !Object.prototype.hasOwnProperty.call(GAMES, value.gameId)) return false;
  if (!isString(value.date) || !isNullableString(value.drawAt) || !isNullableString(value.salesCloseAt)) return false;
  if (typeof value.salesOpen !== 'boolean' || !isNullableNumber(value.jackpot)) return false;
  if (!isNullableNumber(value.jornada) || !isNullableNumber(value.nacionalFirstPrize)) return false;
  if (!isNullableNumber(value.nacionalSpecialPrize)) return false;
  return value.addOn === null || (
    isRecord(value.addOn)
    && (value.addOn.kind === 'joker' || value.addOn.kind === 'millon')
    && isNumber(value.addOn.amount)
  );
};

const isDrawExtra = (value: unknown): value is DrawExtra =>
  isRecord(value)
  && ['complementario', 'reintegro', 'clave', 'estrellas', 'joker', 'millon', 'sueno'].includes(String(value.kind))
  && isStringArray(value.values);

const isMatch = (value: unknown): value is Match =>
  isRecord(value)
  && isNumber(value.position)
  && isString(value.home)
  && isString(value.away)
  && isNullableString(value.kickoff)
  && isNullableString(value.score)
  && isNullableString(value.sign);

const isDraw = (value: unknown): value is Draw => {
  if (!isRecord(value) || !isResultGameId(value.gameId)) return false;
  if (!isString(value.drawId) || !isString(value.date) || !['selae', 'sanity'].includes(String(value.source))) return false;
  if (value.kind === 'numbers') {
    return Array.isArray(value.numbers)
      && value.numbers.every(isNumber)
      && Array.isArray(value.extras)
      && value.extras.every(isDrawExtra);
  }
  return value.kind === 'football'
    && isNumber(value.jornada)
    && (value.status === 'open' || value.status === 'final')
    && Array.isArray(value.matches)
    && value.matches.every(isMatch);
};

const isCachedGame = (value: unknown, gameId: ResultGameId): value is CachedGame =>
  isRecord(value)
  && Array.isArray(value.draws)
  && value.draws.every((draw) => isDraw(draw) && draw.gameId === gameId)
  && (value.next === null || (isNextDraw(value.next) && value.next.gameId === gameId));

const isCache = (value: unknown, now: Date): value is BoardCacheData & { version: 1; savedAt: string } => {
  if (!isRecord(value) || value.version !== 1 || !isString(value.savedAt)) return false;
  const savedAt = Date.parse(value.savedAt);
  if (!Number.isFinite(savedAt) || now.getTime() - savedAt > BOARD_CACHE_TTL_MS || savedAt > now.getTime()) return false;
  if (!isNullableString(value.lastUpdatedAt) || !Array.isArray(value.upcoming) || !value.upcoming.every(isNextDraw)) return false;
  if (!isRecord(value.results)) return false;
  const results = value.results;
  return RESULT_GAMES.every((gameId) => isCachedGame(results[gameId], gameId));
};

export const loadBoardCache = (storage: CacheStorage, now: Date): BoardCacheData | null => {
  let serialized: string | null;
  try {
    serialized = storage.getItem(BOARD_CACHE_KEY);
  } catch (error) {
    console.warn('Unable to read board cache:', error);
    return null;
  }
  if (serialized === null) return null;

  let value: unknown;
  try {
    value = JSON.parse(serialized);
  } catch {
    value = null;
  }
  if (isCache(value, now)) return value;

  try {
    storage.removeItem(BOARD_CACHE_KEY);
  } catch (error) {
    console.warn('Unable to remove invalid board cache:', error);
  }
  return null;
};

export const saveBoardCache = (
  storage: CacheStorage,
  snapshot: BoardSnapshot,
  now: Date,
): void => {
  const results: BoardCacheData['results'] = {
    BONO: { draws: [], next: null },
    EDMS: { draws: [], next: null },
    ELGR: { draws: [], next: null },
    LAPR: { draws: [], next: null },
    EMIL: { draws: [], next: null },
    LAQU: { draws: [], next: null },
    QGOL: { draws: [], next: null },
  };
  RESULT_GAMES.forEach((gameId) => {
    const { draws, next } = snapshot.results[gameId];
    results[gameId] = { draws, next };
  });
  try {
    storage.setItem(BOARD_CACHE_KEY, JSON.stringify({
      version: 1,
      savedAt: now.toISOString(),
      lastUpdatedAt: snapshot.lastUpdatedAt,
      upcoming: snapshot.upcoming,
      results,
    }));
  } catch {
    // Persistence is best-effort; the live in-memory board remains usable.
  }
};
