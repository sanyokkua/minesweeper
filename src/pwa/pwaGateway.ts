export type PwaCallbacks = { onUpdateReady: () => void; onError?: () => void }
export type PwaRegistration = {
  registration: ServiceWorkerRegistration | null
  update: () => Promise<void>
  activate: () => Promise<void>
}
export async function registerServiceWorker(callbacks: PwaCallbacks): Promise<PwaRegistration> {
  if (!('serviceWorker' in navigator))
    return { registration: null, update: async () => undefined, activate: async () => undefined }
  try {
    const registration = await navigator.serviceWorker.register(
      `${import.meta.env.BASE_URL}sw.js`,
      { scope: import.meta.env.BASE_URL },
    )
    if (registration.waiting) callbacks.onUpdateReady()
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller)
          callbacks.onUpdateReady()
      })
    })
    return {
      registration,
      update: async () => {
        await registration.update()
      },
      activate: async () => {
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' })
      },
    }
  } catch {
    callbacks.onError?.()
    return { registration: null, update: async () => undefined, activate: async () => undefined }
  }
}
