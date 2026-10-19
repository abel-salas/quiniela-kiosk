import { GAME_CONFIG } from '../../config/gameConfig';
import type { GameCode, UpcomingDraw } from '../../types/lottery';
import { HttpClient } from '../http/HttpClient';
import { API_ENDPOINTS } from '../../config/constants';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

const normalizeUpcomingDraw = (raw: any, game: GameCode): UpcomingDraw => {
  return {
    fecha: raw.fecha || '',
    dia_semana: raw.dia_semana || '',
    id_sorteo: raw.id_sorteo || '',
    game_id: raw.game_id || game,
    apertura: raw.apertura || '',
    cierre: raw.cierre || '',
    anyo: raw.anyo || '',
    premio_bote: raw.premio_bote ? Number(raw.premio_bote) : null,
    destacar_bote: raw.destacar_bote || '0',
    cdc: raw.cdc || '',
    recaudacion: raw.recaudacion ? Number(raw.recaudacion) : null,
    estado: raw.estado === 'abierto' ? 'abierto' : 'cerrado',
    joker: raw.joker ? {
      gameid: raw.joker.gameid || '',
      relsorteoid_asociado: raw.joker.relsorteoid_asociado || '',
      bote_joker: raw.joker.bote_joker ? Number(raw.joker.bote_joker) : 0,
      activo: raw.joker.activo || '0',
    } : undefined,
  };
};

export const fetchUpcomingDraws = async (gameCode?: GameCode): Promise<UpcomingDraw[]> => {
  if (useMock) {
    return [];
  }

  const games = gameCode ? GAME_CONFIG.filter(g => g.code === gameCode) : GAME_CONFIG;

  try {
    const results = await Promise.all(
      games.map(async (game) => {
        const url = `${API_ENDPOINTS.PROXIMOS_V3}?game_id=${game.code}&num=2`;
        const raw = await HttpClient.get(url);
        const rows: unknown[] = Array.isArray(raw) ? raw : [];

        return rows
          .map((row: any) => normalizeUpcomingDraw(row, game.code))
          .filter((draw) => draw.estado === 'abierto');
      })
    );

    return results.flat();
  } catch (error) {
    console.error('Error fetching upcoming draws:', error);
    return [];
  }
};

export const formatBote = (bote: number | null): string => {
  if (bote === null || bote === 0) return '—';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(bote);
};

export const formatDateTime = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};
