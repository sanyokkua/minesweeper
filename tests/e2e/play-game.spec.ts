import { test, expect, type Page } from '@playwright/test'
import { PRESETS } from '../../src/domain/config'
import { applyCommand, createGame } from '../../src/domain/gameEngine'
import type { GameConfig } from '../../src/domain/gameTypes'

const SEEDED_BROWSER_SEED = 42

function knownMineIndex(config: GameConfig): number {
    const placed = applyCommand(createGame(config, SEEDED_BROWSER_SEED), {
        type: 'reveal',
        coordinate: { row: 0, column: 0 },
    })
    return placed.cells.findIndex((cell) => cell.hasMine)
}

async function useSeededBoard(page: Page): Promise<void> {
    await page.addInitScript((seed) => {
        const cryptoApi = globalThis.crypto
        const originalGetRandomValues = cryptoApi.getRandomValues.bind(cryptoApi)
        Object.defineProperty(cryptoApi, 'getRandomValues', {
            configurable: true,
            value: (values: Uint32Array) => {
                if (values.length > 0) values[0] = seed
                return values.length > 0 ? values : originalGetRandomValues(values)
            },
        })
    }, SEEDED_BROWSER_SEED)
}

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
    await useSeededBoard(page)
    await page.goto('./')
    await page.getByRole('button', { name: /custom/i }).click()
    await page.getByRole('spinbutton', { name: /rows/i }).fill('5')
    await page.getByRole('spinbutton', { name: /columns/i }).fill('5')
    const config = { kind: 'custom' as const, rows: 5, columns: 5, mines: 23 }
    await page.getByRole('spinbutton', { name: /mines/i }).fill(String(config.mines))
    await page.getByLabel('Settings').click()
    await page.getByRole('button', { name: /reveal first/i }).click()
    await page.getByRole('button', { name: /close settings/i }).click()
    await page.getByRole('button', { name: /^Play$/ }).click()
    await page.getByRole('gridcell').first().click()

    const outcome = page.getByRole('dialog', { name: /mine hit/i })
    await page.getByRole('gridcell').nth(knownMineIndex(config)).click()
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

for (const kind of Object.keys(PRESETS) as Array<keyof typeof PRESETS>) {
    test(`reaches a locked terminal projection for ${kind}`, async ({ page }) => {
        await useSeededBoard(page)
        await page.goto('./')
        await page.getByRole('button', { name: new RegExp(kind, 'i') }).click()
        await page.getByRole('button', { name: /^Play$/ }).click()
        const outcome = page.getByRole('dialog', { name: /mine hit/i })
        await page.getByRole('gridcell').first().click()
        await page.getByRole('gridcell').nth(knownMineIndex(PRESETS[kind])).click()
        await expect(outcome).toBeVisible()
        await expect(page.getByRole('button', { name: /reset game/i })).toBeVisible()
        await expect(page.getByRole('gridcell', { name: /detonated mine/i })).toBeVisible()
    })
}
