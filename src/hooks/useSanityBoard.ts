import { useEffect, useMemo, useState } from 'react';
import { fetchAllLotteryDraws } from '../sanity/queries';
import { GAME_CONFIG } from '../config/gameConfig';
import type { LotteryBoardItem } from '../types/lottery';
import type { SanityLotteryDraw } from '../types/sanity';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

const sanityToLotteryDraw = (sanityDraw: SanityLotteryDraw) => {
  // Mapear _id de Sanity a id del tipo LotteryDraw
  return {
    ...sanityDraw,
    id: sanityDraw._id,
  } as any;
};

export const useSanityBoard = () => {
  const [items, setItems] = useState<LotteryBoardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (useMock) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const sanityDraws = await fetchAllLotteryDraws();

        // Agrupar por juego y obtener el más reciente de cada uno
        const drawMap = new Map<string, SanityLotteryDraw>();

        sanityDraws.forEach((draw) => {
          const existing = drawMap.get(draw.game);
          if (!existing || new Date(draw.date) > new Date(existing.date)) {
            drawMap.set(draw.game, draw);
          }
        });

        // Convertir a LotteryBoardItem
        const boardItems: LotteryBoardItem[] = GAME_CONFIG
          .map((game) => {
            const sanityDraw = drawMap.get(game.code);
            if (!sanityDraw) return null;

            return {
              game,
              draw: sanityToLotteryDraw(sanityDraw),
            };
          })
          .filter((item): item is LotteryBoardItem => item !== null);

        setItems(boardItems);
      } catch (err) {
        console.error('Error loading Sanity data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const board = useMemo(() => items, [items]);

  return { board, loading, error };
};
