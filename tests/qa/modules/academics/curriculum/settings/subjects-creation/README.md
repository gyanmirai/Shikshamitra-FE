# Subjects Creation QA

This suite covers the Subject Creation web screen, its dialogs, insights, usage details, and subject lifecycle actions.
Manual case authoring is complete for this revision; current execution results are recorded separately from the authored baseline.
Source discovery is not proof that a workflow passes in the QA environment.

| Metadata | Value |
| --- | --- |
| Exact menu label | Subjects Creation |
| Page heading | Subject Creation |
| Navigation | Academics > Curriculum > Settings > Subjects Creation |
| Route | /academic/curriculumSetting/subjectCreation |
| Discovery | Menu and sources confirmed; partial local browser run on 22 October 2026 |
| Coverage ownership | Web UI; backend contracts are referenced only to establish expected behavior |
| Execution | All eight reported bugs fixed and locally retested; broader suite execution remains partial |

## Latest execution: 22 October 2026

[Open the detailed execution report](<../../../../../../../test-results/qa/20261022-subject-creation/report.md>) for all 113 entry results, reproduced defects, screenshots, and cleanup evidence.
The initial browser run recorded 20 Passed, 16 Failed, 37 Partial, 21 Blocked, and 19 Not run entries; seven Not run entries are composite journeys. Those original results remain in the report as failure history.

The subsequent fix/retest verified all three requested bugs on the local application:

| Bug | Change and observed retest | Result |
| --- | --- | --- |
| SUB-QA-001 | Normalize API statuses for the table; Active, Inactive, and Archived filters return the correct subjects. An ordinary Inactive edit preserves its status; archived restore still works. | Fixed; retest passed |
| SUB-QA-002 | Search the subject's master and display names through its visible column; full/partial display-name search and mixed casing work, including a combined Inactive filter. Existing category and date searches still work. | Fixed; retest passed |
| SUB-QA-003 | Show one associated alert below the upload/file list; missing Category, header-only, empty, 201-row, unsupported-type, and oversized files have readable feedback. Valid replacement clears the error and imports successfully; feedback remains visible at 390 px. | Fixed; retest passed |

The subsequent UI consistency retest fixed the five remaining reported issues:

| Bug | Change and observed retest | Result |
| --- | --- | --- |
| SUB-QA-004 | Required Color shows an associated alert; invalid submission focuses the group, and keyboard color selection clears the error. Name and Category expose native required semantics; Category also uses the shared validation wrapper. | Fixed; retest passed |
| SUB-QA-005 | Add/Edit use Subject Details with subtitle1/600 styling, keyboard-accessible header/section help, and Submit with the submit icon. Create and edit saves succeeded. | Fixed; retest passed |
| SUB-QA-006 | Usage header and meaningful sections expose help through the shared components. Keyboard guidance was checked for an unused fixture and Computer Science with real dependencies. | Fixed; retest passed |
| SUB-QA-007 | Delete Subject names the selected record and uses Cancel/Delete with icons; Cancel preserves it, and confirmed Delete removes only the owned fixture. Archive also names the record and uses the standard warning/neutral action treatment. | Fixed; retest passed |
| SUB-QA-008 | Visible Subject action exposes Add subject as its accessible name. | Fixed; retest passed |

Two direct row actions with a contextual overflow menu satisfy both the specific two-action rule and DESIGN.md's maximum of three. Used-subject Delete remains disabled in that menu. The earlier UI-007 clarification is resolved for this screen without changing the shared default.
Cancel, X, and Escape now use one shared Discard Unsaved Changes? decision for dirty forms; Keep Editing preserves values, Discard resets the draft, and clean/touch-only cancellation closes directly. Native Enter also runs Formik validation. Save locking and failure/retry are covered by real-client HTTP-fixture tests.

Latest focused validation: **14 files / 62 tests passed**, changed-file ESLint passed with zero warnings, and `npm run ts` passed. The form tests use real Formik/Redux/API wiring with HTTP fixtures. Nonfatal happy-dom teardown warnings remain in the combined log. A 15-second timeout is scoped to the interactive form test file after an initial five-second timeout under concurrent validation load; assertions are unchanged.
The three behavior-retest subjects and the later UI-retest subject were removed. The six original subjects and insights counts were restored after reload; discarded drafts created no records.
`npm run docs:check` still has the previously observed 27 errors under `docs/testing`; see the report for the command and details.
The eight reported defects are closed locally. Untested role/tenant/theme/failure variations and composite school journeys still prevent full module sign-off. Passing a bug reproduction does not mark every linked multi-variation case Passed.

Case-block Status values below are the authoring baseline, not execution history; use the run report for current outcomes.
Generated reports/screenshots stay in the ignored test-results directory.

## Read order

1. [Test data and execution guide](test-data.md): accounts, fixtures, field rules, cleanup, evidence, and source links.
2. [Functional cases](cases.md): navigation, create/edit, duplicate handling, lifecycle, table, imports, and access.
3. [Edge cases](edge-cases.md): boundaries, failures, concurrency, stale context, and import hazards.
4. [UI consistency checks](ui-consistency.md): design rules, responsive behavior, accessibility, and screenshots.
5. [School examples](school-examples.md): synthetic school journeys linking the individual cases.

