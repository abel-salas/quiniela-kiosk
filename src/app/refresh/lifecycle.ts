import type { Clock } from '../clock';
import { atLocalTime, toLocalDateKey } from './time';

/** Milliseconds from `now` to the next occurrence (strictly later) of the local time 'HH:mm'. */
export const msUntilLocalTime = (now: Date, time: string): number => {
  const today = atLocalTime(toLocalDateKey(now), time);
  if (!today) throw new RangeError(`Invalid time ${time}`);
  const target = today > now ? today : atLocalTime(toLocalDateKey(now, 1), time);
  return (target ?? today).getTime() - now.getTime();
};

export interface WakeEvents {
  /** Calls `listener` on `online` and when the page becomes visible. Returns an unsubscribe. */
  onWake(listener: () => void): () => void;
}

export const browserWakeEvents: WakeEvents = {
  onWake: (listener) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return () => undefined;
    const onVisibility = () => {
      if (document.visibilityState === 'visible') listener();
    };
    window.addEventListener('online', listener);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('online', listener);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  },
};

export interface LifecycleDeps {
  clock: Clock;
  reloadAt: string;
  reload: () => void;
  events: WakeEvents;
  onReplan: () => void;
  onForcedTick: () => void;
}

export const DAY_CHANGE_AT = '00:05';
export const FORCED_GAMES_INTERVAL_MS = 60_000;

/** Runs `action` every day at the local time 'HH:mm' of the app clock. Returns stop. */
export const startDaily = (clock: Clock, time: string, action: () => void): (() => void) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const schedule = (): void => {
    timer = setTimeout(() => {
      action();
      schedule();
    }, msUntilLocalTime(clock.now(), time));
  };
  schedule();
  return () => {
    if (timer !== null) clearTimeout(timer);
  };
};

/** Day-change replan (00:05), daily reload, forced-games polling and wake events. Returns stop. */
export const startLifecycle = (deps: LifecycleDeps): (() => void) => {
  const stopDayChange = startDaily(deps.clock, DAY_CHANGE_AT, deps.onReplan);
  const stopReload = startDaily(deps.clock, deps.reloadAt, deps.reload);
  const forced = setInterval(deps.onForcedTick, FORCED_GAMES_INTERVAL_MS);
  const stopWake = deps.events.onWake(deps.onReplan);

  return () => {
    stopDayChange();
    stopReload();
    clearInterval(forced);
    stopWake();
  };
};
