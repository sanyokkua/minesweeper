# Tasks: Minesweeper Static SPA

**Input**: Design documents from `/specs/001-minesweeper-spa/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `ui-contract.md`, `quickstart.md`, and `contracts/`

**Tests**: Tests are required by FR-033–FR-034 and the constitution. Add a test first for each new domain, state, component, browser, and production-artifact contract; run the relevant test before marking its implementation complete.

**Organization**: Tasks are grouped by user story so each increment can be demonstrated independently after the shared foundation is complete.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the reproducible, static SPA toolchain and the project-wide quality gates.

- [X] T001 Initialize the React 19 + TypeScript Vite project, record each selected package's official support, license, security-advisory, and browser-compatibility review in `specs/001-minesweeper-spa/dependency-review.md`, and lock the approved versions in `package.json` and `package-lock.json`
- [X] T002 Configure strict TypeScript, Vite’s `/minesweeper/` base path, and local public-asset URL handling in `tsconfig.json` and `vite.config.ts`
- [X] T003 [P] Configure Prettier and ESLint flat rules for TypeScript and React in `.prettierrc.json` and `eslint.config.js`
- [X] T004 [P] Configure Vitest, jsdom, React Testing Library setup, and coverage-aware test scripts in `vitest.config.ts` and `tests/setup.ts`
- [X] T005 [P] Configure Playwright Chromium, Firefox, and WebKit projects plus failure artifacts in `playwright.config.ts`
- [X] T006 [P] Configure package scripts for format checking, linting, typechecking, unit/component tests, E2E, build, artifact validation, and full validation in `package.json`
- [X] T007 [P] Add Node 22.12+ local setup, lockfile install, and documented validation commands in `README.md`
- [X] T008 [P] Add pull-request quality checks with lockfile install and retained Playwright failure artifacts in `.github/workflows/ci.yml`
- [X] T009 [P] Add a Pages deployment workflow that validates before uploading only `dist` with least-privilege permissions and concurrency protection in `.github/workflows/pages.yml`
- [X] T010 Remove Vite template/demo files and establish the app entrypoint and test smoke baseline in `src/main.tsx` and `src/App.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the shared pure domain, authoritative Redux seams, safe browser boundaries, and typed presentation primitives required by every story.

**⚠️ CRITICAL**: Complete this phase before implementing user-story surfaces.

- [X] T011 Define validated preset/Custom configuration types, canonical configuration keys, coordinate helpers, and seeded PRNG utilities in `src/domain/gameTypes.ts`, `src/domain/config.ts`, and `src/domain/prng.ts`
- [X] T012 [P] Create fixed-seed configuration, coordinate, and PRNG contract tests in `tests/unit/domain/config.test.ts` and `tests/unit/domain/prng.test.ts`
- [X] T013 Implement the pure immutable board engine (`createGame`, delayed placement, `applyCommand`, and presentation selectors) in `src/domain/gameEngine.ts`
- [X] T014 Create fixed-seed pure-engine coverage for placement, counts, flood fill, flags, flag-clearing reveal, terminal views, no-ops, and 30×30 timing in `tests/unit/domain/gameEngine.test.ts`
- [X] T015 Define typed Redux store, root state, app-shell state, typed hooks, and injected-time action contracts in `src/app/store.ts`, `src/app/hooks.ts`, and `src/features/game/gameSlice.ts`
- [X] T016 [P] Define the one-versioned durable record types, pure codec validation/migration seams, and caught storage gateway interface in `src/features/persistence/recordCodec.ts` and `src/features/persistence/storageGateway.ts`
- [X] T017 [P] Define the typed English/Ukrainian catalog with every non-Help product message, locale resolver, and translator boundary in `src/i18n/catalog.ts` and `src/i18n/translate.ts`
- [X] T018 [P] Define central semantic tokens, Light/Dark/System root themes, global focus rules, and responsive foundations in `src/ui/styles/tokens.css` and `src/ui/styles/global.css`
- [X] T019 Build reusable accessible action, selection, statistic, icon-action, and modal primitives in `src/ui/components/ActionButton.tsx`, `src/ui/components/SelectableOption.tsx`, `src/ui/components/StatDisplay.tsx`, `src/ui/components/IconAction.tsx`, and `src/ui/components/ModalSheet.tsx`
- [X] T020 Add contract tests for root store isolation, locale fallback/catalog parity, theme tokens, and reusable primitive accessibility in `tests/unit/app/store.test.ts`, `tests/unit/i18n/translate.test.ts`, and `tests/component/primitives.test.tsx`

