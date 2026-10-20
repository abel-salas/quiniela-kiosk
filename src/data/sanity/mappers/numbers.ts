import type { DrawExtra, ExtraKind, NumbersDraw } from '../../../domain/draw';
import { isNonNegativeInteger } from '../parse';
import type { RawSanityDraw } from '../raw-types';

export type SanityNumberGame = 'BONO' | 'LAPR' | 'ELGR' | 'EMIL' | 'EDMS';

export interface DrawIdentity<G> {
  gameId: G;
  drawId: string;
  date: string;
}

/** `null` = field absent; `undefined` = present but invalid (the document is discarded). */
type ExtraReader = (value: unknown) => string[] | null | undefined;

interface ExtraRule {
  field: keyof RawSanityDraw;
  kind: ExtraKind;
  read: ExtraReader;
  required?: boolean;
}

const isAbsent = (value: unknown): boolean => value === null || value === undefined;

const integer =
  (max?: number): ExtraReader =>
  (value) => {
    if (isAbsent(value)) return null;
    return isNonNegativeInteger(value) && (max === undefined || value <= max) ? [String(value)] : undefined;
  };

const code =
  (pattern?: RegExp): ExtraReader =>
  (value) => {
    if (isAbsent(value)) return null;
    if (typeof value !== 'string') return undefined;
    const text = value.trim();
    if (!text) return null;
    return !pattern || pattern.test(text) ? [text] : undefined;
  };

const integerList =
  (length: number): ExtraReader =>
  (value) => {
    if (isAbsent(value)) return null;
    return Array.isArray(value) && value.length === length && value.every(isNonNegativeInteger)
      ? value.map(String)
      : undefined;
  };

const COMPLEMENTARIO: ExtraRule = { field: 'complementario', kind: 'complementario', read: integer() };
const REINTEGRO: ExtraRule = { field: 'reintegro', kind: 'reintegro', read: integer(9) };

export const SANITY_NUMBER_RULES: Record<SanityNumberGame, { count: number; extras: ExtraRule[] }> = {
  BONO: { count: 6, extras: [COMPLEMENTARIO, REINTEGRO] },
  LAPR: {
    count: 6,
    extras: [COMPLEMENTARIO, REINTEGRO, { field: 'joker', kind: 'joker', read: code(/^\d{7}$/) }],
  },
  ELGR: { count: 5, extras: [{ field: 'clave', kind: 'clave', read: integer(9) }] },
  EMIL: {
    count: 5,
    extras: [
      { field: 'estrellas', kind: 'estrellas', read: integerList(2), required: true },
      { field: 'millon', kind: 'millon', read: code() },
    ],
  },
  EDMS: { count: 6, extras: [{ field: 'sueno', kind: 'sueno', read: integer() }] },
};

export const mapSanityNumbersDraw = (
  raw: RawSanityDraw,
  identity: DrawIdentity<SanityNumberGame>,
): NumbersDraw | null => {
  const rule = SANITY_NUMBER_RULES[identity.gameId];
  const { numbers } = raw;
  if (!Array.isArray(numbers) || numbers.length !== rule.count || !numbers.every(isNonNegativeInteger)) {
    return null;
  }

  const extras: DrawExtra[] = [];
  for (const extra of rule.extras) {
    const values = extra.read(raw[extra.field]);
    if (values === undefined || (values === null && extra.required)) return null;
    if (values !== null) extras.push({ kind: extra.kind, values });
  }

  return { ...identity, source: 'sanity', kind: 'numbers', numbers: [...numbers], extras };
};
