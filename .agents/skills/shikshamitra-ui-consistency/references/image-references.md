# Reference images

The supplied images below were inspected on 16 October 2026: two table references in
[the table guide](tables.md) and two row-action references in
[the adaptive action guide](adaptive-three-dots-actions.md), plus form/view drawers shared by
[the section guide](sections.md) and [the drawer guide](drawers.md), and a small form in
[the CustomDialog guide](form-dialogs.md), plus a Syllabus page form and open range calendar in
[page forms](page-forms.md) and [date ranges](date-range-picker.md). The two supplied open-calendar
attachments are byte-identical and share one asset. Other filenames remain
reserved slots. [CustomTabs](custom-tabs.md) also has the Learning Tasks workspace reference.
[Stepper forms](stepper-forms.md) has the Rubric Template page/validation reference.
[Button family](button-family.md) reuses the drawer, dialog, and Syllabus page footer references;
loading/disabled states are not pictured and remain visually Unverified.
[NumericFormatCustom](numeric-format-custom.md) reuses the drawer's percentage field context;
amount/count modes and numeric validation states are not established by that image.
[Searchable dropdowns](searchable-dropdowns.md) now includes the open Staff member list from
Salary documents. [CustomUpload](custom-upload.md) has no complete upload-field image yet.
[Empty and loading states](empty-loading-states.md) reuses Learning Tasks' empty body and
Charges' table skeletons. SearchNotFound, form skeletons, and FormBusyRegion overlays remain unpictured.
Do not render reserved filenames as images until files are supplied and inspected.

| Pattern | Expected file relative to skill folder | Status |
| --- | --- | --- |
| Page header and breadcrumbs | `assets/page-header.png` | Pending attachment |
| CustomTabs peer workspace | [assets/custom-tabs-learning-tasks.png](../assets/custom-tabs-learning-tasks.png) | Attached and inspected; Learning Tasks, light theme, Homework selected, empty table |
| Shared stepper form | [assets/stepper-form-rubric-template.png](../assets/stepper-form-rubric-template.png) | Attached and inspected; Create Rubric Template, light theme, Basic Information with required errors |
| Populated table workspace | [assets/table-workspace.png](../assets/table-workspace.png) | Attached and inspected; Subject Creation, light theme, 1172 x 648 image |
| Table filters, status tabs, loading | [assets/table-filters-tabs.png](../assets/table-filters-tabs.png) | Attached and inspected; Charges, light theme, 1173 x 646 image |
| Adaptive row actions, menu closed | [assets/adaptive-three-dots-actions-closed.png](../assets/adaptive-three-dots-actions-closed.png) | Attached and inspected; Concession Policy, light theme, 1171 x 633 image |
| Adaptive row actions, menu open | [assets/adaptive-three-dots-actions-open.png](../assets/adaptive-three-dots-actions-open.png) | Attached and inspected; Concession Policy, light theme, 1157 x 656 image |
| Small form CustomDialog | [assets/form-dialog.png](../assets/form-dialog.png) | Attached and inspected; Add Subject, light theme, browser chrome included |
| Form drawer and sections | [assets/drawer.png](../assets/drawer.png) | Attached and inspected; Create Concession Policy, light theme, 1535 x 770 image including browser chrome |
| View drawer and corresponding sections | [assets/drawer-view.png](../assets/drawer-view.png) | Attached and inspected; saved Concession Policy details, light theme, 1535 x 757 image including browser chrome |
| Page form and closed range field | [assets/page-form-syllabus.png](../assets/page-form-syllabus.png) | Attached and inspected; Syllabus, light theme, 1157 x 646 image |
| Open date-range calendar | [assets/date-range-picker-open.png](../assets/date-range-picker-open.png) | Attached and inspected; Syllabus, light theme, 1147 x 637 image; two identical attachments share this asset |
| Single-date popup | No asset yet | Pending; the range calendar is not single-date evidence |
| Open searchable dropdown | [assets/searchable-dropdown-open.png](../assets/searchable-dropdown-open.png) | Attached and inspected; Salary documents, light theme, 562 x 626 image, Staff member focused and list open |
| CustomUpload document field | No asset yet | Unverified; existing page image shows attachment-section context only |
| Confirmation or reason request | `assets/confirmation.png` | Pending attachment |
| Dedicated read-only detail page | `assets/detail-page.png` | Pending attachment; drawer reference above does not establish a standalone page layout |

## Attach and document an image

1. Place the supplied image in `assets/` using its reserved filename. If the image is JPEG/WebP,
   preserve its actual format and update the filename here, the main router, and its pattern guide.
   Do not rename a JPEG file to `.png` without converting it.
2. Open and inspect the image before marking it attached. Identify the depicted pattern and shell;
   ask only if an ambiguous screenshot cannot be matched to a pattern from its content/context.
3. In the matching guide replace its pending-image paragraph with an actual relative Markdown
   image embed, as the table guide does with `![Table reference](../assets/table-workspace.png)`.
4. Document the source screen/route or component when known, module family, viewport when known,
   light/dark theme, state, and user-specified details to preserve. Mark unknown metadata as unknown.
5. Map numbered markers, if present, to title, section, field, action, and scroll-region rules.
   If the image has no markers, describe those parts in text without claiming it was annotated.
6. Check the image against the written rules. Record any mismatch and its location rather than
   silently copying a stale defect or changing a rule. A user-requested exception is scoped to
   the affected pattern; conflicting security/backend requirements remain governing.
7. Mark the table row Attached only after the file and guide metadata agree. Keep pending rows
   explicit. Remove identifying record values before committing screenshots when necessary.

## Use during implementation

- Inspect attached images with the available image-viewing tool, rather than inferring their
  contents from filenames. Read the written guide alongside the image.
- Compare hierarchy, placement, density, spacing, and semantic treatment using the theme and
  component contract. Do not hardcode pixel guesses, screenshot text, record data, or colors.
- Validate states, themes, and viewports absent from the screenshot independently. Missing images
  do not block rule-based implementation; report visual matching as Unverified until evidence exists.
