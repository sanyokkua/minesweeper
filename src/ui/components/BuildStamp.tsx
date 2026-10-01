import { useTranslate } from '../../i18n/useTranslate'

export function BuildStamp() {
    const t = useTranslate()
    const { number, time } = __APP_BUILD__
    const value = number ? t('common.buildNumber', { number, time }) : t('common.buildDev', { time })

    return (
        <footer className="build-stamp" data-build-stamp={number ?? 'dev'} data-testid="build-stamp">
            {t('common.buildStamp', { value })}
        </footer>
    )
}