**Checkpoint**: The pure game, state boundaries, localization, theme foundation, and reusable controls are ready; story work can proceed in priority order.

---

## Phase 3: User Story 1 - Play a faithful Minesweeper game (Priority: P1) 🎯 MVP

**Goal**: A player can start a configured game, reveal/flag through the default interaction scheme, and receive correct win/loss outcomes.

**Independent Test**: Start every preset from Home, use cell primary/secondary actions, then prove first-reveal safety, counter updates, flood reveal, loss, and win on fixed-seed fixtures without persistence, installation, or settings.

### Tests for User Story 1

- [X] T021 [P] [US1] Add reducer tests for injected command timestamps, flag allowance, terminal lockout, and timer start/stop in `tests/unit/features/gameSlice.test.ts`
- [X] T022 [P] [US1] Add component tests for board cell accessible states, flag counter, and distinct terminal board presentations in `tests/component/Board.test.tsx`
- [X] T023 [P] [US1] Add a seeded browser journey for preset start, safe reveal, flood fill, flagging, loss, and win in `tests/e2e/play-game.spec.ts`

### Implementation for User Story 1

- [X] T024 [US1] Adapt pure domain commands into immutable Redux game-session transitions with injected timestamps and terminal projection in `src/features/game/gameSlice.ts`
- [X] T025 [US1] Implement the eligible injected-clock controller and whole-second display selector in `src/features/game/gameClock.ts` and `src/features/game/gameSelectors.ts`
- [X] T026 [P] [US1] Implement localized board-cell labels and the semantic game-status face component in `src/ui/components/BoardCell.tsx` and `src/ui/components/GameFace.tsx`
- [X] T027 [US1] Implement the labelled grid board renderer from selectors without duplicating game rules in `src/ui/components/Board.tsx`
- [X] T028 [US1] Implement the game HUD with flags remaining, status reset face, whole-second timer, and current configuration label in `src/ui/components/GameHud.tsx`
- [X] T029 [US1] Implement the Game screen’s primary reveal-first pointer commands, loss/win sheet, replay/menu routes, and terminal action lockout in `src/ui/screens/GameScreen.tsx`
- [X] T030 [US1] Implement a minimal Home start surface with preset selection and Play action for the MVP path in `src/ui/screens/HomeScreen.tsx`
- [X] T031 [US1] Compose the route-aware app shell and top-level game command wiring in `src/App.tsx`
- [X] T032 [US1] Add component coverage for HUD reset behavior and terminal replay/menu paths in `tests/component/GameScreen.test.tsx`
- [X] T033 [US1] Add browser coverage that each preset reaches a first safe reveal within three intentional interactions in `tests/e2e/play-game.spec.ts`

**Checkpoint**: User Story 1 is independently playable with deterministic rule, UI, and browser proof.

---

## Phase 4: User Story 2 - Choose and retain a comfortable play experience (Priority: P2)

**Goal**: A player can retain difficulty, active game, input preference, locale, appearance, and records entirely in safe local state.

**Independent Test**: Change every preference, retain an active board (including an untouched flagged board), reload to Home, resume it with paused time, and verify records/recovery behavior without requiring PWA installation or offline simulation.

### Tests for User Story 2

- [X] T034 [P] [US2] Add codec and storage-gateway tests for malformed/future data, valid active-only resumes, quota failures, and reset retention boundaries in `tests/unit/features/recordCodec.test.ts` and `tests/unit/features/storageGateway.test.ts`
- [X] T035 [P] [US2] Add reducer tests for Home/sheet/visibility timer pausing, resume, records, recency/100-record eviction, and local-data reset in `tests/unit/features/gameLifecycle.test.ts`
- [X] T036 [P] [US2] Add component tests for locale/theme changes in open sheets, retained selection, valid Custom feedback, and distinct Resume/New actions in `tests/component/preferences-and-home.test.tsx`
- [X] T037 [P] [US2] Add browser coverage for persistence/reload, resume/replacement confirmation, mapped input, records, storage recovery, and reset-local-data behavior in `tests/e2e/preferences-persistence.spec.ts`

### Implementation for User Story 2

