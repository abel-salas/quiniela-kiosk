import type { Draw } from '../../../domain/draw';
import type { ResultGameId } from '../../../domain/games';
import { mapFootballDraw, type FootballGameId } from './football';
import { mapNumbersDraw } from './numbers';

const isFootballGame = (gameId: ResultGameId): gameId is FootballGameId =>
  gameId === 'LAQU' || gameId === 'QGOL';

const mapDraw = (value: unknown, gameId: ResultGameId): Draw | null =>
  isFootballGame(gameId) ? mapFootballDraw(value, gameId) : mapNumbersDraw(value, gameId);

export const mapResults = (value: unknown, gameId: ResultGameId): Draw[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => mapDraw(item, gameId))
    .filter((draw): draw is Draw => draw !== null)
    .sort((a, b) => a.date.localeCompare(b.date));
};
