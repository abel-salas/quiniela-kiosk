# Quiniela kiosk board

Pantalla 16:9 de digital signage para una administración de loterías: resultados y botes de los juegos de SELAE, con refresco automático. Pensada para Chrome en modo kiosco y despliegue estático en Vercel.

> En reconstrucción. Contrato de datos en `docs/contexto-apis.md`; plan y backlog en `docs/plan/`.

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

## Despliegue en Vercel

1. Conecta el repositorio a Vercel.
2. Usa la configuración por defecto de Vite.
3. Framework preset: Vite.
4. Build command: `npm run build`
5. Output directory: `dist`

## Arranque en modo kiosco

En Chrome:

- Abrir la URL del panel.
- Activar pantalla completa.
- Usar el modo kiosco del sistema o extensions flags del navegador.
- Configurar el navegador para abrir la página al arrancar.

## Aviso visible

> Resultados informativos; compruebe su boleto en el terminal.
