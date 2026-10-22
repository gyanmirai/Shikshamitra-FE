# Subjects Creation test data and execution guide

All data below is synthetic.
Use an isolated QA school and medium; do not use real student, guardian, or staff records.

## Readiness and shared prerequisites

- Record the QA URL, frontend/backend build identifiers, browser/version, date, tenant, academic year, board, medium, role, theme, and viewport.
- Use a dedicated school named QA Sunrise School, academic year 2026-2027, with English and Marathi media where the configured scope allows them.
  These are fixture requirements, not claims that such records already exist.
- Use supported setup screens or existing approved fixture provisioning.
  Missing accounts, media, dependency records, or failure-simulation access block the affected cases; do not invent a pass.
- Default role: SC-Manager. Default context: QA Sunrise School / 2026-2027 / English.
- Start at /academic/curriculumSetting/subjectCreation with no open dialog, table search cleared, default columns restored, and known filters.
- Use a run token such as 20261021R01 and keep a ledger of every subject ID, actual saved name, medium, and cleanup outcome.
- Default result for every new ID: **Not run**. Use Passed, Failed, Blocked, Not run, or Skipped with a reason.
- Run mutation cases independently or serially with fresh fixtures. Restore baseline fixtures after each case.

## Accounts and permission profiles

Permission prefix: Academics.CurriculumManagement.Settings.SubjectCreation.
Use separately provisioned accounts; do not change production roles to prepare these tests.

| Profile | Effective grants / purpose |
| --- | --- |
| SC-Manager | View + Add + Delete, appropriate module visibility and academic scope |
| SC-Reader | View only; no Add or Delete |
| SC-Editor | View + Add; no Delete |
| SC-Deleter | View + Delete; no Add |
| SC-Denied | No subject View/Add/Delete; direct-route denial check |
| SC-AddOnly | Add without View; isolated permission-combination probe, not an assumed supported user journey |
| SC-OtherSchool | Equivalent account in a second isolated tenant, only for browser-visible tenant separation |

Current UI uses Add for create, bulk import, edit, archive, and restore; do not invent a separate Edit or Archive permission.
Duplicate preflight requires View on the server, so Add-only behavior needs explicit observation.
Menu visibility, direct-route access, and action permissions are different checks.
Browser evidence cannot prove server-side enforcement.

## Fixture registry

