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
  manual: ManualRepository;
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
  try {
    return await deps.manual.getRecentDraws(input.gameId, input.window.from, input.window.to);
  } catch {
    return null;
  }
};

/**
 * One round for one game: forced → Sanity only; otherwise SELAE with retries and, if every
 * attempt fails, Sanity. Results are merged by date with what is already in memory.
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
    const manual = await readManual(deps, input);
    return { draws: manual ? mergeByDate(current, manual, 'selae') : current, selaeError: errorKind(error) };
  }
};

/** Reads the forced games; keeps the previous list if Sanity fails. */
export const resolveForcedGames = async (
  manual: ManualRepository,
  previous: ResultGameId[],
): Promise<ResultGameId[]> => {
  try {
    return await manual.getForcedGames();
  } catch {
    return previous;
  }
};
