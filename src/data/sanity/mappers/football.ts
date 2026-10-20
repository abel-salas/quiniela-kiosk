import type { FootballDraw, Match } from '../../../domain/draw';
import { isRecord, optionalText, toSpainLocalIso } from '../parse';
import type { RawSanityDraw } from '../raw-types';
import type { DrawIdentity } from './numbers';

export type SanityFootballGame = 'LAQU' | 'QGOL';

const MATCH_COUNT: Record<SanityFootballGame, number> = { LAQU: 15, QGOL: 6 };

const mapMatch = (value: unknown, index: number): Match | null => {
  if (!isRecord(value)) return null;

  const home = optionalText(value.home);
  const away = optionalText(value.away);
  const score = optionalText(value.score);
  const sign = optionalText(value.sign);
  const hasKickoff = value.kickoff !== null && value.kickoff !== undefined;
  const kickoff = hasKickoff ? toSpainLocalIso(value.kickoff) : null;
  if (!home || !away || score === undefined || sign === undefined) return null;
  if (hasKickoff && kickoff === null) return null;

  return {
    position: index + 1,
    home,
    away,
    kickoff,
    score: score === null ? null : score.replace(/\s+/g, ''),
    sign,
  };
};

export const mapSanityFootballDraw = (
  raw: RawSanityDraw,
  identity: DrawIdentity<SanityFootballGame>,
): FootballDraw | null => {
  const { jornada, finalizada, matches } = raw;
  if (typeof jornada !== 'number' || !Number.isSafeInteger(jornada) || jornada <= 0) return null;
  if (finalizada !== undefined && finalizada !== null && typeof finalizada !== 'boolean') return null;
  if (!Array.isArray(matches) || matches.length !== MATCH_COUNT[identity.gameId]) return null;

  const mapped = matches.map(mapMatch);
  if (mapped.some((match) => match === null)) return null;

  return {
    ...identity,
    source: 'sanity',
    kind: 'football',
    jornada,
    status: finalizada === true ? 'final' : 'open',
    matches: mapped.filter((match): match is Match => match !== null),
  };
};
