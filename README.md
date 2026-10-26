# LAV Design — Portfolio

Portfolio of LAV Design (Luis Aguilar Vargas), Digital Experience Builder.

**Status:** in development (M1 of 7)

## Stack

- [Astro](https://astro.build)
- [Tailwind CSS v4](https://tailwindcss.com) via `@tailwindcss/vite`
- Prettier + ESLint
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
| `npm run format`       | Format all files with Prettier            |
| `npm run format:check` | Check formatting without writing          |
