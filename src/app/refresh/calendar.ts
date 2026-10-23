import type { Draw, FootballDraw } from '../../domain/draw';
import type { ResultGameId } from '../../domain/games';
import { atLocalTime, parseLocalIso, toLocalDateKey } from './time';

/** A result game or the upcoming draws (jackpots) list. */
export type RefreshItem = ResultGameId | 'upcoming';

/** Call order of every cycle. An item that fails twice is skipped until the next cycle. */
export const REFRESH_ORDER: readonly RefreshItem[] = [
  'upcoming',
  'LAQU',
  'QGOL',
  'BONO',
  'EMIL',
  'LAPR',
  'ELGR',
  'EDMS',
];

/** Daily cycle: results of the previous evening's draws are fetched at this local time. */
export const MORNING_REFRESH_AT = '09:15';
/** Football without a known end of jornada: fetch again after this many days. */
export const FOOTBALL_IDLE_DAYS = 3;

export type NumbersGameId = Exclude<ResultGameId, 'LAQU' | 'QGOL'>;

/** Draw weekdays (0 = Sunday). Results are fetched the next morning. */
export const DRAW_WEEKDAYS: Record<NumbersGameId, readonly number[]> = {
  BONO: [0, 1, 2, 3, 4, 5, 6],
  EMIL: [2, 5],
  LAPR: [1, 4, 6],
  ELGR: [0],
  EDMS: [1, 4],
};

const morningOf = (dateKey: string): Date => {
  const slot = atLocalTime(dateKey, MORNING_REFRESH_AT);
  if (!slot) throw new RangeError(`Invalid date ${dateKey}`);
  return slot;
};

/** Latest morning slot at or before `now`. */
export const lastMorningSlot = (now: Date): Date => {
  const today = morningOf(toLocalDateKey(now));
  return today <= now ? today : morningOf(toLocalDateKey(now, -1));
};

/** Date of the latest draw whose results are already due (its next morning has passed). */
export const expectedDrawDate = (gameId: NumbersGameId, now: Date): string | null => {
  const slot = lastMorningSlot(now);
  for (let offset = 1; offset <= 7; offset += 1) {
    const day = new Date(slot.getFullYear(), slot.getMonth(), slot.getDate() - offset);
    if (DRAW_WEEKDAYS[gameId].includes(day.getDay())) return toLocalDateKey(day);
  }
  return null;
};

const lastKickoffDay = (draw: FootballDraw): Date | null => {
  const days = draw.matches
    .map((match) => (match.kickoff ? parseLocalIso(match.kickoff.slice(0, 10)) : null))
    .filter((day): day is Date => day !== null);
  return days.reduce<Date | null>((max, day) => (max === null || day > max ? day : max), null);
};

/**
 * Football: with an open jornada, the morning after its last kickoff; otherwise (or without
 * kickoffs) the morning `FOOTBALL_IDLE_DAYS` days after the last save.
 */
export const footballDueAt = (draws: Draw[], savedAt: Date): Date => {
  const latest = draws[draws.length - 1];
  if (latest?.kind === 'football' && latest.status === 'open') {
    const end = lastKickoffDay(latest);
    if (end) return morningOf(toLocalDateKey(end, 1));
  }
  return morningOf(toLocalDateKey(savedAt, FOOTBALL_IDLE_DAYS));
};

export interface StoredEntry {
  /** ISO instant of the last successful save. */
  savedAt: string;
}

export interface StoredResults extends StoredEntry {
  draws: Draw[];
}

const isFootballGame = (gameId: ResultGameId): gameId is 'LAQU' | 'QGOL' =>
  gameId === 'LAQU' || gameId === 'QGOL';

/** Whether a result game must be fetched now, given what is already stored. */
export const isResultsDue = (gameId: ResultGameId, entry: StoredResults | null, now: Date): boolean => {
  if (!entry) return true;
  if (isFootballGame(gameId)) return now >= footballDueAt(entry.draws, new Date(entry.savedAt));
  const expected = expectedDrawDate(gameId, now);
  return expected !== null && !entry.draws.some((draw) => draw.date >= expected);
};

/** Upcoming draws: once per day, from the morning slot on. */
export const isUpcomingDue = (entry: StoredEntry | null, now: Date): boolean =>
  !entry || new Date(entry.savedAt) < lastMorningSlot(now);
