import { catalog, messageKeys } from '../../../src/i18n/catalog'
import { resolveLocale, translate } from '../../../src/i18n/translate'

describe('typed localization', () => {
  it('has matching English and Ukrainian keys with safe fallback', () => {
    expect(Object.keys(catalog.en).sort()).toEqual(Object.keys(catalog.uk).sort())
    expect(messageKeys.length).toBe(Object.keys(catalog.en).length)
    expect(resolveLocale('uk-UA')).toBe('uk')
    expect(resolveLocale('pl-PL')).toBe('en')
    expect(translate('en', 'home.title')).toBe('Minesweeper')
  })
})
