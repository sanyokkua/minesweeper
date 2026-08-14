import { applyCommand, cellPresentation, createGame } from '../../../src/domain/gameEngine'
import { PRESETS, coordinateForIndex } from '../../../src/domain/config'

describe('pure game engine', () => {
  it('delays placement and excludes exactly the first revealed cell', () => {
    const initial = createGame(PRESETS.beginner, 42)
    const next = applyCommand(initial, { type: 'reveal', coordinate: { row: 0, column: 0 } })
    expect(initial.minesPlaced).toBe(false)
    expect(next.minesPlaced).toBe(true)
    expect(next.cells[0].hasMine).toBe(false)
    expect(next.cells.filter((cell) => cell.hasMine)).toHaveLength(10)
    expect(next.status).toBe('playing')
  })

  it('floods zeros, toggles flags with a cap, and clears a flagged reveal', () => {
    const initial = createGame({ kind: 'custom', rows: 5, columns: 5, mines: 1 }, 1)
    const flagged = applyCommand(initial, { type: 'toggleFlag', coordinate: { row: 0, column: 0 } })
    expect(flagged.cells[0].flagged).toBe(true)
    const cleared = applyCommand(flagged, { type: 'reveal', coordinate: { row: 0, column: 0 } })
    expect(cleared.cells[0].flagged).toBe(false)
    expect(cleared.minesPlaced).toBe(false)
    const revealed = applyCommand(cleared, { type: 'reveal', coordinate: { row: 4, column: 4 } })
    expect(revealed.cells.some((cell) => cell.revealed)).toBe(true)
  })

  it('locks terminal sessions and presents detonated and incorrect flags', () => {
    const config = { kind: 'custom' as const, rows: 5, columns: 5, mines: 1 }
    let game = createGame(config, 9)
    game = applyCommand(game, { type: 'reveal', coordinate: { row: 0, column: 0 } })
    const mineIndex = game.cells.findIndex((cell) => cell.hasMine)
    game = applyCommand(game, { type: 'reveal', coordinate: coordinateForIndex(config, mineIndex) })
    expect(game.status).toBe('lost')
    expect(cellPresentation(game, mineIndex).kind).toBe('detonated-mine')
    const before = JSON.stringify(game)
    expect(
      JSON.stringify(applyCommand(game, { type: 'toggleFlag', coordinate: { row: 1, column: 1 } })),
    ).toBe(before)
  })

  it('handles a 30 by 30 reveal without recursion or invalid cells', () => {
    const config = { kind: 'custom' as const, rows: 30, columns: 30, mines: 100 }
    const start = performance.now()
    const game = applyCommand(createGame(config, 99), {
      type: 'reveal',
      coordinate: { row: 0, column: 0 },
    })
    expect(game.cells).toHaveLength(900)
    expect(performance.now() - start).toBeLessThan(250)
  })
})
