# Datos: SELAE

Todo en `src/data/`. Contrato del proveedor en [../contexto-apis.md](../contexto-apis.md). Payloads reales en `src/data/selae/__fixtures__/`.

## Peticiones y mappers

Cada petición tiene un mapper `unknown → dominio`. El repositorio solo hace `fetch` + mapper.

| Método del repositorio | URL | Mapper |
|---|---|---|
| `getRecentDraws(id, from, to)` | `buscadorSorteos?game_id={id}&fechaInicioInclusiva={from}&fechaFinInclusiva={to}&celebrados=true` | `mapResults(raw, id): Draw[]` |
| `getUpcoming()` | `proximosv3?game_id=TODOS&num=2` (la misma llamada que hace la web de SELAE) | `mapUpcoming(raw): NextDraw[]` |

Fechas de URL en `aaaammdd`. `endpoints.ts` construye las URLs con `URLSearchParams`. Base: `https://www.loteriasyapuestas.es/servicios/` (sin proxy).

## Ficheros

```
data/http/fetch-json.ts            fetchJson(url, {timeoutMs}) -> unknown; lanza ProviderError
data/selae/endpoints.ts            resultsUrl, nextDrawUrl
data/selae/raw-types.ts            RawDraw, RawNextDraw, RawMatch... (todo opcional)
data/selae/parse/text.ts           cleanText, cleanTeamName, decodeEntities
data/selae/parse/dates.ts          toDateOnly, toLocalIso, toApiDate
data/selae/parse/amounts.ts        parseEuros
data/selae/parse/combination.ts    parseCombination
data/selae/mappers/results.ts      mapResults: valida array, despacha por kind y ordena asc por date
data/selae/mappers/numbers.ts      mapNumbersDraw (tabla NUMBER_RULES)
data/selae/mappers/football.ts     mapFootballDraw
data/selae/mappers/next-draw.ts    mapNextDraw (un elemento) y mapUpcoming (lista)
data/selae/selae-repository.ts     createSelaeRepository(fetcher)
data/selae/fixture-repository.ts   createSelaeFixtureRepository() con import de JSON
```

## Reglas de `fetchJson`

- `fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-cache', credentials: 'omit', signal })`.
- Timeout de 15 s con `AbortController`.
- Status 403 o 406 → `blocked`. Otro status no 2xx → `network`. Cuerpo no JSON → `invalid`.
- No intentar fijar `User-Agent` ni `Referer`: el navegador los prohíbe y ya envía los suyos.

## Reglas de parseo

- `cleanText`: decodifica entidades numéricas (`&#x00ba;` → `º`), sustituye saltos de línea por espacio, colapsa espacios y recorta.
- `cleanTeamName`: `cleanText` + normaliza el sufijo ` (m)` a ` (M)`, como lo muestra la web de SELAE.
- `toDateOnly("2026-10-12 21:43:00")` → `"2026-10-12"`.
- `toLocalIso("2026-10-12 21:43:00")` → `"2026-10-12T21:43:00"`; con hora `00:00:00` → `null`.
- `parseEuros("49000000")` → `49000000`; `"46102,13"` → `46102.13`; `null`, `""`, `"0"`, `0` → `null`.
- `parseCombination(" 21 - 23 - 39 - 44 - 49 - 04 - 11")` → `{ tokens: ['21','23','39','44','49','04','11'], c: null, r: null }`.
- `parseCombination("02 - 05 - 26 - 40 - 42 - 45 C(23) R(9)")` → `{ tokens: ['02',…,'45'], c: '23', r: '9' }`.
- Si la respuesta no es un array (SELAE devuelve el string `"No se ha encontrado ningún registro…"`), el mapper devuelve `[]`/`null`.
- Un elemento que no cumple su regla se descarta (no se lanza error); el resto se mapea.

## Juegos de números (`NUMBER_RULES`)

Usar siempre `combinacion`, nunca `combinacion_acta` (orden de extracción).

