import { test, expect, type Page } from '@playwright/test'
import { isRequiredApplicationRequest, serveDist } from './support/serveDist'

function trackRequiredOfflineRequests(page: Page) {
    const required: string[] = []
    const failures: string[] = []
    page.on('request', (request) => {
        if (isRequiredApplicationRequest(request)) required.push(`${request.resourceType()}: ${request.url()}`)
    })
    page.on('requestfailed', (request) => {
        if (isRequiredApplicationRequest(request))
            failures.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'failed'}`)
    })
    page.on('response', (response) => {
        if (response.status() >= 400 && isRequiredApplicationRequest(response.request()))
            failures.push(`${response.status()} ${response.url()}`)
    })
    return { required, failures }
}

test('keeps gameplay available when service workers are unsupported', async ({ page }) => {
    await page.goto('./')
    await expect(page.getByRole('button', { name: /^Play$/ })).toBeVisible()
    await page.getByRole('button', { name: /^Play$/ }).click()
    await expect(page.getByRole('grid')).toBeVisible()
})

test.describe('production artifact lifecycle', () => {
    test.skip(({ browserName }) => browserName !== 'chromium', 'service-worker cold-page proof uses Chromium')

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
            const requests = trackRequiredOfflineRequests(offline)
            await offline.goto(url)
            await expect(offline.getByRole('heading', { name: 'Minesweeper', exact: true })).toBeVisible()
            await offline.getByRole('button', { name: /custom/i }).click()
            await offline.getByRole('spinbutton', { name: /rows/i }).fill('5')
            await offline.getByRole('spinbutton', { name: /columns/i }).fill('5')
            await offline.getByRole('spinbutton', { name: /mines/i }).fill('24')
            await offline.getByRole('button', { name: /^Play$/ }).click()
            await expect(offline.getByRole('grid', { name: /game board/i })).toBeVisible()
            await offline.getByRole('gridcell').first().click()
            await expect(offline.getByRole('dialog', { name: /cleared|mine hit/i })).toBeVisible()
            expect(requests.required.length).toBeGreaterThan(0)
            expect(requests.failures).toEqual([])
            test.info().annotations.push({
                type: 'offline-required-requests',
                description: `required=${requests.required.length}; failures=${requests.failures.length}`,
            })
        } finally {
            await context.close()
            await new Promise<void>((resolveClose) => server.close(() => resolveClose()))
        }
    })

    test('resumes a retained active board and finishes it from a new offline page', async ({ browser }) => {
        const { server, url } = await serveDist(0)
        const context = await browser.newContext()
        try {
            const online = await context.newPage()
            await online.goto(url)
            await online.waitForFunction(async () => {
                if (!('serviceWorker' in navigator)) return false
                const registration = await navigator.serviceWorker.ready
                return registration.active?.state === 'activated'
            })
            await online.reload()
            await online.waitForFunction(() => Boolean(navigator.serviceWorker?.controller))
            await online.getByRole('button', { name: /custom/i }).click()
            await online.getByRole('spinbutton', { name: /rows/i }).fill('5')
            await online.getByRole('spinbutton', { name: /columns/i }).fill('5')
            await online.getByRole('spinbutton', { name: /mines/i }).fill('24')
            await online.getByRole('button', { name: /^Play$/ }).click()
            await online.getByRole('gridcell').first().click({ button: 'right' })
            await expect(online.getByRole('gridcell').first()).toHaveAttribute('aria-label', /flagged/i)
            await online.reload()
            await expect(online.getByRole('button', { name: /resume game/i })).toBeVisible()

            await context.setOffline(true)
            const offline = await context.newPage()
            const requests = trackRequiredOfflineRequests(offline)
            await offline.goto(url)
            await offline.getByRole('button', { name: /resume game/i }).click()
            const first = offline.getByRole('gridcell').first()
            await expect(first).toHaveAttribute('aria-label', /flagged/i)
            await first.click()
            await first.click()
            await expect(offline.getByRole('dialog', { name: /cleared/i })).toBeVisible()
            expect(requests.required.length).toBeGreaterThan(0)
            expect(requests.failures).toEqual([])
            test.info().annotations.push({
                type: 'offline-required-requests',
                description: `resume required=${requests.required.length}; failures=${requests.failures.length}`,
            })
        } finally {
            await context.close()
            await new Promise<void>((resolveClose) => server.close(() => resolveClose()))
        }
    })

    test('shows the install control only after a real install prompt event', async ({ page }) => {
        const { server, url } = await serveDist(0)
        try {
            await page.goto(url)
            await page.waitForFunction(async () => {
                if (!('serviceWorker' in navigator)) return false
                const registration = await navigator.serviceWorker.ready
                return registration.active?.state === 'activated'
            })
            await page.reload()
            await page.waitForFunction(() => Boolean(navigator.serviceWorker?.controller))
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
        } finally {
            await new Promise<void>((resolveClose) => server.close(() => resolveClose()))
        }
    })

    test('removes the install control after the appinstalled lifecycle event', async ({ page }) => {
        const { server, url } = await serveDist(0)
        try {
            await page.goto(url)
            await page.waitForFunction(async () => {
                if (!('serviceWorker' in navigator)) return false
                const registration = await navigator.serviceWorker.ready
                return registration.active?.state === 'activated'
            })
            await page.reload()
            await page.waitForFunction(() => Boolean(navigator.serviceWorker?.controller))
            await page.evaluate(() => {
                window.dispatchEvent(
                    Object.assign(new Event('beforeinstallprompt'), {
                        prompt: async () => undefined,
                        userChoice: Promise.resolve({ outcome: 'dismissed' as const }),
                    }),
                )
            })
            await expect(page.getByRole('button', { name: /install app/i })).toBeVisible()
            await page.evaluate(() => window.dispatchEvent(new Event('appinstalled')))
            await expect(page.getByRole('button', { name: /install app/i })).toBeHidden()
        } finally {
            await new Promise<void>((resolveClose) => server.close(() => resolveClose()))
        }
    })

    test('waits for explicit acceptance before activating a two-revision update', async ({ browser }) => {
        const { server, url, setServiceWorkerRevision } = await serveDist(0)
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
            await page.getByRole('button', { name: /^Play$/ }).click()
            await page.getByRole('gridcell').first().click({ button: 'right' })
            await page.getByLabel('Settings').click()
            await expect(page.getByRole('dialog', { name: /settings/i })).toBeVisible()

            setServiceWorkerRevision(2)
            await page.evaluate(() => window.dispatchEvent(new Event('online')))
            await expect(page.getByRole('button', { name: /^Update$/ })).toBeVisible({ timeout: 15_000 })
            await expect(page.getByRole('grid')).toBeVisible()
            await expect(page.getByRole('dialog', { name: /settings/i })).toBeVisible()

            const beforeAcceptanceUrl = page.url()
            await page.getByRole('button', { name: /^Update$/ }).click()
            await page.waitForFunction(() => Boolean(navigator.serviceWorker?.controller))
            await expect(page).toHaveURL(beforeAcceptanceUrl)
            await expect
                .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('minesweeper.local-state') ?? '{}')))
                .toMatchObject({ resumableGame: { status: 'ready' } })
        } finally {
            await context.close()
            await new Promise<void>((resolveClose) => server.close(() => resolveClose()))
        }
    })

    test('dismisses one Update ready notice and does not duplicate it after returning online', async ({ browser }) => {
        const { server, url, setServiceWorkerRevision } = await serveDist(0)
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
            await page.getByRole('button', { name: /^Play$/ }).click()
            await page.getByLabel('Settings').click()

            setServiceWorkerRevision(2)
            await page.evaluate(() => window.dispatchEvent(new Event('online')))
            await expect(page.getByRole('button', { name: /^Update$/ })).toBeVisible({ timeout: 15_000 })
            await expect(page.getByRole('dialog', { name: /settings/i })).toBeVisible()
            await page.getByRole('button', { name: /^Dismiss$/ }).click()
            await expect(page.getByRole('button', { name: /^Update$/ })).toBeHidden()
            await expect(page.getByRole('dialog', { name: /settings/i })).toBeVisible()

            await page.evaluate(() => window.dispatchEvent(new Event('online')))
            await page.waitForTimeout(250)
            await expect(page.getByRole('button', { name: /^Update$/ })).toBeHidden()
            await expect(page.getByRole('grid')).toBeVisible()
        } finally {
            await context.close()
            await new Promise<void>((resolveClose) => server.close(() => resolveClose()))
        }
    })

    test('refuses a waiting update when production persistence fails', async ({ browser }) => {
        const { server, url, setServiceWorkerRevision } = await serveDist(0)
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
            await page.getByRole('button', { name: /^Play$/ }).click()

            setServiceWorkerRevision(2)
            await page.evaluate(() => window.dispatchEvent(new Event('online')))
            await expect(page.getByRole('button', { name: /^Update$/ })).toBeVisible({ timeout: 15_000 })
            const urlBeforeRefusal = page.url()
            await page.evaluate(() => {
                Storage.prototype.setItem = () => {
                    throw new Error('forced persistence failure')
                }
            })
            await page.getByRole('button', { name: /^Update$/ }).click()
            await page.waitForTimeout(250)

            await expect(page).toHaveURL(urlBeforeRefusal)
            await expect(page.getByRole('grid')).toBeVisible()
        } finally {
            await context.close()
            await new Promise<void>((resolveClose) => server.close(() => resolveClose()))
        }
    })
})
