import { PRESETS, canonicalConfigKey, coordinateForIndex, indexOf, validateConfig } from '../../../src/domain/config'

describe('game configuration', () => {
    it('keeps preset dimensions and canonical identities stable', () => {
        expect(PRESETS.beginner).toEqual({ kind: 'beginner', rows: 9, columns: 9, mines: 10 })
        expect(canonicalConfigKey(PRESETS.expert)).toBe('24x24:99')
    })

    it('validates custom bounds and converts coordinates', () => {
        const custom = validateConfig({ kind: 'custom', rows: 5, columns: 6, mines: 1 })
        expect(custom.ok).toBe(true)
        if (!custom.ok) throw new Error('expected valid custom configuration')
        expect(indexOf(custom.value, { row: 2, column: 3 })).toBe(15)
        expect(coordinateForIndex(custom.value, 15)).toEqual({ row: 2, column: 3 })
        expect(validateConfig({ kind: 'custom', rows: 4, columns: 6, mines: 1 }).ok).toBe(false)
    })
})
