// TEMPORAL: prueba de acceso a los HTML oficiales de SELAE desde Vercel. Borrar tras la prueba.
const BASE = 'https://www.loteriasyapuestas.es/f/loterias/resultados/';

const PAGES: Record<string, string> = {
  EMIL: 'euromillones.html',
  LAPR: 'primitiva.html',
  BONO: 'bonoloto.html',
  ELGR: 'gordo.html',
  EDMS: 'eurodreams.html',
  LAQU: 'quiniela.html',
  QGOL: 'quinigol.html',
};

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'es-ES,es;q=0.9',
};

const SHOWN_HEADERS = ['content-type', 'content-length', 'cache-control', 'server', 'server-timing', 'x-cache'];

const yesterdayInSpain = (): string => {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date(Date.now() - 864e5));
  return parts.replace(/-/g, '');
};

const probe = async (game: string, date: string, withHeaders: boolean, full: boolean) => {
  const url = `${BASE}${PAGES[game]}?game_id=${game}&fecha_sorteo=${date}`;
  const started = Date.now();
  try {
    const response = await fetch(url, {
      headers: withHeaders ? BROWSER_HEADERS : undefined,
      signal: AbortSignal.timeout(8000),
    });
    const body = await response.text();
    return {
      game,
      url,
      status: response.status,
      ms: Date.now() - started,
      headers: Object.fromEntries(SHOWN_HEADERS.map((name) => [name, response.headers.get(name)])),
      bodyLength: body.length,
      accessDenied: body.includes('Access Denied'),
      body: full ? body : body.slice(0, 600),
    };
  } catch (error) {
    return { game, url, error: error instanceof Error ? error.message : String(error) };
  }
};

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const date = /^\d{8}$/.test(params.get('date') ?? '') ? (params.get('date') as string) : yesterdayInSpain();
  const withHeaders = params.get('headers') !== 'none';
  const only = params.get('game');
  const full = params.get('full') === '1' && only !== null;
  const games = only && only in PAGES ? [only] : Object.keys(PAGES);

  const results = await Promise.all(games.map((game) => probe(game, date, withHeaders, full)));
  return Response.json({ date, withHeaders, results });
}
