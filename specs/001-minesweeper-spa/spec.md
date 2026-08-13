# Feature Specification: Minesweeper Static SPA

**Feature Branch**: Not created (spec identifier: `001-minesweeper-spa`)  
**Created**: 2026-08-13  
**Status**: Draft  
**Input**: User description: "Build a simple, pretty, private, fully tested, bilingual browser Minesweeper as a static app for GitHub Pages, using the supplied game and visual references only as initial input."

## Clarifications

### Session 2026-08-13

- Q: What Custom-board limits should the first release enforce? → A: Rows and columns: 5–30; mines: 1 through cells minus 1.
- Q: Which keyboard controls should operate the focused board cell? → A: Arrow keys move cell focus; Enter/Space performs the selected primary action; F performs the selected secondary action.
- Q: If the first reveal action targets a flagged cell, should the game remain unstarted after clearing that flag? → A: Clear the flag only; do not place mines or start the timer.
- Q: Which language should a first-time visitor see before choosing a preference? → A: Use the device language when it is English or Ukrainian; otherwise use English.
- Q: When an in-progress game is reopened, should the timer include the time while the app was closed? → A: Pause while closed; resume from the saved elapsed time when the game reopens.
- Q: How should the app handle a newly available update while the player is online? → A: Check for static updates automatically; show “Update ready”; apply only when the player chooses.
- Q: Which minimum interactive size should every board cell keep on touch screens? → A: At least 32×32 CSS pixels per board cell.
- Q: What should qualify as a touch long-press secondary action on a board cell? → A: Hold for 600 ms; cancel if the finger moves 10 CSS pixels or more.
- Q: Should resetting an active game require confirmation? → A: Confirm reset only while a game is actively playing.
- Q: Should Custom games have saved best-time records? → A: Save a best time for every distinct Custom configuration.
- Q: How many Custom-configuration best-time records should the app retain locally? → A: Keep up to 100 Custom records; remove the least recently played Custom configuration when adding another.
- Q: Should the timer pause whenever the game page is backgrounded or the device is locked? → A: Pause whenever the game page is not visible; resume when it becomes visible again.
- Q: How quickly must the largest permitted board respond to a reveal or flag action? → A: The board visibly updates within 250 ms for a 30×30 game.
- Q: What should happen if browser storage is full while the app tries to save a game or record? → A: Keep the current session playable; show a localized non-blocking warning; do not delete saved data automatically.
- Q: What should happen when a player returns to the home screen during an active game? → A: Return home immediately; retain the game and pause its timer.
- Q: Which accessibility conformance level should this release meet? → A: No formal WCAG target; test only the existing accessibility requirements.
- Q: Which difficulty should be selected when a first-time visitor opens the home screen? → A: Beginner is selected by default.
- Q: When an active game is retained and the player is on Home, how should they resume it? → A: Show Resume game and New game as separate actions whenever an active game exists.
- Q: Should users be able to reduce motion effects? → A: Keep all motion unchanged.
- Q: What timer precision should the player see and have compared for best times? → A: Show and compare whole elapsed seconds.

### Session 2026-08-14

