import type { FootballDraw, NumbersDraw } from '../../domain/draw';
import { GAMES, RESULT_COLUMNS, type ResultGameId } from '../../domain/games';
import { formatTime } from '../format/format';
import type { BoardSnapshot, GameState } from '../store/types';
import { toDrawLine, toMatchRows } from './lines';
import type { BoardView, FootballCardView, GameHeaderView, NumbersCardView } from './types';
import { selectUpcomingTiles } from './upcoming';
import { selectWeekDraws } from './week';

export const PENDING_TEXT = 'Pendiente de resultado';
export const AWAITING_BADGE = 'Resultado de hoy pendiente';
export const PROVISIONAL_BADGE = 'PROVISIONAL';
export const LEGAL_NOTICE = 'Resultados informativos; compruebe su boleto con los resultados oficiales';

const headerOf = (gameId: ResultGameId, dateText?: string): GameHeaderView => {
  const { name, logo, color } = GAMES[gameId];
  return dateText === undefined ? { name, logo, color } : { name, logo, color, dateText };
};

const isNumbers = (draw: { kind: string }): draw is NumbersDraw => draw.kind === 'numbers';
const isFootball = (draw: { kind: string }): draw is FootballDraw => draw.kind === 'football';

const numbersCard = (gameId: ResultGameId, state: GameState): NumbersCardView => {
  const lines = selectWeekDraws(state.draws).filter(isNumbers).map(toDrawLine);
  return {
    kind: 'numbers',
    gameId,
    header: headerOf(gameId),
    badge: state.phase === 'awaitingResult' ? AWAITING_BADGE : null,
    emptyText: lines.length === 0 ? PENDING_TEXT : null,
    contentKey: lines.length === 0 ? 'empty' : lines[lines.length - 1].key,
    lines,
  };
};

const footballCard = (gameId: ResultGameId, state: GameState): FootballCardView => {
  const jornada = selectWeekDraws(state.draws).filter(isFootball)[0] ?? null;
  const awaiting = state.phase === 'awaitingResult' ? AWAITING_BADGE : null;
  return {
    kind: 'football',
    gameId,
    header: headerOf(gameId, jornada ? `Jornada ${jornada.jornada}ª` : undefined),
    badge: jornada?.status === 'open' ? PROVISIONAL_BADGE : awaiting,
    emptyText: jornada ? null : PENDING_TEXT,
    contentKey: jornada ? `${jornada.drawId}-${jornada.status}` : 'empty',
    matches: jornada ? toMatchRows(jornada) : [],
  };
};

export const selectBoardView = (snapshot: BoardSnapshot, now: Date): BoardView => ({
  numbers: RESULT_COLUMNS.numbers.map((id) => numbersCard(id, snapshot.results[id])),
  football: RESULT_COLUMNS.football.map((id) => footballCard(id, snapshot.results[id])),
  upcoming: selectUpcomingTiles(snapshot.upcoming, now),
  status: {
    updatedText: snapshot.lastUpdatedAt ? `Actualizado ${formatTime(snapshot.lastUpdatedAt)}` : 'Actualizando…',
    notice: LEGAL_NOTICE,
  },
});
