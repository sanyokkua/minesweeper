# Requirements Quality Checklist: Minesweeper Static SPA

**Purpose**: Review the feature requirements for completeness, clarity, consistency, recovery coverage, accessibility interaction, and static-PWA release readiness before task generation.  
**Created**: 2026-08-14  
**Feature**: [spec.md](../spec.md)  
**Audience / timing**: Standard PR reviewer checklist after planning and before implementation tasks.

## Requirement Completeness

- [ ] CHK001 Are the permitted data categories and explicit exclusions complete for every retained record, notice, and installation/update state? [Completeness, Spec §FR-001, §FR-023–FR-027]
- [ ] CHK002 Are requirements defined for all transitions between Home, an untouched game, an active game, and each terminal outcome? [Completeness, Spec §FR-003, §FR-007–FR-008, §FR-012–FR-012c, §FR-025a]
- [ ] CHK003 Are the Custom configuration constraints defined consistently for input, retained selection, game creation, exact record identity, and replay? [Completeness, Spec §FR-002, §FR-002a, §FR-012, §FR-027]
- [ ] CHK004 Are requirement-level distinctions defined for every terminal cell presentation, including detonated mine, ordinary mine, incorrect flag, and unrevealed safe cell? [Completeness, Spec §FR-007, Edge Cases, UI Contract §Reusable component contracts]
- [ ] CHK005 Are all required player-facing message classes enumerated for both languages, including validation, storage recovery, installation, update, help, and outcome messages? [Completeness, Spec §FR-015, §FR-031]
- [ ] CHK006 Are the requirements explicit about which Home controls appear when no resumable game, a pre-first-reveal game, and an active game exist? [Completeness, Spec §US2 acceptance 1–3, §FR-012b, §FR-025]

## Requirement Clarity and Measurability

- [ ] CHK007 Is the phrase “accurately shows the revealed result” decomposed into objectively observable safe-cell, number, flood-frontier, and terminal-state criteria? [Clarity, Spec §US1 acceptance 1–5, §FR-005–FR-008]
- [ ] CHK008 Is “blocking sheet” unambiguously defined as the full set of sheets that pause time, including whether terminal outcome sheets are intentionally excluded from the active-game rule? [Clarity, Spec §FR-011, Edge Cases, UI Contract §Overlays and sheets]
- [ ] CHK009 Is the phrase “immediately” quantified or given an objective event boundary for language/theme updates in an open sheet? [Measurability, Spec §FR-015, §FR-017]
- [ ] CHK010 Is “visibly updates within 250 ms” accompanied by an acceptance measurement boundary, release-test environment definition, and treatment of device/browser variance? [Measurability, Spec §SC-009, Plan §Technical Context]
- [ ] CHK011 Are “safe defaults” specified sufficiently to identify the required locale, appearance, input mode, selected difficulty, records, and resume state after each recovery case? [Clarity, Spec §FR-002a, §FR-016–FR-017, §FR-024]
- [ ] CHK012 Is “preserving any in-progress game first” defined with a clear requirement outcome when that preservation cannot complete because browser storage is unavailable or full? [Gap, Clarity, Spec §FR-024, §FR-030]
- [ ] CHK013 Is the update-check timing sufficiently defined to distinguish initial online availability, return-to-online availability, repeated notices, and a declined update? [Gap, Clarity, Spec §FR-030, Edge Cases]

## Requirement Consistency

- [ ] CHK014 Are delayed mine placement, first safe reveal, flagged-reveal clearing, pre-first-reveal flags, and zero elapsed time mutually consistent without an unaddressed first-action state? [Consistency, Spec §FR-003–FR-004, §FR-010, §FR-011, §FR-025]
- [ ] CHK015 Are the active-game reset, New-game replacement, replay, and Reset local data rules consistent about which configuration remains selected and which board remains playable? [Consistency, Spec §FR-012, §FR-012b, §FR-026, Clarifications 2026-08-14]
- [ ] CHK016 Are the whole-second timer and best-record requirements consistent for zero duration, partial seconds, pause/resume intervals, and equal times? [Consistency, Spec §FR-011, §FR-027, Edge Cases]
- [ ] CHK017 Are the “only active games are resumable” rule and the requirement that pre-first-reveal boards with flags resume expressed without classifying an untouched board inconsistently? [Consistency, Spec §FR-025, §FR-025a, Edge Cases]
- [ ] CHK018 Are the privacy/no-runtime-network requirements consistent with the online update-check and first-online-visit offline prerequisites, including what network contact is permitted? [Consistency, Spec §FR-001, §FR-028, §FR-030, Assumptions]
- [ ] CHK019 Are keyboard focus, modal focus trapping/restoration, and immediate locale/theme updates in open sheets consistent with the stated accessibility and sheet contracts? [Consistency, Spec §FR-015, §FR-017, §FR-021–FR-021e, UI Contract §Overlays and sheets]