- Q: When the app is opened with a retained active game, which screen should appear first? → A: Open Home and show Resume game plus New game.
- Q: After a player wins or loses, should that completed board remain resumable after a reload? → A: Do not retain completed boards; only active games are resumable.
- Q: Should a desktop right-click on a board cell suppress the browser’s context menu? → A: Suppress the context menu only on board cells.
- Q: Where should keyboard focus begin when the player enters a new or resumed game board? → A: Focus the top-left board cell when the board opens.
- Q: When Arrow-key navigation moves focus beyond the visible part of a large board, should the board scroll that cell into view? → A: Scroll the board viewport just enough to keep the focused cell visible.
- Q: How should a final time with a partial second be converted to the displayed and recorded whole-second result? → A: Round up to the next whole second.
- Q: Which appearance should a first-time visitor receive before choosing a theme? → A: System appearance by default.
- Q: Should the elapsed timer pause while a blocking Help, Settings, or confirmation sheet is open during an active game? → A: Pause for every blocking in-game sheet; resume when it closes.
- Q: What should happen to a currently open game when the player confirms “Reset local data”? → A: Keep the current board playable; clear its saved resume copy, preferences, and records.
- Q: When should a Custom best-time record become “recently played” for the 100-record eviction limit? → A: Update recency when a game with that configuration starts.
- Q: If the player leaves or reloads a newly opened board before the first reveal, should that untouched board be resumable? → A: Retain the untouched board and offer Resume game.
- Q: Should the last selected difficulty, including valid Custom dimensions and mine count, remain selected after a reload when there is no resumable game? → A: Retain the last valid preset or Custom configuration after reload.
- Q: If a player flags cells before the first reveal, should those flags be retained across leaving or reloading the app? → A: Retain pre-first-reveal flags in the resumable board.
- Q: When a player chooses “Play again” after a win or loss, which configuration should the new board use? → A: Start a new board with the completed game’s exact configuration.
- Q: After a player changes the language or appearance while a blocking modal is open, should the modal update immediately or only after it closes? → A: Update the open modal immediately.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Play a faithful Minesweeper game (Priority: P1)

A player chooses a difficulty, starts a game, reveals and flags cells with their preferred input scheme, and can win or lose according to classic Minesweeper rules.

**Why this priority**: A dependable, playable game is the product's essential value.

**Independent Test**: A player can start each preset, make primary and secondary cell actions, observe the board and counters change, and reach both terminal outcomes without using any other product feature.

**Acceptance Scenarios**:

1. **Given** the player has selected a preset and started a new game, **When** they reveal their first cell, **Then** that cell is safe, mines are placed elsewhere, the timer starts, and the board accurately shows the revealed result.
2. **Given** a playing game, **When** the player reveals an empty cell, **Then** the connected empty area and its bordering numbered cells become visible without revealing unrelated cells.
3. **Given** a playing game, **When** the player flags and unflags unopened cells, **Then** the flag display changes accordingly and never permits more flags than the board contains mines.
4. **Given** a playing game, **When** the player reveals a mine, **Then** the game ends, the final board explains the loss, the timer stops, and the player can start again with that exact configuration or return to the menu.
5. **Given** a playing game with every non-mine cell revealed, **When** the final safe cell is revealed, **Then** the game ends as a win, remaining mines are visibly flagged, the timer stops, and the player can start again with that exact configuration or return to the menu.

---

### User Story 2 - Choose and retain a comfortable play experience (Priority: P2)

A player can choose difficulty, language, appearance, and cell-input preference; their choices and useful records remain available on their next visit without collecting personal information.

**Why this priority**: The app must be pleasant on both phone and desktop, useful in English and Ukrainian, and private by default.

**Independent Test**: A player can change each preference, reload the app, and verify that the expected language, theme, input mapping, records, and eligible in-progress game return safely.

**Acceptance Scenarios**:

1. **Given** the first home-screen visit or no saved difficulty selection, **When** Home opens, **Then** Beginner is selected by default; **when** the player selects Beginner, Intermediate, Expert, or valid Custom settings, **then** the selection persists across reload and a new game starts with the stated board dimensions and mine count.
2. **Given** a retained active game and the home screen, **When** the player chooses Resume game, **Then** the same game reopens with its saved elapsed time; **when** the player chooses New game, **then** the system asks for confirmation before replacing that game.
3. **Given** the app opens with a retained active game, **When** initialization completes, **Then** Home appears with Resume game and New game actions rather than automatically reopening the game.
4. **Given** the settings surface, **When** the player changes the primary/secondary cell-action mapping, **Then** subsequent mouse and touch interactions use that mapping consistently.
5. **Given** the settings surface, **When** the player selects English or Ukrainian, **Then** every visible product message, including an open blocking modal, changes immediately to the selected language and the choice persists on the next visit.
6. **Given** the settings surface, **When** the player selects Light, Dark, or System appearance, **Then** every screen and open blocking modal updates together immediately, the choice persists, and System follows a supported device preference change.
7. **Given** a first-time visitor with no saved appearance preference, **When** Home opens, **Then** System appearance is selected and follows a supported device preference.
8. **Given** a completed standard or Custom game, **When** its time is better than the stored record for that exact configuration, **Then** the new best time is shown and retained; **when** storage is unavailable or invalid, **then** the game remains usable with safe defaults.
9. **Given** a player wins or loses, **When** the app is later reloaded, **Then** the completed board does not resume, while any successfully retained record remains visible on Home.

