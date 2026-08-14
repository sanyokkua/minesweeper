import { test, expect } from '@playwright/test'
import { existsSync, readFileSync } from 'node:fs'

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
