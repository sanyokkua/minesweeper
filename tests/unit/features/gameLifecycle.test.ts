import { createAppStore } from '../../../src/app/store'
import { newGame, command, pause, resume } from '../../../src/features/game/gameSlice'

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
})
