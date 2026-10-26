# LAV Design — Portfolio

Portfolio of LAV Design (Luis Aguilar Vargas), Digital Experience Builder.

**Status:** M2 of 7: shell and navigation

## Stack

- [Astro](https://astro.build)
- [Tailwind CSS v4](https://tailwindcss.com) via `@tailwindcss/vite`
- Prettier + ESLint
- Vitest + jsdom
- Geist and Geist Mono, self-hosted via Fontsource
- Deploy target: Vercel

## Getting started

Requires the Node version in `.nvmrc`.

```sh
nvm use
npm install
npm run dev
```

## Scripts

| Command                | Action                                    |
| :--------------------- | :---------------------------------------- |
| `npm run dev`          | Start the dev server at `localhost:4321`  |
| `npm run build`        | Build the production site to `./dist/`    |
| `npm run preview`      | Preview the production build locally      |
| `npm run check`        | Run `astro check` (diagnostics and types) |
| `npm run lint`         | Lint with ESLint                          |
| `npm test`             | Run unit tests with Vitest                |
| `npm run format`       | Format all files with Prettier            |
| `npm run format:check` | Check formatting without writing          |
