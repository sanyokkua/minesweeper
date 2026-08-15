# Minesweeper

Private, bilingual Minesweeper PWA built as a static Vite SPA for GitHub Pages at
`/minesweeper/`.

## Local setup

- Node.js 22.22.2 or newer (the locked jsdom release requires this Node 22 floor)
- `npm ci`
- `npm run dev`

The application has no runtime server dependency. Local state stays in the browser under one
versioned `localStorage` record.

Project source: https://github.com/sanyokkua/minesweeper

## Quality commands

```sh
npm ci
npm run format:check
npm run lint
npm run typecheck
npm run validate:lifecycle-storage
npm run test:unit
npm run build
npm run validate:artifact
npm run e2e
npm run validate
```

Playwright failure screenshots, videos, traces, and HTML reports are retained in CI. The
production artifact is always built with the `/minesweeper/` base path before deployment.
