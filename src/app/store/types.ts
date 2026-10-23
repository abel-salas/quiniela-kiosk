import type { Draw } from '../../domain/draw';
import type { ResultGameId } from '../../domain/games';
import type { NextDraw } from '../../domain/next-draw';

export interface GameState {
  /** Ascending by date, as stored for the game (one or two weeks). */
  draws: Draw[];
}

export interface BoardSnapshot {
  results: Record<ResultGameId, GameState>;
  /** API order. */
  upcoming: NextDraw[];
  lastUpdatedAt: string | null;
}
