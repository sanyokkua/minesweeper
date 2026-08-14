import type { AppDispatch } from '../../app/store'
import { tick } from './gameSlice'
import type { BlockingSheet, Route } from '../../app/appSlice'

export function clockEligible(input: {
  status?: string
  route: Route
  documentVisible: boolean
  blockingSheet: BlockingSheet
}): boolean {
  return (
    input.status === 'playing' &&
    input.route === 'game' &&
    input.documentVisible &&
    input.blockingSheet === null
  )
}

export function startClock(
  dispatch: AppDispatch,
  isEligible: () => boolean,
  intervalMs = 250,
): () => void {
  const handle = window.setInterval(() => {
    if (isEligible()) dispatch(tick({ atMs: Date.now() }))
  }, intervalMs)
  return () => window.clearInterval(handle)
}