- [X] T038 [US2] Implement preferences, record, hydration, and persistence-status Redux slices plus selectors in `src/features/preferences/preferencesSlice.ts` and `src/features/persistence/persistenceSlice.ts`
- [X] T039 [US2] Implement strict record decoding, approved-state encoding, active-session validation, and explicit version migrations in `src/features/persistence/recordCodec.ts`
- [X] T040 [US2] Implement exception-safe localStorage reads, writes, and clears that preserve live state on failures in `src/features/persistence/storageGateway.ts`
- [X] T041 [US2] Implement hydration, paused active-game persistence, quota recovery notices, and reset-local-data orchestration in `src/features/persistence/persistenceController.ts`
- [X] T042 [US2] Extend the game reducer/controller for Home, visibility, pagehide, blocking-sheet, replacement, and terminal lifecycle transitions with no double-accrual in `src/features/game/gameSlice.ts` and `src/features/game/gameClock.ts`
- [X] T043 [US2] Implement canonical standard/Custom best-record updates, whole-second win comparison, deterministic Custom recency eviction, and completion resume discard in `src/features/game/records.ts`
- [X] T044 [P] [US2] Implement persisted input-mode preference and semantic primary/secondary command mapping in `src/features/preferences/inputMode.ts`
- [X] T045 [P] [US2] Implement persisted locale choice, device-language initialization, and immediate catalog rerender support in `src/i18n/localeController.ts`
- [X] T046 [P] [US2] Implement persisted Light/Dark/System resolution, safe `matchMedia` observation, and root `data-theme` updates in `src/app/themeController.ts`
- [X] T047 [US2] Expand Home with retained difficulty cards, bounded Custom fields, exact-config records, conditional Resume/New, and replacement confirmation in `src/ui/screens/HomeScreen.tsx`
- [X] T048 [US2] Implement the shared replacement/local-data `ConfirmSheet` and compose it with Settings and outcome sheets, including immediate locale/theme updates, in `src/ui/components/ConfirmSheet.tsx` and `src/ui/components/AppSheets.tsx`
- [X] T049 [US2] Wire settings actions, persistence notices, hydration-to-Home, and retained/resumable route behavior through the app shell in `src/App.tsx`
- [X] T050 [US2] Update Game screen input hints, Back-to-Home pause/retention, confirmation-only active reset, and exact-config replay in `src/ui/screens/GameScreen.tsx`
- [X] T051 [US2] Extend Board pointer handling to honor reveal-first/flag-first mapping and suppress context menus only for cells in `src/ui/components/Board.tsx`
- [X] T052 [US2] Add component coverage for settings confirmation focus restoration and immediate modal locale/theme changes in `tests/component/AppSheets.test.tsx`
- [X] T053 [US2] Add browser proof that an untouched flagged board remains resumable and completed boards do not resume in `tests/e2e/preferences-persistence.spec.ts`

**Checkpoint**: User Stories 1 and 2 work together: the player can customize and recover a private game safely across reloads.

---

## Phase 5: User Story 3 - Play on any supported device, including offline (Priority: P3)

**Goal**: The responsive static SPA is usable with pointer, touch, keyboard, installation support, and a verified production-artifact offline lifecycle.

**Independent Test**: Complete core play at desktop and touch viewport sizes, navigate a large board with keyboard/touch without unintended actions, then verify the built `/minesweeper/` artifact works offline after a controlled online visit.

### Tests for User Story 3

- [X] T054 [P] [US3] Add component tests for 32px cells, board-contained scrolling cues, roving focus, key commands, and long-press cancellation in `tests/component/boardInteraction.test.tsx`
- [X] T055 [P] [US3] Add cross-engine browser journeys for 320/768/1440 layouts, board reachability, pointer context-menu scope, keyboard, and touch behavior in `tests/e2e/responsive-interaction.spec.ts`
- [X] T056 [P] [US3] Add built-artifact assertions for base-prefixed assets, manifest, precache, service-worker scope, and no remote runtime dependencies in `tests/e2e/artifact-contract.spec.ts`
- [X] T057 [P] [US3] Add persistent-context Chromium production tests for online control, offline cold-page gameplay, conditional install, and two-revision update safety in `tests/e2e/pwa-lifecycle.spec.ts`

### Implementation for User Story 3

