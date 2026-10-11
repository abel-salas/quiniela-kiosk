import type { GameCode, LotteryDraw } from '../types';

export const normalizeDraw = (payload: any, game: GameCode): LotteryDraw => {
  switch (game) {
    case 'BONO':
      return {
        id: payload.id ?? `${game}-${payload.fecha ?? 'unknown'}`,
        game,
        date: payload.fecha ?? payload.date ?? '',
        scheduledDate: payload.fecha ?? payload.date ?? '',
        status: payload.estado === 'celebrado' || payload.celebrado ? 'celebrado' : 'pendiente',
        updatedAt: payload.updatedAt ?? new Date().toISOString(),
        numbers: Array.isArray(payload.numeros) ? payload.numeros.map(Number) : [],
        complementario: payload.complementario !== undefined ? Number(payload.complementario) : undefined,
        reintegro: payload.reintegro !== undefined ? Number(payload.reintegro) : undefined,
      };
    case 'ELGR':
      return {
        id: payload.id ?? `${game}-${payload.fecha ?? 'unknown'}`,
        game,
        date: payload.fecha ?? payload.date ?? '',
        scheduledDate: payload.fecha ?? payload.date ?? '',
        status: payload.estado === 'celebrado' || payload.celebrado ? 'celebrado' : 'pendiente',
        updatedAt: payload.updatedAt ?? new Date().toISOString(),
        numbers: Array.isArray(payload.numeros) ? payload.numeros.map(Number) : [],
        reintegro: payload.reintegro !== undefined ? Number(payload.reintegro) : undefined,
        clave: payload.clave ?? payload.clavePremio,
      };
    case 'LAPR':
      return {
        id: payload.id ?? `${game}-${payload.fecha ?? 'unknown'}`,
        game,
        date: payload.fecha ?? payload.date ?? '',
        scheduledDate: payload.fecha ?? payload.date ?? '',
        status: payload.estado === 'celebrado' || payload.celebrado ? 'celebrado' : 'pendiente',
        updatedAt: payload.updatedAt ?? new Date().toISOString(),
        numbers: Array.isArray(payload.numeros) ? payload.numeros.map(Number) : [],
        complementario: payload.complementario !== undefined ? Number(payload.complementario) : undefined,
        reintegro: payload.reintegro !== undefined ? Number(payload.reintegro) : undefined,
        joker: payload.joker !== undefined ? Number(payload.joker) : undefined,
      };
    case 'EMIL':
      return {
        id: payload.id ?? `${game}-${payload.fecha ?? 'unknown'}`,
        game,
        date: payload.fecha ?? payload.date ?? '',
        scheduledDate: payload.fecha ?? payload.date ?? '',
        status: payload.estado === 'celebrado' || payload.celebrado ? 'celebrado' : 'pendiente',
        updatedAt: payload.updatedAt ?? new Date().toISOString(),
        numbers: Array.isArray(payload.numeros) ? payload.numeros.map(Number) : [],
        stars: Array.isArray(payload.estrellas) ? payload.estrellas.map(Number) : [],
      };
    case 'LNAC':
      return {
        id: payload.id ?? `${game}-${payload.fecha ?? 'unknown'}`,
        game,
        date: payload.fecha ?? payload.date ?? '',
        scheduledDate: payload.fecha ?? payload.date ?? '',
        status: payload.estado === 'celebrado' || payload.celebrado ? 'celebrado' : 'pendiente',
        updatedAt: payload.updatedAt ?? new Date().toISOString(),
        primerPremio: payload.primerPremio ?? payload.premio1,
        segundoPremio: payload.segundoPremio ?? payload.premio2,
        reintegros: Array.isArray(payload.reintegros) ? payload.reintegros.map(Number) : [],
      };
    case 'LAQU':
      return {
        id: payload.id ?? `${game}-${payload.fecha ?? 'unknown'}`,
        game,
        date: payload.fecha ?? payload.date ?? '',
        scheduledDate: payload.fecha ?? payload.date ?? '',
        status: payload.estado === 'celebrado' || payload.celebrado ? 'celebrado' : 'pendiente',
        updatedAt: payload.updatedAt ?? new Date().toISOString(),
        jornada: Number(payload.jornada ?? 0),
        fecha: payload.fecha ?? payload.date ?? '',
        signs: Array.isArray(payload.signos) ? payload.signos : [],
        plenoAl15: payload.plenoAl15 ?? payload.pleno,
      };
    default:
      throw new Error(`Game not supported: ${game}`);
  }
};