## Acceptance Criteria and Scenario Coverage

- [ ] CHK020 Do acceptance scenarios state the expected initial screen and available actions for both a fresh launch and a launch with a retained active game? [Coverage, Spec §US2 acceptance 1–3, §FR-012c]
- [ ] CHK021 Are requirements complete for each input modality’s primary/secondary mapping, including a non-pointer equivalent that does not depend on timing? [Coverage, Spec §FR-013–FR-014, §FR-021a, §FR-022]
- [ ] CHK022 Are requirements defined for the status/reset control in ready, playing, won, and lost states, including confirmation and retained-session consequences? [Coverage, Spec §US4 acceptance 2, §FR-012]
- [ ] CHK023 Are requirements defined for both a better and a non-better completed time, including equal whole-second results and each standard/Custom configuration identity? [Coverage, Spec §US2 acceptance 8, §FR-027]
- [ ] CHK024 Are explicit acceptance scenarios present for the 100th and 101st Custom record, a recently started-but-unfinished configuration, and a standard record at the same time? [Gap, Scenario Coverage, Spec §FR-027, Edge Cases]
- [ ] CHK025 Are requirements defined for the state of the current board, Home options, and retained preferences after local-data reset while a sheet is open? [Gap, Recovery Coverage, Spec §FR-026, Clarifications 2026-08-14]
- [ ] CHK026 Are the requirements explicit about the user-visible recovery path when persisted preferences/records are valid but the resumable game alone is invalid? [Gap, Recovery Coverage, Spec §FR-024–FR-025]
- [ ] CHK027 Are requirements defined for an update waiting while an active game is open, a sheet is open, or an update was previously dismissed? [Gap, Exception Coverage, Spec §FR-030]

## Interaction, Accessibility, and Responsive Coverage

- [ ] CHK028 Are accessible-name requirements explicit for every Board-cell state, coordinate convention, status face, icon-only action, counter, and transient notice? [Completeness, Spec §FR-021–FR-021b, UI Contract §Reusable component contracts]
- [ ] CHK029 Is “equivalent state feedback” clarified so requirements state which visual and nonvisual feedback is required for flag, reveal, loss, win, validation, storage warning, and update-ready states? [Clarity, Spec §FR-021, §FR-031]
- [ ] CHK030 Are focus movement and board viewport containment requirements complete at all board edges and for focus restored after each dismissible sheet? [Coverage, Spec §FR-021a, §FR-021d–FR-021e, UI Contract §Overlays and sheets]
- [ ] CHK031 Are 320 px, 768 px, and 1440 px requirements explicit about the viewport height/device assumptions needed to judge board reachability and page-overflow criteria? [Measurability, Spec §SC-004, UI Contract §Responsive and accessibility rules]
- [ ] CHK032 Are long-press cancellation requirements clear about the boundary at exactly 10 CSS pixels and about interruption by a sheet, navigation, or game replacement? [Clarity, Spec §FR-022, Edge Cases]
- [ ] CHK033 Are requirements defined for unsupported or changing device language/system appearance observation without contradicting the required default and persistence behavior? [Coverage, Spec §FR-016–FR-017, Edge Cases]

## Static Delivery, Dependencies, and Assumptions

- [ ] CHK034 Are the supported browser baseline and the meaning of “current and immediately previous stable” pinned or given a release-evidence reference so support is objectively reviewable? [Gap, Dependency Clarity, Constitution §III]
- [ ] CHK035 Are all base-path requirements stated consistently for the published Pages subpath, application start location, manifest, icons, and offline shell? [Consistency, Spec §FR-028, §FR-034, Constitution §II]
- [ ] CHK036 Are requirements explicit about the expected user-facing outcome when installation, service-worker registration, cache storage, or update activation is unsupported or fails? [Coverage, Spec §FR-029–FR-031, Edge Cases]
- [ ] CHK037 Is the offline promise bounded consistently to a successful online visit and clearly separated from unsupported first-visit offline behavior? [Clarity, Spec §FR-030, §SC-006, Assumptions]
- [ ] CHK038 Are static-update requirements clear enough to distinguish automatic detection, visible readiness, user consent, successful activation, and a recovery outcome after activation failure? [Completeness, Spec §FR-030, Edge Cases]
- [ ] CHK039 Are the legacy-reference assumptions sufficiently classified to prevent any newly discovered Python behavior or mockup detail from silently becoming a product requirement? [Consistency, Spec §Assumptions, Constitution §I, UI Contract §Initial-source traceability]
- [ ] CHK040 Are dependency-selection and lockfile/release-gate requirements complete enough to identify who approves a required dependency exception and how that exception is recorded? [Gap, Dependencies, Constitution §V–VI]

## Notes

- This checklist reviews the written requirements and contracts only. It does not prove that an implementation behaves correctly.
- `[Gap]` items identify requirement detail that a reviewer should either add, explicitly exclude, or record as an intentional assumption before implementation.
