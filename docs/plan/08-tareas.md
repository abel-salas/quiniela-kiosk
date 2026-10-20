# Backlog de tareas

Una tarea por sesión, en orden, salvo los bloques agrupables de abajo. Criterio común: `npm run typecheck`, `npm test` y `npm run build` pasan, y ningún fichero de código nuevo supera 200 líneas.

Bloques agrupables (tareas sencillas que pueden ir en una misma sesión, en este orden): `T01-T02`, `T03-T05`, `T06-T07`, `T09-T10`. El resto se ejecuta de una en una.

Estrategia: el código actual (`src/services`, `src/components`, `src/hooks`, `src/pages`, `src/types`, `src/config`, `src/sanity`) sigue funcionando mientras se construyen las capas nuevas (`domain`, `data`, `app`, `ui`). En T23 las rutas pasan a las capas nuevas y en T25 se borra el código antiguo.

## Paso manual previo (lo hace una persona)

**T00 ✅ · Referencias** — Hecho: logos en `src/ui/assets/logos/`, `TODOS.next.json` en los fixtures. Capturas y copia de la web de SELAE solo en local (`docs/referencia/`, ignorado por git).

## Fase 1: Base

**T01 ✅ · Limpieza**
- Quitar el proxy de `vite.config.ts` y dejar `API_BASE_URL` apuntando siempre a `https://www.loteriasyapuestas.es/servicios`.
- `package.json`: quitar `styled-components`, `playwright`, `@sanity/schema` y `@sanity/types` si no se importan; mover `sanity` a `devDependencies`.
- Borrar, si nada los importa: `src/App.css`, `src/index.css`, `src/index.tsx`, `src/assets/hero.png`, `src/assets/solid.svg`, `src/assets/vite.svg`, `tsconfig.app.json`.
- Mover `src/IMG20261007091157.jpg` a `docs/referencia/tablon-fisico.jpg`.
- Hecho cuando: `npm run build` pasa y la app sigue funcionando igual.

**T02 ✅ · Tooling** — Añadir `vitest`, scripts `test` (`vitest run`) y `typecheck` (`tsc --noEmit`); `tsconfig.json` con `strict`, `noUnusedLocals`, `noUnusedParameters`. Un test trivial que pase.

## Fase 2: Dominio y datos SELAE

**T03 ✅ · Dominio** — [02-dominio.md](02-dominio.md). Crear `src/domain/*` con esos tipos, `GAMES` y `RESULT_COLUMNS`.

**T04 ✅ · Parsers** — [03-datos-selae.md](03-datos-selae.md) § Reglas de parseo. `parse/text.ts`, `parse/dates.ts`, `parse/amounts.ts` con tests de cada ejemplo.

**T05 ✅ · Combinación** — `parse/combination.ts` con tests de las combinaciones de [../contexto-apis.md](../contexto-apis.md).

**T06 ✅ · Mapper de números** — `raw-types.ts` y `mappers/numbers.ts` con `NUMBER_RULES`. Tests con BONO, LAPR, ELGR, EMIL y EDMS.

**T07 ✅ · Mapper de fútbol** — `mappers/football.ts`. Tests con `LAQU.results.json` y `QGOL.results.json`.

**T08 ✅ · Próximos y despachador** — `mappers/next-draw.ts` y `mappers/results.ts`. Hecho cuando pasan todos los casos de la tabla "Tests obligatorios".

**T09 ✅ · Cliente y repositorio SELAE** — `data/http/fetch-json.ts`, `endpoints.ts`, `selae-repository.ts`. Tests con `fetch` simulado (200, 403, timeout, cuerpo string).

**T10 ✅ · Repositorio de fixtures SELAE** — `fixture-repository.ts` con los JSON de `__fixtures__` y los mismos mappers.

## Fase 3: Sanity

**T11 ✅ · Esquemas** — [07-sanity.md](07-sanity.md) § Esquemas y Configuración. Reescribir `sanity/schemas/` (`lotteryDraw`, `kioskSettings`, `slide`), `sanity.config.ts` sin `basePath` y con documento único, `sanity.cli.ts` con `studioHost`, `.env.example`.
- Después, una persona ejecuta `npx sanity deploy` y añade los CORS origins.

