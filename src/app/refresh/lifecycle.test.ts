import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { systemClock } from '../clock';
import { msUntilLocalTime, startLifecycle, type WakeEvents } from './lifecycle';

const fakeEvents = () => {
  const listeners = new Set<() => void>();
  const events: WakeEvents = {
    onWake: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  return { events, wake: () => listeners.forEach((listener) => listener()), listeners };
};

describe('msUntilLocalTime', () => {
  it('returns the time to the next occurrence of HH:mm', () => {
    expect(msUntilLocalTime(new Date(2026, 9, 14, 22, 0), '05:00')).toBe(7 * 3_600_000);
    expect(msUntilLocalTime(new Date(2026, 9, 14, 4, 0), '05:00')).toBe(3_600_000);
    expect(msUntilLocalTime(new Date(2026, 9, 14, 5, 0), '05:00')).toBe(24 * 3_600_000);
  });
});

describe('startLifecycle', () => {
  beforeEach(() => vi.useFakeTimers({ now: new Date(2026, 9, 14, 22, 0) }));
  afterEach(() => vi.useRealTimers());

  it('reloads daily at reloadAt, replans at 00:05 and on wake, polls forced games every 60 s', () => {
    const reload = vi.fn();
    const onReplan = vi.fn();
    const onForcedTick = vi.fn();
    const { events, wake, listeners } = fakeEvents();
    const stop = startLifecycle({ clock: systemClock, reloadAt: '05:00', reload, events, onReplan, onForcedTick });

    vi.advanceTimersByTime(60_000);
    expect(onForcedTick).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(2 * 3_600_000);
    expect(onReplan).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(5 * 60_000);
    expect(onReplan).toHaveBeenCalledTimes(1);
    expect(reload).not.toHaveBeenCalled();
    vi.advanceTimersByTime(5 * 3_600_000);
    expect(reload).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(24 * 3_600_000);
    expect(reload).toHaveBeenCalledTimes(2);

    wake();
    expect(onReplan).toHaveBeenCalledTimes(3);

    stop();
    expect(listeners.size).toBe(0);
    vi.advanceTimersByTime(48 * 3_600_000);
    expect(reload).toHaveBeenCalledTimes(2);
  });
});
