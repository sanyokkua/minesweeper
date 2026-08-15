import type { RootState } from '../../app/store'
import { flagsRemaining } from '../../domain/gameEngine'
import { secondsFor } from './records'

export const selectSession = (state: RootState) => state.game.session
export const selectFlagsRemaining = (state: RootState) => (state.game.session ? flagsRemaining(state.game.session) : 0)
export const selectElapsedSeconds = (state: RootState, atMs = Date.now()) => {
    const session = state.game.session
    if (!session) return 0
    const extra =
        session.status === 'playing' && state.game.lastTickAtMs !== null
            ? Math.max(0, atMs - state.game.lastTickAtMs)
            : 0
    return secondsFor(session.elapsedMs + extra)
}
export const selectGameIsActive = (state: RootState) => state.game.session?.status === 'playing'
