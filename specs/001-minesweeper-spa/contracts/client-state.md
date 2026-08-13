# Client State and Persistence Contract

Redux is the authoritative in-memory client state. UI issues named commands and renders selectors; it never recalculates board rules or serializes directly.

## Actions and lifecycle

```ts
type TimedAction = { atMs: number }
type GameAction =
  | ({ type: 'game/new'; config: GameConfig; seed: number } & TimedAction)
  | ({ type: 'game/command'; command: GameCommand } & TimedAction)
  | ({ type: 'game/pause' | 'game/resume' | 'game/tick' } & TimedAction)
  | ({ type: 'game/discardResume' } & TimedAction)
```

Lifecycle adapters dispatch pause before Home navigation, a blocking sheet opens, document becomes hidden, page hide, terminal state, or game replacement. They dispatch resume only after gameplay is visible, document visibility returns, no blocking sheet remains, and an active playing session exists. A reducer uses the supplied time and clamps backward deltas to zero.

## Durable storage

```ts
const STORAGE_KEY = 'minesweeper.local-state'
function decodeStoredRecord(raw: string | null): DecodeResult<PlayerRecordV1>
function encodeStoredRecord(state: RootState): PlayerRecordV1
interface StorageGateway { read(): Result<string | null>; write(value: string): Result<void>; clear(): Result<void> }
```

The codec validates every enum, configuration, numeric field, cell array length, flag cap, pre-/post-placement invariant, exact mine count, neighbour count, and active-only resume status. Unknown future versions, malformed JSON, incompatible shapes, unavailable storage, or throwing storage return safe defaults/recovery status without throwing into UI. Known earlier versions migrate through explicit pure migrations only.

Writes contain only approved preferences, records, and a paused active session. Quota/write failure leaves Redux and existing stored data untouched, emits a localized nonblocking warning, and must never trigger auto-deletion. Reset local data clears stored data but does not mutate an open session; it marks it ineligible for later persistence.
