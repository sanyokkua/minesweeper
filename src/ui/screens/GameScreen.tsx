import { useEffect, useState } from 'react'
import { useStore } from 'react-redux'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { navigate, openSheet } from '../../app/appSlice'
import { command, newGame, pause } from '../../features/game/gameSlice'
import { persistStore } from '../../features/persistence/persistenceController'
import type { AppStore } from '../../app/store'
import { finishRecord, startRecord } from '../../features/persistence/persistenceSlice'
import { Board } from '../components/Board'
import { GameHud } from '../components/GameHud'
import { ActionButton } from '../components/ActionButton'
import { ModalSheet } from '../components/ModalSheet'
import { useTranslate } from '../../i18n/useTranslate'
import { selectElapsedSeconds } from '../../features/game/gameSelectors'
import { flagsUsed } from '../../domain/gameEngine'
import { IconAction } from '../components/IconAction'
import { setAppearance } from '../../features/preferences/preferencesSlice'

export function GameScreen() {
    const t = useTranslate()
    const dispatch = useAppDispatch()
    const store = useStore() as AppStore
    const session = useAppSelector((state) => state.game.session)
    const inputMode = useAppSelector((state) => state.preferences.inputMode)
    const appearance = useAppSelector((state) => state.preferences.appearance)
    const seconds = useAppSelector((state) => selectElapsedSeconds(state, Date.now()))
    const terminalSessionKey =
        session && (session.status === 'won' || session.status === 'lost') ? `${session.seed}:${session.status}` : null
    const [dismissedTerminalKey, setDismissedTerminalKey] = useState<string | null>(null)

    useEffect(() => {
        if (session?.status === 'won') {
            dispatch(finishRecord({ config: session.config, elapsedMs: session.elapsedMs, atMs: Date.now() }))
            persistStore(store)
        } else if (session?.status === 'lost') {
            persistStore(store)
        }
    }, [dispatch, session?.config, session?.elapsedMs, session?.status, store])

    if (!session)
        return (
            <main className="screen empty-screen">
                <p>{t('home.noRecord')}</p>
                <ActionButton onClick={() => dispatch(navigate('home'))}>{t('game.menu')}</ActionButton>
            </main>
        )

    const restart = () => {
        const atMs = Date.now()
        dispatch(newGame({ config: session.config, seed: atMs, atMs }))
        dispatch(startRecord({ config: session.config, atMs }))
        persistStore(store)
        dispatch(navigate('game'))
    }
    const reset = () => {
        if (session.status === 'playing') dispatch(openSheet('confirm-reset-game'))
        else restart()
    }

    return (
        <main className="screen game-screen">
            <div className="topbar">
                <IconAction
                    label={t('game.back')}
                    onClick={() => {
                        dispatch(pause({ atMs: Date.now() }))
                        persistStore(store)
                        dispatch(navigate('home'))
                    }}
                >
                    ←
                </IconAction>
                <span className="diff-chip">
                    {session.config.kind === 'custom'
                        ? `${session.config.rows} × ${session.config.columns}`
                        : t(`home.${session.config.kind}` as 'home.beginner' | 'home.intermediate' | 'home.expert')}
                </span>
                <span className="topbar__spacer" />
                <IconAction
                    label={t('game.toggleTheme')}
                    onClick={() =>
                        dispatch(setAppearance(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'))
                    }
                >
                    {appearance === 'dark' ? '☀' : '☾'}
                </IconAction>
                <IconAction label={t('home.settings')} onClick={() => dispatch(openSheet('settings'))}>
                    ⚙
                </IconAction>
            </div>
            <div className="game-body">
                <GameHud session={session} seconds={seconds} onReset={reset} />
                <p className="game-hint">
                    <span>{inputMode === 'reveal-first' ? t('game.revealFirstHint') : t('game.flagFirstHint')}</span>
                    <span className="hint-keys">
                        <kbd>{t('game.tap')}</kbd>
                        <kbd>{t('game.hold')}</kbd>
                        <kbd>{t('game.rightClick')}</kbd>
                        <kbd>F</kbd> {t('game.keyboardFlag')}
                    </span>
                </p>
                <Board
                    session={session}
                    inputMode={inputMode}
                    onCommand={(gameCommand) => dispatch(command({ command: gameCommand, atMs: Date.now() }))}
                />
            </div>
            <ModalSheet
                open={terminalSessionKey !== null && dismissedTerminalKey !== terminalSessionKey}
                title={session.status === 'won' ? t('game.win') : t('game.loss')}
                onClose={() => {
                    if (terminalSessionKey) setDismissedTerminalKey(terminalSessionKey)
                }}
                closeLabel={t('game.closeOutcome')}
                className={session.status === 'won' ? 'outcome-sheet outcome-sheet--win' : 'outcome-sheet'}
                actions={
                    <>
                        <ActionButton variant="outline" onClick={() => dispatch(navigate('home'))}>
                            {t('game.menu')}
                        </ActionButton>
                        <ActionButton onClick={restart}>{t('game.playAgain')}</ActionButton>
                    </>
                }
            >
                <div className="outcome-icon" aria-hidden="true">
                    {session.status === 'won' ? '😎' : '😵'}
                </div>
                <p className="outcome-description">
                    {session.status === 'won' ? t('game.outcomeWin') : t('game.outcomeLoss')}
                </p>
                <div className="outcome-stats">
                    <div className="outcome-stat">
                        <strong>{seconds}s</strong>
                        <span>{t('game.timer')}</span>
                    </div>
                    <div className="outcome-stat">
                        <strong>{flagsUsed(session)}</strong>
                        <span>{t('game.flagsPlaced')}</span>
                    </div>
                    <div className="outcome-stat">
                        <strong>{session.config.mines}</strong>
                        <span>{t('game.flagsTotal')}</span>
                    </div>
                </div>
            </ModalSheet>
        </main>
    )
}
