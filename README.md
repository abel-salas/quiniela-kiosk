# Quiniela kiosk

Tablón digital para una administración de loterías. Una TV horizontal muestra los resultados de la semana y los próximos sorteos con sus botes; una tablet aparte muestra imágenes promocionales. Sin interacción: se actualiza sola.

- Datos principales: la web de SELAE (loteriasyapuestas.es).
- Respaldo manual e imágenes: Sanity (Studio alojado en la nube).
- React 19 + Vite + TypeScript. Despliegue estático en Vercel.

El detalle de diseño y decisiones está en [`docs/plan/`](docs/plan/00-indice.md) y el contrato de SELAE en [`docs/contexto-apis.md`](docs/contexto-apis.md).

## Rutas

| Ruta | Dispositivo | Qué muestra |
|---|---|---|
| `/` | TV 16:9 | Resultados (SELAE, con respaldo de Sanity) y columna de próximos sorteos. Lienzo de 1920×1080 escalado a la pantalla |
| `/quini` | Cualquiera | El mismo tablero, pero con los resultados leídos solo de Sanity: sirve para revisar lo introducido a mano antes de forzarlo |
| `/slide` | Tablet | Imágenes `slide` de Sanity a pantalla completa, rotando cada 10 s |

Parámetros de desarrollo:

- `?mock=1`: usa los datos de ejemplo del repo (fixtures de SELAE y de Sanity) en lugar de las fuentes reales.
- `?now=2026-10-14T22:00`: solo con `mock`; el reloj arranca en ese instante (hora local) y sigue avanzando.

Ejemplo: `http://localhost:4173/?mock=1&now=2026-10-14T22:00`.

## Cómo se actualiza

- Cada juego consulta SELAE solo cuando puede haber datos nuevos, guiándose por `proximosv3` (hora de cierre y del sorteo). Con jornada de fútbol en curso, cada 5 min.
- Si SELAE falla, reintenta a los 5 s y a los 10 s; si sigue fallando, usa los sorteos de Sanity para ese juego.
- Desde Sanity se puede forzar que un juego se lea siempre de Sanity (`kioskSettings`).
- Las peticiones a SELAE van de una en una, con 1,5 s entre ellas: en ráfagas su antibots (Akamai) bloquea a ratos con 403 o 406, y la app lo trata como un fallo más (reintentos y respaldo).
- Sin caché persistente: todo en memoria. La página (TV y tablet) se recarga sola cada día a las 05:00.

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
- Sin `VITE_SANITY_PROJECT_ID` la app funciona sin respaldo de Sanity (lo avisa en la consola).

## Sanity

Los editores trabajan en el Studio alojado: **https://quini.sanity.studio**. El repo solo contiene los esquemas (`sanity/schemas/`) y la configuración para publicarlos (`sanity.config.ts`, `sanity.cli.ts`).

| Documento | Uso |
|---|---|
| Sorteo (`lotteryDraw`) | Resultado introducido a mano para un juego y fecha. Respaldo cuando SELAE falla |
| Ajustes del kiosko (`kioskSettings`) | Documento único. `forcedGames`: juegos que la pantalla lee de Sanity aunque SELAE funcione |
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
3. [`vercel.json`](vercel.json) redirige todas las rutas a `index.html` para que `/quini` y `/slide` funcionen al abrirlas directamente.

## Kiosco

SELAE no envía cabeceras CORS, así que el navegador de la TV necesita una extensión que permita CORS (que añada `Access-Control-Allow-Origin`), activada para `loteriasyapuestas.es`. No hay proxy: una IP de servidor en la nube tiene riesgo de bloqueo.

TV:

1. Instalar la extensión anti-CORS en Chrome y activarla.
2. Abrir Chrome en modo kiosco con la URL del tablero, p. ej. `chrome --kiosk https://<dominio>/`.
3. Configurar el equipo para abrir Chrome así al arrancar.

Tablet: abrir `https://<dominio>/slide` a pantalla completa (no necesita la extensión: solo lee Sanity).

Las dos pantallas ocultan el cursor, no tienen scroll y se recargan solas a las 05:00.

## Estructura

```
src/
  domain/      tipos de dominio, catálogo de juegos, interfaces de repositorio
  data/        SELAE y Sanity: HTTP, mappers unknown → dominio, repositorios y fixtures
  app/         configuración, reloj, refresco, resolución de fuente, store y selectores
  ui/          tema, componentes y páginas (solo consume view models de app/selectors)
sanity/        esquemas publicados en el Studio
docs/          contrato de SELAE y plan del proyecto
```

## Aviso visible

> Resultados informativos; compruebe su boleto con los resultados oficiales.
