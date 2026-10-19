# Plan de Arquitectura - Nuevo Proyecto Quiniela

> **Documentación principal:** Ver [AGENTS.md](./AGENTS.md) para contexto completo del proyecto.

## Visión General
App React + Vite + TypeScript para tablón de resultados de loterías españolas con integración Sanity.

## Rutas
- `/` - Resultados de API (buscadorSorteos) - Landscape TV 27"
- `/quini` - Resultados de Sanity (mismo layout que `/`) - Landscape TV 27"
- `/slide` - Slider de próximos sorteos + botes (proximosv3) + slides de Sanity - Tablet landscape

## APIs Disponibles

### 1. `buscadorSorteos` - Resultados actuales (funciona ✓)
Endpoint: `https://www.loteriasyapuestas.es/servicios/buscadorSorteos`
- Parámetros: `game_id`, `fechaInicioInclusiva`, `fechaFinInclusiva`, `celebrados=true`
- Juegos: BONO, ELGR, LAPR, EMIL, LNAC, LAQU
- Ejemplos disponibles: ✓ Todos los juegos

### 2. `proximosv3` - Próximos sorteos con botes (funciona parcialmente)
Endpoint: `https://www.loteriasyapuestas.es/servicios/proximosv3`
- Parámetros: `game_id`, `num`
- Ejemplos disponibles: ✓ LAPR, ⏳ BONO, ELGR, EMIL, LNAC, LAQU (pendientes)

### 3. `resultados1` - Resultados recientes con premios (NO funciona ❌)
- Devuelve siempre el mismo JSON de LNAC independientemente del game_id
- **Decisión:** NO usar esta API

## Arquitectura de Capas

```
src/
├── components/           # UI layer
│   ├── ui/              # Componentes atómicos
│   │   ├── NumberStrip.tsx
│   │   ├── LotteryIcon.tsx
│   │   └── Badge.tsx
│   ├── cards/           # Cards por tipo de juego
│   │   ├── BonolotoCard.tsx
│   │   ├── PrimitivaCard.tsx
│   │   ├── EuromillonesCard.tsx
│   │   ├── GordoCard.tsx
│   │   ├── NacionalCard.tsx
│   │   └── QuinielaCard.tsx
│   ├── layout/          # Layout components
│   │   ├── BoardLayout.tsx
│   │   └── UpcomingFooter.tsx
│   └── slider/          # Slider components
│       ├── Slider.tsx
│       ├── UpcomingSlide.tsx
│       └── SanitySlide.tsx
├── hooks/               # React hooks
│   ├── useLotteryBoard.ts      # Hook para / y /quini
│   ├── useUpcomingDraws.ts     # Hook para footer de próximos sorteos
│   └── useSlider.ts           # Hook para /slide
├── services/            # Business logic layer
│   ├── http/            # HTTP client
│   │   └── HttpClient.ts
│   ├── cache/           # Cache service (localStorage)
│   │   └── CacheService.ts
│   ├── lottery/         # Domain services
│   │   ├── LotteryService.ts      # Orquestador principal
│   │   ├── DateWindowCalculator.ts  # Ventanas de tiempo por juego
│   │   └── UpcomingService.ts     # Servicio para próximos sorteos
│   └── adapters/        # Data transformation
│       ├── normalize/
│       │   ├── BonolotoAdapter.ts
│       │   ├── PrimitivaAdapter.ts
│       │   ├── EuromillonesAdapter.ts
│       │   ├── GordoAdapter.ts
│       │   ├── NacionalAdapter.ts
│       │   └── QuinielaAdapter.ts
│       ├── upcoming/
│       │   ├── BonolotoUpcomingAdapter.ts
│       │   ├── PrimitivaUpcomingAdapter.ts
│       │   └── ...
│       └── index.ts
├── sanity/              # Sanity integration
│   ├── client.ts       # Sanity client config
│   ├── queries.ts      # GROQ queries
│   └── types.ts        # Sanity types
├── utils/               # Pure utilities
│   ├── date.ts         # Formateo de fechas
│   ├── format.ts       # Formateo de moneda, números
│   └── validation.ts   # Validaciones
├── config/              # Configuration
│   ├── gameConfig.ts   # Configuración de juegos
│   └── constants.ts    # Constantes (API URLs, etc.)
├── types/               # Type definitions
│   ├── api.ts          # Types de la API
│   ├── lottery.ts      # Types de dominio
│   └── sanity.ts       # Types de Sanity
└── App.tsx             # Root component
```

