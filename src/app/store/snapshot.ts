import { RESULT_COLUMNS, type ResultGameId } from '../../domain/games';
import type { BoardSnapshot, GameState } from './types';

export const RESULT_GAMES: readonly ResultGameId[] = [...RESULT_COLUMNS.numbers, ...RESULT_COLUMNS.football];

const emptyGame = (): GameState => ({
  draws: [],
  next: null,
  phase: 'upToDate',
  lastErrorKind: null,
  errorCount: 0,
});

export const createInitialSnapshot = (): BoardSnapshot => ({
  results: {
    BONO: emptyGame(),
    EDMS: emptyGame(),
    ELGR: emptyGame(),
    LAPR: emptyGame(),
    EMIL: emptyGame(),
    LAQU: emptyGame(),
    QGOL: emptyGame(),
  },
  upcoming: [],
  forcedGames: [],
  lastUpdatedAt: null,
});

export const withGame = (
  snapshot: BoardSnapshot,
  gameId: ResultGameId,
  patch: Partial<GameState>,
): BoardSnapshot => ({
  ...snapshot,
  results: { ...snapshot.results, [gameId]: { ...snapshot.results[gameId], ...patch } },
});

export interface SnapshotStore {
  get(): BoardSnapshot;
  update(change: (snapshot: BoardSnapshot) => BoardSnapshot): void;
  subscribe(listener: () => void): () => void;
}

/** Holds an immutable snapshot: every update creates a new object and notifies listeners. */
export const createSnapshotStore = (initial = createInitialSnapshot()): SnapshotStore => {
  let snapshot = initial;
  const listeners = new Set<() => void>();

  return {
    get: () => snapshot,
    update: (change) => {
      const next = change(snapshot);
      if (next === snapshot) return;
      snapshot = next;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};
