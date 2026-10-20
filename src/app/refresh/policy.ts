import type { Draw, FootballDraw } from '../../domain/draw';
import type { GameInfo } from '../../domain/games';
import type { NextDraw } from '../../domain/next-draw';
import type { DrawPhase, GameState } from '../store/types';
import { addMinutes, atLocalTime, minutesBetween, parseLocalIso } from './time';

export interface PolicyInput {
  now: Date;
  game: GameInfo;
  state: GameState;
}

export interface RefreshDecision {
  at: Date;
  phase: DrawPhase;
  fetchResults: boolean;
  fetchUpcoming: boolean;
}

const ERROR_BACKOFF_MIN = [1, 2, 5, 10, 15];
const POLL_MIN = 5;
const AWAIT_FAST_MIN = 3 * 60;
const AWAIT_SLOW_MIN = 30;
const MATCH_LENGTH_MIN = 2 * 60 + 15;
const MATCH_RESULT_AFTER_MIN = 60 + 50;
const PROVISIONAL_MAX_MIN = 60;
const IDLE_MIN_MIN = 1;
const IDLE_MAX_MIN = 6 * 60;

/**
 * When the result of `next` may be available: provider draw time, else the game's results time,
 * else (football) sales close, else midnight of the draw date.
 */
export const expectedResultAt = (game: GameInfo, next: NextDraw): Date | null => {
  if (next.drawAt) return parseLocalIso(next.drawAt);
  if (game.resultsFromTime) return atLocalTime(next.date, game.resultsFromTime);
  return (next.salesCloseAt ? parseLocalIso(next.salesCloseAt) : null) ?? parseLocalIso(next.date);
};

const isDefinitive = (draw: Draw): boolean => draw.kind === 'numbers' || draw.status === 'final';

const openFootballDraw = (draws: Draw[]): FootballDraw | null => {
  const latest = draws[draws.length - 1];
  return latest?.kind === 'football' && latest.status === 'open' ? latest : null;
};

const isAwaitingResult = (now: Date, game: GameInfo, state: GameState): boolean => {
  const { next } = state;
  if (!next) return false;
  const expectedAt = expectedResultAt(game, next);
  return expectedAt !== null && now >= expectedAt && !state.draws.some((draw) => draw.date === next.date);
};

export const derivePhase = (now: Date, game: GameInfo, state: GameState): DrawPhase => {
  if (openFootballDraw(state.draws)) return 'provisional';
  return isAwaitingResult(now, game, state) ? 'awaitingResult' : 'upToDate';
};

const provisionalDelayMin = (now: Date, draw: FootballDraw): number => {
  const kickoffs = draw.matches
    .map((match) => (match.kickoff ? parseLocalIso(match.kickoff) : null))
    .filter((kickoff): kickoff is Date => kickoff !== null);
  const inPlay = kickoffs.some((kickoff) => now >= kickoff && now <= addMinutes(kickoff, MATCH_LENGTH_MIN));
  const upcoming = kickoffs.filter((kickoff) => kickoff > now).sort((a, b) => a.getTime() - b.getTime());
  if (inPlay || upcoming.length === 0) return POLL_MIN;
  return Math.min(minutesBetween(now, addMinutes(upcoming[0], MATCH_RESULT_AFTER_MIN)), PROVISIONAL_MAX_MIN);
};

const idleDelayMin = (now: Date, game: GameInfo, next: NextDraw): number => {
  const expectedAt = expectedResultAt(game, next);
  if (!expectedAt) return IDLE_MAX_MIN;
  return Math.min(Math.max(minutesBetween(now, expectedAt), IDLE_MIN_MIN), IDLE_MAX_MIN);
};

export const decideNextCheck = ({ now, game, state }: PolicyInput): RefreshDecision => {
  const phase = derivePhase(now, game, state);
  const resultsIn = (minutes: number): RefreshDecision => ({
    at: addMinutes(now, minutes),
    phase,
    fetchResults: true,
    fetchUpcoming: false,
  });
  const { draws, next, errorCount } = state;

  // 1. Previous error: backoff.
  if (errorCount > 0) {
    return resultsIn(ERROR_BACKOFF_MIN[Math.min(errorCount, ERROR_BACKOFF_MIN.length) - 1]);
  }
  // 2. No data at all, or no upcoming draw known: ask now for what is missing.
  if (next === null) {
    return { at: now, phase, fetchResults: draws.length === 0, fetchUpcoming: true };
  }
  // 3. Upcoming draw is stale: its definitive result is already in.
  if (draws.some((draw) => isDefinitive(draw) && draw.date >= next.date)) {
    return { at: now, phase, fetchResults: false, fetchUpcoming: true };
  }
  // 4. Provisional football jornada.
  const open = openFootballDraw(draws);
  if (open) return resultsIn(provisionalDelayMin(now, open));
  // 5. Awaiting result.
  if (phase === 'awaitingResult') {
    const expectedAt = expectedResultAt(game, next);
    const waited = expectedAt ? minutesBetween(expectedAt, now) : 0;
    return resultsIn(waited <= AWAIT_FAST_MIN ? POLL_MIN : AWAIT_SLOW_MIN);
  }
  // 6. Up to date.
  return resultsIn(idleDelayMin(now, game, next));
};
