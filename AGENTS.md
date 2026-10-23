# AGENTS.md

## Contexto del proyecto

App React 19 + Vite + TypeScript de digital signage: tablero de resultados y botes de los juegos de SELAE para una TV 16:9 (`/`), imágenes promocionales para una tablet (`/slide`) y carga manual de resultados (`/cms`). Ver [README.md](README.md).

## Fuente de verdad

- `docs/contexto-apis.md`: contrato real de SELAE.
- `docs/plan/00-indice.md`: decisiones, reglas de trabajo y fases; el resto de `docs/plan/` detalla cada capa.
- `docs/plan/08-tareas.md`: backlog. Ejecutar una tarea por sesión, en orden, salvo los bloques agrupables que indica ese fichero. Prompts: `/tarea TNN` y `/revisar-tarea TNN` (`.github/prompts/`).

Si algo de este fichero contradice `docs/`, manda `docs/`.

## Capas (`src/`)

- `domain/`: tipos, catálogo `GAMES`/`RESULT_COLUMNS` e interfaces de repositorio. No importa nada.
- `data/`: SELAE (`data/selae/`) y Sanity (`data/sanity/`, solo slides): HTTP, mappers `unknown → dominio`, repositorios reales y de fixtures.
- `app/`: configuración, reloj, calendario y ciclo de refresco, caché por premio en `localStorage`, servicio de `/cms`, store, selectores (view models) y formato.
- `ui/`: tema, componentes y páginas. Solo importa tipos de `domain` y hooks/view models de `app`.
- Los repositorios, el reloj y los stores se crean en `src/main.tsx` y se inyectan por contexto.

## Reglas obligatorias

- Fuentes: SELAE (`buscadorSorteos`, `proximosv3`) para resultados y botes; respaldo manual pegando su JSON en `/cms`. Sanity (en la nube) solo para las imágenes de `/slide`. Sin proxy ni widgets de terceros.
- SELAE solo se conoce en `src/data/selae/` y Sanity solo en `src/data/sanity/`. Cada petición tiene su mapper `unknown → dominio` con tests contra fixtures.
- La UI solo consume view models de `src/app/selectors/`; nunca datos crudos del proveedor ni `src/data/`.
- No inventar campos: si no aparece en los fixtures reales, no existe.
- Nunca poner tokens de Sanity en variables `VITE_`: acaban en el bundle público.
- El refresco sigue el calendario fijo de `src/app/refresh/calendar.ts` (la mañana siguiente a cada sorteo) y siempre comprueba `localStorage` antes de llamar. Ver `docs/plan/04-refresco.md`.
- Ficheros de código de 150 líneas o menos (máximo 200). Prohibido `any`.
- Al terminar: `npm run typecheck`, `npm test` y `npm run build` deben pasar.

## Tests

- Vitest en entorno Node. Los tests que necesitan DOM real (temporizadores de React) llevan `// @vitest-environment jsdom` (ver `src/ui/timers.dom.test.tsx`).
- Los fixtures reales de SELAE están en `src/data/selae/__fixtures__/`; `src/test/fixture-board.ts` monta un tablero con ellos.

## Comprobar cambios visuales

- `npm run dev` y abrir `http://localhost:4173/?mock=1&now=2026-10-14T22:00` (fixtures, sin red) a 1920×1080.
- `/slide?mock=1` y `/cms` para las otras rutas.
