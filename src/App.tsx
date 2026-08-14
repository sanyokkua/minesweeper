import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from './app/hooks'
import { useStore } from 'react-redux'
import type { AppStore } from './app/store'
import { addNotice, dismissNotice, navigate, setDocumentVisible } from './app/appSlice'
import { pause, resume } from './features/game/gameSlice'
import { hydrateStore, persistStore } from './features/persistence/persistenceController'
import { applyTheme, watchSystemTheme } from './app/themeController'
import { HomeScreen } from './ui/screens/HomeScreen'
import { GameScreen } from './ui/screens/GameScreen'
import { AppSheets } from './ui/components/AppSheets'
import { ActionButton } from './ui/components/ActionButton'
import { approvePwaUpdate, registerPwa } from './pwa/registerPwa'
import { useTranslate } from './i18n/useTranslate'
import './ui/styles/global.css'
import './ui/styles/layout.css'
import './ui/styles/components.css'
import './ui/styles/board.css'

export function App() {
  const dispatch = useAppDispatch()
  const store = useStore() as AppStore
  const t = useTranslate()
  const booted = useRef(false)
  const route = useAppSelector((state) => state.app.route)
  const blockingSheet = useAppSelector((state) => state.app.blockingSheet)
  const sessionStatus = useAppSelector((state) => state.game.session?.status)
  const hydrated = useAppSelector((state) => state.persistence.hydrated)
  const notices = useAppSelector((state) => state.app.notices)
  const appearance = useAppSelector((state) => state.preferences.appearance)
  const inputMode = useAppSelector((state) => state.preferences.inputMode)
  const locale = useAppSelector((state) => state.preferences.locale)
  useEffect(() => {
    if (!booted.current) {
      booted.current = true
      hydrateStore(store)
      registerPwa(
        (message, action) => dispatch(addNotice({ id: 'update-ready', message, action })),
        () => persistStore(store),
      )
    }
  }, [dispatch, store])
  useEffect(() => {
    applyTheme(appearance)
    return watchSystemTheme(appearance, (theme) => {
      document.documentElement.dataset.theme = theme
    })
  }, [appearance])
  useEffect(() => {
    document.documentElement.lang = locale
    const handler = () => {
      const visible = document.visibilityState === 'visible'
      dispatch(setDocumentVisible(visible))
      dispatch(visible ? resume({ atMs: Date.now() }) : pause({ atMs: Date.now() }))
      if (!visible) persistStore(store)
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [dispatch, locale, store])
  useEffect(() => {
    if (hydrated) persistStore(store)
  }, [appearance, hydrated, inputMode, locale, store])
  useEffect(() => {
    if (route !== 'game' || sessionStatus !== 'playing') return
    dispatch(blockingSheet ? pause({ atMs: Date.now() }) : resume({ atMs: Date.now() }))
  }, [blockingSheet, dispatch, route, sessionStatus])
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">✹</span>
          <strong>{t('home.title')}</strong>
        </div>
        {route === 'game' ? (
          <ActionButton variant="text" onClick={() => dispatch(navigate('home'))}>
            {t('game.menu')}
          </ActionButton>
        ) : null}
      </header>
      {route === 'home' ? <HomeScreen /> : <GameScreen />}
      <AppSheets />
      <div className="notices" aria-live="polite">
        {notices.map((notice) => (
          <div className="notice" key={notice.id}>
            <span>{t(notice.message as Parameters<typeof t>[0])}</span>
            <ActionButton
              variant="text"
              onClick={() => {
                if (notice.action === 'notice.updateAction') void approvePwaUpdate()
                dispatch(dismissNotice(notice.id))
              }}
            >
              {notice.action ? t(notice.action as Parameters<typeof t>[0]) : t('common.dismiss')}
            </ActionButton>
          </div>
        ))}
      </div>
    </div>
  )
}
