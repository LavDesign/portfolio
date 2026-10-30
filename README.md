<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="src/assets/brand/lav-lockup-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="src/assets/brand/lav-lockup-light.svg">
    <img src="src/assets/brand/lav-lockup-light.svg" alt="LAV Design — Digital Experience Builder" width="440">
  </picture>
</p>

# LAV Design — Portfolio

Portfolio of Luis Aguilar Vargas (LAV Design), Digital Experience Builder.

**[Live site](https://lavdesign.vercel.app)** · [![CI](https://github.com/LavDesign/portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/LavDesign/portfolio/actions/workflows/ci.yml)

## Overview

LAV Design is the name I work under; LAV stands for my initials. I design digital experiences and build them: UX, frontend and CMS work.

This site presents selected work as four case studies (Costa Ballena Experience Builder, Vetegram, Global Cigar Express and Pacific EcoSolutions), plus an About page and a contact form. It is a static Astro site, in English, with a dark, brutalist-minimal design where typography is the structure and a single brand accent (`#DD4B39`) does the rest.

## Features

- **Home in chapters:** a hero with a line-by-line title intro, then four chapters (Selected work, Twenty years, How I work with AI, Contact). From 1024 px and without reduced motion they scroll horizontally; everywhere else they stack vertically.
- **Chapter indicator:** the desktop rail swaps "© 2026 Luis Aguilar Vargas" for "CH.n / 4" while a chapter is in view.
- **Site menu:** a native `<dialog>` with open and close motion, focus management, Escape to close and scroll lock.
- **Case studies in MDX:** one template with the same seven sections for every project, screenshots in WebP, and links to live sites and prototypes.
- **Contact form:** inline validation, a honeypot against spam, and Formspree delivery or demo mode. A success dialog with the animated LAV Design lockup opens once a message is sent.
- **SEO:** canonical URLs, Open Graph tags with an absolute image, a Person JSON-LD on the Home, a sitemap and `robots.txt`.
- **Accessibility:** one `h1` per page, a skip link, a visible brand focus ring, 44 px targets, AA contrast and no motion under `prefers-reduced-motion`.

## Tech stack

| Tool                                                 | Version               |
| ---------------------------------------------------- | --------------------- |
| Astro (static) + `@astrojs/mdx` + `@astrojs/sitemap` | 7.4.2 + 8.1.1 + 3.7.4 |
| Tailwind CSS (`@tailwindcss/vite`)                   | 4.3.3                 |
| GSAP (ScrollTrigger, SplitText)                      | 3.15.0                |
| Lenis                                                | 1.3.27                |
| Geist + Geist Mono (`@fontsource-variable`)          | 5.3.0                 |
| Vitest + jsdom                                       | 5.0.5 + 30.1.3        |
| ESLint                                               | 10.13.0               |
| Prettier                                             | 3.9.10                |
| TypeScript (`astro check`)                           | 6.0.3                 |
| sharp (image scripts)                                | 0.35.5                |

Versions are the ones installed from `package-lock.json`. Node.js 24 (see [`.nvmrc`](.nvmrc)).

## Key decisions

- **Astro, static output:** a portfolio is content, so pages ship as HTML and only the interactive parts load JavaScript.
- **Tailwind v4 tokens in CSS:** colors, radii and fonts live in `@theme` in `src/styles/global.css`, one source of truth with no JS config.
- **Copy and project data in `src/data/`:** components hold no copy. The name, brand and job title live in one place (`src/data/site.js`) and feed titles, descriptions and the JSON-LD.
- **Horizontal chapters only where they help:** at 1024 px and up, and only without reduced motion. Below that, or with reduced motion, the Home is a normal vertical page.
- **No carousels, shadows or gradients:** the design relies on type, rules and one accent color.
- **Native `<dialog>` for the menu and the success dialog:** the browser handles the modal behavior, and the scripts add motion, focus return and scroll lock.
- **A form that can't send by accident:** without `PUBLIC_FORMSPREE_ID` it runs in demo mode and says so on screen.
- **Logo as identity:** the SVGs are never redrawn or altered; animations only change opacity and scale and end on the official logo.
- **WebP only in the repo:** source PNG captures stay outside it, and `scripts/process-captures.mjs` turns them into WebP at fixed widths without upscaling.
- **One site URL:** `site` in `astro.config.mjs` feeds canonicals, `og:url`, `og:image`, the JSON-LD, the sitemap and the generated `robots.txt`.

## Quality

<!-- TODO: Lighthouse results on the live URL (M7, part 3). -->

## Getting started

Requirements: Node.js 24 (see [`.nvmrc`](.nvmrc)) and npm.

```bash
npm install
npm run dev           # http://localhost:4321
npm test              # Vitest, single run
npm run check         # astro check (diagnostics and types)
npm run lint          # ESLint
npm run format:check  # Prettier
npm run build         # production build in dist/
npm run preview       # serve the build locally
```

### Contact form (optional)

Without configuration, the form runs in **demo mode**: it validates, but sends nothing and says so on screen. To receive real messages, create a form on [Formspree](https://formspree.io) and add its ID (the part after `/f/` in the endpoint) to `.env.local`, which git ignores:

```bash
PUBLIC_FORMSPREE_ID=your_form_id
```

The ID ships in the browser bundle, so it is not a secret. See [`.env.example`](.env.example). In production it is set as an environment variable on Vercel.

## Project structure

```text
src/
├── assets/
│   ├── brand/        # LAV Design logo SVGs (never altered)
│   └── captures/     # WebP screenshots for the case studies
├── components/       # Astro components: hero, chapters, menu, case study parts
├── content/work/     # one MDX case study per project
├── data/             # copy and project data, with their tests
├── layouts/          # BaseLayout: head, metadata, rail, top bar and menu
├── pages/            # routes, including robots.txt.js
├── scripts/          # client scripts (menu, chapters, contact form...) with their *.test.js
└── styles/global.css # Tailwind import and @theme tokens
scripts/              # Node scripts: process-captures.mjs, generate-og.mjs
public/               # favicons and og.png
```

## Workflow

AI-assisted: product, design and technical decisions and code review by me; implementation with Claude Code.

Work was split into milestones, one branch and one pull request each, with a description, verification steps and results. CI (format check, lint, `astro check`, tests and build) must pass before merging into `main`, and I review every change in the browser before it lands.

## Learning outcomes

- **Brand rules shape the code.** Because the logo can't be altered, its animation picks the symbol, wordmark and tagline by path order instead of regrouping the SVG.
- **Constraints need trade-offs, not workarounds.** At 360 px the lockup's tagline can't reach 12 px, so I chose to keep the full lockup on mobile rather than change the logo.
- **Motion is opt-in.** The horizontal chapters, the hero intro and the dialogs all have a plain, static path under reduced motion.
- **One source of truth pays off.** Moving the name and the site URL into single places made metadata, JSON-LD and the sitemap consistent with no copy-paste.

## Credits

- [Geist and Geist Mono](https://vercel.com/font) via [Fontsource](https://fontsource.org) (SIL Open Font License 1.1).
- [GSAP](https://gsap.com) for the intro, chapter and dialog motion (GSAP Standard License).
- [Lenis](https://lenis.darkroom.engineering) for smooth scrolling (MIT License).
- **Costa Ballena photography:** Luis Aguilar Vargas and Unsplash contributors.
- [Formspree](https://formspree.io) for form submissions.
- Project names, logos and screenshots in the case studies belong to their respective owners.

## License

All rights reserved. See [LICENSE](LICENSE).
