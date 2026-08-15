# Development

## Environment requirements

- Node.js `22.22.2` or newer. The package metadata and CI workflows use this floor because the locked `jsdom` release requires it.
- npm and the committed `package-lock.json`.
- Playwright browser binaries for the full browser matrix.
- No database, API server, Docker daemon, environment secret, or external service account is required for local development.

Install exactly from the lockfile:

```sh
rtk npm ci
```

Start Vite at the configured repository base path:

```sh
rtk npm run dev
```

Open `http://localhost:5173/minesweeper/`.

## Dependencies and tooling

The direct dependency versions below are pinned in `package.json` and `package-lock.json`.

| Area | Packages |
|---|---|
| Runtime UI | `react` 19.2.8, `react-dom` 19.2.8 |
| Client state | `@reduxjs/toolkit` 2.12.0, `react-redux` 9.2.0 |
| Build | `vite` 8.2.1, `@vitejs/plugin-react` 6.0.5, `vite-plugin-pwa` 1.3.0 |
| Language | `typescript` 5.9.3, `@types/node` 26.2.0, `@types/react` 19.2.18, `@types/react-dom` 19.2.4 |
| Unit/component tests | `vitest` 4.1.10, `@vitest/coverage-v8` 4.1.10, `jsdom` 30.0.1, `@testing-library/react` 16.3.2, `@testing-library/jest-dom` 7.0.1, `@testing-library/user-event` 14.6.4 |
| Browser tests | `@playwright/test` 1.62.1 |
| Quality | `eslint` 10.8.1, `@eslint/js` 10.0.1, `typescript-eslint` 8.67.0, `eslint-plugin-react-hooks` 7.1.1, `eslint-plugin-react-refresh` 0.5.4, `eslint-config-prettier` 10.1.8, `prettier` 3.9.6 |

There are no runtime CDN dependencies. Fonts are bundled locally and are not fetched from their source repositories at runtime.

## Commands

| Command | Definition in `package.json` | Use |
|---|---|---|
| `npm run dev` | `vite` | Development server. |
| `npm run dev-network` | `vite --host` | Development server bound for network-device testing. |
| `npm run build` | `tsc -b && vite build` | Typecheck and emit `dist`. |
| `npm run preview` | `vite preview` | Serve the built artifact locally. |
| `npm run format` | `prettier --write .` | Write repository formatting. |
| `npm run format:check` | `prettier --check .` | Check formatting. |
| `npm run lint` | `eslint .` | Run ESLint. |
| `npm run typecheck` | `tsc -b --pretty false` | Non-emitting strict TypeScript check. |
| `npm run test` | `vitest run` | Run Vitest tests, excluding Playwright specs via `vitest.config.ts`. |
| `npm run test:unit` | `vitest run tests/unit tests/component` | Unit and component tests. |
| `npm run test:coverage` | `vitest run --coverage` | V8 coverage with configured thresholds. |
| `npm run e2e` | `playwright test` | Chromium, Firefox, and WebKit tests. |
| `npm run e2e:headed` | `playwright test --headed` | Visible-browser Playwright run. |
| `npm run validate:artifact` | `node scripts/validate-artifact.mjs` | Static artifact contract. |
| `npm run validate:lifecycle-storage` | `node scripts/validate-lifecycle-storage.mjs` | Lifecycle storage-boundary guard. |
| `npm run validate:pages` | `vitest run tests/e2e/pagesWorkflow.test.ts` | Pages workflow contract. |
| `npm run validate` | Combined quality/build gate | Local pre-review gate. |

Prefix commands with `rtk` when working through the repository command wrapper. Use `rtk proxy` for commands whose flags are not accepted by the wrapper.

## Source layout

```text
src/main.tsx                 Browser bootstrap and Redux provider
src/App.tsx                  Route rendering, hydration, lifecycle, timer, PWA registration
src/domain/                  Pure seeded engine and board configuration
src/app/                     Store, typed hooks, route/sheet state, theme
src/features/game/           Game reducer, selectors, timer, records
src/features/preferences/    Locale, appearance, input mode, selected configuration
src/features/persistence/    Storage gateway, versioned codec, hydration and writes
src/i18n/                    Typed English/Ukrainian catalogs and translation helpers
src/pwa/                     Service-worker registration, update, and installation adapters
src/ui/screens/              Home and Game screens
src/ui/components/           Board, HUD, sheets, actions, controls, and interaction helpers
src/ui/styles/               Global/layout/component/board CSS and semantic tokens
public/                      Manifest and icon assets
scripts/                     Artifact/lifecycle validation
tests/unit/                  Domain, Redux, persistence, PWA, i18n, and theme tests
tests/component/             Visible component and lifecycle contracts
tests/e2e/                   Browser journeys and Pages workflow test
```

## Style and design rules

- TypeScript is strict; keep domain rules independent from React and persistence.
- Use four-space indentation, 120-column formatting, no semicolons, single quotes, and trailing commas as configured by `.prettierrc.json`.
- Use named PascalCase React components and camelCase TypeScript modules.
- Keep all user-facing strings in `src/i18n/catalog.ts`; maintain English/Ukrainian key parity.
- Use semantic CSS custom properties from `src/ui/styles/tokens.css`; do not add inline styles.
- Keep board cells reachable on small screens, with board-only scrolling and the 32 CSS-pixel minimum contract.
- Keep tests deterministic with injected timestamps, seeded boards, and explicit storage gateways.

## Tests and validation

- Domain tests in `tests/unit/domain/` cover configuration, seeded randomness, mine placement, flood fill, flags, win, loss, and terminal no-ops.
- Redux/persistence tests cover clock lifecycle, records, malformed/future records, storage failures, reset behavior, and resumability.
- Component tests cover screen hierarchy, visible controls, sheets, board interaction, localization, themes, and lifecycle persistence.
- Playwright tests cover gameplay, responsive layouts, mouse/touch/keyboard input, help/recovery, persistence, PWA lifecycle, artifact behavior, and Pages workflow assertions.
- `vitest.config.ts` uses jsdom at `http://localhost/minesweeper/`, excludes only `tests/e2e/**/*.spec.ts`, and enforces 70% statements/lines, 65% functions, and 60% branches.
- `playwright.config.ts` uses the `/minesweeper/` base URL and runs Chromium, Firefox, and WebKit.
- Production/offline claims must use built `dist` and a fresh browser context. A development server or previously cached page is not sufficient.

## Spec-driven changes and agent guidance

The repository uses local GitHub SpecKit skills under `.agents/skills/` and `.specify/`.

1. Read `.specify/memory/constitution.md` and the active feature artifacts.
2. Resolve the active feature live:

   ```sh
   rtk .specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks
   ```

3. Use `speckit-specify` and `speckit-clarify` for intent, then `speckit-plan` and `speckit-tasks` for implementation design and task order.
4. Use `speckit-implement` to process the task ledger. If a checklist gate is incomplete, preserve that status and proceed only after the required approval.
5. Use `speckit-converge` after implementation to append confirmed gaps, then run implementation again. Use `speckit-analyze` only for read-only cross-artifact review.
6. Update documentation whenever code, dependencies, configuration, CI, deployment, public assets, or behavior changes a documented fact.

The current active feature resolves to `specs/001-minesweeper-spa`. Its `spec.md` and `ui-contract.md` are the current product contract; the earlier `docs/` web specification is not.

## Generated and ignored outputs

`dist/`, `coverage/`, `playwright-report/`, `test-results/`, `node_modules/`, and TypeScript build-info files are generated or local-only and are ignored. Do not document generated files as source modules or commit them as implementation output.
