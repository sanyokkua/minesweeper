import { STORAGE_KEY } from './recordCodec'

export type StorageResult<T> = { ok: true; value: T } | { ok: false; error: unknown }
export type StorageGateway = {
  read: () => StorageResult<string | null>
  write: (value: string) => StorageResult<void>
  clear: () => StorageResult<void>
}

function defaultStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}
export function createStorageGateway(storage: Storage | null = defaultStorage()): StorageGateway {
  return {
    read: () => {
      try {
        return { ok: true, value: storage?.getItem(STORAGE_KEY) ?? null }
      } catch (error) {
        return { ok: false, error }
      }
    },
    write: (value) => {
      try {
        storage?.setItem(STORAGE_KEY, value)
        return { ok: true, value: undefined }
      } catch (error) {
        return { ok: false, error }
      }
    },
    clear: () => {
      try {
        storage?.removeItem(STORAGE_KEY)
        return { ok: true, value: undefined }
      } catch (error) {
        return { ok: false, error }
      }
    },
  }
}
