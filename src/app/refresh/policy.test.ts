import { describe, expect, it } from 'vitest';
import type { Draw, FootballDraw, Match, NumbersDraw } from '../../domain/draw';
import { GAMES, type ResultGameId } from '../../domain/games';
import type { NextDraw } from '../../domain/next-draw';
import type { GameState } from '../store/types';
import { decideNextCheck, expectedResultAt } from './policy';

const at = (iso: string): Date => {
  const [date, time] = iso.split('T');
  const [y, m, d] = date.split('-').map(Number);
  const [h, mi] = time.split(':').map(Number);
  return new Date(y, m - 1, d, h, mi);
};

const numbersDraw = (gameId: ResultGameId, date: string): NumbersDraw => ({
  gameId, drawId: `${gameId}-${date}`, date, source: 'selae', kind: 'numbers', numbers: [1, 2, 3, 4, 5, 6], extras: [],
});

const match = (position: number, kickoff: string | null): Match => ({
  position, home: 'A', away: 'B', kickoff, score: null, sign: null,
});

const openJornada = (date: string, kickoffs: (string | null)[]): FootballDraw => ({
  gameId: 'LAQU', drawId: `LAQU-${date}`, date, source: 'selae', kind: 'football', jornada: 13, status: 'open',
  matches: kickoffs.map((kickoff, index) => match(index + 1, kickoff)),
});

const finalJornada = (date: string): FootballDraw => ({
  ...openJornada(date, []), drawId: `LAQU-${date}`, jornada: 12, status: 'final',
});

const next = (gameId: ResultGameId, date: string, salesCloseAt: string | null = null): NextDraw => ({
  gameId, date, drawAt: null, salesCloseAt, salesOpen: true, jackpot: null, addOn: null, jornada: null,
  nacionalFirstPrize: null, nacionalSpecialPrize: null,
});

const state = (draws: Draw[], nextDraw: NextDraw | null, errorCount = 0): GameState => ({
  draws, next: nextDraw, phase: 'upToDate', lastErrorKind: errorCount ? 'network' : null, errorCount,
});

const decide = (gameId: ResultGameId, now: string, gameState: GameState) =>
  decideNextCheck({ now: at(now), game: GAMES[gameId], state: gameState });

const BONO_NEXT_14 = next('BONO', '2026-10-14', '2026-10-14T21:00:00');
const LAQU_NEXT = next('LAQU', '2026-10-18', '2026-10-17T14:00:00');
const LAQU_NEXT_21 = next('LAQU', '2026-10-21', '2026-10-20T21:00:00');

describe('decideNextCheck (mandatory cases)', () => {
  it.each([
    ['BONO 14/10 20:00 with last draw 13/10 → upToDate at 21:15',
      'BONO', '2026-10-14T20:00', state([numbersDraw('BONO', '2026-10-13')], BONO_NEXT_14),
      { at: at('2026-10-14T21:15'), phase: 'upToDate', fetchResults: true, fetchUpcoming: false }],
    ['BONO 14/10 21:20 without the 14/10 draw → awaitingResult, 5 min',
      'BONO', '2026-10-14T21:20', state([numbersDraw('BONO', '2026-10-13')], BONO_NEXT_14),
      { at: at('2026-10-14T21:25'), phase: 'awaitingResult', fetchResults: true, fetchUpcoming: false }],
    ['BONO 14/10 21:40 with the 14/10 draw and next 14/10 → upToDate, fetchUpcoming now',
      'BONO', '2026-10-14T21:40',
      state([numbersDraw('BONO', '2026-10-13'), numbersDraw('BONO', '2026-10-14')], BONO_NEXT_14),
      { at: at('2026-10-14T21:40'), phase: 'upToDate', fetchResults: false, fetchUpcoming: true }],
    ['BONO 15/10 01:00 without the 14/10 result → 30 min',
      'BONO', '2026-10-15T01:00', state([numbersDraw('BONO', '2026-10-13')], BONO_NEXT_14),
      { at: at('2026-10-15T01:30'), phase: 'awaitingResult', fetchResults: true, fetchUpcoming: false }],
    ['LAQU open jornada with a match at 21:00 and now 21:30 → provisional, 5 min',
      'LAQU', '2026-10-14T21:30',
      state([openJornada('2026-10-14', ['2026-10-14T19:00:00', '2026-10-14T21:00:00'])], LAQU_NEXT),
      { at: at('2026-10-14T21:35'), phase: 'provisional', fetchResults: true, fetchUpcoming: false }],
    ['LAQU open jornada, last match 21:00, now 23:30 → provisional, 5 min',
      'LAQU', '2026-10-14T23:30',
      state([openJornada('2026-10-14', ['2026-10-14T19:00:00', '2026-10-14T21:00:00'])], LAQU_NEXT),
      { at: at('2026-10-14T23:35'), phase: 'provisional', fetchResults: true, fetchUpcoming: false }],
    ['ELGR up to date on Monday with next on Sunday → 6 h',
      'ELGR', '2026-10-12T10:00', state([numbersDraw('ELGR', '2026-10-11')], next('ELGR', '2026-10-18')),
      { at: at('2026-10-12T16:00'), phase: 'upToDate', fetchResults: true, fetchUpcoming: false }],
    ['errorCount 3 → 5 min',
      'BONO', '2026-10-14T20:00', state([numbersDraw('BONO', '2026-10-13')], BONO_NEXT_14, 3),
      { at: at('2026-10-14T20:05'), phase: 'upToDate', fetchResults: true, fetchUpcoming: false }],
  ] as const)('%s', (_, gameId, now, gameState, expected) => {
    expect(decide(gameId, now, gameState)).toEqual(expected);
  });
});

