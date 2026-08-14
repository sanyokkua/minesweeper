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
  await page.getByRole('button', { name: /settings/i }).click()
  await page.getByRole('button', { name: 'Українська' }).click()
  await expect(page.getByRole('dialog')).toContainText('Налаштування')
})