## Implementación por Ruta

### Ruta `/` - Resultados API
**Fuente de datos:** `buscadorSorteos`
**Componente principal:** `BoardLayout`
**Hook:** `useLotteryBoard` (configurable para API o Sanity)

Flujo:
1. `LotteryService.fetchAllDraws()` - Orquesta peticiones a `buscadorSorteos`
2. Cada juego usa su `DateWindowCalculator` para calcular ventana correcta
3. `HttpClient` hace peticiones paralelas
4. `CacheService` guarda resultados con TTL
5. `Adapters` normalizan cada juego a `LotteryDraw` type
6. `BoardLayout` renderiza cards por tipo de juego

### Ruta `/quini` - Resultados Sanity
**Fuente de datos:** Sanity CMS
**Componente principal:** `BoardLayout` (reutilizado)
**Hook:** `useLotteryBoard` (modo Sanity)

Flujo:
1. `SanityClient.fetchAllDraws()` - Usa GROQ queries
2. Sanity devuelve datos ya normalizados según schema
3. Mismo renderizado que `/` pero con datos de Sanity

### Ruta `/slide` - Slider
**Fuentes de datos:**
- `proximosv3` - Próximos sorteos con botes (1 slide fijo)
- Sanity - Slides personalizados (imagen + título opcional)

**Componente principal:** `Slider`
**Hook:** `useSlider`

Flujo:
1. `UpcomingService.fetchAllUpcoming()` - Obtiene próximos sorteos de `proximosv3`
2. `UpcomingAdapters` normalizan a `UpcomingDraw` type
3. `SanityClient.fetchSlides()` - Obtiene slides de Sanity
4. `Slider` combina y rota: [UpcomingSlide, SanitySlide1, SanitySlide2, ...]; las imágenes de Sanity se resuelven a su URL de asset
5. Rotación automática cada 10 segundos

### Footer de próximos sorteos (en `/` y `/quini`)
**Fuente de datos:** `proximosv3`
**Componente:** `UpcomingFooter`
**Hook:** `useUpcomingDraws`

Características:
- Ticker horizontal con próximos sorteos
- Muestra: nombre del juego, fecha/hora, bote
- Auto-scroll si no caben todos

## Tipos de Dominio

```typescript
// types/lottery.ts
type GameCode = 'BONO' | 'ELGR' | 'LAPR' | 'EMIL' | 'LNAC' | 'LAQU';

type LotteryDraw = {
  id: string;
  game: GameCode;
  date: string;
  scheduledDate: string;
  status: 'celebrado' | 'pendiente';
  // ... campos específicos por juego
};

type UpcomingDraw = {
  id: string;
  game: GameCode;
  fecha: string;
  fecha_apertura: string;
  fecha_cierre: string;
  premio_bote: number | null;
  estado: 'abierto' | 'cerrado';
  // ... campos específicos (joker, etc.)
};

type SanitySlide = {
  _id: string;
  image: string;
  title?: string;
  order?: number;
};
```

## Adaptadores por Juego

### Resultados (buscadorSorteos)
- `BonolotoAdapter`: Extrae combinación, complementario, reintegro
- `PrimitivaAdapter`: Extrae combinación, complementario, reintegro, joker
- `EuromillonesAdapter`: Extrae combinación, estrellas, millon
- `GordoAdapter`: Extrae combinación, reintegro, clave
- `NacionalAdapter`: Extrae primerPremio, segundoPremio, reintegros
- `QuinielaAdapter`: Extrae partidos, signos, jornada, plenoAl15

### Próximos Sorteos (proximosv3)
- `BonolotoUpcomingAdapter`: Mapea fecha, bote, estado
- `PrimitivaUpcomingAdapter`: Mapea fecha, bote, joker
- ... (similar para otros juegos)

