import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createAppStore } from '../../src/app/store'
import { Board } from '../../src/ui/components/Board'
import { applyCommand, cellPresentation, createGame } from '../../src/domain/gameEngine'
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

    it('binds every revealed number to its semantic number class', () => {
        const session = applyCommand(createGame({ kind: 'custom', rows: 5, columns: 5, mines: 1 }, 4), {
            type: 'reveal',
            coordinate: { row: 0, column: 0 },
        })
        const { container } = render(
            <Provider store={createAppStore()}>
                <Board session={session} />
            </Provider>,
        )

        session.cells.forEach((_, index) => {
            const presentation = cellPresentation(session, index)
            if (presentation.kind !== 'open-number') return
            const cell = container.querySelector(`#board-cell-${index}`)
            expect(cell).toHaveClass(`board-cell--number-${presentation.number}`)
            expect(cell).toHaveAttribute('data-number', String(presentation.number))
        })
    })

    it('renders directional edge-cue landmarks around the board viewport', () => {
        const { container } = render(
            <Provider store={createAppStore()}>
                <Board session={createGame({ kind: 'custom', rows: 5, columns: 5, mines: 1 }, 4)} />
            </Provider>,
        )
        expect(container.querySelector('.board-viewport-frame')).toBeInTheDocument()
        expect(container.querySelectorAll('[data-edge-cue]')).toHaveLength(4)
    })
})
