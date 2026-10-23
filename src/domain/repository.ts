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

/** Sanity: only the promotional images of `/slide`. */
export interface SlidesRepository {
  getSlides(): Promise<Slide[]>;
}

/** Manual load from `/cms`: provider URL to open in the browser and parser for the JSON it returns. */
export interface ResultsImporter {
  resultsUrl(gameId: ResultGameId, from: string, to: string): string;
  parseResults(gameId: ResultGameId, raw: unknown): Draw[];
}
