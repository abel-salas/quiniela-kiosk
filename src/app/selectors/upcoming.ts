import { GAMES, type GameId } from '../../domain/games';
import type { NextDraw } from '../../domain/next-draw';
import { formatAmount, formatCountdown, formatWeekdayName } from '../format/format';
import { parseLocalIso } from '../refresh/time';
import type { UpcomingTileView } from './types';

export const LNAC_FIRST_PRIZE_LABEL = '1er premio a la serie';
export const LNAC_SPECIAL_PRIZE_LABEL = 'Premio especial al décimo';

const isOnSale = (draw: NextDraw, now: Date): boolean => {
  if (!draw.salesCloseAt) return true;
  const close = parseLocalIso(draw.salesCloseAt);
  return close === null || close > now;
};

interface Prize {
  draw: NextDraw;
  amount: number;
  label: string | null;
}

/** SELAE menu logic: first draw (by date) still on sale with jackpot, special prize or first prize. */
const pickPrize = (draws: NextDraw[], now: Date): Prize | null => {
  for (const draw of draws) {
    if (!draw.salesOpen || !isOnSale(draw, now)) continue;
    if (draw.jackpot !== null && draw.gameId !== 'LNAC') return { draw, amount: draw.jackpot, label: null };
    if (draw.nacionalSpecialPrize !== null) {
      return { draw, amount: draw.nacionalSpecialPrize, label: LNAC_SPECIAL_PRIZE_LABEL };
    }
    if (draw.nacionalFirstPrize !== null) {
      return { draw, amount: draw.nacionalFirstPrize, label: LNAC_FIRST_PRIZE_LABEL };
    }
  }
  return null;
};

/** EuroDreams: first draw on sale; its jackpot or the default monthly amount. */
const pickEuroDreams = (draws: NextDraw[], now: Date): Prize | null => {
  const open = draws.find((draw) => draw.salesOpen && isOnSale(draw, now)) ?? null;
  const amount = open?.jackpot ?? GAMES.EDMS.upcomingDefaultAmount;
  return open && amount !== null ? { draw: open, amount, label: null } : null;
};

const noteFor = (gameId: GameId, prize: Prize | null, shown: NextDraw): string | undefined => {
  if (gameId === 'LNAC') {
    const day = formatWeekdayName((prize?.draw ?? shown).date);
    return prize?.label ? `${day} · ${prize.label}` : day;
  }
  return GAMES[gameId].upcomingNote ?? undefined;
};

const toTile = (shown: NextDraw, draws: NextDraw[], now: Date): UpcomingTileView => {
  const game = GAMES[shown.gameId];
  const byDate = [...draws].sort((a, b) => a.date.localeCompare(b.date));
  const prize = shown.gameId === 'EDMS' ? pickEuroDreams(byDate, now) : pickPrize(byDate, now);
  return {
    key: `${shown.gameId}-${shown.date}`,
    name: game.name,
    logo: game.logo,
    color: game.color,
    amount: prize ? formatAmount(prize.amount) : null,
    note: noteFor(shown.gameId, prize, shown),
    countdown: shown.salesCloseAt ? formatCountdown(now, shown.salesCloseAt) : null,
  };
};

/**
 * One tile per game: its first draw in the list whose sales have not closed.
 * Tiles keep the API order (position of the chosen element).
 */
export const selectUpcomingTiles = (upcoming: NextDraw[], now: Date): UpcomingTileView[] => {
  const chosen = new Map<GameId, NextDraw>();
  for (const draw of upcoming) {
    if (!chosen.has(draw.gameId) && isOnSale(draw, now)) chosen.set(draw.gameId, draw);
  }
  return [...chosen.values()].map((shown) =>
    toTile(shown, upcoming.filter((draw) => draw.gameId === shown.gameId), now),
  );
};
