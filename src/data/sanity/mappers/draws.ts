import type { Draw } from '../../../domain/draw';
import type { ResultGameId } from '../../../domain/games';
import { isRecord, toDateOnly } from '../parse';
import type { RawSanityDraw } from '../raw-types';
import { mapSanityFootballDraw, type SanityFootballGame } from './football';
import { mapSanityNumbersDraw } from './numbers';

const isFootballGame = (gameId: ResultGameId): gameId is SanityFootballGame =>
  gameId === 'LAQU' || gameId === 'QGOL';

export const mapSanityDraw = (value: unknown, gameId: ResultGameId): Draw | null => {
  if (!isRecord(value)) return null;
  const raw: RawSanityDraw = value;
  if (raw.game !== gameId) return null;

  const drawId = typeof raw._id === 'string' ? raw._id.trim() : '';
  const date = toDateOnly(raw.date);
  if (!drawId || !date) return null;

  return isFootballGame(gameId)
    ? mapSanityFootballDraw(raw, { gameId, drawId, date })
    : mapSanityNumbersDraw(raw, { gameId, drawId, date });
};

export const mapSanityDraws = (value: unknown, gameId: ResultGameId): Draw[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => mapSanityDraw(item, gameId))
    .filter((draw): draw is Draw => draw !== null)
    .sort((a, b) => a.date.localeCompare(b.date));
};
