# Minesweeper Web — Mini Specification

> **Status:** Historical design input. The current implementation is a Vite/React static SPA/PWA, not the older Next.js application described in parts of this document. Use the current source, `.specify/memory/constitution.md`, and `specs/001-minesweeper-spa/` as authority. See [`index.md`](index.md) for the maintained documentation map.

**Status:** idea / pre-implementation draft
**Author context:** derived from `minesweeper_py` (existing Python/Qt desktop implementation, used as the source of game rules) and `dev.tools` (existing React/Next.js static-export SPA, used as the reference for stack and deployment pattern)
**Depth:** intentionally light — product idea, screens, logic, stack, and top-level requirements only. No task breakdown, no edge-case catalogue, no test plan.

---

## 1. What this is

A browser-based, installable rebuild of classic Minesweeper. Single-page app, fully client-side (no backend, no network calls after load), deployable as static files to GitHub Pages, and installable as a PWA so it keeps working with no internet connection.

The game rules are a direct port of the existing `minesweeper_py` core logic (`GameLogic`, `Cell`, `Configuration`) — this is not a redesign of the rules, it's the same rules on a new stack with a modern, responsive, touch-first UI.

---

## 2. Goals

- Same game logic as `minesweeper_py`: first click is always safe, flood-fill opens connected zero-neighbour regions, flags toggle, win/lose detection matches the existing implementation.
- Works equally well on desktop (mouse) and mobile (touch) — no feature is desktop-only.
- Configurable input scheme: the player chooses whether a tap reveals and a long-press/right-click flags, or the reverse.
- Adapts to any screen size. A large board (e.g. 24×24) never renders content the player can't reach — the board area scrolls in both axes inside its own container instead of overflowing the page.
- Settings and best times persist locally (`localStorage`) and survive a reload / offline launch.
- Installable: add-to-home-screen / desktop install, works fully offline afterward.
- Visually modern: Material Design–style components (elevation, motion, color roles) blended with a retro 8/16-bit pixel-game accent on the board itself, using the supplied color palette, with light and dark themes.

## 3. Non-goals (for this iteration)

