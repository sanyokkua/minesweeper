# Data Model: Minesweeper Static SPA

This model is the contract for implementation; it is not a persistence-format substitute. All persisted values are validated before hydration.

## Game configuration

```ts
type PresetKind = 'beginner' | 'intermediate' | 'expert'
type GameConfig =
  | { kind: PresetKind; rows: 9 | 16 | 24; columns: 9 | 16 | 24; mines: 10 | 40 | 99 }
  | { kind: 'custom'; rows: number; columns: number; mines: number }
```

`custom` values must be integers: rows and columns 5–30 and mines 1 through `rows * columns - 1`. The canonical identity is `rows + 'x' + columns + ':' + mines`; it is never localized.

## Domain board and session

```ts
type Cell = {
  hasMine: boolean
  neighborMines: number // integer 0..8
  revealed: boolean
  flagged: boolean
}

type GameStatus = 'ready' | 'playing' | 'won' | 'lost'

type GameSession = {
  config: GameConfig
  cells: readonly Cell[] // row-major; exactly rows * columns
  seed: number // uint32, retained for delayed placement
  minesPlaced: boolean
  status: GameStatus
  elapsedMs: number // finite, non-negative accumulated duration
  detonatedIndex?: number
}
```

`ready` has zero elapsed time, unplaced mines/counts, and may have flags. `playing` has placed mines/counts. Only `ready` and `playing` may be persisted/resumed. `won` and `lost` are live display states only and are removed from the resumable record.

## UI and timing state

```ts
type Route = 'home' | 'game'
type BlockingSheet = 'help' | 'settings' | 'confirm-reset' | 'confirm-replace' | 'win' | 'loss' | null
type GameState = { session: GameSession | null; lastTickAtMs: number | null; resumable: boolean }
type AppState = { route: Route; blockingSheet: BlockingSheet; documentVisible: boolean; notices: Notice[] }
```

The timer runs only when session status is `playing`, route is `game`, document is visible, and `blockingSheet` is null. On every pause transition accrue the elapsed duration and clear the baseline. The persisted form contains only `elapsedMs`, never an active timestamp.

## Preferences, records, and durable record

```ts
type Locale = 'en' | 'uk'
type Appearance = 'light' | 'dark' | 'system'
type InputMode = 'reveal-first' | 'flag-first'
type Preferences = { locale: Locale; appearance: Appearance; inputMode: InputMode; selectedConfig: GameConfig }
type BestRecord = { bestSeconds: number; lastStartedAt: number }
type PlayerRecordV1 = {
  version: 1
  preferences: Preferences
  standardRecords: Partial<Record<PresetKind, BestRecord>>
  customRecords: Record<string, BestRecord> // max 100, keyed by canonical config
  resumableGame?: GameSession
}
```

The storage key is `minesweeper.local-state`. `lastStartedAt` is a finite non-negative logical recency value, not a requirement to expose wall-clock time. Starting a Custom game updates its record recency; when a new Custom record would exceed 100, evict the lowest recency and then lowest canonical key. Standard entries never evict. A winning time replaces a record only when strictly lower after `ceil(elapsedMs / 1000)`.

## State transitions

| Event | Preconditions | Result |
| --- | --- | --- |
| New game | Valid config | Blank `ready` board with a fresh seed; retain selected config; mark resumable. |
| Reveal flagged | Unopened flagged cell | Clear only flag; no placement/time start. |
| First real reveal | `ready`, unopened/unflagged valid cell | Place exact mines excluding that index; calculate counts; reveal/flood; enter `playing` unless immediate win. |
| Flag | Unopened cell and flag count below mine count | Toggle flag; unchanged if cap/revealed/terminal/invalid. |
| Loss | Reveal mined cell | `lost`, timer paused, detonated index set; no further mutations. |
| Win | All safe cells revealed | `won`, timer paused, all mines flagged; update record; discard durable resume. |
| Pause | Home/hidden/sheet/pagehide/terminal | Accrue duration; save paused active snapshot if resumable. |
| Reset local data | Confirmed | Clear durable record/default retained data; live open session remains playable but becomes non-resumable. |
