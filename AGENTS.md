# Repository Guidelines

## Project Structure & Module Organization

This repository is specification-first. Read
`.specify/memory/constitution.md` before making product or technical decisions; it is the
current authority for the Vite static SPA, PWA, GitHub Pages, browser, privacy, theme, and
localization rules. `docs/minesweeper-web-spec.md` describes the product and game rules;
reconcile it with the constitution rather than restoring its older Next.js assumptions.
`docs/minesweeper-mockup-v2.html` is the visual reference. Spec Kit templates and scripts
live in `.specify/`; local workflow skills live in `.agents/skills/`.

When the app is scaffolded, keep domain rules separate from React rendering and persistence:
one seeded, testable game engine owns board logic; Redux owns application state; UI components
issue commands and render snapshots. Do not duplicate game rules in components.

## Build, Test, and Development Commands

No Vite application or package scripts exist yet. Do not invent build or test commands.
Use the available project check while planning:

```sh
rtk .specify/scripts/bash/check-prerequisites.sh --json
```

Use `$speckit-specify`, `$speckit-plan`, and `$speckit-tasks` to establish an implementable
feature before coding. Once tooling exists, document its real `npm` scripts here and run the
lockfile-based install, formatter, linter, unit tests, browser tests, and production build.

## Coding Style & Naming Conventions

Write TypeScript with 2-space indentation. Prefer small, named React components; use
`PascalCase.tsx` for components, `camelCase.ts` for modules, and colocated `*.test.ts(x)` tests.
Keep all user-facing text in the English/Ukrainian localization boundary. Use design tokens for
light, dark, and system themes. Add dependencies only when existing browser APIs or dependencies
cannot meet the need; use the configured Prettier and ESLint rather than ad-hoc formatting.

## Testing Guidelines

Test game rules and Redux reducers with fixed, seeded boards. Add component tests for visible
contracts and browser tests for reveal, flag, win, loss, persistence, offline, installation, and
responsive mouse/touch flows. Validate the production `dist` artifact at the GitHub Pages
repository subpath; a previously cached route is not proof of cold-start offline support.

## Commit & Pull Request Guidelines

The history currently has only an initial commit, so use concise Conventional Commit-style
subjects, for example `feat: add seeded board engine` or `docs: clarify PWA caching`. In each PR,
link the relevant specification decision, summarize user-visible behavior, list commands run and
their results, and include screenshots or a short recording for UI changes. Do not bypass hooks,
weaken a test, or edit the constitution to make an implementation pass.
