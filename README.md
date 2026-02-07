# Portafolio Personal - Gerson Ramírez

Sitio web personal construido con Astro para presentar perfil profesional, valores, proyectos y contacto en una experiencia moderna, rápida y bilingüe (ES/EN).

## Qué incluye

- Página principal compuesta por secciones reutilizables.
- Soporte de idioma español/inglés con persistencia en `localStorage`.
- Estilos con Tailwind CSS v4.
- Animaciones con `motion`.
- Preparado para despliegue en Vercel.

## Stack

- Astro 5
- Tailwind CSS 4
- Motion
- TypeScript
- @astrojs/vercel

## Estructura del proyecto

```text
/
├── public/
├── src/
│   ├── components/
│   │   ├── Header.astro
│   │   ├── HeroSection.astro
│   │   ├── AboutSection.astro
│   │   ├── ValuesSection.astro
│   │   ├── ProjectsSection.astro
│   │   ├── ContactSection.astro
│   │   └── Footer.astro
│   ├── layouts/
│   │   └── Layout.astro
│   ├── locales/
│   │   ├── es.json
│   │   └── en.json
│   ├── scripts/
│   │   └── language.ts
│   ├── styles/
│   │   └── global.css
│   ├── utils/
│   │   └── i18n.ts
│   └── pages/
│       └── index.astro
├── astro.config.mjs
└── package.json
```

## Comandos disponibles

```bash
npm install
npm run dev
npm run build
npm run preview
```

El entorno local corre por defecto en `http://localhost:4321`.

## Deploy

Este proyecto está preparado para Vercel con `@astrojs/vercel`.

Pasos recomendados:

1. Haz push del repositorio a GitHub.
2. Importa el proyecto en Vercel.
3. Usa los comandos por defecto:
   - Build: `npm run build`
   - Output: configuración detectada automáticamente por Astro/Vercel.

## Licencia

Derechos reservados © 2026 Gerson Ramírez. No se permite uso comercial sin autorización previa. Para consultas, contacta a services@gerco.works
