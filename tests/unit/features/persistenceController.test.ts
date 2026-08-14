import { createAppStore } from '../../../src/app/store'
import { hydrateStore } from '../../../src/features/persistence/persistenceController'
import { defaultRecord } from '../../../src/features/persistence/recordCodec'

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
})
