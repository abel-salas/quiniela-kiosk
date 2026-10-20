import type { DrawExtra, NumbersDraw } from '../../../domain/draw';
import { parseCombination } from '../parse/combination';
import { toDateOnly } from '../parse/dates';
import type { RawDraw } from '../raw-types';

export type NumberGameId = 'BONO' | 'LAPR' | 'ELGR' | 'EMIL' | 'EDMS';

interface NumberRule {
  tokenCount: number;
  numberCount: number;
  cKind: 'complementario' | 'sueno' | null;
  rKind: 'reintegro' | 'clave' | null;
  starCount: number;
  addOn: 'joker' | 'millon' | null;
}

export const NUMBER_RULES: Record<NumberGameId, NumberRule> = {
  BONO: { tokenCount: 6, numberCount: 6, cKind: 'complementario', rKind: 'reintegro', starCount: 0, addOn: null },
  LAPR: { tokenCount: 6, numberCount: 6, cKind: 'complementario', rKind: 'reintegro', starCount: 0, addOn: 'joker' },
  ELGR: { tokenCount: 5, numberCount: 5, cKind: null, rKind: 'clave', starCount: 0, addOn: null },
  EMIL: { tokenCount: 7, numberCount: 5, cKind: null, rKind: null, starCount: 2, addOn: 'millon' },
  EDMS: { tokenCount: 6, numberCount: 6, cKind: 'sueno', rKind: null, starCount: 0, addOn: null },
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isRawDraw = (value: unknown): value is RawDraw => isRecord(value);

const normalizeExtraValue = (value: string): string => String(Number(value));

const addNumericExtra = (extras: DrawExtra[], kind: DrawExtra['kind'], value: string | null): void => {
  if (value !== null) extras.push({ kind, values: [normalizeExtraValue(value)] });
};

const readAddOn = (value: unknown): string | null => {
  if (!isRecord(value)) return null;
  const combination = value.combinacion;
  return typeof combination === 'string' && combination.trim() ? combination : null;
};

export const mapNumbersDraw = (value: unknown, gameId: NumberGameId): NumbersDraw | null => {
  if (!isRawDraw(value)) return null;
  const raw = value;
  const rule = NUMBER_RULES[gameId];

  if (raw.game_id !== gameId) return null;
  const drawId = typeof raw.id_sorteo === 'string' ? raw.id_sorteo.trim() : '';
  const date = toDateOnly(raw.fecha_sorteo);
  const combination = parseCombination(raw.combinacion);
  if (!drawId || !date || !combination || combination.tokens.length !== rule.tokenCount) return null;
  if ((combination.c !== null && rule.cKind === null) || (combination.r !== null && rule.rKind === null)) return null;

  const numberTokens = combination.tokens.slice(0, rule.numberCount);
  if (numberTokens.some((token) => !/^\d+$/.test(token))) return null;
  const numbers = numberTokens.map(Number);
  if (numbers.some((number) => !Number.isSafeInteger(number))) return null;

  const extras: DrawExtra[] = [];
  if (rule.starCount > 0) {
    const stars = combination.tokens.slice(rule.numberCount);
    if (stars.length !== rule.starCount || stars.some((token) => !/^\d+$/.test(token))) return null;
    extras.push({ kind: 'estrellas', values: stars.map(normalizeExtraValue) });
  }
  if (rule.cKind) addNumericExtra(extras, rule.cKind, combination.c);
  if (rule.rKind) addNumericExtra(extras, rule.rKind, combination.r);

  if (rule.addOn) {
    const addOn = readAddOn(raw[rule.addOn]);
    if (addOn) extras.push({ kind: rule.addOn, values: [addOn] });
  }

  return { gameId, drawId, date, source: 'selae', kind: 'numbers', numbers, extras };
};
