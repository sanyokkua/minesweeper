import { registerServiceWorker } from './pwaGateway'
import type { PwaRegistration } from './pwaGateway'

let pwa: PwaRegistration | null = null
let flushBeforeUpdate: () => boolean = () => true
let started = false
export function registerPwa(
  onNotice: (message: string, action?: string) => void,
  flush?: () => boolean,
): void {
  if (typeof window === 'undefined') return
  flushBeforeUpdate = flush ?? flushBeforeUpdate
  const start = () => {
    if (started || !navigator.onLine) return
    started = true
    void registerServiceWorker({
      onUpdateReady: () => onNotice('notice.update', 'notice.updateAction'),
    }).then((registration) => {
      pwa = registration
    })
  }
  start()
  window.addEventListener('online', start)
  window.addEventListener('online', () => {
    void pwa?.update()
  })
}

export async function approvePwaUpdate(): Promise<boolean> {
  if (!pwa || !flushBeforeUpdate()) return false
  await pwa.activate()
  window.location.reload()
  return true
}
