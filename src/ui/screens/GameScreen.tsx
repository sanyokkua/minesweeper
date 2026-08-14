import { useEffect, useState } from 'react'
import { useStore } from 'react-redux'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { navigate, openSheet } from '../../app/appSlice'
import { command, newGame, pause, tick } from '../../features/game/gameSlice'
import { persistStore } from '../../features/persistence/persistenceController'
import type { AppStore } from '../../app/store'
import { finishRecord } from '../../features/persistence/persistenceSlice'
import { Board } from '../components/Board'
import { GameHud } from '../components/GameHud'
import { ActionButton } from '../components/ActionButton'
import { ModalSheet } from '../components/ModalSheet'
import { useTranslate } from '../../i18n/useTranslate'
import { secondsFor } from '../../features/game/records'

export function GameScreen() {
  const t = useTranslate()
  const dispatch = useAppDispatch()
  const store = useStore() as AppStore
  const session = useAppSelector((state) => state.game.session)
  const inputMode = useAppSelector((state) => state.preferences.inputMode)
  const lastTickAtMs = useAppSelector((state) => state.game.lastTickAtMs)
  const [now, setNow] = useState(0)
  const isPlaying = session?.status === 'playing'
  useEffect(() => {
    if (!isPlaying) return
    const timer = window.setInterval(() => {
      const atMs = Date.now()
      setNow(atMs)
      dispatch(tick({ atMs }))
      persistStore(store)
    }, 250)
    return () => window.clearInterval(timer)
  }, [dispatch, isPlaying, store])
  useEffect(() => {
    if (session?.status === 'won') {
      dispatch(
        finishRecord({ config: session.config, elapsedMs: session.elapsedMs, atMs: Date.now() }),
      )
      persistStore(store)
    } else if (session?.status === 'lost') {
      persistStore(store)
    }
  }, [dispatch, session?.status, session?.config, session?.elapsedMs, store])
  if (!session)
    return (
      <main className="screen">
        <p>{t('home.noRecord')}</p>
        <ActionButton onClick={() => dispatch(navigate('home'))}>{t('game.menu')}</ActionButton>
      </main>
    )
  const seconds = secondsFor(
    session.elapsedMs +
      (session.status === 'playing' ? Math.max(0, now - (lastTickAtMs ?? now)) : 0),
  )
  const restart = () => {
    dispatch(newGame({ config: session.config, seed: Date.now(), atMs: Date.now() }))
    dispatch(navigate('game'))
  }
  const reset = () => {
    if (session.status === 'playing') dispatch(openSheet('confirm-reset'))
    else restart()
  }
  return (
    <main className="screen game-screen">
      <div className="screen-header">
        <ActionButton
          variant="text"
          onClick={() => {
            dispatch(pause({ atMs: Date.now() }))
            dispatch(navigate('home'))
          }}
        >
          ← {t('game.back')}
        </ActionButton>
        <strong>
          {session.config.kind === 'custom'
            ? `${session.config.rows} × ${session.config.columns}`
            : t(
                `home.${session.config.kind}` as
                  'home.beginner' | 'home.intermediate' | 'home.expert',
              )}
        </strong>
        <ActionButton variant="text" onClick={() => dispatch(openSheet('settings'))}>
          {t('home.settings')}
        </ActionButton>
      </div>
      <GameHud session={session} seconds={seconds} onReset={reset} />
      <p className="game-hint">
        {inputMode === 'reveal-first' ? t('game.revealFirstHint') : t('game.flagFirstHint')}
      </p>
      <Board
        session={session}
        inputMode={inputMode}
        onCommand={(gameCommand) => dispatch(command({ command: gameCommand, atMs: Date.now() }))}
      />
      <ModalSheet
        open={session.status === 'won' || session.status === 'lost'}
        title={session.status === 'won' ? t('game.win') : t('game.loss')}
        onClose={() => dispatch(navigate('home'))}
        closeLabel={t('game.menu')}
        actions={
          <>
            <ActionButton variant="outline" onClick={() => dispatch(navigate('home'))}>
              {t('game.menu')}
            </ActionButton>
            <ActionButton onClick={restart}>{t('game.playAgain')}</ActionButton>
          </>
        }
      >
        <p>
          {t('game.timer')}: <strong>{seconds}s</strong>
        </p>
      </ModalSheet>
    </main>
  )
}
