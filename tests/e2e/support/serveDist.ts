import { createServer, type Server, type IncomingMessage, type ServerResponse } from 'node:http'
import { createReadStream, existsSync } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'

const mime: Record<string, string> = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.webmanifest': 'application/manifest+json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
}
export function serveDist(port = 4173): Promise<{ server: Server; url: string }> {
    const distRoot = resolve('dist')
    const server = createServer((request: IncomingMessage, response: ServerResponse) => {
        const pathname = new URL(request.url ?? '/', 'http://localhost').pathname.replace(/^\/minesweeper\/?/, '')
        const safe = normalize(pathname || 'index.html')
        const candidate = resolve(distRoot, safe)
        const target =
            candidate.startsWith(`${distRoot}/`) && existsSync(candidate) ? candidate : join(distRoot, 'index.html')
        response.setHeader('content-type', mime[extname(target)] ?? 'application/octet-stream')
        createReadStream(target).pipe(response)
    })
    return new Promise((resolveResult) =>
        server.listen(port, '127.0.0.1', () => {
            const address = server.address()
            const actualPort = typeof address === 'object' && address ? address.port : port
            resolveResult({ server, url: `http://127.0.0.1:${actualPort}/minesweeper/` })
        }),
    )
}
