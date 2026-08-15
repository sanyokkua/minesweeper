type InstallEvent = Event & {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type InstallAvailability = 'prompt' | 'manual' | 'none'

let deferred: InstallEvent | null = null
const listeners = new Set<() => void>()
let initialized = false
let installed = false

function notify() {
    listeners.forEach((listener) => listener())
}

function handleBeforeInstallPrompt(event: Event) {
    event.preventDefault()
    deferred = event as InstallEvent
    notify()
}

function handleInstalled() {
    deferred = null
    installed = true
    notify()
}

export function initializeInstallGateway(): void {
    if (initialized || typeof window === 'undefined') return
    initialized = true
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)
}

function isAndroidBrowser(): boolean {
    if (typeof navigator === 'undefined') return false
    const userAgent = navigator.userAgent ?? ''
    const userAgentData = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData
    const platform = userAgentData?.platform ?? ''
    return /android/i.test(`${userAgent} ${platform}`)
}

function isStandalone(): boolean {
    if (typeof window === 'undefined') return false
    return (
        window.matchMedia?.('(display-mode: standalone)').matches === true ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true
    )
}

initializeInstallGateway()

export function listenForInstallPrompt(listener: () => void): () => void {
    initializeInstallGateway()
    listeners.add(listener)
    return () => listeners.delete(listener)
}

export function getInstallPrompt(): InstallEvent | null {
    return deferred
}

export function getInstallAvailability(serviceWorkerReady = true): InstallAvailability {
    if (!serviceWorkerReady) return 'none'
    if (installed || isStandalone()) return 'none'
    if (deferred) return 'prompt'
    return isAndroidBrowser() ? 'manual' : 'none'
}

export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    if (!deferred) return 'unavailable'
    const event = deferred
    deferred = null
    notify()
    await event.prompt()
    const outcome = (await event.userChoice).outcome
    notify()
    return outcome
}
