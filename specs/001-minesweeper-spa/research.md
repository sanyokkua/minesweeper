# Research: Minesweeper Static SPA

**Feature**: [Minesweeper Static SPA](spec.md)  
**Updated**: 2026-08-14  
**Purpose**: Decisions supporting [plan.md](plan.md). The constitution and specification remain authoritative.

## Decisions

### Pure deterministic game engine

**Decision**: Put all board rules in a pure TypeScript domain layer with `createGame`, `applyCommand`, and deterministic delayed mine placement. It takes a seed/RNG supplied by the app, stores row-major cells, and has no React, Redux, clock, storage, or browser import.

**Rationale**: Fixed seeds make first-click safety, exact mine count, neighbor counts, flood-fill, loss/win, and performance tests reproducible. The required single-cell exclusion is guaranteed by sampling only from every index except the genuinely opened first cell. An iterative queue prevents recursion depth risk on a 900-cell board.

**Alternatives considered**: `Math.random` inside a reducer/domain was rejected because test fixtures and resumed games become nondeterministic. Board calculations in components were rejected because it violates the constitution's single domain authority.

### Redux, timer, and persistence boundaries

**Decision**: Redux Toolkit is authoritative for hydrated game, preferences/records, and app-shell state. Timer actions carry injected timestamps; a controller schedules only eligible ticks. The one versioned local record is decoded/validated/encoded by pure functions and read/written by a caught-exception adapter.

**Rationale**: A paused persisted snapshot holds accumulated elapsed time only, so closed, hidden, Home, and modal time cannot accrue. It makes storage corruption/quota failure and reset-local-data-with-live-board deterministic and testable.

**Alternatives considered**: Component state/localStorage duplicates authority. `redux-persist` adds an unnecessary dependency and makes the mandated selective persistence/reset/error behavior less explicit.

### Localization, appearance, and responsive interaction

**Decision**: Use a typed local English/Ukrainian catalog and CSS semantic tokens. Persist locale and the light/dark/system preference, render only resolved `data-theme`, and have a shared board interaction adapter for pointer, touch, and keyboard.

**Rationale**: Open sheets rerender immediately from selectors; system appearance safely degrades if media-query observation is unavailable. Roving board focus avoids a 900-stop tab sequence; pointer movement can cancel a long press without suppressing normal scroll.

**Alternatives considered**: An external i18n package, component library, CSS-in-JS, breakpoint-specific UI, and shrinking board cells were rejected as unneeded dependencies or violations of the UI/32px contracts.

### Vite static Pages/PWA delivery

**Decision**: Build one Vite SPA with `base: '/minesweeper/'`; keep navigation in app state. Use a compatibility-verified current `vite-plugin-pwa`/Workbox generated service worker in prompt-update mode, a base-aligned manifest, local-only precache, and a gateway for install/update APIs.

**Rationale**: GitHub project Pages serves at the repository subpath, and service-worker scope cannot be assumed at `/`. Prompt update means a waiting release is visible but cannot activate/reload until the player chooses and the live session flush succeeds.

**Alternatives considered**: `base: '/'` works only for root deployment; `base: './'` conceals the stated Pages contract; auto-update can discard a live game; a server router/deep-link rewrite is outside the static product scope.

### Evidence strategy

**Decision**: Use fixed-seed domain/reducer/persistence tests, component semantic/a11y tests, cross-engine Playwright journeys, and Chromium production-artifact PWA lifecycle tests.

**Rationale**: Service-worker/offline claims require a built `dist` under `/minesweeper/`, an online first visit, worker control after reload, and then a new offline page in the same persistent context. A dev route or open cached page is not evidence.

**Alternatives considered**: Unit-only or development-server-only checks cannot prove touch, layout, Pages paths, install, cache, or update behavior.

## Reference reconciliation

`docs/minesweeper-web-spec.md` and `docs/minesweeper-mockup-v2.html` provide game/visual intent only. Their Next.js, English-only, remote-font, prototype, and optional-resume material is superseded by the constitution, feature spec, and `ui-contract.md`.

## Sources checked

- [Vite getting started](https://vite.dev/guide/) documents current Vite support and static builds.
- [Vite static deployment](https://vite.dev/guide/static-deploy.html) documents project Pages base-path deployment.
- [Redux Toolkit TypeScript quick start](https://redux-toolkit.js.org/tutorials/typescript) supports typed store/hooks and slice patterns.
- [Playwright service workers](https://playwright.dev/docs/service-workers) covers activation/control and test interaction.
- [PWA installability guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable) and [service-worker guide](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers) cover manifest/install/cache lifecycle.
