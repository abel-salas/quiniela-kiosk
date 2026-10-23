import type { ResultGameId } from '../../domain/games';
import type { ResultsRepository, SelaeRepository } from '../../domain/repository';
import type { Clock } from '../clock';
import { mergeByDate } from '../source/merge';
import { RETRY_DELAYS_MS, sleep, withRetries, type Sleep } from '../source/retry';
import { resultsWindow } from '../source/window';
import type { EntryCache } from '../store/entry-cache';
import { RESULT_GAMES, withGame, type SnapshotStore } from '../store/snapshot';
import type { BoardSnapshot } from '../store/types';
import { isResultsDue, isUpcomingDue, REFRESH_ORDER, type RefreshItem, type StoredEntry } from './calendar';
import { createRequestQueue } from './queue';
import { toLocalStamp } from './time';

export interface SchedulerDeps {
  selae: SelaeRepository;
  clock: Clock;
  store: SnapshotStore;
  cache: EntryCache;
  retryDelaysMs?: readonly number[];
  wait?: Sleep;
}

export interface Scheduler {
  /** Loads every stored entry into the board (also after a `/cms` save in another tab). */
  hydrate(): void;
  /** Walks `REFRESH_ORDER` once, fetching only the items that are due. */
  runCycle(): Promise<void>;
  stop(): void;
}

const withSavedAt = (snapshot: BoardSnapshot, entry: StoredEntry): BoardSnapshot => {
  const stamp = toLocalStamp(new Date(entry.savedAt));
  const latest = snapshot.lastUpdatedAt && snapshot.lastUpdatedAt > stamp ? snapshot.lastUpdatedAt : stamp;
  return latest === snapshot.lastUpdatedAt ? snapshot : { ...snapshot, lastUpdatedAt: latest };
};

export const createScheduler = (deps: SchedulerDeps): Scheduler => {
  const { clock, store, cache } = deps;
  const queue = createRequestQueue();
  let active = true;
  let cycle: Promise<void> | null = null;
  const results: ResultsRepository = {
    getRecentDraws: (...args) => queue.run(() => deps.selae.getRecentDraws(...args)),
  };

  /** Reads the stored entry (localStorage may have changed) and shows it; returns whether it is due. */
  const syncItem = (item: RefreshItem, now: Date): boolean => {
    if (item === 'upcoming') {
      const entry = cache.readUpcoming(now);
      if (entry) store.update((snapshot) => withSavedAt({ ...snapshot, upcoming: entry.upcoming }, entry));
      return isUpcomingDue(entry, now);
    }
    const entry = cache.readResults(item, now);
    if (entry) store.update((snapshot) => withSavedAt(withGame(snapshot, item, { draws: entry.draws }), entry));
    return isResultsDue(item, entry, now);
  };

  const fetchResults = async (gameId: ResultGameId): Promise<void> => {
    const window = resultsWindow(clock.now(), gameId);
    const incoming = await results.getRecentDraws(gameId, window.from, window.to);
    const current = store.get().results[gameId].draws;
    const draws = mergeByDate(current, incoming, 'selae').filter((draw) => draw.date >= window.from);
    const entry = cache.writeResults(gameId, draws, clock.now());
    store.update((snapshot) => withSavedAt(withGame(snapshot, gameId, { draws }), entry));
  };

  const fetchUpcoming = async (): Promise<void> => {
    const upcoming = await queue.run(() => deps.selae.getUpcoming());
    const entry = cache.writeUpcoming(upcoming, clock.now());
    store.update((snapshot) => withSavedAt({ ...snapshot, upcoming }, entry));
  };

  const fetchItem = (item: RefreshItem): Promise<void> =>
    item === 'upcoming' ? fetchUpcoming() : fetchResults(item);

  const walk = async (): Promise<void> => {
    for (const item of REFRESH_ORDER) {
      if (!active) return;
      if (!syncItem(item, clock.now())) continue;
      try {
        await withRetries(() => fetchItem(item), deps.retryDelaysMs ?? RETRY_DELAYS_MS, deps.wait ?? sleep);
      } catch (error) {
        // Two failed attempts: keep the stored value and move on to the next item.
        console.warn(`Skipping ${item} until the next cycle:`, error);
      }
    }
  };

  return {
    hydrate() {
      const now = clock.now();
      RESULT_GAMES.forEach((gameId) => syncItem(gameId, now));
      syncItem('upcoming', now);
    },
    runCycle() {
      cycle ??= walk().finally(() => {
        cycle = null;
      });
      return cycle;
    },
    stop() {
      active = false;
    },
  };
};
