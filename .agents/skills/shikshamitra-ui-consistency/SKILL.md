---
name: shikshamitra-ui-consistency
description: Build or review consistent ShikshaMitra frontend components and workspaces using existing component APIs, surface rules, and inspected reference images. Covers shared controls, feedback, forms, navigation, dashboards, and operational UI. Excludes backend-only work and choosing a new product design system.
---

# ShikshaMitra UI consistency

Build equivalent UI surfaces with the same shared components, page anatomy, action placement,
theme defaults, and state behavior. Tables, row actions, sections, small form dialogs, and form/view drawers are based
on inspected components and the user's Subject Creation, Charges, Concession Policy, Syllabus,
Learning Tasks, Rubric Template, and Delete board confirmation images.
The guides below also map shared controls, feedback, navigation, dashboard, and operational surfaces
to their current source APIs. Local captures are documented in the image inventory, including
their state, source, and visible differences; no screenshot is blanket approval of an entire screen.

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
| Page title, breadcrumbs, filters, tabs, page actions | [page-headers.md](references/page-headers.md) | [Local Subject Creation](assets/local-subject-workspace.jpg) |
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
| CustomUpload attachments: types/size, required/help/validation, progress, preview/remove | [custom-upload.md](references/custom-upload.md) plus the owning form/section guides | [Local empty upload field](assets/local-upload-empty.jpg); populated/progress states unpictured |
| Single date / date-time and validation | [date-pickers.md](references/date-pickers.md) | [Local single-date popup](assets/local-single-date-open.jpg); date-time state unpictured |
| Date-range field, calendar, Apply/Cancel/Reset, validation | [date-range-picker.md](references/date-range-picker.md) | [Closed](assets/page-form-syllabus.png), [open](assets/date-range-picker-open.png) |
| Long form or contextual record drawer, footer, unsaved-change guard | [sections.md](references/sections.md), then [drawers.md](references/drawers.md); form guide for validation | [Form](assets/drawer.png), [view](assets/drawer-view.png) |
| Confirmation, warning, information, success, or error pop-up: shared shell, semantic icon, small buttons, Keep editing / Discard changes | [confirmations.md](references/confirmations.md); use the owning form's close guard | [Delete board](assets/confirmation.png), [dark-phone warning](assets/local-discard-warning-mobile-dark.jpg); info/success/error-feedback states unpictured |
| Read-only record identity, facts, dependencies, restrictions; required header/section info in every shell | [detail-pages.md](references/detail-pages.md), [sections.md](references/sections.md), and the owning dialog/drawer/page guide; follow the Policy-view pattern | [Policy view](assets/drawer-view.png); [missing-info diagnostic](assets/detail-view-missing-info.png); dedicated page image pending |
| Status Label, Chip, badges, saved identity colors | [status-labels.md](references/status-labels.md) | [Local Active labels](assets/local-subject-workspace.jpg) |
| Toasts, inline alerts, request feedback, retry and existing Undo | [feedback.md](references/feedback.md), then [confirmations.md](references/confirmations.md) for decisions | Transient toast/Undo unpictured; do not trigger mutations for images |
| Tooltip/help triggers and interactive contextual popovers | [tooltips-popovers.md](references/tooltips-popovers.md) | [Local header help](assets/local-header-help.jpg), [existing action menu](assets/adaptive-three-dots-actions-open.png) |
| Multiple and grouped selection, chips, overflow | [multi-selects.md](references/multi-selects.md) plus the select/search guide | [Local elective multi-select](assets/local-multiselect-open.jpg) |
| Checkbox, switch, radio group, mixed selection, decision cards | [choice-controls.md](references/choice-controls.md) | [Local calendar switch](assets/local-calendar-form.jpg), [staff radio choices](assets/local-contact-fields.jpg); mixed states unpictured |
| Rich text, toolbar, formatted view, mentions/placeholders | [rich-text-editor.md](references/rich-text-editor.md) | [Local chapter editor](assets/local-editor-toolbar.jpg) |
| Expandable secondary sections and independent header actions | [accordions.md](references/accordions.md) | Dedicated expanded/collapsed reference not yet captured |
| Academic year/board/medium/stage/class/division context | [academic-scope.md](references/academic-scope.md) | [Local global context](assets/local-subject-workspace.jpg), [local scope switch](assets/local-calendar-form.jpg) |
| Phone, country/state/city, postal code, same-address controls | [contact-fields.md](references/contact-fields.md) | [Blank local contact fields](assets/local-contact-fields.jpg) |
| Application shell, sidebar, mobile navigation, durable settings tasks | [navigation-settings.md](references/navigation-settings.md) plus the header/tab guide | [Desktop shell](assets/local-subject-workspace.jpg), [phone navigation](assets/local-navigation-mobile.jpg) |
| Dashboard families, metric cards, widgets, charts, drilldowns | [dashboards-charts.md](references/dashboards-charts.md) | [Local Academic dashboard](assets/local-academic-dashboard.jpg); recorded semantic mismatch, not a status target |
| Notification composer, channel/audience, placeholders, list states | [notifications.md](references/notifications.md) | [Local Academic notifications](assets/local-notifications.jpg); sending unverified |
| Hierarchy/resource tree, expansion versus selection, node actions | [hierarchy-trees.md](references/hierarchy-trees.md) | [Local resources](assets/local-resource-hierarchy.jpg); use only its recorded state |
| Calendars, scheduling/seating, reports/exports, audit, protected file preview | [operational-workspaces.md](references/operational-workspaces.md), then only its matching existing rulebook | [Local calendar](assets/local-calendar-workspace.jpg), [report configuration](assets/local-report-workspace.jpg), [empty attachments](assets/local-upload-empty.jpg) |

For specialized non-form steppers retain [the FE pattern skill](../shikshamitra-fe-patterns/SKILL.md).
For other operational surfaces follow the explicit routes above, which link existing owning
rulebooks. Do not force those workspaces into a CRUD-table or form-dialog layout.

## Authority and existing skills

- Repository security rules and backend contracts govern permissions, scope, and operations.
  A screenshot never authorizes an action or changes a backend contract.
- `DESIGN.md` is the frontend interface contract. The selected surface rulebook supplies its
  specific behavior; this skill records that behavior in a compact implementation guide.
- Keep established surface-specific defaults: ordinary form submissions use `Submit`; lifecycle
  decisions use outcome labels such as `Publish` or `Archive`. Do not substitute a generic button
  example for the form rule. Visible task/section titles use Title Case; field labels, body copy,
  and button actions use sentence case, including `Keep editing`, `Discard changes`, and `Save draft`.
  Preserve entered names/acronyms and explicitly required wording. Historical screenshot casing
  does not override this contract; see [shared copy precedence](references/shared-rules.md#copy-and-rule-precedence).
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
