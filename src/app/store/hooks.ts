import { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { systemClock, type Clock } from '../clock';
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
