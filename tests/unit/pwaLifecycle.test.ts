import { registerServiceWorker } from '../../src/pwa/pwaGateway'

describe('PWA lifecycle gateway', () => {
  it('registers the production worker at the base path and reports an existing update once', async () => {
    const onUpdateReady = vi.fn()
    const registration = {
      waiting: { postMessage: vi.fn() },
      installing: null,
      addEventListener: vi.fn(),
      update: vi.fn(),
    } as unknown as ServiceWorkerRegistration
    const register = vi.fn().mockResolvedValue(registration)
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { register, controller: {} },
    })

    await registerServiceWorker({ onUpdateReady })

    expect(register).toHaveBeenCalledWith('/sw.js', { scope: '/' })
    expect(onUpdateReady).toHaveBeenCalledOnce()
  })

  it('does not duplicate Update ready when a waiting worker is also observed during updatefound', async () => {
    const onUpdateReady = vi.fn()
    let onUpdateFound: (() => void) | undefined
    let onStateChange: (() => void) | undefined
    const worker = {
      state: 'installed',
      addEventListener: (_type: string, listener: () => void) => {
        onStateChange = listener
      },
    } as unknown as ServiceWorker
    const registration = {
      waiting: worker,
      installing: worker,
      addEventListener: (_type: string, listener: () => void) => {
        onUpdateFound = listener
      },
    } as unknown as ServiceWorkerRegistration
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { register: vi.fn().mockResolvedValue(registration), controller: {} },
    })

    await registerServiceWorker({ onUpdateReady })
    onUpdateFound?.()
    onStateChange?.()

    expect(onUpdateReady).toHaveBeenCalledOnce()
  })
})
