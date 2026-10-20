import type { ManualRepository } from '../../domain/repository';
import draws from './__fixtures__/draws.json';
import kioskSettings from './__fixtures__/kiosk-settings.json';
import slides from './__fixtures__/slides.json';
import { mapSanityDraws } from './mappers/draws';
import { mapForcedGames, mapSlides } from './mappers/settings';
import { toDateBound } from './parse';

export const createSanityFixtureRepository = (): ManualRepository => ({
  async getRecentDraws(gameId, from, to) {
    const fromDate = toDateBound(from);
    const toDate = toDateBound(to);
    if (!fromDate || !toDate || fromDate > toDate) return [];
    return mapSanityDraws(draws, gameId).filter((draw) => draw.date >= fromDate && draw.date <= toDate);
  },

  async getForcedGames() {
    return mapForcedGames(kioskSettings.forcedGames);
  },

  async getSlides() {
    return mapSlides(slides);
  },
});
