import { primaryCommand, secondaryCommand } from '../../../src/features/preferences/inputMode'
describe('input mapping', () => {
    it('swaps primary and secondary commands', () => {
        const coordinate = { row: 1, column: 2 }
        expect(primaryCommand('reveal-first', coordinate).type).toBe('reveal')
        expect(secondaryCommand('reveal-first', coordinate).type).toBe('toggleFlag')
        expect(primaryCommand('flag-first', coordinate).type).toBe('toggleFlag')
        expect(secondaryCommand('flag-first', coordinate).type).toBe('reveal')
    })
})
