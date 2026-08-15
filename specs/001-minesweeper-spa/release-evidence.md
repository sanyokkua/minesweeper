# Release evidence

Recorded 2026-08-14 for Feature 001.

## Validation environment

- Node.js: `v24.18.0` on macOS arm64.
- Supported Node 22 decision: `22.22.2+`; the locked jsdom 30.0.1 package requires
  `^22.22.2 || ^24.15.0 || >=26.0.0`, and CI/Page workflows use `22.22.2`.
- Playwright: `1.62.1`; Chrome for Testing `151.0.7922.34`, Firefox `153.0`, and WebKit `26.5`.
- Artifact under test: built `dist/`, served at `http://127.0.0.1:<port>/minesweeper/` with base, manifest,
  worker scope, `id`, and `start_url` all rooted at `/minesweeper/`.
- The production PWA journey used a fresh persistent Chromium context, an online visit followed by a
  controller reload, then a new offline page. Required application requests were classified and failed
  requests were asserted empty. Installation remains capability-dependent on hosted HTTPS and
  `beforeinstallprompt`.

## Automated evidence

| Gate | Command | Result |
| --- | --- | --- |
| Lockfile install | `npm ci` | PASS; 519 packages installed and 0 vulnerabilities reported from the committed lockfile |
| Formatting | `npm run format:check` | PASS |
| Lint | `npm run lint` | PASS |
| Typecheck | `npm run typecheck` | PASS |
| Lifecycle storage guard | `rtk npm run validate:lifecycle-storage` | PASS; no ambient storage, storage-prototype, or default-gateway references in the lifecycle fixture |
| Unit/component | `npm run test:unit` | PASS; 29 files, 92 tests |
| Coverage | `npm run test:coverage` | PASS; 30 files, 95 tests; 74.95% statements, 68.08% branches, 76.41% functions, 78.38% lines |
| Static build | `npm run build` | PASS; Vite 8.2.1, static `dist` with local font assets |
| Artifact contract | `npm run validate:artifact` | PASS; Pages base, manifest, icons, worker, local assets and font precache |
| Pages workflow | `npm run validate:pages` | PASS |
| Cross-engine browser | `npx playwright test --reporter=dot` | PASS; 111 passed, 18 documented skips |

The performance harness measured the seeded 30×30 visible update under the 250 ms release budget in
the documented Chromium release environment: flag 15.8 ms and reveal 7.4 ms in the final matrix run.
Firefox and WebKit skip this environment-specific timing gate while still running their supported
desktop gameplay and responsive journeys. The browser suite covers Home/Play, the mockup-aligned two-column Home
hierarchy, responsive cell sizing, reveal, flag, persistence reload, retained offline active-board
resume/finish, Custom selection and recency,
deterministic win/loss and replay, local-data reset, keyboard/mapped input, language changes, Help,
centered modal surfaces, responsive 320/768/1440 layouts, build-stamp and repository-link artifact
checks, production-artifact required-request classification, offline gameplay, gated installation,
and the touch long-press cancellation/context-menu
follow-up path in Chromium and WebKit. Unit coverage also proves waiting-worker notice deduplication, startup
install-prompt capture, appinstalled cleanup, canonical persistence recovery, update activation
handshakes, and refusal to activate when the active snapshot cannot flush. The production-artifact
Chromium journey also serves two same-origin service-worker revisions, keeps a blocking Settings sheet
open while an update becomes ready, accepts the explicit update only after persistence, proves notice
dismissal is deduplicated after returning online, and verifies that a persistence failure leaves the
waiting worker and page in place. The pagehide/visibility lifecycle slice also completed without
Redux reducer-execution or unsubscribe errors in focused and production-browser evidence.

## Phase 22 convergence validation

Recorded 2026-08-15. The focused command
`rtk npm run test -- tests/component/app-lifecycle.test.tsx tests/unit/features/storageGateway.test.ts tests/unit/features/persistenceController.test.ts tests/unit/features/gameLifecycle.test.ts`
passed 4 files and 9 tests. Each lifecycle case used a fresh Map-backed test-owned storage and
injected gateway; persisted values were read from that same Map. The unavailable-storage check
passed, the forbidden-reference guard passed, and explicit cleanup restored Date.now,
`document.visibilityState`, spies, event listeners through unmount, and mounted trees.

