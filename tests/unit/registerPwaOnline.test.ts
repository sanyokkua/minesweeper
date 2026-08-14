import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../src/pwa/pwaGateway', () => ({
    registerServiceWorker: vi.fn(),
}))

describe('PWA online update checks', () => {
    beforeEach(() => {
        vi.resetModules()
        Object.defineProperty(navigator, 'onLine', { configurable: true, value: true })
    })

    it('checks the registered worker on every subsequent online event', async () => {
        const { registerServiceWorker } = await import('../../src/pwa/pwaGateway')
        const { registerPwa } = await import('../../src/pwa/registerPwa')
        const update = vi.fn().mockResolvedValue(undefined)
        vi.mocked(registerServiceWorker).mockResolvedValue({
            registration: {} as ServiceWorkerRegistration,
            update,
            activate: vi.fn(),
        })

        registerPwa(vi.fn())
        await vi.waitFor(() => expect(registerServiceWorker).toHaveBeenCalledOnce())

        window.dispatchEvent(new Event('online'))
        await vi.waitFor(() => expect(update).toHaveBeenCalledOnce())
        window.dispatchEvent(new Event('online'))
        await vi.waitFor(() => expect(update).toHaveBeenCalledTimes(2))

        expect(registerServiceWorker).toHaveBeenCalledOnce()
    })
})
