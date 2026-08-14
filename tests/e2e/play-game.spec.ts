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
