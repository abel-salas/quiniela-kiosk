# Pendiente - Nuevo Proyecto Quiniela

> **Documentación principal:** Ver [AGENTS.md](./AGENTS.md) para contexto completo del proyecto.

## Datos de API Completados

### proximosv3 - Próximos sorteos con botes
✅ Todos los JSONs completados:

1. ✅ **BONO** - `api-examples/bono-proximosv3.json`
2. ✅ **ELGR** - `api-examples/elgr-proximosv3.json`
3. ✅ **EMIL** - `api-examples/emil-proximosv3.json`
4. ✅ **LNAC** - `api-examples/lnac-proximosv3.json`
5. ✅ **LAQU** - `api-examples/laqu-proximosv3.json`

## Configuración Sanity

### 1. ✅ Configuración completada
- ✅ Sanity instalado como dependencia
- ✅ Sanity client configurado en `src/sanity/client.ts`
- ✅ Queries GROQ implementadas en `src/sanity/queries.ts`
- ✅ Types de Sanity definidos en `src/types/sanity.ts`
- ✅ Credenciales configuradas en `.env`
  - Project ID: lkywbgau
  - Dataset: production
  - API Token configurado

### 2. ✅ Schemas creados localmente

#### Schema: lotteryDraw (`sanity/schemas/lotteryDraw.ts`)
Usar para resultados de quiniela en `/quini`
- Campos base: game, date, scheduledDate, status, updatedAt
- Campos adicionales: combinacion, combinacionActa
- Campos por juego: numbers, complementario, reintegro, joker, stars, clave, primerPremio, segundoPremio, reintegros, jornada, fecha, fecha_completa, signs, matches, plenoAl15
- Campos condicionales con `hidden` según el tipo de juego

#### Schema: slide (`sanity/schemas/slide.ts`)
Usar para slides personalizados en `/slide`
- Campos: image, title, order

### 3. ✅ Documentos de prueba creados
- 6 documentos `lotteryDraw` creados en Sanity (uno por juego)
- Juegos: BONO, ELGR, LAPR, EMIL, LNAC, LAQU
- Datos basados en ejemplos de API reales

### 4. ⏳ Pendiente
- Deployar schemas a Sanity dashboard
- Implementar rotación automática de slides en `/slide`

## Decisión de Styling

### Framework de Styling
✅ **CSS tradicional** (sin framework)
- Scoping con naming conventions (BEM-like)
- Sin dependencias adicionales
- Simple y directo

## Implementación

### Fase 1: Estructura base
- [x] Crear proyecto nuevo con Vite + React + TypeScript
- [x] Configurar estructura de carpetas según ARCHITECTURE_PLAN.md
- [x] Configurar types básicos en `types/`
- [x] Configurar HttpClient en `services/http/`

### Fase 2: Adaptadores y servicios
- [x] Implementar `DateWindowCalculator` en `services/lottery/`
- [x] Implementar adaptadores de `buscadorSorteos` en `services/adapters/normalize/`
- [x] Implementar `LotteryService` en `services/lottery/`
- [x] Implementar `CacheService` en `services/cache/`

### Fase 3: Componentes UI base
- [x] Implementar componentes atómicos en `components/ui/`
  - [x] NumberStrip.tsx
  - [x] LotteryIcon.tsx
  - [x] Badge.tsx
- [x] Implementar cards por tipo de juego en `components/cards/`
  - [x] BonolotoCard.tsx
  - [x] PrimitivaCard.tsx
  - [x] EuromillonesCard.tsx
  - [x] GordoCard.tsx
  - [x] NacionalCard.tsx
  - [x] QuinielaCard.tsx
- [x] Implementar `BoardLayout` en `components/layout/`

### Fase 4: Ruta `/`
- [x] Implementar `useLotteryBoard` hook en `hooks/` (modo API)
- [x] Implementar página `/` con BoardLayout
- [x] Implementar `UpcomingFooter` en `components/layout/`
- [x] Implementar `useUpcomingDraws` hook
- [x] Probar con datos mockeados

### Fase 5: Integración Sanity
- [x] Configurar Sanity client en `sanity/client.ts`
- [x] Definir schemas en Sanity Studio
- [x] Implementar queries en `sanity/queries.ts`
- [x] Implementar types de Sanity en `types/sanity.ts`
- [x] Extender `useLotteryBoard` para modo Sanity
- [x] Implementar ruta `/quini` con BoardLayout (reutilizado)
- [x] Corregir schemas con campos faltantes
- [x] Crear documentos de prueba en Sanity

### Fase 6: Ruta `/slide`
- [x] Implementar adaptadores de `proximosv3` en `services/adapters/upcoming/`
- [x] Implementar `UpcomingService` en `services/lottery/`
- [x] Implementar `Slider` en `components/slider/`
- [x] Implementar `UpcomingSlide` en `components/slider/`
- [x] Implementar `SanitySlide` en `components/slider/`
- [x] Implementar ruta `/slide`
- [ ] Configurar rotación automática del slider (pendiente)

## Archivos de Referencia

### Planificación
- `ARCHITECTURE_PLAN.md` - Plan arquitectónico completo
- `DECISIONES_TECNICAS.md` - Decisiones técnicas ya tomadas
- `PENDIENTE.md` - Este archivo

### Ejemplos de API
- `api-examples/bono-buscador.json` ✓
- `api-examples/elgr-buscador.json` ✓
- `api-examples/lapr-buscador.json` ✓
- `api-examples/emil-buscador.json` ✓
- `api-examples/lnac-buscador.json` ✓
- `api-examples/laqu-buscador.json` ✓
- `api-examples/lapr-proximosv3.json` ✓
- `api-examples/bono-proximosv3.json` ✓
- `api-examples/elgr-proximosv3.json` ✓
- `api-examples/emil-proximosv3.json` ✓
- `api-examples/lnac-proximosv3.json` ✓
- `api-examples/laqu-proximosv3.json` ✓

### Ejemplos de API que NO funcionan
- `api-examples/emil-resultados1.json` ❌ (todos idénticos)
- `api-examples/bono-resultados1.json` ❌ (todos idénticos)
- `api-examples/elgr-resultados1.json` ❌ (todos idénticos)
- `api-examples/lapr-resultados1.json` ❌ (todos idénticos)
- `api-examples/lnac-resultados1.json` ❌ (todos idénticos)
- `api-examples/laqu-resultados1.json` ❌ (todos idénticos)

## Prioridades

### Alta Prioridad
1. ✅ Obtener los 5 JSONs de `proximosv3` restantes
2. ✅ Decidir framework de styling
3. ✅ Crear proyecto nuevo
4. ✅ Completar implementación de rutas `/`, `/quini`, `/slide`
5. ✅ Configurar Sanity y crear documentos de prueba

### Media Prioridad
1. ✅ Configurar Sanity
2. ✅ Definir schemas en Sanity
3. ⏳ Implementar rotación automática de slides en `/slide`
4. ⏳ Deployar schemas a Sanity dashboard

### Baja Prioridad
1. Configurar pruebas (puede ser más adelante)
2. Configurar despliegue (puede ser más adelante)
