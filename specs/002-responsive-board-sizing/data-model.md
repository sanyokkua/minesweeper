# Data Model: Responsive Board Sizing

This feature introduces no new data entities, fields, persisted values, or state transitions.

The existing `GameSession` remains the authoritative game state. Cell size is a presentation concern derived from the current viewport and CSS rules. The existing board configuration (`rows`, `columns`, and `mines`) continues to determine the number of rendered cells, while the existing `BoardViewport` continues to determine whether those cells are visible at once or reached through local scrolling.

There is no migration, codec change, storage-key change, or compatibility concern.
