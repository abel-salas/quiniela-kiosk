import type { ManualRepository, SelaeRepository } from '../../domain/repository';
import type { Clock } from '../clock';
import { DAILY_RELOAD_AT } from '../config';
import { browserWakeEvents, startLifecycle, type WakeEvents } from '../refresh/lifecycle';
import { createScheduler, type SourceMode } from '../refresh/scheduler';
import { browserStorage, clearLegacyCache, type LegacyStorage } from './legacy-cache';
import { createSnapshotStore } from './snapshot';
import type { BoardSnapshot } from './types';

export interface BoardStoreDeps {
  selae: SelaeRepository;
  manual: ManualRepository;
  clock: Clock;
  /** `/quini`: results always from Sanity, upcoming draws still from SELAE. */
  sourceMode?: SourceMode;
  reloadAt?: string;
  reload?: () => void;
  events?: WakeEvents;
  storage?: LegacyStorage | null;
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
  const scheduler = createScheduler({
    selae: deps.selae,
    manual: deps.manual,
    clock: deps.clock,
    store,
    sourceMode: deps.sourceMode ?? 'auto',
    retryDelaysMs: deps.retryDelaysMs,
  });
  let stopLifecycle: (() => void) | null = null;

  return {
    getSnapshot: store.get,
    subscribe: store.subscribe,
    start() {
      if (stopLifecycle) return;
      clearLegacyCache(deps.storage === undefined ? browserStorage() : deps.storage);
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
