import { catalog, messageKeys } from '../../../src/i18n/catalog'
describe('catalog parity', () => {
  it('tracks every message in both locales', () => {
    expect(messageKeys).toHaveLength(Object.keys(catalog.uk).length)
    for (const key of messageKeys) expect(catalog.uk[key]).toBeTruthy()
  })
})
