# Contexto: fuentes de datos de resultados

Documento de referencia para consumir resultados y botes. Datos verificados el 2026-10-14.

## Decisiones

- Fuente principal: SELAE. Respaldo manual: Sanity (ver `docs/plan/07-sanity.md`). Sin proxy ni widgets de terceros.
- La app es estática; el kiosko accede a SELAE con la extensión anti-CORS de Chrome.
- Resultados de 7 juegos (BONO, EDMS, ELGR, LAPR, EMIL, LAQU, QGOL) y próximos sorteos de los 10 del catálogo.

## SELAE (`https://www.loteriasyapuestas.es/servicios/`)

API interna no documentada de la web oficial. Respuestas JSON.

| Endpoint | Uso | Devuelve |
|---|---|---|
| `buscadorSorteos?game_id&fechaInicioInclusiva&fechaFinInclusiva&celebrados=true` | Resultados en rango | Array de sorteos celebrados, `[]` si no hay |
| `fechav3?game_id&fecha_sorteo` | Resultado de una fecha exacta | Mismo esquema que `buscadorSorteos` |
| `fechav3` con la fecha de la **próxima** jornada (LAQU, QGOL) | Partidos de la próxima jornada | `jornada`, `partidos[] { local, visitante, fecha }`, `combinacion: null` |
| `proximosv3?game_id&num` | **Próximos** sorteos (futuros) | `fecha`, `apertura`, `cierre`, `estado`, `premio_bote` (solo el 1º) |

- Sin registros, `buscadorSorteos` y `fechav3` responden un **string** (`"No se ha encontrado ningún registro…"`), no `[]`.
- `celebrados=false` no devuelve sorteos futuros.
- En `fechav3` futuro, `partidos[].fecha` llega como `"2026\/10\/17 14:00:00"` con barras invertidas literales en el valor.

- `proximosv3` **no devuelve resultados**: con `EMIL&num=2` devuelve los sorteos del 16/10 y 20/10, sin `combinacion`. Sirve para planificar el refresco y mostrar bote, no para pintar resultados.
- No existe endpoint de "últimos N celebrados" (`buscadorUltimosSorteosCelebrados` da 404). Los últimos N se obtienen con `buscadorSorteos` y una ventana suficiente, recortando a N.
- `resultados1?game_id&num` no se usa: devuelve siempre el mismo JSON de LNAC, ignora el `game_id` que se pase.
- `id_sorteo` sigue el patrón `cdc(5) + juego(2) + numero(3)` (p. ej. `1325702083`). No hay endpoint verificado de resultado por `id_sorteo`.

Acceso:
- Protegido por Akamai. Responde `403 Access Denied` según cabeceras e IP. Con `Accept`, `Accept-Language` y `User-Agent` de navegador responde 200; con cabeceras mínimas, 403. El bloqueo es intermitente.
- En ráfagas desde el navegador también responde a ratos `406` (observado el 2026-10-20: 4 de 8 peticiones seguidas con 406 y, minutos después, las mismas peticiones con las mismas cabeceras, todas 200). No depende de `Accept` ni de `cache`.
- **No envía `Access-Control-Allow-Origin`**: desde navegador solo funciona con la extensión anti-CORS del kiosko.
- `Cache-Control: max-age=900`.

Calidad del dato:
- Esquema distinto por `game_id`. `combinacion` es string a parsear (`"02 - 05 - 26 - 40 - 42 - 45 C(23) R(9)"`).
- Quiniela: `partidos[]` con `local`, `visitante` (sufijo `(m)`), `signo` (con espacios, `"X "`), `marcador`, `fecha_completa`. Jornada en curso llega con `combinacion: null`.
- Lotería Nacional completa: primer/segundo premio, reintegros, extracciones, importes en céntimos.
- Joker, El Millón y escrutinio completos.

## Catálogo de juegos

Los 10 `game_id` responden en `buscadorSorteos` y `proximosv3`. No hay más juegos SELAE; Joker (`LAJO`), El Millón (`LAMI`) y Elige 8 llegan embebidos en su juego padre.

| `game_id` | Juego | Calendario observado | `combinacion` (ejemplo real) | Campos propios |
|---|---|---|---|---|
| LNAC | Lotería Nacional | Jueves 21:00, sábado 13:00 y extraordinarios (lunes 12/10) | `null` | `nombre`, `primerPremio`, `segundoPremio`, `tercerosPremios`…`reintegros`, `premioEspecial`, `precioDecimo` |
| EMIL | Euromillones | Martes, viernes | `" 21 - 23 - 39 - 44 - 49 - 04 - 11"` (5 + 2 estrellas) | `millon`, `escrutinio_millon` |
| LAPR | La Primitiva | Lunes, jueves, sábado | `"02 - 05 - 26 - 40 - 42 - 45 C(23) R(9)"` | `joker`, `escrutinio_joker` |
| BONO | Bonoloto | Diario | `"08 - 11 - 21 - 41 - 47 - 48 C(34) R(4)"` | — |
| ELGR | El Gordo de la Primitiva | Domingo | `"05 - 27 - 43 - 49 - 52 R(4)"` (R = número clave) | — |
| LAQU | La Quiniela | Por jornada (domingo y entre semana) | `"X - 2 - 1 - … - 1 - 10"` (14 signos + pleno); `null` con jornada abierta | `jornada`, `partidos`, `elige8` |
| QGOL | Quinigol | Por jornada | `" 00 - 12 - M0 - M2 - M2 - 10"`; `null` con jornada abierta | `jornada`, `partidos` (`signo` = `"0-0"`, `"M-2"`) |
| LOTU | Lototurf | Irregular (domingo y entre semana) | `"1 - 2 - 3 - 22 - 23 - 24 C(5) R(1)"` (C = caballo) | `jornada` |
| EDMS | EuroDreams | Lunes, jueves | `"03 - 04 - 06 - 19 - 30 - 36 C(2)"` (C = número sueño) | — |
| QUPL | Quíntuple Plus | Irregular (domingo y entre semana) | `"4 - 6 - 10 - 5 - 4 C(8)"` | `jornada` |