`rtk npm run test:unit` passed 29 files and 92 tests. `rtk npm run test:coverage` passed 30 files and
95 tests at 74.95% statements, 68.08% branches, 76.41% functions, and 78.38% lines. `rtk npm run
validate` passed formatting, lint, typecheck, the lifecycle guard, unit/component tests, production
build, and artifact validation; `rtk npm run validate:pages` passed 1 file with 3 tests. The exact
runtime check passed on local Node.js `v24.18.0` against package engine `>=22.22.2` and jsdom 30.0.1's
declared engine floor; CI and Pages are aligned to Node `22.22.2`.

The unrestricted command `rtk npm run e2e -- --reporter=line` first hit the sandbox's `listen EPERM`
restriction before tests started. Its unchanged scoped-host rerun passed 111 of 129 cases with 18
capability-scoped skips across Chromium, Firefox, and WebKit, including 15.5 ms flag and 8.6 ms
reveal visible 30×30 timings in Chromium. No browser test failed.

## Phase 18 convergence validation

Recorded 2026-08-15. The seeded loss journey derives a known mine from the fixed browser seed and
passes in Chromium, Firefox, and WebKit; the unrestricted matrix then ran 129 cases with 111 passed
and 18 documented capability skips. The Chromium timing harness measured 13.6 ms for a visible 30×30
flag update and 7.4 ms for a visible reveal. The locked `@vitest/coverage-v8` provider passed
`npm run test:coverage` with 30 files and 94 tests: 74.95% statements, 68.17% branches, 76.41%
functions, and 78.36% lines against the configured 70%, 60%, 65%, and 70% thresholds. The
install-readiness component test now awaits its prompt event inside React `act(...)`, and the
component suite completed without the previous warning.

## Phase 19 convergence validation

Recorded 2026-08-15. The application-lifecycle storage-boundary test and the Custom game-start
recency regression passed. `npm run test:unit` passed with 29 files and 92 tests; the V8 coverage
gate passed with 30 files and 95 tests at 74.95% statements, 68.08% branches, 76.41% functions,
and 78.38% lines against thresholds of 70%, 60%, 65%, and 70%. Format, lint, typecheck, Pages
workflow validation, production build, and artifact validation passed. The fresh unrestricted
Playwright matrix passed 111 of 129 cases with 18 documented capability skips across Chromium,
Firefox, and WebKit. Chromium visible 30×30 timing was 12.5 ms for flag and 8.6 ms for reveal.

## Phase 20 convergence validation

Recorded 2026-08-15. Vitest now uses a configured `/minesweeper/` jsdom origin, and the
application-lifecycle component passes one explicit browser-storage gateway into `App` and its
hydration path. The blocking-sheet elapsed-time case and paired visibility/pagehide persistence
case both pass without unavailable-storage or teardown/re-entrancy errors. `npm run test:unit`
passed 29 files with 92 tests; `npm run test:coverage` passed 30 files with 95 tests at 74.95%
statements, 68.08% branches, 76.41% functions, and 78.38% lines against thresholds of 70%, 60%,
65%, and 70%. `npm run validate` passed formatting, lint, typecheck, unit/component tests,
production build, and artifact validation. `npm run validate:pages` passed 1 file with 3 tests.

## Phase 21 convergence validation

Recorded 2026-08-15. The focused lifecycle suite passed 2 tests using the configured
`/minesweeper/` jsdom origin and an explicit `window.localStorage` gateway. It proves blocking-sheet
elapsed-time persistence and coalesced visibility/pagehide persistence before teardown without
unavailable-storage or re-entrancy errors. The full unit gate passed 29 files with 92 tests; the V8
coverage gate passed 30 files with 95 tests at 74.95% statements, 68.08% branches, 76.41% functions,
and 78.38% lines against thresholds of 70%, 60%, 65%, and 70%. `npm run validate` passed formatting,
lint, typecheck, unit/component tests, the production build, and artifact validation, which found 13
local files under `/minesweeper/`. `npm run validate:pages` passed 1 file with 3 tests.

## Phase 23 convergence validation

