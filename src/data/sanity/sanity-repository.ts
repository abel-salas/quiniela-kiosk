import { ProviderError, type SlidesRepository } from '../../domain/repository';
import type { SanityFetcher } from './client';
import { mapSlides } from './mappers/settings';
import { SLIDES_QUERY } from './queries';

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const createSanityRepository = (client: SanityFetcher): SlidesRepository => ({
  async getSlides() {
    try {
      return mapSlides(await client.fetch(SLIDES_QUERY));
    } catch (error) {
      throw new ProviderError('network', `Sanity request failed: ${errorMessage(error)}`);
    }
  },
});
