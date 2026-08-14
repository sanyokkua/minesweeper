import { applyCommand, createGame } from '../../../src/domain/gameEngine'
import { PRESETS } from '../../../src/domain/config'
import {
    decodeStoredRecord,
    encodeRecord,
    defaultRecord,
    type PlayerRecordV1,
} from '../../../src/features/persistence/recordCodec'

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

    it('encodes only the approved single-record fields and canonical config shapes', () => {
        const session = createGame(PRESETS.beginner, 7)
        const input = {
            ...defaultRecord(),
            unexpected: true,
            preferences: {
                ...defaultRecord().preferences,
                selectedConfig: { ...PRESETS.beginner, label: 'Beginner' },
                unexpectedPreference: true,
            },
            resumableGame: {
                ...session,
                config: { ...session.config, label: 'Beginner' },
                unexpectedSession: true,
                cells: session.cells.map((cell) => ({ ...cell, unexpectedCell: true })),
            },
        } as unknown as PlayerRecordV1

        const encoded = encodeRecord(input)

        expect(Object.keys(encoded).sort()).toEqual([
            'customRecords',
            'preferences',
            'resumableGame',
            'standardRecords',
            'version',
        ])
        expect(encoded.preferences.selectedConfig).toEqual(PRESETS.beginner)
        expect(Object.keys(encoded.preferences.selectedConfig).sort()).toEqual(['columns', 'kind', 'mines', 'rows'])
        expect(encoded.resumableGame).toBeDefined()
        expect(Object.keys(encoded.resumableGame ?? {}).sort()).toEqual([
            'cells',
            'config',
            'elapsedMs',
            'minesPlaced',
            'seed',
            'status',
        ])
        expect(Object.keys(encoded.resumableGame?.config ?? {}).sort()).toEqual(['columns', 'kind', 'mines', 'rows'])
        expect(Object.keys(encoded.resumableGame?.cells[0] ?? {}).sort()).toEqual([
            'flagged',
            'hasMine',
            'neighborMines',
            'revealed',
        ])
        expect(decodeStoredRecord(JSON.stringify(encoded)).ok).toBe(true)
    })

    it('recovers preferences and records when a playing session reveals a mine', () => {
        const started = applyCommand(createGame(PRESETS.beginner, 23), {
            type: 'reveal',
            coordinate: { row: 0, column: 0 },
        })
        const mineIndex = started.cells.findIndex((cell) => cell.hasMine)
        const impossibleSession = {
            ...started,
            cells: started.cells.map((cell, index) => (index === mineIndex ? { ...cell, revealed: true } : cell)),
        }
        const record = {
            ...defaultRecord('uk'),
            preferences: { ...defaultRecord('uk').preferences, appearance: 'dark' as const },
            standardRecords: { beginner: { bestSeconds: 12, lastStartedAt: 4 } },
            customRecords: { '5x5:1': { bestSeconds: 8, lastStartedAt: 5 } },
            resumableGame: impossibleSession,
        }

        const decoded = decodeStoredRecord(JSON.stringify(record))

        expect(decoded).toMatchObject({ ok: false, reason: 'invalid', recovered: true })
        expect(decoded.value.preferences).toEqual(record.preferences)
        expect(decoded.value.standardRecords).toEqual(record.standardRecords)
        expect(decoded.value.customRecords).toEqual(record.customRecords)
        expect(decoded.value.resumableGame).toBeUndefined()
    })
})
