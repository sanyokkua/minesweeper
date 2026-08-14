import { createStorageGateway } from '../../../src/features/persistence/storageGateway'
import { defaultRecord, STORAGE_KEY } from '../../../src/features/persistence/recordCodec'

describe('storage gateway', () => {
  it('catches read, write and clear failures without throwing', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('quota')
      },
      removeItem: () => {
        throw new Error('blocked')
      },
    } as unknown as Storage
    const gateway = createStorageGateway(broken)
    expect(gateway.read().ok).toBe(false)
    expect(gateway.write('x').ok).toBe(false)
    expect(gateway.clear().ok).toBe(false)
    const storage = new Map<string, string>()
    const good = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value)
      },
      removeItem: (key: string) => {
        storage.delete(key)
      },
    } as unknown as Storage
    const safe = createStorageGateway(good)
    expect(safe.write(JSON.stringify(defaultRecord())).ok).toBe(true)
    expect(safe.read()).toEqual({ ok: true, value: JSON.stringify(defaultRecord()) })
    expect(storage.has(STORAGE_KEY)).toBe(true)
  })
})
