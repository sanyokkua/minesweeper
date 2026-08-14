import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createAppStore } from '../../src/app/store'
import { GameScreen } from '../../src/ui/screens/GameScreen'
import { newGame } from '../../src/features/game/gameSlice'
import { applyCommand, createGame } from '../../src/domain/gameEngine'
import { hydrate } from '../../src/features/game/gameSlice'

describe('game screen', () => {
    it('renders reset, timer and board controls', () => {
        const store = createAppStore()
        store.dispatch(newGame({ config: { kind: 'custom', rows: 5, columns: 5, mines: 1 }, seed: 4, atMs: 0 }))
        render(
            <Provider store={store}>
                <GameScreen />
            </Provider>,
        )
        expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
        expect(screen.getByText(/flags remaining/i)).toBeInTheDocument()
        expect(screen.getByRole('grid')).toBeInTheDocument()
    })

    it('renders LCD-style HUD guidance and a complete terminal result', () => {
        const store = createAppStore()
        let session = createGame({ kind: 'custom', rows: 5, columns: 5, mines: 1 }, 4)
        session = applyCommand(session, { type: 'reveal', coordinate: { row: 0, column: 0 } })
        for (const [index, cell] of session.cells.entries()) {
            if (!cell.hasMine && !cell.revealed) {
                session = applyCommand(session, {
                    type: 'reveal',
                    coordinate: {
                        row: Math.floor(index / session.config.columns),
                        column: index % session.config.columns,
                    },
                })
            }
        }
        store.dispatch(hydrate({ session }))

        render(
            <Provider store={store}>
                <GameScreen />
            </Provider>,
        )

        expect(document.querySelector('.stat-display--lcd')).toBeInTheDocument()
        expect(screen.getByText(/tap: reveal/i)).toBeInTheDocument()
        expect(screen.getByText(/every safe cell revealed/i)).toBeInTheDocument()
        expect(screen.getByText(/flags placed/i)).toBeInTheDocument()
        expect(screen.getByText(/flags total/i)).toBeInTheDocument()
    })
})
