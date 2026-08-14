import { test, expect } from '@playwright/test'

test('starts a preset and reveals a safe cell', async ({ page }) => {
    await page.goto('./')
    await expect(page.getByRole('heading', { name: 'Minesweeper', exact: true })).toBeVisible()
    await page.getByRole('button', { name: /^Play$/ }).click()
    await expect(page.getByRole('grid', { name: /game board/i })).toBeVisible()
    await page.getByRole('gridcell').first().click()
    await expect(page.getByText(/flags remaining/i)).toBeVisible()
})

test('supports a secondary flag action without opening the browser menu', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: /^Play$/ }).click()
    const first = page.getByRole('gridcell').first()
    await first.click({ button: 'right' })
    await expect(first).toHaveAttribute('aria-label', /flagged|unopened/i)
})

test('reaches a deterministic loss state and locks the terminal board', async ({ page }) => {
    test.setTimeout(60_000)
    await page.goto('./')
    await page.getByRole('button', { name: /custom/i }).click()
    await page.getByRole('spinbutton', { name: /rows/i }).fill('5')
    await page.getByRole('spinbutton', { name: /columns/i }).fill('5')
    await page.getByRole('spinbutton', { name: /mines/i }).fill('23')
    await page.getByLabel('Settings').click()
    await page.getByRole('button', { name: /reveal first/i }).click()
    await page.getByRole('button', { name: /close settings/i }).click()
    await page.getByRole('button', { name: /^Play$/ }).click()
    await page.getByRole('gridcell').first().click()

    const outcome = page.getByRole('dialog', { name: /mine hit/i })
    for (let index = 1; index < 25 && !(await outcome.isVisible()); index += 1) {
        await page.getByRole('gridcell').nth(index).click()
    }
    await expect(outcome).toBeVisible()
    await expect(page.getByRole('gridcell', { name: /detonated mine/i })).toBeVisible()
})

test('dismisses the terminal result without leaving the projected board', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: /custom/i }).click()
    await page.getByRole('spinbutton', { name: /rows/i }).fill('5')
    await page.getByRole('spinbutton', { name: /columns/i }).fill('5')
    await page.getByRole('spinbutton', { name: /mines/i }).fill('24')
    await page.getByRole('button', { name: /^Play$/ }).click()
    await page.getByRole('gridcell').first().click()
    await expect(page.getByRole('dialog', { name: /cleared/i })).toBeVisible()

    await page.getByRole('button', { name: /close result/i }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(page.getByRole('gridcell', { name: /flagged/i })).toHaveCount(24)
    await expect(page.getByRole('gridcell', { name: /open/i })).toBeVisible()
})

for (const [kind, cells] of [
    ['beginner', 81],
    ['intermediate', 256],
    ['expert', 576],
] as const) {
    test(`reaches a locked loss projection for ${kind}`, async ({ page }) => {
        await page.goto('./')
        await page.getByRole('button', { name: new RegExp(kind, 'i') }).click()
        await page.getByRole('button', { name: /^Play$/ }).click()
        const outcome = page.getByRole('dialog', { name: /mine hit/i })
        for (let index = 0; index < cells && !(await outcome.isVisible()); index += 1) {
            await page.getByRole('gridcell').nth(index).click()
        }
        await expect(outcome).toBeVisible()
        await expect(page.getByRole('gridcell', { name: /detonated mine/i })).toBeVisible()
        await expect(page.getByRole('button', { name: /reset game/i })).toBeVisible()
    })
}
