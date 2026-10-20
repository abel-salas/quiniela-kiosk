import { describe, expect, it } from 'vitest';
import type { FootballDraw, NumbersDraw } from '../../../domain/draw';
import bonoFixture from '../__fixtures__/BONO.results.json';
import edmsFixture from '../__fixtures__/EDMS.results.json';
import elgrFixture from '../__fixtures__/ELGR.results.json';
import emilFixture from '../__fixtures__/EMIL.results.json';
import laprFixture from '../__fixtures__/LAPR.results.json';
import laquFixture from '../__fixtures__/LAQU.results.json';
import noRecords from '../__fixtures__/no-records.json';
import qgolFixture from '../__fixtures__/QGOL.results.json';
import { mapResults } from './results';

const numbersOn = (raw: unknown, gameId: 'BONO' | 'LAPR' | 'EMIL' | 'ELGR' | 'EDMS', date: string) =>
  mapResults(raw, gameId).find((draw): draw is NumbersDraw => draw.kind === 'numbers' && draw.date === date);

const footballDraws = (raw: unknown, gameId: 'LAQU' | 'QGOL'): FootballDraw[] =>
  mapResults(raw, gameId).filter((draw): draw is FootballDraw => draw.kind === 'football');

describe('mapResults', () => {
  it('maps BONO draws in ascending date order', () => {
    const draws = mapResults(bonoFixture, 'BONO');
    expect(draws).toHaveLength(3);
    expect(draws.map((draw) => draw.date)).toEqual([...draws.map((draw) => draw.date)].sort());
    expect(draws[2]).toMatchObject({
      date: '2026-10-14',
      numbers: [8, 11, 21, 41, 47, 48],
      extras: [
        { kind: 'complementario', values: ['34'] },
        { kind: 'reintegro', values: ['4'] },
      ],
    });
  });

  it('maps LAPR, EMIL, ELGR and EDMS through the numbers mapper', () => {
    expect(numbersOn(laprFixture, 'LAPR', '2026-10-12')).toMatchObject({
      numbers: [2, 5, 26, 40, 42, 45],
      extras: [
        { kind: 'complementario', values: ['23'] },
        { kind: 'reintegro', values: ['9'] },
        { kind: 'joker', values: ['4781884'] },
      ],
    });
    expect(numbersOn(emilFixture, 'EMIL', '2026-10-13')).toMatchObject({
      numbers: [21, 23, 39, 44, 49],
      extras: [
        { kind: 'estrellas', values: ['4', '11'] },
        { kind: 'millon', values: ['GRF94523'] },
      ],
    });
    expect(numbersOn(elgrFixture, 'ELGR', '2026-10-11')).toMatchObject({
      numbers: [5, 27, 43, 49, 52],
      extras: [{ kind: 'clave', values: ['4'] }],
    });
    expect(numbersOn(edmsFixture, 'EDMS', '2026-10-12')).toMatchObject({
      numbers: [3, 4, 6, 19, 30, 36],
      extras: [{ kind: 'sueno', values: ['2'] }],
    });
  });

  it('maps LAQU open and final jornadas through the football mapper', () => {
    const draws = footballDraws(laquFixture, 'LAQU');
    const open = draws.find((draw) => draw.jornada === 13);
    const final = draws.find((draw) => draw.jornada === 12);

    expect(open?.status).toBe('open');
    expect(open?.matches).toHaveLength(15);
    expect(open?.matches[14].sign).toBeNull();
    expect(final?.status).toBe('final');
    expect(final?.matches[14]).toMatchObject({
      home: 'Real Madrid (M)',
      away: 'Villarreal (M)',
      sign: '1-0',
    });
  });

  it('maps the QGOL jornada of 2026-10-11', () => {
    const draw = footballDraws(qgolFixture, 'QGOL').find((item) => item.date === '2026-10-11');
    expect(draw?.matches).toHaveLength(6);
    expect(draw?.matches[0]).toMatchObject({
      position: 1,
      home: 'Rayo Vallecano',
      away: 'Athletic Club',
      sign: '0-0',
    });
  });

  it('returns an empty list when SELAE answers with the no-records string', () => {
    expect(mapResults(noRecords, 'BONO')).toEqual([]);
    expect(mapResults(null, 'LAQU')).toEqual([]);
  });

  it('discards invalid elements and keeps the rest', () => {
    const draws = mapResults([null, { ...bonoFixture[0], combinacion: null }, bonoFixture[1]], 'BONO');
    expect(draws).toHaveLength(1);
    expect(draws[0].drawId).toBe(bonoFixture[1].id_sorteo);
  });
});
