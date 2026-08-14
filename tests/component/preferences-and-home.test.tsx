import { render, screen } from '@testing-library/react'
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
