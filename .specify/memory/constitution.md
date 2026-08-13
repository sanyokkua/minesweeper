<!--
Sync Impact Report
- Version change: 1.1.0 -> 2.0.0
- Modified principles: I expanded with reference-parity rules; II redefined for Vite static SPA
  delivery; V expanded with dependency-selection rules; VI expanded with Pages artifact evidence.
- Added sections: static-host routing and PWA cache/update rules.
- Removed sections: none.
- Follow-up TODOs: none.
-->

# Minesweeper Web Constitution

## Core Principles

### I. Faithful Game Rules First
The game engine MUST preserve the specified minesweeper rules: first-reveal safety, mine
placement, neighbour counts, flood-fill, flag limits, terminal states, and timer behaviour.
One domain engine MUST be the sole authority for these rules; UI code may issue commands and render
snapshots but MUST NOT duplicate or mutate rule calculations. Randomness MUST be injectable or
seedable for deterministic fixtures. The legacy Python implementation and its tests are reference
evidence, not automatic authority: each observed behaviour MUST be classified as an intended rule,
compatibility requirement, or defect before becoming a parity assertion. Changes to game rules
require an explicit specification amendment and command-by-command, fixed-board parity tests.
This keeps the browser version a dependable port rather than an accidental redesign.

### II. Vite Static SPA, Installable, and Private by Default
The product MUST be a fully client-side single-page application that remains playable after its
initial load without a backend, account, analytics, advertising, or runtime network dependency.
The application MUST use Vite to build a static `dist` artifact and MUST NOT depend on server
rendering, API routes, host rewrites, secrets, or a Node.js runtime in production. It MUST be
installable as a PWA in Chromium-based browsers and work as a complete website when installation
is unavailable. PWA delivery MUST include a valid manifest, service worker, declared cache policy,
and user-controlled update path that does not discard an in-progress game. Player settings and
records MAY be stored only in browser-local storage unless a future specification explicitly
introduces a server-side contract. This protects player privacy and makes the application dependable
during connectivity loss.

### III. Responsive, Cross-Browser Interaction
Every gameplay action MUST have consistent mouse and keyboard semantics on desktop and touch
semantics on phones and tablets. The supported browser baseline is the current and immediately
previous stable releases of Chromium-based browsers, Firefox, and Safari/WebKit; browser-specific
behaviour MUST be progressively enhanced rather than breaking a supported browser. Boards MUST
remain reachable through their own two-axis scroll container rather than making cells too small to
use. Controls MUST remain operable across supported viewport sizes, and accessibility names, focus
behaviour, and visible state feedback are release requirements, not optional polish.

### IV. Explicit State, Preferences, and Resilient Persistence
The Redux Toolkit store MUST be the authoritative client state for a game session and settings.
Persisted data MUST use a single versioned browser-storage key, be limited to approved data, and
fall back safely to defaults when unavailable, malformed, or incompatible. Reducers and persistence
boundaries MUST be independently testable so state transitions can be verified without rendering.
Theme and language are persisted user preferences: light, dark, and system themes MUST be supported,
and every user-facing string MUST be available in English and Ukrainian through a localization
boundary rather than inline, untracked text.

### V. Current, Supported Web Platform
The project MUST use maintained, stable versions of its frameworks, libraries, browser APIs, and
build tooling. Dependencies MUST be locked for reproducible builds and reviewed regularly for
support status, security advisories, and compatibility with the supported browser baseline.
Adopting an unmaintained dependency or a platform API outside that baseline requires a documented,
approved exception. Every dependency MUST meet a documented need; platform capabilities and existing
dependencies take precedence over a new library. This balances modern capabilities with predictable
delivery.

### VI. Evidence-Gated Static Delivery
Every completed change MUST retain automated evidence proportionate to its risk: rule and reducer
tests for state changes, component tests for interface contracts, and browser smoke coverage for
critical journeys. The production build MUST remain a static export suitable for GitHub Pages.
No quality gate may report success while skipping its target or relying on an undeclared service.
Offline, installation, and update claims MUST be tested against the production artifact; a cached
previously visited route MUST NOT be represented as proof of cold-start offline support.

## Product and Platform Constraints

The supported product is an English- and Ukrainian-language browser PWA with light, dark, and
system themes. The initial release excludes accounts, multiplayer, server-side leaderboards,
monetization, and native packaging. The client stack is TypeScript, React, Vite, Redux Toolkit,
CSS-based design tokens, and browser-local persistence. Production assets, routes, the manifest,
and the service worker MUST work from the GitHub Pages repository subpath without host rewrites.
The build and deployment pipeline MUST run in GitHub Actions and publish the verified Vite `dist`
artifact to GitHub Pages. Dependencies or architecture changes that weaken offline operation,
static hosting, multilingual support, theme support, or the stated privacy boundary require a
constitution amendment before adoption.

## Delivery Workflow

Work MUST trace to a specification with explicit user-visible and state-transition acceptance
criteria. Implementations MUST keep game rules, state management, rendering, and persistence
separable enough to test at their boundaries. Before release, contributors MUST run the relevant
automated tests and static-export build, verify the core reveal, flag, win, loss, persistence, and
offline journeys, and record any known limitations. The browser test matrix MUST cover the supported
browser engines or documented equivalent automation with targeted manual verification.
Continuous integration MUST use the committed lockfile and run the required checks for pull requests
and the deployment branch. GitHub Actions MUST build the deployment artifact before publishing to
GitHub Pages. The deployment workflow MUST use least-privilege Pages permissions, deployment
concurrency protection, and upload only the static `dist` artifact after its checks pass.
Unresolved failures block release unless the specification explicitly accepts and scopes them.

## Governance
This constitution supersedes conflicting repository practices. A proposed amendment MUST document
the affected principles, motivation, compatibility impact, migration steps, and required updates to
specifications or tests. Maintainers approve amendments by recording them in this file.

Constitution versions use semantic versioning: a MAJOR change removes or redefines governance, a
MINOR change adds or materially expands it, and a PATCH change clarifies it without changing policy.
Every feature plan, implementation review, and release review MUST explicitly check compliance with
these principles and record any approved exception.

**Version**: 2.0.0 | **Ratified**: 2026-08-13 | **Last Amended**: 2026-08-13
