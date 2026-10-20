import type { DrawExtra, ExtraKind, FootballDraw, NumbersDraw } from '../../domain/draw';
import { GAMES } from '../../domain/games';
import { formatBall, formatJoker, formatKickoff, formatLineDate } from '../format/format';
import type { DrawLineView, ExtraBallView, MatchRowView } from './types';

const EXTRA_LABELS: Record<Exclude<ExtraKind, 'joker' | 'millon'>, { label: string; variant: 'solid' | 'soft' }> = {
  estrellas: { label: '★', variant: 'solid' },
  complementario: { label: 'C', variant: 'soft' },
  reintegro: { label: 'R', variant: 'solid' },
  clave: { label: 'Nº clave', variant: 'solid' },
  sueno: { label: 'SUEÑO', variant: 'solid' },
};

const extraBalls = (extra: DrawExtra, color: string): ExtraBallView[] => {
  if (extra.kind === 'joker' || extra.kind === 'millon') return [];
  const { label, variant } = EXTRA_LABELS[extra.kind];
  // Stars are padded like the combination; the other extras are shown without padding.
  return extra.values.map((value) => ({
    label,
    value: extra.kind === 'estrellas' ? formatBall(Number(value)) : value,
    color,
    variant,
  }));
};

const addOnOf = (draw: NumbersDraw): DrawLineView['addOn'] => {
  const joker = draw.extras.find((extra) => extra.kind === 'joker')?.values[0];
  if (joker) return { logo: 'JOKER.svg', value: formatJoker(joker) };
  const millon = draw.extras.find((extra) => extra.kind === 'millon')?.values[0];
  return millon ? { logo: 'MILLON.svg', value: millon } : null;
};

export const toDrawLine = (draw: NumbersDraw): DrawLineView => {
  const { color } = GAMES[draw.gameId];
  return {
    key: `${draw.date}-${draw.drawId}`,
    dateText: formatLineDate(draw.date),
    balls: draw.numbers.map(formatBall),
    color,
    extras: draw.extras.flatMap((extra) => extraBalls(extra, color)),
    addOn: addOnOf(draw),
  };
};

/**
 * La Quiniela: detail = score, or the kickoff when not played; sign in the box.
 * El Quinigol: the result is the sign itself, so the detail only shows a partial score or the kickoff.
 */
export const toMatchRows = (draw: FootballDraw): MatchRowView[] => {
  const { color } = GAMES[draw.gameId];
  return draw.matches.map((match) => {
    const kickoff = match.kickoff ? formatKickoff(match.kickoff) : null;
    const detail = draw.gameId === 'QGOL' && match.sign !== null ? null : match.score ?? kickoff;
    return {
      position: match.position,
      home: match.home,
      away: match.away,
      detail,
      sign: match.sign,
      color,
      highlight: draw.gameId === 'LAQU' && match.position === 15,
    };
  });
};
