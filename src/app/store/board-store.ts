import type { SelaeRepository } from '../../domain/repository';
import type { Clock } from '../clock';
import { DAILY_RELOAD_AT } from '../config';
import { MORNING_REFRESH_AT } from '../refresh/calendar';
import { browserStorageEvents, startDaily, type StorageEvents } from '../refresh/lifecycle';
import { createScheduler } from '../refresh/scheduler';
import type { Sleep } from '../source/retry';
import { CACHE_PREFIX, createEntryCache, createMemoryStorage } from './entry-cache';
import { browserStorage, clearLegacyCache, type KioskStorage } from './legacy-cache';
import { createSnapshotStore } from './snapshot';
import type { BoardSnapshot } from './types';

export interface BoardStoreDeps {
  selae: SelaeRepository;
  clock: Clock;
  reloadAt?: string;
  reload?: () => void;
  events?: StorageEvents;
  storage?: KioskStorage | null;
  /** Read and write localStorage; otherwise every entry lives in memory (`?mock=1`). */
  persist?: boolean;
  retryDelaysMs?: readonly number[];
  wait?: Sleep;
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

/**
 * Board of `/`: shows the stored entries, runs a refresh cycle on start and every morning,
 * reloads the page daily and picks up entries saved from `/cms` in another tab.
 */
export const createBoardStore = (deps: BoardStoreDeps): BoardStore => {
  const store = createSnapshotStore();
  const storage = deps.storage === undefined ? browserStorage() : deps.storage;
  const persisted = deps.persist && storage ? storage : null;
  const scheduler = createScheduler({
    selae: deps.selae,
    clock: deps.clock,
    store,
    cache: createEntryCache(persisted ?? createMemoryStorage()),
    retryDelaysMs: deps.retryDelaysMs,
    wait: deps.wait,
  });
  let stops: (() => void)[] | null = null;

  return {
    getSnapshot: store.get,
    subscribe: store.subscribe,
    start() {
      if (stops) return;
      clearLegacyCache(storage);
      scheduler.hydrate();
      stops = [
        startDaily(deps.clock, MORNING_REFRESH_AT, () => void scheduler.runCycle()),
        startDaily(deps.clock, deps.reloadAt ?? DAILY_RELOAD_AT, deps.reload ?? reloadPage),
        (deps.events ?? browserStorageEvents).onChange((key) => {
          if (persisted && (key === null || key.startsWith(CACHE_PREFIX))) scheduler.hydrate();
        }),
      ];
      void scheduler.runCycle();
    },
    stop() {
      scheduler.stop();
      stops?.forEach((stop) => stop());
      stops = null;
    },
  };
};
