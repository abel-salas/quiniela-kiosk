import { useEffect, useMemo, useState } from 'react';
import { fetchBoard, getLastUpdated } from '../services/lottery/LotteryService';
import { fallbackBoard } from '../config/gameConfig';
import type { LotteryBoardItem } from '../types/lottery';

export const useLotteryBoard = () => {
  const [items, setItems] = useState<LotteryBoardItem[]>(fallbackBoard);
  const [updatedAt, setUpdatedAt] = useState(getLastUpdated());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const next = await fetchBoard();
        setItems((prev) => (next.length > 0 ? next : prev));
      } catch {
        setItems((prev) => prev);
      } finally {
        setUpdatedAt(getLastUpdated());
        setLoading(false);
      }
    };

    load();
    const interval = window.setInterval(load, 60000);
    return () => window.clearInterval(interval);
  }, []);

  const board = useMemo(() => items, [items]);

  return { board, updatedAt, loading };
};
