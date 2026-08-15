import { useEffect, useMemo, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from './app/hooks'
import { useStore } from 'react-redux'
import type { AppStore } from './app/store'
import { addNotice, dismissNotice, setDocumentVisible } from './app/appSlice'
import { pause, resume } from './features/game/gameSlice'
import { clockEligible, startClock } from './features/game/gameClock'
import { hydrateStore, persistStore } from './features/persistence/persistenceController'
import { createStorageGateway, type StorageGateway } from './features/persistence/storageGateway'
import { applyTheme, watchSystemTheme } from './app/themeController'
import { HomeScreen } from './ui/screens/HomeScreen'
import { GameScreen } from './ui/screens/GameScreen'
import { AppSheets } from './ui/components/AppSheets'
import { ActionButton } from './ui/components/ActionButton'
import { approvePwaUpdate, registerPwa } from './pwa/registerPwa'
import { useTranslate } from './i18n/useTranslate'
import { BuildStamp } from './ui/components/BuildStamp'
import './ui/styles/global.css'
import './ui/styles/layout.css'
import './ui/styles/components.css'
import './ui/styles/board.css'

type AppProps = {
    storageGateway?: StorageGateway
}

export function App({ storageGateway: configuredStorageGateway }: AppProps = {}) {
    const dispatch = useAppDispatch()
    const store = useStore() as AppStore
    const t = useTranslate()
    const booted = useRef(false)
    const [pwaReady, setPwaReady] = useState(false)
    const storageGateway = useMemo(() => configuredStorageGateway ?? createStorageGateway(), [configuredStorageGateway])
    const lifecycleRef = useRef({ boundaryHandled: false, persisting: false, handlingEvent: false })
    const route = useAppSelector((state) => state.app.route)
    const blockingSheet = useAppSelector((state) => state.app.blockingSheet)
    const documentVisible = useAppSelector((state) => state.app.documentVisible)
    const sessionStatus = useAppSelector((state) => state.game.session?.status)
    const hydrated = useAppSelector((state) => state.persistence.hydrated)
    const notices = useAppSelector((state) => state.app.notices)
    const appearance = useAppSelector((state) => state.preferences.appearance)
    const inputMode = useAppSelector((state) => state.preferences.inputMode)
    const locale = useAppSelector((state) => state.preferences.locale)
    const selectedConfig = useAppSelector((state) => state.preferences.selectedConfig)
    useEffect(() => {
        if (!booted.current) {
            booted.current = true
            hydrateStore(store, storageGateway)
            registerPwa(
                (message, action) => dispatch(addNotice({ id: 'update-ready', message, action })),
                () => persistStore(store, storageGateway),
                () => setPwaReady(true),
            )
        }
    }, [dispatch, storageGateway, store])
    useEffect(() => {
        applyTheme(appearance)
        return watchSystemTheme(appearance, (theme) => {
            document.documentElement.dataset.theme = theme
        })
    }, [appearance])
    useEffect(
        () =>
            startClock(dispatch, () => {
                const state = store.getState()
                return clockEligible({
                    status: state.game.session?.status,
                    route: state.app.route,
                    documentVisible: state.app.documentVisible,
                    blockingSheet: state.app.blockingSheet,
                })
            }),
        [dispatch, store],
    )
    useEffect(() => {
        document.documentElement.lang = locale
    }, [locale])
    useEffect(() => {
        const pauseAndPersist = (atMs: number) => {
            if (lifecycleRef.current.boundaryHandled) return
            lifecycleRef.current.boundaryHandled = true
            dispatch(pause({ atMs }))
            if (lifecycleRef.current.persisting) return
            lifecycleRef.current.persisting = true
            try {
                persistStore(store, storageGateway)
            } finally {
                lifecycleRef.current.persisting = false
            }
        }
        const handler = () => {
            if (lifecycleRef.current.handlingEvent) return
            lifecycleRef.current.handlingEvent = true
            try {
                const visible = document.visibilityState === 'visible'
                if (store.getState().app.documentVisible !== visible) dispatch(setDocumentVisible(visible))
                if (visible) {
                    lifecycleRef.current.boundaryHandled = false
                    if (store.getState().game.session?.status === 'playing') dispatch(resume({ atMs: Date.now() }))
                } else {
                    pauseAndPersist(Date.now())
                }
            } finally {
                lifecycleRef.current.handlingEvent = false
            }
        }
        document.addEventListener('visibilitychange', handler)
        const pagehide = () => {
            if (lifecycleRef.current.handlingEvent) return
            lifecycleRef.current.handlingEvent = true
            try {
                pauseAndPersist(Date.now())
            } finally {
                lifecycleRef.current.handlingEvent = false
            }
        }
        window.addEventListener('pagehide', pagehide)
        return () => {
            document.removeEventListener('visibilitychange', handler)
            window.removeEventListener('pagehide', pagehide)
        }
    }, [dispatch, storageGateway, store])
    useEffect(() => {
        if (hydrated) persistStore(store, storageGateway)
    }, [appearance, hydrated, inputMode, locale, selectedConfig, storageGateway, store])
    useEffect(() => {
        if (sessionStatus !== 'playing') return
        const eligible = route === 'game' && documentVisible && blockingSheet === null
        const atMs = Date.now()
        if (eligible) {
            dispatch(resume({ atMs }))
        } else {
            dispatch(pause({ atMs }))
            if (blockingSheet !== null && hydrated) persistStore(store, storageGateway)
        }
    }, [blockingSheet, dispatch, documentVisible, hydrated, route, sessionStatus, storageGateway, store])
    return (
        <div className="app-shell">
            {route === 'home' ? <HomeScreen pwaReady={pwaReady} /> : <GameScreen />}
            <AppSheets />
            <BuildStamp />
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
                        {notice.action ? (
                            <ActionButton variant="text" onClick={() => dispatch(dismissNotice(notice.id))}>
                                {t('common.dismiss')}
                            </ActionButton>
                        ) : null}
                    </div>
                ))}
            </div>
        </div>
    )
}
