import type { Draw } from './draw';
import type { NextDraw } from './next-draw';
import type { Slide } from './slide';
import type { ResultGameId } from './games';

export type ProviderErrorKind = 'blocked' | 'network' | 'timeout' | 'invalid';

export class ProviderError extends Error {
  constructor(
    public kind: ProviderErrorKind,
    message: string,
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

export interface ResultsRepository {
  getRecentDraws(gameId: ResultGameId, from: string, to: string): Promise<Draw[]>;
}

export interface SelaeRepository extends ResultsRepository {
  getUpcoming(): Promise<NextDraw[]>;
}

export interface ManualRepository extends ResultsRepository {
  getForcedGames(): Promise<ResultGameId[]>;
  getSlides(): Promise<Slide[]>;
}