---

### User Story 3 - Play on any supported device, including offline (Priority: P3)

A player can reach all cells and controls on a small touch device or a desktop browser, install the app where supported, and continue playing after the initial visit without network access.

**Why this priority**: A static, installable, no-account game should be dependable wherever a player chooses to use it.

**Independent Test**: A player can complete core play on desktop and touch-sized viewports, verify large-board two-axis reachability, install where supported, and open the built release offline after one successful online visit.

**Acceptance Scenarios**:

1. **Given** a board wider or taller than the available play area, **When** the player scrolls the board container, **Then** every cell remains reachable without shrinking a cell below the usable touch-size floor or making the page horizontally overflow.
2. **Given** a touch-capable device, **When** the player scrolls across a large board, **Then** the movement does not accidentally perform a reveal or flag action.
3. **Given** a browser that supports installation, **When** installation is available, **Then** the app presents an understandable install option without blocking gameplay when installation is unavailable.
4. **Given** the player has opened the released app online at least once, **When** they reopen it without a network connection, **Then** they can start, resume an eligible game, and finish a game without a network request.

---

### User Story 4 - Understand the game and recover safely (Priority: P4)

A new player can read concise rules, see contextual controls, reset a game, and clear locally stored data without losing control of their current choice unexpectedly.

**Why this priority**: A small game should be self-explanatory and safe to use without documentation or an account.

**Independent Test**: A player can open the help content, identify the current input mapping, reset a game from the status control, and explicitly clear stored data.

**Acceptance Scenarios**:

1. **Given** any supported language, **When** the player opens How to Play, **Then** it explains reveal, flags, numbers, win/loss, and the current input mapping in that language.
2. **Given** a playing game, **When** the player uses the reset/status control, **Then** the system asks for confirmation before starting a new game; **given** a pre-play or completed game, **when** the player uses that control, **then** a new game starts immediately with the same selected difficulty and the prior game cannot receive further cell actions.
3. **Given** a playing game, **When** the player returns to the home screen, **Then** the system returns home immediately, retains the game for later resumption, and pauses its elapsed timer.
4. **Given** the settings surface, **When** the player chooses to reset local data and confirms the decision, **Then** approved locally stored preferences, records, and resumable game state are cleared and visible defaults are restored; **when** a game is currently open, **then** its current board remains playable until the player leaves or reloads but cannot resume after reload.

### Edge Cases

