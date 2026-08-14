import { act, render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { App } from '../../src/App'
import { createAppStore } from '../../src/app/store'
import { closeSheet, navigate, openSheet } from '../../src/app/appSlice'
import { command, newGame } from '../../src/features/game/gameSlice'
import { STORAGE_KEY } from '../../src/features/persistence/recordCodec'
import { createStorageGateway } from '../../src/features/persistence/storageGateway'
import { hydrateStore } from '../../src/features/persistence/persistenceController'

describe('application lifecycle persistence', () => {
    it('persists accrued elapsed time when a blocking sheet opens', async () => {
        localStorage.clear()
        const now = vi.spyOn(Date, 'now').mockReturnValue(0)
        const store = createAppStore()
        render(
            <Provider store={store}>
                <App />
            </Provider>,
        )

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

        const record = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as {
            resumableGame?: { elapsedMs: number }
        }
        expect(record.resumableGame?.elapsedMs).toBe(1250)
        act(() => {
            store.dispatch(closeSheet())
        })
        expect(store.getState().game.session?.elapsedMs).toBe(1250)

        const resumed = createAppStore()
        hydrateStore(resumed, createStorageGateway())
        expect(resumed.getState().game.session?.elapsedMs).toBe(1250)
        now.mockRestore()
    })
})
