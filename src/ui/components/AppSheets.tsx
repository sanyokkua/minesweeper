import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { closeSheet, navigate, openSheet } from '../../app/appSlice'
import { setAppearance, setInputMode, setLocale } from '../../features/preferences/preferencesSlice'
import { newGame } from '../../features/game/gameSlice'
import { startRecord } from '../../features/persistence/persistenceSlice'
import { ConfirmSheet } from './ConfirmSheet'
import { HelpSheet } from './HelpSheet'
import { ModalSheet } from './ModalSheet'
import { ActionButton } from './ActionButton'
import { useTranslate } from '../../i18n/useTranslate'
import { createStorageGateway } from '../../features/persistence/storageGateway'
import { resetLocalData } from '../../features/persistence/persistenceController'
import { useStore } from 'react-redux'
import type { AppStore } from '../../app/store'

export function AppSheets() {
  const dispatch = useAppDispatch()
  const store = useStore() as AppStore
  const t = useTranslate()
  const sheet = useAppSelector((state) => state.app.blockingSheet)
  const inputMode = useAppSelector((state) => state.preferences.inputMode)
  const locale = useAppSelector((state) => state.preferences.locale)
  const appearance = useAppSelector((state) => state.preferences.appearance)
  const selectedConfig = useAppSelector((state) => state.preferences.selectedConfig)
  const close = () => dispatch(closeSheet())
  return (
    <>
      <HelpSheet open={sheet === 'help'} onClose={close} />
      <ModalSheet
        open={sheet === 'settings'}
        title={t('settings.title')}
        onClose={close}
        closeLabel={t('settings.close')}
      >
        <h3>{t('settings.language')}</h3>
        <div className="settings-group">
          <ActionButton
            variant={locale === 'en' ? 'filled' : 'outline'}
            onClick={() => dispatch(setLocale('en'))}
          >
            {t('settings.english')}
          </ActionButton>
          <ActionButton
            variant={locale === 'uk' ? 'filled' : 'outline'}
            onClick={() => dispatch(setLocale('uk'))}
          >
            {t('settings.ukrainian')}
          </ActionButton>
        </div>
        <h3>{t('settings.input')}</h3>
        <div className="settings-group">
          <ActionButton
            variant={inputMode === 'reveal-first' ? 'filled' : 'outline'}
            onClick={() => dispatch(setInputMode('reveal-first'))}
          >
            {t('settings.revealFirst')}
          </ActionButton>
          <ActionButton
            variant={inputMode === 'flag-first' ? 'filled' : 'outline'}
            onClick={() => dispatch(setInputMode('flag-first'))}
          >
            {t('settings.flagFirst')}
          </ActionButton>
        </div>
        <h3>{t('settings.appearance')}</h3>
        <div className="settings-group">
          {(['light', 'dark', 'system'] as const).map((value) => (
            <ActionButton
              key={value}
              variant={appearance === value ? 'filled' : 'outline'}
              onClick={() => dispatch(setAppearance(value))}
            >
              {t(`settings.${value}` as 'settings.light' | 'settings.dark' | 'settings.system')}
            </ActionButton>
          ))}
        </div>
        <ActionButton
          variant="danger"
          onClick={() => {
            dispatch(closeSheet())
            dispatch(openSheet('confirm-reset'))
          }}
        >
          {t('settings.resetData')}
        </ActionButton>
      </ModalSheet>
      <ConfirmSheet
        open={sheet === 'confirm-reset'}
        message={t('confirm.reset')}
        onCancel={close}
        onConfirm={() => {
          resetLocalData(store, createStorageGateway())
          dispatch(closeSheet())
        }}
      />
      <ConfirmSheet
        open={sheet === 'confirm-replace'}
        message={t('confirm.replace')}
        onCancel={close}
        onConfirm={() => {
          const atMs = Date.now()
          dispatch(newGame({ config: selectedConfig, seed: atMs, atMs }))
          dispatch(startRecord({ config: selectedConfig, atMs }))
          dispatch(navigate('game'))
          dispatch(closeSheet())
        }}
      />
    </>
  )
}
