import { createAppStore } from '../../../src/app/store'
import { hydrateStore } from '../../../src/features/persistence/persistenceController'
import { createGame } from '../../../src/domain/gameEngine'
import { PRESETS } from '../../../src/domain/config'
import { decodeStoredRecord, defaultRecord } from '../../../src/features/persistence/recordCodec'

describe('persistence controller hydration', () => {
    it('uses an English or Ukrainian device locale when no valid record exists', () => {
        const originalLanguage = navigator.language
        Object.defineProperty(navigator, 'language', { configurable: true, value: 'uk-UA' })
        const store = createAppStore()

        hydrateStore(store, {
            read: () => ({ ok: true, value: null }),
            write: () => ({ ok: true, value: undefined }),
            clear: () => ({ ok: true, value: undefined }),
        })

        expect(store.getState().preferences.locale).toBe('uk')
        Object.defineProperty(navigator, 'language', { configurable: true, value: originalLanguage })
    })

    it('keeps the locale from a valid versioned record instead of re-reading device language', () => {
        const originalLanguage = navigator.language
        Object.defineProperty(navigator, 'language', { configurable: true, value: 'uk-UA' })
        const record = defaultRecord('en')
        const store = createAppStore()

        hydrateStore(store, {
            read: () => ({ ok: true, value: JSON.stringify(record) }),
            write: () => ({ ok: true, value: undefined }),
            clear: () => ({ ok: true, value: undefined }),
        })

        expect(store.getState().preferences.locale).toBe('en')
        Object.defineProperty(navigator, 'language', { configurable: true, value: originalLanguage })
    })

    it('preserves valid preferences and records when only the resumable session is invalid', () => {
        const record = {
            ...defaultRecord('uk'),
            preferences: { ...defaultRecord('uk').preferences, appearance: 'dark' as const },
            standardRecords: { beginner: { bestSeconds: 12, lastStartedAt: 4 } },
            customRecords: { '5x5:1': { bestSeconds: 8, lastStartedAt: 5 } },
            resumableGame: { ...createGame(PRESETS.beginner, 1), status: 'won' as const },
        }

        const decoded = decodeStoredRecord(JSON.stringify(record))
        expect(decoded).toMatchObject({ ok: false, reason: 'invalid', recovered: true })
        expect(decoded.value.preferences).toEqual(record.preferences)
        expect(decoded.value.standardRecords).toEqual(record.standardRecords)
        expect(decoded.value.customRecords).toEqual(record.customRecords)
        expect(decoded.value.resumableGame).toBeUndefined()

        const store = createAppStore()
        hydrateStore(store, {
            read: () => ({ ok: true, value: JSON.stringify(record) }),
            write: () => ({ ok: true, value: undefined }),
            clear: () => ({ ok: true, value: undefined }),
        })
        expect(store.getState().preferences.locale).toBe('uk')
        expect(store.getState().preferences.appearance).toBe('dark')
        expect(store.getState().persistence.standardRecords).toEqual(record.standardRecords)
        expect(store.getState().persistence.customRecords).toEqual(record.customRecords)
        expect(store.getState().game.session).toBeNull()
    })
})