- A Custom game must accept only 5–30 rows, 5–30 columns, and 1 through `rows × columns − 1` mines; it must reject all other values with a localized correction and leave Play unavailable until valid.
- A board cell must never render with an interactive width or height below 32 CSS pixels; oversized boards must remain reachable through the board's own scrolling region.
- A touch long-press triggers the secondary action only after 600 ms without movement of 10 CSS pixels or more; movement at or above that threshold cancels the action and continues scrolling.
- A desktop secondary pointer action on a board cell must suppress the browser context menu only for that board cell; browser context menus remain available elsewhere in the app.
- Revealing a flagged unopened cell must remove its flag without opening it; acting on an already revealed or terminal-state cell must not change game state.
- If a flagged cell is targeted before any safe cell has been revealed, clearing that flag must leave mines unplaced and the timer at zero.
- Invalid coordinates, malformed persisted data, unavailable browser storage, declined installation, unsupported installation, and unsupported system-preference observation must fail safely without preventing a new game.
- On loss, the final board must distinguish the detonated mine, mines, incorrect flags, and unflagged safe cells where the visual contract calls for those states.
- The system must check for static updates automatically when online, show a localized Update ready notice when one is available, and apply it only after the player chooses; it must not silently discard an in-progress game.
- Resetting an actively playing game must require explicit confirmation; reset is immediate before the first reveal and after a game finishes.
- When a new Custom record would exceed the 100-record local limit, the system must remove the Custom configuration whose game was started least recently and retain all standard-difficulty records; starting a game with an existing Custom record updates that record's recency even if the game is not completed.
- The elapsed timer must pause whenever the game page is not visible, including when the device is locked, and resume from its saved elapsed time only when the page becomes visible again.
- The elapsed timer must pause while any blocking Help, Settings, or confirmation sheet is open during an active game and resume from its saved elapsed time when the sheet closes.
- If local storage is full while saving a game or record, the current session must remain playable, existing local data must not be deleted automatically, and a localized non-blocking warning must explain that future progress may not survive reload.
- Resetting local data while a game is open must keep that current board playable until the player leaves or reloads, clear its resumable copy, and restore preferences and records to their defaults.
- Returning home from an active game must be immediate, retain that game for later resumption, and pause its elapsed timer without confirmation.
- A newly opened board with no reveal yet must be retained and resumable after leaving or reloading; any valid pre-first-reveal flags must also be retained, while mines remain unplaced and the timer remains at zero until the first reveal.
- Keyboard-only users must be able to reach and operate all interactive controls with visible focus and equivalent state feedback; a non-pointer action must not require a long press.
- While a board cell is focused, Arrow keys move focus among valid board coordinates; Enter or Space performs the selected primary action and F performs the selected secondary action.
- When a new or resumed board opens, keyboard focus must begin on its top-left cell.
- When Arrow-key navigation moves focus outside the visible board area, the board viewport must scroll only enough to keep the focused cell visible; the page itself must not scroll.
- The release has no formal WCAG conformance target; it must nevertheless meet this specification's requirements for keyboard operation, accessible names, focus behavior, and visible state feedback.
- The release must keep the defined visual motion unchanged; it does not need to follow a device reduced-motion preference or provide a separate motion setting.
- The timer must display and compare only whole elapsed seconds; a final time containing a partial second must round up to the next whole second before display and best-time comparison.
- Beginner must be selected by default when no valid saved difficulty selection exists; the last valid preset or Custom configuration must remain selected across reload until the player selects another difficulty or clears local data.
- When an active game is retained, Home must show distinct Resume game and New game actions. Resume game reopens the retained game; New game requires confirmation before replacing it.
- On app launch, a retained active game must open to Home with Resume game and New game actions; it must not automatically reopen the game screen.
- Only active games are resumable. On win or loss, the system must discard the resumable board after recording any eligible best time, so a later reload opens Home rather than a terminal board.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a private, single-player Minesweeper experience with no accounts, advertising, analytics, multiplayer, or server-side leaderboard.
- **FR-002**: The system MUST provide Beginner (9×9, 10 mines), Intermediate (16×16, 40 mines), Expert (24×24, 99 mines), and a Custom difficulty with 5–30 rows, 5–30 columns, and 1 through `rows × columns − 1` mines.
- **FR-002a**: The system MUST select Beginner when no valid saved difficulty selection exists. It MUST retain the last valid preset or Custom configuration, including Custom rows, columns, and mine count, across reload until the player selects another difficulty or clears local data.
- **FR-003**: The system MUST create a fresh board with all cells unopened and unflagged before the first reveal.
- **FR-004**: The system MUST place exactly the selected number of mines only when the first safe cell is actually opened and MUST exclude exactly that revealed cell from mine placement.
- **FR-005**: The system MUST calculate each cell's count from the up-to-eight adjacent cells after mines are placed.
- **FR-006**: The system MUST reveal the selected safe cell and, for a zero-count cell, reveal its connected zero-count region and directly bordering numbered cells.
- **FR-007**: The system MUST end a game as a loss immediately when a mine is revealed, stop its timer, prevent further game-changing cell actions, and present the full final board.
- **FR-008**: The system MUST end a game as a win when all non-mine cells are revealed, stop its timer, prevent further game-changing cell actions, and visibly flag remaining mines.
- **FR-009**: The system MUST allow a secondary action to toggle a flag only on an unopened cell and MUST not allow the flag total to exceed the board's mine count.
- **FR-010**: The system MUST remove a flag, without opening the cell, when a reveal action targets a flagged unopened cell; if no safe cell has yet been opened, it MUST leave mines unplaced and the timer at zero.
- **FR-011**: The system MUST start the elapsed-time display with the first reveal, stop it on win or loss, reset it for a new game, and pause it whenever the gameplay screen is not visible, a retained game is closed, or a blocking Help, Settings, or confirmation sheet is open. It MUST resume from the saved elapsed time only when gameplay is visible and no blocking sheet is open. It MUST display and compare best times as whole elapsed seconds, rounding a final time with any partial second up to the next whole second.
- **FR-012**: The system MUST offer a reset/status control that starts a new game using the current difficulty. It MUST request confirmation only while a game is actively playing and reset immediately before the first reveal or after a game finishes. A Play again action after a win or loss MUST start a new board using the completed game's exact configuration.
- **FR-012a**: The system MUST return to the home screen immediately when the player leaves an active game, retain that game for later resumption, and pause its elapsed timer without confirmation.
- **FR-012b**: When an active game is retained, the system MUST show distinct Resume game and New game actions on Home. Resume game MUST reopen the retained game, while New game MUST request confirmation before replacing it.
- **FR-012c**: On app launch, the system MUST open Home when an active game is retained and show Resume game and New game actions; it MUST NOT automatically reopen the game screen.
- **FR-013**: The system MUST provide a clear primary and secondary cell-action scheme: the default is reveal-first; players may choose flag-first; desktop secondary pointer action and touch long-press must represent the secondary action.
- **FR-013a**: The system MUST suppress the browser context menu for a desktop secondary pointer action on a board cell and MUST NOT suppress it elsewhere in the app.
- **FR-014**: The system MUST make the active input scheme visible during play and explain it in help content.
- **FR-015**: The system MUST provide all player-facing text in English and Ukrainian, including settings, validation, game states, help, and installation messaging. A language change MUST update every currently visible surface, including an open blocking modal, immediately.
- **FR-016**: On first launch, the system MUST use the device language when it is English or Ukrainian and English otherwise; it MUST retain a player-selected language and present it consistently across all screens and overlays after reload.
- **FR-017**: The system MUST provide Light, Dark, and System appearance choices, use System when no appearance preference has been saved, retain the choice, and apply a single coherent visual language to every screen, dialog, control, board state, and focus state. An appearance change MUST update every currently visible surface, including an open blocking modal, immediately.
- **FR-018**: The system MUST use centrally defined semantic visual roles so a full-theme change updates all surfaces, text, controls, game states, and number states together; user-interface styling must not be embedded in individual rendered elements.
- **FR-019**: The system MUST reflect the visual contract in `ui-contract.md`: modern layered app chrome, a crisp retro board, semantic number color plus tinted background, readable counter displays, and responsive layouts.
- **FR-020**: The system MUST keep a board inside its own two-axis scrolling region when necessary, keep every cell reachable, preserve usable cell targets, and expose a visual indication when additional board content is off screen.
- **FR-020a**: The system MUST render every interactive board cell at least 32×32 CSS pixels wide and high; it MUST use the board's own scrolling region rather than reducing cells below that floor.
- **FR-021**: The system MUST provide pointer, touch, and keyboard operation for every interactive control, with discernible names, visible focus, and state feedback.
- **FR-021a**: The system MUST let a player move board-cell focus with Arrow keys, use Enter or Space for the selected primary cell action, and use F for the selected secondary cell action.
- **FR-021d**: The system MUST place keyboard focus on the top-left board cell when a new or resumed board opens.
- **FR-021e**: When Arrow-key navigation moves focus outside the visible board area, the system MUST scroll only the board viewport enough to keep the focused cell visible and MUST NOT scroll the page itself.
- **FR-021b**: The system MUST not claim a formal WCAG conformance level; it MUST still provide the keyboard operation, accessible names, focus behavior, and visible state feedback required by this specification.
- **FR-021c**: The system MUST keep the defined visual motion unchanged and MUST NOT provide a reduced-motion preference response or separate motion setting in this release.
- **FR-022**: The system MUST separate scrolling from long-press interaction so a board scroll does not activate a cell action: a long press triggers the secondary action only after 600 ms without movement of 10 CSS pixels or more, and movement at or above that threshold cancels it.
- **FR-023**: The system MUST retain only approved player data locally: language, appearance, input preference, last valid difficulty selection including Custom dimensions and mine count, best times, and an eligible in-progress game.
- **FR-024**: The system MUST keep retained data under one versioned local record, validate it before use, and recover to safe defaults if it is missing, invalid, incompatible, or unavailable. If storage is full during a save, it MUST keep the current session playable, preserve existing data, and show a localized non-blocking warning that later progress may not survive reload.
- **FR-025**: The system MUST retain an in-progress game, including a board before its first reveal and any valid flags on it, its board, saved elapsed time, and relevant preferences, so an accidental reload or later offline launch can safely resume it; time while the app is closed MUST not count. A retained board before its first reveal MUST keep mines unplaced and its timer at zero until that reveal.
- **FR-025a**: The system MUST retain only active games as resumable, including a board before its first reveal and any valid flags on it. On win or loss, it MUST discard the resumable board after recording any eligible best time, so a later reload opens Home rather than a terminal board.
- **FR-026**: The system MUST let the player explicitly clear all retained local data after confirmation. If a game is currently open, it MUST keep the current board playable until the player leaves or reloads, while clearing its resumable copy and restoring retained preferences and records to defaults.
- **FR-027**: The system MUST expose a best-time summary for completed standard difficulties and each distinct valid Custom configuration, and update a record only when the completed time is better for that exact configuration. It MUST retain at most 100 Custom configuration records and remove the Custom configuration whose game was started least recently before adding another; starting a game with an existing Custom record MUST update that record's recency even if the game is not completed. Standard-difficulty records are never removed by this limit.
- **FR-028**: The system MUST be fully usable as a static website at its published repository subpath and MUST require no production server, secrets, host rewrites, or runtime network service.
- **FR-029**: The system MUST offer installation only when the browser and operating system support it and MUST remain fully usable when they do not.
- **FR-030**: After the first successful online visit, the installed or website form MUST provide the game shell and gameplay assets offline. When online, it MUST check for static updates automatically, show a localized Update ready notice, and activate the update only when the player chooses, preserving any in-progress game first.
- **FR-031**: The system MUST provide concise How to Play content and clear win, loss, validation, storage-recovery, and installation feedback in the selected language.
- **FR-032**: The system MUST use reusable, parameterized interface elements for repeated interaction patterns while preserving their accessible names and distinct game-state meaning.
- **FR-033**: The delivered product MUST have automated proof for game-rule and state changes, visible interface contracts, and the critical end-to-end journeys defined in this specification.
- **FR-034**: The delivered release MUST provide evidence that its production artifact works at the GitHub Pages repository subpath and that offline, installation, and update behavior are tested against that artifact rather than a previously cached development session.

