import { act, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createAppStore } from '../../src/app/store'
import { InstallAction } from '../../src/ui/components/InstallAction'

describe('install action readiness', () => {
    it('does not expose an install action until service-worker readiness is verified', async () => {
        render(
            <Provider store={createAppStore()}>
                <InstallAction pwaReady={false} />
            </Provider>,
        )

        await act(async () => {
            window.dispatchEvent(
                Object.assign(new Event('beforeinstallprompt'), {
                    prompt: async () => undefined,
                    userChoice: Promise.resolve({ outcome: 'accepted' as const }),
                }),
            )
            await Promise.resolve()
        })

        expect(screen.queryByRole('button', { name: /install app/i })).not.toBeInTheDocument()
    })
})
