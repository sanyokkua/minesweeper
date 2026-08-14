import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('Pages workflow contract', () => {
  it('uploads only dist after lockfile quality gates with least privilege', () => {
    const workflow = readFileSync('.github/workflows/pages.yml', 'utf8')
    expect(workflow).toContain('npm ci')
    expect(workflow).toContain('npm run validate')
    expect(workflow).toContain('path: dist')
    expect(workflow).toContain('pages: write')
    expect(workflow).toContain('id-token: write')
    expect(workflow).toContain('concurrency:')
  })
})
