import { createAppStore } from '../../../src/app/store'
import { newGame } from '../../../src/features/game/gameSlice'
import { PRESETS } from '../../../src/domain/config'

describe('application store', () => {
  it('creates isolated stores and accepts injected-time game actions', () => {
    const first = createAppStore()
    const second = createAppStore()
    first.dispatch(newGame({ config: PRESETS.beginner, seed: 1, atMs: 100 }))
    expect(first.getState().game.session).not.toBeNull()
    expect(second.getState().game.session).toBeNull()
  })
})
