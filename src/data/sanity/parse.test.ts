import { describe, expect, it } from 'vitest';
import { toDateBound, toDateOnly, toSpainLocalIso } from './parse';

describe('Sanity parse helpers', () => {
  it('validates calendar dates', () => {
    expect(toDateOnly('2026-10-14')).toBe('2026-10-14');
    expect(toDateOnly('2026-02-30')).toBeNull();
    expect(toDateOnly('2026-10-14T10:00:00Z')).toBeNull();
  });

  it('accepts compact and dashed date bounds', () => {
    expect(toDateBound('20261014')).toBe('2026-10-14');
    expect(toDateBound('2026-10-14')).toBe('2026-10-14');
    expect(toDateBound('14/10/2026')).toBeNull();
  });

  it('converts UTC datetimes to Spanish peninsular local time', () => {
    expect(toSpainLocalIso('2026-10-10T12:00:00.000Z')).toBe('2026-10-10T14:00:00');
    expect(toSpainLocalIso('2026-11-10T20:00:00Z')).toBe('2026-11-10T21:00:00');
    expect(toSpainLocalIso('not a date')).toBeNull();
    expect(toSpainLocalIso(null)).toBeNull();
  });
});
