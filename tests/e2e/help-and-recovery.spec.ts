import { test, expect } from '@playwright/test'

test('opens Help and returns to Home from Game', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: /how to play/i }).click()
  await expect(page.getByRole('dialog', { name: /how to play/i })).toBeVisible()
  await page.getByRole('button', { name: /close help/i }).click()
  await page.getByRole('button', { name: /^Play$/ }).click()
  await page.getByRole('button', { name: /back to home/i }).click()
  await expect(page.getByRole('heading', { name: 'Minesweeper', exact: true })).toBeVisible()
})