**T11b ✅ · React 19** — `sanity` 4 espera React 19 y avisa al compilar el Studio. Actualizar `react`, `react-dom`, `@types/react` y `@types/react-dom` a la 19 y comprobar que `react-router-dom` y `@sanity/client` siguen siendo compatibles. Añadir `styled-components` como `devDependency` (dependencia peer del Studio; la app no la importa).
- Hecho cuando: `npx sanity build` no muestra avisos de versiones, la app (`/`, `/quini`, `/slide`) se ve igual que antes y pasan `typecheck`, `test` y `build`.

**T12 ✅ · Datos Sanity** — `src/data/sanity/`: cliente, consultas, mapper, fixtures a mano, `createSanityRepository()` y `createSanityFixtureRepository()` (ambos `ManualRepository`). Tests del mapper.

## Fase 4: Aplicación

**T13 ✅ · Config y reloj** — `app/config.ts` (`mock`, `now`, hora de recarga) y `app/clock.ts`. Tests de lectura de query params.

**T14 ✅ · Política de refresco** — [04-refresco.md](04-refresco.md) § Política. `app/refresh/policy.ts` con todos los tests listados.

**T15 ✅ · Resolución de fuente** — § Resolución de fuente. `app/source/` con reintentos (5 s, 10 s), fallback a Sanity, juegos forzados y combinación por fecha. Tests con repositorios falsos y `vi.useFakeTimers`.

**T16 ✅ · Planificador y store** — `app/refresh/scheduler.ts`, `app/store/` (`createBoardStore`, `useBoard`, `useNow`), `sourceMode: 'manualOnly'`. Tests con repositorios falsos.

## Fase 5: Interfaz

**T17 ✅ · Formato** — [05-ui-sistema.md](05-ui-sistema.md) § Formato. `app/format/` con tests de todos los ejemplos.

**T18 ✅ · Tema, escenario y logos** — [05-ui-sistema.md](05-ui-sistema.md). `ui/theme/tokens.css` con los colores de la tabla, Public Sans con `@fontsource/public-sans`, `ui/stage/Stage.tsx`. Los logos ya están en `ui/assets/logos/`.

**T19 ✅ · Componentes base** — Los de la tabla de [05-ui-sistema.md](05-ui-sistema.md), un fichero por componente con su CSS al lado.

**T20 ✅ · Selectores** — [06-ui-resultados.md](06-ui-resultados.md). `app/selectors/` con `selectWeekDraws` (pila de 7 días) y `selectBoardView`. Tests.

**T21 ✅ · Tarjetas de resultados** — `ui/results/NumbersCard.tsx`, `QuinielaCard.tsx`, `QuinigolCard.tsx`.

**T22 ✅ · Columna de próximos sorteos** — `ui/upcoming/UpcomingColumn.tsx` con `UpcomingTile` y cuenta atrás.

**T23 ✅ · Página de tablero y rutas** — `ui/results/BoardPage.tsx` con el layout de 3 columnas; `App.tsx` monta `/` y `/quini` con las capas nuevas; `main.tsx` crea repositorios (reales o fixtures con `?mock=1`), reloj y store.
- Hecho cuando: con `?mock=1&now=2026-10-14T22:00` se ven los 7 juegos y la columna de próximos sin desbordes en 1920×1080, y se decide la columna 1 (una o dos subcolumnas).

## Fase 6: Tablet

**T24 ✅ · Ruta `/slide`** — [07-sanity.md](07-sanity.md) § Ruta `/slide`. `ui/slides/SlidePage.tsx` con rotación, fundido y recarga de la lista cada 5 min.

## Fase 7: Cierre

**T25 ✅ · Borrar código antiguo** — Eliminar `src/services`, `src/components`, `src/hooks`, `src/pages`, `src/types`, `src/config`, `src/sanity`, `src/styles.css` y `VITE_USE_MOCK`, comprobando que nada los importa.

**T26 ✅ · Documentación** — Reescribir `README.md` (rutas, Sanity, mock, despliegue, kiosko con extensión anti-CORS) y revisar `AGENTS.md`.

