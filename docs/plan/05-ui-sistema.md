# Sistema visual

La interfaz replica el estilo de https://www.loteriasyapuestas.es/es/resultados: cabecera de color por juego con su logotipo, bolas rellenas del color del juego y fondo claro. Se eliminan todos los elementos interactivos de la web original ("+ Info", "Ver por orden de aparición", icono de estadísticas, "Otros resultados").

Referencias locales en `docs/referencia/` (en `.gitignore`; pueden no existir en otro equipo). Este documento recoge todos los valores necesarios para no depender de ellas:
- `card-primitiva.png`, `card-euromillones.png`: tarjetas de resultado de la web de SELAE.
- `proximos-sorteos.png`: diseño de la columna de próximos sorteos.
- `selae/index.html` + `selae/index_files/`: página de resultados guardada (HTML, CSS `loterias_sass.css` y SVG).

## Escenario de la TV (`ui/stage/`)

- Ruta `/` y `/quini` se diseñan sobre un lienzo fijo de 1920×1080 px.
- `Stage` escala el lienzo con `transform: scale(min(innerWidth/1920, innerHeight/1080))`, centrado.
- Dentro del lienzo todas las medidas en px; prohibido `vw`/`vh`.
- `body` sin scroll ni cursor (`cursor: none`).
- `/slide` no usa `Stage`: ocupa la pantalla de la tablet completa.

## Colores (`ui/theme/tokens.css`)

Color de marca por juego, extraído de `loterias_sass.css` (`.c-ultimo-resultado__cabecera--*`, `__combinacion-li--*`) y de los SVG `bt-*.svg`:

| Token | Juego | Color | Origen |
|---|---|---|---|
| `--game-bono` | Bonoloto | `#7a8634` | `cabecera--bonoloto` |
| `--game-edms` | EuroDreams | `#6e368c` | `bt-eurodreams.svg` |
| `--game-elgr` | El Gordo | `#dc3f47` | `cabecera--elgordo` |
| `--game-lapr` | La Primitiva | `#008547` | `cabecera--primitiva` |
| `--game-emil` | Euromillones | `#001367` | `cabecera--euromillones` |
| `--game-laqu` | La Quiniela | `#cb1517` | `cabecera--quiniela` |
| `--game-qgol` | El Quinigol | `#74bacd` | `combinacion-li--quinigol` |
| `--game-lnac` | Lotería Nacional | `#007ac0` | `cabecera--loteria-nacional` |
| `--game-qupl` | Quíntuple Plus | `#eab842` | `cabecera--quintuple` |
| `--game-lotu` | Lototurf | `#d16929` | `cabecera--lototurf` |

- Variante clara por juego (`--game-*-soft`) para el complementario: mismo tono con mucha luminosidad y texto en el color de marca (ver `card-primitiva.png`).
- Fondo de página, tarjeta, texto (`#575756`) y fondos neutros (`#f6f6f6`): del mismo CSS.
- Separación por espacio y sombra suave; sin bordes salvo la caja del Joker/Millón.

## Tipografía

- Public Sans (la de SELAE: `PublicSans-Regular`, `-SemiBold`, `-Bold`), autoalojada con `@fontsource/public-sans` (licencia OFL).
- Números con `font-variant-numeric: tabular-nums`.

## Logotipos (`ui/assets/logos/`)

Ya están en el repo, copiados de la web de SELAE:

```
BONO.svg  EDMS.svg  ELGR.svg  LAPR.svg  EMIL.svg  LAQU.svg  QGOL.svg
LNAC.svg  QUPL.svg  LOTU.svg  JOKER.svg  MILLON.svg
```

- Los logos de juego son blancos: se usan sobre el bloque de color (cabecera de tarjeta y bloque izquierdo de la columna de próximos).
- `JOKER.svg` y `MILLON.svg` son a color: van en la caja blanca de Joker (La Primitiva) y Millón (Euromillones).
- `GAMES[id].logo` apunta a `{id}.svg`.
- Nunca se enlazan imágenes de loteriasyapuestas.es en caliente: siempre ficheros locales.

