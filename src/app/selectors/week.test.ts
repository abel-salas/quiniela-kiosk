import { describe, expect, it } from 'vitest';
import type { Draw, FootballDraw } from '../../domain/draw';
import { selectWeekDraws } from './week';

const bono = (date: string): Draw => ({
  gameId: 'BONO', drawId: date, date, source: 'selae', kind: 'numbers', numbers: [1, 2, 3, 4, 5, 6], extras: [],
});
const jornada = (date: string, number: number): FootballDraw => ({
  gameId: 'LAQU', drawId: `J${number}`, date, source: 'selae', kind: 'football', jornada: number, status: 'final', matches: [],
});
const days = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => `2026-10-${String(from + i).padStart(2, '0')}`);

describe('selectWeekDraws', () => {
  it('keeps the 7 most recent days of a daily game, oldest first', () => {
    const result = selectWeekDraws(days(1, 19).reverse().map(bono));
    expect(result.map((draw) => draw.date)).toEqual(days(13, 19));
  });

  it('a new Tuesday pushes out the previous Tuesday', () => {
    expect(selectWeekDraws(days(13, 19).map(bono))[0].date).toBe('2026-10-13');
    const withTuesday20 = selectWeekDraws(days(13, 20).map(bono));
    expect(withTuesday20.map((draw) => draw.date)).toEqual(days(14, 20));
  });

  it('shows only the most recent football jornada', () => {
    expect(selectWeekDraws([jornada('2026-10-11', 12), jornada('2026-10-14', 13), jornada('2026-10-04', 11)]))
      .toEqual([jornada('2026-10-14', 13)]);
  });

  it('never shows an open jornada: falls back to the latest finished one', () => {
    const open = { ...jornada('2026-10-14', 13), status: 'open' as const };
    expect(selectWeekDraws([jornada('2026-10-11', 12), open])).toEqual([jornada('2026-10-11', 12)]);
    expect(selectWeekDraws([open])).toEqual([]);
  });

  it('crosses month boundaries and handles no draws', () => {
    const result = selectWeekDraws(['2026-09-28', '2026-10-01', '2026-10-05'].map(bono));
    expect(result.map((draw) => draw.date)).toEqual(['2026-10-01', '2026-10-05']);
    expect(selectWeekDraws([])).toEqual([]);
  });
});
