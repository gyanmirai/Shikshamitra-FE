---
name: shikshamitra-ui-consistency
description: Build, update, or review ShikshaMitra frontend UI using consistent headers, tables, form dialogs, drawers, confirmations, and detail views. Use when implementing these surfaces or checking their visual and interaction consistency; pair the written rules with supplied reference images. Excludes backend-only work and choosing a new product design system.
---

# ShikshaMitra UI consistency

Build equivalent UI surfaces with the same shared components, page anatomy, action placement,
theme defaults, and state behavior. These rules are adapted from the existing frontend pattern
skill and UI rulebooks. Screenshots will be added by the user; written rules are usable now.

Paths beginning with `src/` are relative to the Shikshamitra-FE repository. This is the canonical
skill; the wrapper workspace entry only routes here.

## Before implementation

1. Read the frontend [AGENTS.md](../../../AGENTS.md) and the applicable sections of
   [DESIGN.md](../../../DESIGN.md). Honor explicit user requirements and existing authorization.
2. Identify the affected surfaces using the table below. Read
   [shared rules](references/shared-rules.md) and only the matching pattern guides.
3. Check [image references](references/image-references.md). If a relevant image exists, open
   and visually inspect it; reading its filename or Markdown alone is insufficient. If it is
   pending, continue with written rules and report that image matching remains unverified.
4. Inspect current shared-component props and a comparable screen. Existing code defines
   available APIs, not permission to copy a legacy layout that conflicts with the contract.
5. State briefly which surface, shared components, code reference, and image status apply.
   Record any necessary exception with its reason; do not turn one exception into a global rule.
6. Implement using shared components and theme tokens, then run the applicable checks in
   [shared rules](references/shared-rules.md). Report actual evidence and unresolved blockers.

## Pattern routing

| Surface | Read | Planned image |
| --- | --- | --- |
| Page title, breadcrumbs, filters, tabs, page actions | [page-headers.md](references/page-headers.md) | `assets/page-header.png` |
| Record table, toolbar, row actions, pagination, table states | [tables.md](references/tables.md) plus page headers | `assets/table-workspace.png` |
| Short create/edit form in a centered dialog | [form-dialogs.md](references/form-dialogs.md) | `assets/form-dialog.png` |
| Long form or contextual side panel | [drawers.md](references/drawers.md); also form dialogs for form behavior | `assets/drawer.png` |
| Delete, archive, discard, publish, or required-reason decision | [confirmations.md](references/confirmations.md) | `assets/confirmation.png` |
| Read-only record identity, facts, dependencies, restrictions | [detail-pages.md](references/detail-pages.md); also its header/dialog/drawer guide | `assets/detail-page.png` |

For dashboards, calendars, steppers, scheduling, audit logs, or reports, use the relevant routing
in [the existing FE pattern skill](../shikshamitra-fe-patterns/SKILL.md). Do not force those
workspaces into a CRUD-table or form-dialog layout.

## Authority and existing skills

- Repository security rules and backend contracts govern permissions, scope, and operations.
  A screenshot never authorizes an action or changes a backend contract.
- `DESIGN.md` is the frontend interface contract. The selected surface rulebook supplies its
  specific behavior; this skill records that behavior in a compact implementation guide.
- Keep established surface-specific defaults: ordinary form submissions use `Submit`; lifecycle
  decisions use outcome labels such as `Publish` or `Archive`. Do not substitute a generic button
  example for the form rule. Visible dialog/drawer titles use Title Case.
- If governing documents contain an unresolved contradiction, name the exact conflict. Preserve
  unaffected current behavior and resolve only the affected choice with the user when needed.
- Images illustrate the written contract and provide visual evidence for the depicted state.
  Preserve backend correctness, accessibility, responsive behavior, and omitted states.
- Use [FE implementation patterns](../shikshamitra-fe-patterns/references/implementation-patterns.md)
  for RTK Query, Formik, toast, and common hooks, inspecting current source APIs before reuse.
  Its older `Save` example and incomplete table-height example are superseded by this skill's
  form and table instructions and the corresponding surface rulebooks.
- Antislop supports quality review under the selected session mode. Generic design skills do
  not replace the configured ShikshaMitra palette, typography, components, or module conventions.
  Scope changes such as a redesign or new theme require a user request.

## Adding images later

Use the six filenames in [image references](references/image-references.md). Mark an image as
attached only after the file exists and has been inspected. There are no generated screenshots
or fictional visual targets in this skill.