### Key Entities

- **Game configuration**: The chosen difficulty, its board dimensions, mine count, and whether it is a standard preset or Custom.
- **Cell**: One immutable board position with mine placement, neighbouring-mine count, revealed/flagged status, and any terminal visual result.
- **Game session**: A board plus its status, first-reveal state, elapsed-time basis, flag allowance, and selected configuration.
- **Player preferences**: The language, appearance preference, primary/secondary cell-action mapping, and last valid difficulty selection including Custom dimensions and mine count.
- **Local player record**: Versioned browser-local collection of approved preferences, permanent standard-difficulty best times, up to 100 Custom best times keyed by exact configuration with recency updated when that configuration's game starts, and one eligible resumable game.
- **Visual contract**: The living reference for information hierarchy, responsive behavior, semantic color roles, components, and state presentation; it is maintained with this specification.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A player can start a preset game and make a first safe reveal in no more than three intentional interactions from the initial screen.
- **SC-002**: For each of the three standard difficulties, 100% of seeded rule scenarios verify first-click safety, mine count, neighbour counts, flood-fill, flag limit, flag-clearing reveal, win, loss, and timer-stop behavior.
- **SC-003**: 100% of tested visible product messages are available in both English and Ukrainian, and changing either language or appearance updates all tested screens without a reload.
- **SC-004**: At 320 px, 768 px, and 1440 px wide viewports, every tested interactive control is reachable and every cell of a 24×24 board can be reached using the board's own scrolling region.
- **SC-005**: Core reveal, flag, win, loss, restart, preference retention, best-time retention, help, local-data reset, desktop pointer, keyboard, and touch-sized journeys pass browser-level automated tests.
- **SC-006**: After one successful online visit to the production artifact, the automated offline journey starts or resumes a game and completes a game without a failed required network request.
- **SC-007**: 100% of production-release checks use the committed dependency lock, pass required quality gates, and publish only the verified static artifact at the repository subpath.
- **SC-008**: A player can complete a standard game without being asked to register, accept advertising, submit personal data, or connect to an online service.
- **SC-009**: On a 30×30 board, a reveal or flag action updates the visible board within 250 ms under the documented release-test environment.