## Coverage inventory

| Material | Authored entries | Execution |
| --- | ---: | --- |
| Functional cases | 38 | See latest run |
| Edge cases | 40 | See latest run |
| UI consistency checks | 28 | See latest run |
| Composite school examples | 7 | Not run; references the detailed cases |

The detailed suite has 106 checks, plus seven composite school journeys.
Every numbered case has a stable ID.
Default prerequisites, roles, cleanup, and result recording are defined in the execution guide and apply unless a case overrides them.
P0 protects data/context/access; P1 covers primary workflows; P2 covers secondary behavior.
Do not count referenced cases again when reporting a school journey.

## Original observations and latest disposition

Functional cases use the current form labels and supported operations.
UI checks use the governing interface rules; existing inconsistencies are not approved baselines.
The source observations below were the authoring baseline; the latest execution report distinguishes reproduced differences from incomplete checks and contract clarifications.

| Observation | Source evidence | Relevant check |
| --- | --- | --- |
| Fixed: section now says Subject Details with subtitle1/600 typography | subjectForm.tsx; form-dialogs and sections guides | QA-ACM-SUB-UI-011 |
| Fixed: Add/Edit now use Submit with the submit icon | subjectForm.tsx; form-dialogs guide | QA-ACM-SUB-UI-015 |
| Fixed for Cancel/X/Escape: shared in-app dirty guard owns all three paths; broader navigation matrix remains unverified | subjectForm.tsx; components/SubjectDiscardDialog.tsx; confirmations guide | QA-ACM-SUB-UI-016; QA-ACM-SUB-EDGE-017 |
| Fixed: Delete Subject decision uses a named record and Delete outcome | components/SubjectDeleteDialog.tsx; confirmations guide | QA-ACM-SUB-UI-023 |
| Add form has no visible Status or Sort Order field; these values exist in form state and bulk import | components/SubjectConfigurationFields.tsx; bulkImport/constants.ts | QA-ACM-SUB-FUN-005; QA-ACM-SUB-FUN-038 |
| Local loading state combines initial load and refresh, and the table is not passed query error/onRetry | settingSubjectTable.tsx; loading contract | QA-ACM-SUB-UI-009; QA-ACM-SUB-EDGE-019 |
| Usage detail is a centered CustomDialog despite the subjectUsageDrawer filename | subjectUsageDrawer.tsx | QA-ACM-SUB-UI-019 |
| Fixed: Category uses ShakingTextField; Color has visible associated feedback and keyboard-focus handling | components/SubjectIdentityFields.tsx; SubjectColorField.tsx | QA-ACM-SUB-UI-012 |
| Bulk preload excludes archived subjects, while duplicate preflight checks archived records too | hooks/useBulkSubjectImport.ts; referenced backend duplicate method | QA-ACM-SUB-EDGE-031 |
| Name/display inputs offer language typing but current validation accepts ASCII only | SubjectIdentityFields.tsx; validationSchema.ts | QA-ACM-SUB-EDGE-009 |

Busy dismissal, error recovery, keyboard submission, and permission combinations must be tested rather than inferred from props.
Missing visual references and environment prerequisites remain Unverified or Blocked, never Passed.

## Decisions required before affected sign-off

- Concurrent stale edits: determine whether conflicts must be rejected, merged, or resolved explicitly; the current form does not establish that policy.
- Add without View: decide whether that is a supported profile, since duplicate preflight requires View. No permission bypass is permitted.
- Duplicate import headers: decide the user-facing rejection rule; the current parser selects the last repeated header.
- Localized/acronym/punctuation naming: current validation/casing is documented; expanded school naming needs product approval.

Other executable cases can proceed independently of these decisions.

## Existing automation

[Existing Academic catalogue](<../../../../../../../tests/catalog/academic.yaml>) includes ACM-CUR-002, a broad subject CRUD scenario marked automated-outside-default-config.
The [existing subject Playwright spec](<../../../../../../../tests/academic/subject-management/subject-creation.spec.ts>) contains older Basic Details and Add Subjects/Save expectations that differ from current Subject details and CSV/Excel Import subjects UI.
Treat it as an automation review candidate, not evidence that these new cases passed.

Existing unit checks cover the duplicate dialog, action availability, restore behavior, and import parsing/validation/preview/templates.
They are supporting mappings only; they do not establish full browser coverage.
Preserve existing IDs and automation files.
These detailed manual IDs are not registered as newly automated scenarios in the legacy catalogue; catalogue registration and annotation mapping belong to a later automation change.

## Authoring revision

Source and supplied reference images inspected on 21 October 2026.
Scope excludes direct API tests, database assertions, backend security sign-off, and native mobile testing.

[Academics index](../../../README.md) | [All Academic routes](../../../inventory.md)
