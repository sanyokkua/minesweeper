import { catalog, messageKeys } from '../../../src/i18n/catalog'
import { resolveLocale, translate } from '../../../src/i18n/translate'
import { persistLocale, readPersistedLocale, resolveInitialLocale } from '../../../src/i18n/localeController'
import { defaultRecord, STORAGE_KEY } from '../../../src/features/persistence/recordCodec'

describe('typed localization', () => {
    it('has matching English and Ukrainian keys with safe fallback', () => {
        expect(Object.keys(catalog.en).sort()).toEqual(Object.keys(catalog.uk).sort())
        expect(messageKeys.length).toBe(Object.keys(catalog.en).length)
        expect(resolveLocale('uk-UA')).toBe('uk')
        expect(resolveLocale('pl-PL')).toBe('en')
        expect(translate('en', 'home.title')).toBe('Minesweeper')
    })

    it('reads and writes locale only through the versioned local-state record', () => {
        const values = new Map<string, string>()
        const storage = {
            getItem: (key: string) => values.get(key) ?? null,
            setItem: (key: string, value: string) => values.set(key, value),
            removeItem: (key: string) => values.delete(key),
        } as unknown as Storage

        persistLocale('uk', storage)

        expect(values.has('minesweeper.locale')).toBe(false)
        expect(values.has(STORAGE_KEY)).toBe(true)
        expect(readPersistedLocale(storage)).toBe('uk')
        expect(JSON.parse(values.get(STORAGE_KEY) ?? '{}')).toEqual({
            ...defaultRecord(),
            preferences: { ...defaultRecord().preferences, locale: 'uk' },
        })
    })

    it('uses the device locale only when the versioned record has no valid locale', () => {
        const values = new Map<string, string>()
        const storage = {
            getItem: (key: string) => values.get(key) ?? null,
        } as unknown as Storage

        expect(resolveInitialLocale(storage, 'uk-UA')).toBe('uk')
        values.set(
            STORAGE_KEY,
            JSON.stringify({
                ...defaultRecord(),
                preferences: { ...defaultRecord().preferences, locale: 'en' },
            }),
        )
        expect(resolveInitialLocale(storage, 'uk-UA')).toBe('en')
    })
})
