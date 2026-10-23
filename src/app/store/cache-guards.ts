import type { Draw, DrawExtra, Match } from '../../domain/draw';
import { GAMES, type ResultGameId } from '../../domain/games';
import type { NextDraw } from '../../domain/next-draw';
import { RESULT_GAMES } from './snapshot';

/** Shape checks for data read back from localStorage. */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
export const isString = (value: unknown): value is string => typeof value === 'string';
const isNullableString = (value: unknown): value is string | null => value === null || isString(value);
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isNullableNumber = (value: unknown): value is number | null => value === null || isNumber(value);
const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(isString);

const isResultGameId = (value: unknown): value is ResultGameId =>
  isString(value) && RESULT_GAMES.some((gameId) => gameId === value);

export const isNextDraw = (value: unknown): value is NextDraw => {
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

export const isDraw = (value: unknown): value is Draw => {
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
