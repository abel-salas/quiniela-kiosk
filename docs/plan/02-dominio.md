# Dominio

Ficheros en `src/domain/`. Sin dependencias. Importes en euros (`number`). Fechas de calendario `YYYY-MM-DD`; instantes ISO local sin zona (`2026-10-14T21:32:00`), hora peninsular.

## Catálogo (`games.ts`)

```ts
export type GameId = 'LNAC' | 'EMIL' | 'LAPR' | 'BONO' | 'ELGR' | 'LAQU' | 'QGOL' | 'LOTU' | 'EDMS' | 'QUPL';
export type ResultGameId = 'BONO' | 'EDMS' | 'ELGR' | 'LAPR' | 'EMIL' | 'LAQU' | 'QGOL';
export type GameKind = 'numbers' | 'football';

export interface GameInfo {
  id: GameId;
  name: string;                    // nombre visible
  color: string;                   // color de marca (CSS de SELAE)
  logo: string;                    // fichero en ui/assets/logos/
  resultsFromTime: string | null;  // 'HH:mm' desde la que puede haber resultado; null = según partidos
  upcomingNote: string | null;     // texto fijo bajo el importe en próximos sorteos
  upcomingDefaultAmount: number | null; // importe que muestra SELAE cuando no hay premio_bote
}

export const GAMES: Record<GameId, GameInfo>;
export const RESULT_COLUMNS: { numbers: ResultGameId[]; football: ResultGameId[] };
```

| id | name | resultsFromTime | upcomingNote | upcomingDefaultAmount |
|---|---|---|---|---|
| BONO | Bonoloto | 21:15 | — | — |
| EDMS | EuroDreams | 20:55 | "al mes durante 30 años" | 20000 |
| ELGR | El Gordo de la Primitiva | 21:30 | — | — |
| LAPR | La Primitiva | 21:30 | — | — |
| EMIL | Euromillones | 21:00 | — | — |
| LAQU | La Quiniela | null | — | — |
| QGOL | El Quinigol | null | — | — |
| LNAC | Lotería Nacional | — | día del sorteo ("sábado") | — |
| QUPL | Quíntuple Plus | — | — | — |
| LOTU | Lototurf | — | — | — |

- `color` y `logo`: ver [05-ui-sistema.md](05-ui-sistema.md) § Colores y § Logotipos.
- `RESULT_COLUMNS.numbers` = `['BONO', 'EDMS', 'ELGR', 'LAPR', 'EMIL']`; `football` = `['LAQU', 'QGOL']`.
- La columna de próximos sorteos respeta el orden en que llegan de la API; no hay orden propio.
- Los importes de próximos sorteos replican la lógica del menú de la web de SELAE; ver [06-ui-resultados.md](06-ui-resultados.md) § Columna de próximos sorteos.

## Sorteo celebrado (`draw.ts`)

```ts
export type DrawSource = 'selae' | 'sanity';

interface DrawBase {
  gameId: ResultGameId;
  drawId: string;
  date: string;               // YYYY-MM-DD
  source: DrawSource;
}

export type ExtraKind = 'complementario' | 'reintegro' | 'clave' | 'estrellas' | 'joker' | 'millon' | 'sueno';
export interface DrawExtra { kind: ExtraKind; values: string[] }

export interface NumbersDraw extends DrawBase {
  kind: 'numbers';
  numbers: number[];
  extras: DrawExtra[];
}

export interface Match {
  position: number;           // 1..15 en Quiniela (15 = pleno al 15), 1..6 en Quinigol
  home: string;
  away: string;
  kickoff: string | null;
  score: string | null;       // "3-1"
  sign: string | null;        // "1" | "X" | "2" | "1-0" | "M-2"; null si no jugado
}

export interface FootballDraw extends DrawBase {
  kind: 'football';
  jornada: number;
  status: 'open' | 'final';
  matches: Match[];
}

export type Draw = NumbersDraw | FootballDraw;
```

## Próximo sorteo (`next-draw.ts`)

```ts
export interface NextDraw {
  gameId: GameId;
  date: string;                 // YYYY-MM-DD
  drawAt: string | null;        // solo si el proveedor da hora (LNAC)
  salesCloseAt: string | null;  // base de la cuenta atrás
  salesOpen: boolean;           // estado === 'abierto'
  jackpot: number | null;       // premio_bote; null si falta o es 0
  addOn: { kind: 'joker' | 'millon'; amount: number } | null;
  jornada: number | null;
  nacionalFirstPrize: number | null;   // LNAC: primer_premio (por serie)
  nacionalSpecialPrize: number | null; // LNAC: premio_especial (sorteos extraordinarios)
}
```

## Slide (`slide.ts`)

```ts
export interface Slide { id: string; title: string | null; imageUrl: string; order: number }
```

## Repositorios (`repository.ts`)

```ts
export type ProviderErrorKind = 'blocked' | 'network' | 'timeout' | 'invalid';
export class ProviderError extends Error { constructor(public kind: ProviderErrorKind, message: string) }

export interface ResultsRepository {
  getRecentDraws(gameId: ResultGameId, from: string, to: string): Promise<Draw[]>; // asc por date
}
export interface SelaeRepository extends ResultsRepository {
  getUpcoming(): Promise<NextDraw[]>; // todos los juegos, en el orden de la API
}
export interface ManualRepository extends ResultsRepository {
  getForcedGames(): Promise<ResultGameId[]>;
  getSlides(): Promise<Slide[]>;
}
```

- "Sin registros" no es error: `[]` o `null`.
- 403 → `blocked`; fallo de red → `network`; timeout → `timeout`; respuesta no interpretable → `invalid`.
