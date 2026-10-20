import type { ResultGameId } from '../../domain/games';

const SELAE_BASE_URL = 'https://www.loteriasyapuestas.es/servicios/';

/** Domain dates are `aaaa-mm-dd`; SELAE expects `aaaammdd`. */
const toSelaeDate = (date: string): string => date.replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$1$2$3');

export const resultsUrl = (gameId: ResultGameId, from: string, to: string): string => {
  const url = new URL('buscadorSorteos', SELAE_BASE_URL);
  url.search = new URLSearchParams({
    game_id: gameId,
    fechaInicioInclusiva: toSelaeDate(from),
    fechaFinInclusiva: toSelaeDate(to),
    celebrados: 'true',
  }).toString();
  return url.toString();
};

export const nextDrawUrl = (): string => {
  const url = new URL('proximosv3', SELAE_BASE_URL);
  url.search = new URLSearchParams({ game_id: 'TODOS', num: '2' }).toString();
  return url.toString();
};
