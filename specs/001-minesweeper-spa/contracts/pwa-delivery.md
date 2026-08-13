# PWA and Static Delivery Contract

## Build and deployment

- Vite must build only static `dist` with `base: '/minesweeper/'`.
- Every generated/hand-built asset, manifest URL, icon URL, service-worker URL, service-worker scope, `id`, and `start_url` must resolve under `/minesweeper/`.
- Publish only `dist` through GitHub Pages Actions after lockfile install, quality checks, build, and artifact validation. PR jobs must not deploy.
- No runtime API, host rewrite, server route, secret, remote font, remote icon, remote translation, analytics, or gameplay network dependency is permitted.

## Cache, install, and update behavior

- The generated worker precaches the application shell, local gameplay assets, manifest, local icons, and Vite hashed assets. Required assets missing from precache/artifact validation fail delivery.
- Installation control exists only while a real `beforeinstallprompt` is deferred. Prompt only from a user gesture; unsupported, declined, and registration-failed paths remain playable without a false install/offline claim.
- Online startup and subsequent `online` events check for updates. A waiting worker displays one localized nonblocking Update ready notice; it does not reload or activate itself.
- User acceptance flushes an active session successfully before activation/reload. Flush failure retains the old page and shows recovery. Offline before a successful controlled online visit is not promised; offline after that visit must be playable.

## Required artifact evidence

Serve built `dist` at `/minesweeper/`, not a Vite dev server. In a fresh persistent Chromium context: visit online, wait for registration and control after reload, create or hydrate an active game, close/reopen offline, and finish it without a failed required request. Test two static revisions on the same origin/path to prove waiting update, no auto reload, explicit acceptance, persistence-before-activation, and failure-safe refusal to update.
