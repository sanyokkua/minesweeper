# Minesweeper UI Contract

**Feature**: [Minesweeper Static SPA](spec.md)  
**Status**: Living design reference  
**Created**: 2026-08-13  
**Source disposition**: Consolidates the useful intent of `docs/minesweeper-web-spec.md` and `docs/minesweeper-mockup-v2.html`. Those files are initial research only; change this file and `spec.md` for future decisions.

## Purpose and review method

This is the human-readable UI/UX contract for the feature. It records hierarchy, behavior, semantic visual roles, responsive rules, and state presentations. A design change is valid only when it updates this contract, the feature specification where behavior changes, and the appropriate automated proof. It deliberately permits thoughtful refinement; it is not a pixel-comparison requirement.

## Product character

- Modern, calm, Material-inspired application surfaces and controls.
- Crisp, low-anti-aliasing retro-game treatment only where it strengthens board legibility: cells, counters, mine/flag/status icons, and the wordmark accent.
- Friendly and concise, not childish: clear information hierarchy, short help copy, no dark patterns, no monetization affordances.
- Light and Dark themes use the same semantic roles; System selects the device preference and is the first-visit default.
- Both language variants may have different text lengths. Layout must not rely on English-sized labels.
- The defined visual transitions and modal animation remain enabled; this release does not vary them for a device motion preference or provide a motion setting.

## Information architecture

```text
Home
├─ Difficulty selection: Beginner | Intermediate | Expert | Custom
├─ Custom configuration (shown only when selected)
├─ Play / New game
├─ Resume game (only when an active game exists)
├─ Best-time summary
├─ How to Play
├─ Settings
└─ Install (only if available)

Game
├─ Top bar: Back | difficulty label | language/settings | appearance shortcut
├─ HUD: flags remaining | reset/status face | elapsed time
├─ Current input hint
├─ Scrollable board viewport with edge cues
└─ Terminal overlay: Win or Loss → Play again | Menu

Settings
├─ Language: English | Українська
├─ Input: Reveal first | Flag first
├─ Appearance: Light | Dark | System
└─ Reset local data (confirmation required; an open board remains playable but is no longer resumable)
```

## Screen contracts

### Home

The home screen is vertically scrollable, with a compact top bar and a centered game identity. Difficulty cards are a single-select group; Beginner is selected on the first visit, after local-data reset, or when a saved selection is invalid. Otherwise, the last valid selected preset or Custom dimensions and mine count remain selected across reload. Each standard card shows its name, dimensions, mine count, and its best record when one exists. Selecting Custom reveals labeled number fields, immediate localized validity feedback, and the best record for that exact valid configuration when one exists. When an active game exists, including a newly opened board before its first reveal and after app launch, Home shows separate Resume game and New game actions; New game confirms before replacing the retained game. Otherwise Play is the prominent action. Help, Settings, and a conditional Install option are secondary.

### Game

The game screen prioritizes board reachability. Its top bar is compact, and the HUD remains visible above the board. Returning home from an active game is immediate, retains the game, and pauses its timer. A blocking Help, Settings, or confirmation sheet also pauses the timer until it closes. The flag counter and whole-second timer use a chunky, LCD-like display. The reset/status face has an accessible name and reflects idle, playing, win, and loss states. The current interaction mapping is described immediately above the board in concise language appropriate to the device.

The board lives in a framed viewport which alone scrolls horizontally and vertically. The inner wrapper centers a board only when it fits; oversized boards begin at a reachable scroll origin. Edge fades appear only in directions where content remains outside the viewport. Page-level horizontal scrolling is never used to reach a board cell.

### Overlays and sheets

Win, loss, Help, Settings, and confirmation surfaces are modal sheets. They trap focus while open, have a labelled close/return route when dismissal is permitted, and update immediately when the selected language or theme changes. They never obscure the required next action. A reset confirmation appears only for an active game. Win and loss show the outcome, elapsed time, relevant record/result details, and equal-weight clear choices for replay or menu; replay starts a new board with the completed game's exact configuration.

## Reusable component contracts

| Component family | Required variants / parameters | Contract |
| --- | --- | --- |
| Action button | filled, tonal, outline, text, danger; normal and compact | Has a clear localized name, keyboard activation, visible focus, disabled state, and no layout-specific styling embedded by its caller. |
| Icon action | back, settings, appearance, close | Has a localized accessible name; icon alone is never the only conveyed meaning. |
| Selectable option | difficulty card, segmented preference option | Exposes single selection semantics and the selected state; text may wrap without clipping. |
| Setting row | language, input mapping, appearance, reset | Provides a heading, short description where needed, and a controlled choice or action. |
| Stat display | flags, timer, outcome record | Uses localized label plus value; counter digits remain legible in both themes. |
| Board cell | unopened, flagged, opened zero, opened 1–8, mine, detonated mine, incorrect flag | Its accessible name describes coordinate and state; it supports primary and secondary actions without duplicating game rules. |
| Modal sheet | help, settings, confirmation, win, loss | Restores focus on close and has consistent surface, heading, and action layout. |

