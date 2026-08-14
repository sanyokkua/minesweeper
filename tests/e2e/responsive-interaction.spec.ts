import { test, expect } from '@playwright/test'

test('matches the mockup home hierarchy at desktop width', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('./')
    expect(
        await page.locator('.wordmark').evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize)),
    ).toBeGreaterThanOrEqual(40)
    await expect(page.getByText(/choose how taps and long-presses work/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /how to play/i })).toBeVisible()
    await expect(page.locator('.footlinks button')).toHaveCount(1)
    const columns = await page
        .locator('.diff-grid')
        .evaluate((element) => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/))
    expect(columns).toHaveLength(2)
    await expect(page.locator('a[href="https://github.com/sanyokkua/minesweeper"]')).toBeVisible()
    await expect(page.getByTestId('build-stamp')).toContainText(/App Build: dev version|App Build:/)
})

test('keeps mockup-sized board cells reachable at small and desktop widths', async ({ page }) => {
    for (const width of [320, 1440]) {
        await page.setViewportSize({ width, height: 900 })
        await page.addInitScript(() => localStorage.clear())
        await page.goto('./')
        await page.getByRole('button', { name: /^Play$/ }).click()
        const cell = page.getByRole('gridcell').first()
        await expect(cell).toBeVisible()
        const box = await cell.boundingBox()
        expect(box?.width).toBeGreaterThanOrEqual(width === 320 ? 31.9 : 36)
        expect(box?.height).toBeGreaterThanOrEqual(width === 320 ? 31.9 : 36)
    }
})

for (const width of [320, 768, 1440]) {
    test(`keeps the page horizontally contained at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 })
        await page.goto('./')
        await page.getByRole('button', { name: /^Play$/ }).click()
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
        await page.getByRole('gridcell').first().press('ArrowRight')
        await expect(page.getByRole('grid')).toBeVisible()
    })
}

test.describe('touch long press', () => {
    test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })

    test('keeps a flag after the touch context-menu follow-up click', async ({ page, browserName }) => {
        test.skip(
            browserName === 'firefox',
            'Desktop Firefox touch emulation does not emit the PointerEvent stream used by this regression',
        )
        await page.goto('./')
        await page.getByRole('button', { name: /^Play$/ }).click()
        const cell = page.getByRole('gridcell').nth(1)

        await cell.dispatchEvent('pointerdown', {
            pointerId: 1,
            pointerType: 'touch',
            clientX: 20,
            clientY: 20,
        })
        await page.waitForTimeout(650)
        await expect(cell).toHaveAttribute('aria-label', /flagged/i)
        await cell.dispatchEvent('pointerup', { pointerId: 1, pointerType: 'touch' })
        await cell.dispatchEvent('contextmenu', {
            button: 0,
            pointerType: 'touch',
        })
        await cell.dispatchEvent('click')

        await expect(cell).toHaveAttribute('aria-label', /flagged/i)
    })
})
