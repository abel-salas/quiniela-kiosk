import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { createCmsService } from './app/cms/cms';
import { createClock } from './app/clock';
import { readConfig } from './app/config';
import { createSlideStore } from './app/slides/slide-store';
import { createBoardStore } from './app/store/board-store';
import { createEntryCache, createMemoryStorage } from './app/store/entry-cache';
import { browserStorage } from './app/store/legacy-cache';
import { createSanityClient } from './data/sanity/client';
import { createSanityFixtureRepository } from './data/sanity/fixture-repository';
import { createSanityRepository } from './data/sanity/sanity-repository';
import { createSelaeFixtureRepository } from './data/selae/fixture-repository';
import { selaeImporter } from './data/selae/importer';
import { createSelaeRepository } from './data/selae/selae-repository';
import type { SlidesRepository } from './domain/repository';

const config = readConfig(window.location.search, import.meta.env);
const path = window.location.pathname;
const isBoard = path === '/';
const isSlide = path.startsWith('/slide');
const clock = createClock(config);

/** Without Sanity configuration `/slide` has no images. */
const noSlides: SlidesRepository = { getSlides: async () => [] };

const createSlides = (): SlidesRepository => {
  if (config.mock) return createSanityFixtureRepository();
  if (!config.sanity) {
    if (isSlide) console.warn('VITE_SANITY_PROJECT_ID is not set: /slide has no images');
    return noSlides;
  }
  return createSanityRepository(createSanityClient(config.sanity));
};

const store = createBoardStore({
  selae: config.mock ? createSelaeFixtureRepository() : createSelaeRepository(),
  clock,
  reloadAt: config.reloadAt,
  persist: !config.mock,
});
const slides = createSlideStore(createSlides(), {
  dailyReload: { clock, at: config.reloadAt, reload: () => window.location.reload() },
});
const cms = createCmsService({
  importer: selaeImporter,
  cache: createEntryCache((config.mock ? null : browserStorage()) ?? createMemoryStorage()),
  clock,
});
if (isBoard) store.start();
if (isSlide) slides.start();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App store={store} slides={slides} cms={cms} clock={clock} />
    </BrowserRouter>
  </React.StrictMode>,
);
