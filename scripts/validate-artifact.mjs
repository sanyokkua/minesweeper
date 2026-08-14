import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const required = ['index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'sw.js']
if (!existsSync('dist')) throw new Error('dist does not exist; run npm run build first')
for (const file of required)
  if (!existsSync(join('dist', file))) throw new Error(`missing dist/${file}`)
const manifest = JSON.parse(readFileSync(join('dist', 'manifest.webmanifest'), 'utf8'))
if (manifest.start_url !== '/minesweeper/' || manifest.scope !== '/minesweeper/')
  throw new Error('manifest is not base-aligned')
const files = readdirSync('dist', { recursive: true })
if (!files.some((file) => String(file).endsWith('.js')))
  throw new Error('no JavaScript asset in dist')
const html = readFileSync(join('dist', 'index.html'), 'utf8')
if (html.includes('http://') || html.includes('https://'))
  throw new Error('remote runtime dependency detected')
globalThis.console.log(`artifact ok: ${files.length} local files under /minesweeper/`)
