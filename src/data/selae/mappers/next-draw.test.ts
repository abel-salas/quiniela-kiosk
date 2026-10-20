import { describe, expect, it } from 'vitest';
import emilFixture from '../__fixtures__/EMIL.next.json';
import laprFixture from '../__fixtures__/LAPR.next.json';
import lnacFixture from '../__fixtures__/LNAC.next.json';
import noRecords from '../__fixtures__/no-records.json';
import qgolFixture from '../__fixtures__/QGOL.next.json';
import todosFixture from '../__fixtures__/TODOS.next.json';
import { mapNextDraw, mapUpcoming } from './next-draw';

describe('mapNextDraw', () => {
  it('maps EMIL jackpot, Millón add-on and sales close time', () => {
    expect(mapNextDraw(emilFixture[0])).toEqual({
      gameId: 'EMIL',
      date: '2026-10-16',
      drawAt: null,
      salesCloseAt: '2026-10-16T20:30:00',
      salesOpen: true,
      jackpot: 49000000,
      addOn: { kind: 'millon', amount: 1000000 },
      jornada: null,
      nacionalFirstPrize: null,
      nacionalSpecialPrize: null,
    });
  });

  it('maps LNAC draw time and first prize without jackpot', () => {
    expect(mapNextDraw(lnacFixture[0])).toMatchObject({
      gameId: 'LNAC',
      drawAt: '2026-10-15T21:00:00',
      jackpot: null,
      nacionalFirstPrize: 300000,
      nacionalSpecialPrize: null,
    });
  });

  it('maps QGOL jornada without jackpot', () => {
    expect(mapNextDraw(qgolFixture[0])).toMatchObject({ gameId: 'QGOL', jackpot: null, jornada: 15 });
  });

  it('maps an active Joker as add-on and a closed draw as not on sale', () => {
    expect(mapNextDraw(laprFixture[0])?.addOn).toEqual({ kind: 'joker', amount: 1000000 });
    expect(mapNextDraw(emilFixture[1])).toMatchObject({ salesOpen: false, jackpot: null });
  });

  it('ignores inactive add-ons and discards unknown games or dates', () => {
    expect(mapNextDraw({ ...emilFixture[0], millon: { importe: 1000000, activo: '0' } })?.addOn).toBeNull();
    expect(mapNextDraw({ ...emilFixture[0], game_id: 'LAMI' })).toBeNull();
    expect(mapNextDraw({ ...emilFixture[0], fecha: null })).toBeNull();
    expect(mapNextDraw(null)).toBeNull();
  });
});

describe('mapUpcoming', () => {
  it('keeps the 20 TODOS elements in the received order', () => {
    const upcoming = mapUpcoming(todosFixture);
    expect(upcoming).toHaveLength(20);
    expect(upcoming.map((draw) => draw.gameId)).toEqual(todosFixture.map((raw) => raw.game_id));
    expect(upcoming[0]).toMatchObject({ gameId: 'EMIL', date: '2026-10-20', jackpot: 59000000 });
  });

  it('keeps both LNAC draws and the LAQU jornada 16 jackpot', () => {
    const upcoming = mapUpcoming(todosFixture);
    const nacional = upcoming.filter((draw) => draw.gameId === 'LNAC');
    expect(nacional.map((draw) => draw.nacionalFirstPrize)).toEqual([300000, 600000]);
    expect(upcoming.find((draw) => draw.gameId === 'LAQU' && draw.jornada === 16)).toMatchObject({
      jackpot: 2500000,
      salesCloseAt: null,
    });
  });

  it('discards elements outside the catalogue and non-array responses', () => {
    expect(mapUpcoming([{ ...emilFixture[0], game_id: 'XXXX' }, emilFixture[0]])).toHaveLength(1);
    expect(mapUpcoming(noRecords)).toEqual([]);
  });
});
