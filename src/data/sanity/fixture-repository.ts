import type { SlidesRepository } from '../../domain/repository';
import slides from './__fixtures__/slides.json';
import { mapSlides } from './mappers/settings';

export const createSanityFixtureRepository = (): SlidesRepository => ({
  async getSlides() {
    return mapSlides(slides);
  },
});
