import type { Draw } from '../../domain/draw';
import type { ResultGameId } from '../../domain/games';
import type { NextDraw } from '../../domain/next-draw';
import { toLocalDateKey } from './time';

/** How long a past draw whose result never arrived keeps being tracked. */
export const PENDING_RESULT_DAYS = 2;

const hasDefinitiveResult = (draws: Draw[], date: string): boolean =>
  draws.some((draw) => draw.date >= date && (draw.kind === 'numbers' || draw.status === 'final'));

/**
 * `GameState.next` = first upcoming element of the game. Exception: while the result of the
 * previous `next` is still pending (and recent), keep it so the policy keeps looking for it.
 */
export const pickNext = (
  upcoming: NextDraw[],
  gameId: ResultGameId,
  previous: NextDraw | null,
  draws: Draw[],
  now: Date,
): NextDraw | null => {
  const candidate = upcoming.find((draw) => draw.gameId === gameId) ?? null;
  if (!candidate) return previous;
  if (!previous || candidate.date <= previous.date) return candidate;

  const pending = !hasDefinitiveResult(draws, previous.date);
  const recent = previous.date >= toLocalDateKey(now, -PENDING_RESULT_DAYS);
  return pending && recent ? previous : candidate;
};
