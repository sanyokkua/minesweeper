# Release evidence

Recorded 2026-08-14 for Feature 001.

## Automated evidence

| Gate | Command | Result |
| --- | --- | --- |
| Lockfile install | `npm ci` | PASS; 519 packages installed and 0 vulnerabilities reported from the committed lockfile |
| Formatting | `npm run format:check` | PASS |
| Lint | `npm run lint` | PASS |
| Typecheck | `npm run typecheck` | PASS |
| Unit/component | `npm run test:unit` | PASS; 27 files, 85 tests |
| Static build | `npm run build` | PASS; Vite 8.2.1, static `dist` with local font assets |
| Artifact contract | `npm run validate:artifact` | PASS; Pages base, manifest, icons, worker, local assets and font precache |
| Pages workflow | `npm run validate:pages` | PASS |
| Cross-engine browser | `npx playwright test --reporter=dot` | PASS; 109 passed, 14 documented skips |

The performance harness measured the seeded 30×30 visible update under the 250 ms release budget in
the documented Chromium release environment: flag 11.8 ms and reveal 7.5 ms in the final matrix run.
Firefox and WebKit skip this environment-specific timing gate while still running their supported
desktop gameplay and responsive journeys. The browser suite covers Home/Play, the mockup-aligned two-column Home
hierarchy, responsive cell sizing, reveal, flag, persistence reload, Custom selection and recency,
deterministic win/loss and replay, local-data reset, keyboard/mapped input, language changes, Help,
centered modal surfaces, responsive 320/768/1440 layouts, build-stamp and repository-link artifact
checks, production-artifact offline gameplay, and the touch long-press cancellation/context-menu
follow-up path in Chromium and WebKit. Unit coverage also proves waiting-worker notice deduplication, startup
install-prompt capture, appinstalled cleanup, canonical persistence recovery, update activation
handshakes, and refusal to activate when the active snapshot cannot flush. The production-artifact
Chromium journey also serves two same-origin service-worker revisions, accepts the explicit update
only after persistence, and verifies that a persistence failure leaves the waiting worker and page
in place.

## Manual browser observations

- Home begins with Beginner selected and a visible Play control.
- The Home screen follows the mockup hierarchy: compact brand top bar, theme/settings affordances,
  install/offline badge, larger centered pixel wordmark and preview board, two-column radio-style
  difficulty cards at desktop widths, Custom “set your own” presentation, a Play/How to Play action
  row, record summary, reduced footer actions, and a bottom build stamp.
- Play opens a labelled board; reveal exposes numbers/flood-fill state; right-click flags an
  unopened cell without opening the browser context menu.
- On touch-enabled Chromium/WebKit, holding an unopened cell flags it once; a delayed native
  context-menu event and its follow-up click do not clear the flag.
- The Game screen uses the mockup's compact LCD-like flags/time HUD, semantic status face, styled
  Tap/Hold/right-click/F hint, framed retro board, 32–40px responsive cells, semantic number tints,
  contained overflow cues, and centered outcome surfaces with explanatory copy and result cards.
  The same number class remains stable after switching Light/Dark appearance.
- Closing a terminal outcome hides only the centered result surface; the Game route, projected board,
  flags, and terminal lock remain visible until Menu, Play again, or Reset game is chosen.
- Settings presents descriptive selected choice cards for input mode and appearance, updates an open
  centered dialog from English to Ukrainian immediately, and preserves language, input mode,
  appearance, and reset controls.
- Help derives pointer, touch, keyboard, and primary/secondary mapping guidance from the selected
  input mode, provides a localized Got it action, and modal sheets trap focus and restore it to
  their trigger.
- Back pauses the active session and Home exposes separate Resume game and New game actions.
- At 320, 768, and 1440 CSS pixels the document width equals the viewport width; oversized board
  content remains contained in the board viewport and cells retain the 32px minimum.
- The built manifest resolves under `/minesweeper/`, generated `sw.js` precaches local assets, and
  the built JavaScript contains the deterministic `App Build` stamp contract. CI injects its run
  timestamp; local builds render `dev version`.

## Known capability limitations

Installation prompting requires a hosted HTTPS Pages origin and a browser profile that exposes
`beforeinstallprompt`; that capability is
progressive and do not block gameplay. The install gateway captures the prompt at application
startup, removes it after `appinstalled` or the user's choice, and shows localized Android browser-
menu guidance when no prompt is delivered. The implementation keeps updates prompt-controlled and
stores the active snapshot before an explicit activation path. The local production-artifact
journey proves the online-first cold-offline contract and the two-revision update/refusal path at
the Pages subpath. Hosted HTTPS installation remains a deployment-origin check. The 250 ms visible timing gate is
intentionally documented against Chromium because browser scheduling variance is material at this
threshold. Firefox and WebKit skip that timing case and the Chromium-specific service-worker
lifecycle cases, and Firefox desktop touch emulation skips the PointerEvent long-press path; their
supported desktop gameplay/responsive suites pass.

## Requirement mapping

- FR-001, FR-028, FR-033–FR-034: Vite static build, dependency review, workflows, artifact and
  cross-engine gates.
- FR-002–FR-010: `config`, seeded PRNG, and pure engine tests.
- FR-011–FR-014, FR-023–FR-027: Redux timer, record codec, caught storage gateway, lifecycle and
  browser persistence tests.
- FR-015–FR-022, FR-031–FR-032: typed bilingual catalog, themes, accessible primitives, board
  keyboard/pointer/touch adapter, Help and responsive browser tests.
- FR-029–FR-030: manifest, generated worker, install/update gateways, Pages artifact checks, and
  progressive PWA journey.
- SC-001–SC-009: unit/component timing, 109 passed browser cases plus 14 documented capability
  skips, Chromium visible timing, responsive observations, local-only artifact/build-stamp scan,
  branch-policy workflow validation, and the repository-link check above.
