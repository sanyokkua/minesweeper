import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createAppStore } from '../../src/app/store'
import { BuildStamp } from '../../src/ui/components/BuildStamp'

describe('release-facing convergence contracts', () => {
    it('renders the build stamp with the CI run number and UTC time', () => {
        render(
            <Provider store={createAppStore()}>
                <BuildStamp />
            </Provider>,
        )

        expect(screen.getByTestId('build-stamp')).toHaveTextContent('App Build: Build 57 · 2026-09-28 14:03 UTC')
    })
})
