import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { systemClock, type Clock } from '../clock';
import { selectBoardView } from '../selectors/results';
import { selectUpcomingTiles } from '../selectors/upcoming';
import type { BoardView, UpcomingTileView } from '../selectors/types';
import type { BoardStore } from './board-store';
import type { BoardSnapshot } from './types';

export const BoardStoreContext = createContext<BoardStore | null>(null);
export const ClockContext = createContext<Clock>(systemClock);

export const useBoard = (): BoardSnapshot => {
  const store = useContext(BoardStoreContext);
  if (!store) throw new Error('useBoard requires a BoardStoreContext provider');
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
};

/** Current time from the app clock, refreshed every `intervalMs` (countdowns). */
export const useNow = (intervalMs = 60_000): Date => {
  const clock = useContext(ClockContext);
  const [now, setNow] = useState(() => clock.now());

  useEffect(() => {
    setNow(clock.now());
    const timer = setInterval(() => setNow(clock.now()), intervalMs);
    return () => clearInterval(timer);
  }, [clock, intervalMs]);

  return now;
};

export const COUNTDOWN_INTERVAL_MS = 60_000;

/** Board cards and status bar; recomputed only when the snapshot changes. */
export const useBoardView = (): BoardView => {
  const snapshot = useBoard();
  const clock = useContext(ClockContext);
  return useMemo(() => selectBoardView(snapshot, clock.now()), [snapshot, clock]);
};

/** Upcoming column tiles; countdowns refresh every minute. */
export const useUpcomingTiles = (): UpcomingTileView[] => {
  const { upcoming } = useBoard();
  const now = useNow(COUNTDOWN_INTERVAL_MS);
  return useMemo(() => selectUpcomingTiles(upcoming, now), [upcoming, now]);
};
