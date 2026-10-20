# Sanity

Sanity se usa en la nube: los editores trabajan en el Studio alojado por Sanity (`https://{studioHost}.sanity.studio`). El repo solo contiene los esquemas y la configuración mínima para publicarlos; la app nunca levanta un Studio propio.

## Usos

| Uso | Ruta | Documento |
|---|---|---|
| Respaldo manual de resultados cuando SELAE falla | `/` | `lotteryDraw` |
| Forzar que un juego se lea de Sanity aunque SELAE funcione | `/` | `kioskSettings` |
| Validar todos los datos introducidos a mano | `/quini` | `lotteryDraw` |
| Imágenes promocionales de la tablet | `/slide` | `slide` |

## Esquemas (`sanity/schemas/`)

### `lotteryDraw`

Un documento por sorteo. Campos visibles según `game`:

| Campo | Tipo | Juegos | Validación |
|---|---|---|---|
| `game` | string (lista) | todos | Requerido. Valores: BONO, EDMS, ELGR, LAPR, EMIL, LAQU, QGOL |
| `date` | date | todos | Requerido |
| `numbers` | array de number | BONO, LAPR, EDMS (6), ELGR, EMIL (5) | Longitud exacta por juego |
| `complementario` | number | BONO, LAPR | |
| `reintegro` | number | BONO, LAPR | 0–9 |
| `joker` | string | LAPR | 7 dígitos |
| `clave` | number | ELGR | 0–9 |
| `estrellas` | array de number | EMIL | 2 valores |
| `millon` | string | EMIL | |
| `sueno` | number | EDMS | |
| `jornada` | number | LAQU, QGOL | Requerido |
| `finalizada` | boolean | LAQU, QGOL | Por defecto `false` |
| `matches` | array de `{ home, away, kickoff (datetime), score, sign }` | LAQU (15), QGOL (6) | Longitud exacta |

Vista previa del documento: `"{game} · {date}"`.

### `kioskSettings` (documento único)

| Campo | Tipo | Descripción visible en el Studio |
|---|---|---|
| `forcedGames` | array de string (lista de los 7 juegos) | "Juegos que la pantalla leerá de Sanity aunque la web oficial funcione" |

- Documento único con `_id: 'kioskSettings'`; el Studio no permite crear otros.

### `slide`

| Campo | Tipo | Validación |
|---|---|---|
| `title` | string | Opcional (solo para identificarlo en el Studio) |
| `image` | image con hotspot | Requerido |
| `order` | number | Requerido |
| `active` | boolean | Por defecto `true` |

## Configuración del repo

- `sanity.config.ts`: `projectId`, `dataset`, esquemas y la estructura del documento único. Sin `basePath`.
- `sanity.cli.ts`: `api.projectId`, `api.dataset` y `studioHost`.
- `sanity` como `devDependency`; la app solo depende de `@sanity/client`.
- Variables de la app: `VITE_SANITY_PROJECT_ID`, `VITE_SANITY_DATASET`. **Nunca** un token con prefijo `VITE_`: se incrusta en el bundle público. El dataset es de lectura pública.
- En sanity.io/manage → API → CORS origins: añadir el dominio de Vercel y `http://localhost:4173`.

Publicación (la ejecuta una persona con sesión en Sanity):

```bash
npx sanity login
npx sanity deploy          # publica el Studio alojado con los esquemas del repo
```

## Lectura desde la app (`src/data/sanity/`)

- Cliente `@sanity/client` con `useCdn: false` para ver los cambios al momento (el volumen de peticiones es bajo: 1 TV + 1 tablet).
- Consultas GROQ:
  - Sorteos: `*[_type == "lotteryDraw" && game == $game && date >= $from && date <= $to] | order(date asc)`
  - Juegos forzados: `*[_id == "kioskSettings"][0].forcedGames`
  - Slides: `*[_type == "slide" && active != false && defined(image.asset)] | order(order asc) { _id, title, order, "imageUrl": image.asset->url }`
- Mapper `unknown → Draw` con `source: 'sanity'`. Un documento incompleto (longitudes que no cuadran, sin `jornada`…) se descarta.
- `finalizada: false` → `status: 'open'`; `true` → `final`.
- Fixtures de ejemplo en `src/data/sanity/__fixtures__/` escritos a mano con la forma de los esquemas de arriba.

## Ruta `/slide` (tablet)

- Solo imágenes de `slide` activas, en orden. Sin datos de SELAE.
- Cada imagen a pantalla completa (`object-fit: contain`, fondo negro), con `?w=2048&fit=max` en la URL del asset.
- Rotación cada 10 s con fundido cruzado de 700 ms.
- La lista se vuelve a pedir cada 5 min; los cambios publicados en el Studio aparecen sin recargar.
- Recarga completa de la página a las 05:00, como la TV (la tablet también está siempre encendida).
- Sin slides: pantalla negra.

## Ruta `/quini`

- Mismo layout que `/` con `sourceMode: 'manualOnly'` (ver [04-refresco.md](04-refresco.md)).
- Sirve para revisar que lo introducido en el Studio se ve correctamente antes de forzarlo.