**T27 · Validación en la TV y la tablet** — Hecho en local: test de provisional → definitivo, caída de SELAE (tarjetas en "Pendiente de resultado" sin errores), nombres largos (2 líneas). Pendiente en los dispositivos: legibilidad a 3–4 m, nombres largos de equipos, paso de provisional a definitivo, caída simulada de SELAE (bloquear el dominio en el navegador) y forzado desde el Studio.

**T28 · Pendientes finales** — Lo que ha quedado anotado durante el desarrollo:
- ✅ Recarga diaria de la tablet (`/slide`) a las 05:00, como la TV (`createSlideStore` con `dailyReload`).
- Pendiente (persona): probar `/slide` con imágenes reales tras `npx sanity deploy` y subir slides en el Studio (los fixtures usan el favicon).
- ✅ Sin dependencia de `color-mix()`: los colores claros se calculan con `withAlpha` (`rgba`), válido en cualquier navegador.
- ✅ Tests con `jsdom` del tic de la cuenta atrás cada minuto y de la rotación de slides (`src/ui/timers.dom.test.tsx`).

## Fase 8: Bloqueos de Akamai (403/406) en producción

Contexto (observado el 2026-10-20 en Vercel): al cargar el tablero, 3 o 4 juegos se quedan sin resultado por 403/406, también tras los reintentos, mientras que la misma URL abierta en la barra del navegador responde 200. Hoy, si una petición falla, los reintentos del juego (5 s y 10 s, `source/retry.ts`) se mezclan en la cola con las de los demás juegos, así que la ráfaga continúa y Akamai mantiene el bloqueo. Además, cada recarga (la de las 05:00 o una manual) vuelve a pedir los 7 juegos y los próximos sorteos.

`T29` y `T30` son independientes (solo comparten [04-refresco.md](04-refresco.md), en secciones distintas) y pueden ir en paralelo.

**T29 ✅ · Pausa de la cola tras un bloqueo** — Solo `src/app/refresh/queue.ts`, su test y la documentación.
- Nueva opción `cooldownMs` en `createRequestQueue` y constante `SELAE_COOLDOWN_MS = 20_000` junto a `SELAE_SPACING_MS`.
- Si una tarea falla con `ProviderError` de tipo `blocked`, `network` o `timeout`, la cola no arranca nada más hasta 20 s después del fallo. Después sigue de una en una con el espaciado normal (1,5 s). Si falla otra petición, la pausa vuelve a empezar. Los errores `invalid` y los que no son `ProviderError` no pausan la cola.
- El error se sigue propagando a quien llamó: `withRetries` cuenta el intento igual que ahora. No hay que tocar `retry.ts` ni `resolve-draws.ts`. El reintento a 5 s quedará esperando a que termine la pausa, y eso es lo que se busca.
- Un único `console.warn` al entrar en pausa con el mensaje del error, que ya incluye el código 403/406, para poder diagnosticar en la TV.
- Tests en `queue.test.ts` con `vi.useFakeTimers`: tras un `blocked`, la siguiente tarea no arranca antes de 20 s y sí a los 20 s; tras un `invalid`, no hay pausa; un segundo fallo después de la pausa la reinicia; el espaciado de 1,5 s se mantiene sin errores.
- Docs: en [04-refresco.md](04-refresco.md) § Planificador, ampliar la viñeta "Cola global" con la pausa de 20 s; en [../contexto-apis.md](../contexto-apis.md) § Acceso, una línea indicando que la app pausa la cola 20 s tras un 403/406.

