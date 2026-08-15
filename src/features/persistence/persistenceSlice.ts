import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { BestRecord } from './recordCodec'
import { canonicalConfigKey } from '../../domain/config'
import type { GameConfig } from '../../domain/gameTypes'
import { secondsFor } from '../game/records'

export type PersistenceState = {
    hydrated: boolean
    lastError: string | null
    resetPerformed: boolean
    standardRecords: Partial<Record<'beginner' | 'intermediate' | 'expert', BestRecord>>
    customRecords: Record<string, BestRecord>
}
const initialState: PersistenceState = {
    hydrated: false,
    lastError: null,
    resetPerformed: false,
    standardRecords: {},
    customRecords: {},
}
const persistenceSlice = createSlice({
    name: 'persistence',
    initialState,
    reducers: {
        hydrationComplete: (state) => {
            state.hydrated = true
        },
        persistenceError: (state, action: PayloadAction<string>) => {
            state.lastError = action.payload
        },
        clearPersistenceError: (state) => {
            state.lastError = null
        },
        markResetPerformed: (state) => {
            state.resetPerformed = true
        },
        setRecords: (
            state,
            action: PayloadAction<{
                standardRecords: PersistenceState['standardRecords']
                customRecords: Record<string, BestRecord>
            }>,
        ) => {
            state.standardRecords = action.payload.standardRecords
            state.customRecords = action.payload.customRecords
        },
        startRecord: (state, action: PayloadAction<{ config: GameConfig; atMs: number }>) => {
            if (action.payload.config.kind !== 'custom') return
            const key = canonicalConfigKey(action.payload.config)
            const previous = state.customRecords[key]
            const next = {
                ...state.customRecords,
                [key]: {
                    bestSeconds: previous?.bestSeconds ?? Number.MAX_SAFE_INTEGER,
                    lastStartedAt: action.payload.atMs,
                },
            }
            const entries = Object.entries(next).sort(
                (left, right) => left[1].lastStartedAt - right[1].lastStartedAt || left[0].localeCompare(right[0]),
            )
            while (entries.length > 100) delete next[entries.shift()?.[0] ?? '']
            state.customRecords = next
        },
        finishRecord: (state, action: PayloadAction<{ config: GameConfig; elapsedMs: number; atMs: number }>) => {
            const seconds = secondsFor(action.payload.elapsedMs)
            const next = { bestSeconds: seconds, lastStartedAt: action.payload.atMs }
            if (action.payload.config.kind === 'custom') {
                const key = canonicalConfigKey(action.payload.config)
                const previous = state.customRecords[key]
                if (!previous || seconds < previous.bestSeconds) {
                    state.customRecords[key] = {
                        bestSeconds: seconds,
                        lastStartedAt: previous?.lastStartedAt ?? action.payload.atMs,
                    }
                }
            } else {
                const previous = state.standardRecords[action.payload.config.kind]
                if (!previous || seconds < previous.bestSeconds)
                    state.standardRecords[action.payload.config.kind] = next
            }
        },
    },
})
export const {
    hydrationComplete,
    persistenceError,
    clearPersistenceError,
    markResetPerformed,
    setRecords,
    startRecord,
    finishRecord,
} = persistenceSlice.actions
export default persistenceSlice.reducer
