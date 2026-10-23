# Sanity

Sanity se usa en la nube: los editores trabajan en el Studio alojado por Sanity (`https://{studioHost}.sanity.studio`). El repo solo contiene los esquemas y la configuración mínima para publicarlos; la app nunca levanta un Studio propio.

## Usos

| Uso | Ruta | Documento |
|---|---|---|
| Imágenes promocionales de la tablet | `/slide` | `slide` |

El respaldo de resultados ya no está en Sanity: se hace en `/cms` pegando el JSON de SELAE (ver [04-refresco.md](04-refresco.md)). Los esquemas de juegos (`lotteryDraw`, `kioskSettings`) y la ruta `/quini` se han eliminado: el Studio solo gestiona slides.

## Esquemas (`sanity/schemas/`)

### `slide`

| Campo | Tipo | Validación |
|---|---|---|
| `title` | string | Opcional (solo para identificarlo en el Studio) |
| `image` | image con hotspot | Requerido |
| `order` | number | Requerido |
| `active` | boolean | Por defecto `true` |

## Configuración del repo

- `sanity.config.ts`: `projectId`, `dataset`, el esquema `slide` y una estructura con solo "Slides". Sin `basePath`.
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
- Única consulta GROQ, la de slides: `*[_type == "slide" && active != false && defined(image.asset)] | order(order asc) { _id, title, order, "imageUrl": image.asset->url }`
- Repositorio `SlidesRepository` (`getSlides`); fixtures de ejemplo en `src/data/sanity/__fixtures__/slides.json`.

## Ruta `/slide` (tablet)

- Solo imágenes de `slide` activas, en orden. Sin datos de SELAE.
- Cada imagen a pantalla completa (`object-fit: contain`, fondo negro), con `?w=2048&fit=max` en la URL del asset.
- Rotación cada 15 s (Swiper, con gesto táctil y zoom) y barra de progreso.
- La lista se vuelve a pedir cada 5 min; los cambios publicados en el Studio aparecen sin recargar.
- Recarga completa de la página a las 05:00, como la TV (la tablet también está siempre encendida).
- Sin slides: pantalla negra. Sin menú de navegación.
