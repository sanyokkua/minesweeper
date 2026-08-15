# Repository Guidelines

## Current project

This repository contains the implemented Minesweeper static SPA/PWA. It uses Vite, React, TypeScript, Redux Toolkit, Vitest, React Testing Library, and Playwright. The production artifact is a static `dist` directory deployed to GitHub Pages under `/minesweeper/`.

There is no production backend, API, database, account system, or runtime server. Game state, preferences, records, and a resumable active game are kept in the browser under the versioned `minesweeper.local-state` `localStorage` record.

## Source of truth

Use these sources in this order:

1. Current source, configuration, tests, and GitHub Actions workflows for implemented behavior.
2. `.specify/memory/constitution.md` for repository-wide technical and delivery constraints.
3. The active feature under `specs/001-minesweeper-spa/`, especially `spec.md`, `ui-contract.md`, `plan.md`, `tasks.md`, contracts, and release evidence, for product intent and acceptance contracts.
4. `docs/minesweeper-mockup-v2.html` for visual reference only. Change production code when it diverges; do not rewrite the mockup to make a comparison pass.
5. `docs/minesweeper-web-spec.md` is historical input. Its old Next.js statements are not current implementation facts.

Preserve unrelated user changes. Do not reset, clean, or overwrite files outside the requested scope.

## Repository layout

- `src/domain/` — seeded, pure game engine and board configuration.
- `src/app/` — Redux store, app route/sheet state, and theme handling.
- `src/features/` — game lifecycle, preferences, records, and persistence.
- `src/i18n/` — typed English/Ukrainian localization.
- `src/pwa/` — service-worker, installation, and update lifecycle adapters.
- `src/ui/` — screens, components, board interactions, and CSS tokens.
- `public/` — manifest, icons, and public assets.
- `scripts/` — artifact and lifecycle-storage checks.
- `tests/` — unit, component, Pages-contract, and Playwright coverage.
- `.specify/` — constitution, scripts, templates, and workflow configuration.
- `.agents/skills/` — repository-local SpecKit workflow skills.
- `docs/` — maintained documentation and visual references.

Keep domain rules out of React components. UI components issue typed commands and render state snapshots; Redux owns application state; persistence is handled through the storage gateway and record codec.

## Runtime and commands

The required Node.js floor is 22.22.2. Install from the lockfile:

```sh
rtk npm ci
```

Use the repository's actual npm scripts rather than inventing commands:

```sh
rtk npm run dev
rtk npm run format:check
rtk npm run lint
rtk npm run typecheck
rtk npm run validate:lifecycle-storage
rtk npm run test:unit
rtk npm run test:coverage
rtk npm run build
rtk npm run validate:artifact
rtk npm run validate:pages
rtk npm run e2e
rtk npm run validate
```

Prefix repository commands with `rtk`. Use `rtk proxy` when the wrapper rejects a required flag. The build must preserve the `/minesweeper/` base path and local asset URLs.

Formatting is controlled by `.prettierrc.json`: four-space indentation, 120-character print width, no semicolons, single quotes, and trailing commas. TypeScript is strict and uses no-unused checks. Use semantic CSS tokens and the existing localization boundary; do not add inline styles or user-facing strings outside the catalogs.

## GitHub SpecKit workflow

Resolve the active feature from the repository every time:

```sh
rtk .specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks
```

For new behavior, use the local workflow skills in dependency order:

1. `speckit-specify` — create or update the feature requirements.
2. `speckit-clarify` — resolve material ambiguities.
3. `speckit-plan` — define architecture, contracts, dependencies, and validation.
4. `speckit-tasks` — generate dependency-ordered implementation tasks.
5. `speckit-implement` — execute the task ledger after required checklist approval.
6. `speckit-converge` — append only confirmed remaining work, then implement it.

Use `speckit-analyze` as a read-only consistency review. Requirements-quality checklists do not prove implementation or release behavior; keep implementation tests, artifact checks, browser evidence, and release evidence separate.

## Documentation maintenance

Documentation is part of the change. Whenever a change alters a documented fact — including behavior, public types, dependencies, scripts, configuration, CI, deployment, browser support, PWA behavior, storage shape, source layout, or user-facing controls — update the affected README/docs/agent guidance in the same change. Do not leave a current document describing the former behavior.

When documenting a fact, cite the source path and symbol where practical. Record configuration keys and paths, never secret values. Mark unresolved ownership or deployment-policy questions as `TODO: confirm`; do not invent them.

## Testing expectations

Use fixed seeded boards for game-engine and reducer tests. Component tests cover visible UI contracts. Playwright covers gameplay, persistence, responsive mouse/touch/keyboard input, PWA lifecycle, and the built Pages path. Validate `dist` at `/minesweeper/` for artifact and offline claims; distinguish environment capability skips from product failures.

## Git and review

Use concise Conventional Commit subjects. Do not bypass hooks, weaken tests, edit the constitution to make a check pass, or commit generated `dist`, coverage, Playwright reports, or test results. Include the relevant specification decision, user-visible behavior, commands run, and evidence in review descriptions. Do not commit or push unless explicitly requested.
