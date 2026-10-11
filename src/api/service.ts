import { fallbackBoard, GAME_CONFIG } from '../mock/fixtures';
import type { GameCode, LotteryBoardItem, LotteryDraw } from '../types';
import { normalizeDraw } from './adapters';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';
const storagePrefix = 'draw:';

const toDateKey = (date: string) => date.replace(/-/g, '').slice(0, 8);

const readFromCache = (game: GameCode, dateKey: string): LotteryDraw | null => {
  const raw = localStorage.getItem(`${storagePrefix}${game}:${dateKey}`);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed as LotteryDraw;
  } catch {
    return null;
  }
};

const saveToCache = (game: GameCode, dateKey: string, draw: LotteryDraw) => {
  localStorage.setItem(`${storagePrefix}${game}:${dateKey}`, JSON.stringify(draw));
};

const resolveGameDraw = async (game: GameCode): Promise<LotteryDraw> => {
  const today = new Date();
  const dateKey = toDateKey(today.toISOString().slice(0, 10));
  const cached = readFromCache(game, dateKey);

  if (useMock) {
    return fallbackBoard.find((item) => item.game.code === game)?.draw ?? ({} as LotteryDraw);
  }

  if (cached) {
    return cached;
  }

  const response = await fetch(
    `https://www.loteriasyapuestas.es/servicios/buscadorSorteos?game_id=${game}&fechaInicioInclusiva=${dateKey}&fechaFinInclusiva=${dateKey}&celebrados=true`,
    { mode: 'cors' },
  );

  if (!response.ok) {
    throw new Error(`Network error: ${response.status}`);
  }

  const raw = await response.json();
  const row = Array.isArray(raw) ? raw[0] : raw?.resultado ?? raw?.sorteos?.[0] ?? raw;
  const normalized = normalizeDraw(row, game);
  saveToCache(game, dateKey, normalized);

  return normalized;
};

export const fetchBoard = async (): Promise<LotteryBoardItem[]> => {
  if (useMock) {
    return fallbackBoard;
  }

  const items = await Promise.all(
    GAME_CONFIG.map(async (game) => {
      const draw = await resolveGameDraw(game.code);
      return { game, draw };
    }),
  );

  return items;
};

export const getLastUpdated = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
