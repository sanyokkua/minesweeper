# Board Sizing Contract

## Inputs

- The active board configuration, including standard and Custom row/column counts.
- The current available board surface at the user's viewport size.
- The existing board session and interaction state.

## Required behavior

1. Cells use a fluid size bounded by the existing comfortable floor and ceiling.
2. A fitting board grows into available phone width instead of remaining at the smallest cell size with large unused side margins.
3. An oversized board keeps its complete intrinsic dimensions and is reachable through horizontal and vertical scrolling inside the board area.
4. The surrounding page remains horizontally contained when the board is wider than its surface.
5. Viewport resize changes presentation only; it does not reset or mutate the game session, timer, flags, focus contract, or persistence record.
6. Existing edge cues, keyboard focus scrolling, pointer actions, touch long-press cancellation, and visible focus behavior remain unchanged.

## Invariants

- No domain or Redux state shape changes.
- No persistence or URL changes.
- No new dependency or runtime service.
- Standard and Custom board configurations use the same fit-or-scroll rule.