**T30 ✅ · Caché local de 12 h** — Guardar el tablero en `localStorage` para que una recarga no vuelva a pedirlo todo.
- Nuevo `src/app/store/board-cache.ts` con `loadBoardCache(storage, now)` y `saveBoardCache(storage, snapshot, now)`. Clave `quiniela:board:v1`. Contenido: `{ version: 1, savedAt, lastUpdatedAt, upcoming, results: { [gameId]: { draws, next } } }`. `phase`, `errorCount`, `lastErrorKind` y `forcedGames` no se guardan: se recalculan o se leen de Sanity al arrancar.
- `BOARD_CACHE_TTL_MS = 12 h`. Si el JSON está roto, la versión no coincide, han pasado 12 h desde `savedAt` o la forma no es válida, se devuelve `null` y se borra la clave. Validar con guardas de tipo sobre `unknown` (sin `any` ni `as` a ciegas): `gameId` dentro de `RESULT_GAMES`, `draws` como array de objetos con `kind` `numbers`/`football` y `date` string, y `next`/`upcoming` con `gameId` y `date` string.
- `setItem` puede lanzar (cuota, modo privado): se captura y se ignora. Ampliar `LegacyStorage` (o crear un tipo `KioskStorage`) con `getItem` y `setItem`.
- `createBoardStore`: nueva opción `persist?: boolean`. Si está activa, el snapshot inicial se hidrata con la caché antes de `scheduler.start()`, y cada `store.update` guarda (las actualizaciones son pocas, no hace falta throttle). `savedAt` y la caducidad usan `clock.now()`.
- `main.tsx`: `persist: !config.mock && !isQuini`. `/quini` y `?mock=1` no leen ni escriben la caché.
- Resultado esperado: con caché válida, los juegos `upToDate` no consultan SELAE al arrancar, porque la política ya tiene `next` y no aplica la regla 2. Solo se piden los próximos sorteos (1 petición) y los juegos en `awaitingResult` o `provisional`.
- Tests: ida y vuelta de `save`/`load`; caducada a las 12 h + 1 ms; JSON roto; versión distinta; `gameId` desconocido. En `board-store.test.ts`: con caché válida y un juego al día, `getRecentDraws` no se llama al arrancar; con `persist: false`, el storage no se toca.
- Docs: reescribir § "Sin caché persistente" de [04-refresco.md](04-refresco.md) como "Caché local de 12 h"; actualizar la decisión de [00-indice.md](00-indice.md) (línea "Sin caché persistente"), la línea correspondiente de `README.md` y el comentario de `legacy-cache.ts`. Las claves antiguas `draw:*` se siguen borrando.

## Fase 9: Ajustes de maqueta y estado de fútbol

`T32` (solo CSS y formato) y `T33` (política y selector) son independientes y pueden ir en paralelo.

**T32 · Ajustes de maqueta del tablero** — Validar siempre con `?mock=1&now=2026-10-14T22:00` en 1920×1080 (captura antes y después) y comprobar que no hay desbordes ni texto cortado.
- **Fecha de las líneas**: el día lo abreviamos nosotros (`formatLineDate` → `"mié 14/10"`); SELAE manda el nombre completo (`dia_semana: "miércoles"`). Pasar a día completo: `"miércoles 14/10"`. Actualizar `formatLineDate`, su test y el ejemplo de [05-ui-sistema.md](05-ui-sistema.md) § Formato. En `DrawLine.css`, cambiar la primera columna fija de `92px` a un ancho que quepa en "miércoles 14/10" con la fuente nueva; mejor un ancho común a todas las líneas (por ejemplo, `max-content` de la más larga, o un valor fijo medido) para que las bolas sigan alineadas entre tarjetas.
- **Separación fecha → bolas**: más hueco entre la fecha y la fila de bolas en cada línea (`gap`/columna de `DrawLine`).
- **Escala general**: subir de forma proporcional, en torno a un 10–15 %, los tamaños de texto y sus espaciados en las tarjetas de resultados: `GameHeader`, `DrawLine`, `Ball`, `ExtraBall`, `AddOnBox`, `MatchRow`, `SignBox`, `result-card__pleno` y `result-card__empty`. Si ayuda, centralizar en variables de `tokens.css` (`--text-*`, `--space-*`) en lugar de valores sueltos. La columna de próximos y la barra de estado no se tocan.
- **Columnas**: en `BoardPage.css`, `.board-page__numbers, .board-page__football` con `justify-content: space-between` para repartir el alto sobrante entre las tarjetas.
- **Separación entre columnas**: subir el `column-gap` de `.board-page` (hoy `gap: 12px` para filas y columnas) a unos 20–24 px, dejando el `row-gap` con la barra de estado como está. La columna de próximos sigue en 384 px; el ancho que se pierde sale de las columnas 1 y 2: comprobar que las líneas de números (con "miércoles 14/10" y los extras) siguen cabiendo sin cortes.
- **Quiniela y Quinigol**: más separación entre la cabecera y el primer partido (padding superior del cuerpo de las tarjetas de fútbol) y más `gap`/alto entre filas de `MatchRow`. La Quiniela tiene 15 filas más "Pleno al 15": comprobar que cabe entera en la columna.
- Peor caso que debe caber sin cortes: una semana con 6 Bonolotos, 3 Primitivas, 2 Euromillones, 2 EuroDreams y 1 Gordo. Si con el mock no se da, añadir un caso temporal en local para medirlo, sin subirlo a los fixtures.
- Hecho cuando: capturas antes/después adjuntas en la PR o en la sesión, y pasan `typecheck`, `test` y `build`.

