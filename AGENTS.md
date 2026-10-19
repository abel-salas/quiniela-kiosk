# AGENTS.md - Documentación del Proyecto Quiniela

## Contexto del Proyecto
App React + Vite + TypeScript para tablón de resultados de loterías españolas con integración Sanity.

## Documentación Principal

### 1. Plan Arquitectónico
**Archivo:** [ARCHITECTURE_PLAN.md](./ARCHITECTURE_PLAN.md)
- Visión general del proyecto con las 3 rutas
- APIs disponibles y su estado funcional
- Arquitectura de capas completa
- Implementación por ruta
- Tipos de dominio
- Adaptadores por juego
- Ventanas de tiempo
- Estrategia de caché
- Pasos de implementación en 6 fases

### 2. Decisiones Técnicas
**Archivo:** [DECISIONES_TECNICAS.md](./DECISIONES_TECNICAS.md)
- Framework y tecnologías seleccionadas
- APIs a usar y a NO usar
- Arquitectura de separación de capas
- Componentes por tipo de juego
- Detalle de las 3 rutas (`/`, `/quini`, `/slide`)
- Estrategia de caché
- Ventanas de tiempo por juego
- Reutilización de componentes
- Tipos TypeScript
- Orden de implementación

### 3. Pendientes Generales
**Archivo:** [PENDIENTE.md](./PENDIENTE.md)
- Datos de API pendientes (5 JSONs de proximosv3)
- Configuración Sanity pendiente
- Decisión de styling pendiente
- Checklist de implementación por fases
- Prioridades (alta, media, baja)
- Referencia a archivos existentes y su estado

### 4. Tareas Específicas
**Archivo:** [PENDING_TASKS.md](./PENDING_TASKS.md)
- Lista detallada de JSONs de proximosv3 pendientes
- Instrucciones para obtener cada JSON
- Schemas de Sanity a definir
- Próximos pasos para la siguiente sesión

## Estructura del Proyecto

### Rutas
- `/` - Resultados de API (buscadorSorteos) - Landscape TV 27"
- `/quini` - Resultados de Sanity (mismo layout que `/`) - Landscape TV 27"
- `/slide` - Slider de próximos sorteos + botes + slides de Sanity - Tablet landscape

### APIs
- **buscadorSorteos** ✅ - Resultados actuales (funciona correctamente)
- **proximosv3** ⚠️ - Próximos sorteos con botes (1 ejemplo disponible, 5 pendientes)
- **resultados1** ❌ - NO usar (ignora game_id)

### Ejemplos de API Disponibles

#### buscadorSorteos (✅ Funciona)
- `api-examples/bono-buscador.json` ✓
- `api-examples/elgr-buscador.json` ✓
- `api-examples/lapr-buscador.json` ✓
- `api-examples/emil-buscador.json` ✓
- `api-examples/lnac-buscador.json` ✓
- `api-examples/laqu-buscador.json` ✓

#### proximosv3 (⚠️ Parcial)
- `api-examples/lapr-proximosv3.json` ✓
- `api-examples/bono-proximosv3.json` ❌ (incorrecto, necesita el correcto)
- `api-examples/elgr-proximosv3.json` ⏳ pendiente
- `api-examples/emil-proximosv3.json` ⏳ pendiente
- `api-examples/lnac-proximosv3.json` ⏳ pendiente
- `api-examples/laqu-proximosv3.json` ⏳ pendiente

#### resultados1 (❌ No funciona)
- Todos los ejemplos son idénticos y de Lotería Nacional
- NO usar esta API

## Instrucciones para Futuros Chats

### Cuando me digas "dame las respuestas que nos faltan"
1. El usuario proporcionará los 5 JSONs de `proximosv3` restantes
2. Guardar cada JSON en `api-examples/` con formato:
   ```json
   {
     "url": "la url completa",
     "response": { ...el json... }
   }
   ```
3. Archivos a crear:
   - `api-examples/bono-proximosv3.json`
   - `api-examples/elgr-proximosv3.json`
   - `api-examples/emil-proximosv3.json`
   - `api-examples/lnac-proximosv3.json`
   - `api-examples/laqu-proximosv3.json`

### Cuando me digas "continúa con la implementación"
1. Verificar que tenemos los 5 JSONs de `proximosv3`
2. Si están todos, comenzar Fase 1 de `ARCHITECTURE_PLAN.md`
3. Crear proyecto nuevo con Vite + React + TypeScript
4. Configurar estructura de carpetas
5. Implementar según el orden en `DECISIONES_TECNICAS.md`

### Cuando necesites contexto del proyecto
1. Leer `AGENTS.md` (este archivo)
2. Leer `ARCHITECTURE_PLAN.md` para visión general
3. Leer `DECISIONES_TECNICAS.md` para decisiones tomadas
4. Leer `PENDIENTE.md` para tareas pendientes

## Reglas Importantes

### APIs
- ✅ **USAR:** `buscadorSorteos` para resultados
- ✅ **USAR:** `proximosv3` para próximos sorteos
- ❌ **NO USAR:** `resultados1` (no funciona)

### Arquitectura
- Cada juego debe tener su propio adapter
- Cada juego debe tener su propio card component
- Separar lógica de negocio en `services/`
- Separar UI en `components/`
- Separar types en `types/`

### Reutilización
- `BoardLayout` se usa en `/` y `/quini`
- Componentes UI atómicos se reutilizan
- Cards son específicos por juego