## Ventanas de Tiempo por Juego

```typescript
// services/lottery/DateWindowCalculator.ts
const getWindowForGame = (game: GameCode) => {
  switch (game) {
    case 'BONO':
    case 'LAPR':
    case 'EMIL':
      return getDailyWindow(7); // 7 días atrás
    case 'ELGR':
      return getGordoWindow(15); // 15 días atrás
    case 'LNAC':
      return getDailyWindow(14); // 2 semanas
    case 'LAQU':
      return getQuinielaWindow(); // viernes-viernes
  }
};
```

## Sanity Schemas (pendiente de definir)

```typescript
// types/sanity.ts
type SanityLotteryDraw = {
  _id: string;
  _type: 'lotteryDraw';
  game: GameCode;
  date: string;
  // ... mismos campos que LotteryDraw
};

type SanitySlide = {
  _id: string;
  _type: 'slide';
  image: string;
  title?: string;
  order?: number;
};
```

## Estrategia de Caché

```typescript
// services/cache/CacheService.ts
const CACHE_PREFIX = 'draw:';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

class CacheService {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, ttl?: number): void;
  invalidate(pattern: string): void;
}
```

## Pasos de Implementación

### Fase 1: Estructura base
1. Crear proyecto nuevo con Vite + React + TypeScript
2. Configurar estructura de carpetas
3. Configurar types básicos
4. Configurar HttpClient

### Fase 2: Adaptadores y servicios
1. Implementar `DateWindowCalculator`
2. Implementar adaptadores de `buscadorSorteos` (usando ejemplos disponibles)
3. Implementar `LotteryService`
4. Implementar `CacheService`

### Fase 3: Componentes UI base
1. Implementar componentes atómicos (NumberStrip, LotteryIcon, Badge)
2. Implementar cards por tipo de juego
3. Implementar `BoardLayout`

### Fase 4: Ruta `/`
1. Implementar `useLotteryBoard` (modo API)
2. Implementar página `/`
3. Implementar `UpcomingFooter` con `proximosv3`
4. Probar con ejemplos mockeados

### Fase 5: Integración Sanity
1. Configurar Sanity client
2. Definir schemas en Sanity
3. Implementar queries
4. Implementar `useLotteryBoard` (modo Sanity)
5. Implementar ruta `/quini`

### Fase 6: Ruta `/slide`
1. Implementar adaptadores de `proximosv3` (cuando tengamos ejemplos)
2. Implementar `UpcomingService`
3. Implementar `Slider` y slides
4. Implementar ruta `/slide`

## Datos Pendientes

### APIs por obtener (proximosv3)
- ✅ BONO
- ✅ ELGR
- ✅ EMIL
- ✅ LNAC
- ✅ LAQU

### Sanity por definir
- ✅ Schema para `lotteryDraw` (creado localmente)
- ✅ Schema para `slide` (creado localmente)
- ✅ Schema `lotteryDraw` corregido con campos faltantes
- ✅ Project ID (lkywbgau)
- ✅ API configuration (configurado en .env)
- ✅ Documentos de prueba creados (6 juegos)
- ✅ Deployar schemas al dataset `production` de Sanity
- ✅ Implementar rotación automática de slides en `/slide`

## Decisiones Técnicas

1. **Framework:** Vite + React + TypeScript (más simple que Next.js para este caso)
2. **Routing:** `react-router-dom` v6
3. **HTTP:** `fetch` nativo con wrapper en `HttpClient`
4. **State Management:** React hooks + Context si necesario
5. **Styling:** CSS Modules o Tailwind CSS (por definir)
6. **Icons:** SVG inline (como en proyecto actual)
7. **Cache:** localStorage con TTL

## Notas Importantes

1. **NO usar `resultados1`** - No funciona correctamente
2. **Usar `buscadorSorteos`** para resultados históricos recientes en `/slide`
3. **Usar `proximosv3`** para próximos sorteos con botes
4. **Sanity** para quiniela y slides personalizados
5. **Reutilizar componentes** entre `/` y `/quini`
6. **Separar lógica de negocio** de UI en servicios/adapters
