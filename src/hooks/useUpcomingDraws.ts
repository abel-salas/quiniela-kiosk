import { useState, useEffect } from 'react';
import type { GameCode, UpcomingDraw } from '../types/lottery';
import { fetchUpcomingDraws } from '../services/lottery/UpcomingService';

export const useUpcomingDraws = (gameCode?: GameCode) => {
  const [draws, setDraws] = useState<UpcomingDraw[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDraws = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchUpcomingDraws(gameCode);
        if (isMounted) {
          setDraws(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error loading upcoming draws');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDraws();

    return () => {
      isMounted = false;
    };
  }, [gameCode]);

  return { draws, loading, error };
};
