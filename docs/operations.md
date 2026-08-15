# Operations and delivery

## Deployment model

The application is deployed as the Vite `dist` directory to GitHub Pages. The production site is rooted at `/minesweeper/`; this path is part of the Vite build, manifest, service-worker scope, and artifact checks.

There is no production server process. GitHub Pages serves static files; all game computation and local data handling occur in the browser.

## Continuous integration and Pages

### `.github/workflows/ci.yml`

The CI workflow runs on pushes and pull requests with `contents: read` permissions. It:

1. Checks out the repository.
2. Installs Node.js 22.22.2 with npm caching.
3. Runs `npm ci`.
4. Runs formatting, build, and the combined `npm run validate` gate.
5. Installs Chromium, Firefox, and WebKit Playwright browsers.
6. Runs Playwright even when an earlier step fails so browser evidence is retained.
7. Uploads `playwright-report/` and `test-results/` as failure diagnostics.

`BUILD_TIMESTAMP` is set from `github.run_started_at` in the CI environment.

### `.github/workflows/pages.yml`

The Pages workflow is configured for pushes to `main` and manual dispatch. Its build job is guarded by `github.ref == 'refs/heads/main'`, uses Node.js 22.22.2, installs from the lockfile, runs `npm run validate`, builds, validates the artifact, and uploads `dist` with `actions/upload-pages-artifact`.

The deploy job waits for the build job and uses `actions/deploy-pages` with `pages: write` and `id-token: write` only on the deployment job. Concurrency is grouped as `pages` with cancellation disabled.

`TODO: confirm` whether `main` or `master` is the intended repository default/release branch. The workflow currently uses `main`; local Git metadata reported `master`. This documentation records the discrepancy and does not change either branch configuration.

## Build configuration

| Key or source | Application effect |
|---|---|
| `vite.config.ts#base` | Sets asset and route base to `/minesweeper/`. |
| `BUILD_TIMESTAMP` | CI-provided build time; defaults to `dev version` locally. |
| `vite.config.ts#define` | Injects `__APP_BUILD_TIMESTAMP__` into the bundle. |
| `src/ui/components/BuildStamp.tsx#BuildStamp` | Renders the formatted build value in the footer. |
| `public/manifest.webmanifest` | Defines PWA ID, start URL, scope, standalone display mode, and local icon URLs. |
| `vite-plugin-pwa` configuration | Generates the service worker, navigation fallback, and local asset precache list. |

No `.env` value, secret, runtime host, API URL, database URL, or third-party service credential is required or documented.

## Artifact requirements

Run:

```sh
rtk npm run build
rtk npm run validate:artifact
```

`scripts/validate-artifact.mjs` checks that the built artifact preserves the `/minesweeper/` base path, manifest and icon URLs, service-worker registration/scope, local assets, font precaching, and the absence of external gameplay asset URLs. It also checks the generated build stamp contract.

For production browser checks, serve only `dist` below `/minesweeper/`. The offline test must use a fresh persistent browser context, visit online until the service worker controls the page, then open a new page while offline. A warm page that was cached before the test is not evidence of cold-start offline support.

## PWA lifecycle

- Registration is attempted only in a browser context while online.
- The worker precaches local build files and handles navigation fallback to `/minesweeper/index.html`.
- A waiting worker creates a localized Update ready notice; it does not activate automatically.
- Choosing Update calls `persistStore`, posts `SKIP_WAITING`, waits for controller change or failure, and reloads only after successful activation.
- If persistence fails, update activation is refused so a live session is not silently discarded.
- Installation is optional. `beforeinstallprompt` enables a prompt where supported; Android browsers without that event receive manual-install instructions; unsupported browsers expose no install action.

## Local data behavior

The only retained record is `minesweeper.local-state` in browser `localStorage`. It contains version 1 preferences, standard records, up to 100 Custom records, and an optional `ready` or `playing` active game.

- Completed games are not resumable after reload.
- Active and untouched boards can be resumed; pre-first-reveal flags remain valid and do not place mines or start the timer.
- Invalid or unavailable storage falls back to defaults and reports a localized non-blocking notice.
- A write/quota failure keeps the current board playable and does not delete existing data.
- Reset local data clears the retained record and resets preferences/records while keeping an already-open board playable until leaving or reloading.

## Release checks

The recommended local release sequence is:

```sh
rtk npm ci
rtk npm run format:check
rtk npm run lint
rtk npm run typecheck
rtk npm run validate:lifecycle-storage
rtk npm run test:unit
rtk npm run test:coverage
rtk npm run build
rtk npm run validate:artifact
rtk npm run validate:pages
rtk npm run e2e
```

Interpret results separately:

- Formatting, lint, typecheck, unit/component tests, coverage, build, artifact, and Pages checks are repository capability gates.
- Playwright browser skips must be reported as capability-scoped skips when a browser/platform cannot provide the tested feature; they are not product passes.
- Browser errors, failed assertions, missing required requests, incorrect base paths, and unexpected service-worker behavior are product/release failures.

## Troubleshooting

| Symptom | Check |
|---|---|
| Blank or missing assets locally | Open `/minesweeper/`, not the server root; verify `vite.config.ts#base`. |
| Offline test passes only on a reload | Use a fresh persistent context and a new offline page after service-worker control. |
| Install control is absent | Check service-worker readiness and browser installation capability; installation is progressive enhancement. |
| Update notice is absent | Confirm the browser is online, a waiting worker exists, and the service worker is active. |
| Saved progress is missing | Inspect `localStorage` key `minesweeper.local-state`; malformed records are intentionally discarded or recovered without the resumable game. |
| Playwright cannot bind its local server | Treat `listen EPERM` as an environment capability restriction, rerun the unchanged command with approved scoped host access, and report the restriction separately from product failures. |
| Pages deployment does not run | Check that the push is to the configured `main` branch and that the build/artifact gates pass. |

## License and assets

The application is MIT-licensed. The bundled Inter and Press Start 2P fonts are SIL Open Font License 1.1 assets; source links and license information are in [`../src/assets/fonts/README.md`](../src/assets/fonts/README.md).
