import type { Draw } from '../../domain/draw';
import type { ResultGameId } from '../../domain/games';
import type { NextDraw } from '../../domain/next-draw';
import type { ProviderErrorKind } from '../../domain/repository';

export type DrawPhase = 'upToDate' | 'awaitingResult' | 'provisional';

export interface GameState {
  /** Ascending by date, current week only. */
  draws: Draw[];
  next: NextDraw | null;
  phase: DrawPhase;
  lastErrorKind: ProviderErrorKind | null;
  /** Consecutive failed rounds against SELAE. */
  errorCount: number;
}

export interface BoardSnapshot {
  results: Record<ResultGameId, GameState>;
  /** API order. */
  upcoming: NextDraw[];
  forcedGames: ResultGameId[];
  lastUpdatedAt: string | null;
}
