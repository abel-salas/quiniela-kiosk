// Constantes de configuración

// En desarrollo usamos proxy, en producción URL directa
const isDev = import.meta.env.DEV;
export const API_BASE_URL = isDev ? '/servicios' : 'https://www.loteriasyapuestas.es/servicios';

export const API_ENDPOINTS = {
  BUSCADOR_SORTEOS: `${API_BASE_URL}/buscadorSorteos`,
  PROXIMOS_V3: `${API_BASE_URL}/proximosv3`,
} as const;

export const CACHE_CONFIG = {
  PREFIX: 'draw:',
  TTL: 5 * 60 * 1000, // 5 minutos
} as const;
