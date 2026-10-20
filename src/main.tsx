import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { createClock } from './app/clock';
import { readConfig } from './app/config';
import { createSlideStore } from './app/slides/slide-store';
import { createBoardStore } from './app/store/board-store';
import { createSanityClient } from './data/sanity/client';
import { createSanityFixtureRepository } from './data/sanity/fixture-repository';
import { createSanityRepository } from './data/sanity/sanity-repository';
import { createSelaeFixtureRepository } from './data/selae/fixture-repository';
import { createSelaeRepository } from './data/selae/selae-repository';
import type { ManualRepository } from './domain/repository';

const config = readConfig(window.location.search, import.meta.env);
const path = window.location.pathname;
const isQuini = path.startsWith('/quini');
const isBoard = path === '/' || isQuini;
const isSlide = path.startsWith('/slide');
const clock = createClock(config);

/** Without Sanity configuration there is no manual backup: empty results, no forced games, no slides. */
const noManualData: ManualRepository = {
  getRecentDraws: async () => [],
  getForcedGames: async () => [],
  getSlides: async () => [],
};

const createManual = (): ManualRepository => {
  if (config.mock) return createSanityFixtureRepository();
  if (!config.sanity) {
    if (isBoard || isSlide) console.warn('VITE_SANITY_PROJECT_ID is not set: running without the Sanity backup');
    return noManualData;
  }
  return createSanityRepository(createSanityClient(config.sanity));
};

const manual = createManual();
const store = createBoardStore({
  selae: config.mock ? createSelaeFixtureRepository() : createSelaeRepository(),
  manual,
  clock,
  sourceMode: isQuini ? 'manualOnly' : 'auto',
  reloadAt: config.reloadAt,
});
const slides = createSlideStore(manual, {
  dailyReload: { clock, at: config.reloadAt, reload: () => window.location.reload() },
});
if (isBoard) store.start();
if (isSlide) slides.start();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App store={store} slides={slides} clock={clock} />
    </BrowserRouter>
  </React.StrictMode>,
);
