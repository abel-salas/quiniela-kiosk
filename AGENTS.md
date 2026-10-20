# AGENTS.md

## Contexto del proyecto

App React 19 + Vite + TypeScript de digital signage: tablero de resultados y botes de los juegos de SELAE para una TV 16:9 (`/`, `/quini`) e imágenes promocionales para una tablet (`/slide`). Ver [README.md](README.md).

## Fuente de verdad

- `docs/contexto-apis.md`: contrato real de SELAE.
- `docs/plan/00-indice.md`: decisiones, reglas de trabajo y fases; el resto de `docs/plan/` detalla cada capa.
- `docs/plan/08-tareas.md`: backlog. Ejecutar una tarea por sesión, en orden, salvo los bloques agrupables que indica ese fichero. Prompts: `/tarea TNN` y `/revisar-tarea TNN` (`.github/prompts/`).

Si algo de este fichero contradice `docs/`, manda `docs/`.

## Capas (`src/`)

- `domain/`: tipos, catálogo `GAMES`/`RESULT_COLUMNS` e interfaces de repositorio. No importa nada.
- `data/`: SELAE (`data/selae/`) y Sanity (`data/sanity/`): HTTP, mappers `unknown → dominio`, repositorios reales y de fixtures.
- `app/`: configuración, reloj, política y planificador de refresco, resolución de fuente, store, selectores (view models) y formato.
- `ui/`: tema, componentes y páginas. Solo importa tipos de `domain` y hooks/view models de `app`.
- Los repositorios, el reloj y los stores se crean en `src/main.tsx` y se inyectan por contexto.

## Reglas obligatorias

- Fuentes: SELAE (`buscadorSorteos`, `proximosv3`) como principal con proxy en Vercel (`api/proxy.ts`). Sanity (en la nube) solo para ruta `/quini` (manual) y origen de las imágenes de `/slide`. Sin fallback a Sanity cuando SELAE falla.
- **Proxy en Vercel**: En producción (`import.meta.env.PROD`), las peticiones a SELAE pasan por `/api/proxy?url=...` para evitar errores 406/403 de Akamai. En desarrollo, peticiones directas a SELAE.
- SELAE solo se conoce en `src/data/selae/` y Sanity solo en `src/data/sanity/`. Cada petición tiene su mapper `unknown → dominio` con tests contra fixtures.
- La UI solo consume view models de `src/app/selectors/`; nunca datos crudos del proveedor ni `src/data/`.
- No inventar campos: si no aparece en los fixtures reales, no existe.
- Nunca poner tokens de Sanity en variables `VITE_`: acaban en el bundle público.
- No derivar ventanas de consulta de días de la semana fijos; el refresco se guía por `proximosv3`.
- Ficheros de código de 150 líneas o menos (máximo 200). Prohibido `any`.
- Al terminar: `npm run typecheck`, `npm test` y `npm run build` deben pasar.

## Arquitectura de fuentes de datos

### Ruta `/` (auto)
- SELAE con proxy en Vercel
- Sin fallback a Sanity
- Si SELAE falla, se mantiene el último dato disponible y se reporta el error

### Ruta `/quini` (manualOnly)
- Resultados exclusivamente de Sanity
- Próximos sorteos desde SELAE (con proxy)
- Si Sanity no está configurado, no se muestra nada

### Ruta `/slide`
- Imágenes desde Sanity
- Próximos sorteos desde SELAE (con proxy)

## Pendientes de Sanity

- **Deploy de schemas**: `npx sanity deploy` requiere Node.js >=22.12 (actual v22.11.0)
  - Solución: actualizar Node.js o hacer el deploy manual desde Sanity dashboard
  - Schemas locales están en `sanity/schemas/` y listos para deploy
- **CORS en Sanity**: Si se usa la ruta `/quini` en producción, configurar CORS en Sanity dashboard para permitir el dominio de Vercel

## Tests

- Vitest en entorno Node. Los tests que necesitan DOM real (temporizadores de React) llevan `// @vitest-environment jsdom` (ver `src/ui/timers.dom.test.tsx`).
- Los fixtures reales de SELAE están en `src/data/selae/__fixtures__/`; `src/test/fixture-board.ts` monta un tablero con ellos.

## Comprobar cambios visuales

- `npm run dev` y abrir `http://localhost:4173/?mock=1&now=2026-10-14T22:00` (fixtures, sin red) a 1920×1080.
- `/quini?mock=1` y `/slide?mock=1` para las otras rutas.
