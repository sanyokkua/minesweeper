import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createAppStore } from '../../src/app/store'
import { HelpSheet } from '../../src/ui/components/HelpSheet'
import { setInputMode } from '../../src/features/preferences/preferencesSlice'
describe('help and recovery', () => {
    it('shows localized rules and a close control', () => {
        render(
            <Provider store={createAppStore()}>
                <HelpSheet open onClose={vi.fn()} />
            </Provider>,
        )
        expect(screen.getByRole('dialog', { name: /how to play/i })).toHaveTextContent(/reveal unopened/i)
        expect(screen.getByRole('button', { name: /close help/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /got it/i })).toBeInTheDocument()
    })

    it('derives the mapping guidance from the selected input mode', () => {
        const store = createAppStore()
        store.dispatch(setInputMode('flag-first'))
        render(
            <Provider store={store}>
                <HelpSheet open onClose={vi.fn()} />
            </Provider>,
        )
        expect(screen.getByText(/flag first: tap/i)).toBeInTheDocument()
        expect(screen.getByText(/right-click performs the secondary action/i)).toBeInTheDocument()
    })
})
