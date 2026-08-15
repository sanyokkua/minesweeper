import { useEffect, useState } from 'react'
import { ActionButton } from './ActionButton'
import { useTranslate } from '../../i18n/useTranslate'
import {
    getInstallAvailability,
    listenForInstallPrompt,
    promptInstall,
    type InstallAvailability,
} from '../../pwa/installGateway'

export function InstallAction({ pwaReady = false }: { pwaReady?: boolean }) {
    const t = useTranslate()
    const [, refresh] = useState(0)
    useEffect(() => listenForInstallPrompt(() => refresh((value) => value + 1)), [refresh])
    const availability: InstallAvailability = getInstallAvailability(pwaReady)
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
                    }}
                >
                    {t('home.install')}
                </ActionButton>
            ) : null}
        </section>
    )
}
