import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createAppStore } from '../../src/app/store'
import { AppSheets } from '../../src/ui/components/AppSheets'
import { openSheet } from '../../src/app/appSlice'
import { setLocale } from '../../src/features/preferences/preferencesSlice'
describe('application sheets', () => {
    it('updates settings content from the store', () => {
        const store = createAppStore()
        store.dispatch(openSheet('settings'))
        render(
            <Provider store={store}>
                <AppSheets />
            </Provider>,
        )
        expect(screen.getByRole('dialog', { name: /settings/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /dark/i })).toBeInTheDocument()
    })

    it('localizes the confirmation close action', () => {
        const store = createAppStore()
        store.dispatch(setLocale('uk'))
        store.dispatch(openSheet('confirm-reset-data'))
        render(
            <Provider store={store}>
                <AppSheets />
            </Provider>,
        )
        expect(screen.getByRole('button', { name: 'Закрити підтвердження' })).toBeInTheDocument()
    })

    it('uses a centered modal surface with localized settings controls', () => {
        const store = createAppStore()
        store.dispatch(openSheet('settings'))
        const { container } = render(
            <Provider store={store}>
                <AppSheets />
            </Provider>,
        )

        expect(container.querySelector('.modal-layer')).toHaveClass('modal-layer--centered')
        expect(screen.getByText(/language/i)).toBeInTheDocument()
        expect(screen.getByText(/input mode/i)).toBeInTheDocument()
        expect(screen.getByText('Appearance')).toBeInTheDocument()
    })

    it('renders descriptive input, appearance, and local-data setting choices', () => {
        const store = createAppStore()
        store.dispatch(openSheet('settings'))
        render(
            <Provider store={store}>
                <AppSheets />
            </Provider>,
        )

        expect(screen.getByRole('button', { name: /reveal first/i })).toHaveAttribute('aria-pressed', 'true')
        expect(screen.getByText(/quick tap opens a cell/i)).toBeInTheDocument()
        expect(screen.getByText(/long-press or right-click opens the cell/i)).toBeInTheDocument()
        expect(screen.getByText(/same palette/i)).toBeInTheDocument()
        expect(screen.getByText(/stored only in this browser/i)).toBeInTheDocument()
        expect(document.querySelectorAll('.settings-option')).toHaveLength(5)
        expect(document.querySelector('.settings-danger-row')).toBeInTheDocument()
    })
})
