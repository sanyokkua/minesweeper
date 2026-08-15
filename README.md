# Minesweeper

Minesweeper is a bilingual English/Ukrainian static SPA and installable PWA. It runs entirely in the browser, stores player data in browser `localStorage`, and is built for GitHub Pages under the `/minesweeper/` repository path.

The repository does not contain a backend, API, account system, database, or runtime server dependency.

Source repository: <https://github.com/sanyokkua/minesweeper>

## Screens

The Home screen selects a preset or Custom board and provides access to play, help, settings, installation, and retained records.

![Minesweeper Home screen](docs/screens/MainMenu.png)

The Game screen contains the difficulty label, flags counter, status/reset control, timer, input hint, and a scrollable board.

![Minesweeper Game screen](docs/screens/GamePlay.png)

## Prerequisites

- Node.js 22.22.2 or newer.
- npm, using the committed `package-lock.json`.
- Playwright browser binaries for the full browser suite. Install them with `npx playwright install --with-deps chromium firefox webkit` when needed.

## Local development

```sh
npm ci
npm run dev
```

Open `http://localhost:5173/minesweeper/`. The Vite base path is part of the application configuration, so local testing should use the `/minesweeper/` path.

To serve the production build locally:

```sh
npm run build
npm run preview
```

## Quality commands

| Command                              | Purpose                                                                                                 |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `npm run format`                     | Format repository files with Prettier.                                                                  |
| `npm run format:check`               | Check Prettier formatting without writing files.                                                        |
| `npm run lint`                       | Run ESLint.                                                                                             |
| `npm run typecheck`                  | Run the non-emitting TypeScript build.                                                                  |
| `npm run test`                       | Run the Vitest test set.                                                                                |
| `npm run test:unit`                  | Run unit and component tests.                                                                           |
| `npm run test:coverage`              | Run unit/component tests with V8 coverage thresholds.                                                   |
| `npm run e2e`                        | Run Chromium, Firefox, and WebKit Playwright tests.                                                     |
| `npm run e2e:headed`                 | Run Playwright tests with visible browsers.                                                             |
| `npm run validate:lifecycle-storage` | Check the lifecycle-storage test boundary.                                                              |
| `npm run validate:artifact`          | Validate the built GitHub Pages artifact.                                                               |
| `npm run validate:pages`             | Validate the Pages workflow contract.                                                                   |
| `npm run validate`                   | Run formatting, lint, typecheck, lifecycle guard, unit/component tests, build, and artifact validation. |

The usual local gate is:

```sh
npm run validate
npm run validate:pages
npm run e2e
```

The Playwright suite builds the app before starting its local server. Release checks must additionally inspect the built `dist` artifact at `/minesweeper/`; a cached page or a development server is not proof of cold-start offline behavior.

## Documentation

- [`docs/index.md`](docs/index.md) — documentation map, authority hierarchy, screens, and coverage map.
- [`docs/architecture.md`](docs/architecture.md) — runtime architecture, game rules, state, persistence, and PWA data flows.
- [`docs/development.md`](docs/development.md) — local setup, scripts, dependencies, source layout, tests, and SpecKit workflow.
- [`docs/operations.md`](docs/operations.md) — CI, GitHub Pages, artifact requirements, PWA lifecycle, and troubleshooting.
- [`specs/001-minesweeper-spa/spec.md`](specs/001-minesweeper-spa/spec.md) — current product requirements.
- [`specs/001-minesweeper-spa/ui-contract.md`](specs/001-minesweeper-spa/ui-contract.md) — current visual and interaction contract.
- [`docs/minesweeper-mockup-v2.html`](docs/minesweeper-mockup-v2.html) — visual reference for production UI convergence.

## Repository layout

```text
src/domain/       Seeded game engine, board configuration, coordinates, and types
src/app/          Redux store, application route/sheet state, and theme controller
src/features/     Game lifecycle, preferences, records, and local persistence
src/i18n/         English/Ukrainian message catalog and locale helpers
src/pwa/          Service-worker registration, update activation, and installation handling
src/ui/           Screens, reusable components, board interaction, and token-based CSS
public/           Manifest, icons, and public artifact assets
scripts/          Static artifact and lifecycle-storage validation scripts
tests/            Unit, component, Pages-contract, and Playwright tests
specs/            GitHub SpecKit requirements, plans, contracts, tasks, and evidence
docs/             Maintained technical documentation and visual references
```

## Changes

Read [`docs/development.md`](docs/development.md) before changing the application. New behavior is planned through the repository's GitHub SpecKit workflow. Changes to behavior, dependencies, configuration, CI, deployment, public assets, or documented interfaces must update the affected documentation in the same change.

## License

The application is licensed under the [MIT License](LICENSE). The bundled Inter and Press Start 2P fonts are licensed under the SIL Open Font License 1.1; their sources are listed in [`src/assets/fonts/README.md`](src/assets/fonts/README.md).
