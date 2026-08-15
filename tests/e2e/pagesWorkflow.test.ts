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
        expect(workflow).toContain('branches: [master]')
        expect(workflow).toContain("if: github.ref == 'refs/heads/master'")
        expect(workflow).toContain('actions/checkout@v7.0.1')
        expect(workflow).toContain('actions/setup-node@v6.5.0')
        expect(workflow).toContain('actions/upload-pages-artifact@v5.0.0')
        expect(workflow).toContain('actions/deploy-pages@v5.0.0')
    })

    it('runs CI quality gates on every branch push and pull request', () => {
        const workflow = readFileSync('.github/workflows/ci.yml', 'utf8')
        expect(workflow).toMatch(/push:\s*\n\s*pull_request:/)
        expect(workflow).toContain('npm ci')
        expect(workflow).toContain('npm run format:check')
        expect(workflow).toContain('npm run build')
        expect(workflow).toContain('actions/checkout@v7.0.1')
        expect(workflow).toContain('actions/setup-node@v6.5.0')
        expect(workflow).toContain('actions/upload-artifact@v7.0.1')
    })

    it('keeps the formatting and repository-link policy explicit', () => {
        const prettier = JSON.parse(readFileSync('.prettierrc.json', 'utf8')) as {
            printWidth: number
            tabWidth: number
        }
        expect(prettier.printWidth).toBe(120)
        expect(prettier.tabWidth).toBe(4)
        expect(readFileSync('README.md', 'utf8')).toContain('https://github.com/sanyokkua/minesweeper')
        expect(readFileSync('README.md', 'utf8')).toContain('https://sanyokkua.github.io/minesweeper/')
    })
})
