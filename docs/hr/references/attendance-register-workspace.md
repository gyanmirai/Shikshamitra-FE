---
module: hr
domain: attendance-register
content_type: Reference
status: canonical
updated_on: 2026-11-08
owner: frontend-team
audience: humans-and-agents
---

# Attendance register workspace

Backend query, scope and export semantics are owned by [the HR API contract](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/modules/hr/api.md#attendance-register-query-composition).

The register at `src/screens/hr/attendance-tracking/index.tsx` starts with 50 staff per page and keeps its expandable staff/day tables and adjustment dialogs.
The header holds the bulk adjustment action.
The toolbar groups keyboard-accessible month navigation with the shared date range picker and keeps filters and request status visible.
Returning to the current month uses month-to-date, and custom ranges can span up to 366 days between endpoints.
Division options start loading when filters open, and department typing is debounced.

The optional panel uses shared `CustomSelect` and `PaginatedSearchSelect` controls. Divisions are the existing academic organization assignments (`educationMediumStageIds`), not class/student divisions. Empty selection means all authorized divisions, including unassigned staff where the existing server scope allows it. Selected divisions match **any**, and combine with every other criterion using **AND**. Staff searches are paginated and a selected ID is independent of the lookup text. Department uses the existing server substring match (case sensitive). Teaching/non-teaching is the staff group; designation and employment-status controls are deliberately absent because the register has no supported designation filter or arbitrary lifecycle-status query.

Present, half day and absent filter attendance days before calculating staff totals. Editable/locked filters payroll state using the existing server behavior. Exception options are All, Needs attention, Absent, Half day, Missing punch and Locked; these select staff within the already filtered day set. The range stays visible when the panel closes. Applied chips and their count remain visible and removable; Reset restores the current month-to-date range and clears domain filters and table search while retaining sort.

Every filter, search, or sort change resets paging and day selection.
Page changes clear day selection, and expanded details follow the staff ID.
Single-column sorts on Staff, Attendance, Group, and Department use the grouped register endpoint with stable employee-ID tie ordering.
Column filters and other sorts use the operational table endpoint, with only one register endpoint subscribed for any given view.
New scopes use `currentData` so previous-scope rows do not appear under the new criteria.
A 30-second read timeout exposes the table's retry action.
Revisiting an unchanged query within 30 seconds can reuse its cached page, and attendance, staff, policy, and payroll updates invalidate that cache.
Adjustment controls require the Attendance Tracking Add permission and server `canEdit`.
The per-staff action targets that staff member's editable days, and the header action targets the list selection.

Excel/PDF use the existing complete HR export workflow with the same query, including the division array and sort. The backend export source calls the same grouped reader and replaces paging with each export batch. Selection/action controls are excluded from the exported columns. Expanded day tables retain their existing filtered day export.

The register uses the existing backend paging, filter and sorting contracts.
The table's optional row key controls expansion identity, and the shared range picker supports keyboard access through its calendar button.

## Adjustment recovery and capture modes

Single and bulk correction dialogs use the selected editable days' capture modes. Status-only selections hide punch fields and send null times. Mixed selections require times for time-based days and explain that status-only days do not store those times; locked selected days do not add a time requirement. Unmarked days keep the existing employee/date payload, including an empty attendance-ID array when every selected day is unmarked.

HTTP success alone does not close an adjustment draft. Single-row corrections check the updated/skipped outcome and retain the dialog and server skip reason when no change occurred. Bulk corrections reconcile every submitted attendance ID or employee/date against the returned row outcomes. Partial/all-skipped results keep remarks, reason and remaining targets, display staff/date-specific reasons, and remove confirmed successes from the next request. Target snapshots survive query refreshes, including a newly created ID for a formerly unmarked day. Only fully confirmed updates close the draft and show success.

Incomplete/contradictory acknowledgements and rejected bulk requests retain the draft, disable immediate retry and instruct the user to close and refresh the register before submitting again; they must not be blindly retried because some writes may already have completed. Submitting locks fields, repeat submission and dialog dismissal. The backend remains authoritative for locks and scope.

## Regression checks

`src/redux/hr/attendance-register-query.test.ts` covers indexed HTTP array serialization and reset/legacy compatibility. The fixture in `e2e/fixtures/attendance-register` mounts the actual screen with synthetic data and supports repeatable desktop/mobile checks for filter composition, reset/empty, editing, paging, sorting, month navigation and captured export scope. See its README for commands and test-double limitations. The backend register API regression covers OR divisions combined with staff/group/search/department, paging/reset and unauthorized-stage rejection against an in-memory test database.
