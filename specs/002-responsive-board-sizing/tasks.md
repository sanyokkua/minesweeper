# Tasks: Responsive Board Sizing

**Input**: Design documents from `/specs/002-responsive-board-sizing/`

**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/board-sizing.md`, and `quickstart.md`

**Tests**: Required by the feature specification and the repository's evidence-gated delivery rules. Write the focused responsive assertions before the CSS change and confirm they fail for the old sizing behavior.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the existing board viewport and responsive test boundaries before changing presentation code.

- [X] T001 [P] Verify the existing board viewport selectors and local-scroll boundary in `src/ui/components/BoardViewport.tsx` and `tests/e2e/responsive-interaction.spec.ts`

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Confirm that the feature remains presentation-only and does not require state or persistence changes.

- [X] T002 [P] Verify the no-schema-change boundary against `src/domain/gameTypes.ts`, `src/features/persistence/recordCodec.ts`, and `specs/002-responsive-board-sizing/data-model.md`

**Checkpoint**: Existing board state, interaction, and persistence boundaries are unchanged; user-story work can proceed.

## Phase 3: User Story 1 - Use available screen width for gameplay (Priority: P1) 🎯 MVP

**Goal**: Make fitting phone boards use more of the available board surface while preserving local scrolling and page containment for oversized boards.

**Independent Test**: Run the focused responsive Playwright suite at 320px, 344px, 375px, 412px, 430px, 768px, and 1440px widths. Confirm cell-size growth on wide phones, the established desktop cap, local edge reachability for Expert, and no document-level horizontal overflow.

### Tests for User Story 1

- [X] T003 [US1] Add responsive cell-size, board-occupancy, local-scroll, edge-cue, keyboard, page-containment, and active-game viewport-resize preservation assertions in `tests/e2e/responsive-interaction.spec.ts`; run the focused suite before implementation and record that the old sizing rule fails the new wide-phone expectations

### Implementation for User Story 1

- [X] T004 [US1] Change the board cell sizing expression to the planned fluid 32px-to-40px range in `src/ui/styles/board.css` while preserving the existing grid gaps, board-local overflow, centering, and touch target floor

### Story Validation

- [X] T005 [US1] Run `rtk npm run e2e -- tests/e2e/responsive-interaction.spec.ts` and verify the responsive board contract in `specs/002-responsive-board-sizing/contracts/board-sizing.md`

**Checkpoint**: User Story 1 is independently functional and proven at the supplied phone widths plus tablet and desktop widths.

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Run proportionate repository checks and keep the feature evidence current.

- [X] T006 [P] Run `rtk npm run format:check` and `rtk npm run lint` for the completed source and test changes in `src/ui/styles/board.css` and `tests/e2e/responsive-interaction.spec.ts`
- [X] T007 [P] Run `rtk npm run typecheck`, `rtk npm run test:unit`, `rtk npm run build`, `rtk npm run validate:artifact`, and `rtk npm run validate:pages` using `specs/002-responsive-board-sizing/quickstart.md`
- [X] T008 Update `specs/002-responsive-board-sizing/quickstart.md` with any environment-specific validation limitation discovered while running the focused and repository checks; leave it unchanged if all documented commands run as written

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; confirms the existing boundaries.
- **Foundational (Phase 2)**: Depends on Setup; confirms no state or persistence work is needed.
- **User Story 1 (Phase 3)**: Depends on the boundary checks; T003 must be written and observed failing before T004 changes the CSS.
- **Polish (Phase 4)**: Depends on the story implementation and focused validation.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after T001 and T002; no dependency on another user story.

### Within User Story 1

1. T003 adds and runs the failing responsive assertions.
2. T004 changes only the board sizing rule required by the failing assertions.
3. T005 runs the focused suite and validates the feature contract.

## Parallel Opportunities

- T001 and T002 are independent read-only boundary checks and can run in parallel.
- T006 and T007 are independent verification command groups after T005; they can run in parallel if the environment supports concurrent test/build processes.
- No implementation tasks are parallelized because T003 and T004 share the responsive board behavior and must follow the test-first order.

## Parallel Example: Foundation Review

```text
Task T001: Verify `src/ui/components/BoardViewport.tsx` and `tests/e2e/responsive-interaction.spec.ts` boundaries
Task T002: Verify `src/domain/gameTypes.ts`, `src/features/persistence/recordCodec.ts`, and `data-model.md` boundaries
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001 and T002.
2. Add the responsive regression assertions in T003 and confirm the old rule fails.
3. Apply the single CSS sizing change in T004.
4. Run T005 and verify the user story independently.

### Incremental Delivery

1. Preserve the existing board-local scroll and interaction contract.
2. Prove the new phone sizing behavior with the focused suite.
3. Run the repository quality, build, artifact, and Pages checks.
4. Record only genuine environment limitations in the feature quickstart.

## Notes

- `[P]` tasks touch independent files or are read-only/verification work that can run independently after dependencies are met.
- All implementation tasks include exact repository paths and map to the single P1 user story.
- No generated `dist`, coverage, Playwright report, or test-result artifacts should be committed.
