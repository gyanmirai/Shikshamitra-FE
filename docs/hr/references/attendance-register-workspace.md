---
module: hr
domain: attendance-register
content_type: Reference
status: canonical
updated_on: 2026-10-26
owner: frontend-team
audience: humans-and-agents
---

# Attendance register workspace

Backend query, scope and export semantics are owned by [the HR API contract](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/modules/hr/api.md#attendance-register-query-composition).

The register at `src/screens/hr/attendance-tracking/index.tsx` keeps its expandable staff/day tables and adjustment dialogs. Its compact header contains bulk adjustment; the period toolbar contains range selection, previous/next month, this month, filter disclosure, reset and the server result count. No dashboard summary cards are rendered here. Other attendance screens are unchanged.

The optional panel uses shared `CustomSelect` and `PaginatedSearchSelect` controls. Divisions are the existing academic organization assignments (`educationMediumStageIds`), not class/student divisions. Empty selection means all authorized divisions, including unassigned staff where the existing server scope allows it. Selected divisions match **any**, and combine with every other criterion using **AND**. Staff searches are paginated and a selected ID is independent of the lookup text. Department uses the existing server substring match (case sensitive). Teaching/non-teaching is the staff group; designation and employment-status controls are deliberately absent because the register has no supported designation filter or arbitrary lifecycle-status query.

Present, half day and absent filter attendance days before calculating staff totals. Editable/locked filters payroll state using the existing server behavior. Exception options are All, Needs attention, Absent, Half day, Missing punch and Locked; these select staff within the already filtered day set. The range stays visible when the panel closes. Applied chips and their count remain visible and removable; Reset restores the current month-to-date range and clears domain filters and table search while retaining sort.

Every filter/search/sort change resets paging and day selection. Page changes clear day selection. Server sorting supports Staff, Attendance/present count, Group and Department, with stable employee-ID tie ordering. Search, sorting and filters are sent to the grouped reader before paging. No loaded-page filtering is applied. New query scopes use `currentData` to avoid displaying editable stale-scope rows while loading. Backend `canEdit` and adjustment enforcement remain authoritative.

Excel/PDF use the existing complete HR export workflow with the same query, including the division array and sort. The backend export source calls the same grouped reader and replaces paging with each export batch. Selection/action controls are excluded from the exported columns. Expanded day tables retain their existing filtered day export.

Requires the companion backend multi-division/sorting contract before the frontend is released. No migration or database change is needed. Shared table, dialog, selector and export-hook implementations are not modified; concurrent table and keyboard work may overlap the owning register screen or its API client.

## Regression checks

`src/redux/hr/attendance-register-query.test.ts` covers indexed HTTP array serialization and reset/legacy compatibility. The fixture in `e2e/fixtures/attendance-register` mounts the actual screen with synthetic data and supports repeatable desktop/mobile checks for filter composition, reset/empty, editing, paging, sorting, month navigation and captured export scope. See its README for commands and test-double limitations. The backend register API regression covers OR divisions combined with staff/group/search/department, paging/reset and unauthorized-stage rejection against an in-memory test database.
