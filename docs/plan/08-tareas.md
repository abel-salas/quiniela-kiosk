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

**T21 · Tarjetas de resultados** — `ui/results/NumbersCard.tsx`, `QuinielaCard.tsx`, `QuinigolCard.tsx`.

**T22 · Columna de próximos sorteos** — `ui/upcoming/UpcomingColumn.tsx` con `UpcomingTile` y cuenta atrás.

**T23 · Página de tablero y rutas** — `ui/results/BoardPage.tsx` con el layout de 3 columnas; `App.tsx` monta `/` y `/quini` con las capas nuevas; `main.tsx` crea repositorios (reales o fixtures con `?mock=1`), reloj y store.
- Hecho cuando: con `?mock=1&now=2026-10-14T22:00` se ven los 7 juegos y la columna de próximos sin desbordes en 1920×1080, y se decide la columna 1 (una o dos subcolumnas).

## Fase 6: Tablet

**T24 · Ruta `/slide`** — [07-sanity.md](07-sanity.md) § Ruta `/slide`. `ui/slides/SlidePage.tsx` con rotación, fundido y recarga de la lista cada 5 min.

## Fase 7: Cierre

**T25 · Borrar código antiguo** — Eliminar `src/services`, `src/components`, `src/hooks`, `src/pages`, `src/types`, `src/config`, `src/sanity`, `src/styles.css` y `VITE_USE_MOCK`, comprobando que nada los importa.

**T26 · Documentación** — Reescribir `README.md` (rutas, Sanity, mock, despliegue, kiosko con extensión anti-CORS) y revisar `AGENTS.md`.

**T27 · Validación en la TV y la tablet** — Legibilidad a 3–4 m, nombres largos de equipos, paso de provisional a definitivo, caída simulada de SELAE (bloquear el dominio en el navegador) y forzado desde el Studio.
