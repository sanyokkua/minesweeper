# Implementation Plan: Responsive Board Sizing

**Branch**: `002-responsive-board-sizing` | **Date**: 2026-08-21 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-responsive-board-sizing/spec.md`

## Summary

Adjust the existing board cell sizing so cells grow with available phone width up to the current comfortable maximum, while retaining the existing board-local two-axis scroll behavior for boards that do not fit. The implementation is presentation-only: use the existing board viewport and CSS sizing boundary, add responsive browser assertions for the supplied viewport classes, and leave game state, input mapping, persistence, and PWA behavior unchanged.

## Technical Context

**Language/Version**: TypeScript 5.9.3 and CSS

**Primary Dependencies**: React 19.2.8, Vite 8.2.1, Playwright 1.62.1; no new dependency

**Storage**: N/A; board sizing does not change persisted data

**Testing**: Playwright responsive interaction coverage, plus existing format, lint, typecheck, unit, build, artifact, and Pages checks as applicable

**Target Platform**: Current and immediately previous stable Chromium, Firefox, and Safari/WebKit browsers; static GitHub Pages deployment below `/minesweeper/`

**Project Type**: Browser-only static SPA/PWA

**Performance Goals**: Sizing must update through normal responsive CSS without adding runtime measurement or repeated layout work; existing interaction responsiveness remains unchanged

**Constraints**: Keep the 32px minimum and 40px maximum intent, use the existing board viewport as the only overflow region, keep the page horizontally contained, avoid inline styles and new dependencies, and preserve all game interactions

**Scale/Scope**: One board stylesheet rule and focused responsive browser assertions covering standard and oversized boards at phone, tablet, and desktop widths

## Constitution Check

| Principle | Status | Evidence / decision |
|---|---|---|
| I. Faithful Game Rules First | PASS | No domain, reducer, command, timer, or game-rule code changes. |
| II. Static SPA, Installable, and Private by Default | PASS | No runtime service, persistence, route, manifest, or build change. |
| III. Responsive, Cross-Browser Interaction | PASS | The existing `BoardViewport` remains the exclusive scroll region; responsive tests cover fit, overflow containment, edge reachability, and keyboard access. |
| IV. Explicit State, Preferences, and Resilient Persistence | PASS | No state shape, persistence key, preference, or storage behavior changes. |
| V. Current, Supported Web Platform | PASS | Uses existing CSS capabilities and locked dependencies; no package changes. |
| VI. Evidence-Gated Static Delivery | PASS | Add targeted Playwright evidence and run the proportionate repository validation commands before completion. |

**Gate result**: PASS. No constitution exception is required.

## Project Structure

### Documentation (this feature)

```text
specs/002-responsive-board-sizing/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── board-sizing.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/ui/components/
├── Board.tsx
└── BoardViewport.tsx

src/ui/styles/
└── board.css

tests/e2e/
└── responsive-interaction.spec.ts
```

**Structure Decision**: Keep the existing single-project Vite/React SPA structure. The change belongs to the board presentation stylesheet and the existing responsive interaction suite; no new application module is justified.

## Design Decisions

### Cell sizing

Use one fluid board-cell size with the existing 32px floor and 40px ceiling. The planned baseline is `clamp(32px, 9vw, 40px)`: it remains at the floor on the narrowest phones, grows across the 375–430px phone range shown in the supplied evidence, and reaches the existing maximum on tablet/desktop widths. This is a small, reversible CSS-only adjustment and does not require a second rules engine or runtime resize observer.

### Fit and scrolling

Keep `.board-viewport` and `.board-viewport__content` unchanged as the board-local overflow and centering boundary. When the grid fits, it remains centered with modest padding. When it exceeds the viewport, its existing intrinsic width/height and `overflow: auto` behavior expose both axes without widening the document. Existing edge cues and keyboard focus scrolling remain the contract.

### Verification

Extend `tests/e2e/responsive-interaction.spec.ts` to assert:

- phone cell sizes rise above the floor at 375px, 412px, and 430px while remaining capped at the established maximum;
- a standard board uses most of the usable board surface at a wide-phone width;
- an oversized Expert board remains locally scrollable and page-contained at 320px, 344px, 375px, 412px, 430px, 768px, and 1440px widths;
- resizing an active board preserves its visible cell state and board interaction contract;
- existing keyboard reachability and edge-cue assertions continue to pass.

## Post-Design Constitution Check

PASS. The design changes only presentation sizing and tests. It preserves the constitution's board-local scrolling rule, supported interaction paths, static delivery, no-inline-style constraint, and evidence requirements.

## Complexity Tracking

No violations. The feature reuses the existing board viewport and test suite, adds no dependency or abstraction, and changes no runtime state contract.
