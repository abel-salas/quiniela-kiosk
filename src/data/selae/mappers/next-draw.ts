import { GAMES, type GameId } from '../../../domain/games';
import type { NextDraw } from '../../../domain/next-draw';
import { parseEuros } from '../parse/amounts';
import { toDateOnly, toLocalIso } from '../parse/dates';
import type { RawNextDraw } from '../raw-types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isRawNextDraw = (value: unknown): value is RawNextDraw => isRecord(value);

const isGameId = (value: unknown): value is GameId =>
  typeof value === 'string' && Object.prototype.hasOwnProperty.call(GAMES, value);

const parseJornada = (value: unknown): number | null => {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && !value.trim()) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
};

const readAddOnAmount = (value: unknown, field: 'bote_joker' | 'importe'): number | null => {
  if (!isRecord(value) || value.activo !== '1') return null;
  return parseEuros(value[field]);
};

const mapAddOn = (raw: RawNextDraw): NextDraw['addOn'] => {
  const joker = readAddOnAmount(raw.joker, 'bote_joker');
  if (joker !== null) return { kind: 'joker', amount: joker };
  const millon = readAddOnAmount(raw.millon, 'importe');
  if (millon !== null) return { kind: 'millon', amount: millon };
  return null;
};

export const mapNextDraw = (value: unknown): NextDraw | null => {
  if (!isRawNextDraw(value) || !isGameId(value.game_id)) return null;

  const gameId = value.game_id;
  const date = toDateOnly(value.fecha);
  if (!date) return null;
  const isNacional = gameId === 'LNAC';

  return {
    gameId,
    date,
    drawAt: toLocalIso(value.fecha),
    salesCloseAt: toLocalIso(value.cierre),
    salesOpen: value.estado === 'abierto',
    jackpot: parseEuros(value.premio_bote),
    addOn: mapAddOn(value),
    jornada: parseJornada(value.jornada),
    nacionalFirstPrize: isNacional ? parseEuros(value.primer_premio) : null,
    nacionalSpecialPrize: isNacional ? parseEuros(value.premio_especial) : null,
  };
};

export const mapUpcoming = (value: unknown): NextDraw[] => {
  if (!Array.isArray(value)) return [];
  return value.map(mapNextDraw).filter((draw): draw is NextDraw => draw !== null);
};
