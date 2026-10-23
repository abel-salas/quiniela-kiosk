import type { Clock } from '../clock';
import { atLocalTime, toLocalDateKey } from './time';

/** Milliseconds from `now` to the next occurrence (strictly later) of the local time 'HH:mm'. */
export const msUntilLocalTime = (now: Date, time: string): number => {
  const today = atLocalTime(toLocalDateKey(now), time);
  if (!today) throw new RangeError(`Invalid time ${time}`);
  const target = today > now ? today : atLocalTime(toLocalDateKey(now, 1), time);
  return (target ?? today).getTime() - now.getTime();
};

/** Daily timers fire this late so the target time has surely passed on the app clock. */
export const DAILY_MARGIN_MS = 1_000;

export interface StorageEvents {
  /** Calls `listener` with the key of every localStorage change made by another tab. Returns an unsubscribe. */
  onChange(listener: (key: string | null) => void): () => void;
}

export const browserStorageEvents: StorageEvents = {
  onChange: (listener) => {
    if (typeof window === 'undefined') return () => undefined;
    const onStorage = (event: StorageEvent) => listener(event.key);
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  },
};

/** Runs `action` every day at the local time 'HH:mm' of the app clock. Returns stop. */
export const startDaily = (clock: Clock, time: string, action: () => void): (() => void) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const schedule = (): void => {
    timer = setTimeout(() => {
      action();
      schedule();
    }, msUntilLocalTime(clock.now(), time) + DAILY_MARGIN_MS);
  };
  schedule();
  return () => {
    if (timer !== null) clearTimeout(timer);
  };
};
