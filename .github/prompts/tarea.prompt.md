---
description: "Ejecuta una tarea o un bloque agrupable del backlog del kiosko (docs/plan/08-tareas.md). Usar con el ID o el rango, p. ej. /tarea T03 o /tarea T03-T05."
argument-hint: "ID de la tarea o bloque agrupable, p. ej. T03 o T03-T05"
agent: "agent"
---
Ejecuta la tarea indicada en el argumento o, si es un rango, cada tarea del rango **de una en una y en orden**.

0. Si el argumento es un rango, comprueba que coincide con un bloque agrupable de [08-tareas.md](../../docs/plan/08-tareas.md). Si no coincide, ejecuta solo la primera tarea del rango y avisa.

Para cada tarea:

1. Lee [AGENTS.md](../../AGENTS.md), [00-indice.md](../../docs/plan/00-indice.md) y la tarea en [08-tareas.md](../../docs/plan/08-tareas.md).
2. Si la tarea anterior no está marcada con ✅, detente y avisa.
3. Lee los documentos que la tarea enlaza y, si trabaja con datos, los fixtures de `src/data/selae/__fixtures__/`.
4. Implementa solo lo que pide la tarea. No toques ficheros fuera de su alcance ni adelantes tareas siguientes.
5. Escribe los tests que pide la tarea con los valores exactos de los documentos.
6. Ejecuta `npm run typecheck`, `npm test` y `npm run build` y corrige hasta que pasen. Si la tarea es anterior a T02 y no existen esos scripts, ejecuta solo `npm run build`.
7. Comprueba que ningún fichero nuevo supera 200 líneas y que no hay `any`.
8. Marca la tarea como hecha en `08-tareas.md` cambiando `**TNN ·` por `**TNN ✅ ·`.
9. Si algo falla y no lo puedes corregir, detente: no empieces la siguiente tarea del rango.

Al final, responde por cada tarea con: ficheros creados o modificados, comandos ejecutados con su resultado y dudas encontradas en los documentos.

Si un documento es ambiguo o contradice los fixtures, no inventes: detente y pregunta.
