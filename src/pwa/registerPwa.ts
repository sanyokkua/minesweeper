import { registerServiceWorker } from './pwaGateway'
import type { PwaRegistration } from './pwaGateway'

let pwa: PwaRegistration | null = null
let flushBeforeUpdate: () => boolean = () => true
let started = false
const READY_TIMEOUT_MS = 5000

async function verifyServiceWorkerReady(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) return false
    try {
        const ready = await Promise.race([
            navigator.serviceWorker.ready,
            new Promise<ServiceWorkerRegistration | null>((resolve) => {
                window.setTimeout(() => resolve(null), READY_TIMEOUT_MS)
            }),
        ])
        return ready?.active?.state === 'activated'
    } catch {
        return false
    }
}

export function registerPwa(
    onNotice: (message: string, action?: string) => void,
    flush?: () => boolean,
    onReady?: () => void,
): void {
    if (typeof window === 'undefined') return
    flushBeforeUpdate = flush ?? flushBeforeUpdate
    const start = async (): Promise<PwaRegistration | null> => {
        if (!navigator.onLine) return null
        if (started) return pwa
        started = true
        const registration = await registerServiceWorker({
            onUpdateReady: () => onNotice('notice.update', 'notice.updateAction'),
        })
        pwa = registration
        if (registration.registration) {
            void verifyServiceWorkerReady().then((ready) => {
                if (ready) onReady?.()
            })
        }
        if (!registration.registration) started = false
        return registration
    }
    void start()
    window.addEventListener('online', () => {
        void start().then((registration) => {
            if (registration?.registration) return registration.update()
        })
    })
}

export async function approvePwaUpdate(): Promise<boolean> {
    if (!pwa?.registration) return false
    try {
        if (!flushBeforeUpdate() || !pwa.registration.waiting) return false
        await pwa.activate()
        window.location.reload()
        return true
    } catch {
        return false
    }
}