## Calendario y refresco

- Los calendarios no son fijos por día de la semana (LOTU, QUPL, QGOL, extraordinarios de LNAC). No se deben derivar ventanas de consulta de días de la semana fijos.
- `proximosv3` da la fecha del siguiente sorteo de cada juego; es la base del planificador de refresco.
- `proximosv3.fecha` llega a `00:00:00` en los juegos de números (sin hora real del sorteo); en LNAC trae la hora del sorteo. `cierre` es la hora límite de venta.
- `cierre` del segundo elemento no siempre es fiable: en LAPR trae el mismo `cierre` que el primero. En jornadas futuras de LAQU, QGOL y QUPL llega `null` con `estado: "cerrado"`.
- En resultados, `fecha_sorteo` con hora `00:00:00` y `combinacion: null` indica jornada abierta (LAQU, QGOL): hay datos parciales y el resultado definitivo llegará después.
- Para "últimos N" se consulta `buscadorSorteos` con una ventana amplia (p. ej. 30 días) y se recorta a N por `fecha_sorteo` descendente.

## Botes y próximos sorteos

La web de SELAE pide todos los juegos de una vez con `proximosv3?game_id=TODOS&num=2` (atributo `data-json-service-url` de su cabecera). La app usa esa misma llamada. Respuesta real en `TODOS.next.json` (2026-10-20):

- 20 elementos: 2 próximos sorteos por cada uno de los 10 juegos.
- Orden: ascendente por `fecha`; los de la misma fecha, en el orden propio de SELAE (EMIL, BONO, LOTU, QUPL…).
- LNAC aparece con sus dos sorteos (jueves 300.000 €, sábado 600.000 €), cada uno con su `nombre` y `precio`.
- `premio_bote` no es exclusivo del primer elemento de cada juego: LAQU trae `null` en la jornada 15 y `"2500000"` en la 16.

Con `game_id={ID}&num=1` se obtiene solo un juego (lo que hay en `{ID}.next.json`).

| `game_id` | Campo | Ejemplo | Notas |
|---|---|---|---|
| EMIL | `premio_bote`, `millon.importe` | `"49000000"`, `1000000` | |
| LAPR | `premio_bote`, `joker.bote_joker` | `"36500000"`, `1000000` | |
| ELGR | `premio_bote` | `"19300000"` | |
| LAQU | `premio_bote`, `jornada` | `"2000000"`, `14` | |
| LOTU | `premio_bote`, `jornada` | `"1875000"`, `65` | |
| BONO | `premio_bote` | `"700000"` | |
| QUPL | `premio_bote`, `jornada` | `"10000"`, `65` | |
| EDMS | `premio_bote` | `"50000"` | La web de SELAE lo pinta como importe mensual ("al mes durante 30 años"); sin `premio_bote` pinta 20.000 por defecto |
| LNAC | `nombre`, `primer_premio`, `precio`, `premio_especial` | `"SORTEO DEL JUEVES"`, `300000`, `3` | Sin bote: se muestra el primer premio por serie |
| QGOL | — | `null` | Sin bote |

Comunes: `fecha`, `cierre`, `estado` (`abierto`/`cerrado`), `destacar_bote` (`"0"`/`"1"`, flag del proveedor para resaltar).

## Unidades de importes

- `proximosv3.premio_bote`: string en euros (`"49000000"`).
- `proximosv3.millon.importe`, `joker.bote_joker`, LNAC `primer_premio`: número en euros (LNAC por serie).
- Resultados LNAC `prize`: número en céntimos por décimo (`13000000` = 130.000 €).
- Escrutinio `premio`: string con coma decimal (`"46102,13"`).

Cada mapper convierte estos valores a euros numéricos; el dominio no conoce unidades del proveedor.

## Fixtures reales

`src/data/selae/__fixtures__/` contiene respuestas capturadas el 2026-10-14 (sin `contenidosRelacionados`):
- `{ID}.results.json`: `buscadorSorteos` de los últimos 30 días, recortado a 3 sorteos (2 en LNAC).
- `{ID}.next.json`: `proximosv3?num=2`.
- `TODOS.next.json`: `proximosv3?game_id=TODOS&num=2`, capturado el 2026-10-20.
- `LAQU.upcoming.json`, `QGOL.upcoming.json`: `fechav3` de la jornada del 18/10.
- `no-records.json`: respuesta sin registros.

## Descartado

- Widget de combinacionganadora.com: devuelve JS con un JSON embebido (`bamwSorteos`) dependiente de una `key`, de un tercero, con solo los 5 últimos sorteos y Lotería Nacional incompleta.
- Proxy serverless: una IP de nube tiene riesgo de bloqueo por Akamai.
