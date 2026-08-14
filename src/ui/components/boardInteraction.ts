export const LONG_PRESS_MS = 600
export const MOVE_CANCEL_PX = 10
export type PointerSession = {
  startX: number
  startY: number
  longPressCompleted: boolean
  timer: ReturnType<typeof setTimeout> | null
}

export function createPointerSession(
  startX: number,
  startY: number,
  onLongPress: () => void,
): PointerSession {
  const session: PointerSession = { startX, startY, longPressCompleted: false, timer: null }
  session.timer = setTimeout(() => {
    session.longPressCompleted = true
    onLongPress()
  }, LONG_PRESS_MS)
  return session
}
export function cancelPointerSession(session: PointerSession | null): void {
  if (session?.timer) clearTimeout(session.timer)
  if (session) session.timer = null
}
export function shouldCancelForMovement(session: PointerSession, x: number, y: number): boolean {
  return Math.hypot(x - session.startX, y - session.startY) >= MOVE_CANCEL_PX
}
