import { approvePwaUpdate, registerPwa } from '../../src/pwa/registerPwa'
import { registerServiceWorker } from '../../src/pwa/pwaGateway'
import { getInstallPrompt } from '../../src/pwa/installGateway'

vi.mock('../../src/pwa/pwaGateway', () => ({
    registerServiceWorker: vi.fn(),
}))

describe('PWA registration coordinator', () => {
    it('refuses to activate a waiting update when the active session cannot flush', async () => {
        const activate = vi.fn()
        vi.mocked(registerServiceWorker).mockResolvedValue({
            registration: null,
            update: vi.fn(),
            activate,
        })
        Object.defineProperty(navigator, 'onLine', { configurable: true, value: true })

        registerPwa(vi.fn(), () => false)
        await vi.waitFor(() => expect(registerServiceWorker).toHaveBeenCalled())

        await expect(approvePwaUpdate()).resolves.toBe(false)
        expect(activate).not.toHaveBeenCalled()
    })

    it('captures a real install prompt before the UI subscribes and clears after installation', () => {
        const event = Object.assign(new Event('beforeinstallprompt'), {
            prompt: vi.fn(async () => undefined),
            userChoice: Promise.resolve({ outcome: 'accepted' as const }),
        })

        window.dispatchEvent(event)
        expect(getInstallPrompt()).not.toBeNull()

        window.dispatchEvent(new Event('appinstalled'))
        expect(getInstallPrompt()).toBeNull()
    })

    it('does not reload when activation fails after an update is ready', async () => {
        const activate = vi.fn().mockRejectedValue(new Error('activation failed'))
        vi.mocked(registerServiceWorker).mockResolvedValue({
            registration: { waiting: {} } as ServiceWorkerRegistration,
            update: vi.fn(),
            activate,
        })
        Object.defineProperty(navigator, 'onLine', { configurable: true, value: true })

        registerPwa(vi.fn(), () => true)
        await vi.waitFor(() => expect(registerServiceWorker).toHaveBeenCalled())

        await expect(approvePwaUpdate()).resolves.toBe(false)
        expect(activate).toHaveBeenCalledOnce()
    })
})
