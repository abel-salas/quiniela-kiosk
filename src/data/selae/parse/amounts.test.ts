import { describe, expect, it } from 'vitest';
import { parseEuros } from './amounts';

describe('parseEuros', () => {
  it('parses integer amounts and comma decimals', () => {
    expect(parseEuros('49000000')).toBe(49000000);
    expect(parseEuros('46102,13')).toBe(46102.13);
  });

  it.each([null, '', '0', 0])('returns null for an empty or zero amount (%s)', (value) => {
    expect(parseEuros(value)).toBeNull();
  });

  it('rejects unsupported and non-finite values', () => {
    expect(parseEuros('not an amount')).toBeNull();
    expect(parseEuros(Number.POSITIVE_INFINITY)).toBeNull();
  });
});
