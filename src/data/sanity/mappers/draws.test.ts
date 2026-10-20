import { describe, expect, it } from 'vitest';
import draws from '../__fixtures__/draws.json';
import { mapSanityDraw, mapSanityDraws } from './draws';

const doc = (id: string) => {
  const found = draws.find((draw) => draw._id === id);
  if (!found) throw new Error(`Missing fixture ${id}`);
  return found;
};

describe('mapSanityDraw (numbers)', () => {
  it('maps BONO with complementario and reintegro', () => {
    expect(mapSanityDraw(doc('draw-bono-2026-10-14'), 'BONO')).toEqual({
      gameId: 'BONO',
      drawId: 'draw-bono-2026-10-14',
      date: '2026-10-14',
      source: 'sanity',
      kind: 'numbers',
      numbers: [8, 11, 21, 41, 47, 48],
      extras: [
        { kind: 'complementario', values: ['34'] },
        { kind: 'reintegro', values: ['4'] },
      ],
    });
  });

  it('maps LAPR, ELGR, EMIL and EDMS extras in the same order as SELAE', () => {
    expect(mapSanityDraw(doc('draw-lapr-2026-10-12'), 'LAPR')).toMatchObject({
      numbers: [2, 5, 26, 40, 42, 45],
      extras: [
        { kind: 'complementario', values: ['23'] },
        { kind: 'reintegro', values: ['9'] },
        { kind: 'joker', values: ['4781884'] },
      ],
    });
    expect(mapSanityDraw(doc('draw-elgr-2026-10-11'), 'ELGR')).toMatchObject({
      numbers: [5, 27, 43, 49, 52],
      extras: [{ kind: 'clave', values: ['4'] }],
    });
    expect(mapSanityDraw(doc('draw-emil-2026-10-13'), 'EMIL')).toMatchObject({
      numbers: [21, 23, 39, 44, 49],
      extras: [
        { kind: 'estrellas', values: ['4', '11'] },
        { kind: 'millon', values: ['GRF94523'] },
      ],
    });
    expect(mapSanityDraw(doc('draw-edms-2026-10-12'), 'EDMS')).toMatchObject({
      numbers: [3, 4, 6, 19, 30, 36],
      extras: [{ kind: 'sueno', values: ['2'] }],
    });
  });

  it('omits optional extras that are not filled in', () => {
    const { complementario: _c, reintegro: _r, joker: _j, ...bare } = doc('draw-lapr-2026-10-12');
    expect(mapSanityDraw(bare, 'LAPR')).toMatchObject({ extras: [] });
  });

  it.each([
    ['wrong number count', { numbers: [1, 2, 3, 4, 5] }],
    ['non-integer number', { numbers: [1, 2, 3, 4, 5, 6.5] }],
    ['reintegro above 9', { reintegro: 10 }],
    ['joker without 7 digits', { joker: '12345' }],
    ['missing date', { date: undefined }],
    ['invalid date', { date: '2026-02-30' }],
    ['missing _id', { _id: '' }],
  ])('discards an incomplete document: %s', (_, patch) => {
    expect(mapSanityDraw({ ...doc('draw-lapr-2026-10-12'), ...patch }, 'LAPR')).toBeNull();
  });

  it('discards EMIL without exactly two stars', () => {
    expect(mapSanityDraw({ ...doc('draw-emil-2026-10-13'), estrellas: undefined }, 'EMIL')).toBeNull();
    expect(mapSanityDraw({ ...doc('draw-emil-2026-10-13'), estrellas: [4] }, 'EMIL')).toBeNull();
  });
});

describe('mapSanityDraws', () => {
  it('keeps only the requested game, discards invalid documents and sorts by date', () => {
    const later = { ...doc('draw-bono-2026-10-14'), _id: 'later', date: '2026-10-15' };
    const earlier = { ...doc('draw-bono-2026-10-14'), _id: 'earlier', date: '2026-10-13' };
    const result = mapSanityDraws([later, null, ...draws, { ...earlier, numbers: [] }, earlier], 'BONO');
    expect(result.map((draw) => draw.drawId)).toEqual(['earlier', 'draw-bono-2026-10-14', 'later']);
  });

  it('returns an empty list for a non-array response', () => {
    expect(mapSanityDraws(null, 'BONO')).toEqual([]);
  });
});
