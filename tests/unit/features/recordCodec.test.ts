import { decodeStoredRecord, encodeRecord, defaultRecord } from '../../../src/features/persistence/recordCodec'

describe('durable record codec', () => {
    it('rejects malformed and future versions without throwing', () => {
        expect(decodeStoredRecord('{')).toMatchObject({ ok: false })
        expect(decodeStoredRecord(JSON.stringify({ version: 99 }))).toMatchObject({ ok: false })
        const encoded = encodeRecord(defaultRecord())
        expect(decodeStoredRecord(JSON.stringify(encoded))).toMatchObject({ ok: true })
    })

    it('rejects unapproved keys, non-canonical custom keys, fractional records, and revealed ready cells', () => {
        const withExtraKey = { ...defaultRecord(), unexpected: true }
        expect(decodeStoredRecord(JSON.stringify(withExtraKey))).toMatchObject({ ok: false })

        const withBadCustomKey = {
            ...defaultRecord(),
            customRecords: { '05x5:1': { bestSeconds: 2, lastStartedAt: 1 } },
        }
        expect(decodeStoredRecord(JSON.stringify(withBadCustomKey))).toMatchObject({ ok: false })

        const withFractionalBest = {
            ...defaultRecord(),
            standardRecords: { beginner: { bestSeconds: 1.5, lastStartedAt: 1 } },
        }
        expect(decodeStoredRecord(JSON.stringify(withFractionalBest))).toMatchObject({ ok: false })

        const ready = {
            ...defaultRecord(),
            resumableGame: {
                ...defaultRecord().resumableGame,
                config: { kind: 'custom', rows: 5, columns: 5, mines: 1 },
                cells: Array.from({ length: 25 }, (_, index) => ({
                    hasMine: false,
                    neighborMines: 0,
                    revealed: index === 0,
                    flagged: false,
                })),
                seed: 1,
                minesPlaced: false,
                status: 'ready',
                elapsedMs: 0,
            },
        }
        expect(decodeStoredRecord(JSON.stringify(ready))).toMatchObject({ ok: false })
    })
})
