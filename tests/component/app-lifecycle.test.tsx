import { act, render, type RenderResult } from '@testing-library/react'
import { Provider } from 'react-redux'
import { App } from '../../src/App'
import { createAppStore } from '../../src/app/store'
import { closeSheet, navigate, openSheet } from '../../src/app/appSlice'
import { command, newGame } from '../../src/features/game/gameSlice'
import { STORAGE_KEY } from '../../src/features/persistence/recordCodec'
import { createStorageGateway, type StorageGateway } from '../../src/features/persistence/storageGateway'
import { hydrateStore } from '../../src/features/persistence/persistenceController'

type LifecycleStorage = {
    gateway: StorageGateway
    values: Map<string, string>
    resetWrites: () => void
    readonly writes: number
}

function createLifecycleStorage(): LifecycleStorage {
    const values = new Map<string, string>()
    let writes = 0
    const storage = {
        get length() {
            return values.size
        },
        clear() {
            values.clear()
        },
        getItem(key: string) {
            return values.get(key) ?? null
        },
        key(index: number) {
            return [...values.keys()][index] ?? null
        },
        removeItem(key: string) {
            values.delete(key)
        },
        setItem(key: string, value: string) {
            writes += 1
            values.set(key, value)
        },
    } as Storage

    return {
        gateway: createStorageGateway(storage),
        values,
        resetWrites: () => {
            writes = 0
        },
        get writes() {
            return writes
        },
    }
}

const mountedViews = new Set<RenderResult>()
const originalDateNow = Date.now
const originalVisibilityDescriptor = Object.getOwnPropertyDescriptor(document, 'visibilityState')

function renderApp(store: ReturnType<typeof createAppStore>, gateway: StorageGateway) {
    const view = render(
        <Provider store={store}>
            <App storageGateway={gateway} />
        </Provider>,
    )
    mountedViews.add(view)
    return view
}

afterEach(() => {
    try {
        for (const view of mountedViews) view.unmount()
    } finally {
        mountedViews.clear()
        Date.now = originalDateNow
        vi.restoreAllMocks()
        if (originalVisibilityDescriptor) {
            Object.defineProperty(document, 'visibilityState', originalVisibilityDescriptor)
        } else {
            Reflect.deleteProperty(document, 'visibilityState')
        }
    }
})

describe('application lifecycle persistence', () => {
    it('persists accrued elapsed time through the injected gateway when ambient storage is unavailable', async () => {
        const unavailableGateway = createStorageGateway(null)
        expect(unavailableGateway.read().ok).toBe(false)

        const fixture = createLifecycleStorage()
        const now = vi.spyOn(Date, 'now').mockReturnValue(0)
        const store = createAppStore()
        const view = renderApp(store, fixture.gateway)

        await act(async () => undefined)
        act(() => {
            store.dispatch(newGame({ config: { kind: 'custom', rows: 5, columns: 5, mines: 1 }, seed: 1, atMs: 0 }))
            store.dispatch(navigate('game'))
            store.dispatch(command({ command: { type: 'reveal', coordinate: { row: 0, column: 0 } }, atMs: 0 }))
        })

        now.mockReturnValue(1_250)
        act(() => {
            store.dispatch(openSheet('settings'))
        })
        await act(async () => undefined)

        const record = JSON.parse(fixture.values.get(STORAGE_KEY) ?? '{}') as {
            resumableGame?: { elapsedMs: number }
        }
        expect(record.resumableGame?.elapsedMs).toBe(1_250)
        act(() => {
            store.dispatch(closeSheet())
        })
        expect(store.getState().game.session?.elapsedMs).toBe(1_250)

        const resumed = createAppStore()
        hydrateStore(resumed, fixture.gateway)
        expect(resumed.getState().game.session?.elapsedMs).toBe(1_250)
        expect(() => view.unmount()).not.toThrow()
        mountedViews.delete(view)
    })

    it('coalesces parallel visibility and pagehide persistence before teardown', async () => {
        const fixture = createLifecycleStorage()
        const now = vi.spyOn(Date, 'now').mockReturnValue(0)
        const store = createAppStore()
        const view = renderApp(store, fixture.gateway)

        await act(async () => undefined)
        act(() => {
            store.dispatch(newGame({ config: { kind: 'custom', rows: 5, columns: 5, mines: 1 }, seed: 1, atMs: 0 }))
            store.dispatch(navigate('game'))
            store.dispatch(command({ command: { type: 'reveal', coordinate: { row: 0, column: 0 } }, atMs: 0 }))
        })
        fixture.resetWrites()

        now.mockReturnValue(5_000)
        Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' })
        act(() => {
            document.dispatchEvent(new Event('visibilitychange'))
            window.dispatchEvent(new Event('pagehide'))
        })
        await act(async () => undefined)

        expect(fixture.writes).toBe(1)
        expect(store.getState().game.session?.elapsedMs).toBe(5_000)
        expect(() => view.unmount()).not.toThrow()
        mountedViews.delete(view)
    })
})