| id | `numbers` | `extras` |
|---|---|---|
| BONO | 6 tokens | `c`→complementario, `r`→reintegro |
| LAPR | 6 tokens | `c`→complementario, `r`→reintegro, `joker.combinacion`→joker |
| ELGR | 5 tokens | `r`→clave |
| EMIL | 5 primeros tokens | 2 últimos tokens→estrellas, `millon.combinacion`→millon |
| EDMS | 6 tokens | `c`→sueno |

- Los valores numéricos de extras se normalizan sin ceros a la izquierda (`'04'` → `'4'`); Joker y Millón se conservan tal cual. El relleno a dos cifras de las bolas es cosa de `app/format/`.
- Si `combinacion` es `null` o el número de tokens no coincide, el sorteo se descarta.
- Todo `Draw` de este mapper lleva `source: 'selae'`.

## Fútbol (LAQU, QGOL)

- `jornada`: `Number(jornada)`.
- `status`: `combinacion === null` → `open`; si no → `final`.
- `matches`: de `partidos[]`: `position`=`posicion`, `home`/`away` con `cleanTeamName`, `kickoff`=`toLocalIso(fecha_completa)`, `score`=`marcador` sin espacios, `sign`=`signo` recortado o `null`.

## Próximos sorteos

`mapUpcoming` recorre la lista **en el orden recibido** y aplica `mapNextDraw` a cada elemento; descarta los que no tengan un `game_id` del catálogo. No reordena ni agrupa.

`mapNextDraw` (un elemento):
- `date`=`toDateOnly(fecha)`, `drawAt`=`toLocalIso(fecha)`, `salesCloseAt`=`toLocalIso(cierre)`, `salesOpen`=`estado === 'abierto'`.
- `jackpot`=`parseEuros(premio_bote)`; `jornada`=`jornada ?? null`.
- `addOn`: `joker.bote_joker` → `{kind:'joker'}`; `millon.importe` → `{kind:'millon'}`; solo si `activo === '1'`.
- `nacionalFirstPrize` (solo LNAC): `primer_premio`; `nacionalSpecialPrize`: `premio_especial` (null en sorteos ordinarios).

## Tests obligatorios (valores reales de los fixtures)

| Fixture | Esperado |
|---|---|
| `BONO.results.json` | 3 sorteos en orden ascendente; el del `2026-10-14`: numbers `[8,11,21,41,47,48]`, complementario `34`, reintegro `4` |
| `LAPR.results.json` | `2026-10-12`: numbers `[2,5,26,40,42,45]`, C `23`, R `9`, joker `4781884` |
| `EMIL.results.json` | `2026-10-13`: numbers `[21,23,39,44,49]`, estrellas `['4','11']`, millon `GRF94523` |
| `ELGR.results.json` | `2026-10-11`: numbers `[5,27,43,49,52]`, clave `4` |
| `EDMS.results.json` | `2026-10-12`: numbers `[3,4,6,19,30,36]`, sueno `2` |
| `LAQU.results.json` | jornada `13`: status `open`, 15 matches, partido 15 `sign` `null`; jornada `12`: status `final`, partido 15 `Real Madrid (M)`–`Villarreal (M)` `sign` `1-0` |
| `QGOL.results.json` | jornada del `2026-10-11`: 6 matches, partido 1 Rayo Vallecano–Athletic Club `sign` `0-0` |
| `EMIL.next.json` | date `2026-10-16`, jackpot `49000000`, addOn millon `1000000`, salesCloseAt `2026-10-16T20:30:00` |
| `LNAC.next.json` | drawAt `2026-10-15T21:00:00`, nacionalFirstPrize `300000`, jackpot `null` |
| `QGOL.next.json` | jackpot `null`, jornada `15` |
| `TODOS.next.json` | 20 elementos en el mismo orden que el fixture; el primero EMIL `2026-10-20` jackpot `59000000`; LNAC aparece 2 veces (`nacionalFirstPrize` `300000` y `600000`); LAQU jornada `16` con jackpot `2500000` y `salesCloseAt` `null` |
| `no-records.json` | `mapResults` → `[]` |
