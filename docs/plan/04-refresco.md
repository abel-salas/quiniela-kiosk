# Refresco, caché y carga manual

Todo en `src/app/`. La TV está encendida todo el día y nadie recarga la página: la app se actualiza sola, llama a SELAE solo cuando un premio tiene datos nuevos y conserva el último valor bueno si la API falla. Si SELAE no responde, los resultados se cargan a mano desde `/cms`.

## Caché por premio (`store/entry-cache.ts`)

- Una entrada de `localStorage` por premio: `quiniela:results:{ID}` para cada juego de resultados y `quiniela:upcoming` para los botes (`proximosv3`).
- Cada entrada guarda `{ version: 1, savedAt, draws | upcoming }`. `savedAt` es el instante ISO del último guardado correcto.
- Caducidad: **1 semana** desde `savedAt`. JSON inválido, versión desconocida, datos con forma incorrecta (incluidos sorteos de otro juego) o caducados se descartan y se borran.
- Solo se escribe tras una respuesta correcta de SELAE o un guardado desde `/cms`. Un fallo nunca borra ni sobrescribe la entrada.
- `setItem` puede fallar por cuota o modo privado; el guardado es best-effort y no afecta al tablero en memoria.
- `?mock=1` usa un almacenamiento en memoria y no toca `localStorage`. Al arrancar se borran las claves antiguas `draw:*` y la caché única anterior `quiniela:board:v1`.

## Ciclo de llamadas (`refresh/scheduler.ts`)

Un ciclo recorre los premios **en este orden** y de uno en uno:

`botes → LAQU → QGOL → BONO → EMIL → LAPR → ELGR → EDMS`

Para cada premio:

1. Leer su entrada de `localStorage` (puede haberla actualizado `/cms`) y pintarla.
2. Si con lo guardado no toca llamar (ver calendario), pasar al siguiente.
3. Llamar a SELAE. Si falla, un reintento a los 5 s. Si los **2 intentos** fallan, se conserva el valor guardado y se pasa al siguiente premio; ese premio no se vuelve a intentar hasta el próximo ciclo.
4. Si responde: combinar por `date` con lo guardado, recortar a la ventana y guardar la entrada.

Ciclos: al arrancar la página y cada día a las **09:15** (`MORNING_REFRESH_AT`). Como la página se recarga a las 05:00, un premio que falló se vuelve a intentar a las 05:00 y a las 09:15.

Cola global: una petición a SELAE cada vez y 1,5 s entre arranques. Tras un error `blocked`, `network` o `timeout`, pausa la cola 20 s; `invalid` no la pausa.

## Calendario (`refresh/calendar.ts`)

Funciones puras. Los sorteos de números se piden la mañana siguiente al sorteo, a partir de las 09:15:

| Juego | Días de sorteo | Se llama |
|---|---|---|
| Bonoloto | todos | cada día |
| Euromillones | martes, viernes | miércoles, sábado |
| La Primitiva | lunes, jueves, sábado | martes, viernes, domingo |
| El Gordo | domingo | lunes |
| EuroDreams | lunes, jueves | martes, viernes |

- **Números** (`isResultsDue`): se calcula el último sorteo cuya mañana siguiente ya ha pasado (`expectedDrawDate`). Solo se llama si la entrada guardada no tiene un sorteo con esa fecha o posterior. Así, si ya se cargó desde `/cms`, no se llama.
- **Quiniela y Quinigol** (`footballDueAt`): si lo último guardado es una jornada abierta con partidos, se llama la mañana siguiente al último partido. Si no (jornada final o sin horarios), se llama a las 09:15 del tercer día tras el último guardado.
- **Botes** (`isUpcomingDue`): una vez al día, en el primer ciclo desde las 09:15.

## Ventana de consulta (`source/window.ts`)

`buscadorSorteos` con los últimos **7 días** hasta hoy para los juegos de números y **14 días** para Quiniela y Quinigol, para que la jornada finalizada anterior siga dentro mientras la siguiente está abierta. La misma ventana se usa en los enlaces de `/cms`.

## Qué se muestra

- Números: la pila de la semana del último sorteo (`selectors/week.ts`).
- Quiniela y Quinigol: **solo la última jornada finalizada**. Una jornada abierta (`combinacion: null`) se guarda para planificar, pero no se pinta: se sigue mostrando la anterior.
- Sin datos: "Pendiente de resultado".
- `lastUpdatedAt` (pie: "Actualizado HH:mm") es el `savedAt` más reciente de las entradas.

## Carga manual (`/cms`, `cms/cms.ts`)

- Un bloque por juego de resultados (no hay bloque de botes), en el orden del ciclo: logo, nombre, enlace que abre en otra pestaña la petición `buscadorSorteos` del juego con su ventana, caja de texto y botón "Guardar".
- Al guardar, el JSON se valida con el mismo mapper de SELAE (`data/selae/importer.ts`, interfaz `ResultsImporter`). Se rechaza si no es JSON, si no trae sorteos de ese juego o si todos son anteriores a la ventana.
- Lo válido se combina con la entrada del juego y se guarda en `localStorage`. Un tablero abierto en otra pestaña lo recibe por el evento `storage` y lo pinta al momento.

## Store (`store/`)

```ts
createBoardStore(deps: { selae: SelaeRepository; clock: Clock; persist?: boolean; ... }): {
  getSnapshot(): BoardSnapshot; subscribe(l: () => void): () => void; start(): void; stop(): void;
}
```

- `BoardSnapshot = { results: Record<ResultGameId, { draws }>; upcoming; lastUpdatedAt }`, inmutable.
- `start()`: borra claves antiguas, pinta las entradas guardadas, lanza un ciclo y programa el ciclo de las 09:15, la recarga de las 05:00 (`DAILY_RELOAD_AT`) y la escucha de cambios de `localStorage`.
- El store se crea en `main.tsx` y se pasa por contexto.