| Fixture | Starting record / preparation | Use |
| --- | --- | --- |
| D01 new subject | Subject Name E2E 20261021R01 Astronomy; Category Scholastic; Dark blue (#0D47A1); optional fields empty | Minimal valid create |
| D02 full subject | E2E 20261021R01 Computer Studies; Display Name Computing; Category Scholastic; Dark blue; Icon Monitor; Description Computer literacy for the QA school, followed by run marker | All visible fields |
| D03 duplicates | Same-medium Mathematics with Display Name Maths; Science; Computer Science; each has a recorded ID | Exact name, alias, display-name, and similar matches |
| D04 used subject | QA Mathematics Used, active; allocations in Classes 6 and 7; one mapped elective group; record all additional chapter/timetable/exam/homework/teacher dependencies if prepared | Usage, summary, archive, deletion restriction |
| D05 disposable unused | Fresh run-marked subject; no dependencies; response/UI confirms deletable | Delete success |
| D06 archived | Fresh run-marked subject archived through UI; ledger retains its ID | Restore and action restrictions |
| D07 scope pair | Two media with clearly different run-marked subjects; optionally a second isolated school with different subject labels | Context and tenant separation |
| D08 table set | At least 25 synthetic subjects, mixed categories, varied usage counts, and imported Active/Inactive/Archived statuses | Paging, filters, sorting, export |
| D09 import set | CSV/XLSX using the current template, unique names not in the selected medium; exact names and categories listed below | Import preview and save |

Names in the fixture registry are user inputs, not immutable display strings.
The single form title-cases each space-separated word, so D01 becomes E2e 20261021r01 Astronomy.
Record the actual value shown before saving and use that value for search, assertions, and cleanup.
Bulk import trims text but does not apply that single-form casing transformation.

For fixed D03 alias names, use a disposable, isolated QA medium and record a description marker.
Do not add a prefix to Mathematics or Maths: that would change the alias-normalization test.
Do not delete an unrelated pre-existing subject just to make a fixture available.

### Safe run markers and cleanup

The name schema rejects hyphens, so do not put the literal e2e- marker into Subject Name.
Put e2e-20261021R01-worker1 in Description, and use an alphanumeric E2E/run-token name when possible.
Record ID + tenant + medium before cleanup; a name prefix alone is insufficient.

Delete only run-owned, unused, deletable fixtures through supported UI.
Restore archived fixtures if needed before approved deletion; never delete used school records or remove history to force cleanup.
For dependency fixtures, restore their baseline state or retain them with a documented reset owner.
Remove downloaded files and browser network overrides after the run.
Never commit credentials, auth state, raw HAR/token data, or generated screenshots.

## Visible field contract

| Field | Current control and rule | Expected test oracle |
| --- | --- | --- |
| Subject Name * | Required; trimmed length 2-100; ASCII letters/digits/whitespace; maxLength 100; single form title-cases words | A, empty, and whitespace-only are invalid; PE is valid but becomes Pe; punctuation/non-ASCII are rejected by current schema |
| Display Name | Optional; trimmed max 50; ASCII letters/digits/whitespace; maxLength 50 | Empty uses subject-name fallback in table; input is not title-cased by the subject hook |
| Subject Category * | General default; General, Language, Scholastic, Co-Scholastic, Activity, Practical | Select each actual option; no custom category input is exposed |
| Subject Icon | Optional; None, Book, Calculator, Flask, Monitor, Music, Trophy, Palette | Table uses selected icon; without icon, avatar uses first two name characters |
| Subject Color * | Required fixed swatch selection | No preselected value on a new record; Dark blue is #0D47A1 |
| Description | Optional multiline text, trimmed max 500; maxLength 500 | Preserve text/newlines safely; empty stores no meaningful description |
| Status | No editable field in single create/edit dialog | New single-form record defaults Active; imported or edited existing status must not silently reset |
| Sort Order | Commented-out single-form field; bulk column is supported | Test numeric boundaries through import only: optional integer 1-999999 |

Important validation messages include Subject name must be at least 2 characters, Subject name cannot exceed 100 characters, Subject Name is required, Please enter a valid subject name using letters and numbers, Subject color is required, Display name cannot exceed 50 characters, and Description cannot exceed 500 characters.
Browser maxLength may prevent an over-limit value before schema validation.
For an empty name multiple constraints can apply; capture the actual visible message and require a clear associated error rather than inventing its ordering.

Unicode and punctuation rejections describe current validation.
If a school needs names such as गणित, मराठी, or Art & Craft, log a product requirement decision; do not silently broaden the expected input contract.
Language typing controls do not establish that every field accepts the resulting script.

## Import contract and examples

Accepted extensions: .csv and .xlsx, case-insensitive.
Legacy .xls is not accepted even though an Excel MIME value exists in the allowed MIME list.
Limit: 5,242,880 bytes (5 MiB, shown as 5 MB in the UI); at most 200 nonblank data rows.

Columns in the downloaded template, in order:

Subject Name*, Display Name, Category*, Color*, Icon, Status*, Sort Order, Description.

Required headers: Subject Name, Category, Color, Status.
Header matching trims outer whitespace, ignores case, and removes a trailing asterisk.
Supported columns can be reordered; optional columns may be omitted.
Only the first worksheet is read.

| Subject Name* | Display Name | Category* | Color* | Icon | Status* | Sort Order | Description |
| --- | --- | --- | --- | --- | --- | --- | --- |
| E2E 20261021R01 Robotics | Robotics | Practical | #0D47A1 | monitor | Active | 1 | QA robotics launch; e2e-20261021R01-worker1 |
| E2E 20261021R01 Choir | Choir | Activity | #8E24AA | music | Inactive | 2 | QA choir not offered this term; e2e-20261021R01-worker1 |
| E2E 20261021R01 Heritage | Heritage | Co-Scholastic | #795548 | book | Archived | 3 | QA retired programme; e2e-20261021R01-worker1 |

Remove or replace the template Mathematics example before importing if Mathematics already exists.
Row validation flags exact case-insensitive names in the file and fetched existing names.
Do not assume bulk import runs the single-form similar-name dialog or alias normalization.
Correct errors in the original file and upload again; the preview is not an editable grid.

## Execution and evidence

For each case record: ID, status, build, tester, role, tenant/medium, viewport/theme, actual result, fixture IDs, timestamp, evidence location, defect link, and cleanup.
For UI checks also record Consistent, Inconsistent, or Unverified.
A Not run case has no consistency verdict yet.

Save evidence under an ignored test-results/qa/<run-id>/ location after confirming ignore behavior.
Capture only synthetic records and redact credentials/tokens.
Browser network tools may observe the requests initiated by UI actions; direct API tests and database queries are outside this suite.
For network fault cases, use approved QA-only browser throttling/offline/blocking and remove overrides afterward.
If a safe fault cannot be induced, mark Blocked rather than editing application code.

Prioritize P0 and P1 cases, then UI/accessibility, boundaries, and full journeys.
Complete automated checks before the eventual final browser smoke in the Codex in-app browser.
No browser execution or sign-off has occurred during this authoring task.

## Source and rule index

| Key | Source of truth |
| --- | --- |
| S1 screen/lifecycle | [Subject Creation screen](<../../../../../../../src/screens/academic/curriculum-management/setting/subjectCreation/index.tsx>); [close hook](<../../../../../../../src/screens/academic/curriculum-management/setting/subjectCreation/hooks/useSubjectCreation.ts>) |
| S2 form/save/duplicates | [form](<../../../../../../../src/screens/academic/curriculum-management/setting/subjectCreation/subjectForm.tsx>); [save hook](<../../../../../../../src/screens/academic/curriculum-management/setting/subjectCreation/hooks/useSubjectForm.ts>); [schema](<../../../../../../../src/screens/academic/curriculum-management/setting/subjectCreation/validationSchema.ts>); [defaults](<../../../../../../../src/screens/academic/curriculum-management/setting/subjectCreation/initialValues.ts>) |
| S3 fields | [identity](<../../../../../../../src/screens/academic/curriculum-management/setting/subjectCreation/components/SubjectIdentityFields.tsx>); [configuration](<../../../../../../../src/screens/academic/curriculum-management/setting/subjectCreation/components/SubjectConfigurationFields.tsx>); [categories/icons](<../../../../../../../src/screens/academic/curriculum-management/setting/subjectCreation/type.tsx>); [color picker](<../../../../../../../src/components/static-color/colorPickerCircle.tsx>) |
| S4 table/actions/insights | [table](<../../../../../../../src/screens/academic/curriculum-management/setting/subjectCreation/settingSubjectTable.tsx>); [actions](<../../../../../../../src/screens/academic/curriculum-management/setting/subjectCreation/settingSubjectTableActions.ts>); [name cell](<../../../../../../../src/screens/academic/curriculum-management/setting/subjectCreation/subjectNameCell.tsx>); [status labels](<../../../../../../../src/screens/academic/curriculum-management/setting/subjectMasterStatus.ts>) |
| S5 usage | [usage dialog](<../../../../../../../src/screens/academic/curriculum-management/setting/subjectCreation/subjectUsageDrawer.tsx>); [view model](<../../../../../../../src/screens/academic/curriculum-management/setting/subjectCreation/hooks/useSubjectUsageViewModel.ts>); [lifecycle action](<../../../../../../../src/screens/academic/curriculum-management/setting/subjectCreation/components/SubjectLifecycleAction.tsx>) |
| S6 import | [dialog](<../../../../../../../src/screens/academic/curriculum-management/setting/subjectCreation/bulkImport/BulkSubjectImportDialog.tsx>); [save/parse hook](<../../../../../../../src/screens/academic/curriculum-management/setting/subjectCreation/bulkImport/useBulkSubjectImport.ts>); [parser](<../../../../../../../src/screens/academic/curriculum-management/setting/subjectCreation/bulkImport/parser.ts>); [validation](<../../../../../../../src/screens/academic/curriculum-management/setting/subjectCreation/bulkImport/validation.ts>); [limits/columns](<../../../../../../../src/screens/academic/curriculum-management/setting/subjectCreation/bulkImport/constants.ts>); [download template](<../../../../../../../src/screens/academic/curriculum-management/setting/subjectCreation/bulkImport/template.ts>) |
| S7 shared table | [table component](<../../../../../../../src/components/customizabaleTable/index.tsx>); [data processing](<../../../../../../../src/components/customizabaleTable/hooks/useTableData.ts>) |
| S8 client and errors | [RTK client](<../../../../../../../src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi.ts>); [shared error handling](<../../../../../../../src/redux/customQueryAndMutation.tsx>) |
| B1 behavior owner | [Subject application service](<../../../../../../../../Shikshamitra-BE/src/ShikshaMitra.Application/Academic/Curriculum/SubjectAppService.cs>); [subject manager](<../../../../../../../../Shikshamitra-BE/src/ShikshaMitra.Domain/Academic/Curriculum/Settings/SubjectManager.cs>) |
| B2 authority/contracts | [controller permissions](<../../../../../../../../Shikshamitra-BE/src/ShikshaMitra.HttpApi/Controllers/Academic/Curriculum/SubjectController.cs>); [create/update DTO](<../../../../../../../../Shikshamitra-BE/src/ShikshaMitra.Application.Contracts/Academic/Curriculum/CreateUpdateSubjectDto.cs>) |
| U1 page/table | [DESIGN.md](<../../../../../../../DESIGN.md>); [table rules](<../../../../../../../.agents/skills/shikshamitra-ui-consistency/references/tables.md>) |
| U2 dialog/section | [form-dialog rules](<../../../../../../../.agents/skills/shikshamitra-ui-consistency/references/form-dialogs.md>); [section rules](<../../../../../../../.agents/skills/shikshamitra-ui-consistency/references/sections.md>) |
| U3 lifecycle/details/states | [confirmations](<../../../../../../../.agents/skills/shikshamitra-ui-consistency/references/confirmations.md>); [details](<../../../../../../../.agents/skills/shikshamitra-ui-consistency/references/detail-pages.md>); [empty/loading](<../../../../../../../.agents/skills/shikshamitra-ui-consistency/references/empty-loading-states.md>); [shared rules](<../../../../../../../.agents/skills/shikshamitra-ui-consistency/references/shared-rules.md>) |

Backend links identify behavior ownership rather than duplicating the backend specification.
Read the corresponding sources again if the QA build differs from this authoring revision.

[Suite index](README.md)
