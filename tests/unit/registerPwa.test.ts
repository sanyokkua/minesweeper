import { approvePwaUpdate, registerPwa } from '../../src/pwa/registerPwa'
import { registerServiceWorker } from '../../src/pwa/pwaGateway'

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
})
