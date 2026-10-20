import { describe, expect, it } from 'vitest';
import { toApiDate, toDateOnly, toLocalIso } from './dates';

describe('date parsers', () => {
  it('extracts a calendar date from a SELAE timestamp', () => {
    expect(toDateOnly('2026-10-12 21:43:00')).toBe('2026-10-12');
  });

  it('normalizes a local timestamp without adding a timezone', () => {
    expect(toLocalIso('2026-10-12 21:43:00')).toBe('2026-10-12T21:43:00');
  });

  it('treats midnight as an unavailable kickoff time', () => {
    expect(toLocalIso('2026-10-12 00:00:00')).toBeNull();
  });

  it('formats a Date for SELAE API query parameters', () => {
    expect(toApiDate(new Date(2026, 9, 12))).toBe('20261012');
  });

  it('rejects invalid calendar dates and timestamps', () => {
    expect(toDateOnly('2026-02-30 21:43:00')).toBeNull();
    expect(toLocalIso('2026-10-12 25:00:00')).toBeNull();
  });
});
