import { test, expect, type Page } from '@playwright/test'

const responsiveWidths = [320, 344, 375, 412, 430, 768, 1440] as const

async function clearStorageAndOpenHome(page: Page) {
    await page.addInitScript(() => localStorage.clear())
    await page.goto('./')
}

async function openStandardGame(page: Page) {
    await clearStorageAndOpenHome(page)
    await page.getByRole('button', { name: /^Play$/ }).click()
}

async function openExpertGame(page: Page) {
    await clearStorageAndOpenHome(page)
    await page.getByRole('button', { name: /expert/i }).click()
    await page.getByRole('button', { name: /^Play$/ }).click()
}

async function firstCellSide(page: Page) {
    const box = await page.getByRole('gridcell').first().boundingBox()
    expect(box).not.toBeNull()
    return Math.min(box!.width, box!.height)
}

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
    await expect(page.getByTestId('build-stamp')).toContainText(
        /App Build: (Build \d+|Development build) · \d{4}-\d{2}-\d{2} \d{2}:\d{2} UTC/,
    )
})

test('tracks the responsive board-cell matrix across the requested viewport widths', async ({ page }) => {
    for (const width of responsiveWidths) {
        await page.setViewportSize({ width, height: 900 })
        await openStandardGame(page)

        const cellSide = await firstCellSide(page)
        if (width === 320 || width === 344) {
            expect(cellSide).toBeGreaterThanOrEqual(31.5)
            expect(cellSide).toBeLessThanOrEqual(32.5)
            continue
        }

        if (width === 375 || width === 412 || width === 430) {
            expect(cellSide).toBeGreaterThan(32.5)
            expect(cellSide).toBeLessThan(40.5)
            continue
        }

        expect(cellSide).toBeGreaterThanOrEqual(39)
        expect(cellSide).toBeLessThanOrEqual(40.5)
    }
})

test('lets a fitting standard board use most of the usable board surface at wide-phone width', async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 900 })
    await openStandardGame(page)

    const occupancy = await page.locator('.board-grid').evaluate((grid) => {
        const surface = grid.closest('.board-viewport__content') as HTMLElement | null
        if (!surface) throw new Error('Missing board surface')
        const surfaceStyle = getComputedStyle(surface)
        const usableWidth =
            surface.clientWidth -
            Number.parseFloat(surfaceStyle.paddingLeft) -
            Number.parseFloat(surfaceStyle.paddingRight)
        return grid.getBoundingClientRect().width / usableWidth
    })

    expect(occupancy).toBeGreaterThanOrEqual(0.85)
})

for (const width of responsiveWidths) {
    test(`reaches every edge of the Expert board at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        await openExpertGame(page)
        const viewport = page.locator('.board-viewport')
        await expect(viewport).toBeVisible()

        const initial = await viewport.evaluate((element) => ({
            clientWidth: element.clientWidth,
            clientHeight: element.clientHeight,
            scrollWidth: element.scrollWidth,
            scrollHeight: element.scrollHeight,
        }))
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
        expect(initial.scrollHeight).toBeGreaterThan(initial.clientHeight)
        await expect(page.locator('[data-edge-cue="bottom"]')).toHaveAttribute('data-visible', 'true')
        if (width < 1440) {
            expect(initial.scrollWidth).toBeGreaterThan(initial.clientWidth)
            await expect(page.locator('[data-edge-cue="right"]')).toHaveAttribute('data-visible', 'true')
        }

        await viewport.evaluate((element) => {
            element.scrollLeft = element.scrollWidth
            element.scrollTop = element.scrollHeight
            element.dispatchEvent(new Event('scroll', { bubbles: true }))
        })
        await expect(page.locator('[data-edge-cue="top"]')).toHaveAttribute('data-visible', 'true')
        if (width < 1440) {
            await expect(page.locator('[data-edge-cue="left"]')).toHaveAttribute('data-visible', 'true')
        }
    })
}

for (const width of responsiveWidths) {
    test(`keeps the page horizontally contained at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 })
        await clearStorageAndOpenHome(page)
        await page.getByRole('button', { name: /^Play$/ }).click()
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
        await page.getByRole('gridcell').first().press('ArrowRight')
        await expect(page.getByRole('gridcell').nth(1)).toBeFocused()
    })
}

test('preserves an active game while resizing from a narrow phone to a wide phone', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 })
    await openStandardGame(page)

    const firstCell = page.getByRole('gridcell').first()
    await firstCell.click()
    const unopenedCell = page.getByRole('gridcell', { name: /unopened/i }).first()
    const unopenedCellId = await unopenedCell.getAttribute('id')
    expect(unopenedCellId).not.toBeNull()
    const flaggedCell = page.locator(`#${unopenedCellId}`)
    await flaggedCell.click({ button: 'right' })

    const beforeSide = await firstCellSide(page)
    await expect(firstCell).toHaveAttribute('aria-label', /open/i)
    await expect(flaggedCell).toHaveAttribute('aria-label', /flagged/i)

    await page.setViewportSize({ width: 430, height: 900 })

    await expect(firstCell).toHaveAttribute('aria-label', /open/i)
    await expect(flaggedCell).toHaveAttribute('aria-label', /flagged/i)
    await expect.poll(async () => firstCellSide(page)).toBeGreaterThan(beforeSide)
})

test.describe('touch long press', () => {
    test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })

    test('executes the primary action for a short touch after pointer capture is released', async ({
        page,
        browserName,
    }) => {
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
        await cell.dispatchEvent('pointerup', { pointerId: 1, pointerType: 'touch' })
        await cell.dispatchEvent('lostpointercapture', { pointerId: 1, pointerType: 'touch' })
        await cell.dispatchEvent('click')

        await expect(cell).toHaveAttribute('aria-label', /open/i)
    })

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
