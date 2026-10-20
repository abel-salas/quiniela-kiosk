import { describe, expect, it } from 'vitest';
import { createClock, createOffsetClock, systemClock } from './clock';

describe('clock', () => {
  it('starts an offset clock at the given instant and keeps it running', () => {
    let real = Date.UTC(2030, 0, 1, 8, 0, 0);
    const start = new Date(2026, 9, 14, 21, 40);
    const clock = createOffsetClock(start, () => real);

    expect(clock.now()).toEqual(start);
    real += 5 * 60_000;
    expect(clock.now()).toEqual(new Date(2026, 9, 14, 21, 45));
  });

  it('uses the system clock without a fixed instant', () => {
    expect(createClock({ now: null })).toBe(systemClock);
    const before = Date.now();
    const now = systemClock.now().getTime();
    expect(now).toBeGreaterThanOrEqual(before);
  });

  it('uses an offset clock when config.now is set', () => {
    const start = new Date(2026, 9, 14, 22, 0);
    expect(createClock({ now: start }, () => 0).now()).toEqual(start);
  });
});
