import { createAppStore } from '../../../src/app/store'
import { command, newGame, pause, resume, tick } from '../../../src/features/game/gameSlice'
import { PRESETS, coordinateForIndex } from '../../../src/domain/config'

describe('game session reducer', () => {
    it('uses injected timestamps, pauses time, and locks terminal commands', () => {
        const store = createAppStore()
        store.dispatch(newGame({ config: PRESETS.beginner, seed: 7, atMs: 100 }))
        store.dispatch(command({ command: { type: 'reveal', coordinate: { row: 0, column: 0 } }, atMs: 1_000 }))
        store.dispatch(tick({ atMs: 3_500 }))
        expect(store.getState().game.session?.elapsedMs).toBe(2_500)
        store.dispatch(pause({ atMs: 4_500 }))
        store.dispatch(tick({ atMs: 9_500 }))
        expect(store.getState().game.session?.elapsedMs).toBe(3_500)
        store.dispatch(resume({ atMs: 10_000 }))
        expect(store.getState().game.lastTickAtMs).toBe(10_000)
    })

    it('does not add flags beyond the mine allowance', () => {
        const store = createAppStore()
        store.dispatch(newGame({ config: { kind: 'custom', rows: 5, columns: 5, mines: 1 }, seed: 3, atMs: 0 }))
        store.dispatch(command({ command: { type: 'toggleFlag', coordinate: { row: 0, column: 0 } }, atMs: 0 }))
        store.dispatch(command({ command: { type: 'toggleFlag', coordinate: { row: 0, column: 1 } }, atMs: 0 }))
        expect(store.getState().game.session?.cells.filter((cell) => cell.flagged)).toHaveLength(1)
    })

    it.each(Object.entries(PRESETS))('stops the injected timer on loss and win for %s', (_, config) => {
        const lostStore = createAppStore()
        lostStore.dispatch(newGame({ config, seed: 456, atMs: 0 }))
        lostStore.dispatch(command({ command: { type: 'reveal', coordinate: { row: 0, column: 0 } }, atMs: 100 }))
        const mineIndex = lostStore.getState().game.session?.cells.findIndex((cell) => cell.hasMine) ?? -1
        lostStore.dispatch(
            command({ command: { type: 'reveal', coordinate: coordinateForIndex(config, mineIndex) }, atMs: 1_100 }),
        )
        expect(lostStore.getState().game.session?.status).toBe('lost')
        expect(lostStore.getState().game.session?.elapsedMs).toBe(1_000)
        expect(lostStore.getState().game.lastTickAtMs).toBeNull()

        const wonStore = createAppStore()
        wonStore.dispatch(newGame({ config, seed: 789, atMs: 0 }))
        wonStore.dispatch(command({ command: { type: 'reveal', coordinate: { row: 0, column: 0 } }, atMs: 100 }))
        for (const [index, cell] of (wonStore.getState().game.session?.cells ?? []).entries()) {
            if (!cell.hasMine) {
                wonStore.dispatch(
                    command({ command: { type: 'reveal', coordinate: coordinateForIndex(config, index) }, atMs: 200 }),
                )
            }
        }
        expect(wonStore.getState().game.session?.status).toBe('won')
        expect(wonStore.getState().game.lastTickAtMs).toBeNull()
        expect(wonStore.getState().game.session?.cells.filter((cell) => cell.flagged)).toHaveLength(config.mines)
    })
})
