import { describe, expect, it } from 'vitest';
import type { Draw } from '../../domain/draw';
import type { NextDraw } from '../../domain/next-draw';
import { pickNext } from './next-pick';

const next = (date: string): NextDraw => ({
  gameId: 'BONO', date, drawAt: null, salesCloseAt: null, salesOpen: true, jackpot: null, addOn: null,
  jornada: null, nacionalFirstPrize: null, nacionalSpecialPrize: null,
});
const bono = (date: string): Draw => ({
  gameId: 'BONO', drawId: date, date, source: 'selae', kind: 'numbers', numbers: [1, 2, 3, 4, 5, 6], extras: [],
});
const NOW = new Date(2026, 9, 14, 21, 30);

describe('pickNext', () => {
  it('takes the first upcoming draw of the game', () => {
    expect(pickNext([next('2026-10-14'), { ...next('2026-10-20'), gameId: 'EMIL' }], 'BONO', null, [], NOW))
      .toEqual(next('2026-10-14'));
  });

  it('keeps the previous next while its result is pending', () => {
    expect(pickNext([next('2026-10-15')], 'BONO', next('2026-10-14'), [bono('2026-10-13')], NOW))
      .toEqual(next('2026-10-14'));
  });

  it('moves on once the result arrived or the pending draw is too old', () => {
    expect(pickNext([next('2026-10-15')], 'BONO', next('2026-10-14'), [bono('2026-10-14')], NOW))
      .toEqual(next('2026-10-15'));
    expect(pickNext([next('2026-10-15')], 'BONO', next('2026-10-11'), [], NOW)).toEqual(next('2026-10-15'));
  });

  it('keeps the previous value when the game is missing from the list', () => {
    expect(pickNext([], 'BONO', next('2026-10-14'), [], NOW)).toEqual(next('2026-10-14'));
  });
});
