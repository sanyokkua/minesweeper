# Game Engine Contract

The domain is pure and immutable. It must not import React, Redux, browser APIs, local storage, a timer, or `Math.random`.

```ts
type Coordinate = { row: number; column: number }
type GameCommand = { type: 'reveal'; coordinate: Coordinate } | { type: 'toggleFlag'; coordinate: Coordinate }

function validateConfig(config: GameConfig): ValidationResult<GameConfig>
function createGame(config: GameConfig, seed: number): GameSession
function applyCommand(session: GameSession, command: GameCommand): GameSession
function indexOf(config: GameConfig, coordinate: Coordinate): number | null
function cellPresentation(session: GameSession, index: number): CellPresentation
```

`createGame` produces a blank `ready` board. The first valid unflagged reveal samples exactly `mines` unique indices from all positions excluding exactly that coordinate, then computes all neighbour counts. A reveal of an unopened flag clears the flag and returns without placement. Commands with invalid coordinates, on revealed cells, flag additions beyond capacity, or against terminal sessions return an equivalent session.

The engine uses iterative flood fill. On loss, `cellPresentation` distinguishes detonated mine, ordinary mine, incorrect flag, hidden safe cell, opened zero, and opened number. On win, all mines are flagged.

Tests must invoke this API with known seeds or a lower-level injected deterministic sampler; UI tests must not depend on random outcomes.
