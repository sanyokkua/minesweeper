import { test, expect } from '@playwright/test'

test('keeps gameplay available when service workers are unsupported', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('button', { name: /^Play$/ })).toBeVisible()
  await page.getByRole('button', { name: /^Play$/ }).click()
  await expect(page.getByRole('grid')).toBeVisible()
})
