import { useTranslate } from '../../i18n/useTranslate'

function formatBuildTimestamp(value: string): string {
    if (value === 'dev version') return value
    if (/^\d{4}\.\d{2}\.\d{2} At \d{2}:\d{2}$/.test(value)) return value

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value

    const pad = (part: number) => String(part).padStart(2, '0')
    return `${date.getUTCFullYear()}.${pad(date.getUTCMonth() + 1)}.${pad(date.getUTCDate())} At ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`
}

export function BuildStamp() {
    const t = useTranslate()
    const rawValue = typeof __APP_BUILD_TIMESTAMP__ === 'string' ? __APP_BUILD_TIMESTAMP__ : 'dev version'

    return (
        <footer className="build-stamp" data-build-stamp={rawValue} data-testid="build-stamp">
            {t('common.buildStamp', { value: formatBuildTimestamp(rawValue) })}
        </footer>
    )
}
