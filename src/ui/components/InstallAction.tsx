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
    <ActionButton
      variant="tonal"
      onClick={async () => {
        await promptInstall()
        setAvailable(false)
      }}
    >
      {t('home.install')}
    </ActionButton>
  )
}
