---
name: shikshamitra-fe-patterns
description: Build or update ShikshaMitra frontend screens using the project's established components and UI rulebooks. Use for FE pages, tables, forms, dialogs, drawers, detail views, steppers, calendars, scheduling, reports, exports, or audit views; do not use for backend-only work.
---

# ShikshaMitra frontend patterns

Use the existing ShikshaMitra components and the relevant UI rulebooks when creating, updating,
or reviewing a frontend screen. Do not load every reference: select only the rulebooks needed for
the current surface.

## Workflow

1. Read the closest `AGENTS.md` and the applicable section of `DESIGN.md`.
2. Identify the surfaces affected by the task and read the matching references below.
3. Inspect a comparable live screen and the current shared-component API before editing. Live code
   is the source of truth for available props, types, and paths; the rulebooks define the intended
   interaction and presentation behavior.
4. Reuse or extend an existing shared component before creating a local primitive or introducing
   another library.
5. Preserve permissions, loading, empty, filtered-empty, error, disabled, success, responsive, and
   accessibility behavior required by the selected rulebooks.
6. Run focused type, lint, unit, and browser validation appropriate to the changed surface. When UI
   behavior is changed, finish with the in-app browser smoke test required by `AGENTS.md`.

If a reference conflicts with a user requirement, follow the user requirement. If it conflicts with
the repository's security rules, backend contract, or an existing shared-component API, do not
invent behavior: preserve the governing contract and report the conflict.

## Reference routing

| Surface or task                                                                                           | Read                                                                                                  |
| --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Any implementation using shared FE components, Formik, RTK Query, toast, or common hooks                  | [implementation-patterns.md](references/implementation-patterns.md)                                   |
| Page title, breadcrumb, summary metrics, filters, tabs, or page-level actions                             | [page-headers.md](references/page-headers.md)                                                         |
| Record table, toolbar, search, filters, columns, row actions, sticky columns, pagination, or table states | [tables.md](references/tables.md)                                                                     |
| Create, edit, configure, or update form                                                                   | [forms.md](references/forms.md)                                                                       |
| Data-entry dialog or drawer with repeating fields or a long scrollable form                              | [forms.md](references/forms.md) and [complex-dialogs.md](references/complex-dialogs.md)                |
| Confirmation, warning, reason request, destructive decision, or short feedback dialog                     | [popups.md](references/popups.md)                                                                     |
| Drawer, sidebar, or side panel                                                                            | [sidebars.md](references/sidebars.md)                                                                 |
| Read-only record view or dependency/status summary                                                        | [detail-views.md](references/detail-views.md)                                                         |
| Multi-stage guided workflow                                                                               | [steppers.md](references/steppers.md)                                                                 |
| Steps displayed across the top of a workspace                                                             | [horizontal-steppers.md](references/horizontal-steppers.md) and [steppers.md](references/steppers.md) |
| Calendar region, academic calendar, or date/event workspace                                               | [calendars.md](references/calendars.md)                                                               |
| Timetable, availability, substitution, seating, or other planning workspace                               | [scheduling-workspaces.md](references/scheduling-workspaces.md)                                       |
| Report generation, export job, download, retry, expiry, or generated-file list                            | [reports-and-exports.md](references/reports-and-exports.md)                                           |
| Audit history, activity, timeline, change diff, or audit analytics                                        | [audit-logs.md](references/audit-logs.md)                                                             |

Read cross-referenced rulebooks only when that related surface is actually part of the task. For
example, a table page normally requires `page-headers.md`, `tables.md`, and
`implementation-patterns.md`; it does not automatically require calendar or stepper guidance.

## Core implementation rules

- Use `CustomBreadcrumbs` for the established page header and breadcrumb pattern.
- Use `CustomizableTable` for record tables; do not hand-roll a MUI table when it satisfies the
  requirement.
- Use `CustomDialog` and `DialogScrollContent` for dialog forms, and `ConfirmDialog` for focused
  confirmations.
- Use Formik and Yup for new forms unless the existing owning feature has a more specific current
  pattern that must be preserved.
- Use `shikshaMitraToast` rather than calling a third-party toast API directly.
- Use the shared `api` plus the owning module's RTK Query injection pattern; do not create another
  base API for the same backend.
- Use theme tokens instead of hardcoded colors and preserve keyboard, focus, and responsive
  behavior described in the selected rulebooks.
- Follow the standard form-drawer defaults in [forms.md](references/forms.md): section help
  tooltips, a focused form body, a neutral `Submit` action, and no submit shortcut. Put optional
  drawer context in an info tooltip after the status badge, as described in
  [sidebars.md](references/sidebars.md).
