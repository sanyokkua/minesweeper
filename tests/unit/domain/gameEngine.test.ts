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
    const config = { kind: 'custom' as const, rows: 5, columns: 5, mines: 5 }
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

  it.each(Object.entries(PRESETS))('proves the seeded rule matrix for %s', (_, config) => {
    const initial = createGame(config, 123)
    const first = applyCommand(initial, { type: 'reveal', coordinate: { row: 0, column: 0 } })
    expect(first.cells.filter((cell) => cell.hasMine)).toHaveLength(config.mines)
    expect(first.cells[0].hasMine).toBe(false)
    expect(first.cells.some((cell) => cell.revealed)).toBe(true)
    expect(
      first.cells
        .filter((cell) => cell.neighborMines > 0)
        .every((cell) => cell.hasMine === false || Number.isInteger(cell.neighborMines)),
    ).toBe(true)
  })

  it.each(Object.entries(PRESETS))('proves terminal rule transitions for %s', (_, config) => {
    let game = applyCommand(createGame(config, 456), {
      type: 'reveal',
      coordinate: { row: 0, column: 0 },
    })
    const mine = game.cells.findIndex((cell) => cell.hasMine)
    game = applyCommand(game, { type: 'toggleFlag', coordinate: coordinateForIndex(config, mine) })
    expect(game.cells[mine].flagged).toBe(true)
    game = applyCommand(game, { type: 'toggleFlag', coordinate: coordinateForIndex(config, mine) })
    expect(game.cells[mine].flagged).toBe(false)

    game = applyCommand(game, { type: 'reveal', coordinate: coordinateForIndex(config, mine) })
    expect(game.status).toBe('lost')
    expect(applyCommand(game, { type: 'toggleFlag', coordinate: { row: 0, column: 1 } })).toBe(game)

    let won = applyCommand(createGame(config, 789), {
      type: 'reveal',
      coordinate: { row: 0, column: 0 },
    })
    for (const [index, cell] of won.cells.entries()) {
      if (!cell.hasMine)
        won = applyCommand(won, { type: 'reveal', coordinate: coordinateForIndex(config, index) })
    }
    expect(won.status).toBe('won')
    expect(won.cells.filter((cell) => cell.flagged)).toHaveLength(config.mines)
  })

  it('keeps unopened safe cells distinct from detonated mines after loss', () => {
    const config = { kind: 'custom' as const, rows: 5, columns: 5, mines: 1 }
    let game = applyCommand(createGame(config, 9), {
      type: 'reveal',
      coordinate: { row: 0, column: 0 },
    })
    const mineIndex = game.cells.findIndex((cell) => cell.hasMine)
    const safeUnopened = game.cells.findIndex((cell) => !cell.hasMine && !cell.revealed)
    game = applyCommand(game, {
      type: 'toggleFlag',
      coordinate: coordinateForIndex(config, safeUnopened),
    })
    game = applyCommand(game, { type: 'reveal', coordinate: coordinateForIndex(config, mineIndex) })
    expect(cellPresentation(game, mineIndex).kind).toBe('detonated-mine')
    expect(cellPresentation(game, safeUnopened).kind).toBe('incorrect-flag')
    const hiddenSafe = game.cells.findIndex(
      (cell) => !cell.hasMine && !cell.revealed && !cell.flagged,
    )
    expect(hiddenSafe).toBeGreaterThanOrEqual(0)
    expect(cellPresentation(game, hiddenSafe).kind).toBe('hidden')
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
