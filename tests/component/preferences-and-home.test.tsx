import { fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createAppStore } from '../../src/app/store'
import { HomeScreen } from '../../src/ui/screens/HomeScreen'
import { setSelectedConfig } from '../../src/features/preferences/preferencesSlice'
describe('home preferences', () => {
    it('shows retained selection and accessible settings actions', () => {
        render(
            <Provider store={createAppStore()}>
                <HomeScreen />
            </Provider>,
        )
        expect(screen.getByRole('button', { name: /beginner/i })).toHaveAttribute('aria-pressed', 'true')
        expect(screen.getByRole('button', { name: /^play$/i })).toBeInTheDocument()
        expect(screen.getAllByRole('button', { name: /settings/i }).length).toBeGreaterThanOrEqual(1)
    })

    it('hydrates the custom draft from the retained selected configuration', () => {
        const store = createAppStore()
        store.dispatch(setSelectedConfig({ kind: 'custom', rows: 18, columns: 22, mines: 77 }))
        render(
            <Provider store={store}>
                <HomeScreen />
            </Provider>,
        )
        expect(screen.getByRole('spinbutton', { name: /rows/i })).toHaveValue(18)
        expect(screen.getByRole('spinbutton', { name: /columns/i })).toHaveValue(22)
        expect(screen.getByRole('spinbutton', { name: /mines/i })).toHaveValue(77)
    })

    it('keeps the last valid Custom selection while invalid edits stay transient', () => {
        const store = createAppStore()
        const valid = { kind: 'custom' as const, rows: 18, columns: 22, mines: 77 }
        store.dispatch(setSelectedConfig(valid))

        render(
            <Provider store={store}>
                <HomeScreen />
            </Provider>,
        )

        const rows = screen.getByRole('spinbutton', { name: /rows/i })
        fireEvent.change(rows, { target: { value: '4' } })

        expect(store.getState().preferences.selectedConfig).toEqual(valid)
        expect(screen.getByRole('button', { name: /^play$/i })).toBeDisabled()

        fireEvent.change(rows, { target: { value: '20' } })

        expect(store.getState().preferences.selectedConfig).toEqual({ ...valid, rows: 20 })
        expect(screen.getByRole('button', { name: /^play$/i })).not.toBeDisabled()
    })

    it('uses the mockup hierarchy for the home hero and difficulty cards', () => {
        const { container } = render(
            <Provider store={createAppStore()}>
                <HomeScreen />
            </Provider>,
        )
        expect(container.querySelector('.topbar')).toBeInTheDocument()
        expect(container.querySelector('.hero .badge')).toBeInTheDocument()
        expect(container.querySelector('.mini-preview')).toBeInTheDocument()
        expect(container.querySelectorAll('.diff-card')).toHaveLength(4)
    })

    it('renders the deterministic 10-column by 4-row hero field from the mockup', () => {
        const { container } = render(
            <Provider store={createAppStore()}>
                <HomeScreen />
            </Provider>,
        )

        const preview = container.querySelector('.mini-preview')
        const cells = Array.from(preview?.querySelectorAll('.preview-cell') ?? [])

        expect(preview?.getAttribute('aria-label')).toMatch(/preview/i)
        expect(cells).toHaveLength(40)
        expect(cells.filter((cell) => cell.classList.contains('is-revealed'))).toHaveLength(16)
        expect(cells.filter((cell) => cell.classList.contains('is-flag'))).toHaveLength(4)
        expect(
            cells.filter((cell) => !cell.classList.contains('is-revealed') && !cell.classList.contains('is-flag')),
        ).toHaveLength(20)
        expect(cells[0]).toHaveTextContent('1')
        expect(cells[3]).toHaveTextContent('⚑')
        expect(cells[8]).toHaveClass('is-revealed')
        expect(cells[39]).not.toHaveClass('is-revealed')
    })

    it('keeps the mockup action hierarchy and custom-card presentation', () => {
        render(
            <Provider store={createAppStore()}>
                <HomeScreen />
            </Provider>,
        )

        expect(screen.getByText(/choose how taps and long-presses work/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /how to play/i })).toHaveClass('action-button')
        expect(screen.getByRole('button', { name: /^custom/i })).toHaveTextContent(/set your own/i)
        expect(document.querySelectorAll('.footlinks button')).toHaveLength(1)
    })

    it('links to the project repository from Home', () => {
        render(
            <Provider store={createAppStore()}>
                <HomeScreen />
            </Provider>,
        )

        expect(screen.getByRole('link', { name: /source on github/i })).toHaveAttribute(
            'href',
            'https://github.com/sanyokkua/minesweeper',
        )
    })
})
