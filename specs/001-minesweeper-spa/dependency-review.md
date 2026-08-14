# Dependency review

Reviewed 2026-08-14 for the supported Node 22.12+ and current Chromium, Firefox, and WebKit
baseline. All runtime dependencies are local, maintained, MIT/Apache-compatible packages; no
analytics, remote asset, network data, or server dependency is permitted.

| Package                          |           Locked version | Need                               | Review                                                                      |
| -------------------------------- | -----------------------: | ---------------------------------- | --------------------------------------------------------------------------- |
| React / React DOM                |                   19.2.8 | UI rendering                       | React 19 is stable and supported by the official React documentation.       |
| Redux Toolkit / React Redux      |           2.12.0 / 9.2.0 | authoritative client state         | Official TypeScript setup and maintained packages.                          |
| Vite / React plugin              |            8.2.1 / 6.0.5 | static build and JSX transform     | Current maintained Vite line; Node floor is documented in the project plan. |
| vite-plugin-pwa                  |                    1.3.0 | generated prompt-update worker     | Workbox-backed static precache; isolated behind `src/pwa`.                  |
| Vitest / Testing Library / jsdom | 4.1.10 / 16.3.2 / 30.0.1 | unit and component contracts       | Test-only dependencies.                                                     |
| Playwright                       |                   1.62.1 | cross-engine and artifact evidence | Test-only dependency; Chromium/Firefox/WebKit projects.                     |
| TypeScript / ESLint / Prettier   |   5.9.3 / 10.8.1 / 3.9.6 | strict source quality              | Build/test-only dependencies; lockfile is authoritative.                    |

The lockfile records the resolved transitive graph. New dependencies require a documented unmet
need and the same support/security/license review.