- [X] T058 [US3] Implement the fixed-minimum-cell BoardViewport, contained two-axis scrolling, fitting-board centering, and directional edge cues in `src/ui/components/BoardViewport.tsx` and `src/ui/styles/board.css`
- [X] T059 [US3] Implement roving board focus, top-left entry focus, Arrow navigation, Enter/Space/F commands, and minimal viewport scrolling in `src/ui/components/BoardKeyboardController.ts`
- [X] T060 [US3] Implement pointer/touch adapters with 600ms long press, 10px cancellation, scroll/capture/session cleanup, and completed-long-press click suppression in `src/ui/components/boardInteraction.ts`
- [X] T061 [US3] Integrate BoardViewport, keyboard controller, and pointer/touch adapter into the accessible Board in `src/ui/components/Board.tsx`
- [X] T062 [US3] Apply responsive layouts, safe-area spacing, non-overflowing page rules, visual motion, and tokenized state presentation in `src/ui/styles/layout.css` and `src/ui/styles/components.css`
- [X] T063 [US3] Configure prompt-update PWA generation, base-aligned manifest, local icons, and complete local precache inputs in `vite.config.ts`, `public/manifest.webmanifest`, `public/icon-192.png`, and `public/icon-512.png`
- [X] T064 [US3] Implement isolated service-worker registration/update gateway with online checks, one Update ready notice, flush-before-activate, and failure-safe refusal in `src/pwa/pwaGateway.ts` and `src/pwa/registerPwa.ts`
- [X] T065 [US3] Implement a progressive `beforeinstallprompt` gateway and conditional localized Install control in `src/pwa/installGateway.ts` and `src/ui/components/InstallAction.tsx`
- [X] T066 [US3] Integrate PWA install/update lifecycle state and controls without blocking play in `src/App.tsx`
- [X] T067 [US3] Add production-artifact server helpers that mount only `dist` at `/minesweeper/` in `tests/e2e/support/serveDist.ts`

**Checkpoint**: User Stories 1–3 are responsive, accessible through their required inputs, installable where supported, and proven offline from the built Pages-path artifact.

---

## Phase 6: User Story 4 - Understand the game and recover safely (Priority: P4)

**Goal**: A player can learn current controls, reset deliberately, return home safely, and recover from local-data actions without surprise.

**Independent Test**: In either language, open Help, verify the current mapping, use both reset paths, return to Home while playing, and clear local data while preserving only the current live board.

### Tests for User Story 4

- [X] T068 [P] [US4] Add component tests for localized Help content, input-mode explanation, reset confirmation policy, and Home return in `tests/component/help-and-recovery.test.tsx`
- [X] T069 [P] [US4] Add browser journeys for Help, status reset before/during/after play, Back pause/Resume, and live-board local-data recovery in `tests/e2e/help-and-recovery.spec.ts`

### Implementation for User Story 4

- [X] T070 [US4] Add concise typed bilingual How-to-Play catalog entries for reveal, flags, numbers, win/loss, and the current input mapping in `src/i18n/catalog.ts`
- [X] T071 [US4] Implement the Help sheet with localized current mapping explanation and accessible close/focus behavior in `src/ui/components/HelpSheet.tsx`
- [X] T072 [US4] Extend the shared confirmation flow with the active-game reset policy and reset-specific focus handoff in `src/ui/components/ConfirmSheet.tsx`
- [X] T073 [US4] Integrate Help and confirmation sheets into the global sheet manager and timer pause lifecycle in `src/ui/components/AppSheets.tsx`
- [X] T074 [US4] Complete Game reset/status and Back-to-Home recovery flows against the shared confirmation contract in `src/ui/screens/GameScreen.tsx`
- [X] T075 [US4] Verify all Home and Settings recovery controls expose localized visible feedback and accessible names in `src/ui/screens/HomeScreen.tsx`

**Checkpoint**: All four user stories are independently evidenced and the player has clear in-product guidance and recoverable controls.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Complete release evidence, static delivery safeguards, and documentation without weakening any acceptance contract.

