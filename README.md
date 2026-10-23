# Quiniela kiosk

Tablón digital para una administración de loterías. Una TV horizontal muestra los resultados de la semana y los próximos sorteos con sus botes; una tablet aparte muestra imágenes promocionales. Sin interacción: se actualiza sola.

- Datos principales: la web de SELAE (loteriasyapuestas.es).
- Respaldo manual: página `/cms`, donde se pega el JSON de SELAE abierto en el navegador.
- Imágenes de la tablet: Sanity (Studio alojado en la nube).
- React 19 + Vite + TypeScript. Despliegue estático en Vercel.

El detalle de diseño y decisiones está en [`docs/plan/`](docs/plan/00-indice.md) y el contrato de SELAE en [`docs/contexto-apis.md`](docs/contexto-apis.md).

## Rutas

| Ruta | Dispositivo | Qué muestra |
|---|---|---|
| `/` | TV 16:9 | Resultados (SELAE, guardados en `localStorage`) y columna de próximos sorteos. Lienzo de 1920×1080 escalado a la pantalla |
| `/slide` | Tablet | Imágenes `slide` de Sanity a pantalla completa, rotando cada 15 s |
| `/cms` | Cualquiera (en el navegador del kiosco) | Carga manual: por juego, enlace a su petición de SELAE, caja para pegar el JSON y botón Guardar |

`/` y `/cms` tienen abajo a la izquierda un menú con tres iconos: casa (`/`), imagen (`/slide`) y llave (`/cms`). `/slide` no lo muestra.

Parámetros de desarrollo:

- `?mock=1`: usa los datos de ejemplo del repo (fixtures de SELAE y de Sanity) en lugar de las fuentes reales, sin leer ni escribir `localStorage`.
- `?now=2026-10-14T22:00`: solo con `mock`; el reloj arranca en ese instante (hora local) y sigue avanzando.

Ejemplo: `http://localhost:4173/?mock=1&now=2026-10-14T22:00`.

## Cómo se actualiza

- Cada premio tiene su entrada en `localStorage`, válida durante 1 semana. Solo se reescribe cuando SELAE responde bien o al guardar desde `/cms`.
- Al arrancar y cada día a las 09:15 se recorren los premios en orden: botes, Quiniela, Quinigol, Bonoloto, Euromillones, Primitiva, Gordo y EuroDreams. Antes de llamar se mira lo guardado: solo se llama si falta el último sorteo (la mañana siguiente a cada sorteo), si terminó la jornada de fútbol guardada (o cada 3 días) o, en los botes, una vez al día.
- Si una petición falla dos veces (reintento a los 5 s), se mantiene lo guardado y se pasa al siguiente premio.
- La Quiniela y el Quinigol solo muestran jornadas finalizadas: con una jornada abierta se sigue mostrando la anterior.
- Las peticiones a SELAE van de una en una, con 1,5 s entre ellas: en ráfagas su antibots (Akamai) bloquea a ratos con 403 o 406.
- La página (TV y tablet) se recarga sola cada día a las 05:00.
- Detalle en [`docs/plan/04-refresco.md`](docs/plan/04-refresco.md).

## Requisitos

- Node.js 20 o superior y npm.
- Para la TV: Chrome con una extensión que permita CORS (ver [Kiosco](#kiosco)).

## Instalación y scripts

```bash
npm install
cp .env.example .env   # y rellenar los valores
```

| Script | Para qué |
|---|---|
| `npm run dev` | Servidor de desarrollo en `http://localhost:4173` |
| `npm test` | Tests (Vitest; los que necesitan DOM usan `jsdom`) |
| `npm run typecheck` | Comprobación de tipos |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build en `http://localhost:4173` |

## Configuración

Variables en `.env` (ver [`.env.example`](.env.example)):

| Variable | Valor |
|---|---|
| `VITE_SANITY_PROJECT_ID` | ID del proyecto de Sanity (`lkywbgau`) |
| `VITE_SANITY_DATASET` | Dataset (`production` por defecto) |

- El dataset es de lectura pública: la app no necesita token. **Nunca** pongas un token de Sanity en una variable `VITE_`, porque se incrusta en el bundle público.
- Sin `VITE_SANITY_PROJECT_ID`, `/slide` no tiene imágenes (lo avisa en la consola).

## Sanity

Los editores trabajan en el Studio alojado: **https://quini.sanity.studio**. El repo solo contiene los esquemas (`sanity/schemas/`) y la configuración para publicarlos (`sanity.config.ts`, `sanity.cli.ts`).

| Documento | Uso |
|---|---|
| Slide (`slide`) | Imagen promocional de `/slide`, con orden y casilla de activo |

Publicar o actualizar el Studio (una persona con acceso al proyecto):

```bash
npx sanity login
npx sanity deploy
```

Después, en [sanity.io/manage](https://www.sanity.io/manage) → proyecto → API → **CORS origins**, añadir el dominio de Vercel y `http://localhost:4173` (sin credenciales).

## Despliegue en Vercel

1. Importar el repositorio en Vercel con el preset **Vite** (build `npm run build`, salida `dist`).
2. Añadir `VITE_SANITY_PROJECT_ID` y `VITE_SANITY_DATASET` en las variables de entorno del proyecto.
3. [`vercel.json`](vercel.json) redirige todas las rutas a `index.html` para que `/slide` y `/cms` funcionen al abrirlas directamente.

## Kiosco

SELAE no envía cabeceras CORS, así que el navegador de la TV necesita una extensión que permita CORS (que añada `Access-Control-Allow-Origin`), activada para `loteriasyapuestas.es`. No hay proxy: una IP de servidor en la nube tiene riesgo de bloqueo.

TV:

1. Instalar la extensión anti-CORS en Chrome y activarla.
2. Abrir Chrome en modo kiosco con la URL del tablero, p. ej. `chrome --kiosk https://<dominio>/`.
3. Configurar el equipo para abrir Chrome así al arrancar.

Tablet: abrir `https://<dominio>/slide` a pantalla completa (no necesita la extensión: solo lee Sanity).

Las dos pantallas se recargan solas a las 05:00.

Si SELAE falla, abrir `/cms` en el mismo navegador del kiosco (mismo `localStorage`), pulsar el enlace de cada juego, copiar el JSON que muestra la pestaña nueva, pegarlo y guardar.

## Estructura

```
src/
  domain/      tipos de dominio, catálogo de juegos, interfaces de repositorio
  data/        SELAE y Sanity: HTTP, mappers unknown → dominio, repositorios y fixtures
  app/         configuración, reloj, calendario y ciclo de refresco, caché por premio, /cms, store y selectores
  ui/          tema, componentes y páginas (solo consume view models de app/selectors)
sanity/        esquema `slide` publicado en el Studio
docs/          contrato de SELAE y plan del proyecto
```

## Aviso visible

> Resultados informativos; compruebe su boleto con los resultados oficiales.
