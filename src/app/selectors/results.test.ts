import { describe, expect, it } from 'vitest';
import type { ResultGameId } from '../../domain/games';
import bono from '../../data/selae/__fixtures__/BONO.results.json';
import edms from '../../data/selae/__fixtures__/EDMS.results.json';
import elgr from '../../data/selae/__fixtures__/ELGR.results.json';
import emil from '../../data/selae/__fixtures__/EMIL.results.json';
import lapr from '../../data/selae/__fixtures__/LAPR.results.json';
import laqu from '../../data/selae/__fixtures__/LAQU.results.json';
import qgol from '../../data/selae/__fixtures__/QGOL.results.json';
import todos from '../../data/selae/__fixtures__/TODOS.next.json';
import { mapUpcoming } from '../../data/selae/mappers/next-draw';
import { mapResults } from '../../data/selae/mappers/results';
import { createInitialSnapshot, RESULT_GAMES, withGame } from '../store/snapshot';
import type { BoardSnapshot } from '../store/types';
import { AWAITING_BADGE, PENDING_TEXT, PROVISIONAL_BADGE, selectBoardView } from './results';

const RAW: Record<ResultGameId, unknown> = { BONO: bono, EDMS: edms, ELGR: elgr, LAPR: lapr, EMIL: emil, LAQU: laqu, QGOL: qgol };
const NOW = new Date(2026, 9, 14, 22, 0);

const fixtureSnapshot = (): BoardSnapshot => {
  const base = { ...createInitialSnapshot(), upcoming: mapUpcoming(todos), lastUpdatedAt: '2026-10-14T21:45:10' };
  return RESULT_GAMES.reduce<BoardSnapshot>(
    (snapshot, id) => withGame(snapshot, id, { draws: mapResults(RAW[id], id) }), base);
};

const view = selectBoardView(fixtureSnapshot(), NOW);
const card = (id: ResultGameId) => [...view.numbers, ...view.football].find((item) => item.gameId === id);
const numbers = (id: ResultGameId) => view.numbers.find((item) => item.gameId === id);

describe('selectBoardView', () => {
  it('orders the cards by column and stacks the current week', () => {
    expect(view.numbers.map((item) => item.gameId)).toEqual(['BONO', 'EDMS', 'ELGR', 'LAPR', 'EMIL']);
    expect(view.football.map((item) => item.gameId)).toEqual(['LAQU', 'QGOL']);
    expect(view.numbers.map((item) => item.lines.length)).toEqual([3, 2, 1, 3, 2]);
  });

  it('formats a Bonoloto line with padded balls and plain extras', () => {
    expect(numbers('BONO')?.lines[2]).toMatchObject({
      dateText: 'mié 14/10',
      balls: ['08', '11', '21', '41', '47', '48'],
      color: '#7a8634',
      extras: [
        { label: 'C', value: '34', variant: 'soft' },
        { label: 'R', value: '4', variant: 'solid' },
      ],
      addOn: null,
    });
    expect(numbers('BONO')?.header).toEqual({ name: 'Bonoloto', logo: 'BONO.svg', color: '#7a8634' });
  });

  it('shows Joker, stars, Millón, clave and sueño', () => {
    expect(numbers('LAPR')?.lines[2].addOn).toEqual({ logo: 'JOKER.svg', value: '4 781 884' });
    expect(numbers('EMIL')?.lines[1]).toMatchObject({
      balls: ['21', '23', '39', '44', '49'],
      extras: [{ label: '★', value: '04' }, { label: '★', value: '11' }],
      addOn: { logo: 'MILLON.svg', value: 'GRF94523' },
    });
    expect(numbers('ELGR')?.lines[0].extras).toEqual([{ label: 'Nº clave', value: '4', color: '#dc3f47', variant: 'solid' }]);
    expect(numbers('EDMS')?.lines[1].extras[0]).toMatchObject({ label: 'SUEÑO', value: '2' });
  });

  it('shows the latest open Quiniela jornada as provisional', () => {
    const laquCard = view.football[0];
    expect(laquCard).toMatchObject({ header: { dateText: 'Jornada 13ª' }, badge: PROVISIONAL_BADGE, emptyText: null });
    expect(laquCard.matches).toHaveLength(15);
    expect(laquCard.matches[0]).toMatchObject({ home: 'Villarreal (M)', away: 'Nápoles (M)', detail: '3-1', sign: '1' });
    expect(laquCard.matches[14]).toMatchObject({ position: 15, detail: 'mié 21:00', sign: null, highlight: true });
  });

  it('puts the Quinigol result in the sign box', () => {
    const qgolCard = view.football[1];
    expect(qgolCard.header.dateText).toBe('Jornada 14ª');
    expect(qgolCard.matches).toHaveLength(6);
    expect(qgolCard.matches[0]).toMatchObject({ detail: null, sign: 'M-1', highlight: false });
    expect(qgolCard.matches[5]).toMatchObject({ detail: 'mié 21:00', sign: null });
  });

  it('shows pending and awaiting states', () => {
    const snapshot = withGame(withGame(fixtureSnapshot(), 'ELGR', { draws: [] }), 'BONO', { phase: 'awaitingResult' });
    const result = selectBoardView(snapshot, NOW);
    expect(result.numbers.find((item) => item.gameId === 'ELGR')).toMatchObject({ emptyText: PENDING_TEXT, lines: [], contentKey: 'empty' });
    expect(result.numbers.find((item) => item.gameId === 'BONO')?.badge).toBe(AWAITING_BADGE);
    expect(card('BONO')?.badge).toBeNull();
  });

  it('changes the content key when a new result arrives', () => {
    expect(numbers('BONO')?.contentKey).toContain('2026-10-14');
    expect(view.football[0].contentKey).toContain('open');
  });

  it('builds the upcoming column and the status bar', () => {
    expect(view.upcoming.length).toBeGreaterThan(0);
    expect(view.status.updatedText).toBe('Actualizado 21:45');
    expect(selectBoardView(createInitialSnapshot(), NOW).status.updatedText).toBe('Actualizando…');
  });
});
