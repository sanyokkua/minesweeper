import {
  decodeStoredRecord,
  encodeRecord,
  defaultRecord,
} from '../../../src/features/persistence/recordCodec'

describe('durable record codec', () => {
  it('rejects malformed and future versions without throwing', () => {
    expect(decodeStoredRecord('{')).toMatchObject({ ok: false })
    expect(decodeStoredRecord(JSON.stringify({ version: 99 }))).toMatchObject({ ok: false })
    const encoded = encodeRecord(defaultRecord())
    expect(decodeStoredRecord(JSON.stringify(encoded))).toMatchObject({ ok: true })
  })
})
