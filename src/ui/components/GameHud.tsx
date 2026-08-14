import { flagsRemaining } from '../../domain/gameEngine'
import type { GameSession } from '../../domain/gameTypes'
import { StatDisplay } from './StatDisplay'
import { GameFace } from './GameFace'
import { useTranslate } from '../../i18n/useTranslate'

export function GameHud({
  session,
  seconds,
  onReset,
}: {
  session: GameSession
  seconds: number
  onReset: () => void
}) {
  const t = useTranslate()
  return (
    <div className="game-hud">
      <StatDisplay label={t('game.flags')} value={flagsRemaining(session)} />
      <GameFace status={session.status} onReset={onReset} label={t('game.reset')} />
      <StatDisplay label={t('game.timer')} value={String(seconds).padStart(3, '0')} />
    </div>
  )
}
