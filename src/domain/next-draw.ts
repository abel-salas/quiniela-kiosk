import type { GameId } from './games';

export interface NextDraw {
  gameId: GameId;
  date: string;
  drawAt: string | null;
  salesCloseAt: string | null;
  salesOpen: boolean;
  jackpot: number | null;
  addOn: { kind: 'joker' | 'millon'; amount: number } | null;
  jornada: number | null;
  nacionalFirstPrize: number | null;
  nacionalSpecialPrize: number | null;
}
