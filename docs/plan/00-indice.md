# Plan de reconstrucción: kiosko de resultados

Tablón de resultados para una administración de loterías. Una TV horizontal muestra resultados y próximos sorteos; una tablet aparte muestra imágenes promocionales. Sin interacción y con refresco automático.

## Documentos

| Fichero | Contenido |
|---|---|
| [../contexto-apis.md](../contexto-apis.md) | Contrato real de SELAE: endpoints, catálogo, unidades, botes |
| [01-arquitectura.md](01-arquitectura.md) | Capas, carpetas, rutas y reglas de dependencia |
| [02-dominio.md](02-dominio.md) | Modelos de dominio y catálogo de juegos |
| [03-datos-selae.md](03-datos-selae.md) | Cliente HTTP, tipos raw y mappers por petición de SELAE |
| [04-refresco.md](04-refresco.md) | Ciclo de llamadas, calendario, caché por premio y carga manual (`/cms`) |
| [05-ui-sistema.md](05-ui-sistema.md) | Sistema visual al estilo de loteriasyapuestas.es |
| [06-ui-resultados.md](06-ui-resultados.md) | Ruta `/`: resultados + columna de próximos sorteos |
| [07-sanity.md](07-sanity.md) | Sanity: slides de `/slide` |
| [08-tareas.md](08-tareas.md) | Backlog de tareas atómicas con criterios de aceptación |

## Decisiones cerradas

- **Rutas**: `/` (TV, resultados + próximos sorteos), `/slide` (tablet, solo imágenes de Sanity), `/cms` (carga manual de resultados). `/` y `/cms` llevan abajo a la izquierda un menú con tres iconos hacia `/`, `/slide` y `/cms`; `/slide` no lo lleva. `/quini` se ha eliminado.
- **Fuentes**: SELAE es la fuente de resultados y botes. El respaldo es manual, en `/cms`. Sanity solo aporta las imágenes de `/slide`.
- **Ciclo de llamadas**: al arrancar y a las 09:15, en orden fijo (botes, Quiniela, Quinigol, Bonoloto, Euromillones, Primitiva, Gordo, EuroDreams). Antes de llamar se mira `localStorage`; si una petición falla dos veces, se mantiene lo guardado y se pasa a la siguiente.
- **Sin proxy**: el navegador del kiosko usa una extensión anti-CORS. Se elimina el proxy de Vite.
- **Caché local**: una entrada de `localStorage` por premio, válida 1 semana, que solo se reescribe con datos buenos. `?mock=1` no la usa.
- **Diseño**: réplica del estilo de https://www.loteriasyapuestas.es/es/resultados (colores, logotipos y bolas de cada juego), sin elementos interactivos.
- **Alcance de resultados**: Bonoloto, EuroDreams, El Gordo, La Primitiva, Euromillones (columna 1); La Quiniela y Quinigol (columna 2).
- **Próximos sorteos**: columna 3, vertical, ~20 % del ancho, a toda la altura.
- **Semana en curso**: cada juego muestra los sorteos de los últimos 7 días, en pila. Al entrar un sorteo nuevo sale el más antiguo (entra el martes 20, sale el martes 13). Quiniela y Quinigol muestran solo la última jornada finalizada.
- **Sanity en la nube**: solo se usa el Studio alojado por Sanity. El repo solo conserva los esquemas y la configuración mínima para publicarlos.

## Reglas para quien ejecute las tareas

- Ejecutar una sola tarea de [08-tareas.md](08-tareas.md) por sesión, en orden, salvo los bloques agrupables que indica ese fichero.
- Leer antes los documentos que la tarea indica. No modificar ficheros fuera del alcance de la tarea.
- Cada fichero de código debe tener 150 líneas o menos; el límite duro es 200.
- Prohibido `any`. Los datos externos (SELAE y Sanity) entran como `unknown` y se validan en su mapper.
- Los componentes de UI no importan nada de `src/data/`.
- Toda lógica de transformación es una función pura con test.
- No inventar campos del proveedor: si no está en los fixtures de `src/data/selae/__fixtures__/`, no existe.
- Al terminar: `npm run typecheck`, `npm test` y `npm run build` deben pasar.

## Decisiones abiertas

| Tema | Estado |
|---|---|
| Columna 1: una columna de 5 juegos o dos subcolumnas (3 + 2) | Cerrada en T23: una sola columna con tamaños compactos; ver [06-ui-resultados.md](06-ui-resultados.md) |
