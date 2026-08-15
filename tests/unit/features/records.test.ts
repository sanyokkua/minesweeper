import { createAppStore } from '../../../src/app/store'
import { PRESETS } from '../../../src/domain/config'
import { finishRecord, setRecords, startRecord } from '../../../src/features/persistence/persistenceSlice'

describe('record lifecycle', () => {
    it('compares standard results by rounded whole seconds', () => {
        const store = createAppStore()

        store.dispatch(finishRecord({ config: PRESETS.beginner, elapsedMs: 1_001, atMs: 1 }))
        expect(store.getState().persistence.standardRecords.beginner).toEqual({ bestSeconds: 2, lastStartedAt: 1 })

        store.dispatch(finishRecord({ config: PRESETS.beginner, elapsedMs: 2_000, atMs: 2 }))
        store.dispatch(finishRecord({ config: PRESETS.beginner, elapsedMs: 2_500, atMs: 3 }))
        expect(store.getState().persistence.standardRecords.beginner).toEqual({ bestSeconds: 2, lastStartedAt: 1 })

        store.dispatch(finishRecord({ config: PRESETS.beginner, elapsedMs: 1_000, atMs: 4 }))
        expect(store.getState().persistence.standardRecords.beginner).toEqual({ bestSeconds: 1, lastStartedAt: 4 })
    })

    it('compares Custom results by exact configuration identity', () => {
        const store = createAppStore()
        const first = { kind: 'custom' as const, rows: 5, columns: 5, mines: 1 }
        const second = { kind: 'custom' as const, rows: 5, columns: 5, mines: 2 }

        store.dispatch(finishRecord({ config: first, elapsedMs: 1_001, atMs: 1 }))
        store.dispatch(finishRecord({ config: first, elapsedMs: 2_000, atMs: 2 }))
        store.dispatch(finishRecord({ config: first, elapsedMs: 1_000, atMs: 3 }))
        store.dispatch(finishRecord({ config: second, elapsedMs: 3_001, atMs: 4 }))

        expect(store.getState().persistence.customRecords).toEqual({
            '5x5:1': { bestSeconds: 1, lastStartedAt: 1 },
            '5x5:2': { bestSeconds: 4, lastStartedAt: 4 },
        })
    })

    it('preserves the Custom game-start recency when a better result is recorded', () => {
        const store = createAppStore()
        const config = { kind: 'custom' as const, rows: 5, columns: 5, mines: 1 }

        store.dispatch(startRecord({ config, atMs: 100 }))
        store.dispatch(finishRecord({ config, elapsedMs: 2_001, atMs: 200 }))
        store.dispatch(finishRecord({ config, elapsedMs: 1_000, atMs: 300 }))

        expect(store.getState().persistence.customRecords['5x5:1']).toEqual({
            bestSeconds: 1,
            lastStartedAt: 100,
        })
    })

    it('evicts the least recently started Custom game while preserving standard records', () => {
        const store = createAppStore()
        store.dispatch(
            setRecords({
                standardRecords: { beginner: { bestSeconds: 7, lastStartedAt: 7 } },
                customRecords: {},
            }),
        )
        const configFor = (index: number) => ({
            kind: 'custom' as const,
            rows: 5 + Math.floor(index / 26),
            columns: 5 + (index % 26),
            mines: 1,
        })

        for (let index = 0; index < 100; index += 1)
            store.dispatch(startRecord({ config: configFor(index), atMs: index + 1 }))

        store.dispatch(startRecord({ config: configFor(0), atMs: 1_000 }))
        store.dispatch(startRecord({ config: configFor(100), atMs: 1_001 }))

        const records = store.getState().persistence.customRecords
        expect(Object.keys(records)).toHaveLength(100)
        expect(records['5x5:1']).toEqual({ bestSeconds: Number.MAX_SAFE_INTEGER, lastStartedAt: 1_000 })
        expect(records['5x6:1']).toBeUndefined()
        expect(records['8x27:1']).toEqual({ bestSeconds: Number.MAX_SAFE_INTEGER, lastStartedAt: 1_001 })
        expect(store.getState().persistence.standardRecords.beginner).toEqual({ bestSeconds: 7, lastStartedAt: 7 })
    })
})
