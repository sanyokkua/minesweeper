import { createAppStore } from '../../../src/app/store'
import { newGame, command, pause, resume } from '../../../src/features/game/gameSlice'
import {
  setAppearance,
  setInputMode,
  setLocale,
  setSelectedConfig,
} from '../../../src/features/preferences/preferencesSlice'
import { setRecords } from '../../../src/features/persistence/persistenceSlice'
import { resetLocalData } from '../../../src/features/persistence/persistenceController'

describe('game lifecycle', () => {
  it('does not accrue time while paused or across backwards timestamps', () => {
    const store = createAppStore()
    const config = { kind: 'custom' as const, rows: 5, columns: 5, mines: 1 }
    store.dispatch(newGame({ config, seed: 1, atMs: 0 }))
    store.dispatch(
      command({ command: { type: 'reveal', coordinate: { row: 0, column: 0 } }, atMs: 100 }),
    )
    store.dispatch(pause({ atMs: 1_100 }))
    store.dispatch(resume({ atMs: 50 }))
    expect(store.getState().game.session?.elapsedMs).toBe(1_000)
    store.dispatch(resume({ atMs: 2_000 }))
    store.dispatch(pause({ atMs: 2_500 }))
    expect(store.getState().game.session?.elapsedMs).toBe(1_500)
  })

  it('resets retained preferences and records while keeping the live board playable and non-resumable', () => {
    const store = createAppStore()
    store.dispatch(setLocale('uk'))
    store.dispatch(setAppearance('dark'))
    store.dispatch(setInputMode('flag-first'))
    store.dispatch(setSelectedConfig({ kind: 'custom', rows: 7, columns: 8, mines: 4 }))
    store.dispatch(
      setRecords({
        standardRecords: { beginner: { bestSeconds: 3, lastStartedAt: 1 } },
        customRecords: { '7x8:4': { bestSeconds: 4, lastStartedAt: 2 } },
      }),
    )
    store.dispatch(
      newGame({ config: { kind: 'custom', rows: 5, columns: 5, mines: 1 }, seed: 1, atMs: 0 }),
    )

    expect(
      resetLocalData(store, {
        read: () => ({ ok: true, value: null }),
        write: () => ({ ok: true, value: undefined }),
        clear: () => {
          return { ok: true, value: undefined }
        },
      }),
    ).toBe(true)

    expect(store.getState().preferences).toMatchObject({
      locale: 'en',
      appearance: 'system',
      inputMode: 'reveal-first',
      selectedConfig: { kind: 'beginner', rows: 9, columns: 9, mines: 10 },
    })
    expect(store.getState().persistence.standardRecords).toEqual({})
    expect(store.getState().persistence.customRecords).toEqual({})
    expect(store.getState().game.session).not.toBeNull()
    expect(store.getState().game.resumable).toBe(false)
  })
})
