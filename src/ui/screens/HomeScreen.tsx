import { useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { navigate, openSheet } from '../../app/appSlice'
import { newGame } from '../../features/game/gameSlice'
import { startRecord } from '../../features/persistence/persistenceSlice'
import { PRESETS, validateConfig } from '../../domain/config'
import type { GameConfig, PresetKind } from '../../domain/gameTypes'
import { SelectableOption } from '../components/SelectableOption'
import { ActionButton } from '../components/ActionButton'
import { useTranslate } from '../../i18n/useTranslate'
import { InstallAction } from '../components/InstallAction'
import { setAppearance, setSelectedConfig } from '../../features/preferences/preferencesSlice'
import { IconAction } from '../components/IconAction'
import { useStore } from 'react-redux'
import type { AppStore } from '../../app/store'
import { persistStore } from '../../features/persistence/persistenceController'

function seed(): number {
    const values = new Uint32Array(1)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(values)
    return values[0] || Date.now() >>> 0
}

const DEFAULT_CUSTOM = { rows: 10, columns: 10, mines: 15 }

export function HomeScreen() {
    const t = useTranslate()
    const dispatch = useAppDispatch()
    const store = useStore() as AppStore
    const preferences = useAppSelector((state) => state.preferences)
    const session = useAppSelector((state) => state.game.session)
    const resumable = useAppSelector((state) => state.game.resumable)
    const records = useAppSelector((state) => state.persistence)
    const selected = preferences.selectedConfig
    const selectedCustom = selected.kind === 'custom'
    const custom = selectedCustom
        ? { rows: selected.rows, columns: selected.columns, mines: selected.mines }
        : DEFAULT_CUSTOM
    const customConfig: GameConfig = { kind: 'custom', ...custom }
    const customValid = validateConfig(customConfig).ok
    const best = useMemo(
        () =>
            selected.kind === 'custom'
                ? records.customRecords[`${selected.rows}x${selected.columns}:${selected.mines}`]
                : records.standardRecords[selected.kind],
        [records.customRecords, records.standardRecords, selected],
    )

    const updateCustom = (change: Partial<typeof custom>) => {
        const next = { ...custom, ...change }
        dispatch(setSelectedConfig({ kind: 'custom', ...next }))
    }

    const start = () => {
        if (selectedCustom && !customValid) return
        const nextConfig = selected
        if (session && resumable) {
            dispatch(openSheet('confirm-replace'))
            return
        }
        const atMs = Date.now()
        dispatch(newGame({ config: nextConfig, seed: seed(), atMs }))
        dispatch(startRecord({ config: nextConfig, atMs }))
        persistStore(store)
        dispatch(navigate('game'))
    }

    const choosePreset = (kind: PresetKind | 'custom') => {
        const next = kind === 'custom' ? customConfig : PRESETS[kind]
        dispatch(setSelectedConfig(next))
    }

    return (
        <main className="screen home-screen">
            <div className="topbar">
                <div className="topbar__title">
                    <span className="pixel-dot" aria-hidden="true" />
                    <span>{t('home.title')}</span>
                </div>
                <span className="topbar__spacer" />
                <IconAction
                    label={t('home.toggleTheme')}
                    onClick={() =>
                        dispatch(setAppearance(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'))
                    }
                >
                    {preferences.appearance === 'dark' ? '☀' : '☾'}
                </IconAction>
                <IconAction label={t('home.settings')} onClick={() => dispatch(openSheet('settings'))}>
                    ⚙
                </IconAction>
            </div>
            <div className="home-scroll">
                <div className="hero">
                    <span className="badge">
                        <span className="live-dot" aria-hidden="true" />
                        {t('home.badge')}
                    </span>
                    <h1 className="wordmark">{t('home.title')}</h1>
                    <p>{t('home.subtitle')}</p>
                    <div className="mini-preview" aria-label={t('home.preview')}>
                        {['', '1', '', '⚑', '2', '', '1', '✹', '', ''].map((value, index) => (
                            <span
                                key={`${value}-${index}`}
                                className={`preview-cell ${value === '⚑' ? 'is-flag' : value ? 'is-revealed' : ''}`}
                                aria-hidden="true"
                            >
                                {value}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="container">
                    <section aria-labelledby="difficulty-heading">
                        <p className="section-label" id="difficulty-heading">
                            {t('home.difficulty')}
                        </p>
                        <div className="diff-grid" role="radiogroup" aria-label={t('home.difficulty')}>
                            {(['beginner', 'intermediate', 'expert', 'custom'] as const).map((kind) => {
                                const item = kind === 'custom' ? customConfig : PRESETS[kind]
                                const title =
                                    kind === 'custom'
                                        ? t('home.custom')
                                        : t(`home.${kind}` as 'home.beginner' | 'home.intermediate' | 'home.expert')
                                const itemBest =
                                    kind === 'custom'
                                        ? records.customRecords[`${item.rows}x${item.columns}:${item.mines}`]
                                        : records.standardRecords[kind]
                                return (
                                    <SelectableOption
                                        key={kind}
                                        className="diff-card"
                                        selected={selected.kind === kind}
                                        onSelect={() => choosePreset(kind)}
                                    >
                                        <span className="diff-card__name">
                                            <strong>{title}</strong>
                                            <span className="radio" aria-hidden="true" />
                                        </span>
                                        <span className="diff-card__meta">
                                            {kind === 'custom'
                                                ? t('home.customSetYourOwn')
                                                : `${item.rows} × ${item.columns} · ${item.mines} ${t('home.mines').toLowerCase()}`}
                                        </span>
                                        {itemBest && itemBest.bestSeconds !== Number.MAX_SAFE_INTEGER ? (
                                            <span className="diff-card__best">
                                                {t('home.best', { value: `${itemBest.bestSeconds}s` })}
                                            </span>
                                        ) : null}
                                    </SelectableOption>
                                )
                            })}
                        </div>
                    </section>
                    {selectedCustom ? (
                        <div className="custom-panel active">
                            <label className="field">
                                <span>{t('home.rows')}</span>
                                <input
                                    aria-label={t('home.rows')}
                                    type="number"
                                    min="5"
                                    max="30"
                                    value={custom.rows}
                                    onChange={(event) => updateCustom({ rows: Number(event.target.value) })}
                                />
                            </label>
                            <label className="field">
                                <span>{t('home.columns')}</span>
                                <input
                                    aria-label={t('home.columns')}
                                    type="number"
                                    min="5"
                                    max="30"
                                    value={custom.columns}
                                    onChange={(event) => updateCustom({ columns: Number(event.target.value) })}
                                />
                            </label>
                            <label className="field">
                                <span>{t('home.mines')}</span>
                                <input
                                    aria-label={t('home.mines')}
                                    type="number"
                                    min="1"
                                    value={custom.mines}
                                    onChange={(event) => updateCustom({ mines: Number(event.target.value) })}
                                />
                            </label>
                            <p
                                className={`custom-hint ${customValid ? '' : 'is-invalid'}`}
                                role={!customValid ? 'alert' : undefined}
                            >
                                {customValid ? t('home.customHint') : t('home.invalidCustom')}
                            </p>
                        </div>
                    ) : null}
                    <div className="cta-row">
                        <ActionButton onClick={start} disabled={selectedCustom && !customValid}>
                            {session && resumable ? t('home.newGame') : t('home.play')}
                        </ActionButton>
                        <ActionButton variant="outline" onClick={() => dispatch(openSheet('help'))}>
                            {t('home.help')}
                        </ActionButton>
                        {session && resumable ? (
                            <ActionButton variant="outline" onClick={() => dispatch(navigate('game'))}>
                                {t('home.resume')}
                            </ActionButton>
                        ) : null}
                    </div>
                    <p className="record-summary">
                        {best && best.bestSeconds !== Number.MAX_SAFE_INTEGER
                            ? t('home.best', { value: `${best.bestSeconds}s` })
                            : t('home.noRecord')}
                    </p>
                    <InstallAction />
                    <div className="footlinks">
                        <button type="button" onClick={() => dispatch(openSheet('settings'))}>
                            {t('home.settings')}
                        </button>
                        <a href="https://github.com/sanyokkua/minesweeper" target="_blank" rel="noreferrer">
                            {t('home.source')}
                        </a>
                    </div>
                </div>
            </div>
        </main>
    )
}
