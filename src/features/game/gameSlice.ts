import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { applyCommand, createGame } from '../../domain/gameEngine'
import type { GameCommand, GameConfig, GameSession } from '../../domain/gameTypes'

export type GameState = {
  session: GameSession | null
  lastTickAtMs: number | null
  resumable: boolean
}
const initialState: GameState = { session: null, lastTickAtMs: null, resumable: true }
type Timed = { atMs: number }

function accrue(state: GameState, atMs: number): void {
  if (!state.session || state.session.status !== 'playing' || state.lastTickAtMs === null) return
  state.session.elapsedMs += Math.max(0, atMs - state.lastTickAtMs)
  state.lastTickAtMs = atMs
}

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    newGame: (state, action: PayloadAction<Timed & { config: GameConfig; seed: number }>) => {
      state.session = createGame(action.payload.config, action.payload.seed)
      state.lastTickAtMs = null
      state.resumable = true
    },
    command: (state, action: PayloadAction<Timed & { command: GameCommand }>) => {
      if (!state.session) return
      accrue(state, action.payload.atMs)
      const wasReady = state.session.status === 'ready'
      state.session = applyCommand(state.session, action.payload.command)
      if (wasReady && state.session.status === 'playing') state.lastTickAtMs = action.payload.atMs
      if (state.session.status === 'won' || state.session.status === 'lost') {
        state.lastTickAtMs = null
        state.resumable = false
      }
    },
    pause: (state, action: PayloadAction<Timed>) => {
      accrue(state, action.payload.atMs)
      state.lastTickAtMs = null
    },
    resume: (state, action: PayloadAction<Timed>) => {
      if (state.session?.status === 'playing' && state.resumable)
        state.lastTickAtMs = action.payload.atMs
    },
    tick: (state, action: PayloadAction<Timed>) => accrue(state, action.payload.atMs),
    hydrate: (state, action: PayloadAction<{ session: GameSession | null }>) => {
      state.session = action.payload.session
      state.lastTickAtMs = null
      state.resumable = true
    },
    discardResume: (state) => {
      state.resumable = false
    },
    clear: (state) => {
      state.session = null
      state.lastTickAtMs = null
      state.resumable = true
    },
  },
})

export const { newGame, command, pause, resume, tick, hydrate, discardResume, clear } =
  gameSlice.actions
export default gameSlice.reducer
