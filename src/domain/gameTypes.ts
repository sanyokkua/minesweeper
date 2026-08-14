export type PresetKind = 'beginner' | 'intermediate' | 'expert'

export type GameConfig =
  | { kind: PresetKind; rows: number; columns: number; mines: number }
  | { kind: 'custom'; rows: number; columns: number; mines: number }

export type Coordinate = { row: number; column: number }

export type Cell = {
  hasMine: boolean
  neighborMines: number
  revealed: boolean
  flagged: boolean
}

export type GameStatus = 'ready' | 'playing' | 'won' | 'lost'

export type GameSession = {
  config: GameConfig
  cells: Cell[]
  seed: number
  minesPlaced: boolean
  status: GameStatus
  elapsedMs: number
  detonatedIndex?: number
}

export type GameCommand =
  { type: 'reveal'; coordinate: Coordinate } | { type: 'toggleFlag'; coordinate: Coordinate }

export type CellPresentation =
  | { kind: 'hidden' }
  | { kind: 'flagged' }
  | { kind: 'open-zero' }
  | { kind: 'open-number'; number: number }
  | { kind: 'mine' }
  | { kind: 'detonated-mine' }
  | { kind: 'incorrect-flag' }

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; errors: string[] }
