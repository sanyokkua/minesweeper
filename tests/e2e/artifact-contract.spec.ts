import { test, expect } from '@playwright/test'
import { existsSync, readFileSync, readdirSync } from 'node:fs'

test('built artifact contains the Pages base and local PWA files', () => {
    const manifest = JSON.parse(readFileSync('dist/manifest.webmanifest', 'utf8')) as {
        start_url: string
        scope: string
    }
    expect(manifest.start_url).toBe('/minesweeper/')
    expect(manifest.scope).toBe('/minesweeper/')
    for (const file of ['dist/index.html', 'dist/sw.js', 'dist/icon-192.png', 'dist/icon-512.png'])
        expect(existsSync(file)).toBe(true)
})

test('built artifact precaches both repository-local application fonts', () => {
    const assets = readdirSync('dist/assets')
    const worker = readFileSync('dist/sw.js', 'utf8')

    expect(assets.some((file) => file.endsWith('.woff2'))).toBe(true)
    expect(assets.some((file) => file.endsWith('.ttf'))).toBe(true)
    expect(worker).toContain('.woff2')
    expect(worker).toContain('.ttf')
})

test('built artifact includes a deterministic application build stamp', () => {
    const html = readFileSync('dist/index.html', 'utf8')
    const assets = [html]
    for (const file of ['dist/assets']) {
        if (!existsSync(file)) continue
        assets.push(...readdirSync(file).map((asset) => readFileSync(`${file}/${asset}`, 'utf8')))
    }
    const source = assets.join('\n')
    expect(source).toContain('App Build')
    expect(source).toMatch(/dev version|\d{4}\.\d{2}\.\d{2} At \d{2}:\d{2}/)
})
