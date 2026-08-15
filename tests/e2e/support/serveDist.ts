import { createServer, type Server, type IncomingMessage, type ServerResponse } from 'node:http'
import { createReadStream, existsSync, readFileSync } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'

const mime: Record<string, string> = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.webmanifest': 'application/manifest+json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
}
export function serveDist(
    port = 4173,
): Promise<{ server: Server; url: string; setServiceWorkerRevision: (revision: number) => void }> {
    const distRoot = resolve('dist')
    const serviceWorkerSource = readFileSync(join(distRoot, 'sw.js'), 'utf8')
    let serviceWorkerRevision = 1
    const server = createServer((request: IncomingMessage, response: ServerResponse) => {
        const pathname = new URL(request.url ?? '/', 'http://localhost').pathname.replace(/^\/minesweeper\/?/, '')
        const safe = normalize(pathname || 'index.html')
        const candidate = resolve(distRoot, safe)
        const target =
            candidate.startsWith(`${distRoot}/`) && existsSync(candidate) ? candidate : join(distRoot, 'index.html')
        if (safe === 'sw.js' && serviceWorkerRevision > 1) {
            response.setHeader('content-type', mime['.js'])
            response.end(`${serviceWorkerSource}\n/* production fixture revision ${serviceWorkerRevision} */\n`)
            return
        }
        response.setHeader('content-type', mime[extname(target)] ?? 'application/octet-stream')
        createReadStream(target).pipe(response)
    })
    return new Promise((resolveResult) =>
        server.listen(port, '127.0.0.1', () => {
            const address = server.address()
            const actualPort = typeof address === 'object' && address ? address.port : port
            resolveResult({
                server,
                url: `http://127.0.0.1:${actualPort}/minesweeper/`,
                setServiceWorkerRevision: (revision) => {
                    serviceWorkerRevision = revision
                },
            })
        }),
    )
}

export function isRequiredApplicationRequest(request: {
    url: () => string
    method: () => string
    resourceType: () => string
}): boolean {
    if (request.method() !== 'GET') return false
    const url = new URL(request.url())
    if (!url.pathname.startsWith('/minesweeper/')) return false
    return (
        ['document', 'script', 'stylesheet', 'font', 'manifest', 'image'].includes(request.resourceType()) ||
        /\.(?:html|js|css|webmanifest|png|svg|woff2|ttf)$/.test(url.pathname)
    )
}
