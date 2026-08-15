import { catalog, type Locale, type MessageKey } from './catalog'

export function resolveLocale(language: string | undefined): Locale {
    return language?.toLowerCase().startsWith('uk') ? 'uk' : 'en'
}

export function translate(locale: Locale, key: MessageKey, variables: Record<string, string | number> = {}): string {
    return catalog[locale][key].replace(/\{(\w+)\}/g, (_, variable: string) =>
        String(variables[variable] ?? `{${variable}}`),
    )
}
