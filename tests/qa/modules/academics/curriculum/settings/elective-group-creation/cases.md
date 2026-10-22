# Elective Group Creation: functional cases

[Suite index](README.md) · [Fixtures and execution](test-data.md)

All cases start **Not run**. Dated reports override execution status, not this reusable baseline. Unless stated otherwise use the academic admin, current QA scope and test-owned G-unused. Check persistence by reopening/reloading after each successful mutation.

| ID | Priority / method | Preconditions and steps | Expected result |
| --- | --- | --- | --- |
| QA-ACM-EGC-FUN-001 | P1 Browser | Open Academics > Curriculum > Settings > Elective Group Creation. Reload the exact route. | Correct selected menu, title, breadcrumbs and same scoped list; no unrelated page. |
| QA-ACM-EGC-FUN-002 | P1 Browser | Open create from the header with no other dialog open. | Add Elective Group; blank name/color/description/subjects, Group Type Language; no stale edit values. |
| QA-ACM-EGC-FUN-003 | P1 Browser | Submit a completely blank create form. | Name, color and at-least-two-subject errors are perceivable; dialog stays open and nothing is saved. |
| QA-ACM-EGC-FUN-004 | P1 Browser | Enter unique valid name and select color; leave subjects empty; submit. | Minimum-two error; valid values retained; no group created. |
| QA-ACM-EGC-FUN-005 | P1 Browser | Select exactly one subject with other fields valid; submit. | Minimum-two error; one selection retained; no save. |
| QA-ACM-EGC-FUN-006 | P1 Browser | Create G-new with two distinct active subjects, type Language and valid color; submit once. | One success; dialog closes; one correct row persists with both subjects, Active and unused state. |
| QA-ACM-EGC-FUN-007 | P1 Browser | Open subject list; search `Hindi`, select it, clear search; select English then remove/reselect Hindi. | Search filters options only; stable selected IDs/chips survive search and no duplicate chips occur. |
| QA-ACM-EGC-FUN-008 | P1 Browser | Open Group Type options; inspect all seven; save one test group as Skill Subject then edit to Custom. | Language, Skill Subject, Optional Subject, Vocational Subject, Activity Subject, Stream Elective, Custom; chosen type persists. |
| QA-ACM-EGC-FUN-009 | P1 Browser | Save with Description empty; reopen, enter a multi-line plain-text school description, update, reopen. | Optional field works; lines/content retained and rendered safely. |
| QA-ACM-EGC-FUN-010 | P1 Browser | Choose one color, save; edit to a different color, save/reload. | Saved color and list identity update consistently; other values unchanged. |
| QA-ACM-EGC-FUN-011 | P1 Browser | Open an unused group for edit. | Name/type/color/description and all member subjects populated; subjects editable; status/sort order are not fabricated form controls. |
| QA-ACM-EGC-FUN-012 | P1 Browser | Rename G-unused without changing its pair; update, reopen. | Edit excludes its own ID from duplicate preflight; rename persists without another group. |
| QA-ACM-EGC-FUN-013 | P1 Browser | Replace one member of G-unused with another active subject; save with unique combination. | New membership persists, removed member absent; count remains at least two. |
| QA-ACM-EGC-FUN-014 | P0 Browser/API | G-used has known dependencies. Open edit and try changing subjects; separately submit changed IDs using authorized API fixture. | UI membership and removals locked with explanation; backend rejects bypass; allowed metadata edits preserve original IDs. |
| QA-ACM-EGC-FUN-015 | P1 Browser | Create with existing active group's exact name but a different valid subject pair. | Duplicate-name feedback; no extra row; values retained. |
| QA-ACM-EGC-FUN-016 | P1 Browser | Use a new name with an existing group's same subjects, selected in reverse order. | Same-combination warning; no save regardless of subject order. |
| QA-ACM-EGC-FUN-017 | P1 Browser | Enter G-unused's name in table search, then a unique absent term; clear. | Matching row, helpful filtered-empty state, then complete baseline list returns. |
| QA-ACM-EGC-FUN-018 | P1 Browser | Search by a visible member name (e.g. Hindi), and displayed Active status. | Matching rendered values searchable without needing IDs, JSON or numeric status codes. |
| QA-ACM-EGC-FUN-019 | P1 Browser | Apply Status = Active, then Archived with appropriate fixture rows; clear. | Visible matching records/counts agree with filter; clearing restores records. |
| QA-ACM-EGC-FUN-020 | P2 Browser | Filter Group Type and numeric Used In Classes; clear; sort name/date both directions. | Correct comparisons and stable row identities; zero differs from a positive count; dates sort chronologically. |
| QA-ACM-EGC-FUN-021 | P2 Browser | With 11+ fixture groups, change page/page size, density, column visibility then open/close a record. | Correct ranges/rows; chosen table context survives dialog; required identity/actions remain usable. |
| QA-ACM-EGC-FUN-022 | P1 Browser | Open G-unused by row and by Unused/usage control. | Same Elective Group Usage details, correct subjects/status and four zero dependency metrics; no unrelated group. |
| QA-ACM-EGC-FUN-023 | P0 Browser/API | Open G-used with known class, student, timetable and exam fixture counts. | Counts match independent fixture evidence; restrictions and applicable dependency links are accurate. |
| QA-ACM-EGC-FUN-024 | P1 Browser | Open full insights before create, after create, archive, restore and cleanup. | Total/active/archived/used/unused metrics reconcile with same scoped list, not current search subset. |
| QA-ACM-EGC-FUN-025 | P1 Browser | Open archive for G-unused; Cancel; reopen, enter QA reason and confirm. | Cancel leaves Active; confirm archives exactly target; members retained and row labeled Archived. |
| QA-ACM-EGC-FUN-026 | P1 Browser | On archived test-owned group choose Restore; reopen after reload. | Active again, same identity/members/details, correct actions and insights. |
| QA-ACM-EGC-FUN-027 | P1 Browser | Open Delete for unused group; Cancel; reopen and confirm deletion. | Target named clearly; Cancel preserves it; confirmation removes only it and refreshes list/metrics. |
| QA-ACM-EGC-FUN-028 | P0 Browser/API | On G-used inspect Delete and attempt API deletion in isolated fixture. | UI explains restricted deletion; server refuses; dependency/history records intact. |
| QA-ACM-EGC-FUN-029 | P1 Browser | Change name in create/edit; invoke Cancel, X and Escape independently. Choose Keep editing then Discard changes. | One dirty-close warning per close path; keep retains input; discard resets form; no accidental save. |
| QA-ACM-EGC-FUN-030 | P1 Harness/Browser | Delay duplicate-check/save then double-click submit, try editing/Cancel/X/Escape; fail request then retry. | Single effective mutation, consistent busy lock; useful failure feedback and values retained; one successful retry. |
| QA-ACM-EGC-FUN-031 | P0 API/Browser | In separate View-only/no-access sessions inspect route/actions and attempt mutations; expire admin session during save. | Grants enforced by server; appropriate hidden/disabled UI; no unauthorized record or leaked data; recoverable sign-in flow. |
| QA-ACM-EGC-FUN-032 | P0 API/Browser | Use distinct test tenants/media; switch context and attempt old/cross-scope ID operations. Read audit evidence after owned lifecycle. | Scope-appropriate data and options only; cross-scope actions denied; lifecycle trace has correct actor/scope/time and no fabricated audit UI. |
