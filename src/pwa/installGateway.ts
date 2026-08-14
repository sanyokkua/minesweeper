type InstallEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}
let deferred: InstallEvent | null = null
const listeners = new Set<() => void>()
export function listenForInstallPrompt(listener: () => void): () => void {
  listeners.add(listener)
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferred = event as InstallEvent
    listeners.forEach((notify) => notify())
  })
  return () => listeners.delete(listener)
}
export function getInstallPrompt(): InstallEvent | null {
  return deferred
}
export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferred) return 'unavailable'
  const event = deferred
  deferred = null
  await event.prompt()
  return (await event.userChoice).outcome
}