Recorded 2026-08-15. A short touch now preserves the primary cell action after the browser releases
pointer capture; an interrupted gesture still suppresses fallback actions, and the existing
long-press flag behavior remains covered. The component regression passed within `rtk npm run
test:unit`, which passed 29 files and 93 tests. `rtk npm run test:coverage` passed 30 files and 96
tests at 75.66% statements, 68.80% branches, 77.11% functions, and 79.07% lines. `rtk npm run
validate` passed formatting, lint, typecheck, lifecycle guard, unit/component tests, production
build, and artifact validation; `rtk npm run validate:pages` passed 1 file with 3 tests. The focused
Chromium production-touch Playwright regression passed 1 of 1 case after the initial sandbox
`listen EPERM` capability restriction was rerun with scoped host access. Requirements, quality, and
release checklists are all closed: 80 of 80 items complete.

## Manual browser observations

- Home begins with Beginner selected and a visible Play control.
- The Home screen follows the mockup hierarchy: compact brand top bar, theme/settings affordances,
  local-first status badge, larger centered pixel wordmark and preview board, two-column radio-style
  difficulty cards at desktop widths, Custom “set your own” presentation, a Play/How to Play action
  row, record summary, reduced footer actions, and a bottom build stamp.
- Play opens a labelled board; reveal exposes numbers/flood-fill state; right-click flags an
  unopened cell without opening the browser context menu.
- On touch-enabled Chromium/WebKit, holding an unopened cell flags it once; a delayed native
  context-menu event and its follow-up click do not clear the flag.
- The Game screen uses the mockup's compact LCD-like flags/time HUD, semantic status face, styled
  Tap/Hold/right-click/F hint, framed retro board, 32–40px responsive cells, semantic number tints,
  contained overflow cues, and centered outcome surfaces with explanatory copy and result cards.
  The same number class remains stable after switching Light/Dark appearance.
- Closing a terminal outcome hides only the centered result surface; the Game route, projected board,
  flags, and terminal lock remain visible until Menu, Play again, or Reset game is chosen.
- Settings presents descriptive selected choice cards for input mode and appearance, updates an open
  centered dialog from English to Ukrainian immediately, and preserves language, input mode,
  appearance, and reset controls.
- Help derives pointer, touch, keyboard, and primary/secondary mapping guidance from the selected
  input mode, provides a localized Got it action, and modal sheets trap focus and restore it to
  their trigger.
- Back pauses the active session and Home exposes separate Resume game and New game actions.
- At 320, 768, and 1440 CSS pixels the document width equals the viewport width; oversized board
  content remains contained in the board viewport and cells retain the 32px minimum.
- The built manifest resolves under `/minesweeper/`, generated `sw.js` precaches local assets, and
  the built JavaScript contains the deterministic `App Build` stamp contract. CI injects its run
  timestamp; local builds render `dev version`.

## Known capability limitations

Installation prompting requires a hosted HTTPS Pages origin, a verified service-worker registration,
and a browser profile that exposes `beforeinstallprompt`; that capability is progressive and does not
block gameplay. The install gateway captures the prompt at application startup, removes it after
`appinstalled` or the user's choice, and shows localized Android browser-menu guidance only after the
service-worker readiness boundary when no prompt is delivered. The Home surface makes no unconditional
installable/offline-ready claim. The implementation keeps updates prompt-controlled and
stores the active snapshot before an explicit activation path. The local production-artifact
journey proves the online-first cold-offline contract and the two-revision update/refusal path at
the Pages subpath. Hosted HTTPS installation remains a deployment-origin check. The 250 ms visible timing gate is
intentionally documented against Chromium because browser scheduling variance is material at this
threshold. Firefox and WebKit skip that timing case and the Chromium-specific service-worker
lifecycle cases, and Firefox desktop touch emulation skips the PointerEvent long-press path; their
supported desktop gameplay/responsive suites pass.

## Requirement mapping

- FR-001, FR-028, FR-033–FR-034: Vite static build, dependency review, workflows, artifact and
  cross-engine gates.
- FR-002–FR-010: `config`, seeded PRNG, and pure engine tests.
- FR-011–FR-014, FR-023–FR-027: Redux timer, record codec, caught storage gateway, lifecycle and
  browser persistence tests.
- FR-015–FR-022, FR-031–FR-032: typed bilingual catalog, themes, accessible primitives, board
  keyboard/pointer/touch adapter, Help and responsive browser tests.
- FR-029–FR-030: manifest, generated worker, install/update gateways, Pages artifact checks, and
  progressive PWA journey.
- SC-001–SC-009: unit/component timing, 111 passed browser cases plus 18 documented capability
  skips, Chromium visible timing, responsive observations, local-only artifact/build-stamp scan,
  branch-policy workflow validation, and the repository-link check above.
