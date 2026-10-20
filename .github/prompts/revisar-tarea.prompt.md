---
description: "Revisa la última tarea implementada del kiosko contra el plan (docs/plan). Usar después de /tarea, p. ej. /revisar-tarea T03."
argument-hint: "ID de la tarea, p. ej. T03"
agent: "agent"
---
Revisa la implementación de la tarea indicada en el argumento. No implementes tareas nuevas.

1. Lee [AGENTS.md](../../AGENTS.md), la tarea en [08-tareas.md](../../docs/plan/08-tareas.md) y los documentos que enlaza.
2. Revisa los cambios sin commitear (`git status` y `git diff`).
3. Comprueba:
   - Cumple todos los puntos y el "Hecho cuando" de la tarea.
   - Respeta las capas de [01-arquitectura.md](../../docs/plan/01-arquitectura.md): la UI no importa `src/data/`; SELAE solo en `src/data/selae/`; Sanity solo en `src/data/sanity/`.
   - Los tests usan los valores reales de los fixtures y de los documentos.
   - Sin `any`, ficheros de 200 líneas o menos, sin código fuera del alcance.
4. Ejecuta `npm run typecheck`, `npm test` y `npm run build`.
5. Corrige los fallos pequeños directamente. Si algo requiere cambiar el plan, no lo cambies: indícalo.
6. Responde con una lista: correcto, corregido y pendiente de decidir.
