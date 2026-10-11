# Quiniela kiosk board

Panel vertical tipo tablón para mostrar resultados de loterías españolas en una pantalla de tienda, pensado para Chrome en modo kiosco y despliegue estático en Vercel.

## Requisitos

- Node.js 20+
- npm
- Navegador Chrome con la extensión que salta CORS en la tienda

## Instalación

```bash
npm install
```

## Scripts

```bash
npm run dev
npm run build
npm run preview
```

### Modo mock local

```bash
VITE_USE_MOCK=true npm run dev
```

Esto usa fixtures locales para simular el JSON de cada juego sin depender de la red.

## Arquitectura

- `src/api/adapters.ts`: normalización del JSON de cada juego a un modelo común.
- `src/api/service.ts`: caché localStorage + búsqueda de sorteos + fallback.
- `src/mock/fixtures.ts`: datos de ejemplo por juego.
- `src/App.tsx`: maquetación vertical tipo tablón.

## Despliegue en Vercel

1. Conecta el repositorio a Vercel.
2. Usa la configuración por defecto de Vite.
3. Framework preset: Vite.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Variables de entorno opcionales:
   - `VITE_USE_MOCK=true` para demostrar el panel sin red.

## Arranque en modo kiosco

En Chrome:

- Abrir la URL del panel.
- Activar pantalla completa.
- Usar el modo kiosco del sistema o extensions flags del navegador.
- Configurar el navegador para abrir la página al arrancar.

Ejemplo de lanzamiento en Windows:

```powershell
powershell -ExecutionPolicy Bypass -NoProfile -Command "Set-Location 'c:/work/quiniela'; npm run dev -- --host 0.0.0.0 --port 4173"
```

## Aviso visible

> Resultados informativos; compruebe su boleto en el terminal.

## Nota sobre datos

La solución está preparada para usar endpoints de loteriasyapuestas.es con un salto de CORS en el navegador de la tienda y con fallback a caché y fixtures locales si la red falla.
