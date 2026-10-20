import { describe, expect, it } from 'vitest';
import { parseCombination } from './combination';

describe('parseCombination', () => {
  it('preserves leading zeroes and tokens without extras', () => {
    expect(parseCombination(' 21 - 23 - 39 - 44 - 49 - 04 - 11')).toEqual({
      tokens: ['21', '23', '39', '44', '49', '04', '11'],
      c: null,
      r: null,
    });
  });

  it('extracts complementario and reintegro', () => {
    expect(parseCombination('02 - 05 - 26 - 40 - 42 - 45 C(23) R(9)')).toEqual({
      tokens: ['02', '05', '26', '40', '42', '45'],
      c: '23',
      r: '9',
    });
  });

  it('parses numeric game examples with individual extras', () => {
    expect(parseCombination('05 - 27 - 43 - 49 - 52 R(4)')).toEqual({
      tokens: ['05', '27', '43', '49', '52'],
      c: null,
      r: '4',
    });
    expect(parseCombination('03 - 04 - 06 - 19 - 30 - 36 C(2)')).toEqual({
      tokens: ['03', '04', '06', '19', '30', '36'],
      c: '2',
      r: null,
    });
  });

  it('keeps football result tokens intact', () => {
    expect(parseCombination('X - 2 - 1 - X - 1 - 1 - X - X - 1 - 1 - 1 - 1 - 2 - 1 - 10')?.tokens)
      .toEqual(['X', '2', '1', 'X', '1', '1', 'X', 'X', '1', '1', '1', '1', '2', '1', '10']);
    expect(parseCombination(' 00 - 12 - M0 - M2 - M2 - 10')?.tokens)
      .toEqual(['00', '12', 'M0', 'M2', 'M2', '10']);
  });

  it('returns null for missing, empty, or malformed combinations', () => {
    expect(parseCombination(null)).toBeNull();
    expect(parseCombination('  ')).toBeNull();
    expect(parseCombination('21 - 23 C()')).toBeNull();
    expect(parseCombination('21 - 23 C(2) C(3)')).toBeNull();
  });
});