## Semantic visual roles

Names below are role names, not a requirement for any particular CSS identifier. Every visible color, border, shadow, and focus treatment maps to a role and has a defined Light and Dark value. Components consume roles rather than raw palette values.

| Role group | Required roles | Intent |
| --- | --- | --- |
| Foundations | canvas, surface, raised surface, surface variant, primary text, muted text, outline | Overall hierarchy and readable text. |
| Actions | primary, primary container, secondary, secondary container, tertiary, danger, success, warning | Buttons, selected controls, status feedback, and icons. |
| Board | unrevealed base, raised highlight, raised shadow, revealed base, grid border, flag, mine, detonated mine | Clear tactile distinction between hidden and revealed states. |
| Numbers | number 1 through number 8 foreground and related subtle background tint | Each revealed number uses both its foreground color and a related tinted cell background. |
| Interaction | focus ring, hover, pressed, disabled, modal scrim, scroll-edge cue | Consistent state feedback in both themes and all UI surfaces. |

The initial palette is the supplied 32-color set from the original mockup. Subtle derived tints are permitted only as semantic role values. If palette values or roles change, both themes and every state listed above must be reviewed.

## State presentation

| State | Board result | HUD / overlay result |
| --- | --- | --- |
| Before first reveal | All cells raised and unopened, with zero or more valid flags; no mine information | Timer at zero; neutral face; selected difficulty visible. |
| Playing | Hidden, flagged, and revealed cells accurately distinguishable; zero cells have no numeral | Active face; timer advances only while the game page is visible; flag display reports remaining allowance. |
| Win | Every mine visibly flagged; all safe cells revealed | Celebratory but restrained sheet with time, record result, replay, and menu. The terminal board is not retained after reload. |
| Loss | Detonated mine is distinct; other mines visible; wrong flags and unrevealed safe cells distinguishable | Clear loss sheet with elapsed time, replay, and menu. The terminal board is not retained after reload. |
| Invalid Custom game | Board not started | Localized inline correction with a specific path to valid input. |
| Storage recovery | Board only resumes if validated; the active session remains playable if a save fails | Non-blocking localized notice that safe defaults were restored or that future progress may not survive reload; no saved data is deleted automatically. |
| Update ready | Current board remains usable | A localized non-blocking Update ready notice appears after an automatic online check; refresh activates only when the player chooses and never automatically discards the game. |

## Responsive and accessibility rules

- Use a single information architecture at all sizes; CSS changes spacing, column count, and containment rather than hiding gameplay capabilities.
- Verify the contract at 320 px, 768 px, and 1440 px viewport widths, including a 24×24 board at the smallest size.
- Board cells never shrink below 32×32 CSS pixels; large boards scroll inside the board viewport instead.
- Respect safe-area insets on touch devices.
- Mouse: primary action and contextual secondary action. A secondary pointer action suppresses the browser context menu only for board cells. Touch: tap and a 600 ms long press for the secondary action; movement of 10 CSS pixels or more cancels the long press for safe board scrolling. Keyboard: focus begins at the top-left board cell when a board opens; Arrow keys move board-cell focus and scroll only the board viewport enough to keep it visible, Enter or Space performs the selected primary action, and F performs the selected secondary action.
- Use visible focus, names, roles, status updates, and contrast that preserve meaning without color alone.
- Never use inline element styling in the application. Styling is centrally organized and token-driven so an appearance switch updates all covered elements together.

## Initial-source traceability

| Initial source | Adopted intent | Superseded or deliberately not copied |
| --- | --- | --- |
| `docs/minesweeper-mockup-v2.html` | Screen hierarchy, Material-plus-retro character, semantic palette, themed number tints, HUD, board viewport behavior, settings/help/outcome sheets | Its embedded prototype logic, its remote font dependency, and any implementation details. |
| `docs/minesweeper-web-spec.md` | Game screens, input modes, responsive board behavior, local records, installability, and friendly no-account product goal | Next.js, English-only scope, and its optional resume decision. |
| `.specify/memory/constitution.md` | Vite static delivery, privacy, Redux state authority, bilingual support, theme policy, evidence gates, Pages subpath, PWA update safety | Nothing; it remains governing project policy. |
