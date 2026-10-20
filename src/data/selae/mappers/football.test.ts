import { describe, expect, it } from 'vitest';
import laquFixture from '../__fixtures__/LAQU.results.json';
import qgolFixture from '../__fixtures__/QGOL.results.json';
import { mapFootballDraw } from './football';

describe('mapFootballDraw', () => {
  it('maps an open LAQU jornada and all 15 matches', () => {
    const draw = mapFootballDraw(laquFixture[0], 'LAQU');
    expect(draw).toMatchObject({
      gameId: 'LAQU',
      drawId: '1325506058',
      date: '2026-10-14',
      source: 'selae',
      kind: 'football',
      jornada: 13,
      status: 'open',
    });
    expect(draw?.matches).toHaveLength(15);
    expect(draw?.matches[14]).toMatchObject({
      position: 15,
      home: 'Roma (M)',
      away: 'Real Madrid (M)',
      sign: null,
      score: null,
    });
  });

  it('maps a final LAQU match with normalized team names and sign', () => {
    const draw = mapFootballDraw(laquFixture[1], 'LAQU');
    expect(draw).toMatchObject({ date: '2026-10-11', jornada: 12, status: 'final' });
    expect(draw?.matches[14]).toMatchObject({
      position: 15,
      home: 'Real Madrid (M)',
      away: 'Villarreal (M)',
      score: '1-0',
      sign: '1-0',
    });
  });

  it('maps QGOL match scores and all six matches', () => {
    const draw = mapFootballDraw(qgolFixture[1], 'QGOL');
    expect(draw).toMatchObject({
      gameId: 'QGOL',
      date: '2026-10-11',
      jornada: 13,
      status: 'final',
    });
    expect(draw?.matches).toHaveLength(6);
    expect(draw?.matches[0]).toMatchObject({
      position: 1,
      home: 'Rayo Vallecano',
      away: 'Athletic Club',
      score: '0-0',
      sign: '0-0',
    });
  });

  it('discards records or matches that do not satisfy the raw contract', () => {
    expect(mapFootballDraw(null, 'LAQU')).toBeNull();
    expect(mapFootballDraw(laquFixture[0], 'QGOL')).toBeNull();
    expect(
      mapFootballDraw({ ...laquFixture[0], partidos: [{ posicion: 1 }] }, 'LAQU'),
    ).toBeNull();
  });
});
