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
Salary documents. Local captures below now establish an empty [CustomUpload](custom-upload.md)
field, a single-date popup, header help, and additional component/workspace states.
[Empty and loading states](empty-loading-states.md) reuses Learning Tasks' empty body and
Charges' table skeletons. SearchNotFound, form skeletons, and FormBusyRegion overlays remain unpictured.
[Confirmations](confirmations.md) includes the Delete board image supplied and inspected on
22 October 2026. Its shell also guides warning, information, success, and error pop-ups;
the local dark-phone discard warning below adds a warning-header state. Information, success,
and non-destructive error modals remain unpictured.
Do not render reserved filenames as images until files are supplied and inspected.

| Pattern | Expected file relative to skill folder | Status |
| --- | --- | --- |
| Page header and breadcrumbs | [assets/local-subject-workspace.jpg](../assets/local-subject-workspace.jpg) | Attached and inspected; local Academic header; see capture table below |
| CustomTabs peer workspace | [assets/custom-tabs-learning-tasks.png](../assets/custom-tabs-learning-tasks.png) | Attached and inspected; Learning Tasks, light theme, Homework selected, empty table |
| Shared stepper form | [assets/stepper-form-rubric-template.png](../assets/stepper-form-rubric-template.png) | Attached and inspected; Create Rubric Template, light theme, Basic Information with required errors |
| Populated table workspace | [assets/table-workspace.png](../assets/table-workspace.png) | Attached and inspected; Subject Creation, light theme, 1172 x 648 image |
| Table filters, status tabs, loading | [assets/table-filters-tabs.png](../assets/table-filters-tabs.png) | Attached and inspected; Charges, light theme, 1173 x 646 image |
| Student List missing-column-filter diagnostic | [assets/table-student-list-missing-filters.png](../assets/table-student-list-missing-filters.png) | Attached and inspected; light theme, missing header filter controls; two byte-identical attachments share one asset. A recorded gap, not a compliant target |
| Adaptive row actions, menu closed | [assets/adaptive-three-dots-actions-closed.png](../assets/adaptive-three-dots-actions-closed.png) | Attached and inspected; Concession Policy, light theme, 1171 x 633 image |
| Adaptive row actions, menu open | [assets/adaptive-three-dots-actions-open.png](../assets/adaptive-three-dots-actions-open.png) | Attached and inspected; Concession Policy, light theme, 1157 x 656 image |
| Small form CustomDialog | [assets/form-dialog.png](../assets/form-dialog.png) | Attached and inspected; Add Subject, light theme, browser chrome included |
| Form drawer and sections | [assets/drawer.png](../assets/drawer.png) | Attached and inspected; Create Concession Policy, light theme, 1535 x 770 image including browser chrome |
| View drawer and corresponding sections | [assets/drawer-view.png](../assets/drawer-view.png) | Attached and inspected; saved Concession Policy details, light theme, 1535 x 757 image including browser chrome |
| Fee detail view missing-info diagnostic | [assets/detail-view-missing-info.png](../assets/detail-view-missing-info.png) | Attached and inspected; light-theme dialog lacks header and section info controls. Recorded gap; use Policy view for the required anatomy |
| Page form and closed range field | [assets/page-form-syllabus.png](../assets/page-form-syllabus.png) | Attached and inspected; Syllabus, light theme, 1157 x 646 image |
| Open date-range calendar | [assets/date-range-picker-open.png](../assets/date-range-picker-open.png) | Attached and inspected; Syllabus, light theme, 1147 x 637 image; two identical attachments share this asset |
| Single-date popup | [assets/local-single-date-open.jpg](../assets/local-single-date-open.jpg) | Attached and inspected; local Calendar Management, selected 22 October 2026; date-time state unpictured |
| Open searchable dropdown | [assets/searchable-dropdown-open.png](../assets/searchable-dropdown-open.png) | Attached and inspected; Salary documents, light theme, 562 x 626 image, Staff member focused and list open |
| CustomUpload document field | [assets/local-upload-empty.jpg](../assets/local-upload-empty.jpg) | Attached and inspected; local Syllabus complete idle empty field; progress/populated/rejected states unpictured |
| Confirmation and semantic feedback shell | [assets/confirmation.png](../assets/confirmation.png), [local discard warning](../assets/local-discard-warning-mobile-dark.jpg) | Attached and inspected; light deletion and dark-phone warning; info/success/reason states unpictured |
| Dedicated read-only detail page | `assets/detail-page.png` | Pending attachment; drawer reference above does not establish a standalone page layout |

