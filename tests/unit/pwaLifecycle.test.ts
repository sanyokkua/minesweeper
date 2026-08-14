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
        expect((worker as ServiceWorker & { postMessage?: ReturnType<typeof vi.fn> }).postMessage).toBeUndefined()
    })

    it('waits for controller change before activation resolves', async () => {
        const onUpdateReady = vi.fn()
        let onControllerChange: (() => void) | undefined
        const waiting = { postMessage: vi.fn(), addEventListener: vi.fn() } as unknown as ServiceWorker
        const registration = {
            waiting,
            addEventListener: vi.fn(),
        } as unknown as ServiceWorkerRegistration
        Object.defineProperty(navigator, 'serviceWorker', {
            configurable: true,
            value: {
                register: vi.fn().mockResolvedValue(registration),
                controller: {},
                addEventListener: (_type: string, listener: () => void) => {
                    onControllerChange = listener
                },
                removeEventListener: vi.fn(),
            },
        })

        const pwa = await registerServiceWorker({ onUpdateReady })
        let resolved = false
        const activation = pwa.activate().then(() => {
            resolved = true
        })

        expect(waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' })
        await Promise.resolve()
        expect(resolved).toBe(false)

        onControllerChange?.()
        await activation
        expect(resolved).toBe(true)
    })

    it('rejects activation when the waiting worker cannot be instructed', async () => {
        const waiting = {
            postMessage: vi.fn(() => {
                throw new Error('worker unavailable')
            }),
            addEventListener: vi.fn(),
        } as unknown as ServiceWorker
        const registration = { waiting, addEventListener: vi.fn() } as unknown as ServiceWorkerRegistration
        Object.defineProperty(navigator, 'serviceWorker', {
            configurable: true,
            value: {
                register: vi.fn().mockResolvedValue(registration),
                controller: {},
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            },
        })

        const pwa = await registerServiceWorker({ onUpdateReady: vi.fn() })
        await expect(pwa.activate()).rejects.toThrow('worker unavailable')
    })
})
