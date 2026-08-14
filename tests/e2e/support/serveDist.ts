import { createServer, type Server, type IncomingMessage, type ServerResponse } from 'node:http'
import { createReadStream, existsSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'

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
  const server = createServer((request: IncomingMessage, response: ServerResponse) => {
    const pathname = new URL(request.url ?? '/', 'http://localhost').pathname.replace(
      /^\/minesweeper\/?/,
      '',
    )
    const safe = normalize(pathname || 'index.html').replace(/^\.\.(\/|\\)/, '')
    const file = join('dist', safe)
    const target = existsSync(file) ? file : join('dist', 'index.html')
    response.setHeader('content-type', mime[extname(target)] ?? 'application/octet-stream')
    createReadStream(target).pipe(response)
  })
  return new Promise((resolve) =>
    server.listen(port, '127.0.0.1', () =>
      resolve({ server, url: `http://127.0.0.1:${port}/minesweeper/` }),
    ),
  )
}
