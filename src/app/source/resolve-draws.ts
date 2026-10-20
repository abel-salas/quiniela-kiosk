import type { Draw } from '../../domain/draw';
import type { ResultGameId } from '../../domain/games';
import {
  ProviderError,
  type ManualRepository,
  type ProviderErrorKind,
  type ResultsRepository,
} from '../../domain/repository';
import { mergeByDate } from './merge';
import { RETRY_DELAYS_MS, sleep, withRetries, type Sleep } from './retry';
import type { DateWindow } from './window';

export interface SourceDeps {
  selae: ResultsRepository;
  manual?: ManualRepository; // Optional: only needed for forced mode (/quini route)
  retryDelaysMs?: readonly number[];
  wait?: Sleep;
}

export interface ResolveDrawsInput {
  gameId: ResultGameId;
  window: DateWindow;
  /** Forced from Sanity: read only Sanity, which wins on equal dates. */
  forced: boolean;
  current: Draw[];
}

export interface ResolveDrawsResult {
  draws: Draw[];
  /** Kind of the last SELAE error when every attempt failed; `null` if SELAE answered or was not called. */
  selaeError: ProviderErrorKind | null;
}

const errorKind = (error: unknown): ProviderErrorKind =>
  error instanceof ProviderError ? error.kind : 'network';

const readManual = async (deps: SourceDeps, input: ResolveDrawsInput): Promise<Draw[] | null> => {
  if (!deps.manual) return null;
  try {
    return await deps.manual.getRecentDraws(input.gameId, input.window.from, input.window.to);
  } catch {
    return null;
  }
};

/**
 * One round for one game: forced → Sanity only (for /quini route); otherwise SELAE with retries.
 * With the proxy, SELAE should always work, so no fallback to Sanity is needed.
 * Results are merged by date with what is already in memory.
 */
export const resolveDraws = async (deps: SourceDeps, input: ResolveDrawsInput): Promise<ResolveDrawsResult> => {
  const { gameId, window, forced, current } = input;

  if (forced) {
    const manual = await readManual(deps, input);
    return { draws: manual ? mergeByDate(current, manual, 'sanity') : current, selaeError: null };
  }

  try {
    const selae = await withRetries(
      () => deps.selae.getRecentDraws(gameId, window.from, window.to),
      deps.retryDelaysMs ?? RETRY_DELAYS_MS,
      deps.wait ?? sleep,
    );
    return { draws: mergeByDate(current, selae, 'selae'), selaeError: null };
  } catch (error) {
    // No fallback to Sanity: with the proxy, SELAE should work.
    // If it fails, we keep the current data and report the error.
    return { draws: current, selaeError: errorKind(error) };
  }
};

/** Reads the forced games; keeps the previous list if Sanity fails or manual repo is not provided. */
export const resolveForcedGames = async (
  manual: ManualRepository | undefined,
  previous: ResultGameId[],
): Promise<ResultGameId[]> => {
  if (!manual) return previous;
  try {
    return await manual.getForcedGames();
  } catch {
    return previous;
  }
};
