import { describe, expect, it } from 'vitest';
import type { Draw, DrawSource } from '../../domain/draw';
import { mergeByDate } from './merge';

const draw = (date: string, source: DrawSource, numbers = [1, 2, 3, 4, 5, 6]): Draw => ({
  gameId: 'BONO', drawId: `${source}-${date}`, date, source, kind: 'numbers', numbers, extras: [],
});

describe('mergeByDate', () => {
  it('adds new dates and keeps the result ascending', () => {
    const result = mergeByDate([draw('2026-10-13', 'selae')], [draw('2026-10-14', 'selae'), draw('2026-10-12', 'sanity')], 'selae');
    expect(result.map((d) => `${d.date}:${d.source}`)).toEqual([
      '2026-10-12:sanity', '2026-10-13:selae', '2026-10-14:selae',
    ]);
  });

  it('SELAE wins over Sanity on the same date when SELAE is preferred', () => {
    expect(mergeByDate([draw('2026-10-14', 'sanity')], [draw('2026-10-14', 'selae')], 'selae')[0].source).toBe('selae');
    expect(mergeByDate([draw('2026-10-14', 'selae')], [draw('2026-10-14', 'sanity')], 'selae')[0].source).toBe('selae');
  });

  it('Sanity wins over SELAE on the same date for forced games', () => {
    expect(mergeByDate([draw('2026-10-14', 'selae')], [draw('2026-10-14', 'sanity')], 'sanity')[0].source).toBe('sanity');
  });

  it('a fresh draw from the same source replaces the stored one', () => {
    const result = mergeByDate([draw('2026-10-14', 'selae', [1, 2, 3, 4, 5, 6])], [draw('2026-10-14', 'selae', [7, 8, 9, 10, 11, 12])], 'selae');
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ numbers: [7, 8, 9, 10, 11, 12] });
  });

  it('keeps what is in memory when nothing arrives', () => {
    const current = [draw('2026-10-14', 'selae')];
    expect(mergeByDate(current, [], 'selae')).toEqual(current);
  });
});
