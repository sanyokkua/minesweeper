import { test, expect } from '@playwright/test'

for (const width of [320, 768, 1440]) {
  test(`keeps the page horizontally contained at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.goto('./')
    await page.getByRole('button', { name: /^Play$/ }).click()
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
    await page.getByRole('gridcell').first().press('ArrowRight')
    await expect(page.getByRole('grid')).toBeVisible()
  })
}
