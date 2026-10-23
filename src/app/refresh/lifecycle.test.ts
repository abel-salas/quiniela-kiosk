import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { systemClock } from '../clock';
import { DAILY_MARGIN_MS, msUntilLocalTime, startDaily } from './lifecycle';

describe('msUntilLocalTime', () => {
  it('returns the time to the next occurrence of HH:mm', () => {
    expect(msUntilLocalTime(new Date(2026, 9, 14, 22, 0), '05:00')).toBe(7 * 3_600_000);
    expect(msUntilLocalTime(new Date(2026, 9, 14, 4, 0), '05:00')).toBe(3_600_000);
    expect(msUntilLocalTime(new Date(2026, 9, 14, 5, 0), '05:00')).toBe(24 * 3_600_000);
  });
});

describe('startDaily', () => {
  beforeEach(() => vi.useFakeTimers({ now: new Date(2026, 9, 14, 22, 0) }));
  afterEach(() => vi.useRealTimers());

  it('runs the action every day just after HH:mm until stopped', () => {
    const action = vi.fn();
    const stop = startDaily(systemClock, '05:00', action);

    vi.advanceTimersByTime(7 * 3_600_000 + DAILY_MARGIN_MS - 1);
    expect(action).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(action).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(24 * 3_600_000);
    expect(action).toHaveBeenCalledTimes(2);

    stop();
    vi.advanceTimersByTime(48 * 3_600_000);
    expect(action).toHaveBeenCalledTimes(2);
  });
});
