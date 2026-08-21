# Feature Specification: Responsive Board Sizing

**Feature Branch**: `002-responsive-board-sizing`

**Created**: 2026-08-21

**Status**: Ready for planning

**Input**: User description: "Increase the size of Minesweeper cells when additional phone screen width is available, avoid large margins around the board, and preserve scrolling when the board does not fit."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Use available screen width for gameplay (Priority: P1)

When a player opens a Minesweeper game on a phone, tablet, or desktop, the board should use the available board surface effectively. Cells should become slightly larger when the current board fits with excessive side space, while boards that cannot fit should remain comfortably sized and reachable through the board's own scrolling area.

**Why this priority**: The board is the primary gameplay surface. Better use of available width makes phone play easier to see and interact with without sacrificing access to large boards on small screens.

**Independent Test**: Open representative standard and large boards at narrow phone, wide phone, tablet, and desktop viewport sizes. Compare the board's occupied width, cell usability, page containment, and reachability of every board edge without changing game state.

**Acceptance Scenarios**:

1. **Given** a standard board on a wide phone viewport where the board can fit, **When** the game screen opens, **Then** the cells use the available board surface with balanced, modest side margins instead of leaving a large unused area.
2. **Given** a large board on a narrow phone viewport where the board cannot fit, **When** the game screen opens, **Then** the board remains usable at its minimum comfortable cell size and the player can scroll horizontally and vertically inside the board area to reach every edge.
3. **Given** any supported board configuration, **When** the viewport width changes without a page reload, **Then** the board sizing adapts to the new available space while preserving the current cells, focus, and game state.
4. **Given** a board that requires scrolling, **When** the player scrolls or moves keyboard focus toward an off-screen edge, **Then** only the board area provides the overflow and existing touch, mouse, keyboard, and edge-cue behavior remains available.

### Edge Cases

- A very narrow phone viewport must not create horizontal overflow on the page itself when the board is wider than its surface.
- A foldable or compact viewport whose width is between the phone and tablet examples must use the same fit-or-scroll rule without a breakpoint-specific failure.
- Custom boards with few columns should not be forced to fill the entire surface, while custom boards with many columns must remain reachable through the board scroll area.
- Resizing or rotating the viewport while a game is active must not reset cells, flags, timer state, focus state, or the current scroll contract.
- Existing pointer, touch long-press, keyboard, and focus-visible interactions must not change as a side effect of the sizing adjustment.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The board MUST use additional available horizontal space to make cells modestly larger when the complete board fits inside its board surface.
- **FR-002**: The board MUST retain a minimum comfortable cell size when the complete board does not fit, and MUST allow the player to reach the complete board through scrolling inside the board area.
- **FR-003**: The board MUST keep page-level horizontal overflow contained so a board that is wider than its surface does not widen the surrounding page.
- **FR-004**: The fit-or-scroll behavior MUST apply consistently to standard and Custom board configurations across narrow phone, wide phone, tablet, and desktop viewport sizes.
- **FR-005**: Resizing the viewport MUST adapt the board presentation without changing the current game state, cell actions, focus behavior, or persistence behavior.
- **FR-006**: The change MUST preserve the existing board appearance, edge visibility cues, and mouse, touch, and keyboard interaction semantics outside the intended cell-size and available-space improvement.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At representative wide-phone viewports, a fitting standard board occupies at least 85% of the usable board-surface width, excluding the board surface's intentional border and padding.
- **SC-002**: At representative narrow-phone viewports, every edge of a board larger than the available surface can be reached by scrolling the board area, while the page remains no wider than the viewport.
- **SC-003**: At tablet and desktop viewports, a fitting board remains centered within its surface and does not grow beyond the established comfortable visual scale.
- **SC-004**: All existing board actions remain available after the sizing change: reveal, flag, touch scrolling, keyboard navigation, focus visibility, and edge-overflow cues continue to work in the supported interaction paths.

## Assumptions

- The existing board area remains the exclusive scroll region for oversized boards; this feature does not introduce page-level board scrolling.
- The existing minimum and maximum cell-size intent remains the baseline; planning will choose the smallest fluid adjustment that addresses the supplied phone screenshots.
- No user preference, game-rule change, new dependency, or persistence-schema change is needed.
- The supplied screenshots are visual evidence of the desired direction, not pixel-perfect requirements for every device or browser.
