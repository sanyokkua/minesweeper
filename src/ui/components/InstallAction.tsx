import { useEffect, useState } from 'react'
import { ActionButton } from './ActionButton'
import { useTranslate } from '../../i18n/useTranslate'
import {
    getInstallAvailability,
    listenForInstallPrompt,
    promptInstall,
    type InstallAvailability,
} from '../../pwa/installGateway'

export function InstallAction() {
    const t = useTranslate()
    const [availability, setAvailability] = useState<InstallAvailability>(getInstallAvailability)
    useEffect(() => listenForInstallPrompt(() => setAvailability(getInstallAvailability())), [])
    if (availability === 'none') return null
    const promptAvailable = availability === 'prompt'
    return (
        <section className="install-banner" aria-label={t('home.installTitle')}>
            <span className="install-banner__icon" aria-hidden="true">
                ↓
            </span>
            <span className="install-banner__copy">
                <strong>{promptAvailable ? t('home.installTitle') : t('home.installManualTitle')}</strong>
                <span>{promptAvailable ? t('home.installDescription') : t('home.installManualDescription')}</span>
            </span>
            {promptAvailable ? (
                <ActionButton
                    variant="tonal"
                    className="action-button--compact"
                    onClick={async () => {
                        await promptInstall()
                        setAvailability(getInstallAvailability())
                    }}
                >
                    {t('home.install')}
                </ActionButton>
            ) : null}
        </section>
    )
}