**T33 · Quiniela y Quinigol: falso "Resultado de hoy pendiente"** — Causa confirmada con `TODOS.next.json`:
- El próximo de LAQU/QGOL tiene `fecha: "2026-10-21 00:00:00"` y `cierre: "2026-10-20 21:00:00"`. `toLocalIso` devuelve `null` para las 00:00, así que `drawAt` es `null`; el fútbol no tiene `resultsFromTime`, y `expectedResultAt` acaba usando `salesCloseAt`.
- En consecuencia, desde el cierre de ventas (martes 21:00) la política pone `awaitingResult` y la tarjeta muestra "Resultado de hoy pendiente" sobre una jornada que ya está terminada (la del lunes). Además consulta SELAE cada 5 min durante 3 h y después cada 30 min, sin motivo: más peticiones y más 403/406.

Cambios:
- `refresh/policy.ts` → `expectedResultAt`: en fútbol, usar el instante más tardío entre `salesCloseAt` y las 00:00 de `next.date` (la jornada aparece en `buscadorSorteos` como abierta a partir de su fecha). Actualizar la regla de [04-refresco.md](04-refresco.md) § Ciclo de vida.
- `app/selectors/results.ts` → `footballCard`: no mostrar `AWAITING_BADGE`. En fútbol solo existe la etiqueta `PROVISIONAL` (jornada abierta). Mientras no llegue la nueva jornada, la tarjeta sigue mostrando la última, sin chip. Actualizar la tabla de § Estados de [06-ui-resultados.md](06-ui-resultados.md) (el chip solo aplica a juegos de números).
- Tests en `policy.test.ts`: LAQU con `next` del 21/10 (`cierre` 20/10 21:00), última jornada final del 18/10 y `now = 2026-10-20T23:00` → `upToDate`, siguiente ronda a las 00:00 del 21/10 (o antes por el tope de 6 h). El 21/10 a las 00:30 sin jornada del 21/10 → `awaitingResult`, 5 min. En `results.test.ts`: tarjeta de fútbol con `phase: 'awaitingResult'` → `badge: null`; con jornada `open` → `PROVISIONAL`.

**T34 · Próximos sorteos: tiles vacíos de Quiniela, Quinigol y Quíntuple Plus** — Independiente de `T32` y `T33`; solo toca la columna de próximos. La cuenta atrás (cada minuto) se queda como está.
- Causa (`TODOS.next.json`): al pasar el cierre (QUPL martes 18:15; LAQU/QGOL martes 21:00), el siguiente sorteo de esos juegos (25/10) llega con `estado: "cerrado"`, `apertura: null` y `cierre: null`: aún no está a la venta. Sin `salesCloseAt` no hay cuenta atrás, y como `pickPrize` exige `salesOpen`, tampoco importe. El tile se queda solo con el nombre.
- Cambio: si el tile no tiene cuenta atrás (`salesCloseAt` `null`), mostrar en su lugar la fecha del sorteo, por ejemplo `"dom 25/10"`, y la hora si hay `drawAt` (`"dom 25/10 · 21:30"`). Nueva función `formatDrawDate` en `app/format/format.ts` con tests. En el view model, `countdown` pasa a ser el texto de arriba a la derecha (cuenta atrás o fecha); no hace falta un campo nuevo.
- La regla del importe no cambia (se replica la web de SELAE: solo sorteos con `salesOpen`).
- Tests: en `upcoming.test.ts`, con `now = 2026-10-20T23:00`, LAQU, QGOL y QUPL muestran `"dom 25/10"`, y EMIL sigue con cuenta atrás. Comprobar con `?mock=1&now=2026-10-20T23:00` en 1920×1080. Actualizar [06-ui-resultados.md](06-ui-resultados.md) § Columna de próximos sorteos (tile sin cuenta atrás → fecha del sorteo).
