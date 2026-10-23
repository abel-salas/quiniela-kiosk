# Arquitectura

## Capas

```mermaid
flowchart LR
  SELAE[(SELAE)] --> DS[data/selae]
  SAN[(Sanity)] --> DN[data/sanity]
  DS -->|dominio| A[app: refresco, caché, cms, store, selectores]
  DN -->|dominio| A
  A -->|view models| U[ui: páginas y componentes]
```

| Capa | Responsabilidad | Puede importar |
|---|---|---|
| `domain` | Tipos de dominio, catálogo de juegos, interfaces de repositorio | Nada |
| `data` | HTTP, tipos raw, mappers y repositorios de SELAE y Sanity | `domain` |
| `app` | Configuración, reloj, calendario y ciclo de refresco, caché por premio, `/cms`, store, selectores | `domain`, `data` (solo en el arranque) |
| `ui` | Páginas, componentes, estilos, logotipos | `domain` (tipos), `app` (hooks y view models) |

Reglas:
- SELAE solo se conoce en `src/data/selae/`; Sanity solo en `src/data/sanity/`. Ambos devuelven modelos de dominio.
- Un cambio en un proveedor se resuelve en sus mappers y fixtures, sin tocar `app` ni `ui`.
- `ui` no hace `fetch` y no formatea datos crudos. Los selectores entregan view models listos para pintar.
- Los repositorios se crean en `src/main.tsx` y se inyectan; no se instancian en otro sitio.

## Estructura de carpetas

```
src/
  main.tsx                     arranque: config, reloj, repositorios, stores, router
  App.tsx                      rutas
  domain/                      games, draw, next-draw, repository
  data/
    http/fetch-json.ts
    selae/                     endpoints, raw-types, parse/, mappers/, repositorio, importer (/cms), __fixtures__/
    sanity/                    client, queries, raw-types, mappers/, repositorio de slides, __fixtures__/
  app/
    config.ts                  query params y env
    clock.ts
    source/                    ventana de consulta, reintentos, combinación por fecha
    refresh/                   calendario puro, ciclo de llamadas, cola de SELAE, temporizadores diarios (05:00, 09:15)
    store/                     caché por premio en localStorage, estado por juego + hooks (useBoard, useNow, useBoardView, useUpcomingTiles)
    cms/                       servicio y hook de /cms
    slides/                    store de slides (cada 5 min) y rotación
    selectors/                 dominio → view models (tablero, próximos, slides)
    format/                    fechas, importes, bolas
  ui/
    theme/                     tokens.css, base.css
    assets/logos/              SVG de juegos, Joker y Millón
    components/                piezas reutilizables
    results/                   ruta /
    upcoming/                  columna de próximos sorteos
    slides/                    ruta /slide
    cms/                       ruta /cms
    stage/                     lienzo 1920×1080 escalado
  test/                        helpers de tests (tablero con fixtures)
sanity/
  schemas/                     esquema `slide` publicado en el Studio alojado
sanity.config.ts               configuración mínima para `sanity deploy`
sanity.cli.ts
vercel.json                    rewrite SPA para /slide y /cms
```

## Rutas

| Ruta | Dispositivo | Datos |
|---|---|---|
| `/` | TV horizontal | Resultados y próximos sorteos (SELAE, guardados en `localStorage`) |
| `/slide` | Tablet horizontal | Imágenes `slide` de Sanity en rotación |
| `/cms` | Navegador del kiosco | Carga manual del JSON de SELAE por juego, al mismo `localStorage` |

`/` y `/cms` muestran abajo a la izquierda el menú `ui/components/NavMenu.tsx` (casa, imagen y llave). En `/` va dentro del pie, a la izquierda de "Actualizado"; en `/cms`, flotante. `/slide` no lo muestra.

Parámetros de desarrollo:
- `?mock=1`: repositorios con fixtures (SELAE y Sanity).
- `?now=2026-10-14T21:40`: solo con mock; el reloj arranca en ese instante (hora local) y sigue avanzando.

## Tooling

- Vitest (`npm test`), `npm run typecheck` (`tsc --noEmit`).
- `react-router-dom` para las rutas.
- `@sanity/client` para leer Sanity; `sanity` solo como `devDependency` para publicar esquemas.
- Estado con `useSyncExternalStore`; sin librerías de estado ni de fetching.
- CSS plano con variables; sin `styled-components`.
