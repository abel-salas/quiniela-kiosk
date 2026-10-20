import type { SelaeRepository } from '../../domain/repository';
import { fetchJson } from '../http/fetch-json';
import { mapUpcoming } from './mappers/next-draw';
import { mapResults } from './mappers/results';
import { nextDrawUrl, resultsUrl } from './endpoints';

export const createSelaeRepository = (fetcher: typeof fetch = globalThis.fetch): SelaeRepository => ({
  async getRecentDraws(gameId, from, to) {
    const raw = await fetchJson(resultsUrl(gameId, from, to), { fetcher });
    return mapResults(raw, gameId);
  },

  async getUpcoming() {
    const raw = await fetchJson(nextDrawUrl(), { fetcher });
    return mapUpcoming(raw);
  },
});
