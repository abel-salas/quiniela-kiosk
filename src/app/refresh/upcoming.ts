import type { SelaeRepository } from '../../domain/repository';
import type { Clock } from '../clock';
import { RESULT_GAMES, withGame, type SnapshotStore } from '../store/snapshot';
import type { BoardSnapshot } from '../store/types';
import { pickNext } from './next-pick';
import { addMinutes, parseLocalIso } from './time';

export const UPCOMING_IDLE_MIN = 6 * 60;
export const UPCOMING_COOLDOWN_MS = 60_000;

export interface UpcomingDeps {
  selae: Pick<SelaeRepository, 'getUpcoming'>;
  clock: Clock;
  store: SnapshotStore;
  onUpdated: () => void;
}

export interface UpcomingRefresher {
  /** Coalesces concurrent calls and ignores calls within the cooldown after a success. */
  refresh(): Promise<void>;
  start(): void;
  stop(): void;
}

export const toLocalStamp = (date: Date): string => {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const applyUpcoming = (snapshot: BoardSnapshot, upcoming: BoardSnapshot['upcoming'], now: Date): BoardSnapshot =>
  RESULT_GAMES.reduce<BoardSnapshot>(
    (next, gameId) => {
      const game = next.results[gameId];
      return withGame(next, gameId, { next: pickNext(upcoming, gameId, game.next, game.draws, now) });
    },
    { ...snapshot, upcoming, lastUpdatedAt: toLocalStamp(now) },
  );

/** Next upcoming refresh: the earliest future `salesCloseAt`, at most 6 h ahead. */
const nextRefreshDelayMs = (snapshot: BoardSnapshot, now: Date): number => {
  const idle = addMinutes(now, UPCOMING_IDLE_MIN);
  const closes = snapshot.upcoming
    .map((draw) => (draw.salesCloseAt ? parseLocalIso(draw.salesCloseAt) : null))
    .filter((close): close is Date => close !== null && close > now && close < idle);
  const target = closes.reduce((min, close) => (close < min ? close : min), idle);
  return target.getTime() - now.getTime();
};

export const createUpcomingRefresher = (deps: UpcomingDeps): UpcomingRefresher => {
  let inFlight: Promise<void> | null = null;
  let lastSuccessMs = Number.NEGATIVE_INFINITY;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let running = false;

  const schedule = (): void => {
    if (!running) return;
    if (timer !== null) clearTimeout(timer);
    const delay = nextRefreshDelayMs(deps.store.get(), deps.clock.now());
    timer = setTimeout(() => {
      void refresh().finally(schedule);
    }, delay);
  };

  const load = async (): Promise<void> => {
    try {
      const upcoming = await deps.selae.getUpcoming();
      lastSuccessMs = Date.now();
      deps.store.update((snapshot) => applyUpcoming(snapshot, upcoming, deps.clock.now()));
      schedule();
      deps.onUpdated();
    } catch {
      // Upcoming draws only come from SELAE: keep the last value in memory.
    } finally {
      inFlight = null;
    }
  };

  const refresh = (): Promise<void> => {
    if (inFlight) return inFlight;
    if (Date.now() - lastSuccessMs < UPCOMING_COOLDOWN_MS) return Promise.resolve();
    inFlight = load();
    return inFlight;
  };

  return {
    refresh,
    start: () => {
      running = true;
      schedule();
    },
    stop: () => {
      running = false;
      if (timer !== null) clearTimeout(timer);
      timer = null;
    },
  };
};
