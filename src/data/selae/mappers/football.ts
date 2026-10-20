import type { FootballDraw, Match } from '../../../domain/draw';
import { cleanTeamName } from '../parse/text';
import { toDateOnly, toLocalIso } from '../parse/dates';
import type { RawDraw, RawMatch } from '../raw-types';

export type FootballGameId = 'LAQU' | 'QGOL';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isRawDraw = (value: unknown): value is RawDraw => isRecord(value);
const isRawMatch = (value: unknown): value is RawMatch => isRecord(value);

const parsePositiveInteger = (value: unknown): number | null => {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && !value.trim()) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
};

const optionalText = (value: unknown, removeWhitespace = false): string | null | undefined => {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') return undefined;
  const text = removeWhitespace ? value.replace(/\s+/g, '') : value.trim();
  return text || null;
};

const mapMatch = (value: unknown): Match | null => {
  if (!isRawMatch(value)) return null;

  const position = parsePositiveInteger(value.posicion);
  const home = cleanTeamName(value.local);
  const away = cleanTeamName(value.visitante);
  const score = optionalText(value.marcador, true);
  const sign = optionalText(value.signo);
  if (position === null || !home || !away || score === undefined || sign === undefined) return null;

  return {
    position,
    home,
    away,
    kickoff: toLocalIso(value.fecha_completa),
    score,
    sign,
  };
};

export const mapFootballDraw = (value: unknown, gameId: FootballGameId): FootballDraw | null => {
  if (!isRawDraw(value) || value.game_id !== gameId) return null;

  const drawId = typeof value.id_sorteo === 'string' ? value.id_sorteo.trim() : '';
  const date = toDateOnly(value.fecha_sorteo);
  const jornada = parsePositiveInteger(value.jornada);
  if (
    !drawId
    || !date
    || jornada === null
    || (value.combinacion !== null && typeof value.combinacion !== 'string')
    || !Array.isArray(value.partidos)
  ) {
    return null;
  }

  const matches = value.partidos.map(mapMatch);
  if (matches.some((match) => match === null)) return null;

  return {
    gameId,
    drawId,
    date,
    source: 'selae',
    kind: 'football',
    jornada,
    status: value.combinacion === null ? 'open' : 'final',
    matches: matches.filter((match): match is Match => match !== null),
  };
};
