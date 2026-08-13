# Implementation Plan: Minesweeper Static SPA

**Branch**: `001-minesweeper-spa` | **Date**: 2026-08-14 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification at `specs/001-minesweeper-spa/spec.md`, its [UI contract](ui-contract.md), and the governing constitution.

## Summary

Deliver a private, bilingual Minesweeper progressive web app as a Vite-built static React SPA. A pure seeded TypeScript engine owns board rules; Redux Toolkit owns hydrated client/session state; an explicit validated local-storage boundary owns the single retained record; React only renders selectors and dispatches named commands. The delivery finishes with subpath-correct GitHub Pages/PWA artifacts and production-artifact browser evidence for offline, installation, and user-approved updates.

## Technical Context

**Language/Version**: TypeScript with strict compiler settings; Node.js 22.12+ (Vite's documented supported floor is also 20.19+). Resolve and lock the latest mutually compatible stable package versions when scaffolding from the committed lockfile.

**Primary Dependencies**: React 19, Redux Toolkit with React Redux, Vite, `vite-plugin-pwa`/Workbox in generated-service-worker prompt-update mode, Vitest, React Testing Library, and Playwright. Do not add an i18n, CSS-in-JS, component-library, persistence, routing, or data-fetching dependency without a documented unmet need.

**Storage**: One browser `localStorage` key, `minesweeper.local-state`, containing one versioned, validated record of approved preferences, records, and at most one active resumable session. No server, account, analytics, or runtime API.

**Testing**: Vitest for engine, store, persistence, and component tests; Playwright for Chromium, Firefox, and WebKit user journeys, plus Chromium PWA/service-worker production-artifact tests.

**Target Platform**: Current and immediately previous stable Chromium-based browsers, Firefox, and Safari/WebKit; static GitHub Pages at the repository subpath `/minesweeper/`; install is progressive enhancement for browsers that offer it.

**Project Type**: Client-only static web application/PWA.

**Performance Goals**: A visible reveal or flag state update for a 30x30 board within 250 ms in the documented release-test environment; no board cell below 32x32 CSS pixels.

**Constraints**: Vite `dist` only; no production runtime network dependency after the first successful online visit; all product text English/Ukrainian; CSS semantic tokens rather than per-element raw palette/inline style; board-only two-axis scrolling; user-controlled service-worker update activation that persists an active session first.

**Scale/Scope**: One single-player game, four configurations (three standard plus bounded Custom), Home and Game screens, modal sheets, local preferences/records/resume state, and static Pages deployment. No routing/deep-link surface, accounts, tracking, sound, multiplayer, monetization, server APIs, or native package.

## Constitution Check

### Pre-design gate

| Principle | Plan response | Result |
| --- | --- | --- |
| I. Faithful Game Rules First | A pure, fixed-seed domain engine is the only rules authority; components never calculate board logic. | PASS |
| II. Vite Static SPA, Installable, Private | Vite builds `dist`; PWA/manifest/service worker are local, static, base-path-aware, and use a prompt update path. | PASS |
| III. Responsive, Cross-Browser Interaction | A shared responsive UI supports pointer, touch, keyboard, focus, and board-contained scrolling; unsupported install/SW features degrade safely. | PASS |
| IV. Explicit State, Preferences, Resilient Persistence | Redux is authoritative, and one versioned storage adapter validates and serializes only permitted local data. | PASS |
| V. Current, Supported Web Platform | Dependencies are minimal, officially supported, compatibility-verified at scaffold time, and locked. | PASS |
| VI. Evidence-Gated Static Delivery | Engine, reducer, component, browser, Pages-subpath, PWA, offline, update, and release checks are planned before publishing `dist`. | PASS |

### Post-design gate

The research, data model, UI/state contract, and quickstart preserve all six principles. No exception or complexity justification is required.

## Project Structure

### Documentation

```text
specs/001-minesweeper-spa/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── ui-contract.md
└── contracts/
    ├── client-state.md
    ├── game-engine.md
    └── pwa-delivery.md
```

### Source code

```text
src/
├── app/                 # Store, typed hooks, app shell, browser adapters
├── domain/              # Pure configuration, PRNG, board commands, selectors
├── features/
│   ├── game/            # Redux game/session reducer, timer lifecycle, records
│   ├── preferences/     # Locale, theme, input mapping, selected configuration
│   └── persistence/     # Versioned encode/decode, storage and PWA gateways
├── i18n/                # Typed English/Ukrainian catalog and locale helpers
├── ui/
│   ├── components/      # Parameterized controls, HUD, board and modal primitives
│   ├── screens/         # Home and Game composition only
│   └── styles/          # Global semantic tokens, themes, responsive layout
└── pwa/                 # Registration/update and install adapters

tests/
├── unit/                # Domain, reducers, storage codecs and helpers
├── component/           # Visible/accessible React contracts
└── e2e/                 # Playwright browser and built-artifact suites

public/                  # Manifest icons and other local static assets
.github/workflows/       # CI and GitHub Pages deployment
```

**Structure Decision**: This is one Vite frontend. `domain/` has no browser, Redux, or React imports; `features/` adapts pure transitions into authoritative Redux state and durable records; `ui/` renders derived view models and forwards interactions. Browser/PWA APIs are isolated behind adapters so unsupported capability and lifecycle failures cannot corrupt gameplay.

## Implementation Sequence

### 1. Establish reproducible Vite foundations and quality gates

- Scaffold the Vite React TypeScript application in this repository without retaining template demo code.
- At scaffold time, verify the official support and licence posture of every chosen package; capture exact versions in `package.json` and the one committed lockfile. Configure Node 22.12+ in local guidance and CI.
- Configure strict TypeScript (`strict`, safe index/optional-property checks where dependency declarations permit), flat ESLint, Prettier, Vitest/jsdom, React Testing Library, Playwright, and scripts for format check, lint, typecheck, unit/component tests, E2E, production build, and complete validation.
- Configure `vite.config.ts` with `base: '/minesweeper/'`. Ensure manually constructed public URLs use `import.meta.env.BASE_URL`; do not introduce a server router or a root-relative asset URL.
- Add CI pull-request quality gates using the lockfile and retain Playwright trace/video/screenshot artifacts on failure. Run production build/artifact validation before any Pages upload.

**Proof**: clean-install command, formatter, lint, non-emitting typecheck, initial test commands, and `npm run build`; an artifact test asserts base-prefixed HTML asset/manifest URLs and no external gameplay asset URL.

### 2. Build the deterministic game domain first

- Define validated `GameConfig` presets: Beginner 9x9/10, Intermediate 16x16/40, Expert 24x24/99, and Custom with integer rows/columns 5–30 and mines 1 through cells minus 1. Invalid draft Custom values never replace the last valid selection or enable Play.
- Model a row-major immutable `GameSession`, `Cell`, coordinates, game status, delayed-placement seed, elapsed duration, and detonated cell as specified in [data-model.md](data-model.md).
- Implement only pure domain commands: create blank board, safe delayed placement, reveal, flag toggle, flood fill, and terminal projection. Use a stable seeded PRNG and partial Fisher–Yates sampling over all positions except precisely the first genuinely opened cell. Do not call `Math.random`, a clock, Redux, local storage, or browser APIs from the domain.
- On a flagged reveal, clear the flag and stop; pre-first-reveal flags leave mines unplaced and time zero. Use iterative queue flood-fill. Guard invalid coordinate, flag capacity, revealed-cell, first-reveal race, and terminal no-op transitions.
- Derive distinct terminal visual states for detonated mine, ordinary mine, incorrect flag, and unrevealed safe cell. Win only after all safe cells are revealed and auto-flags remaining mines.

**Proof**: fixed-seed tests for all presets, Custom limits, exact/unique placement, exact single-cell safety, counts at borders/corners, flood frontier, flag rules, flag-clearing reveal, loss, win, instant 5x5/24-mine win, invalid commands, and terminal immutability. Benchmark the 30x30 pure reveal/flag transition against the 250-ms limit under the documented environment.

### 3. Make Redux state, timer lifecycle, records, and persistence authoritative

- Create typed Redux store/hooks with separate game, preferences/records, and app-shell state. App-shell state includes Home/Game route, one blocking sheet, notices, install readiness, and update readiness; interaction timer handles and DOM refs remain event-only React refs rather than a parallel state model.
- Adapt every game command through reducer actions carrying injected `atMs`. Reducers accrue `max(0, atMs - lastTickAtMs)` and never read a wall clock. A clock controller runs only for `playing && game route && document visible && no blocking sheet` and dispatches bounded ticks.
- Pause and persist a paused snapshot on Home, `visibilitychange`, blocking-sheet open, page hide, terminal transition, and game replacement. Resume only when every eligibility condition returns. Hydration never counts closed time; repeated or backwards lifecycle signals must not double-accrue. Final displayed and recorded seconds are `ceil(elapsedMs / 1000)`.
- Implement canonical configuration keys, strictly-faster win-only record updates, standard records that never evict, and a maximum 100 Custom records. Starting any Custom game updates its recency; adding a 101st configuration evicts the least recently started entry with a deterministic key tiebreak.
- Implement the one versioned record boundary: pure `decode`, validation/migration, and `encode`; a thin storage adapter catches unavailable, malformed, incompatible, future-version, and quota failures. Reject invalid resume state and never hydrate terminal games. Prefer safe defaults while preserving an independently valid preferences/records subset when the persisted resumable board is invalid.
- On quota/write failure keep live state and existing persisted data unchanged, show a localized nonblocking warning, and do not auto-delete records. Reset local data clears durable data/defaults but marks an open in-memory game non-resumable so unrelated later writes cannot save it.

**Proof**: reducer/adapter tests for injected clock lifecycle, partial-second rounding, timer pause visibility/sheet/Home/reload, record identity/recency/eviction, malformed and future records, stale terminal resumes, storage throws/quota, and reset-local-data with a playable live board.

### 4. Provide typed localization, appearance, and reusable visual primitives

- Add typed English and Ukrainian catalog objects and a typed translator; all text—including validation, aria labels, dynamic board state, notices, help, modal content, and installation feedback—must come through it. Resolve initial device locale for `en*`/`uk*`, otherwise English; explicit persisted locale wins.
- Persist `light`, `dark`, or `system` appearance preference separately from the resolved light/dark root `data-theme`. Listen to `matchMedia` only while System is chosen, clean up listeners, and safely retain the current resolved theme when observation is unavailable.
- Implement CSS-only centralized semantic roles for foundation, action, board, numbers/tints, interaction, and feedback states. Apply `color-scheme`, local assets/fonts only, safe-area padding, visible focus, and the required motion; no inline raw style/palette values in components.
- Build contract-backed primitives: ActionButton, IconAction, SelectableOption, SettingRow, StatDisplay, ModalSheet, and game-status Face. They own names, variants, disabled/focus semantics, and layout-safe wrapping.

**Proof**: catalog-key parity test, locale resolver tests, component tests for immediate open-modal language/theme updates, semantic token/root attributes, accessible names, selected/disabled states, and unsupported system-observation fallback.

### 5. Compose Home, Game, modal, and board interaction surfaces

- Build Home with single-select difficulty cards, Custom inputs/validity feedback, default/retained configuration, exact-config record summary, Play, conditionally distinct Resume/New actions, Help, Settings, and conditional Install. New while an active session exists opens replace confirmation; initial hydration always lands on Home.
- Build Game with Back, compact localized top bar, flags/status/timer HUD, mapping hint, reset behavior, BoardViewport, edge cues, and win/loss outcome sheet. Back immediately pauses/retains an active game; status reset confirms only while playing, otherwise creates the current/finished configuration immediately. Replay uses the completed configuration exactly.
- Build reusable modal sheets with focus trap, localised heading/action names, safe Escape/close policy, focus restoration, and timer eligibility wiring. Language/theme updates must rerender an open sheet immediately. Terminal sheets present a clear replay/menu path; completed games remove durable resume data after record processing.
- Render board cells as real labelled controls in a labelled grid using roving `tabindex`. New/resumed board focus begins top-left. Arrow keys move only within valid cells, prevent page scrolling, focus the target, and scroll the BoardViewport minimally into view; Enter/Space runs the selected primary command and F the secondary command.
- Centralize semantic primary/secondary input mapping. Prevent context menu only on board cells. For touch, begin a 600-ms long-press timer without preventing initial scrolling; cancel at movement >=10 CSS px, pointer up/cancel/lost capture, scroll, route/session replacement, or sheet opening; suppress the ensuing primary click after a completed long press. Keyboard never requires long press.
- Use one responsive markup at 320, 768, and 1440 px. The BoardViewport alone scrolls both axes, never forces page horizontal overflow, renders fixed cells >=32px, centers only fitting boards, and shows directional edge cues only where overflow remains.

**Proof**: component and Playwright tests for Home/resume/replacement, help/settings/reset/outcome state, standard/Custom validation, pointer mappings, context-menu scope, long-press/cancel, keyboard commands/focus/scroll, accessible board state labels, terminal distinctions, and 320/768/1440 board reachability/no page horizontal overflow.

### 6. Deliver PWA, static update safety, and GitHub Pages

- Configure `vite-plugin-pwa`/Workbox generated service worker after compatibility verification. Generate a base-aligned manifest with local 192/512 icons (including appropriate any/maskable entries), `/minesweeper/` `id`, `start_url`, and `scope`, standalone display, and coherent colors. Prohibit remote fonts, icons, APIs, translations, or gameplay dependencies.
- Use a versioned precache for HTML, Vite hashed assets, manifest, icons, and every local first-paint/gameplay asset. Do not silently omit oversized required assets; fail artifact validation until a deliberately reviewed cache policy exists. Do not add runtime data/API cache.
- Isolate plugin calls behind a PWA gateway. Register/check when online and retry on `online`; use prompt rather than auto-update. A waiting worker raises one localized nonblocking Update ready notice. Only the chosen update control flushes/validates an active session, then activates/reloads. If the flush fails, retain the old page and show storage recovery; never silently reload, call skip-waiting, or discard a game.
- Capture `beforeinstallprompt` only when actually delivered, expose Install then, call it only from a user gesture, and hide after app installation or choice. Unsupported, dismissed, service-worker-failed, or private-mode browsers remain fully playable online without a false install/offline-ready promise.
- Add GitHub Pages workflow: lockfile install, quality gates, build and static artifact validation, Pages configuration, and upload only `dist`; a dependent deploy job has `contents: read`, `pages: write`, `id-token: write`, Pages environment, and protected deployment concurrency. PRs validate but do not deploy.

**Proof**: manifest/precache/base-scope artifact assertions; fresh persistent Chromium profile online visit, service-worker activation/controller reload, then offline cold-page open/start-or-resume/finish with no failed required request; assisted supported/unsupported install checks; two-revision same-origin update lifecycle proving no auto reload and persistence-before-activation; direct Pages-subpath asset check and static deployment workflow inspection.

### 7. Release evidence and handoff

- Execute the complete lockfile-based quality suite and artifact-only Playwright suite. Run the cross-engine core suite, and document targeted manual verification if installation capability differs by engine.
- Record the tested Node/browser versions, production artifact path/base, 30x30 timing environment/result, Pages deployment evidence, offline lifecycle evidence, install/update observations, and any supported-browser capability limitations.
- Review each FR-001–FR-034 and SC-001–SC-009 against named tests/evidence before release. A skipped target, dev-server-only offline result, previous cached dev route, or incomplete production artifact check blocks release.

## Requirement Coverage Map

| Specification scope | Delivery slice and evidence |
| --- | --- |
| FR-001; FR-028 | Slice 1 and Slice 6 establish a client-only Vite `dist`, local-only runtime, and Pages subpath artifact audit. |
| FR-002, FR-002a | Slice 2 validates presets/Custom bounds; Slices 3 and 5 retain the last valid selection and provide localized invalid-input feedback. |
| FR-003–FR-010 | Slice 2 fixed-seed domain suites prove blank setup, delayed exact placement, counts, flood fill, terminal rules, flag capacity, and flagged-reveal clearing. |
| FR-011, FR-012–FR-012c | Slice 3 owns timed lifecycle/persistence; Slice 5 proves reset, replay, Back/Home, Resume/New, and Home-first hydration. |
| FR-013–FR-014, FR-020–FR-022 | Slice 5 implements and browser-tests mapped pointer/touch/keyboard control, board-only context-menu suppression, long-press cancellation, focus, scroll containment, target floor, and input hint. |
| FR-015–FR-019, FR-031–FR-032 | Slice 4 provides typed bilingual catalog/theme/tokens/primitives; Slice 5 composes the visual/help/feedback contracts and tests immediate open-sheet updates. |
| FR-023–FR-027 | Slice 3 validates the one approved local record, active-only resume, recovery/quota behavior, reset retention boundary, and standard/Custom record rules. |
| FR-029–FR-030 | Slice 6 implements progressive install, local precache, controlled offline lifecycle, and persisted user-approved update behavior. |
| FR-033–FR-034; SC-001–SC-009 | Every slice supplies its proportional automated proof; Slice 7 runs the lockfile, cross-engine, production artifact, Pages, offline, install/update, and timing evidence gates. |

## Complexity Tracking

No constitution violations or exception-driven complexity are planned.