## Assumptions

- This is one cohesive initial delivery: game engine, interface, local preferences/records, installability, and static deployment are mutually necessary for the promised product and will be planned as dependency-ordered slices within this feature.
- The legacy Python game is reference evidence, not automatic authority. Its documented delayed placement, single-cell first-click safety, flood-fill, terminal states, and presets are adopted here. Its mine-first handling of a flagged mined cell conflicts with the supplied product draft's flag-clearing reveal rule and is classified as a legacy defect; FR-010 is the intended product rule. Any further contradiction discovered during porting requires a specification amendment.
- The supplied draft and mockup are migration inputs only. Their old Next.js and English-only statements are superseded by the constitution and this specification; their game and visual intent are retained here where explicitly stated.
- No sound, haptics, multi-click/chording, timer leaderboard sharing, accounts, native packaging, multiplayer, monetization, or tracking is in this initial delivery.
- Custom boards use 5–30 rows, 5–30 columns, and 1 through `rows × columns − 1` mines. These bounds preserve the exact one-cell first-click-safe rule while keeping the largest board at 900 cells.
- The last valid selected preset or Custom configuration is retained as a player preference; first launch, invalid saved data, and local-data reset select Beginner.
- Play again after a win or loss creates a new board with the completed game's exact configuration, including Custom rows, columns, and mine count.
- The local record may retain one in-progress game. Browser-storage limits and private-browsing restrictions are treated as recoverable conditions, not as reasons to block play.
- On first launch, English or Ukrainian is selected from the device language when available; all other device languages receive English until the player chooses otherwise.
- On first launch with no saved appearance preference, System appearance is selected and follows a supported device preference.
- A retained game's elapsed time pauses when the app is closed and resumes from its saved value when the game is reopened; closed time never contributes to a best-time result.
- A newly opened board remains resumable before its first reveal, including any valid flags; it retains no placed mines and a zero timer until that reveal occurs.
- A game's elapsed time also pauses while its page is backgrounded or the device is locked; backgrounded time never contributes to a best-time result.
- A game's elapsed time also pauses while any blocking Help, Settings, or confirmation sheet is open; sheet-open time never contributes to a best-time result.
- Best times are retained for every standard difficulty and each distinct valid Custom configuration; a Custom record is compared only with later games having the same rows, columns, and mine count. At most 100 Custom configuration records are retained; starting a game with an existing Custom record updates its recency even if the game is not completed, and adding another record removes the configuration whose game was started least recently, never a standard-difficulty record.
- The living visual contract is reviewed and amended together with this specification. It is a design reference, not a pixel-identical screenshot mandate.
