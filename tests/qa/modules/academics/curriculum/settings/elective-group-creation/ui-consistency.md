# Elective Group Creation: UI consistency checklist

[Suite index](README.md) · [Execution guide](test-data.md)

Use **Consistent / Inconsistent / Unverified** with evidence in the dated report. Baseline for all rows is **Unverified**. Review at1440×900,768×1024 and390×844, light and dark themes where supported; a screenshot at one viewport does not cover the matrix.

Authority: FE `DESIGN.md`, `.agents/skills/shikshamitra-ui-consistency/SKILL.md` and its page-header, table, adaptive-actions, form-dialog, section, confirmation, detail, multi-select and academic-scope guides. The inspected `local-multiselect-open.jpg` establishes the existing selector composition only; its legacy labels/footer are not approval of current inconsistencies.

| ID | Priority | Check / procedure | Expected consistency |
| --- | --- | --- | --- |
| QA-ACM-EGC-UI-001 | P1 | Compare page header/menu/breadcrumbs to Subjects Creation. | Exact task title; same inline family anatomy, accessible help and one create action. |
| QA-ACM-EGC-UI-002 | P1 | Inspect create action text and accessible name. | Clear Add Elective Group action, compact shared button; no ambiguous bare object label. |
| QA-ACM-EGC-UI-003 | P1 | Compare table toolbar, sticky columns and remaining-height layout. | Shared CustomizableTable search/utilities/footer; scrolling confined to table region. |
| QA-ACM-EGC-UI-004 | P1 | Inspect supported data-column filter icons, active chips and reset. | Filters present where supported; matching displayed data; Subject composite column's unsupported filter not invented. |
| QA-ACM-EGC-UI-005 | P2 | Compare group identity, member chips, dates and status text. | Theme tokens, shared readable typography; status has text, dates DD-MM-YYYY, missing facts clear. |
| QA-ACM-EGC-UI-006 | P1 | Inspect active/archived row actions and overflow via pointer/keyboard. | First two available direct actions, remaining in named menu; disabled actions explain restriction. |
| QA-ACM-EGC-UI-007 | P1 | Open create/edit; inspect compact shell, close button and footer. | Shared CustomDialog, equivalent widths, fixed header/footer and one scrolling body. |
| QA-ACM-EGC-UI-008 | P1 | Inspect header help; reach via Tab and activate/focus. | Shell titleInfo; named keyboard-focusable info control, concise purpose, accessible X. |
| QA-ACM-EGC-UI-009 | P1 | Compare Group Details/Subject Selection in form and matching view. | Title Case, subtitle1/600 headings, neutral leading icon and accessible info; explanations in help, not repeated subtitles. |
| QA-ACM-EGC-UI-010 | P1 | Inspect field labels and spacing. | Sentence-case labels, one required marker, small full-width fields, uniform shared spacing. |
| QA-ACM-EGC-UI-011 | P1 | Submit blank; inspect required field wrappers and error semantics. | Every required control uses shared validation treatment; errors visible, associated and submission-gated. |
| QA-ACM-EGC-UI-012 | P1 | Submit with only color missing; use keyboard. | Visible group error, accessible color group/required semantics and reachable palette; not red label alone. |
| QA-ACM-EGC-UI-013 | P1 | Inspect subject selector, search, chips, options and errors. | Stable IDs, bounded menu, checked state/name, associated helper; selection persists across search/Escape. |
| QA-ACM-EGC-UI-014 | P1 | Inspect Group Type select in keyboard/required-error states. | Shared select behavior, visible label/focus, correct required/error semantics and all seven options. |
| QA-ACM-EGC-UI-015 | P1 | Compare create/edit submit labels/icons to shared form contract. | Both Submit with shared icon; outlined Cancel; compact footer action spacing. |
| QA-ACM-EGC-UI-016 | P1 | Inspect Cancel/X/Escape after edits and during save. | One shared dirty-close confirmation, Keep editing/Discard changes, busy locks consistent on every close path. |
| QA-ACM-EGC-UI-017 | P1 | Open Delete and Archive decisions. | Named target, semantic icon, clear consequence; outcome action Delete/Archive rather than Yes; Cancel safe. |
| QA-ACM-EGC-UI-018 | P1 | Open usage details and compare record-view rules. | Required header help, matching form/view sections, readable label/value pairs, saved group type/description not lost. |
| QA-ACM-EGC-UI-019 | P1 | Inspect usage section help/counts/restrictions/footer. | Consistent typography and accessible section help; Close-only read-only footer; lifecycle actions use owning action context. |
| QA-ACM-EGC-UI-020 | P1 | Observe initial/refresh/empty/filtered-empty/API error/save states. | Distinguishable states; no false zero usage or success; preserved inputs and meaningful retry. |
| QA-ACM-EGC-UI-021 | P1 | Traverse page/form/options/row via Tab, Shift+Tab, Enter, Space, Escape. | Visible focus and logical order; row activation works; no trap; focus returns after dialog. |
| QA-ACM-EGC-UI-022 | P1 | Measure390×844 form/table/usage/confirmation and long selected chips. | Document contained, fields stack, footer reachable; table may scroll within own region. |
| QA-ACM-EGC-UI-023 | P2 | Repeat main states at768×1024 and1440×900. | No intermediate clipping, detached tooltip, duplicated scrolling or excess empty form space. |
| QA-ACM-EGC-UI-024 | P1 | Light/dark plus200% zoom; inspect text, help, borders and focus. | Semantic theme tokens; readable status/chips/errors, keyboard focus and usable layout; measure contrast before claiming compliance. |
| QA-ACM-EGC-UI-025 | P1 | Inspect current academic year/board/medium and reopen after context switch. | Scope stays visible and consistent with list/options/dialog; no cross-context stale identity. |
| QA-ACM-EGC-UI-026 | P2 | Open full insights; compare counts, title/help and close behavior. | Shared insights surface; numbers reconcile; accessible controls; no local duplicate metrics inside form. |
