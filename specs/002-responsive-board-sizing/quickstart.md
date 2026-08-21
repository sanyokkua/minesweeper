# Quickstart: Responsive Board Sizing

## Prerequisites

- Node.js 22.22.2 or newer.
- Dependencies installed from the lockfile with `rtk npm ci`.

## Focused validation

Run the responsive interaction suite against the built/test browser setup:

```sh
rtk npm run e2e -- tests/e2e/responsive-interaction.spec.ts
```

Expected result: the responsive suite passes for narrow phone, foldable-width, wide-phone, tablet, and desktop viewports. Standard boards use the available wide-phone width, oversized boards expose both scroll axes locally, the page remains horizontally contained, and existing keyboard/touch behavior remains passing.

Environment note: this managed Codex sandbox may reject the Vite web server's `127.0.0.1:5173` bind with `EPERM`. If that occurs, rerun the same command in the approved elevated execution context; the bind restriction is environmental and does not indicate a product failure.

## Proportionate repository checks

```sh
rtk npm run format:check
rtk npm run lint
rtk npm run typecheck
rtk npm run test:unit
rtk npm run build
rtk npm run validate:artifact
rtk npm run validate:pages
```

These checks prove formatting, static analysis, type safety, existing unit/component behavior, static artifact generation, artifact invariants, and Pages workflow compatibility. The responsive browser suite remains the primary feature evidence.

## Manual viewport review

Use the built application at `/minesweeper/` and inspect a standard board at 375px, 412px, and 430px widths. Confirm that cells grow and side margins stay modest. Inspect an Expert board at 320px, 344px, and 768px widths; confirm that the board scrolls inside its surface, all four edge cues appear as appropriate, and the page itself does not gain horizontal overflow.