- [X] T076 [P] Audit every English catalog key against its Ukrainian counterpart and all user-facing UI use sites in `tests/unit/i18n/catalogParity.test.ts`
- [X] T077 [P] Add semantic visual-state coverage for number tints, mine/flag/error states, focus, themes, and sheet layouts in `tests/component/visualContract.test.tsx`
- [X] T078 [P] Add a documented 30×30 reveal/flag interaction performance harness with a ≤250ms assertion in `tests/e2e/performance.spec.ts`
- [X] T079 [P] Add static artifact validation for Pages workflow permissions, lockfile gates, `dist`-only upload, and no PR deployment in `tests/e2e/pagesWorkflow.test.ts`
- [X] T080 Add a release evidence checklist mapping FR-001–FR-034 and SC-001–SC-009 to named tests and manual observations in `specs/001-minesweeper-spa/release-evidence.md`
- [X] T081 Record supported browser/Node versions, production artifact base/path, timing environment/result, offline lifecycle, install/update observations, and limitations in `specs/001-minesweeper-spa/release-evidence.md`
- [X] T082 Run and document lockfile install, format check, lint, typecheck, unit/component suite, cross-engine E2E, production-artifact suite, and build results in `specs/001-minesweeper-spa/quickstart.md`
- [X] T083 Perform manual validation at 320/768/1440px and supported-browser capability review, recording any installation differences in `specs/001-minesweeper-spa/release-evidence.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; establishes the lockfile-based quality baseline.
- **Foundational (Phase 2)**: Depends on Setup and blocks all story implementation because it establishes the sole game authority, Redux/state seams, and shared UI contracts.
- **US1 (Phase 3)**: Depends on Foundational; delivers the MVP gameplay loop.
- **US2 (Phase 4)**: Depends on US1’s command/routing surfaces and adds safe local retention and player preferences.
- **US3 (Phase 5)**: Depends on the interactive board and persistence flush surfaces from US1–US2; validates static/offline delivery only from `dist`.
- **US4 (Phase 6)**: Depends on shared sheets, lifecycle, and preferences from US2; its Help and recovery behavior is independently testable once those shared seams exist.
- **Polish (Phase 7)**: Depends on the desired story phases and does not replace their individual proof.

### User Story Completion Order

`Setup → Foundational → US1 (MVP) → US2 → US3 → US4 → Polish`

US3 and US4 have some file-independent tests that can begin after their prerequisites, but their completed behavior requires the preceding shared routes, persistence, and board interaction surfaces.

### Parallel Opportunities

- Setup: T003–T009 can proceed in parallel after T001 establishes the package baseline.
- Foundational: T012 and T016–T020 touch separate test/boundary files after T011; T013/T014 remain the domain dependency chain.
- US1: T021–T023 and T026 can proceed in parallel before integration begins at T024–T031.
- US2: T034–T037 and T044–T046 are parallel once foundational types exist; T038–T043 form the persistence/lifecycle chain.
- US3: T054–T057 are independent test files; T058–T060 can be developed in parallel before Board integration T061.
- US4: T068–T069 are independent test files; Help and confirmation components T071–T072 are separate after catalog text T070.
- Polish: T076–T079 can proceed in parallel; T080–T083 collect the final evidence sequentially.

## Parallel Example: User Story 3

```text
Task: "Add component tests for board interaction in tests/component/boardInteraction.test.tsx"
Task: "Add responsive cross-engine journeys in tests/e2e/responsive-interaction.spec.ts"
Task: "Add artifact assertions in tests/e2e/artifact-contract.spec.ts"
Task: "Add PWA lifecycle tests in tests/e2e/pwa-lifecycle.spec.ts"
```

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Setup and Foundational phases.
2. Complete US1 tasks T021–T033.
3. Run the fixed-seed domain/reducer/component and `play-game` browser tests.
4. Demonstrate a safe first reveal, flood fill, flagging, loss, win, and exact-config replay before accepting follow-on scope.

### Incremental Delivery

1. Add US2 to make sessions, preferences, records, localization, and appearance durable and recoverable.
2. Add US3 to make the built static Pages artifact responsive, offline-capable, and installable where supported.
3. Add US4 to complete embedded help and deliberate recovery controls.
4. Use Phase 7 evidence to make release claims only after tests target the production artifact and all documented checks pass.

## Format Validation

Every implementation task above follows the required checklist format: checkbox, sequential task ID, `[P]` only where file-independent work can proceed concurrently, a `[US#]` label for story-phase tasks, and explicit target file paths.

## Phase 8: Convergence

In order to stick to the original design - the mockup in "docs/minesweeper-mockup-v2.html" should be considered as source of truth for styles, colors, design patterns.

- [ ] T084 Bind each revealed number cell to its actual neighbour count and semantic foreground/tint pair, remove positional `:nth-child` coloring, and add component proof that the same number always renders the same color in both themes in `src/ui/components/BoardCell.tsx`, `src/ui/styles/board.css`, and `tests/component/visualContract.test.tsx` per FR-018 (contradicts)
- [ ] T085 Rebuild the centralized visual token foundation from the approved mockup palette, including complete Light/Dark number and board-state roles, semantic shadows/focus values, and removal of raw palette literals from `src/ui/styles/tokens.css`, `src/ui/styles/global.css`, `src/ui/styles/components.css`, and `src/ui/styles/board.css` per FR-017 and FR-018 (partial)
- [ ] T086 Recompose the shared app chrome with a compact top bar, coherent brand/wordmark treatment, Home settings and appearance affordances, and the Game Back/difficulty/settings/appearance arrangement without duplicate Menu controls in `src/App.tsx`, `src/ui/screens/GameScreen.tsx`, `src/ui/components/IconAction.tsx`, and the related styles per FR-019 (partial)
- [ ] T087 Rebuild Home’s visual and interaction hierarchy to match the UI contract/mockup: centered hero and status badge, retro preview board, two-column difficulty cards with radio selection, accurate Custom “set your own” presentation, primary action/record layout, conditional install panel, and footer links in `src/ui/screens/HomeScreen.tsx`, `src/i18n/catalog.ts`, and `src/ui/styles/layout.css`/`src/ui/styles/components.css` per FR-019 (partial)
- [ ] T088 Rebuild the Game HUD and board presentation around compact LCD-like flag/time displays, a semantic status face, a concise mapping hint, and a framed retro board surface while preserving the existing game commands in `src/ui/components/GameHud.tsx`, `src/ui/components/StatDisplay.tsx`, `src/ui/components/GameFace.tsx`, `src/ui/components/BoardViewport.tsx`, and the related styles per FR-019 (partial)
- [ ] T089 Add real directional board edge cues driven by viewport overflow and scroll position, with component and responsive proof for fitting and oversized boards at 320px, 768px, and 1440px in `src/ui/components/BoardViewport.tsx`, `src/ui/components/Board.tsx`, `src/ui/styles/board.css`, `tests/component/visualContract.test.tsx`, and `tests/e2e/responsive-interaction.spec.ts` per FR-020 (missing)
- [ ] T090 Complete board keyboard and touch lifecycle behavior by focusing the top-left cell when a board opens, scrolling only the board viewport during roving navigation, and cancelling long-press sessions on scroll, pointer cancellation/lost capture, route replacement, or sheet opening in `src/ui/components/Board.tsx`, `src/ui/components/BoardKeyboardController.ts`, `src/ui/components/boardInteraction.ts`, and their tests per FR-021d, FR-021e, and FR-022 (partial)
- [ ] T091 Implement the complete modal-sheet contract with focus trapping, focus restoration, localized headings/actions, and consistent settings/help/confirmation/outcome surface geometry in `src/ui/components/ModalSheet.tsx`, `src/ui/components/AppSheets.tsx`, `src/ui/styles/components.css`, and `tests/component/primitives.test.tsx` per the UI contract Overlays (partial)
- [ ] T092 Add localized, state-derived primary/secondary mapping guidance to Help, covering pointer, touch, and keyboard behavior for both input modes in `src/ui/components/HelpSheet.tsx`, `src/i18n/catalog.ts`, and `tests/component/help-and-recovery.test.tsx` per FR-014 (partial)
- [ ] T093 Replace the ad-hoc Game interval with the declared eligibility-based clock controller so the visible timer pauses on Home, document invisibility, and every blocking sheet and resumes only when all eligibility conditions return, with lifecycle proof in `src/App.tsx`, `src/ui/screens/GameScreen.tsx`, `src/features/game/gameClock.ts`, and `tests/unit/features/gameLifecycle.test.ts` per FR-011 (partial)
- [ ] T094 Hydrate the Custom draft from the persisted selected configuration and use one validated Custom value for cards, fields, record lookup, and game start, with reload/resume coverage in `src/ui/screens/HomeScreen.tsx`, `src/features/preferences/preferencesSlice.ts`, and `tests/component/preferences-and-home.test.tsx` per FR-002a (partial)
