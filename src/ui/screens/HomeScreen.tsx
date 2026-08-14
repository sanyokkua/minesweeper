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
import { setSelectedConfig } from '../../features/preferences/preferencesSlice'

function seed(): number {
  const values = new Uint32Array(1)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(values)
  return values[0] || Date.now() >>> 0
}

export function HomeScreen() {
  const t = useTranslate()
  const dispatch = useAppDispatch()
  const preferences = useAppSelector((state) => state.preferences)
  const session = useAppSelector((state) => state.game.session)
  const resumable = useAppSelector((state) => state.game.resumable)
  const records = useAppSelector((state) => state.persistence)
  const [custom, setCustom] = useState({ rows: 10, columns: 10, mines: 15 })
  const selected = preferences.selectedConfig
  const customValid = validateConfig({ kind: 'custom', ...custom }).ok
  const selectedCustom = selected.kind === 'custom'
  const config = selectedCustom ? selected : selected
  const updateCustom = (change: Partial<typeof custom>) => {
    const next = { ...custom, ...change }
    setCustom(next)
    dispatch(setSelectedConfig({ kind: 'custom', ...next }))
  }
  const best = useMemo(
    () =>
      config.kind === 'custom'
        ? records.customRecords[`${config.rows}x${config.columns}:${config.mines}`]
        : records.standardRecords[config.kind],
    [config, records.customRecords, records.standardRecords],
  )
  const start = () => {
    if (!customValid && selectedCustom) return
    const nextConfig: GameConfig = selectedCustom ? { kind: 'custom', ...custom } : config
    if (session && resumable) {
      dispatch(openSheet('confirm-replace'))
      return
    }
    dispatch(newGame({ config: nextConfig, seed: seed(), atMs: Date.now() }))
    dispatch(startRecord({ config: nextConfig, atMs: Date.now() }))
    dispatch(navigate('game'))
  }
  const choosePreset = (kind: PresetKind | 'custom') => {
    const next = kind === 'custom' ? { kind: 'custom' as const, ...custom } : PRESETS[kind]
    dispatch(setSelectedConfig(next))
  }
  return (
    <main className="screen home-screen">
      <div className="home-hero">
        <p className="eyebrow">{t('home.eyebrow')}</p>
        <h1>{t('home.title')}</h1>
        <p>{t('home.subtitle')}</p>
      </div>
      <section aria-labelledby="difficulty-heading">
        <h2 id="difficulty-heading">{t('home.difficulty')}</h2>
        <div className="difficulty-grid">
          {(['beginner', 'intermediate', 'expert', 'custom'] as const).map((kind) => {
            const item =
              kind === 'custom'
                ? { kind, rows: custom.rows, columns: custom.columns, mines: custom.mines }
                : PRESETS[kind]
            const title =
              kind === 'custom'
                ? t('home.custom')
                : t(`home.${kind}` as 'home.beginner' | 'home.intermediate' | 'home.expert')
            return (
              <SelectableOption
                key={kind}
                selected={selected.kind === kind}
                onSelect={() => choosePreset(kind)}
              >
                <strong>{title}</strong>
                <br />
                <span className="muted">
                  {item.rows} × {item.columns} · {item.mines} {t('home.mines').toLowerCase()}
                </span>
              </SelectableOption>
            )
          })}
        </div>
      </section>
      {selectedCustom ? (
        <div className="custom-form">
          <div className="form-grid">
            <label>
              {t('home.rows')}
              <input
                aria-label={t('home.rows')}
                type="number"
                min="5"
                max="30"
                value={custom.rows}
                onChange={(event) => updateCustom({ rows: Number(event.target.value) })}
              />
            </label>
            <label>
              {t('home.columns')}
              <input
                aria-label={t('home.columns')}
                type="number"
                min="5"
                max="30"
                value={custom.columns}
                onChange={(event) => updateCustom({ columns: Number(event.target.value) })}
              />
            </label>
            <label>
              {t('home.mines')}
              <input
                aria-label={t('home.mines')}
                type="number"
                min="1"
                value={custom.mines}
                onChange={(event) => updateCustom({ mines: Number(event.target.value) })}
              />
            </label>
          </div>
          {!customValid ? <p role="alert">{t('home.invalidCustom')}</p> : null}
        </div>
      ) : null}
      <div className="home-actions">
        <ActionButton onClick={start}>
          {session && resumable ? t('home.newGame') : t('home.play')}
        </ActionButton>
        {session && resumable ? (
          <ActionButton
            variant="tonal"
            onClick={() => {
              dispatch(navigate('game'))
            }}
          >
            {t('home.resume')}
          </ActionButton>
        ) : null}
      </div>
      <p className="muted">
        {best && best.bestSeconds !== Number.MAX_SAFE_INTEGER
          ? t('home.best', { value: `${best.bestSeconds}s` })
          : t('home.noRecord')}
      </p>
      <div className="home-actions">
        <ActionButton variant="text" onClick={() => dispatch(openSheet('help'))}>
          {t('home.help')}
        </ActionButton>
        <ActionButton variant="text" onClick={() => dispatch(openSheet('settings'))}>
          {t('home.settings')}
        </ActionButton>
        <InstallAction />
      </div>
    </main>
  )
}
