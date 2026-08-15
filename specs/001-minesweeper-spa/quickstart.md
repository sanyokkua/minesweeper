# Validation Quickstart: Minesweeper Static SPA

Use this guide after implementation. It validates the product against the contracts rather than substituting for their tests.

## Prerequisites

- Node.js 22.22.2+ and the repository's committed lockfile. The locked jsdom 30.0.1 release
  requires `^22.22.2 || ^24.15.0 || >=26.0.0`, so CI and package metadata use Node 22.22.2+.
- Playwright browsers installed from the project's documented script.
- A clean browser profile for production-artifact PWA checks.

The deployed application is available at <https://sanyokkua.github.io/minesweeper/>.

## Quality and static artifact

1. Install strictly from the lockfile: `npm ci`.
2. Run the documented formatter, lint, non-emitting typecheck, unit/component, and browser commands.
3. Build: `npm run build`.
4. Serve only `dist` at `/minesweeper/`; do not use the Vite development server for the next checks.
5. Assert the built HTML, manifest, icon URLs, service-worker registration/scope, and all required local assets remain under `/minesweeper/`; confirm no remote gameplay request or runtime API is required.

## Core journeys

1. At initial Home, verify Beginner selection and reach first safe reveal in no more than three intentional interactions.
2. For every preset and a valid Custom game, run seeded tests for delayed exact mine placement, counts, flood fill, flag cap, flagged reveal clearing, loss, win/auto-flags, and terminal lockout. Record the documented 30x30 reveal/flag timing result.
3. Change input mode; verify mouse primary/secondary, board-only context-menu prevention, keyboard Arrow/Enter/Space/F behavior, initial top-left focus, and touch 600-ms long press/movement cancellation.
4. At 320, 768, and 1440 px, verify all controls and 24x24 board cells are reachable, cells remain >=32px, the board viewport alone scrolls, and page horizontal overflow is absent.
5. Change locale/theme with Help or Settings open; verify all visible text/theme, including the sheet, updates immediately. Verify system-theme fallback and both language catalogs.
6. Verify active-game Home return/resume/new confirmation, visible/sheet timer pauses, reload pause, exact-config replay, records, Custom recency/100-entry eviction, storage recovery, and reset-local-data while a live board stays playable but cannot later resume.

## PWA and Pages lifecycle

1. In a fresh persistent Chromium profile, visit the production artifact online, wait for service-worker registration, reload until controlled, then go offline and open a new page at `/minesweeper/`. Start or resume and finish a game with no failed required request.
2. Verify manifest/id/start/scope/icons and conditional install behavior; treat unavailable platform installation as an expected progressive-enhancement outcome, not an error.
3. Run the two-revision update test. Confirm a waiting release shows Update ready without reloading; choosing it persists the active session before activation. Force persistence failure and confirm no activation/reload occurs.
4. Inspect the Pages workflow: lockfile install, quality/build/artifact gates before `dist` upload, least-privilege permissions, concurrency protection, and no PR deployment.

## 2026-08-14 validation record

`npm ci` (519 packages, 0 vulnerabilities), `npm run format:check`, `npm run lint`,
`npm run typecheck`, `npm run test:unit` (29 files, 91 tests), `npm run build`,
`npm run validate:artifact`, and `npm run validate:pages` passed. The configured Playwright matrix
(`npx playwright test --reporter=dot`) passed 111 tests with 18 documented skips across Chromium,
Firefox, and WebKit. The run used Node.js `v24.18.0`, Playwright `1.62.1`, Chrome for Testing
`151.0.7922.34`, Firefox `153.0`, and WebKit `26.5`. Its Chromium release-environment timing
evidence measured 15.8 ms for a visible 30×30 flag update and 7.4 ms for a visible reveal; Firefox
and WebKit skip only that environment-specific timing case. The matrix includes the mockup-aligned
Home hierarchy, responsive 32–40px board cells, centered modal/outcome contracts, deterministic
build-stamp artifact checks, repository-link and branch-policy checks, and the gameplay/persistence
journeys. The touch regression passed in Chromium and WebKit and verifies that movement, cancellation,
and delayed context-menu/click events cannot create fallback actions after a cancelled gesture. The
production-artifact Chromium journey served built `dist` at `/minesweeper/`, reloaded under
service-worker control, opened a new offline page, classified required application requests, started
or resumed and finished gameplay, and preserved a fresh-start path. Startup install-prompt capture is
gated on verified service-worker readiness; `appinstalled` cleanup, update-notice dismissal and
deduplication after returning online, canonical persistence recovery, local font precaching,
two-revision waiting-worker acceptance with a blocking sheet open, and persistence-safe refusal to
activate were also covered. Hosted HTTPS installation remains a deployment-origin capability check
documented in `release-evidence.md`.

## 2026-08-15 Phase 18 convergence validation

`npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run test:unit` (29 files, 91 tests),
`npm run test:coverage` (30 files, 94 tests), `npm run build`, `npm run validate:artifact`, and
`npm run validate:pages` passed. The V8 coverage gate reported 74.95% statements, 68.17% branches,
76.41% functions, and 78.36% lines against thresholds of 70%, 60%, 65%, and 70%, respectively.
The unrestricted Playwright matrix ran 129 cases across Chromium, Firefox, and WebKit: 111 passed
and 18 documented capability skips. The run recorded 13.6 ms for the visible 30×30 flag update and
7.4 ms for the visible reveal. The seeded loss and terminal-projection journeys passed in all three
browser engines. The focused install-readiness component test passed without the prior React
`act(...)` warning.

## 2026-08-15 Phase 19 convergence validation

The lifecycle storage-boundary regression and Custom recency regression passed in the current
worktree. `npm run test:unit` passed 29 files with 92 tests, and `npm run test:coverage` passed 30
files with 95 tests at 74.95% statements, 68.08% branches, 76.41% functions, and 78.38% lines
against the configured thresholds. Format, lint, typecheck, Pages workflow checks, the production
build, and artifact validation also passed. The fresh unrestricted Playwright matrix passed 111 of
129 cases with 18 documented capability skips across Chromium, Firefox, and WebKit; its Chromium
visible 30×30 timing was 12.5 ms for flag and 8.6 ms for reveal. Custom record coverage now proves
that a better completion preserves the game-start `lastStartedAt` while the 100-entry eviction
boundary remains deterministic.

## 2026-08-15 Phase 20 convergence validation

The Vitest/jsdom storage boundary now uses a configured `/minesweeper/` origin, and the lifecycle
component supplies one explicit storage gateway to `App` and hydration. Blocking-sheet persistence
and coalesced visibility/pagehide persistence pass without unavailable-storage or teardown errors.
`npm run test:unit` passed 29 files with 92 tests; `npm run test:coverage` passed 30 files with 95
tests at 74.95% statements, 68.08% branches, 76.41% functions, and 78.38% lines against thresholds
of 70%, 60%, 65%, and 70%. `npm run validate` passed formatting, lint, typecheck, unit/component
tests, production build, and artifact validation. `npm run validate:pages` passed 1 file with 3
tests.

## 2026-08-15 Phase 21 convergence validation

The focused application-lifecycle suite passed 2 tests, covering blocking-sheet persistence and
coalesced visibility/pagehide persistence with an explicit `window.localStorage` gateway. The full
`npm run test:unit` gate passed 29 files with 92 tests. `npm run test:coverage` passed 30 files with
95 tests at 74.95% statements, 68.08% branches, 76.41% functions, and 78.38% lines against the
configured 70%, 60%, 65%, and 70% thresholds. `npm run validate` passed formatting, lint, typecheck,
unit/component tests, production build, and artifact validation; the artifact check found 13 local
files under `/minesweeper/`. `npm run validate:pages` passed 1 file with 3 tests.

## 2026-08-15 Phase 22 convergence validation

The lifecycle fixture now owns a fresh Map-backed `Storage` and `StorageGateway` per test. Both
tests inject that gateway into `App`; the rehydration assertion uses the same fake, and no test
path reads browser storage or spies on a storage prototype. The first test explicitly verifies an
unavailable gateway fails while the injected fake still persists and rehydrates the accrued 1,250 ms
session. The second test proves a hidden `visibilitychange` followed by `pagehide` produces one
5,000 ms persistence write, then unmounts cleanly. `afterEach` restores Date.now,
`document.visibilityState`, mocks, and mounted trees. `npm run validate:lifecycle-storage` passed the
static forbidden-reference guard.

The locked runtime decision is Node.js 22.22.2+: jsdom 30.0.1 declares
`^22.22.2 || ^24.15.0 || >=26.0.0`; package metadata and both CI workflows now use 22.22.2.
The current workspace ran Node.js `v24.18.0` and verified the lock metadata against that floor.
The focused lifecycle plus persistence/storage/game-lifecycle command passed 4 files and 9 tests.
`rtk npm run test:unit` passed 29 files with 92 tests; `rtk npm run test:coverage` passed 30 files
with 95 tests at 74.95% statements, 68.08% branches, 76.41% functions, and 78.38% lines against
the configured 70%, 60%, 65%, and 70% thresholds. `rtk npm run validate` passed format, lint,
typecheck, the static guard, unit/component tests, production build, and artifact validation;
`rtk npm run validate:pages` passed 1 file with 3 tests. The unrestricted
`rtk npm run e2e -- --reporter=line` matrix required scoped host access after the sandbox rejected
the local web-server bind with EPERM; the unchanged rerun passed 111 of 129 cases with 18
capability-scoped skips across Chromium, Firefox, and WebKit.

## 2026-08-15 Phase 23 convergence validation

The short-touch pointer-capture regression passed in the component suite and in the focused
Chromium production-touch journey: a normal touch still performs the primary action after
`pointerup` and `lostpointercapture`, while interrupted gestures remain cancelled. The full
`rtk npm run validate` gate passed with 29 files and 93 unit/component tests; coverage passed 30
files and 96 tests at 75.66% statements, 68.80% branches, 77.11% functions, and 79.07% lines.
Pages validation passed 1 file with 3 tests. The quality, release, and requirements checklists are
closed with 80 of 80 items complete.
