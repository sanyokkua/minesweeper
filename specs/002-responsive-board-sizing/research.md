# Research: Responsive Board Sizing

## Decision: Use a fluid CSS cell size with the existing floor and ceiling

**Decision**: Change the board grid's cell-size expression from its current viewport scaling to `clamp(32px, 9vw, 40px)`.

**Rationale**:

- The current 32px floor prevents cells from growing on 375–430px phone viewports, which creates the large side margins shown in the supplied screenshots.
- A 9vw middle value produces a gradual increase across the wide-phone range while keeping the existing 32px floor on narrow phones and the existing 40px ceiling on larger screens.
- The board already has a dedicated scroll container with intrinsic content sizing, so boards that become wider than the viewport remain reachable without page-level overflow.
- A CSS-only adjustment avoids runtime measurement, state changes, inline style exceptions, and new dependencies.

**Alternatives considered**:

- **Fixed 40px cells everywhere**: rejected because narrow phones would scroll unnecessarily and would lose the current compact fit where the board can still fit.
- **Runtime `ResizeObserver` sizing**: rejected because the existing CSS model already expresses the required fit-or-scroll behavior and runtime measurement would add complexity without new user value.
- **Per-board-count formulas or configuration classes**: rejected because they add branching for Standard and Custom configurations when the existing intrinsic grid and scroll boundary already handle board dimensions.
- **Reducing board-surface padding only**: rejected because it does not address the underlying undersized cells on wide phones and would weaken the intentional surface spacing.

## Evidence reviewed

- `src/ui/styles/board.css`: current board cell floor, viewport-relative sizing, intrinsic grid sizing, and board-local overflow.
- `src/ui/components/BoardViewport.tsx`: existing resize/scroll edge-cue boundary.
- `tests/e2e/responsive-interaction.spec.ts`: existing fit, page-containment, edge-reachability, keyboard, and touch coverage.
- `docs/architecture.md`: board-local scrolling and touch-size-floor architecture contract.
- Supplied phone screenshots: visual evidence for larger cells on wide phones and preserved scrolling on narrow surfaces.
