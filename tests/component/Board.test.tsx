import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createAppStore } from '../../src/app/store'
import { Board } from '../../src/ui/components/Board'
import { createGame } from '../../src/domain/gameEngine'

describe('board', () => {
  it('renders a labelled grid with stateful cell names', () => {
    const session = createGame({ kind: 'custom', rows: 5, columns: 5, mines: 1 }, 1)
    render(
      <Provider store={createAppStore()}>
        <Board session={session} onPrimary={vi.fn()} onSecondary={vi.fn()} />
      </Provider>,
    )
    expect(screen.getByRole('grid', { name: /game board/i })).toBeInTheDocument()
    expect(screen.getAllByRole('gridcell')).toHaveLength(25)
    expect(screen.getByRole('gridcell', { name: /row 1, column 1, unopened/i })).toBeInTheDocument()
  })
})
