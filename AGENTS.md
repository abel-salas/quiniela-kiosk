# AGENTS.md

## Contexto del proyecto

Este repositorio es una app React + Vite + TypeScript para un tablón tipo kiosko de resultados de loterías españolas.

## Contrato real del proveedor

La app debe consultar este endpoint base:

https://www.loteriasyapuestas.es/servicios/buscadorSorteos

Parámetros usados por la app:
- game_id
- fechaInicioInclusiva
- fechaFinInclusiva
- celebrados=true

Ejemplos actuales generados por la lógica de `src/api/service.ts` (antes de la corrección):

BONO
https://www.loteriasyapuestas.es/servicios/buscadorSorteos?game_id=BONO&fechaInicioInclusiva=20261013&fechaFinInclusiva=20261013&celebrados=true

ELGR
https://www.loteriasyapuestas.es/servicios/buscadorSorteos?game_id=ELGR&fechaInicioInclusiva=20261013&fechaFinInclusiva=20261013&celebrados=true

LAPR
https://www.loteriasyapuestas.es/servicios/buscadorSorteos?game_id=LAPR&fechaInicioInclusiva=20261013&fechaFinInclusiva=20261013&celebrados=true

EMIL
https://www.loteriasyapuestas.es/servicios/buscadorSorteos?game_id=EMIL&fechaInicioInclusiva=20261013&fechaFinInclusiva=20261013&celebrados=true

LNAC
https://www.loteriasyapuestas.es/servicios/buscadorSorteos?game_id=LNAC&fechaInicioInclusiva=20261013&fechaFinInclusiva=20261013&celebrados=true

LAQU
https://www.loteriasyapuestas.es/servicios/buscadorSorteos?game_id=LAQU&fechaInicioInclusiva=20261013&fechaFinInclusiva=20261013&celebrados=true

## Regla que hemos validado

1. Esto no es un problema de formato de fecha simple `YYYYMMDD`; el problema real está en el adaptador del payload y en la ventana de consulta.
2. Para sorteos diarios, la consulta no debe limitarse solo al día actual; debe pedirse una ventana real de varios días (por ejemplo, 7 días para Bonoloto).
3. Para La Quiniela, la regla correcta es usar una ventana viernes-viernes.
4. Si el día actual aún no tiene resultado, se debe mostrar el último válido disponible.
5. No se debe saltar a una fecha futura sin tener extracción real del proveedor.
6. La app debe respetar el orden cronológico real del proveedor y renderizar repetidamente el mismo bloque por fila cuando haya historial.

## Estructura de la API real observada

Los JSON reales del proveedor suelen incluir claves como:
- fecha_sorteo
- dia_semana
- id_sorteo
- game_id
- anyo
- numero
- combinacion
- combinacion_acta
- premios
- escrutinio
- contenidosRelacionados

En Bonoloto, la combinación real se entrega como cadena, por ejemplo:
- "11 - 13 - 28 - 31 - 41 - 42 C(20) R(0)"

Es decir, no viene como un array plano `numeros` ni como un JSON de esquema uniforme para todos los juegos.

## Mapeo real que debemos asumir

- Bonoloto / La Primitiva / El Gordo / Euromillones / Lotería Nacional: la estructura real tiene que extraerse desde `combinacion`, `combinacion_acta`, `escrutinio`, `millon`, etc.
- La Quiniela usa `partidos`, `signo`, `signos`, `jornada`, `fecha_sorteo`, `plenoAl15` o variantes equivalentes.
- Hay que limpiar sufijos como `(m)` en nombres de equipos antes de mostrar.
- Debe manejarse la diferencia entre sorteos normales, extraordinarios, recuperados y actualizaciones tardías según el valor real de `fecha_sorteo` y el último sorteo válido disponible.

## Mocks y almacenamiento local

Los mocks actuales viven en:
- `src/mock/fixtures.ts`

La lógica de caché y fallback vive en:
- `src/api/service.ts`

Las claves del caché se construyen con el prefijo:
- `draw:`

Ejemplo de patrón:
- `draw:BONO:20261013`
- `draw:LAQU:20261009:20261016`

El modo mock se activa con:
- `VITE_USE_MOCK=true`

## Punto de atención actual

El error recurrente es asumir un esquema uniforme para todos los juegos cuando el proveedor entrega payloads distintos por `game_id`.

La app debe:
- adaptar cada `game_id` con su parser real
- no inventar fechas ni forzar un único día en la request
- renderizar una fila por día cuando la API devuelva un histórico
- guardar el último sorteo válido por fecha real y recargar solo cuando llegue el siguiente sorteo real

## Reglas para futuras modificaciones

- No asumir `payload.numeros` salvo que el JSON real lo traiga.
- No hardcodear una ventana de `hoy` para juegos diarios.
- No renderizar un único bloque para un conjunto de sorteos históricos.
- Cuando la API devuelva un array de días, preparar un array de filas y hacer `map` sobre él.
- Para La Quiniela, la lógica de negocio debe seguir la ventana viernes-viernes.

## Archivos clave

- `src/api/service.ts`
- `src/api/adapters.ts`
- `src/types.ts`
- `src/mock/fixtures.ts`
- `src/App.tsx`
