import { test, expect } from '@playwright/test'
import { serveDist } from './support/serveDist'

test('keeps gameplay available when service workers are unsupported', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('button', { name: /^Play$/ })).toBeVisible()
  await page.getByRole('button', { name: /^Play$/ }).click()
  await expect(page.getByRole('grid')).toBeVisible()
})

test.describe('production artifact lifecycle', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'service-worker cold-page proof uses Chromium',
  )

  test('controls a new offline page after an online production visit', async ({ browser }) => {
    const { server, url } = await serveDist(0)
    const context = await browser.newContext()
    try {
      const page = await context.newPage()
      await page.goto(url)
      await page.waitForFunction(async () => {
        if (!('serviceWorker' in navigator)) return false
        const registration = await navigator.serviceWorker.ready
        return registration.active?.state === 'activated'
      })
      await page.reload()
      await page.waitForFunction(() => Boolean(navigator.serviceWorker?.controller))
      expect(await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL)).toContain(
        '/minesweeper/sw.js',
      )

      await context.setOffline(true)
      const offline = await context.newPage()
      await offline.goto(url)
      await expect(offline.getByRole('heading', { name: 'Minesweeper', exact: true })).toBeVisible()
      await offline.getByRole('button', { name: /^Play$/ }).click()
      await expect(offline.getByRole('grid', { name: /game board/i })).toBeVisible()
    } finally {
      await context.close()
      await new Promise<void>((resolveClose) => server.close(() => resolveClose()))
    }
  })

  test('shows the install control only after a real install prompt event', async ({ page }) => {
    await page.goto('./')
    await page.evaluate(() => {
      const event = Object.assign(new Event('beforeinstallprompt'), {
        prompt: async () => undefined,
        userChoice: Promise.resolve({ outcome: 'accepted' as const }),
      })
      window.dispatchEvent(event)
    })
    await expect(page.getByRole('button', { name: /install app/i })).toBeVisible()
    await page.getByRole('button', { name: /install app/i }).click()
    await expect(page.getByRole('button', { name: /install app/i })).toBeHidden()
  })
})
