import { describe, expect, it } from 'vitest';
import type { ResultGameId } from '../../domain/games';
import { fixtureSnapshot, FIXTURE_NOW as NOW } from '../../test/fixture-board';
import { createInitialSnapshot, withGame } from '../store/snapshot';
import { PENDING_TEXT, selectBoardView } from './results';

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
      dateText: 'miércoles 14/10',
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

  it('skips the open Quiniela jornada and shows the latest finished one', () => {
    const laquCard = view.football[0];
    expect(laquCard).toMatchObject({ header: { dateText: 'Jornada 12ª' }, emptyText: null });
    expect(laquCard.matches).toHaveLength(15);
    expect(laquCard.matches.every((match) => match.sign !== null)).toBe(true);
    expect(laquCard.matches[14]).toMatchObject({ position: 15, highlight: true });
  });

  it('puts the Quinigol result of the latest finished jornada in the sign box', () => {
    const qgolCard = view.football[1];
    expect(qgolCard.header.dateText).toBe('Jornada 13ª');
    expect(qgolCard.matches).toHaveLength(6);
    expect(qgolCard.matches.every((match) => match.detail === null && match.sign !== null)).toBe(true);
  });

  it('shows the pending text without results and when only an open jornada is stored', () => {
    const openOnly = fixtureSnapshot().results.LAQU.draws.filter((draw) => draw.kind === 'football' && draw.status === 'open');
    const snapshot = withGame(withGame(fixtureSnapshot(), 'ELGR', { draws: [] }), 'LAQU', { draws: openOnly });
    const result = selectBoardView(snapshot, NOW);
    expect(result.numbers.find((item) => item.gameId === 'ELGR')).toMatchObject({ emptyText: PENDING_TEXT, lines: [], contentKey: 'empty' });
    expect(result.football[0]).toMatchObject({ emptyText: PENDING_TEXT, matches: [], contentKey: 'empty' });
    expect(card('BONO')?.emptyText).toBeNull();
  });

  it('changes the content key when a new result arrives', () => {
    expect(numbers('BONO')?.contentKey).toContain('2026-10-14');
    expect(view.football[0].contentKey).not.toBe('empty');
  });

  it('builds the upcoming column and the status bar', () => {
    expect(view.upcoming.length).toBeGreaterThan(0);
    expect(view.status.updatedText).toBe('Actualizado 21:45');
    expect(selectBoardView(createInitialSnapshot(), NOW).status.updatedText).toBe('Actualizando…');
  });
});
