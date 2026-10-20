import { describe, expect, it } from 'vitest';
import bonoFixture from '../__fixtures__/BONO.results.json';
import edmsFixture from '../__fixtures__/EDMS.results.json';
import elgrFixture from '../__fixtures__/ELGR.results.json';
import emilFixture from '../__fixtures__/EMIL.results.json';
import laprFixture from '../__fixtures__/LAPR.results.json';
import { mapNumbersDraw } from './numbers';

describe('mapNumbersDraw', () => {
  it('maps BONO from combinacion and normalizes numeric extras', () => {
    expect(mapNumbersDraw(bonoFixture[0], 'BONO')).toMatchObject({
      gameId: 'BONO',
      drawId: '1325501287',
      date: '2026-10-14',
      source: 'selae',
      kind: 'numbers',
      numbers: [8, 11, 21, 41, 47, 48],
      extras: [
        { kind: 'complementario', values: ['34'] },
        { kind: 'reintegro', values: ['4'] },
      ],
    });
  });

  it('maps LAPR and preserves the Joker code', () => {
    expect(mapNumbersDraw(laprFixture[0], 'LAPR')).toMatchObject({
      gameId: 'LAPR',
      drawId: '1325304123',
      date: '2026-10-12',
      source: 'selae',
      kind: 'numbers',
      numbers: [2, 5, 26, 40, 42, 45],
      extras: [
        { kind: 'complementario', values: ['23'] },
        { kind: 'reintegro', values: ['9'] },
        { kind: 'joker', values: ['4781884'] },
      ],
    });
  });

  it('maps ELGR reintegro as the clave', () => {
    expect(mapNumbersDraw(elgrFixture[0], 'ELGR')).toMatchObject({
      gameId: 'ELGR',
      drawId: '1325205041',
      date: '2026-10-11',
      source: 'selae',
      kind: 'numbers',
      numbers: [5, 27, 43, 49, 52],
      extras: [{ kind: 'clave', values: ['4'] }],
    });
  });

  it('maps EMIL stars and preserves the Millón code', () => {
    expect(mapNumbersDraw(emilFixture[0], 'EMIL')).toMatchObject({
      gameId: 'EMIL',
      drawId: '1325402082',
      date: '2026-10-13',
      source: 'selae',
      kind: 'numbers',
      numbers: [21, 23, 39, 44, 49],
      extras: [
        { kind: 'estrellas', values: ['4', '11'] },
        { kind: 'millon', values: ['GRF94523'] },
      ],
    });
  });

  it('maps EDMS c value as sueno', () => {
    expect(mapNumbersDraw(edmsFixture[0], 'EDMS')).toMatchObject({
      gameId: 'EDMS',
      drawId: '1325314082',
      date: '2026-10-12',
      source: 'selae',
      kind: 'numbers',
      numbers: [3, 4, 6, 19, 30, 36],
      extras: [{ kind: 'sueno', values: ['2'] }],
    });
  });

  it('discards records that do not match the game rule', () => {
    expect(mapNumbersDraw(null, 'BONO')).toBeNull();
    expect(mapNumbersDraw(bonoFixture[0], 'LAPR')).toBeNull();
    expect(mapNumbersDraw({ ...bonoFixture[0], combinacion: '1 - 2' }, 'BONO')).toBeNull();
  });
});
