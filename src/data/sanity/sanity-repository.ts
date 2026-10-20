import { ProviderError, type ManualRepository } from '../../domain/repository';
import type { SanityFetcher, SanityQueryParams } from './client';
import { mapSanityDraws } from './mappers/draws';
import { mapForcedGames, mapSlides } from './mappers/settings';
import { toDateBound } from './parse';
import { DRAWS_QUERY, FORCED_GAMES_QUERY, SLIDES_QUERY } from './queries';

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const createSanityRepository = (client: SanityFetcher): ManualRepository => {
  const query = async (groq: string, params?: SanityQueryParams): Promise<unknown> => {
    try {
      return await client.fetch(groq, params);
    } catch (error) {
      throw new ProviderError('network', `Sanity request failed: ${errorMessage(error)}`);
    }
  };

  return {
    async getRecentDraws(gameId, from, to) {
      const fromDate = toDateBound(from);
      const toDate = toDateBound(to);
      if (!fromDate || !toDate || fromDate > toDate) return [];
      const raw = await query(DRAWS_QUERY, { game: gameId, from: fromDate, to: toDate });
      return mapSanityDraws(raw, gameId);
    },

    async getForcedGames() {
      return mapForcedGames(await query(FORCED_GAMES_QUERY));
    },

    async getSlides() {
      return mapSlides(await query(SLIDES_QUERY));
    },
  };
};
