import { applyTheme, resolveTheme } from '../../../src/app/themeController'
describe('theme controller', () => {
    it('resolves explicit and system themes', () => {
        expect(resolveTheme('dark')).toBe('dark')
        expect(resolveTheme('system', true)).toBe('dark')
        expect(resolveTheme('system', false)).toBe('light')
        const root = document.createElement('html')
        expect(applyTheme('light', root)).toBe('light')
        expect(root.dataset.theme).toBe('light')
    })
})
