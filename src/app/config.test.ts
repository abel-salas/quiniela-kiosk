import { describe, expect, it } from 'vitest';
import { DAILY_RELOAD_AT, parseLocalInstant, readConfig } from './config';

const ENV = { VITE_SANITY_PROJECT_ID: 'lkywbgau', VITE_SANITY_DATASET: 'production' };

describe('readConfig', () => {
  it('uses real sources, the system clock and the 05:00 reload by default', () => {
    expect(readConfig('', ENV)).toEqual({
      mock: false,
      now: null,
      reloadAt: DAILY_RELOAD_AT,
      sanity: { projectId: 'lkywbgau', dataset: 'production' },
    });
    expect(DAILY_RELOAD_AT).toBe('05:00');
  });

  it.each([
    ['?mock=1', true],
    ['?mock=true', true],
    ['?mock=0', false],
    ['?mock=', false],
    ['?mock=yes', false],
  ])('reads %s as mock=%s', (search, mock) => {
    expect(readConfig(search, ENV).mock).toBe(mock);
  });

  it('reads now as a local instant only together with mock', () => {
    expect(readConfig('?mock=1&now=2026-10-14T22:00', ENV).now).toEqual(new Date(2026, 9, 14, 22, 0));
    expect(readConfig('?mock=1&now=2026-10-14T21:40:30', ENV).now).toEqual(new Date(2026, 9, 14, 21, 40, 30));
    expect(readConfig('?now=2026-10-14T22:00', ENV).now).toBeNull();
  });

  it('ignores an invalid now', () => {
    expect(readConfig('?mock=1&now=2026-10-14', ENV).now).toBeNull();
    expect(readConfig('?mock=1&now=mañana', ENV).now).toBeNull();
  });

  it('reads Sanity env with production as default dataset and no project as null', () => {
    expect(readConfig('', { VITE_SANITY_PROJECT_ID: ' abc ' }).sanity).toEqual({
      projectId: 'abc',
      dataset: 'production',
    });
    expect(readConfig('', {}).sanity).toBeNull();
  });
});

describe('parseLocalInstant', () => {
  it('rejects impossible dates and times', () => {
    expect(parseLocalInstant('2026-02-30T10:00')).toBeNull();
    expect(parseLocalInstant('2026-10-14T24:00')).toBeNull();
    expect(parseLocalInstant(null)).toBeNull();
  });
});
