---
title: Audit Log UI Rulebook
status: draft
owner: frontend-team
scope: academic-audit-history-diffs-and-activity-views
---

# Audit Log UI Rulebook

This document defines audit-log surfaces that record academic changes and let
authorized users search, filter, compare, and inspect activity. It applies to
Academic Audits and Calendar Audit Logs. Audit logs are read-only records;
ordinary tables remain governed by [tables.md](tables.md), while detail and
drawer presentation follow [detail-views.md](detail-views.md) and
[sidebars.md](sidebars.md).

## 1. Audit purpose and trust

- The interface must make it clear that the content is historical system
  activity, not editable business data.
- Never allow ordinary row editing, deletion, or inline mutation of an audit
  record.
- Keep the event, actor, time, affected entity, reason, impact, and source
  understandable without exposing internal implementation identifiers as the
  primary content.
- Preserve the selected academic context and clearly state whether the log is
  scoped to that context or shows school-wide history.
- Do not silently mix contexts. If records from multiple contexts are shown,
  provide a visible scope label or context column.

## 2. Audit workspace anatomy

A standard audit workspace may contain:

1. Search across activity records.
2. Module, action, actor, impact, and date filters.
3. Saved filter or reset actions when the product supports them.
4. View tabs such as `Table`, `Timeline`, and `Analytics`.
5. The activity list or chart.
6. A row expansion, diff view, or read-only detail surface.

- Keep the page title and breadcrumbs in the shared page-header pattern.
- Keep search, filters, tabs, and table content in a stable order.
- Do not place destructive or editing actions in the audit toolbar.
- Use `Export audit report` only when export permission and data scope are
  clear.

## 3. Naming and copy conventions

- Use sentence case for headings, filters, statuses, buttons, and explanations.
- Prefer `Audit logs`, `Academic action`, `Sub-module`, `Performed by`,
  `Occurred at`, `Changes`, `Source`, `Impact`, and `Actions`.
- Use a user-facing action such as `Calendar published`, `Day added`, or
  `Result published` as the primary event label.
- Keep internal event keys, such as `exam_result`, as secondary metadata or
  omit them when they do not help the user.
- Use `View details`, `View changes`, and `Close`; avoid ambiguous actions such
  as `Open` or `Manage`.
- Use `No reason recorded` when a reason is genuinely absent. Do not show
  `No reason` without making it clear that this is a recorded absence.
- Use `No changes recorded` only when the event has no field-level diff.

## 4. Table view

Recommended columns are:

- Academic action.
- Sub-module.
- Action.
- Performed by.
- Occurred at.
- Changes.
- Source.
- Impact.
- Actions.

- Keep the event and timestamp near the left for scanability.
- Keep `Actions` on the right and sticky when horizontal scrolling is needed.
- Do not show both a long event title and the same full title again in a second
  column.
- Display actor name and account identifier as primary and secondary text only
  when both are useful.
- Use a compact, consistent timestamp format and expose timezone when the
  audience or data scope requires it.
- Use expandable rows only when the change diff is short enough to remain
  readable in context.

## 5. Change diff presentation

- A diff must identify the field, previous value, and new value.
- Use a compact nested table or two-column comparison:

  | Field | Before | After |
  | --- | --- | --- |
  | Status | Draft | Published |

- Do not represent a missing value as an unexplained blank; use `—` or a
  concise `Not set` label consistently.
- Long values must wrap or open in a read-only detail view.
- Add, changed, and removed values may use the existing semantic treatment,
  but do not color every cell.
- Use `View changes` when a diff exists and `No changes recorded` when it does
  not.
- Expansion must preserve the table column alignment and must not push actions
  off screen unexpectedly.

## 6. Timeline view

- Order events chronologically and state whether the order is newest-first or
  oldest-first.
- Each event must show time, action, actor, affected entity, and a concise
  outcome.
- Use a vertical connector only as a structural aid; do not rely on decorative
  lines or multiple colors to communicate meaning.
- Group events by date only when the date heading improves scanning.
- Keep the same labels and event states as the table view.
- Selecting an event must open the same read-only detail or diff content, not a
  second incompatible presentation.

## 7. Analytics view

- Analytics must answer an audit question such as activity volume, actions by
  module, or changes over time.
- Show the active date range and filters beside the chart or summary.
- Use a restrained palette with one primary series and existing semantic
  colors for warnings or failures.
- Charts require accessible text summaries or a table alternative.
- Do not show a chart merely because the tab exists; provide a clear no-data
  state when there are insufficient records.

## 8. Filters and saved views

- Use dropdowns for module, action, actor, and impact values.
- Use date pickers or date ranges for time filters; do not use ambiguous free
  text for dates.
- Search must apply to the visible audit scope and update counts and pagination
  together.
- `Reset filters` must clear every active filter and restore the default view.
- If saved views are supported, use `Save view` and name the saved scope
  clearly. Do not label an action only `Saved` when it opens saved filters.
- Preserve the selected filters when switching Table, Timeline, and Analytics.
- Make the active scope visible after a user returns from a detail view.

## 9. Impact, reason, and status semantics

- Use neutral styling for ordinary activity and informational changes.
- Use warning yellow only for a real attention-needed or impact condition.
- Use danger red only for failed, blocked, or destructive activity.
- Use success only for confirmed outcomes such as published or completed
  actions; do not color every successful historical event bright green.
- Show impact text when it affects academic records, permissions, publication,
  or downstream workflows.
- Do not imply that an audit record can be undone unless a separate authorized
  workflow exists.

## 10. Loading, empty, and error states

### Loading

- Keep the filter bar and selected scope visible while records load.
- Use a stable table, timeline, or chart skeleton in the active view.
- Disable only actions that conflict with the loading request.

### No activity

- Use contextual copy such as `No academic activity has been recorded yet.`

### Filtered no-results

- Use `No audit entries match the selected filters.`
- Provide `Clear filters` or `Reset filters` when applicable.

### Error

- State whether the activity list, diff, or analytics failed to load.
- Provide a safe retry action without clearing the user's filters.

- Never use generic `Data Not Found` for an audit state.

## 11. Detail surface and permissions

- Open a drawer or detail view when the event needs more context than the row
  can hold.
- Show event title, timestamp, actor, module, source, reason, impact, and full
  diff in a predictable order.
- Keep the surface read-only and make its close action obvious.
- Backdrop click may close a non-loading detail surface; prevent closure while
  a diff or export is loading.
- Follow [sidebars.md](sidebars.md) for scrolling and backdrop behavior.
- Do not place archive, delete, or edit actions on the audit record itself.

## 12. Spacing, borders, and visual restraint

- Use the established spacing tokens, preferably a consistent 8/12/16/24
  rhythm.
- Use subtle row separators and surface contrast instead of high-contrast
  borders around every event.
- Align timestamps, actor metadata, and action controls consistently.
- Avoid extra icons for every audit field. Use an icon only when it adds clear
  meaning, such as expand, filter, or view changes.
- Keep helper text concise and close to the filter or diff it explains.

## 13. Audit log consistency checklist

- [ ] Audit records are clearly read-only and scoped.
- [ ] Event names, module labels, timestamps, and actors use consistent copy.
- [ ] Table, Timeline, and Analytics views preserve scope and filters.
- [ ] Diff content clearly shows field, before, and after values.
- [ ] Reasons, impact, missing values, and no-change states are explicit.
- [ ] Status colors use existing semantic meanings without over-coloring.
- [ ] Empty, filtered, loading, and error states are distinct.
- [ ] Detail surfaces support scrolling, keyboard access, and safe closing.
- [ ] Exports are permission-aware and use clear scope and naming.