## Local app captures: 22 October 2026

All files below are actual screenshots of the existing app at `http://localhost:3000` in the
Codex in-app browser, captured and visually inspected on 22 October 2026. They are unannotated
JPEG files preserved in their returned format. The dashboard, header-help, and elective images
used automatic browser sizing (image dimensions shown); other desktop captures used a 1440 x 900 CSS viewport,
and phone captures used 390 x 844. Browser zoom/OS scale were not independently measured.
Theme and viewport overrides were restored after capture. These are local working-tree states,
not evidence of a deployed release or one pinned clean commit.

Each image is evidence only for its stated region and state. Record values, counts, default
dates, option names, older casing, and incomplete accessibility wiring are not new UI requirements.
Live code is the component API reference; written rules remain the intended presentation contract.

| Asset | Screen / source reference | Depicted state and permitted use |
| --- | --- | --- |
| [local-academic-dashboard.jpg](../assets/local-academic-dashboard.jpg), 1280 x 720 | `/academic/dashboard`; [dashboard entry](../../../../src/screens/academic/academic-dashboard.tsx) | Light, loaded Academic module cards/scope/empty priority region. Zero Academic Health with a Healthy label is a recorded semantic mismatch; use composition only |
| [local-header-help.jpg](../assets/local-header-help.jpg), 1280 x 720 | `/academic/dashboard`; [CustomBreadcrumbs](../../../../src/components/custom-breadcrumbs/custom-breadcrumbs.tsx) | Light, page-description tooltip open beside its title. Not proof of interactive popover behavior |
| [local-multiselect-open.jpg](../assets/local-multiselect-open.jpg), 1280 x 720 | `/academic/curriculumSetting/electiveGroupCreation`; [subject selection](../../../../src/screens/academic/curriculum-management/setting/electiveSubjectSetting/components/ElectiveGroupSubjectSelection.tsx) | Light, unsaved Add Elective Group, English selected, checkbox list open. Literal required star and Save Group wording are existing differences; do not copy as universal rules |
| [local-subject-workspace.jpg](../assets/local-subject-workspace.jpg), 1440 x 900 | `/academic/curriculumSetting/subjectCreation`; [Subject Creation](../../../../src/screens/academic/curriculum-management/setting/subjectCreation/index.tsx) | Light, populated table, Active labels, saved subject identity colors, expanded navigation/header, two direct row actions and overflow. Refreshed against the current local UI; screenshot labels/counts are not fixed requirements |
| [local-report-workspace.jpg](../assets/local-report-workspace.jpg), 1440 x 900 | `/academic/curriculumReports`; [CommonReport](../../../../src/components/common-report/index.tsx) | Light, Chapter Progress Report chosen, configuration/prerequisite controls visible, no generation. Three-region desktop composition; not mobile or export-completion evidence |
| [local-editor-toolbar.jpg](../assets/local-editor-toolbar.jpg), 1440 x 900 | `/academic/courseSubjects`, new Chapter > Add details; [Editor](../../../../src/components/editor/editor.tsx) | Light, scrolled additional-details drawer, empty rich-text field, toolbar and focused control. Legacy numbered headings/footer are not the shared title/action convention |
| [local-upload-empty.jpg](../assets/local-upload-empty.jpg), 1440 x 900 | `/academic/courseSubjects`, new Chapter; [ChapterAttachmentsSection](../../../../src/screens/academic/course-management/syllabusManagement/components/ChapterAttachmentsSection.tsx) | Light, empty directory-default upload field and adjacent empty attachment list. No file selected/uploaded; two-panel layout is specific to this chapter workflow |
| [local-calendar-workspace.jpg](../assets/local-calendar-workspace.jpg), 1440 x 900 | `/academic/calendarManagement?tab=monthView`; [AcademicCalendarView](../../../../src/screens/academic/academic-calendar-management/calendarManagement/components/AcademicCalendarView.tsx) | Light, October month grid, global/local context, view controls, existing events. No event move, publish, or calendar change |
| [local-calendar-form.jpg](../assets/local-calendar-form.jpg), 1440 x 900 | Same calendar route, open 22 October marker; [CalendarDayScopeSection](../../../../src/screens/academic/academic-calendar-management/calendarManagement/components/CalendarDayScopeSection.tsx) | Light, unsaved blank marker, single date field and on-state scope switch. Older section casing/Add Day label are not shared defaults; class/division menu states unpictured |
| [local-single-date-open.jpg](../assets/local-single-date-open.jpg), 1440 x 900 | Same unsaved marker; [CalendarDayDateFields](../../../../src/screens/academic/academic-calendar-management/calendarManagement/components/CalendarDayDateFields.tsx) | Light, AcademicDatePicker open, October 2026 and selected 22. Not a date range, time picker, invalid-input, or blocked-day reference |
| [local-resource-hierarchy.jpg](../assets/local-resource-hierarchy.jpg), 1440 x 900 | `/academic/learningResources`; [HierarchyTree](../../../../src/screens/academic/course-management/learningResources/components/treeStrcutre.tsx) | Light, no resources available, tree empty and detail pane unselected. Empty two-region workspace only; populated/expanded nodes remain unverified |
| [local-notifications.jpg](../assets/local-notifications.jpg), 1440 x 900 | `/academic/notification?tab=curriculumManagement`; [AcademicNotification](../../../../src/screens/academic/AcademicNotification/index.tsx) | Light, Curriculum notification-configuration table, role audience and off switches. Existing switch names/casing are not accessibility approval; nothing toggled or sent |
| [local-contact-fields.jpg](../assets/local-contact-fields.jpg), 1440 x 900 | `/hr/employee?employee=&mode=form`; [InformationFields](../../../../src/screens/hr/employee/employee-form-fields/InformationFields.tsx) | Light, blank new-staff personal/contact section, +91 inputs and radio choices. No personal/contact/identity values entered; legacy headings/requiredness are feature context, not a universal form schema |
| [local-address-fields.jpg](../assets/local-address-fields.jpg), 1440 x 900 | Same blank staff form; [InformationFields](../../../../src/screens/hr/employee/employee-form-fields/InformationFields.tsx) | Light, scrolled blank address with India selected, empty state/city/postal fields. Actual disabled/required behavior still needs implementation checks; no address was entered |
| [local-subject-mobile.jpg](../assets/local-subject-mobile.jpg), 390 x 844 | `/academic/curriculumSetting/subjectCreation` | Light, narrow header/actions and horizontally scrolled table. Diagnostic: breadcrumb text is clipped; do not treat this as a passing mobile-header reference |
| [local-navigation-mobile.jpg](../assets/local-navigation-mobile.jpg), 390 x 844 | Same Subject route; existing Academic module navigation | Light, open mobile module drawer, expanded Curriculum/Settings, active Subjects Creation. Demonstrates navigation hierarchy/open state; not every keyboard/dismissal path |
| [local-subject-mobile-dark.jpg](../assets/local-subject-mobile-dark.jpg), 390 x 844 | Same Subject route | Dark, normal label/button/table surface at phone width. Same clipped-breadcrumb diagnostic and horizontal table position as the light capture; not complete responsive acceptance |
| [local-form-mobile-dark.jpg](../assets/local-form-mobile-dark.jpg), 390 x 844 | Same Subject route, Add Subject; [Subject form](../../../../src/screens/academic/curriculum-management/setting/subjectCreation/subjectForm.tsx) | Dark, blank compact form, required fields/help, saved-color choices, scroll body and Cancel/Submit. Demonstrates this state only, not validation/busy behavior |
| [local-discard-warning-mobile-dark.jpg](../assets/local-discard-warning-mobile-dark.jpg), 390 x 844 | Same temporary Subject draft; [ConfirmDialog](../../../../src/components/confirm-dialog/confirm-dialog.tsx) | Dark, warning icon, draft consequence, safe/outcome actions above the mounted form. Reference preview was temporary text and was discarded. Existing Title Case button labels differ from the corrected sentence-case guide |

### Remaining visual limits

- No transient toast/Undo, info/success/non-destructive error modal, grouped multi-select/overflow,
  indeterminate checkbox, dedicated accordion expanded/collapsed pair, or populated tree was captured.
- A full standalone saved-detail page, scheduling interactions, report job lifecycle/download,
  audit diff/history, and authenticated file-preview success need their own authorized data/state.
- Current references do not prove loading/disabled/error behavior for every component or contrast,
  focus trapping/return, keyboard navigation, touch operation, and all responsive breakpoints.
- Capture existing permitted states when available. Do not create school records, change permissions,
  generate reports, upload personal files, or send notifications solely to manufacture an image.

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
