---
name: shikshamitra-ui-consistency
description: Build, update, or review ShikshaMitra frontend UI using consistent tables, sections, page/stepper forms, dialogs, drawers, selects/searchable dropdowns, date/range pickers, confirmations, and detail views. Pair component rules with supplied reference images. Excludes backend-only work and choosing a new product design system.
---

# ShikshaMitra UI consistency

Build equivalent UI surfaces with the same shared components, page anatomy, action placement,
theme defaults, and state behavior. Tables, row actions, sections, small form dialogs, and form/view drawers are based
on inspected components and the user's Subject Creation, Charges, Concession Policy, Syllabus,
Learning Tasks, and Rubric Template images.
Other surfaces retain their current written guides until their component references are reviewed.

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

| Surface | Read | Reference image / pending slot |
| --- | --- | --- |
| Shared Submit/Cancel/Close and other buttons: sizes, spacing, icons, loading/disabled states | [button-family.md](references/button-family.md) plus the owning shell guide | Existing [drawer](assets/drawer.png), [dialog](assets/form-dialog.png), [page](assets/page-form-syllabus.png) footers; loading/disabled unpictured |
| EmptyContent, SearchNotFound, skeletons, refresh/error states, FormBusyRegion | [empty-loading-states.md](references/empty-loading-states.md) plus the owning table/form guide | [Empty Learning Tasks](assets/custom-tabs-learning-tasks.png), [Charges skeletons](assets/table-filters-tabs.png); busy overlay unpictured |
| Page title, breadcrumbs, filters, tabs, page actions | [page-headers.md](references/page-headers.md) | `assets/page-header.png` |
| CustomTabs peer panels, icon tabs, selected state, tab-row actions, URL/dirty navigation | [custom-tabs.md](references/custom-tabs.md) | [Learning Tasks](assets/custom-tabs-learning-tasks.png) |
| Record table, toolbar, row actions, pagination, table states | [tables.md](references/tables.md), including spacing, buttons, filters/tabs, and component relationships | [Populated](assets/table-workspace.png), [filters/tabs/loading](assets/table-filters-tabs.png) |
| Adaptive row actions, two direct icons, three-dots overflow, disabled menu entries | [adaptive-three-dots-actions.md](references/adaptive-three-dots-actions.md) plus the host table guide | [Closed](assets/adaptive-three-dots-actions-closed.png), [open](assets/adaptive-three-dots-actions-open.png) |
| Short create/edit form in a centered CustomDialog, header info, footer, dirty-close popup | [form-dialogs.md](references/form-dialogs.md) and section guide | [Add Subject](assets/form-dialog.png) |
| Section cards, headings/help, required fields with ShakingTextField, form/view typography | [sections.md](references/sections.md), including the required-field wrapper rule | [Form](assets/drawer.png), [view](assets/drawer-view.png) |
| Page form or its corresponding view sections | [page-forms.md](references/page-forms.md) and sections | [Syllabus](assets/page-form-syllabus.png) |
| Ordered stepper form on a page or in a drawer; validation/navigation/save/preview | [stepper-forms.md](references/stepper-forms.md) and the matching shell/section guides | [Rubric Template](assets/stepper-form-rubric-template.png) |
| CustomSelect labels, required/help, options, and validation | [custom-select.md](references/custom-select.md) | [Closed field context](assets/drawer.png) |
| NumericFormatCustom amounts/percentages/counts, labels/help/validation, formatNumber display | [numeric-format-custom.md](references/numeric-format-custom.md) | [Percentage field context](assets/drawer.png); other modes/states unpictured |
| Searchable local or remote dropdown | [searchable-dropdowns.md](references/searchable-dropdowns.md) plus CustomSelect | [Open Staff member list](assets/searchable-dropdown-open.png) |
| CustomUpload attachments: types/size, required/help/validation, progress, preview/remove | [custom-upload.md](references/custom-upload.md) plus the owning form/section guides | No complete upload-field reference supplied |
| Single date / date-time and validation | [date-pickers.md](references/date-pickers.md) | Single-date reference pending; range below is distinct |
| Date-range field, calendar, Apply/Cancel/Reset, validation | [date-range-picker.md](references/date-range-picker.md) | [Closed](assets/page-form-syllabus.png), [open](assets/date-range-picker-open.png) |
| Long form or contextual record drawer, footer, unsaved-change guard | [sections.md](references/sections.md), then [drawers.md](references/drawers.md); form guide for validation | [Form](assets/drawer.png), [view](assets/drawer-view.png) |
| Confirmation pop-up: title/icons/spacing, small buttons, Keep Editing / Discard Changes | [confirmations.md](references/confirmations.md); use the owning form's close guard | `assets/confirmation.png` (pending) |
| Read-only record identity, facts, dependencies, restrictions; required header/section info in every shell | [detail-pages.md](references/detail-pages.md), [sections.md](references/sections.md), and the owning dialog/drawer/page guide; follow the Policy-view pattern | [Policy view](assets/drawer-view.png); [missing-info diagnostic](assets/detail-view-missing-info.png); dedicated page image pending |

For dashboards, calendars, specialized non-form steppers, scheduling, audit logs, or reports, use the relevant routing
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

Use [image references](references/image-references.md) to find attached assets and pending slots.
Store additional supplied images in `assets/` and link them from the relevant component guide.
Mark an image attached only after the file exists and has been inspected. Use the table guide's
source/relationship links as the model when reviewing the next common component.
