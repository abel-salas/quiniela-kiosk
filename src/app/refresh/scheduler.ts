import { GAMES, type ResultGameId } from '../../domain/games';
import type { ManualRepository, SelaeRepository } from '../../domain/repository';
import type { Clock } from '../clock';
import { resolveDraws, resolveForcedGames } from '../source/resolve-draws';
import { resultsWindow } from '../source/window';
import { RESULT_GAMES, withGame, type SnapshotStore } from '../store/snapshot';
import { decideNextCheck } from './policy';
import { createRequestQueue } from './queue';
import { createUpcomingRefresher, toLocalStamp } from './upcoming';

export type SourceMode = 'auto' | 'manualOnly';

/** Minimum wait between two rounds of the same game, so "check now" decisions never loop. */
export const MIN_REPEAT_MS = 60_000;

export interface SchedulerDeps {
  selae: SelaeRepository;
  manual: ManualRepository;
  clock: Clock;
  store: SnapshotStore;
  sourceMode: SourceMode;
  retryDelaysMs?: readonly number[];
}

export interface Scheduler {
  start(): Promise<void>;
  stop(): void;
  replanAll(): void;
  refreshForced(): Promise<void>;
}

export const createScheduler = (deps: SchedulerDeps): Scheduler => {
  const { clock, store, manual } = deps;
  const queue = createRequestQueue();
  const selae: SelaeRepository = {
    getRecentDraws: (...args) => queue.run(() => deps.selae.getRecentDraws(...args)),
    getUpcoming: () => queue.run(() => deps.selae.getUpcoming()),
  };
  const timers = new Map<ResultGameId, { at: number; timer: ReturnType<typeof setTimeout> }>();
  const running = new Set<ResultGameId>();
  let active = false;

  const decide = (gameId: ResultGameId, now: Date) =>
    decideNextCheck({ now, game: GAMES[gameId], state: store.get().results[gameId] });

  /**
   * Schedules the next round of a game. A replan (`afterRound: false`) may only bring an existing
   * round forward: rules relative to "now" would otherwise postpone it forever.
   */
  const plan = (gameId: ResultGameId, afterRound = false): void => {
    if (!active) return;
    const now = clock.now();
    const decision = decide(gameId, now);
    if (decision.phase !== store.get().results[gameId].phase) {
      store.update((snapshot) => withGame(snapshot, gameId, { phase: decision.phase }));
    }
    const at = Math.max(decision.at.getTime(), afterRound ? now.getTime() + MIN_REPEAT_MS : 0);
    const planned = timers.get(gameId);
    if (planned && !afterRound && planned.at <= at) return;
    if (planned) clearTimeout(planned.timer);
    timers.set(gameId, { at, timer: setTimeout(() => void runRound(gameId), Math.max(at - now.getTime(), 0)) });
  };

  const hasResultFor = (gameId: ResultGameId): boolean => {
    const { draws, next } = store.get().results[gameId];
    return next !== null && draws.some((d) => d.date >= next.date && (d.kind === 'numbers' || d.status === 'final'));
  };

  /** Returns true when the definitive result of `next` arrives in this round. */
  const refreshResults = async (gameId: ResultGameId, now: Date): Promise<boolean> => {
    const hadResult = hasResultFor(gameId);
    const snapshot = store.get();
    const window = resultsWindow(now);
    const forced = deps.sourceMode === 'manualOnly' || snapshot.forcedGames.includes(gameId);
    const result = await resolveDraws(
      { selae, manual, retryDelaysMs: deps.retryDelaysMs },
      { gameId, window, forced, current: snapshot.results[gameId].draws },
    );
    const draws = result.draws.filter((draw) => draw.date >= window.from);
    store.update((current) => {
      const game = current.results[gameId];
      const updated = withGame(current, gameId, {
        draws,
        errorCount: result.selaeError ? game.errorCount + 1 : 0,
        lastErrorKind: result.selaeError,
      });
      return result.selaeError ? updated : { ...updated, lastUpdatedAt: toLocalStamp(clock.now()) };
    });
    return !hadResult && hasResultFor(gameId);
  };

  const runRound = async (gameId: ResultGameId, force = false): Promise<void> => {
    if (!active || running.has(gameId)) return;
    timers.delete(gameId);
    const decision = decide(gameId, clock.now());
    running.add(gameId);
    try {
      const fetchResults = decision.fetchResults || force;
      const resultArrived = fetchResults ? await refreshResults(gameId, clock.now()) : false;
      if (decision.fetchUpcoming || resultArrived) await upcoming.refresh();
    } finally {
      running.delete(gameId);
    }
    plan(gameId, true);
  };

  const replanAll = (): void => RESULT_GAMES.forEach((gameId) => plan(gameId));
  const upcoming = createUpcomingRefresher({ selae, clock, store, onUpdated: replanAll });

  const refreshForced = async (): Promise<void> => {
    const previous = store.get().forcedGames;
    const forcedGames = await resolveForcedGames(manual, previous);
    const changed = RESULT_GAMES.filter((id) => previous.includes(id) !== forcedGames.includes(id));
    if (changed.length === 0) return;
    store.update((snapshot) => ({ ...snapshot, forcedGames }));
    if (deps.sourceMode === 'auto') changed.forEach((gameId) => void runRound(gameId, true));
  };

  return {
    async start() {
      active = true;
      await refreshForced();
      upcoming.start();
      replanAll();
    },
    stop() {
      active = false;
      timers.forEach(({ timer }) => clearTimeout(timer));
      timers.clear();
      upcoming.stop();
    },
    replanAll,
    refreshForced,
  };
};
