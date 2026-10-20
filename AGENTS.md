# AGENTS.md

## Contexto del proyecto

App React + Vite + TypeScript de digital signage (TV 16:9) con resultados y botes de los juegos de SELAE.

## Fuente de verdad

El proyecto está en reconstrucción. Las reglas vigentes están en:

- `docs/contexto-apis.md`: contrato real de SELAE.
- `docs/plan/00-indice.md`: decisiones, reglas de trabajo y fases.
- `docs/plan/08-tareas.md`: backlog. Ejecutar una tarea por sesión, en orden, salvo los bloques agrupables que indica ese fichero.

Si algo de este fichero contradice `docs/`, manda `docs/`.

## Reglas obligatorias

- Fuentes: SELAE (`buscadorSorteos`, `proximosv3`) como principal y Sanity (en la nube) como respaldo manual y origen de las imágenes de `/slide`. Sin proxy ni widgets de terceros.
- SELAE solo se conoce en `src/data/selae/` y Sanity solo en `src/data/sanity/`. Cada petición tiene su mapper `unknown → dominio` con tests contra fixtures.
- La UI solo consume view models de `src/app/selectors/`; nunca datos crudos del proveedor.
- No inventar campos: si no aparece en los fixtures reales, no existe.
- Nunca poner tokens de Sanity en variables `VITE_`: acaban en el bundle público.
- No derivar ventanas de consulta de días de la semana fijos; el refresco se guía por `proximosv3`.
- Ficheros de código de 150 líneas o menos (máximo 200). Prohibido `any`.
- Al terminar: `npm run typecheck`, `npm test` y `npm run build` deben pasar.
