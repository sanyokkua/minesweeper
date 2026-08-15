import { test, expect } from '@playwright/test'

test('retains an untouched active board across reload', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: /^Play$/ }).click()
    await page.getByRole('gridcell').first().click({ button: 'right' })
    await page.reload()
    await expect(page.getByRole('button', { name: /resume game/i })).toBeVisible()
    await page.getByRole('button', { name: /resume game/i }).click()
    await expect(page.getByRole('grid')).toBeVisible()
})

test('changes language immediately inside settings', async ({ page }) => {
    await page.goto('./')
    await page.getByLabel('Settings').click()
    await page.getByRole('button', { name: 'Українська' }).click()
    await expect(page.getByRole('dialog')).toContainText('Налаштування')
})

test('matches the Settings sheet choice-card contract', async ({ page }) => {
    await page.goto('./')
    await page.getByLabel('Settings').click()
    const settings = page.getByRole('dialog', { name: /settings/i })
    await expect(settings).toContainText(/quick tap opens a cell/i)
    await expect(settings).toContainText(/stored only in this browser/i)
    await expect(settings.locator('.settings-option')).toHaveCount(5)
    await expect(settings.getByRole('button', { name: /reveal first/i })).toHaveAttribute('aria-pressed', 'true')

    await settings.getByRole('button', { name: /flag first/i }).click()
    await settings.getByRole('button', { name: /^dark/i }).click()
    await expect(settings.getByRole('button', { name: /flag first/i })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})

test('retains the selected preset and Custom configuration across reload', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: /intermediate/i }).click()
    await expect(page.getByRole('button', { name: /intermediate/i })).toHaveAttribute('aria-pressed', 'true')
    await page.getByRole('button', { name: /custom/i }).click()
    await page.getByRole('spinbutton', { name: /rows/i }).fill('7')
    await page.getByRole('spinbutton', { name: /columns/i }).fill('8')
    await page.getByRole('spinbutton', { name: /mines/i }).fill('4')
    await page.reload()
    await expect(page.getByRole('button', { name: /custom/i })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('spinbutton', { name: /rows/i })).toHaveValue('7')
    await expect(page.getByRole('spinbutton', { name: /columns/i })).toHaveValue('8')
    await expect(page.getByRole('spinbutton', { name: /mines/i })).toHaveValue('4')
})

test('keeps invalid Custom drafts transient and restores the last valid selection', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: /custom/i }).click()
    await page.getByRole('spinbutton', { name: /rows/i }).fill('4')

    await expect(page.getByRole('button', { name: /^Play$/ })).toBeDisabled()
    await expect
        .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('minesweeper.local-state') ?? '{}')))
        .toMatchObject({ preferences: { selectedConfig: { kind: 'custom', rows: 10, columns: 10, mines: 15 } } })

    await page.reload()
    await expect(page.getByRole('spinbutton', { name: /rows/i })).toHaveValue('10')
    await expect(page.getByRole('button', { name: /^Play$/ })).toBeEnabled()
})

test('flushes the active board when returning Home and resumes it after reload', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: /^Play$/ }).click()
    const first = page.getByRole('gridcell').first()
    await first.click({ button: 'right' })
    await page.getByRole('button', { name: /back to home/i }).click()
    await page.reload()
    await page.getByRole('button', { name: /resume game/i }).click()
    await expect(page.getByRole('gridcell').first()).toHaveAttribute('aria-label', /flagged/i)
})

test('reset local data keeps the live board playable but removes its resume copy', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: /^Play$/ }).click()
    await page.getByLabel('Settings').click()
    await page.getByRole('button', { name: /reset local data/i }).click()
    await page.getByRole('button', { name: 'Confirm', exact: true }).click()
    await expect(page.getByRole('grid')).toBeVisible()
    await page.reload()
    await expect(page.getByRole('button', { name: /^Play$/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /resume game/i })).toBeHidden()
})

