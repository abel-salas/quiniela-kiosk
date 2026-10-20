import { describe, expect, it } from 'vitest';
import draws from '../__fixtures__/draws.json';
import { mapSanityDraw } from './draws';

const byId = (id: string) => {
  const found = draws.find((draw) => draw._id === id);
  if (!found) throw new Error(`Missing fixture ${id}`);
  return found;
};

const laqu = byId('draw-laqu-j12');
const qgol = byId('draw-qgol-j13');
const laquMatches = laqu.matches ?? [];

describe('mapSanityDraw (football)', () => {
  it('maps a finished LAQU jornada with 15 matches and Spanish local kickoff', () => {
    const draw = mapSanityDraw(laqu, 'LAQU');
    expect(draw).toMatchObject({
      gameId: 'LAQU',
      drawId: 'draw-laqu-j12',
      date: '2026-10-11',
      source: 'sanity',
      kind: 'football',
      jornada: 12,
      status: 'final',
    });
    if (draw?.kind !== 'football') throw new Error('Expected football draw');
    expect(draw.matches).toHaveLength(15);
    expect(draw.matches[0]).toEqual({
      position: 1,
      home: 'Rayo Vallecano (M)',
      away: 'Athletic Club (M)',
      kickoff: '2026-10-10T14:00:00',
      score: '0-0',
      sign: 'X',
    });
    expect(draw.matches[14]).toMatchObject({ position: 15, home: 'Real Madrid (M)', sign: '1-0' });
  });

  it('maps QGOL with 6 matches and converts winter time correctly', () => {
    const draw = mapSanityDraw(qgol, 'QGOL');
    if (draw?.kind !== 'football') throw new Error('Expected football draw');
    expect(draw.matches).toHaveLength(6);
    expect(draw.matches[0]).toMatchObject({ home: 'Rayo Vallecano', away: 'Athletic Club', sign: '0-0' });
    expect(draw.matches[5].kickoff).toBe('2026-11-10T21:00:00');
  });

  it('treats finalizada false or missing as an open jornada', () => {
    expect(mapSanityDraw({ ...laqu, finalizada: false }, 'LAQU')).toMatchObject({ status: 'open' });
    expect(mapSanityDraw({ ...laqu, finalizada: undefined }, 'LAQU')).toMatchObject({ status: 'open' });
  });

  it('keeps unplayed matches with null kickoff, score and sign', () => {
    const matches = laquMatches.map((match) => ({ ...match, kickoff: null, score: '', sign: null }));
    const draw = mapSanityDraw({ ...laqu, matches }, 'LAQU');
    if (draw?.kind !== 'football') throw new Error('Expected football draw');
    expect(draw.matches[3]).toMatchObject({ position: 4, kickoff: null, score: null, sign: null });
  });

  it.each([
    ['missing jornada', { jornada: undefined }],
    ['non-integer jornada', { jornada: 12.5 }],
    ['wrong match count', { matches: laquMatches.slice(0, 14) }],
    ['match without home team', { matches: laquMatches.map((m, i) => (i === 2 ? { ...m, home: ' ' } : m)) }],
    ['invalid kickoff', { matches: laquMatches.map((m, i) => (i === 0 ? { ...m, kickoff: 'tomorrow' } : m)) }],
  ])('discards an incomplete document: %s', (_, patch) => {
    expect(mapSanityDraw({ ...laqu, ...patch }, 'LAQU')).toBeNull();
  });
});
