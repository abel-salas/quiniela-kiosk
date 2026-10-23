import { describe, expect, it } from 'vitest';
import type { Draw, FootballDraw } from '../../domain/draw';
import {
  expectedDrawDate,
  footballDueAt,
  isResultsDue,
  isUpcomingDue,
  lastMorningSlot,
  REFRESH_ORDER,
} from './calendar';

// 2026-10-14 is a Wednesday.
const at = (day: number, hours: number, minutes = 0) => new Date(2026, 9, day, hours, minutes);
const numbers = (gameId: 'BONO' | 'LAPR', date: string): Draw => ({
  gameId, drawId: date, date, source: 'selae', kind: 'numbers', numbers: [], extras: [],
});
const jornada = (status: 'open' | 'final', kickoffs: (string | null)[]): FootballDraw => ({
  gameId: 'LAQU', drawId: 'J', date: '2026-10-14', source: 'selae', kind: 'football', jornada: 13, status,
  matches: kickoffs.map((kickoff, index) => ({ position: index + 1, home: 'A', away: 'B', kickoff, score: null, sign: null })),
});

describe('REFRESH_ORDER', () => {
  it('calls the jackpots first, then football and the numbers games', () => {
    expect(REFRESH_ORDER).toEqual(['upcoming', 'LAQU', 'QGOL', 'BONO', 'EMIL', 'LAPR', 'ELGR', 'EDMS']);
  });
});

describe('lastMorningSlot', () => {
  it('is today at 09:15 once passed, otherwise yesterday', () => {
    expect(lastMorningSlot(at(14, 9, 15))).toEqual(at(14, 9, 15));
    expect(lastMorningSlot(at(14, 9, 14))).toEqual(at(13, 9, 15));
  });
});

describe('expectedDrawDate', () => {
  it('is the previous draw day once its next morning has passed', () => {
    const wednesday = at(14, 10);
    expect(expectedDrawDate('BONO', wednesday)).toBe('2026-10-13');
    expect(expectedDrawDate('EMIL', wednesday)).toBe('2026-10-13');
    expect(expectedDrawDate('LAPR', wednesday)).toBe('2026-10-12');
    expect(expectedDrawDate('ELGR', wednesday)).toBe('2026-10-11');
    expect(expectedDrawDate('EDMS', wednesday)).toBe('2026-10-12');
  });

  it('waits for the morning slot', () => {
    expect(expectedDrawDate('EMIL', at(14, 8))).toBe('2026-10-09');
    expect(expectedDrawDate('LAPR', at(13, 9, 15))).toBe('2026-10-12');
    expect(expectedDrawDate('EDMS', at(16, 9, 15))).toBe('2026-10-15');
    expect(expectedDrawDate('ELGR', at(12, 9, 15))).toBe('2026-10-11');
  });
});

describe('footballDueAt', () => {
  it('is the morning after the last kickoff of an open jornada', () => {
    const open = jornada('open', ['2026-10-13T21:00:00', '2026-10-15T21:00:00', null]);
    expect(footballDueAt([open], at(14, 10))).toEqual(at(16, 9, 15));
  });

  it('falls back to three days after the last save', () => {
    expect(footballDueAt([jornada('final', ['2026-10-11T21:00:00'])], at(14, 10))).toEqual(at(17, 9, 15));
    expect(footballDueAt([jornada('open', [null])], at(14, 10))).toEqual(at(17, 9, 15));
    expect(footballDueAt([], at(14, 10))).toEqual(at(17, 9, 15));
  });
});

describe('isResultsDue', () => {
  const savedAt = at(14, 9, 30).toISOString();

  it('is due without a stored entry', () => {
    expect(isResultsDue('BONO', null, at(14, 10))).toBe(true);
  });

  it('skips the call when the stored entry already has the expected draw', () => {
    expect(isResultsDue('BONO', { savedAt, draws: [numbers('BONO', '2026-10-13')] }, at(14, 22))).toBe(false);
    expect(isResultsDue('BONO', { savedAt, draws: [numbers('BONO', '2026-10-12')] }, at(14, 22))).toBe(true);
    expect(isResultsDue('BONO', { savedAt, draws: [numbers('BONO', '2026-10-13')] }, at(15, 9, 15))).toBe(true);
  });

  it('follows the end of the open jornada for football', () => {
    const entry = { savedAt, draws: [jornada('open', ['2026-10-15T21:00:00'])] };
    expect(isResultsDue('LAQU', entry, at(16, 9, 14))).toBe(false);
    expect(isResultsDue('LAQU', entry, at(16, 9, 15))).toBe(true);
  });
});

describe('isUpcomingDue', () => {
  it('refreshes the jackpots once per day from the morning slot', () => {
    const entry = { savedAt: at(14, 9, 20).toISOString() };
    expect(isUpcomingDue(null, at(14, 10))).toBe(true);
    expect(isUpcomingDue(entry, at(15, 9))).toBe(false);
    expect(isUpcomingDue(entry, at(15, 9, 15))).toBe(true);
    expect(isUpcomingDue({ savedAt: at(14, 8).toISOString() }, at(14, 10))).toBe(true);
  });
});
