import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createAppStore } from '../../src/app/store'
import { GameScreen } from '../../src/ui/screens/GameScreen'
import { newGame } from '../../src/features/game/gameSlice'

describe('game screen', () => {
  it('renders reset, timer and board controls', () => {
    const store = createAppStore()
    store.dispatch(
      newGame({ config: { kind: 'custom', rows: 5, columns: 5, mines: 1 }, seed: 4, atMs: 0 }),
    )
    render(
      <Provider store={store}>
        <GameScreen />
      </Provider>,
    )
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
    expect(screen.getByText(/flags remaining/i)).toBeInTheDocument()
    expect(screen.getByRole('grid')).toBeInTheDocument()
  })
})
