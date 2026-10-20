import { describe, expect, it } from 'vitest';
import {
  formatAmount,
  formatBall,
  formatCountdown,
  formatHeaderDate,
  formatJoker,
  formatKickoff,
  formatLineDate,
  formatTime,
  formatWeekdayName,
} from './format';
import { formatDrawDate } from './format';

describe('formatBall', () => {
  it('pads values to two digits', () => {
    expect(formatBall(4)).toBe('04');
  });
});

describe('date formatting', () => {
  it('formats line and header dates in Spanish', () => {
    expect(formatLineDate('2026-10-19')).toBe('lunes 19/10');
    expect(formatLineDate('2026-10-14')).toBe('miércoles 14/10');
    expect(formatHeaderDate('2026-10-19')).toBe('lun - 19/10/2026');
  });

  it('rejects invalid calendar dates', () => {
    expect(() => formatLineDate('2026-02-30')).toThrow(RangeError);
  });
});

describe('formatJoker', () => {
  it('groups digits by thousands from the right', () => {
    expect(formatJoker('2240325')).toBe('2 240 325');
  });
});

describe('weekday and time formatting', () => {
  it('formats the full weekday name, the kickoff and the time of day', () => {
    expect(formatWeekdayName('2026-10-22')).toBe('jueves');
    expect(formatWeekdayName('2026-10-24')).toBe('sábado');
    expect(formatKickoff('2026-10-17T18:30:00')).toBe('sáb 18:30');
    expect(formatTime('2026-10-14T21:45:10')).toBe('21:45');
  });
});

describe('formatAmount', () => {
  it('uses Spanish separators and euro suffix', () => {
    expect(formatAmount(1400000)).toBe('1.400.000 €');
    expect(formatAmount(46102.13)).toBe('46.102,13 €');
  });
});

describe('formatCountdown', () => {
  const from = new Date(2026, 9, 19, 10, 0);

  it.each([
    [from, new Date(2026, 9, 20, 13, 49), '1d 3h 49m'],
    [from, new Date(2026, 9, 19, 13, 19), '3h 19m'],
    [from, new Date(2026, 9, 19, 10, 45), '45m'],
  ])('formats the remaining time', (start, end, expected) => {
    expect(formatCountdown(start, end)).toBe(expected);
  });

  it('returns null at or after the target, and rounds a partial minute up', () => {
    expect(formatCountdown(from, from)).toBeNull();
    expect(formatCountdown(new Date(from.getTime() + 1), from)).toBeNull();
    expect(formatCountdown(from, new Date(from.getTime() + 30_000))).toBe('1m');
  });
});

describe('formatDrawDate', () => {
  it('formats the draw day and, when known, its time', () => {
    expect(formatDrawDate('2026-10-25', null)).toBe('dom 25/10');
    expect(formatDrawDate('2026-10-25', '2026-10-25T21:30:00')).toBe('dom 25/10 · 21:30');
  });
});
