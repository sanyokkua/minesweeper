import { test, expect } from '@playwright/test'

test('matches the mockup home typography and hierarchy at desktop width', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('./')
    const wordmark = await page.locator('.wordmark').evaluate((element) => {
        const style = getComputedStyle(element)
        return {
            fontFamily: style.fontFamily,
            fontSize: Number.parseFloat(style.fontSize),
            lineHeight: Number.parseFloat(style.lineHeight),
            letterSpacing: Number.parseFloat(style.letterSpacing),
        }
    })
    expect(wordmark.fontFamily).toContain('Press Start 2P')
    expect(wordmark.fontSize).toBeCloseTo(30, 1)
    expect(wordmark.lineHeight).toBeCloseTo(45, 1)
    expect(wordmark.letterSpacing).toBeCloseTo(1, 1)
    await expect.poll(() => page.evaluate(() => document.fonts.check('16px Inter'))).toBe(true)
    await expect.poll(() => page.evaluate(() => document.fonts.check('16px "Press Start 2P"'))).toBe(true)
    const localFontRequests = await page.evaluate(() =>
        performance
            .getEntriesByType('resource')
            .map((entry) => new URL(entry.name).pathname)
            .filter((path) => /\/assets\/.*\.(?:woff2|ttf)$/.test(path)),
    )
    expect(new Set(localFontRequests).size).toBeGreaterThanOrEqual(2)
    await expect(page.getByText(/choose how taps and long-presses work/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /how to play/i })).toBeVisible()
    await expect(page.locator('.footlinks button')).toHaveCount(1)
    await expect(page.locator('.preview-cell')).toHaveCount(40)
    const previewColumns = await page
        .locator('.mini-preview')
        .evaluate((element) => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/))
    expect(previewColumns).toHaveLength(10)
    const previewRows = await page
        .locator('.mini-preview')
        .evaluate((element) => getComputedStyle(element).gridTemplateRows.trim().split(/\s+/))
    expect(previewRows).toHaveLength(4)
    const columns = await page
        .locator('.diff-grid')
        .evaluate((element) => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/))
    expect(columns).toHaveLength(4)
    const cardMetrics = await page
        .locator('.diff-card')
        .first()
        .evaluate((element) => {
            const card = getComputedStyle(element)
            const name = getComputedStyle(element.querySelector('.diff-card__name')!)
            const meta = getComputedStyle(element.querySelector('.diff-card__meta')!)
            const radio = getComputedStyle(element.querySelector('.radio')!)
            return {
                paddingTop: Number.parseFloat(card.paddingTop),
                paddingLeft: Number.parseFloat(card.paddingLeft),
                nameSize: Number.parseFloat(name.fontSize),
                metaSize: Number.parseFloat(meta.fontSize),
                radioWidth: Number.parseFloat(radio.width),
            }
        })
    expect(cardMetrics).toEqual({ paddingTop: 14, paddingLeft: 13, nameSize: 13.5, metaSize: 9, radioWidth: 15 })
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
    test(`reaches every edge of the Expert board at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        await page.addInitScript(() => localStorage.clear())
        await page.goto('./')
        await page.getByRole('button', { name: /expert/i }).click()
        await page.getByRole('button', { name: /^Play$/ }).click()
        const viewport = page.locator('.board-viewport')
        await expect(viewport).toBeVisible()

        const initial = await viewport.evaluate((element) => ({
            clientWidth: element.clientWidth,
            clientHeight: element.clientHeight,
            scrollWidth: element.scrollWidth,
            scrollHeight: element.scrollHeight,
        }))
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
        expect(initial.scrollWidth > initial.clientWidth || initial.scrollHeight > initial.clientHeight).toBe(true)
        if (initial.scrollWidth > initial.clientWidth) {
            await expect(page.locator('[data-edge-cue="right"]')).toHaveAttribute('data-visible', 'true')
        }
        if (initial.scrollHeight > initial.clientHeight) {
            await expect(page.locator('[data-edge-cue="bottom"]')).toHaveAttribute('data-visible', 'true')
        }

        await viewport.evaluate((element) => {
            element.scrollLeft = element.scrollWidth
            element.scrollTop = element.scrollHeight
            element.dispatchEvent(new Event('scroll', { bubbles: true }))
        })
        if (initial.scrollWidth > initial.clientWidth) {
            await expect(page.locator('[data-edge-cue="left"]')).toHaveAttribute('data-visible', 'true')
        }
        if (initial.scrollHeight > initial.clientHeight) {
            await expect(page.locator('[data-edge-cue="top"]')).toHaveAttribute('data-visible', 'true')
        }
    })
}

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

    test('cancels movement before fallback click or context-menu actions', async ({ page, browserName }) => {
        test.skip(
            browserName === 'firefox',
            'Desktop Firefox touch emulation does not emit the PointerEvent stream used by this regression',
        )
        await page.goto('./')
        await page.getByRole('button', { name: /^Play$/ }).click()
        const cell = page.getByRole('gridcell').nth(1)

        await cell.dispatchEvent('pointerdown', {
            pointerId: 2,
            pointerType: 'touch',
            clientX: 20,
            clientY: 20,
        })
        await expect(cell).toHaveAttribute('aria-label', /unopened/i)
        await cell.dispatchEvent('pointermove', {
            pointerId: 2,
            pointerType: 'touch',
            clientX: 31,
            clientY: 20,
        })
        await expect(cell).toHaveAttribute('aria-label', /unopened/i)
        await cell.dispatchEvent('pointercancel', { pointerId: 2, pointerType: 'touch' })
        await expect(cell).toHaveAttribute('aria-label', /unopened/i)
        await cell.dispatchEvent('contextmenu', { button: 0, pointerType: 'touch' })
        await expect(cell).toHaveAttribute('aria-label', /unopened/i)
        await cell.dispatchEvent('click')

        await expect(cell).toHaveAttribute('aria-label', /unopened/i)
    })

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