### Sanity
- Usar para quiniela en `/quini`
- Usar para slides personalizados en `/slide`
- Schema `lotteryDraw` para resultados
- Schema `slide` para imágenes

## Estado Actual
- ✅ Plan arquitectónico completo
- ✅ Decisiones técnicas documentadas
- ✅ Ejemplos de `buscadorSorteos` para todos los juegos
- ✅ Todos los JSONs de `proximosv3` completados
- ✅ Styling decidido: CSS tradicional
- ✅ Proyecto Vite + React + TypeScript creado
- ✅ Estructura de carpetas organizada
- ✅ Types básicos implementados
- ✅ HttpClient centralizado
- ✅ DateWindowCalculator implementado
- ✅ Adaptadores de buscadorSorteos implementados
- ✅ LotteryService implementado
- ✅ CacheService implementado
- ✅ Componentes UI atómicos creados
- ✅ Componentes de cards por juego creados
- ✅ BoardLayout reutilizable creado
- ✅ Hook useLotteryBoard implementado
- ✅ Routing con react-router-dom configurado (rutas `/`, `/quini`, `/slide`)
- ✅ Proxy Vite configurado para resolver CORS
- ✅ Adaptador de Lotería Nacional arreglado (maneja objetos complejos)
- ✅ Adaptador de Quiniela arreglado (maneja espacios en signos)
- ✅ QuinielaCard actualizada para mostrar hora en partidos pendientes (sin X por defecto)
- ✅ Sanity client configurado con todas las credenciales
- ✅ Queries GROQ implementadas
- ✅ Hook useSanityBoard implementado
- ✅ QuiniPage usando Sanity (muestra todos los juegos, no solo LAQU)
- ✅ HomePage usando API (sin fallback)
- ✅ Sanity instalado como dependencia
- ✅ Schemas de Sanity creados localmente (lotteryDraw, slide)
- ✅ Schemas corregidos: añadidos `updatedAt`, `combinacion`, `combinacionActa`, `fecha_completa`
- ✅ Tipos Sanity actualizados con todos los campos explícitos
- ✅ Credenciales de Sanity configuradas en .env
- ✅ Diseño visual adaptado a loteriasyapuestas.es (más compacto)
- ✅ BoardLayout actualizado para mostrar 6 juegos (3 izquierda, 3 derecha)
- ✅ Type UpcomingDraw añadido para proximosv3
- ✅ UpcomingService implementado
- ✅ useUpcomingDraws hook implementado
- ✅ UpcomingDrawCard component creado
- ✅ SlidePage implementada con grid de próximos sorteos
- ✅ Estilos CSS para slider completados
- ✅ Documentos de prueba creados en Sanity (6 juegos: BONO, ELGR, LAPR, EMIL, LNAC, LAQU)
- ✅ Schemas `lotteryDraw` y `slide` desplegados al dataset `production` de Sanity
- ✅ Slider en `/slide` rota automáticamente cada 10 segundos entre próximos sorteos y los slides publicados en Sanity

## Juegos Adicionales Pendientes (para futura implementación)

Según la web oficial de loteriasyapuestas.es, existen 3 juegos adicionales que podrían añadirse:

### 1. Eurodreams
- **Probable game_id:** EDRE
- **Descripción:** Sorteo europeo con premios mensuales de por vida (20.000€ durante 30 años)
- **Formato:** 6 números (1-40) + 1 Dream (1-5)
- **Días:** Lunes y jueves a las 21:00h
- **Estado:** Pendiente de verificar game_id y obtener ejemplos de API

### 2. Lototurf
- **Probable game_id:** LTTF
- **Descripción:** Combina lotería con apuestas hípicas
- **Formato:** 6 números (1-31) + 1 caballo ganador
- **Días:** Domingos a las 11:30h
- **Estado:** Pendiente de verificar game_id y obtener ejemplos de API

### 3. Quinigol
- **Probable game_id:** QLGL
- **Descripción:** Pronóstico del número exacto de goles en 6 partidos de fútbol
- **Formato:** Goles de cada partido (más específico que La Quiniela)
- **Días:** Martes a las 21:00h (según jornada)
- **Estado:** Pendiente de verificar game_id y obtener ejemplos de API

### Pasos para implementar:
1. Verificar game_id correcto en la API (buscadorSorteos y proximosv3)
2. Obtener ejemplos de JSON de la API para cada juego
3. Añadir game_id a GAME_CONFIG en `src/config/gameConfig.ts`
4. Crear adaptador específico en `src/services/adapters/normalize/index.ts`
5. Crear card component en `src/components/cards/`
6. Actualizar DateWindowCalculator para ventanas de tiempo
7. Actualizar BoardLayout para incluir los nuevos juegos
8. Actualizar tipos TypeScript en `src/types/lottery.ts`

## Checklist Rápido

Fases Completadas:
- [x] Fase 1: Estructura base
- [x] Fase 2: Adaptadores y servicios
- [x] Fase 3: Componentes UI base
- [x] Fase 4: Ruta `/`
- [x] Fase 5: Integración Sanity y deploy de schemas
- [x] Fase 6: Ruta `/slide` con proximosv3
- [x] Diseño visual adaptado a loteriasyapuestas.es
- [x] Arreglo Quiniela (hora en partidos pendientes, sin X por defecto)

Fases Pendientes:
- [ ] Verificar la integración de `/quini` en el entorno desplegado
- [ ] Desplegar a producción
- [ ] Opcional: Añadir juegos adicionales (Eurodreams, Lototurf, Quinigol) - ver sección "Juegos Adicionales Pendientes"
