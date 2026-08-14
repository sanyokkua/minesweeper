import { test, expect } from '@playwright/test'

test('30 by 30 engine interaction remains under the release budget', async () => {
    const { applyCommand, createGame } = await import('../../src/domain/gameEngine')
    const config = { kind: 'custom' as const, rows: 30, columns: 30, mines: 100 }
    const start = performance.now()
    applyCommand(createGame(config, 1), { type: 'reveal', coordinate: { row: 0, column: 0 } })
    expect(performance.now() - start).toBeLessThan(250)
})
