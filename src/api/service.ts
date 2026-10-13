import { fallbackBoard, GAME_CONFIG } from '../mock/fixtures';
import type { GameCode, LotteryBoardItem, LotteryDraw } from '../types';
import { normalizeDraw } from './adapters';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';
const storagePrefix = 'draw:';

const toDateKey = (date: string) => date.replace(/-/g, '').slice(0, 8);

const toApiDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

const getDailyWindow = (daysBack = 7) => {
  const end = new Date();
  end.setHours(0, 0, 0, 0);

  const start = new Date(end);
  start.setDate(end.getDate() - daysBack);

  return {
    start: toApiDate(start),
    end: toApiDate(end),
  };
};

const getGordoWindow = (daysBack = 15) => {
  const end = new Date();
  end.setHours(0, 0, 0, 0);

  const start = new Date(end);
  start.setDate(end.getDate() - daysBack);

  return {
    start: toApiDate(start),
    end: toApiDate(end),
  };
};

const getFridayOffset = (date: Date) => {
  const day = date.getDay();
  return (day + 2) % 7;
};

const getQuinielaWindow = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const friday = new Date(today);
  friday.setDate(today.getDate() - getFridayOffset(today));

  const nextFriday = new Date(friday);
  nextFriday.setDate(friday.getDate() + 7);

  return {
    start: toApiDate(friday),
    end: toApiDate(nextFriday),
  };
};

const getLatestRow = (raw: unknown): any => {
  const rows = Array.isArray(raw) ? raw : [];

  if (rows.length === 0) {
    return null;
  }

  return [...rows].sort((left: any, right: any) => {
    const leftDate = new Date(left?.fecha_sorteo ?? left?.fecha ?? left?.date ?? '1970-01-01').getTime();
    const rightDate = new Date(right?.fecha_sorteo ?? right?.fecha ?? right?.date ?? '1970-01-01').getTime();
    return rightDate - leftDate;
  })[0] ?? rows[0];
};

const getCacheKey = (game: GameCode, range: { start: string; end: string }) => `${storagePrefix}${game}:${range.start}:${range.end}`;

const readFromCache = (game: GameCode, range: { start: string; end: string }): LotteryDraw[] => {
  const raw = localStorage.getItem(getCacheKey(game, range));
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((draw) => isUsableDraw(draw, game));
    }

    return isUsableDraw(parsed, game) ? [parsed] : [];
  } catch {
    return [];
  }
};

const saveToCache = (game: GameCode, range: { start: string; end: string }, draws: LotteryDraw[]) => {
  if (!Array.isArray(draws) || draws.length === 0) {
    return;
  }

  const valid = draws.filter((draw) => isUsableDraw(draw, game));
  if (valid.length === 0) {
    return;
  }

  localStorage.setItem(getCacheKey(game, range), JSON.stringify(valid));
};

const isUsableDraw = (draw: Partial<LotteryDraw> | null | undefined, game: GameCode) => {
  if (!draw) return false;

  if (game !== 'LAQU') {
    return Object.keys(draw).length > 0;
  }

  const qdraw = draw as any;
  return Boolean(
    (Array.isArray(qdraw.matches) && qdraw.matches.length > 0)
    || (Array.isArray(qdraw.signs) && qdraw.signs.length > 0)
    || Number(qdraw.jornada ?? 0) > 0
    || qdraw.plenoAl15
    || qdraw.fecha,
  );
};

const readLatestAvailableDraw = (game: GameCode): LotteryDraw | null => {
  const prefix = `${storagePrefix}${game}:`;
  const matches: Array<{ dateKey: string; draw: LotteryDraw }> = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key || !key.startsWith(prefix)) continue;

    const raw = localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      const candidates = Array.isArray(parsed) ? parsed : [parsed];

      for (const candidate of candidates) {
        if (!isUsableDraw(candidate, game)) continue;
        const dateKey = key.slice(prefix.length);
        matches.push({ dateKey, draw: candidate });
      }
    } catch {
      // Ignore invalid saved entries.
    }
  }

  matches.sort((a, b) => (b.dateKey > a.dateKey ? 1 : -1));
  return matches[0]?.draw ?? null;
};

const getPreviousValidDraw = (game: GameCode): LotteryDraw | null => {
  return readLatestAvailableDraw(game) ?? (useMock
    ? fallbackBoard.find((item) => item.game.code === game)?.draw ?? null
    : null);
};

const inflightRequests = new Map<GameCode, Promise<LotteryDraw | null>>();

const resolveGameHistory = async (game: GameCode): Promise<LotteryDraw[]> => {
  const range = game === 'LAQU'
    ? getQuinielaWindow()
    : game === 'ELGR'
      ? getGordoWindow()
      : getDailyWindow(7);

  const cached = readFromCache(game, range);

  if (useMock) {
    return fallbackBoard
      .filter((item) => item.game.code === game)
      .map((item) => item.draw);
  }

  if (cached.length > 0) {
    return cached;
  }

  if (inflightRequests.has(game)) {
    const pending = await inflightRequests.get(game);
    return pending ?? [];
  }

  const request = (async () => {
    try {
      const response = await fetch(
        `https://www.loteriasyapuestas.es/servicios/buscadorSorteos?game_id=${game}&fechaInicioInclusiva=${range.start}&fechaFinInclusiva=${range.end}&celebrados=true`,
        { mode: 'cors' },
      );

      if (!response.ok) {
        throw new Error(`Network error: ${response.status}`);
      }

      const raw = await response.json();
      const rows = Array.isArray(raw) ? raw : (raw && typeof raw === 'object' && 'resultado' in raw ? (raw as any).resultado : [])
        ?? (raw && typeof raw === 'object' && 'sorteos' in raw ? (raw as any).sorteos : [])
        ?? [];

      const normalized = rows
        .map((row: any) => normalizeDraw(row, game))
        .filter((draw) => isUsableDraw(draw, game))
        .sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));

      if (normalized.length > 0) {
        saveToCache(game, range, normalized);
      }

      return normalized;
    } catch {
      const previous = getPreviousValidDraw(game);
      return previous ? [previous] : [];
    } finally {
      inflightRequests.delete(game);
    }
  })();

  inflightRequests.set(game, request as any);
  return request;
};

const resolveGameDraw = async (game: GameCode): Promise<LotteryDraw | null> => {
  const history = await resolveGameHistory(game);
  return history[history.length - 1] ?? null;
};

export const fetchBoard = async (): Promise<LotteryBoardItem[]> => {
  if (useMock) {
    return fallbackBoard;
  }

  const items = await Promise.all(
    GAME_CONFIG.map(async (game) => {
      const history = await resolveGameHistory(game.code);
      const draw = history[history.length - 1] ?? null;
      if (!draw) return null;
      return { game, draw, history };
    }),
  );

  return items.filter((item): item is LotteryBoardItem => item !== null);
};

export const getLastUpdated = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
