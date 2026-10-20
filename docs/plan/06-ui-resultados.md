# Ruta `/`: resultados y próximos sorteos

TV horizontal, lienzo 1920×1080. `/quini` usa exactamente el mismo layout con los resultados leídos de Sanity.

## Layout

```
┌──────────────────────────────────────┬─────────────────────────┬──────────────────┐
│ COLUMNA 1: juegos de números         │ COLUMNA 2: fútbol        │ COLUMNA 3        │
│                                      │                          │ Próximos sorteos │
│ [■ BONOLOTO                        ] │ [■ LA QUINIELA  J. 13  ] │ ┌──────────────┐ │
│  mar 14/10 (08)(11)(21)(41)(47)(48) C R│  1 Villarreal–Nápoles 1│ │■ BONOLOTO    │ │
│  …7 líneas, la más reciente abajo    │  …                       │ │  1d 3h 49m   │ │
│ [■ EURODREAMS                      ] │ 15 Roma–R. Madrid  21:00 │ │  1.400.000 € │ │
│  lun 12/10 (03)(04)(06)(19)(30)(36) S│                          │ ├──────────────┤ │
│ [■ EL GORDO                        ] │ [■ EL QUINIGOL  J. 14  ] │ │■ EL GORDO    │ │
│  dom 11/10 (05)(27)(43)(49)(52) Clave│  1 Rayo–Athletic    0-0  │ │  6.800.000 € │ │
│ [■ LA PRIMITIVA                    ] │  …6 partidos             │ ├──────────────┤ │
│  lun 12/10 (02)…(45) C R [JOKER 4 781 884]                      │ │ …            │ │
│ [■ EUROMILLONES                    ] │                          │ │              │ │
│  mar 13/10 (21)…(49) ★4 ★11 [MILLÓN GRF94523]                   │ └──────────────┘ │
├──────────────────────────────────────┴─────────────────────────┴──────────────────┤
│ Actualizado 21:45                Resultados informativos; compruebe su boleto…   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

- Columna 3: ~20 % del ancho (384 px), a toda la altura del lienzo menos el pie.
- Columnas 1 y 2 se reparten el resto. Proporción inicial 60/40 entre ellas, a ajustar.
- Pie de 48 px con `StatusBar`.

### Columna 1: ¿una o dos subcolumnas?

Contenido máximo: 15 líneas (Bonoloto 7, EuroDreams 2, El Gordo 1, La Primitiva 3, Euromillones 2) y 5 cabeceras. En una sola columna, con cabeceras de 56 px y líneas de 48 px, no cabe con márgenes legibles. Si se parte en dos, la propuesta es Bonoloto + El Gordo (8 líneas) | EuroDreams + La Primitiva + Euromillones (7 líneas). Se decide al maquetar con datos reales.

## Semana en curso (pila)

Selector `selectWeekDraws(draws)`:
- `latest` = fecha del sorteo más reciente del juego.
- Se muestran los sorteos con `date > latest - 7 días`, en orden ascendente: el más antiguo arriba, el último abajo.
- Al entrar un sorteo nuevo sale el más antiguo: con el martes 20 entra `latest = 20/10` y el martes 13 deja de cumplir `> 13/10`.
- Resultado esperado: Bonoloto 7 líneas, La Primitiva 3, Euromillones 2, EuroDreams 2, El Gordo 1.
- Fútbol: solo la jornada más reciente.

## Tarjeta de juego de números

Estilo de la tarjeta de SELAE (`docs/referencia/card-primitiva.png`), sin elementos interactivos:
- `GameHeader`: barra del color del juego con logo y nombre. Sin fecha (la fecha va en cada línea).
- Una `DrawLine` por sorteo: fecha a la izquierda (`lun 19/10`), bolas rellenas con dos cifras (`04`) y, a la derecha y en la misma línea, los extras:

| Juego | Extras a la derecha |
|---|---|
| Bonoloto | C (bola clara), R (bola rellena) |
| La Primitiva | C, R, caja Joker con su logo y valor `2 240 325` |
| El Gordo | Clave (bola rellena) |
| Euromillones | 2 estrellas, caja Millón con su logo y código |
| EuroDreams | Sueño (bola rellena) |

## Tarjeta de La Quiniela

- `GameHeader` con "Jornada N".
- 15 `MatchRow`: posición, local – visitante y `SignBox`. Si el partido no se ha jugado, en lugar del signo se muestra la hora de inicio (`sáb 18:30`) y la casilla queda vacía.
- Fila 15 destacada como "Pleno al 15".
- Con `status: 'open'`: etiqueta "PROVISIONAL" en la cabecera.

## Tarjeta de El Quinigol

- Igual que La Quiniela con 6 partidos. El signo es el resultado (`0-0`, `M-2`).

## Columna de próximos sorteos

Referencia: `docs/referencia/proximos-sorteos.png` (solo en local).
- Fuente: lista de `proximosv3?game_id=TODOS&num=2` (2 sorteos por juego, ordenada por fecha).
- Selector `selectUpcomingTiles(upcoming, now)`: un `UpcomingTile` por juego, el **primer** elemento de ese juego en la lista cuya venta no haya cerrado (`salesCloseAt` null o posterior a `now`). Las filas salen **en el orden en que llegan de la API** (posición del elemento elegido).
- Tile: bloque de color con logo blanco a la izquierda; a la derecha el nombre en color de marca, cuenta atrás arriba a la derecha y el importe grande.
- Tests con `TODOS.next.json`:
  - `now = 2026-10-20T12:00` → EMIL, BONO, LOTU, QUPL, LAQU, QGOL, LAPR, EDMS, LNAC (jueves), ELGR.
  - `now = 2026-10-20T19:00` → LOTU y QUPL ya cerraron (18:15) y pasan a su sorteo del domingo: EMIL, BONO, LAQU, QGOL, LAPR, EDMS, LNAC, ELGR, LOTU, QUPL.
- Importe: se replica la lógica del menú de la web de SELAE (`docs/referencia/selae/index.html`, funciones `formatHighlightedCurrency`, `extractEDMSDraw` y plantillas `header-template-topaz-*`). Con los 2 sorteos del juego ordenados por fecha, se recorren en orden y se toma el primero que cumpla, solo si `salesOpen`:
  1. `jackpot` no nulo (excepto LNAC).
  2. `nacionalSpecialPrize` no nulo.
  3. `nacionalFirstPrize` no nulo.
  Si ninguno cumple, la fila va **sin importe** (solo nombre y cuenta atrás), igual que en SELAE.
- EuroDreams: primer sorteo con `salesOpen`; importe `jackpot` si no es nulo, si no `upcomingDefaultAmount` (20.000). Siempre con la nota "al mes durante 30 años".
- LNAC: nota con el día del sorteo ("sábado") y la etiqueta de SELAE: `1er premio a la serie` o `Premio especial al décimo`. Formato: `jueves · 1er premio a la serie`.
- Tests con `TODOS.next.json` y `now = 2026-10-20T12:00`:
  - La Quiniela: jornada 15 sin bote y jornada 16 con `salesOpen: false` → sin importe.
  - Quinigol: `120.000 €`. Lotería Nacional: `300.000 €` (jueves).
  - EuroDreams: `50.000 €` + "al mes durante 30 años" (SELAE envía `premio_bote: "50000"`).
- Cuenta atrás hasta `salesCloseAt` (`formatCountdown`), actualizada cada minuto. Sin `salesCloseAt`, no se muestra cuenta atrás.

## Estados

| Estado | Qué se pinta |
|---|---|
| Sin datos | Tarjeta con cabecera y "Pendiente de resultado" |
| `awaitingResult` | Semana actual + chip "Resultado de hoy pendiente" en la cabecera |
| `provisional` | Datos parciales + etiqueta "PROVISIONAL" |
| Llega el definitivo | Fundido de 400 ms; desaparecen chip y etiqueta |

## Selector (`app/selectors/results.ts`)

`selectBoardView(snapshot, now): BoardView` devuelve view models con todos los textos formateados. Tests con los fixtures mapeados y `now = 2026-10-14T22:00:00`.
