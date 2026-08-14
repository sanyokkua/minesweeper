import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createAppStore } from '../../src/app/store'
import { Board } from '../../src/ui/components/Board'
import { createGame } from '../../src/domain/gameEngine'
describe('visual state contract', () => {
  it('uses semantic state classes for a fresh board', () => {
    const { container } = render(
      <Provider store={createAppStore()}>
        <Board session={createGame({ kind: 'custom', rows: 5, columns: 5, mines: 1 }, 4)} />
      </Provider>,
    )
    expect(container.querySelectorAll('.board-cell--hidden')).toHaveLength(25)
    expect(container.querySelector('.board-viewport')).toBeInTheDocument()
  })
})
