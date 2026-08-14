# Release evidence

Recorded 2026-08-14 for Feature 001.

## Automated evidence

| Gate | Command | Result |
| --- | --- | --- |
| Lockfile install | `npm ci` | PASS; 519 packages installed from the committed lockfile |
| Formatting | `npm run format:check` | PASS |
| Lint | `npm run lint` | PASS |
| Typecheck | `npm run typecheck` | PASS |
| Unit/component | `npm run test:unit` | PASS; 24 files, 54 tests |
| Static build | `npm run build` | PASS; Vite 8.2.1, static `dist` |
| Artifact contract | `npm run validate:artifact` | PASS; Pages base, manifest, icons, worker, local assets |
| Pages workflow | `npm run validate:pages` | PASS |
| Cross-engine browser | `npm run e2e` | PASS; 58 passed, 5 documented capability skips |

The performance harness measured the seeded 30×30 reveal under the 250 ms release budget in all
three configured engines. The browser suite covers Home/Play, reveal, flag, persistence reload,
Custom selection and recency, deterministic win/loss and replay, local-data reset, keyboard/mapped input, language changes, Help,
responsive 320/768/1440 layouts, artifact presence, production-artifact offline gameplay, and the
touch long-press/context-menu follow-up path in Chromium and WebKit. Unit coverage also proves
waiting-worker notice deduplication and refusal to activate when the active snapshot cannot flush.

## Manual browser observations

- Home begins with Beginner selected and a visible Play control.
- The Home screen follows the mockup hierarchy: compact brand top bar, theme/settings affordances,
  install/offline badge, centered pixel wordmark and preview board, radio-style difficulty cards,
  Custom validation, record summary, and footer actions.
- Play opens a labelled board; reveal exposes numbers/flood-fill state; right-click flags an
  unopened cell without opening the browser context menu.
- On touch-enabled Chromium/WebKit, holding an unopened cell flags it once; a delayed native
  context-menu event and its follow-up click do not clear the flag.
- The Game screen uses the mockup's compact LCD-like flags/time HUD, semantic status face, mapping
  hint, framed retro board, semantic number tints, and contained overflow cues. The same number
  class remains stable after switching Light/Dark appearance.
- Settings updates an open dialog from English to Ukrainian immediately.
- Help derives pointer, touch, keyboard, and primary/secondary mapping guidance from the selected
  input mode; modal sheets trap focus and restore it to their trigger.
- Back pauses the active session and Home exposes separate Resume game and New game actions.
- At 320, 768, and 1440 CSS pixels the document width equals the viewport width; oversized board
  content remains contained in the board viewport and cells retain the 32px minimum.
- The built manifest resolves under `/minesweeper/` and generated `sw.js` precaches local assets.

## Known capability limitations

Installation prompting and a two-revision waiting-worker activation require a hosted HTTPS Pages
origin and a browser profile that exposes `beforeinstallprompt`; those capabilities are
progressive and do not block gameplay. The implementation keeps updates prompt-controlled and
stores the active snapshot before an explicit activation path. The local production-artifact
journey proves the online-first cold-offline contract at the Pages subpath; hosted HTTPS install
and two-revision activation remain deployment-origin checks. Desktop Firefox's Playwright
`hasTouch` emulation does not emit the PointerEvent stream used by the touch regression; the
Firefox desktop gameplay/context-menu suite passes, and Firefox touch remains a manual device
capability check.

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
- SC-001–SC-009: unit/component timing, 58 passed browser cases plus five documented capability
  skips, responsive observations,
  local-only artifact scan, and workflow validation above.
