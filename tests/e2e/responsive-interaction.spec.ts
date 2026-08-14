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

test.describe('touch long press', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })

  test('keeps a flag after the touch context-menu follow-up click', async ({
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
