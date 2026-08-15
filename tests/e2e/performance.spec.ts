import { test, expect, type Page } from '@playwright/test'
import { serveDist } from './support/serveDist'

async function measureCellUpdate(
    page: Page,
    index: number,
    action: 'flag' | 'reveal',
    expected: RegExp,
): Promise<number> {
    return page.evaluate(
        ({ index: cellIndex, action: cellAction, expectedSource }) =>
            new Promise<number>((resolve, reject) => {
                const cell = document.querySelectorAll('[role="gridcell"]')[cellIndex]
                if (!(cell instanceof HTMLElement)) {
                    reject(new Error(`Missing grid cell ${cellIndex}`))
                    return
                }

                const expectedLabel = new RegExp(expectedSource)
                const started = performance.now()
                let timeoutId = 0
                const observer = new MutationObserver(() => {
                    if (expectedLabel.test(cell.getAttribute('aria-label') ?? '')) {
                        window.clearTimeout(timeoutId)
                        observer.disconnect()
                        resolve(performance.now() - started)
                    }
                })
                observer.observe(cell, { attributes: true, attributeFilter: ['aria-label'] })
                timeoutId = window.setTimeout(() => {
                    observer.disconnect()
                    reject(new Error(`Grid cell did not reach ${expectedSource}`))
                }, 1000)

                if (cellAction === 'flag') {
                    cell.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, button: 2, buttons: 2 }))
                } else {
                    cell.click()
                }
                observer.takeRecords()
                if (expectedLabel.test(cell.getAttribute('aria-label') ?? '')) {
                    window.clearTimeout(timeoutId)
                    observer.disconnect()
                    resolve(performance.now() - started)
                }
            }),
        { index, action, expectedSource: expected.source },
    )
}

test('30 by 30 engine interaction remains under the release budget', async () => {
    const { applyCommand, createGame } = await import('../../src/domain/gameEngine')
    const config = { kind: 'custom' as const, rows: 30, columns: 30, mines: 100 }
    const start = performance.now()
    applyCommand(createGame(config, 1), { type: 'reveal', coordinate: { row: 0, column: 0 } })
    expect(performance.now() - start).toBeLessThan(250)
})

test('30 by 30 visible reveal and flag updates remain under the release budget', async ({ browser }, testInfo) => {
    testInfo.skip(
        testInfo.project.name !== 'chromium',
        'SC-009 timing gate is measured in the documented Chromium release environment',
    )
    const { server, url } = await serveDist(0)
    const context = await browser.newContext()
    try {
        const page = await context.newPage()
        await page.goto(url)
        await page.getByRole('button', { name: /custom/i }).click()
        await page.getByRole('spinbutton', { name: /rows/i }).fill('30')
        await page.getByRole('spinbutton', { name: /columns/i }).fill('30')
        await page.getByRole('spinbutton', { name: /mines/i }).fill('100')
        await page.getByRole('button', { name: /^Play$/ }).click()

        const flagCell = page.getByRole('gridcell').first()
        const flagMs = await measureCellUpdate(page, 0, 'flag', /flagged/i)
        await expect(flagCell).toHaveAttribute('aria-label', /flagged/i)
        expect(flagMs).toBeLessThan(250)

        const firstCell = page.getByRole('gridcell').nth(1)
        const revealMs = await measureCellUpdate(page, 1, 'reveal', /open/i)
        await expect(firstCell).toHaveAttribute('aria-label', /open/i)
        expect(revealMs).toBeLessThan(250)
        console.log(`30x30 visible timings: flag=${flagMs.toFixed(1)}ms reveal=${revealMs.toFixed(1)}ms`)
    } finally {
        await context.close()
        await new Promise<void>((resolveClose) => server.close(() => resolveClose()))
    }
})
