import { useMemo, useState } from 'react'
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
const HOME_PREVIEW_PATTERN = [
    '1',
    '',
    '2',
    'flag',
    '',
    '1',
    '',
    '',
    'revealed',
    '',
    '3',
    '',
    '1',
    '',
    '2',
    '',
    '',
    '1',
    '1',
    '',
    '',
    '2',
    'flag',
    '',
    'flag',
    '',
    '',
    'revealed',
    '1',
    '',
    '',
    '1',
]

export function HomeScreen({ pwaReady = false }: { pwaReady?: boolean }) {
    const t = useTranslate()
    const dispatch = useAppDispatch()
    const store = useStore() as AppStore
    const preferences = useAppSelector((state) => state.preferences)
    const session = useAppSelector((state) => state.game.session)
    const resumable = useAppSelector((state) => state.game.resumable)
    const records = useAppSelector((state) => state.persistence)
    const selected = preferences.selectedConfig
    const selectedCustomConfig = selected.kind === 'custom' ? selected : null
    const selectedCustom = selectedCustomConfig !== null
    const [customDraftValid, setCustomDraftValid] = useState(true)
    const custom = selectedCustomConfig
        ? { rows: selectedCustomConfig.rows, columns: selectedCustomConfig.columns, mines: selectedCustomConfig.mines }
        : DEFAULT_CUSTOM
    const customConfig: GameConfig = { kind: 'custom', ...custom }
    const customValid = !selectedCustom || customDraftValid
    const best = useMemo(
        () =>
            selected.kind === 'custom'
                ? records.customRecords[`${selected.rows}x${selected.columns}:${selected.mines}`]
                : records.standardRecords[selected.kind],
        [records.customRecords, records.standardRecords, selected],
    )

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
        setCustomDraftValid(true)
        if (kind === 'custom') {
            const validated = validateConfig(customConfig)
            if (validated.ok) dispatch(setSelectedConfig(validated.value))
            return
        }
        dispatch(setSelectedConfig(PRESETS[kind]))
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
                        {Array.from(
                            { length: 40 },
                            (_, index) => HOME_PREVIEW_PATTERN[index % HOME_PREVIEW_PATTERN.length],
                        ).map((value, index) => {
                            const isFlag = value === 'flag'
                            const isRevealed = value !== '' && !isFlag
                            return (
                                <span
                                    key={`preview-${index}`}
                                    className={`preview-cell ${isFlag ? 'is-flag' : isRevealed ? 'is-revealed' : ''}`}
                                    aria-hidden="true"
                                >
                                    {isFlag ? '⚑' : value === 'revealed' ? '' : value}
                                </span>
                            )
                        })}
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
                    {selectedCustomConfig ? (
                        <CustomFields
                            key={`${selectedCustomConfig.rows}x${selectedCustomConfig.columns}:${selectedCustomConfig.mines}`}
                            config={selectedCustomConfig}
                            valid={customValid}
                            onValidityChange={setCustomDraftValid}
                            onValidConfig={(config) => dispatch(setSelectedConfig(config))}
                        />
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
                    <InstallAction pwaReady={pwaReady} />
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

type CustomConfig = Extract<GameConfig, { kind: 'custom' }>
type CustomDraft = Omit<CustomConfig, 'kind'>

function CustomFields({
    config,
    valid,
    onValidityChange,
    onValidConfig,
}: {
    config: CustomConfig
    valid: boolean
    onValidityChange: (valid: boolean) => void
    onValidConfig: (config: CustomConfig) => void
}) {
    const t = useTranslate()
    const [draft, setDraft] = useState<CustomDraft>({
        rows: config.rows,
        columns: config.columns,
        mines: config.mines,
    })

    const update = (change: Partial<CustomDraft>) => {
        const next = { ...draft, ...change }
        setDraft(next)
        const validated = validateConfig({ kind: 'custom', ...next })
        onValidityChange(validated.ok)
        if (validated.ok) onValidConfig({ kind: 'custom', ...next })
    }

    return (
        <div className="custom-panel active">
            <label className="field">
                <span>{t('home.rows')}</span>
                <input
                    aria-label={t('home.rows')}
                    type="number"
                    min="5"
                    max="30"
                    value={draft.rows}
                    onChange={(event) => update({ rows: Number(event.target.value) })}
                />
            </label>
            <label className="field">
                <span>{t('home.columns')}</span>
                <input
                    aria-label={t('home.columns')}
                    type="number"
                    min="5"
                    max="30"
                    value={draft.columns}
                    onChange={(event) => update({ columns: Number(event.target.value) })}
                />
            </label>
            <label className="field">
                <span>{t('home.mines')}</span>
                <input
                    aria-label={t('home.mines')}
                    type="number"
                    min="1"
                    value={draft.mines}
                    onChange={(event) => update({ mines: Number(event.target.value) })}
                />
            </label>
            <p className={`custom-hint ${valid ? '' : 'is-invalid'}`} role={!valid ? 'alert' : undefined}>
                {valid ? t('home.customHint') : t('home.invalidCustom')}
            </p>
        </div>
    )
}
