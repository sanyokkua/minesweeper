import { act, fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createAppStore } from '../../src/app/store'
import { newGame } from '../../src/features/game/gameSlice'
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

    it('flags a cell after a touch long press and suppresses the follow-up click', () => {
        vi.useFakeTimers()
        const onCommand = vi.fn()
        const session = createGame({ kind: 'custom', rows: 5, columns: 5, mines: 1 }, 1)
        render(
            <Provider store={createAppStore()}>
                <Board session={session} onCommand={onCommand} />
            </Provider>,
        )

        const cell = screen.getByRole('gridcell', { name: /row 1, column 2, unopened/i })
        fireEvent.pointerDown(cell, {
            pointerId: 1,
            pointerType: 'touch',
            clientX: 20,
            clientY: 20,
        })

        act(() => {
            vi.advanceTimersByTime(600)
        })
        fireEvent.pointerUp(cell, { pointerId: 1, pointerType: 'touch' })
        fireEvent.click(cell)

        expect(onCommand).toHaveBeenCalledTimes(1)
        expect(onCommand).toHaveBeenCalledWith({
            type: 'toggleFlag',
            coordinate: { row: 0, column: 1 },
        })
        vi.useRealTimers()
    })

    it('does not let a touch context-menu fallback immediately clear its flag', () => {
        const onCommand = vi.fn()
        const session = createGame({ kind: 'custom', rows: 5, columns: 5, mines: 1 }, 1)
        render(
            <Provider store={createAppStore()}>
                <Board session={session} onCommand={onCommand} />
            </Provider>,
        )

        const cell = screen.getByRole('gridcell', { name: /row 1, column 2, unopened/i })
        const contextMenu = new MouseEvent('contextmenu', { bubbles: true, button: 0 })
        Object.defineProperty(contextMenu, 'pointerType', { value: 'touch' })
        fireEvent(cell, contextMenu)
        fireEvent.click(cell)

        expect(onCommand).toHaveBeenCalledTimes(1)
        expect(onCommand).toHaveBeenCalledWith({
            type: 'toggleFlag',
            coordinate: { row: 0, column: 1 },
        })
    })

    it('deduplicates a context-menu event that arrives after the long-press timer', () => {
        vi.useFakeTimers()
        const onCommand = vi.fn()
        const session = createGame({ kind: 'custom', rows: 5, columns: 5, mines: 1 }, 1)
        render(
            <Provider store={createAppStore()}>
                <Board session={session} onCommand={onCommand} />
            </Provider>,
        )

        const cell = screen.getByRole('gridcell', { name: /row 1, column 2, unopened/i })
        fireEvent.pointerDown(cell, {
            pointerId: 1,
            pointerType: 'touch',
            clientX: 20,
            clientY: 20,
        })
        act(() => {
            vi.advanceTimersByTime(600)
        })
        fireEvent.pointerUp(cell, { pointerId: 1, pointerType: 'touch' })
        const contextMenu = new MouseEvent('contextmenu', { bubbles: true, button: 0 })
        Object.defineProperty(contextMenu, 'pointerType', { value: 'touch' })
        fireEvent(cell, contextMenu)
        fireEvent.click(cell)

        expect(onCommand).toHaveBeenCalledTimes(1)
        expect(onCommand).toHaveBeenCalledWith({
            type: 'toggleFlag',
            coordinate: { row: 0, column: 1 },
        })
        vi.useRealTimers()
    })

    it('returns roving focus to the top-left cell for a new session identity', () => {
        const store = createAppStore()
        const first = createGame({ kind: 'custom', rows: 5, columns: 5, mines: 1 }, 1)
        const { rerender } = render(
            <Provider store={store}>
                <Board session={first} />
            </Provider>,
        )
        fireEvent.focus(screen.getByRole('gridcell', { name: /row 1, column 3/i }))
        const second = createGame({ kind: 'custom', rows: 5, columns: 5, mines: 1 }, 2)
        store.dispatch(newGame({ config: second.config, seed: 2, atMs: 0 }))
        rerender(
            <Provider store={store}>
                <Board session={second} />
            </Provider>,
        )
        expect(screen.getByRole('gridcell', { name: /row 1, column 1/i })).toHaveFocus()
        expect(screen.getByRole('gridcell', { name: /row 1, column 1/i })).toHaveAttribute('tabindex', '0')
    })
})
