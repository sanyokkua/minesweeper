import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createAppStore } from '../../src/app/store'
import { BuildStamp } from '../../src/ui/components/BuildStamp'

describe('release-facing convergence contracts', () => {
    it('renders the local build stamp when no CI timestamp is injected', () => {
        render(
            <Provider store={createAppStore()}>
                <BuildStamp />
            </Provider>,
        )

        expect(screen.getByTestId('build-stamp')).toHaveTextContent(/app build: dev version/i)
    })
})
