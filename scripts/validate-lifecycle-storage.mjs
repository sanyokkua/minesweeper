import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { stdout } from 'node:process'

const file = resolve('tests/component/app-lifecycle.test.tsx')
const source = readFileSync(file, 'utf8')
const forbidden = [
    ['ambient localStorage', /\blocalStorage\b/],
    ['Storage.prototype', /\bStorage\.prototype\b/],
    ['default createStorageGateway()', /createStorageGateway\(\)/],
]
const violations = forbidden.filter(([, pattern]) => pattern.test(source)).map(([name]) => name)

if (violations.length > 0) {
    throw new Error(`lifecycle storage boundary guard failed: ${violations.join(', ')}`)
}

stdout.write('lifecycle storage boundary guard passed\n')