## Reglas copiadas de la web de SELAE

Comprobadas en `docs/referencia/selae/index.html` (tarjetas `.c-ultimo-resultado__*`):

- Bolas de combinación y estrellas con dos cifras (`04`, `06`). Complementario, reintegro, clave y sueño sin relleno (`7`, `1`).
- Etiquetas encima de cada extra: `C`, `R`, `Nº clave` (El Gordo), `SUEÑO` (EuroDreams). Estrellas de Euromillones con su propio estilo de bola.
- Joker: logo `JOKER.svg` + número en grupos de 3 separados por espacio (`2 240 325`). Millón: logo `MILLON.svg` + código (`GSF54318`).
- Bolas: `border-radius: 50%` y sombra `0 1px 5px rgba(0,0,0,.1)`; complementario en variante clara. Copiar las reglas de `loterias_sass.css` y escalar tamaños para la TV.
- Cabecera de fútbol: `Jornada 14ª`.
- Filas de La Quiniela: `1.` + `Local - Visitante` + marcador (`0-1`) + casilla de signo del color del juego; filas alternas sombreadas.
- Filas de Quinigol: igual, con el resultado (`0-1`) dentro de la casilla de signo.
- Equipos con el sufijo `(M)` tal como lo muestra SELAE.
- Lotería Nacional en próximos sorteos: etiqueta `1er premio a la serie`, o `Premio especial al décimo` cuando el importe sale de `premio_especial`.
- No se copia el formato "59 millones" del menú de SELAE: la columna de próximos usa el importe completo como en `proximos-sorteos.png` (`1.400.000 €`).

## Componentes base (`ui/components/`)

Reciben view models ya formateados; no formatean ni calculan.

| Componente | Props | Uso |
|---|---|---|
| `GameHeader` | `name; logo; color; dateText?` | Barra de color con logo y nombre, como la web de SELAE |
| `Ball` | `value: string; color: string; variant: 'solid' \| 'soft'` | Bola rellena (número, reintegro) o clara (complementario) |
| `BallRow` | `values: string[]; color` | Bolas de la combinación |
| `ExtraBall` | `label: string; value: string; color; variant` | Bola con etiqueta encima (C, R, Clave, Sueño, ★) |
| `AddOnBox` | `logo: string; value: string` | Caja blanca con logo de Joker o Millón y su valor |
| `DrawLine` | `dateText; balls; extras; addOn?` | Una línea por sorteo: fecha a la izquierda, bolas, extras y Joker/Millón a la derecha |
| `SignBox` | `sign: string \| null; color` | Casilla 1/X/2 o resultado de Quinigol |
| `MatchRow` | `position; home; away; detail; sign; highlight?` | Fila de partido |
| `UpcomingTile` | `name; logo; color; amount; note?; countdown` | Fila de próximos sorteos (ver captura) |
| `StatusBar` | `updatedText; notice` | Pie con última actualización y aviso legal |

## Formato (`app/format/`)

Funciones puras con tests, usadas por los selectores:
- `formatBall(4)` → `"04"` (dos cifras).
- `formatLineDate('2026-10-19')` → `"lun 19/10"`.
- `formatHeaderDate('2026-10-19')` → `"lun - 19/10/2026"`.
- `formatJoker('2240325')` → `"2 240 325"` (grupos de 3 desde la derecha, separados por espacio).
- `formatAmount(1400000)` → `"1.400.000 €"`.
- `formatCountdown(from, to)` → `"1d 3h 49m"`, `"3h 19m"`, `"45m"`; si `to ≤ from` → `null`.

## Movimiento

- Solo fundidos de 400 ms al cambiar un dato. Sin animaciones decorativas.
- Respetar `prefers-reduced-motion`.
