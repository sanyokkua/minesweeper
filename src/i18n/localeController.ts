import type { Locale } from './catalog'
import { resolveLocale } from './translate'

const LOCALE_KEY = 'minesweeper.locale'
function defaultStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}
export function readPersistedLocale(storage: Storage | null = defaultStorage()): Locale | null {
  try {
    const value = storage?.getItem(LOCALE_KEY)
    return value === 'en' || value === 'uk' ? value : null
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
    storage?.setItem(LOCALE_KEY, locale)
  } catch {
    /* storage is optional */
  }
}
