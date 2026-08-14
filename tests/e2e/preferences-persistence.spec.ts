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