describe('decideNextCheck (edges)', () => {
  it.each([
    [1, '20:01'], [2, '20:02'], [4, '20:10'], [5, '20:15'], [9, '20:15'],
  ])('errorCount %i → next round at %s', (errorCount, time) => {
    const result = decide('BONO', '2026-10-14T20:00', state([], BONO_NEXT_14, errorCount));
    expect(result.at).toEqual(at(`2026-10-14T${time}`));
  });

  it('without any data asks for results and upcoming now', () => {
    expect(decide('BONO', '2026-10-14T20:00', state([], null))).toEqual({
      at: at('2026-10-14T20:00'), phase: 'upToDate', fetchResults: true, fetchUpcoming: true,
    });
  });

  it('with draws but no upcoming draw asks only for upcoming now', () => {
    expect(decide('BONO', '2026-10-14T20:00', state([numbersDraw('BONO', '2026-10-13')], null)))
      .toMatchObject({ at: at('2026-10-14T20:00'), fetchResults: false, fetchUpcoming: true });
  });

  it('does not treat an open jornada as the arrived result of next', () => {
    const result = decide('LAQU', '2026-10-18T15:00',
      state([openJornada('2026-10-18', ['2026-10-18T14:00:00'])], LAQU_NEXT));
    expect(result).toMatchObject({ phase: 'provisional', fetchUpcoming: false, at: at('2026-10-18T15:05') });
  });

  it('provisional without matches in play waits for the next kickoff + 1h50, at most 60 min', () => {
    const soon = state([openJornada('2026-10-14', ['2026-10-14T18:00:00', '2026-10-14T21:00:00'])], LAQU_NEXT);
    expect(decide('LAQU', '2026-10-14T20:30', soon).at).toEqual(at('2026-10-14T21:30'));
    const later = state([openJornada('2026-10-14', ['2026-10-14T21:00:00'])], LAQU_NEXT);
    expect(decide('LAQU', '2026-10-14T20:00', later).at).toEqual(at('2026-10-14T21:00'));
  });

  it('provisional with unknown kickoffs polls every 5 min', () => {
    const unknown = state([openJornada('2026-10-14', [null, null])], LAQU_NEXT);
    expect(decide('LAQU', '2026-10-14T12:00', unknown).at).toEqual(at('2026-10-14T12:05'));
  });

  it('up to date never waits less than 1 min', () => {
    const result = decide('BONO', '2026-10-14T21:14', state([numbersDraw('BONO', '2026-10-13')], BONO_NEXT_14));
    expect(result.at).toEqual(at('2026-10-14T21:15'));
    const almost = decideNextCheck({
      now: new Date(2026, 9, 14, 21, 14, 50), game: GAMES.BONO,
      state: state([numbersDraw('BONO', '2026-10-13')], BONO_NEXT_14),
    });
    expect(almost.at).toEqual(new Date(2026, 9, 14, 21, 15, 50));
  });
});

describe('decideNextCheck (football after sales close)', () => {
  const laquState = state([finalJornada('2026-10-18')], LAQU_NEXT_21);

  it('stays up to date between sales close and midnight of the draw date', () => {
    expect(decide('LAQU', '2026-10-20T23:00', laquState)).toEqual({
      at: at('2026-10-21T00:00'), phase: 'upToDate', fetchResults: true, fetchUpcoming: false,
    });
    expect(decide('LAQU', '2026-10-20T21:30', laquState).at).toEqual(at('2026-10-21T00:00'));
    expect(decide('LAQU', '2026-10-20T12:00', laquState).at).toEqual(at('2026-10-20T18:00'));
  });

  it('awaits the jornada from midnight of its date', () => {
    expect(decide('LAQU', '2026-10-21T00:30', laquState)).toEqual({
      at: at('2026-10-21T00:35'), phase: 'awaitingResult', fetchResults: true, fetchUpcoming: false,
    });
  });
});

describe('expectedResultAt', () => {
  it('uses drawAt, then the game results time', () => {
    expect(expectedResultAt(GAMES.BONO, BONO_NEXT_14)).toEqual(at('2026-10-14T21:15'));
    expect(expectedResultAt(GAMES.BONO, { ...BONO_NEXT_14, drawAt: '2026-10-14T20:00:00' }))
      .toEqual(at('2026-10-14T20:00'));
  });

  it('for football uses the later of sales close and midnight of the draw date', () => {
    expect(expectedResultAt(GAMES.LAQU, LAQU_NEXT)).toEqual(at('2026-10-18T00:00'));
    expect(expectedResultAt(GAMES.LAQU, LAQU_NEXT_21)).toEqual(at('2026-10-21T00:00'));
    expect(expectedResultAt(GAMES.QGOL, next('QGOL', '2026-10-18', '2026-10-18T14:00:00')))
      .toEqual(at('2026-10-18T14:00'));
    expect(expectedResultAt(GAMES.QGOL, next('QGOL', '2026-10-18'))).toEqual(at('2026-10-18T00:00'));
  });
});
