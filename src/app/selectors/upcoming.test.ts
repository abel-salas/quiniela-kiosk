import { describe, expect, it } from 'vitest';
import todosFixture from '../../data/selae/__fixtures__/TODOS.next.json';
import { mapUpcoming } from '../../data/selae/mappers/next-draw';
import { selectUpcomingTiles } from './upcoming';

const upcoming = mapUpcoming(todosFixture);
const NOON = new Date(2026, 9, 20, 12, 0);
const EVENING = new Date(2026, 9, 20, 19, 0);
const NIGHT = new Date(2026, 9, 20, 23, 0);

const byName = (now: Date) => new Map(selectUpcomingTiles(upcoming, now).map((tile) => [tile.name, tile]));

describe('selectUpcomingTiles', () => {
  it('one tile per game in API order at 12:00', () => {
    expect(selectUpcomingTiles(upcoming, NOON).map((tile) => tile.key)).toEqual([
      'EMIL-2026-10-20', 'BONO-2026-10-20', 'LOTU-2026-10-20', 'QUPL-2026-10-20', 'LAQU-2026-10-21',
      'QGOL-2026-10-21', 'LAPR-2026-10-22', 'EDMS-2026-10-22', 'LNAC-2026-10-22', 'ELGR-2026-10-25',
    ]);
  });

  it('at 19:00 LOTU and QUPL move to their Sunday draw at the end', () => {
    expect(selectUpcomingTiles(upcoming, EVENING).map((tile) => tile.key)).toEqual([
      'EMIL-2026-10-20', 'BONO-2026-10-20', 'LAQU-2026-10-21', 'QGOL-2026-10-21', 'LAPR-2026-10-22',
      'EDMS-2026-10-22', 'LNAC-2026-10-22', 'ELGR-2026-10-25', 'LOTU-2026-10-25', 'QUPL-2026-10-25',
    ]);
  });

  it('replicates the SELAE amounts', () => {
    const tiles = byName(NOON);
    expect(tiles.get('La Quiniela')?.amount).toBeNull();
    expect(tiles.get('El Quinigol')?.amount).toBe('120.000 €');
    expect(tiles.get('Euromillones')?.amount).toBe('59.000.000 €');
    expect(tiles.get('Lotería Nacional')).toMatchObject({ amount: '300.000 €', note: 'jueves · 1er premio a la serie' });
    expect(tiles.get('EuroDreams')).toMatchObject({ amount: '50.000 €', note: 'al mes durante 30 años' });
  });

  it('closed draws do not provide the amount', () => {
    const tiles = byName(EVENING);
    // Real elapsed time: the clocks go back one hour on 2026-10-25.
    expect(tiles.get('Lototurf')).toMatchObject({ amount: null, countdown: '4d 16h 45m' });
    expect(tiles.get('Quíntuple Plus')).toMatchObject({ amount: null, countdown: 'dom 25/10' });
  });

  it('draws not yet on sale show the draw date instead of a countdown', () => {
    const tiles = byName(NIGHT);
    expect(tiles.get('La Quiniela')).toMatchObject({ key: 'LAQU-2026-10-25', amount: null, countdown: 'dom 25/10' });
    expect(tiles.get('El Quinigol')).toMatchObject({ key: 'QGOL-2026-10-25', amount: null, countdown: 'dom 25/10' });
    expect(tiles.get('Quíntuple Plus')).toMatchObject({ key: 'QUPL-2026-10-25', amount: null, countdown: 'dom 25/10' });
    expect(tiles.get('Euromillones')?.countdown).toBe('2d 21h 30m');
  });

  it('adds the draw time to the date when drawAt is known', () => {
    const timed = upcoming.map((draw) =>
      draw.gameId === 'LAQU' && draw.date === '2026-10-25' ? { ...draw, drawAt: '2026-10-25T21:30:00' } : draw);
    const tile = selectUpcomingTiles(timed, NIGHT).find((item) => item.name === 'La Quiniela');
    expect(tile?.countdown).toBe('dom 25/10 · 21:30');
  });

  it('counts down to the close of sales', () => {
    expect(byName(NOON).get('Euromillones')?.countdown).toBe('8h 30m');
  });

  it('EuroDreams falls back to the default monthly amount', () => {
    const withoutJackpot = upcoming.map((draw) => (draw.gameId === 'EDMS' ? { ...draw, jackpot: null } : draw));
    const tile = selectUpcomingTiles(withoutJackpot, NOON).find((item) => item.name === 'EuroDreams');
    expect(tile?.amount).toBe('20.000 €');
  });

  it('LNAC special prize uses its own label', () => {
    const special = upcoming.map((draw) =>
      draw.gameId === 'LNAC' && draw.date === '2026-10-22' ? { ...draw, nacionalSpecialPrize: 15_000_000 } : draw);
    const tile = selectUpcomingTiles(special, NOON).find((item) => item.name === 'Lotería Nacional');
    expect(tile).toMatchObject({ amount: '15.000.000 €', note: 'jueves · Premio especial al décimo' });
  });
});
