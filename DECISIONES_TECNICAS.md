# Decisiones Técnicas - Nuevo Proyecto Quiniela

> **Documentación principal:** Ver [AGENTS.md](./AGENTS.md) para contexto completo del proyecto.

## Framework y Tecnologías

### Framework
- **Vite + React + TypeScript**
  - Razón: Más simple que Next.js para este caso específico
  - No necesita SSR ni routing complejo
  - Build rápido y configuración sencilla

### Routing
- **react-router-dom v6**
  - Rutas: `/`, `/quini`, `/slide`
  - Cada ruta con su propio layout

### HTTP Client
- **fetch nativo** con wrapper en `HttpClient`
  - Razón: No necesita dependencias externas
  - Wrapper centralizado para error handling y headers

### State Management
- **React hooks** (useState, useEffect, useContext)
  - Razón: Suficiente para este caso
  - Context solo si es necesario compartir estado global

### Styling
- **CSS tradicional** (sin framework)
  - Razón: Simple, sin dependencias adicionales
  - Scoping con naming conventions (BEM-like)

### Icons
- **SVG inline** (como en proyecto actual)
  - Razón: Sin dependencias externas
  - Control total sobre estilos

## APIs

### APIs a Usar

| API | Endpoint | Uso | Estado |
|-----|----------|-----|--------|
| `buscadorSorteos` | `/servicios/buscadorSorteos` | Resultados actuales (`/`) | ✅ Funciona |
| `proximosv3` | `/servicios/proximosv3` | Próximos sorteos (`/slide`, footer) | ⚠️ Parcial (1 ejemplo) |
| Sanity | Sanity API | Resultados quiniela (`/quini`), slides (`/slide`) | ⏳ Pendiente |

### APIs a NO Usar

| API | Razón |
|-----|-------|
| `resultados1` | No funciona correctamente - ignora game_id |

## Arquitectura

### Separación de Capas

```
├── components/     # UI layer (React components)
├── hooks/          # React hooks (custom hooks)
├── services/       # Business logic layer
│   ├── http/       # HTTP client
│   ├── cache/      # Cache service
│   ├── lottery/    # Domain services
│   └── adapters/   # Data transformation
├── sanity/         # Sanity integration
├── utils/          # Pure utilities
├── config/         # Configuration
└── types/          # Type definitions
```

### Componentes por Tipo de Juego

Cada juego tendrá su propio adapter y card:
- Bonoloto → `BonolotoAdapter` + `BonolotoCard`
- La Primitiva → `PrimitivaAdapter` + `PrimitivaCard`
- Euromillones → `EuromillonesAdapter` + `EuromillonesCard`
- El Gordo → `GordoAdapter` + `GordoCard`
- Lotería Nacional → `NacionalAdapter` + `NacionalCard`
- La Quiniela → `QuinielaAdapter` + `QuinielaCard`

## Rutas

### `/` - Resultados API
- **Fuente:** `buscadorSorteos`
- **Layout:** Landscape TV 27"
- **Hook:** `useLotteryBoard` (modo API)
- **Footer:** Ticker de próximos sorteos (`proximosv3`)

### `/quini` - Resultados Sanity
- **Fuente:** Sanity CMS
- **Layout:** Landscape TV 27" (mismo que `/`)
- **Hook:** `useLotteryBoard` (modo Sanity)
- **Footer:** Ticker de próximos sorteos (`proximosv3`)

### `/slide` - Slider
- **Fuentes:**
  - `proximosv3` → Slide de próximos sorteos con botes
  - Sanity → Slides personalizados (imagen + título)
- **Layout:** Tablet landscape
- **Hook:** `useSlider`
- **Rotación:** [UpcomingSlide, SanitySlide1, SanitySlide2, ...]

## Caché

### Estrategia
- **localStorage** con TTL (Time To Live)
- **Prefijo:** `draw:`
- **TTL por defecto:** 5 minutos
- **Clave de caché:** `draw:{game_id}:{fecha_inicio}:{fecha_fin}`

### Servicio
- `CacheService` en `services/cache/`
- Métodos: `get()`, `set()`, `invalidate()`

## Ventanas de Tiempo por Juego

| Juego | Ventana | API |
|-------|---------|-----|
| BONO | 7 días atrás | `getDailyWindow(7)` |
| ELGR | 15 días atrás | `getGordoWindow(15)` |
| LAPR | 7 días atrás | `getDailyWindow(7)` |
| EMIL | 7 días atrás | `getDailyWindow(7)` |
| LNAC | 14 días atrás | `getDailyWindow(14)` |
| LAQU | viernes-viernes | `getQuinielaWindow()` |

## Reutilización de Componentes

### BoardLayout
- Se usa en `/` y `/quini`
- Recibe datos ya normalizados
- No importa si vienen de API o Sanity

### Cards
- Cada juego tiene su card específico
- Comparten interfaz común `LotteryCardProps`
- Solo renderizan campos relevantes para su tipo

### UpcomingFooter
- Se usa en `/` y `/quini`
- Obtiene datos de `proximosv3`
- Ticker horizontal con auto-scroll

## Tipos TypeScript

### Domain Types
```typescript
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
  // ... campos específicos
};
```

### Sanity Types
```typescript
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

## Orden de Implementación

### Fase 1: Estructura base
1. Crear proyecto Vite + React + TS
2. Configurar estructura de carpetas
3. Configurar types básicos
4. Configurar HttpClient

### Fase 2: Adaptadores y servicios
1. Implementar `DateWindowCalculator`
2. Implementar adaptadores de `buscadorSorteos`
3. Implementar `LotteryService`
4. Implementar `CacheService`

### Fase 3: Componentes UI base
1. Componentes atómicos (NumberStrip, LotteryIcon, Badge)
2. Cards por tipo de juego
3. `BoardLayout`

### Fase 4: Ruta `/`
1. `useLotteryBoard` (modo API)
2. Página `/`
3. `UpcomingFooter`
4. Probar con mocks

### Fase 5: Integración Sanity
1. Configurar Sanity client
2. Definir schemas
3. Implementar queries
4. `useLotteryBoard` (modo Sanity)
5. Ruta `/quini`

### Fase 6: Ruta `/slide`
1. Adaptadores de `proximosv3`
2. `UpcomingService`
3. `Slider` y slides
4. Ruta `/slide`

## Notas Importantes

1. **No usar `resultados1`** - Devuelve siempre el mismo JSON
2. **Usar `buscadorSorteos`** para resultados históricos recientes en `/slide`
3. **Sanity** para quiniela y slides personalizados
4. **Reutilizar componentes** entre `/` y `/quini`
5. **Separar lógica de negocio** de UI
6. **Cada juego** con su adapter y card específicos