- No multiplayer, no accounts, no server-side leaderboard.
- No monetization, ads, or analytics.
- No localization beyond English (structure should not prevent it later, but it isn't in scope now).
- No native app packaging (Electron/Capacitor) — PWA installability only.

---

## 4. Game logic (ported from `minesweeper_py`)

The core rules, kept identical to the existing Python implementation:

- A board is a grid of `rows × columns` cells. Each cell has: `hasMine`, `isOpen`, `hasFlag`, `neighbourMineCount`.
- Mines are placed **after** the first reveal, excluding only the exact clicked cell (not its neighbours) — this guarantees the first click is never a mine, matching `_put_mines` in `game_logic.py`.
- After mines are placed, every cell's `neighbourMineCount` is computed once (count of the up-to-8 surrounding cells that have a mine).
- **Reveal a cell:**
  - If it has a mine → game over, loss. All cells are revealed (mines shown, exploded cell marked).
  - If it has a flag → the flag is silently cleared and nothing else happens on that click (matches `_open_cell`: a flagged cell must be unflagged before it opens).
  - If its `neighbourMineCount` is 0 → flood-fill: reveal it and recursively reveal all connected neighbours, stopping the moment a neighbour has a non-zero count (that neighbour is revealed too, but its own neighbours are not).
  - Otherwise → reveal just that cell and show its number.
- **Flag a cell** (secondary action): toggles a flag on an unopened cell. Flags are capped at the mine count for that board (the "flags remaining" counter can't go below 0); removing a flag returns one to the pool.
- **Win condition:** the moment `opened cells + mine count == total cells` (i.e. every non-mine cell is open), the game ends in a win — flags are not required to be placed correctly to win, matching `_process_current_game_state`. On win, all remaining mines are auto-flagged for a clean final board.
- **Loss condition:** opening a mine ends the game immediately; the full board is revealed.
- Timer starts on the first reveal and stops the moment the game ends (win or loss).

### Difficulty presets (unchanged from `configurations.py`)

| Difficulty | Rows | Columns | Mines |
|---|---|---|---|
| Beginner | 9 | 9 | 10 |
| Intermediate | 16 | 16 | 40 |
| Expert | 24 | 24 | 99 |
| Custom | user-defined | user-defined | user-defined, capped below `rows × columns` |

---

## 5. Screens

1. **Home / Start** — title, difficulty cards (Beginner / Intermediate / Expert / Custom with row/column/mine inputs), primary "Play" action, links to How to Play and Settings, an "Install app" affordance, best-time summary per difficulty (read from local storage).
2. **Game** — top bar (back to home, current difficulty, settings, theme toggle), HUD (mines-remaining counter, reset/status face button, timer), the scrollable board itself, and a short contextual hint line that reflects the player's current input mode ("Tap: reveal · Hold: flag" or the reverse).
3. **Win overlay** — congratulatory state, time taken, best time for that difficulty, "Play again" / "Menu".
4. **Lose overlay** — game-over state, time survived, flags placed vs. mines, "Try again" / "Menu".
5. **Settings** (modal or screen) — input-mode choice (tap-reveal/hold-flag vs. tap-flag/hold-reveal), theme (Light / Dark / System), reset local data.
6. **How to Play** (modal) — rules in plain language, including how the two input modes work.

---

## 6. Interaction modes

Two selectable schemes, applied consistently across mouse and touch:

- **Reveal-first (default):** primary click/tap reveals a cell; secondary action (right-click on desktop, long-press on touch) toggles a flag.
- **Flag-first:** primary click/tap toggles a flag; secondary action (right-click / long-press) reveals a cell.

The chosen mode is a persisted setting, not a one-off toggle — it applies to every game until changed.

---

## 7. Visual direction

- **Style:** Material Design–style surfaces, elevation, and interactive components (buttons, switches, segmented controls, modals) for all chrome — combined with a crisp, low-anti-aliasing pixel-game treatment on the board itself (hard-edged cell borders, chunky LCD-style mine/timer counters, retro iconography for mine/flag/face).
- **Palette:** built entirely from the supplied 32-color set, split into semantic roles (background/surface, primary/secondary/tertiary accents, success, danger, and the eight mine-count colors), with a light and a dark theme derived from the same palette rather than two unrelated color sets.
- **Cell highlighting:** each revealed numbered cell gets both a colored digit *and* a matching tinted background (increasing in strength from 1 to 8), so mine density is readable at a glance, not just from the digit color — this is on top of, not instead of, the classic number-color convention.
- **Themes:** Light and Dark, plus a "System" option that follows the OS/browser preference. Theme choice is persisted.

---

## 8. Responsiveness & touch

- Mobile-first layout; the same markup is used at all breakpoints, only spacing/sizing/board-cell-size change.
- The board lives inside its own scroll container (independent of page scroll) sized to the available viewport height/width. When a board is larger than that container — e.g. Expert at 24×24 on a phone — the container scrolls in both axes with native touch/trackpad scrolling; nothing is ever rendered outside a reachable area, and the container gives a visible cue (edge shadow) when more board exists off-screen.
- Minimum touch target for a cell is kept at a usable size even on dense boards; below a size floor the board scrolls rather than shrinking cells into unusable territory.
- Long-press timing, scroll-vs-tap disambiguation, and `touch-action` are tuned so scrolling the board doesn't accidentally reveal/flag a cell.
- Layout respects device safe areas (notches / home indicator) on mobile.

---

## 9. State & persistence

- Client-side state is modeled as Redux (Redux Toolkit) with two main slices:
  - `game` — board, difficulty, cell states, timer, flags remaining, status (idle/playing/won/lost). Transient by nature; optionally persisted so an in-progress game can resume after an accidental reload.
  - `settings` — theme, input mode, best time per difficulty. Always persisted.
- Persistence target is `localStorage`, written on relevant state changes (debounced), namespaced under a single versioned key so the storage shape can evolve later without clashing with old data.
- On load, the store hydrates from `localStorage` if present, otherwise starts from defaults.

---

## 10. Technical stack

Chosen to mirror the existing `dev.tools` project (same ecosystem the author already maintains), swapping only the state layer in for Redux Toolkit as requested:

- **Language:** TypeScript
- **UI:** React 19
- **App shell:** Next.js (Pages Router), `output: 'export'` — fully static, no server runtime required at deploy time
- **State:** Redux Toolkit (`configureStore`, slices, typed hooks); a small persistence middleware (or `redux-persist`) syncs selected slices to `localStorage`
- **Styling:** CSS Modules or SCSS with a design-token layer (CSS custom properties) for the two themes, no CSS-in-JS runtime dependency
- **PWA:** `@ducanh2912/next-pwa` (Workbox-based service worker), manifest with icons, offline-first caching of the static bundle — same approach already proven in `dev.tools`
- **Testing:** Jest + React Testing Library for unit tests on the ported game logic and reducers; Playwright for a light smoke/E2E pass (board renders, click reveals, flag toggles, win/lose triggers)
- **Tooling:** ESLint, Prettier, Husky pre-commit — matching `dev.tools` conventions
- **Deployment:** static export published to GitHub Pages via GitHub Actions, with `basePath`/`assetPrefix` derived from the repository name exactly as `dev.tools` already does

---

## 11. Requirements (EARS notation, main ones only)

**Ubiquitous**
- The system shall render the current board state (revealed cells, flags, numbers) from the `game` Redux slice at all times.
- The system shall persist the `settings` slice (theme, input mode, best times) to `localStorage` on every change.
- The system shall keep the board scrollable within its own container so that no cell is ever rendered outside a reachable area, regardless of board size or viewport size.

**Event-driven**
- WHEN the player performs the primary reveal action on an unopened, unflagged cell for the first time in a game, the system shall place mines excluding only that cell, then reveal it.
- WHEN the player performs the primary reveal action on an unopened, unflagged cell with zero neighbouring mines, the system shall reveal that cell and recursively reveal all connected zero-neighbour cells and their immediate bordering numbered cells.
- WHEN the player performs the primary reveal action on a cell containing a mine, the system shall end the game as a loss and reveal the full board.
- WHEN the player performs the secondary flag action on an unopened cell, the system shall toggle its flagged state and update the mines-remaining counter accordingly.
- WHEN the number of opened non-mine cells equals total cells minus mine count, the system shall end the game as a win and auto-flag any remaining unflagged mines.
- WHEN the player changes the input mode in Settings, the system shall apply the new tap/hold mapping to all subsequent cell interactions without requiring a page reload.
- WHEN the player changes the theme, the system shall re-render all screens in the new theme immediately and persist the choice.
- WHEN the app is reloaded or relaunched offline, the system shall hydrate `settings` (and, if present, an in-progress `game`) from `localStorage`.

**State-driven**
- WHILE a game is in the "playing" state, the system shall run and display an elapsed-time timer.
- WHILE a game is in the "won" or "lost" state, the system shall stop the timer and disable further cell interaction until "Play again" or "Menu" is chosen.
- WHILE the viewport is narrower than the rendered board at the current cell size, the system shall allow two-axis scrolling within the board container rather than shrinking cells below the usable touch-target floor.

**Unwanted behavior**
- IF the player targets a cell outside the valid row/column range, THEN the system shall ignore the action without altering game state.
- IF the player attempts to flag an already-open cell, THEN the system shall ignore the action.
- IF the player attempts to add a flag when zero flags remain, THEN the system shall ignore the action until a flag is freed elsewhere.
- IF `localStorage` is unavailable (e.g. private browsing) or contains corrupt data, THEN the system shall fall back to in-memory defaults rather than failing to load.

**Optional / feature**
- WHERE the browser/OS supports PWA installation, the system shall expose an install affordance and, once installed, shall load and be fully playable with no network connection.
- WHERE the "System" theme option is selected, the system shall follow the OS/browser color-scheme preference and update live if that preference changes.

---

## 12. Open questions / future ideas (not blocking)

- Should an in-progress game resume after reload, or only settings/best-times? (Spec above allows either; pick one during implementation.)
- Sound effects / haptics on mobile — nice-to-have, not required for v1.
- Optional "safe first click reveals a 3×3 area" variant as a togglable difficulty tweak, distinct from the faithful `minesweeper_py` single-cell-safe behavior kept as default.
- Localization scaffolding.
