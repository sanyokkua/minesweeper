# Validation Quickstart: Minesweeper Static SPA

Use this guide after implementation. It validates the product against the contracts rather than substituting for their tests.

## Prerequisites

- Node.js 22.12+ and the repository's committed lockfile.
- Playwright browsers installed from the project's documented script.
- A clean browser profile for production-artifact PWA checks.

## Quality and static artifact

1. Install strictly from the lockfile: `npm ci`.
2. Run the documented formatter, lint, non-emitting typecheck, unit/component, and browser commands.
3. Build: `npm run build`.
4. Serve only `dist` at `/minesweeper/`; do not use the Vite development server for the next checks.
5. Assert the built HTML, manifest, icon URLs, service-worker registration/scope, and all required local assets remain under `/minesweeper/`; confirm no remote gameplay request or runtime API is required.

## Core journeys

1. At initial Home, verify Beginner selection and reach first safe reveal in no more than three intentional interactions.
2. For every preset and a valid Custom game, run seeded tests for delayed exact mine placement, counts, flood fill, flag cap, flagged reveal clearing, loss, win/auto-flags, and terminal lockout. Record the documented 30x30 reveal/flag timing result.
3. Change input mode; verify mouse primary/secondary, board-only context-menu prevention, keyboard Arrow/Enter/Space/F behavior, initial top-left focus, and touch 600-ms long press/movement cancellation.
4. At 320, 768, and 1440 px, verify all controls and 24x24 board cells are reachable, cells remain >=32px, the board viewport alone scrolls, and page horizontal overflow is absent.
5. Change locale/theme with Help or Settings open; verify all visible text/theme, including the sheet, updates immediately. Verify system-theme fallback and both language catalogs.
6. Verify active-game Home return/resume/new confirmation, visible/sheet timer pauses, reload pause, exact-config replay, records, Custom recency/100-entry eviction, storage recovery, and reset-local-data while a live board stays playable but cannot later resume.

## PWA and Pages lifecycle

1. In a fresh persistent Chromium profile, visit the production artifact online, wait for service-worker registration, reload until controlled, then go offline and open a new page at `/minesweeper/`. Start or resume and finish a game with no failed required request.
2. Verify manifest/id/start/scope/icons and conditional install behavior; treat unavailable platform installation as an expected progressive-enhancement outcome, not an error.
3. Run the two-revision update test. Confirm a waiting release shows Update ready without reloading; choosing it persists the active session before activation. Force persistence failure and confirm no activation/reload occurs.
4. Inspect the Pages workflow: lockfile install, quality/build/artifact gates before `dist` upload, least-privilege permissions, concurrency protection, and no PR deployment.
