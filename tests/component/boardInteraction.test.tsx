import { act } from '@testing-library/react'
import {
  cancelPointerSession,
  createPointerSession,
  MOVE_CANCEL_PX,
  shouldCancelForMovement,
} from '../../src/ui/components/boardInteraction'
describe('board interaction adapter', () => {
  it('fires secondary after 600ms and cancels on movement', () => {
    vi.useFakeTimers()
    const secondary = vi.fn()
    const session = createPointerSession(0, 0, secondary)
    expect(shouldCancelForMovement(session, MOVE_CANCEL_PX, 0)).toBe(true)
    act(() => {
      vi.advanceTimersByTime(600)
    })
    expect(secondary).toHaveBeenCalledOnce()
    cancelPointerSession(session)
    vi.useRealTimers()
  })
})
