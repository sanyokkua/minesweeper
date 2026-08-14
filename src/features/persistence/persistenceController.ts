import type { AppStore, RootState } from '../../app/store'
import { setAppearance, setInputMode, setLocale, setSelectedConfig } from '../preferences/preferencesSlice'
import { hydrate, discardResume } from '../game/gameSlice'
import { addNotice } from '../../app/appSlice'
import { decodeStoredRecord, defaultRecord, encodeRecord, type PlayerRecordV1 } from './recordCodec'
import { createStorageGateway, type StorageGateway } from './storageGateway'
import { hydrationComplete, markResetPerformed, persistenceError, setRecords } from './persistenceSlice'
import { resolveLocale } from '../../i18n/translate'

export function hydrateStore(store: AppStore, gateway: StorageGateway = createStorageGateway()): void {
    const read = gateway.read()
    const fallbackLocale = resolveLocale(typeof navigator === 'undefined' ? undefined : navigator.language)
    const decoded = read.ok
        ? decodeStoredRecord(read.value)
        : { ok: false as const, value: defaultRecord(fallbackLocale), reason: 'invalid' as const }
    const record = decoded.ok ? decoded.value : defaultRecord(fallbackLocale)
    store.dispatch(setLocale(record.preferences.locale))
    store.dispatch(setAppearance(record.preferences.appearance))
    store.dispatch(setInputMode(record.preferences.inputMode))
    store.dispatch(setSelectedConfig(record.preferences.selectedConfig))
    store.dispatch(setRecords({ standardRecords: record.standardRecords, customRecords: record.customRecords }))
    store.dispatch(hydrate({ session: record.resumableGame ?? null }))
    store.dispatch(hydrationComplete())
    if (!decoded.ok && decoded.reason !== 'empty') {
        store.dispatch(persistenceError('notice.storageRead'))
        store.dispatch(addNotice({ id: 'storage-read', message: 'notice.storageRead' }))
    }
}

export function recordFromState(state: RootState): PlayerRecordV1 {
    return encodeRecord({
        ...defaultRecord(),
        preferences: state.preferences,
        standardRecords: state.persistence.standardRecords,
        customRecords: state.persistence.customRecords,
        resumableGame:
            state.game.resumable && state.game.session?.status !== 'won' && state.game.session?.status !== 'lost'
                ? (state.game.session ?? undefined)
                : undefined,
    })
}

export function persistStore(store: AppStore, gateway: StorageGateway = createStorageGateway()): boolean {
    const result = gateway.write(JSON.stringify(recordFromState(store.getState())))
    if (!result.ok) {
        store.dispatch(persistenceError('notice.storageWrite'))
        store.dispatch(addNotice({ id: 'storage-write', message: 'notice.storageWrite' }))
    }
    return result.ok
}

export function resetLocalData(store: AppStore, gateway: StorageGateway = createStorageGateway()): boolean {
    const result = gateway.clear()
    if (result.ok) {
        const locale = resolveLocale(typeof navigator === 'undefined' ? undefined : navigator.language)
        const defaults = defaultRecord(locale)
        store.dispatch(setLocale(defaults.preferences.locale))
        store.dispatch(setAppearance(defaults.preferences.appearance))
        store.dispatch(setInputMode(defaults.preferences.inputMode))
        store.dispatch(setSelectedConfig(defaults.preferences.selectedConfig))
        store.dispatch(setRecords({ standardRecords: {}, customRecords: {} }))
        store.dispatch(discardResume())
        store.dispatch(markResetPerformed())
    } else {
        store.dispatch(persistenceError('notice.storageWrite'))
        store.dispatch(addNotice({ id: 'storage-write', message: 'notice.storageWrite' }))
    }
    return result.ok
}
