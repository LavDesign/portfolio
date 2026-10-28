# LAV Design portfolio: notes for Claude Code

Portfolio of Luis Aguilar Vargas (LAV Design), Digital Experience Builder. Static site, English content, dark only.

## Working with Luis

- Respond in Spanish. Code, commits, PRs and README in English.
- Luis directs and decides; you propose, explain and implement. Ask when in doubt.
- One milestone at a time. Short reports (about 6 lines) that separate what you ran from what you only read. End with a single next step.
- Luis has ADHD: be concise and go one step at a time.

## Stack

Astro 7 (static) · Tailwind CSS v4 (tokens in src/styles/global.css @theme) · GSAP (ScrollTrigger, SplitText) · Lenis · MDX case studies (src/content/work) · Vitest + jsdom · Node 24 (.nvmrc)

## Commands

- `npm run dev -- --background` (see AGENTS.md) · `npx astro dev stop`
- `npm run format:check`, `lint`, `check`, `test` and `build` must all pass before any commit.
- Restart the dev server after changes to config, content collections or new files.

## Git rules (non-negotiable)

- main is always stable. One branch per milestone (feat/, fix/, docs/, chore/).
- Confirm the current branch before every commit.
- No commit until Luis authorizes it. Add files by name; never `git add -A`.
- Conventional Commits in English. Author: Luis Aguilar Vargas (noreply email). No AI attribution.
- One PR per milestone, in English: what, decisions, how to test, pending. Wait for CI.
- Luis merges. Never force push, never rewrite main, and never delete a branch without confirming its PR is MERGED.

## Content and honesty

- Never invent metrics, clients, users, testimonials or results. Missing content stays as a visible Todo.
- src/data/ is the single source of copy and project data. Approved copy is used verbatim.
- The logo is an identity: never redraw, rotate or alter it. SVGO only with the safe config (precision 5, no mergePaths), verified pixel by pixel. Ask Luis before any new use of the logo.
- Source PNG captures live outside the repo (~/Projects/LavDesign/captures/). Only WebP enters the repo, through scripts/process-captures.mjs. Never upscale.
- No personal data (address, phone, ID, age).
- Internal documents (case drafts, decision logs, client agreements, passwords, private links) never enter the repo.

## Design

- Brutalist-minimal: typography is the structure. One accent (brand #DD4B39). No shadows, gradients or carousels (no arrows, dots or autoplay).
- Horizontal chapters only at 1024px and up without reduced motion; everything is vertical otherwise.
- Motion: 160–200 ms ease-out micro-interactions; respect prefers-reduced-motion everywhere.
- Accessibility: one h1 per page, visible brand focus ring, 44 px targets, AA contrast.

## Status

Done: M1–M6e (setup, shell, hero, horizontal chapters, Work and case template, About and Contact, polish, identity, captures, menu motion, chapter indicator).
Case study content: all 4 cases ready.
Pending: re-export the PES capture without sample data, and a new GCE capture taken in an incognito window.
Next: real contact form (Formspree), M7 launch on Vercel (site URL, canonical, sitemap, absolute og:image, README, ruleset, Lighthouse on the live URL).
Update this section in every milestone PR.
