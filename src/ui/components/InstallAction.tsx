import { useEffect, useState } from 'react'
import { ActionButton } from './ActionButton'
import { useTranslate } from '../../i18n/useTranslate'
import { getInstallPrompt, listenForInstallPrompt, promptInstall } from '../../pwa/installGateway'

export function InstallAction() {
  const t = useTranslate()
  const [available, setAvailable] = useState(() => getInstallPrompt() !== null)
  useEffect(() => listenForInstallPrompt(() => setAvailable(true)), [])
  if (!available) return null
  return (
    <section className="install-banner" aria-label={t('home.installTitle')}>
      <span className="install-banner__icon" aria-hidden="true">
        ↓
      </span>
      <span className="install-banner__copy">
        <strong>{t('home.installTitle')}</strong>
        <span>{t('home.installDescription')}</span>
      </span>
      <ActionButton
        variant="tonal"
        className="action-button--compact"
        onClick={async () => {
          await promptInstall()
          setAvailable(false)
        }}
      >
        {t('home.install')}
      </ActionButton>
    </section>
  )
}
