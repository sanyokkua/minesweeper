export type PwaCallbacks = { onUpdateReady: () => void; onError?: () => void }
export type PwaRegistration = {
    registration: ServiceWorkerRegistration | null
    update: () => Promise<void>
    activate: () => Promise<void>
}

const ACTIVATION_TIMEOUT_MS = 5000

export async function registerServiceWorker(callbacks: PwaCallbacks): Promise<PwaRegistration> {
    if (!('serviceWorker' in navigator))
        return { registration: null, update: async () => undefined, activate: async () => undefined }
    try {
        const registration = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
            scope: import.meta.env.BASE_URL,
        })
        let updateReported = false
        const reportUpdate = () => {
            if (updateReported) return
            updateReported = true
            callbacks.onUpdateReady()
        }
        if (registration.waiting) reportUpdate()
        registration.addEventListener('updatefound', () => {
            const worker = registration.installing
            worker?.addEventListener('statechange', () => {
                if (worker.state === 'installed' && navigator.serviceWorker.controller) reportUpdate()
            })
        })
        return {
            registration,
            update: async () => {
                await registration.update()
            },
            activate: async () => {
                const waiting = registration.waiting
                if (!waiting) throw new Error('No waiting service worker is available')
                await new Promise<void>((resolve, reject) => {
                    let settled = false
                    const settle = (error?: Error) => {
                        if (settled) return
                        settled = true
                        window.clearTimeout(timeout)
                        navigator.serviceWorker.removeEventListener?.('controllerchange', onControllerChange)
                        waiting.removeEventListener?.('statechange', onStateChange)
                        if (error) reject(error)
                        else resolve()
                    }
                    const onControllerChange = () => settle()
                    const onStateChange = () => {
                        if (waiting.state === 'redundant') settle(new Error('Service worker activation failed'))
                    }
                    const timeout = window.setTimeout(
                        () => settle(new Error('Timed out waiting for service worker activation')),
                        ACTIVATION_TIMEOUT_MS,
                    )
                    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)
                    waiting.addEventListener('statechange', onStateChange)
                    try {
                        waiting.postMessage({ type: 'SKIP_WAITING' })
                    } catch (error) {
                        settle(error instanceof Error ? error : new Error('Service worker activation failed'))
                    }
                })
            },
        }
    } catch {
        callbacks.onError?.()
        return { registration: null, update: async () => undefined, activate: async () => undefined }
    }
}
