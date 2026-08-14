import type { Locale } from './catalog'
import { resolveLocale } from './translate'
import {
  decodeStoredRecord,
  defaultRecord,
  encodeRecord,
  STORAGE_KEY,
} from '../features/persistence/recordCodec'

function defaultStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}
export function readPersistedLocale(storage: Storage | null = defaultStorage()): Locale | null {
  try {
    const decoded = decodeStoredRecord(storage?.getItem(STORAGE_KEY) ?? null)
    return decoded.ok ? decoded.value.preferences.locale : null
  } catch {
    return null
  }
}
export function resolveInitialLocale(
  storage?: Storage | null,
  language = typeof navigator === 'undefined' ? 'en' : navigator.language,
): Locale {
  return readPersistedLocale(storage) ?? resolveLocale(language)
}
export function persistLocale(locale: Locale, storage: Storage | null = defaultStorage()): void {
  try {
    if (!storage) return
    const current = decodeStoredRecord(storage.getItem(STORAGE_KEY))
    const record = current.ok ? current.value : defaultRecord()
    record.preferences.locale = locale
    storage.setItem(STORAGE_KEY, JSON.stringify(encodeRecord(record)))
  } catch {
    /* persistence failures are reported by the storage controller */
  }
}
