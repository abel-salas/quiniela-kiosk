import type { ResultGameId } from '../../domain/games';
import { toLocalDateKey } from '../refresh/time';

/** Numbers games: one week of draws. */
export const NUMBERS_WINDOW_DAYS = 7;
/** Football: two weeks, so the previous finished jornada is still in range while the next one is open. */
export const FOOTBALL_WINDOW_DAYS = 14;

export interface DateWindow {
  from: string;
  to: string;
}

export const windowDays = (gameId: ResultGameId): number =>
  gameId === 'LAQU' || gameId === 'QGOL' ? FOOTBALL_WINDOW_DAYS : NUMBERS_WINDOW_DAYS;

export const resultsWindow = (now: Date, gameId: ResultGameId): DateWindow => ({
  from: toLocalDateKey(now, -windowDays(gameId)),
  to: toLocalDateKey(now),
});