test('updates Custom recency when Play again starts the exact configuration', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: /custom/i }).click()
    await page.getByRole('spinbutton', { name: /rows/i }).fill('5')
    await page.getByRole('spinbutton', { name: /columns/i }).fill('5')
    await page.getByRole('spinbutton', { name: /mines/i }).fill('24')
    await page.getByRole('button', { name: /^Play$/ }).click()
    await page.getByRole('gridcell').first().click()
    await expect(page.getByRole('dialog', { name: /cleared/i })).toBeVisible()
    await page.waitForFunction(() => {
        const record = JSON.parse(localStorage.getItem('minesweeper.local-state') ?? '{}')
        return record.customRecords?.['5x5:24']?.bestSeconds === 0
    })
    const completed = await page.evaluate(
        () => JSON.parse(localStorage.getItem('minesweeper.local-state') ?? '{}').customRecords['5x5:24'],
    )
    await page.getByRole('button', { name: /play again/i }).click()
    await page.waitForFunction((previous) => {
        const record = JSON.parse(localStorage.getItem('minesweeper.local-state') ?? '{}')
        return record.customRecords?.['5x5:24']?.lastStartedAt > previous
    }, completed.lastStartedAt)
    await expect(page.getByRole('grid')).toBeVisible()
})

test('supports keyboard commands and the persisted flag-first mapping', async ({ page }) => {
    await page.goto('./')
    await page.getByLabel('Settings').click()
    await page.getByRole('button', { name: /flag first/i }).click()
    await page.getByRole('button', { name: /close settings/i }).click()
    await page.getByRole('button', { name: /^Play$/ }).click()
    const first = page.getByRole('gridcell').first()
    await expect(first).toBeFocused()
    await first.press('Enter')
    await expect(first).toHaveAttribute('aria-label', /flagged/i)
    await first.press('F')
    await expect(first).toHaveAttribute('aria-label', /unopened/i)
})

test('applies the reset policy in ready, playing, and terminal states', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: /custom/i }).click()
    await page.getByRole('spinbutton', { name: /rows/i }).fill('5')
    await page.getByRole('spinbutton', { name: /columns/i }).fill('5')
    await page.getByRole('spinbutton', { name: /mines/i }).fill('23')
    await page.getByRole('button', { name: /^Play$/ }).click()

    await page.getByRole('button', { name: /reset game/i }).click()
    await expect(page.getByRole('dialog', { name: /please confirm/i })).not.toBeVisible()
    await expect(page.getByRole('gridcell').first()).toHaveAttribute('aria-label', /unopened/i)

    await page.getByRole('gridcell').first().click()
    await page.getByRole('button', { name: /reset game/i }).click()
    await expect(page.getByRole('dialog', { name: /please confirm/i })).toBeVisible()
    await page.getByRole('button', { name: 'Confirm', exact: true }).click()
    await expect(page.getByRole('grid')).toBeVisible()

    await page.getByRole('button', { name: /back to home/i }).click()
    await page.getByRole('button', { name: /new game/i }).click()
    await expect(page.getByRole('dialog', { name: /please confirm/i })).toBeVisible()
    await page.getByRole('button', { name: 'Confirm', exact: true }).click()
    await expect(page.getByRole('grid')).toBeVisible()
})

test('replays the exact Custom configuration and does not resume a completed board', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: /custom/i }).click()
    await page.getByRole('spinbutton', { name: /rows/i }).fill('5')
    await page.getByRole('spinbutton', { name: /columns/i }).fill('5')
    await page.getByRole('spinbutton', { name: /mines/i }).fill('24')
    await page.getByRole('button', { name: /^Play$/ }).click()
    await page.getByRole('gridcell').first().click()
    await expect(page.getByRole('dialog', { name: /cleared/i })).toBeVisible()
    await expect(page.locator('.diff-chip')).toHaveText('5 × 5')

    await page.getByRole('button', { name: /play again/i }).click()
    await expect(page.locator('.diff-chip')).toHaveText('5 × 5')
    await page.getByRole('gridcell').first().click()
    await expect(page.getByRole('dialog', { name: /cleared/i })).toBeVisible()
    await page
        .getByRole('button', { name: /^Menu$/ })
        .last()
        .click()
    await page.reload()
    await expect(page.getByRole('button', { name: /^Play$/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /resume game/i })).toBeHidden()
})
