import type { ManualRepository, SelaeRepository } from '../../domain/repository';
import type { Clock } from '../clock';
import { DAILY_RELOAD_AT } from '../config';
import { browserWakeEvents, startLifecycle, type WakeEvents } from '../refresh/lifecycle';
import { createScheduler, type SourceMode } from '../refresh/scheduler';
import { browserStorage, clearLegacyCache, type KioskStorage } from './legacy-cache';
import { loadBoardCache, saveBoardCache } from './board-cache';
import { createSnapshotStore, RESULT_GAMES, withGame, type SnapshotStore } from './snapshot';
import type { BoardSnapshot } from './types';

export interface BoardStoreDeps {
  selae: SelaeRepository;
  manual?: ManualRepository; // Optional: only needed for forced mode (/quini route)
  clock: Clock;
  /** `/quini`: results always from Sanity, upcoming draws still from SELAE. */
  sourceMode?: SourceMode;
  reloadAt?: string;
  reload?: () => void;
  events?: WakeEvents;
  storage?: KioskStorage | null;
  persist?: boolean;
  retryDelaysMs?: readonly number[];
}

export interface BoardStore {
  getSnapshot(): BoardSnapshot;
  subscribe(listener: () => void): () => void;
  start(): void;
  stop(): void;
}

const reloadPage = (): void => {
  if (typeof location !== 'undefined') location.reload();
};

export const createBoardStore = (deps: BoardStoreDeps): BoardStore => {
  const store = createSnapshotStore();
  const storage = deps.storage === undefined ? browserStorage() : deps.storage;
  let hydrating = false;
  const snapshotStore: SnapshotStore = {
    get: store.get,
    subscribe: store.subscribe,
    update(change) {
      store.update(change);
      if (deps.persist && !hydrating && storage) saveBoardCache(storage, store.get(), deps.clock.now());
    },
  };
  const scheduler = createScheduler({
    selae: deps.selae,
    manual: deps.manual,
    clock: deps.clock,
    store: snapshotStore,
    sourceMode: deps.sourceMode ?? 'auto',
    retryDelaysMs: deps.retryDelaysMs,
  });
  let stopLifecycle: (() => void) | null = null;

  return {
    getSnapshot: store.get,
    subscribe: store.subscribe,
    start() {
      if (stopLifecycle) return;
      clearLegacyCache(storage);
      if (deps.persist && storage) {
        const cache = loadBoardCache(storage, deps.clock.now());
        if (cache) {
          hydrating = true;
          store.update((snapshot) => RESULT_GAMES.reduce(
            (hydrated, gameId) => withGame(hydrated, gameId, cache.results[gameId]),
            { ...snapshot, upcoming: cache.upcoming, lastUpdatedAt: cache.lastUpdatedAt },
          ));
          hydrating = false;
        }
      }
      stopLifecycle = startLifecycle({
        clock: deps.clock,
        reloadAt: deps.reloadAt ?? DAILY_RELOAD_AT,
        reload: deps.reload ?? reloadPage,
        events: deps.events ?? browserWakeEvents,
        onReplan: scheduler.replanAll,
        onForcedTick: () => void scheduler.refreshForced(),
      });
      void scheduler.start();
    },
    stop() {
      scheduler.stop();
      stopLifecycle?.();
      stopLifecycle = null;
    },
  };
};
