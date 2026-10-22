# Subjects Creation functional cases

These cases cover the current web UI, including workflows launched from this screen.
Use the [shared prerequisites, fixtures, permission profiles, cleanup, and evidence rules](test-data.md).
Source keys refer to that guide's source index.
All cases are **Not run**; detailed expected results are authoring oracles, not observed passes.

Run each multi-value variation as a separate execution result under the same stable case ID.
Use [UI checks](ui-consistency.md) for standards that differ from existing labels, and [edge cases](edge-cases.md) for failures and boundaries.

## QA-ACM-SUB-FUN-001: Open from the Academic menu

**Priority:** P1 | **Status:** Not run | **Basis:** S1-S4

**Setup and data:** SC-Manager; selected default QA context.

**Steps**

1. Expand Academics > Curriculum > Settings and select Subjects Creation.
2. Check the address, page heading, breadcrumbs, and selected navigation item.

**Expected results**

- Route is /academic/curriculumSetting/subjectCreation; heading is Subject Creation.
- Breadcrumbs read Academics > Curriculum > Settings > Subject Creation; the menu remains selected and shell stays usable.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-002: Reload and open a bookmarked route

**Priority:** P1 | **Status:** Not run | **Basis:** S1-S4

**Setup and data:** SC-Manager; existing session and saved valid academic context.

**Steps**

1. Open the screen URL directly in a new tab.
2. Reload; wait for content; use the Academics breadcrumb and return through the menu.

**Expected results**

- The permitted screen resolves without a blank page or login loop.
- Shell/context are retained or deliberately reselected; breadcrumb reaches /academic/dashboard and returning loads the correct medium.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-003: No selected medium and an empty medium

**Priority:** P1 | **Status:** Not run | **Basis:** S1,S4,S8; U1,U3

**Setup and data:** SC-Manager; first clear context through supported shell controls, then use a QA medium with zero subjects.

**Steps**

1. Open the route without a selected medium.
2. Select the empty QA medium; inspect the body and page actions.
3. Activate the available empty-state Subject action; close without saving.

**Expected results**

- Without a medium, no request targets an undefined medium; the prerequisite is understandable.
- A successful empty response is presented as empty, with an authorized next action.
- Current source wires the empty-state Subject action to bulk import; record that destination and assess its label under UI-008. Missing guidance is a failure, not an empty-data pass.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-004: Create using only required inputs

**Priority:** P1 | **Status:** Not run | **Basis:** S1-S4,S8

**Setup and data:** SC-Manager; D01 is not present in the selected medium.

**Steps**

1. Select the Subject page action; inspect Add Subject.
2. Enter D01 Subject Name, retain General or choose Scholastic as recorded, and select Dark blue.
3. Select Submit once; wait for success; search the actual normalized name.
4. Reload, search again, and open Edit subject.

**Expected results**

- Optional values need not be entered; Category defaults General and Color starts unselected.
- One subject is created after duplicate preflight and the form closes; success feedback identifies the subject.
- Exactly one saved row persists in the same medium with Active status, the chosen category/color, and matching edit values.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-005: Create with every visible field and option family

**Priority:** P1 | **Status:** Not run | **Basis:** S2,S3,S4

**Setup and data:** SC-Manager; D02; run each category/icon variation with a fresh unique name.

**Steps**

1. Fill Subject Name, Display Name, Subject Category, Subject Icon, Subject Color, and Description using D02.
2. Repeat independent runs for all six category options and seven non-None icon options.
3. Save each record, reload, and reopen Edit subject.

**Expected results**

- All visible values persist and the table renders the selected category and icon.
- No Status or Sort Order control is required or invented for the single form.
- Required color, optional icon, and optional text behave independently.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-006: Optional fields and table fallbacks

**Priority:** P2 | **Status:** Not run | **Basis:** S2-S4

**Setup and data:** SC-Manager; fresh name; optional fields initially blank.

**Steps**

1. Create a subject with Display Name, Subject Icon, and Description empty.
2. Inspect the subject cell; edit and set a display name and icon; save.
3. Edit again, clear both optional selections, save, and reload.

**Expected results**

- Empty display name shows Display: followed by the subject name; without icon the avatar uses the first two subject-name characters.
- Adding and removing optional values updates the same record; cleared values do not resurrect on reload.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-007: Block an exact existing name

**Priority:** P1 | **Status:** Not run | **Basis:** S2; B1

**Setup and data:** SC-Manager; D03 Mathematics exists in the selected medium.

**Steps**

1. Open Add Subject, enter Mathematics, choose a color, and Submit.
2. Observe duplicate feedback and search the list afterward.

**Expected results**

- Feedback says Mathematics already exists. Please use the existing subject.
- No extra subject is saved; the form and entered values remain available for correction.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-008: Block known aliases and matching display names

**Priority:** P1 | **Status:** Not run | **Basis:** S2; B1

**Setup and data:** SC-Manager; D03 Mathematics/Maths, Science, and Computer Science exist.

**Steps**

1. Attempt independent creates named Math, Maths, Sci, Comp, and Computer with valid category/color.
2. For a separate fixture whose display name is unique, try that exact display name as a new subject name.

**Expected results**

- Single-form preflight treats configured aliases and matching normalized display names as exact matches.
- Each attempt is blocked with already-exists feedback and no extra row. Bulk import has a different preflight; do not assume the same dialog there.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-009: Review a similar name without saving

**Priority:** P1 | **Status:** Not run | **Basis:** S2; B1

**Setup and data:** SC-Manager; Mathematics exists; Regular Mathematics does not.

**Steps**

1. Enter Regular Mathematics with a color and Submit.
2. Inspect Possible Duplicate Subject and the named existing subject.
3. Choose Review Subject; inspect all input values.

**Expected results**

- The in-app dialog names both candidates and offers Review Subject and Create Anyway.
- Review Subject closes only the warning, preserves the form, and performs no subject save.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-010: Approve a legitimate similar name once

**Priority:** P1 | **Status:** Not run | **Basis:** S2; B1

**Setup and data:** SC-Manager; same isolated Mathematics fixture as FUN-009.

**Steps**

1. Enter Regular Mathematics and Submit.
2. Choose Create Anyway once.
3. Reload and locate the new record; record its ID.

**Expected results**

- One new record is saved only after explicit approval.
- The pre-existing Mathematics subject is unchanged and the form reports one successful completion.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-011: Edit prefill and update

**Priority:** P1 | **Status:** Not run | **Basis:** S1-S4

**Setup and data:** SC-Manager; D02 saved and unused.

**Steps**

1. Choose Edit subject on D02.
2. Check all visible saved values, including selected color/icon.
3. Change Display Name, Category, Icon, Color, and Description; click the current Update action.
4. Reload and reopen the same record.

**Expected results**

- Dialog title is Edit Subject and inputs show that row's data.
- One record is updated, the chosen values persist, and the original subject ID remains the same.
- Use current Update label to execute; the Submit consistency requirement is assessed separately under UI-015.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-012: Keep a subject's own name during edit

**Priority:** P1 | **Status:** Not run | **Basis:** S2; B1

**Setup and data:** SC-Manager; existing D02 without another matching subject.

**Steps**

1. Edit only Description or Display Name, leaving Subject Name unchanged.
2. Save once; reload.

**Expected results**

- The subject does not match itself as an exact duplicate.
- The change succeeds without creating another subject or requiring an unrelated rename.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-013: Reject renaming to another existing subject

**Priority:** P1 | **Status:** Not run | **Basis:** S2; B1

**Setup and data:** SC-Manager; two distinct D03 records.

**Steps**

1. Edit Science, replace Subject Name with Mathematics, retain valid color, and save.
2. Dismiss any feedback safely; reload both rows.

**Expected results**

- The duplicate rename is rejected and edit input remains available for correction.
- Both original records retain their saved identities and no subject is overwritten.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-014: Edit an in-use subject with impact warning

**Priority:** P1 | **Status:** Not run | **Basis:** S2,S3,S5; B1

**Setup and data:** SC-Manager; D04 usage fixtures have been prepared through supported module screens.

**Steps**

1. Open Edit subject for D04.
2. Inspect the in-use warning; change only Display Name and Color; save.
3. Open its existing allocations/linked records and verify identity.

**Expected results**

- The warning explains that the subject is used in academic modules.
- Safe presentation changes retain the same master subject and existing links; no second subject or detached class allocation appears.
- Do not infer automatic publication or reassignment from changing a master display value.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-015: Archive from a table row

**Priority:** P1 | **Status:** Not run | **Basis:** S1,S4,S8; B1

**Setup and data:** SC-Manager; an active run-owned subject with ledger entry.

**Steps**

1. Choose Archive subject from the row actions.
2. Read Archive Subject and its consequence; enter reason QA programme retired and confirm Archive.
3. Reload the list and open the record.

**Expected results**

- Success feedback says Subject archived successfully.; the record remains visible with Archived status.
- The subject is retained for old records and is unavailable for new allocations according to the published screen warning.
- Check downstream selection using supported UI, without deleting history.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-016: Restore an archived subject

**Priority:** P1 | **Status:** Not run | **Basis:** S1,S4,S5; B1

**Setup and data:** SC-Manager; D06; no conflicting same-name active/inactive record.

**Steps**

1. Inspect the archived row's actions.
2. Choose Restore subject; wait for success and reload.
3. Inspect its identity, status, and available actions.

**Expected results**

- Archived rows expose restore for the managing role and do not offer ordinary edit/archive/delete.
- The same subject returns as Active and reports Subject restored successfully.; existing identity is preserved.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-017: Archive or restore from usage details

**Priority:** P1 | **Status:** Not run | **Basis:** S1,S5

**Setup and data:** SC-Manager; separate active and archived run-owned fixtures.

**Steps**

1. Open each fixture's usage details.
2. For the active fixture choose Archive Subject and complete the confirmation.
3. For the archived fixture choose Restore Subject; reload the list.

**Expected results**

- Only the lifecycle action appropriate to current status is offered.
- Successful archive/restore has the same resulting state as the table action; selection is cleared and a different subject is not modified.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-018: Delete an unused disposable subject

**Priority:** P1 | **Status:** Not run | **Basis:** S1,S4; B1

**Setup and data:** SC-Manager; D05; verify no dependencies before deletion.

**Steps**

1. Choose Delete subject; check the confirmation names D05.
2. Confirm using the currently visible Yes outcome.
3. Reload and search the exact saved name.

**Expected results**

- The selected unused subject is deleted once, success feedback appears, and the row remains absent after reload.
- No other subject is removed. UI-023 separately assesses the generic Yes label.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-019: Cancel deletion and archive

**Priority:** P1 | **Status:** Not run | **Basis:** S1,S4

**Setup and data:** SC-Manager; two disposable fixtures whose states are recorded.

**Steps**

1. Open Delete subject and cancel without confirming.
2. Open Archive subject on the other fixture, enter a reason, then cancel.
3. Reload both rows.

**Expected results**

- No lifecycle mutation occurs on cancellation; records retain their original status and values.
- Reason text from a cancelled archive does not carry into an unrelated subject's next archive dialog.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-020: Used subject cannot be deleted

**Priority:** P0 | **Status:** Not run | **Basis:** S1,S4; B1

**Setup and data:** SC-Manager; D04 and at least one effective dependency.

**Steps**

1. Inspect Delete subject on D04 in the adaptive action menu.
2. Read its disabled explanation; attempt keyboard activation without bypassing UI.
3. Reload the subject and dependency screen.

**Expected results**

- Delete is unavailable/disabled with the explanation This subject is already used. View usage before deleting.
- The subject and dependencies remain intact; disabled selection does not mutate or invoke another row action.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-021: Open usage details by row, count, and keyboard

**Priority:** P1 | **Status:** Not run | **Basis:** S4,S5

**Setup and data:** SC-Manager; D04; another visibly different subject.

**Steps**

1. Click D04's Subject row and close the detail dialog.
2. Click its Used in N classes cell and close.
3. Focus the row and press Enter, then repeat with Space.
4. Repeat on the second subject.

**Expected results**

- Each supported trigger opens the intended subject exactly once.
- Dialog identity/status correspond to the selected row; click propagation does not produce overlapping dialogs or stale identity.
- Closing returns to the table without changing search or paging.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-022: Verify dependency metrics, labels, and navigation

**Priority:** P1 | **Status:** Not run | **Basis:** S5

**Setup and data:** SC-Manager; D04 with a recorded dependency ledger.

**Steps**

1. Open D04 usage details and compare every displayed count and class/elective label to prepared records.
2. Inspect Class allocations, Elective groups, Syllabus chapters, Timetable periods, Examinations, Lesson plans, Homework records, and Assigned teachers.
3. Use available allocation, syllabus, timetable, examination, and lesson-plan dependency links, returning between runs.

**Expected results**

- Metrics reflect prepared records; zero values are distinguished from failed loading.
- Class/elective labels identify the expected records; optional codes remain attached to the right label.
- Available links close the detail view and reach the owning feature under normal route permissions; do not infer a subject-specific filter unless the destination actually provides one.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-023: Verify full insights counts

**Priority:** P1 | **Status:** Not run | **Basis:** S4

**Setup and data:** SC-Manager; D08; ledger includes total, active, archived, used, and unused subjects.

**Steps**

1. Select View full insights.
2. Compare Total Subjects, Active Subjects, Archived Subjects, Used In Classes, and Unused Subjects with the ledger.
3. Apply table search and close/reopen insights; then create or archive one owned fixture and wait for list refresh.

**Expected results**

- Counts describe the loaded medium-wide subject set, not only the current page or search match.
- Used In Classes counts subjects used in one or more classes, not the sum of class allocations.
- Counts update after the successful mutation without requiring a second create/delete.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-024: Search visible subject information

**Priority:** P1 | **Status:** Not run | **Basis:** S4,S7

**Setup and data:** SC-Manager; D08 with known names, display names, and categories; relevant columns visible.

**Steps**

1. Search a full subject name, partial name, mixed-case text, display name, and category in independent runs.
2. Enter a guaranteed absent token and then clear search.

**Expected results**

- Search runs across the loaded result set before paging and matches relevant rendered text case-insensitively.
- Absent matches show a filtered-empty state with a safe reset; clearing restores the full current-medium set.
- Record visible-column effects rather than assuming hidden fields are still searched.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-025: Apply supported column filters

**Priority:** P1 | **Status:** Not run | **Basis:** S4,S7; U1

**Setup and data:** SC-Manager; D08 with known status, dates, and usage counts.

**Steps**

1. Inspect Subject, Category, Used In Classes, Used In Elective Groups, Last Updated, and Status filter controls.
2. Apply supported text, numeric, date, and status criteria; combine with search.
3. Remove one criterion, then clear all.

**Expected results**

- Data-column filter controls are discoverable and use the correct data type; Actions has no filter/sort.
- Criteria apply across all loaded rows, chips match active criteria, and paging resets appropriately.
- A missing intended header filter is a consistency failure, not evidence that the case is inapplicable.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-026: Sort and paginate the complete list

**Priority:** P1 | **Status:** Not run | **Basis:** S4,S7

**Setup and data:** SC-Manager; D08 with at least 25 rows and varied numeric counts.

**Steps**

1. Sort Subject ascending/descending, then a numeric usage column.
2. Use next/previous page and change rows per page.
3. Search/filter while on a later page, then clear criteria.

**Expected results**

- Subject sorting is lexical and usage sorting is numeric; Actions is not sortable.
- Pages have no duplicate or missing records; totals reflect filtered rows.
- A narrowed result set does not strand the tester on an invalid empty page.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-027: Columns, density, and fullscreen

**Priority:** P2 | **Status:** Not run | **Basis:** S4,S7

**Setup and data:** SC-Manager; D08; record existing table preferences before changing them.

**Steps**

1. Hide/show Category through Columns; change Dense; enter and exit fullscreen.
2. Reload to observe the shared table's persisted settings.
3. Reset columns/preferences before other cases.

**Expected results**

- Visible columns and density change predictably; fullscreen contains the table and exposes an accessible exit.
- Persisted presentation settings do not alter the records, active medium, or another table's preferences.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-028: Export the current filtered dataset

**Priority:** P1 | **Status:** Not run | **Basis:** S4,S7

**Setup and data:** SC-Manager; D08; search/filter yields more than one page; use synthetic records only.

**Steps**

1. Choose displayed columns and sort order; export Excel and PDF using the table utility.
2. Inspect downloaded files and compare exported subjects with all filtered rows, not just the visible page.
3. Verify Actions and interactive control labels are not exported as data.

**Expected results**

- Export includes the sorted filtered loaded set and appropriate visible data columns.
- Dates, statuses, counts, and subject text remain readable; no unrelated medium or hidden operational data appears.
- No backend-wide completeness claim is made beyond the loaded subject dataset.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-029: Download and inspect both import templates

**Priority:** P1 | **Status:** Not run | **Basis:** S6

**Setup and data:** SC-Manager; browser downloads available.

**Steps**

1. Open Bulk Add and download CSV and Excel.
2. Open each downloaded file in the approved viewer.
3. Compare header order and Mathematics example; remove/replace the example before a real import.

**Expected results**

- Files are subject-import-template.csv and subject-import-template.xlsx.
- Both carry the eight documented columns and sample Mathematics/Maths/Scholastic/#0D47A1/calculator/Active/1 values.
- Downloading a template creates no subjects.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-030: Import a valid CSV

**Priority:** P1 | **Status:** Not run | **Basis:** S6,S8

**Setup and data:** SC-Manager; D09 CSV with fresh names and one or more valid rows.

**Steps**

1. Upload the CSV through Bulk Add.
2. Compare preview row numbers, Subject, Category, Status, and Ready indicators.
3. Select Import N subjects once; reload and search all imported names.

**Expected results**

- Preview reflects the file and shows N rows ready; Import is enabled only after valid parsing.
- Success says N subjects imported successfully.; every expected subject appears once in the selected medium.
- Values match the file; the single-create title-case transformation is not applied to import.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-031: Import a valid Excel workbook

**Priority:** P1 | **Status:** Not run | **Basis:** S6

**Setup and data:** SC-Manager; D09 .xlsx; first sheet is the intended Subjects sheet.

**Steps**

1. Upload the workbook and compare preview with the first worksheet.
2. Import once and reopen one saved subject for field checks.

**Expected results**

- First-sheet rows are previewed and saved with correct optional fields.
- A numeric Sort Order cell is read correctly; the subject's visible details match the imported row.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-032: Correct invalid preview rows

**Priority:** P1 | **Status:** Not run | **Basis:** S6

**Setup and data:** SC-Manager; CSV containing one valid row, one duplicate name, and one invalid color.

**Steps**

1. Upload and inspect every row's Validation cell and summary.
2. Attempt to import; correct the original file externally and upload it again.
3. Import only after all rows are Ready.

**Expected results**

- Row-specific issues and N rows need attention are shown; any invalid row blocks the whole UI submission.
- Preview is not edited in-place; reupload replaces errors and rows.
- No subjects are created from the invalid preview.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-033: Cancel and reopen import cleanly

**Priority:** P1 | **Status:** Not run | **Basis:** S6; U2,U3

**Setup and data:** SC-Manager; D09 uploaded but not saved.

**Steps**

1. Upload and inspect a valid preview; use Cancel.
2. Reopen Bulk Add and compare file, rows, errors, and button state.
3. Repeat with X/Escape as supported; assess dirty protection under EDGE-017.

**Expected results**

- A confirmed discard closes without saving any subject.
- Reopening after a confirmed discard starts clean, with no stale preview/error/file.
- All dirty leave paths must follow the same UI protection contract; direct Cancel bypass is a failure under UI-016.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-034: View-only profile

**Priority:** P0 | **Status:** Not run | **Basis:** S1,S4,S5; B2

**Setup and data:** SC-Reader; existing scoped QA records.

**Steps**

1. Open the menu route and inspect page and row actions.
2. Open insights and subject usage details.
3. Attempt ordinary keyboard navigation through all available controls.

**Expected results**

- Reader can view permitted rows, insights, and usage.
- Subject/Bulk Add/edit/archive/restore/delete are unavailable; view interactions never trigger a mutation.
- A denied action must not appear enabled merely to fail after clicking.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-035: Editor and deleter profiles

**Priority:** P0 | **Status:** Not run | **Basis:** S1,S4; B2

**Setup and data:** Independent SC-Editor and SC-Deleter sessions; disposable unused and used records.

**Steps**

1. For SC-Editor inspect Subject/Bulk Add/edit/archive/restore and delete.
2. For SC-Deleter inspect page creation controls and row delete on unused/used records.
3. Perform one authorized action in each profile on a run-owned fixture.

**Expected results**

- Editor has the Add-governed actions but no delete.
- Deleter has View + Delete, no Add-governed actions; used-subject restrictions still apply.
- Each mutation is limited to its intended profile and selected subject.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-036: Denied profile and signed-out direct route

**Priority:** P0 | **Status:** Not run | **Basis:** S1; B2,U1

**Setup and data:** SC-Denied and a separate signed-out session.

**Steps**

1. Try normal menu navigation as SC-Denied, then open the screen URL directly.
2. Open the bookmarked URL signed out.
3. Inspect the screen before and after any shell transition.

**Expected results**

- Unauthorized subject data/actions are never displayed, even briefly.
- The signed-out session follows the application's login flow; a denied role receives the standard inaccessible/permission outcome.
- Do not infer server authorization sign-off from hidden controls alone.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-037: Change medium after a completed save

**Priority:** P0 | **Status:** Not run | **Basis:** S1,S4,S8

**Setup and data:** SC-Manager; D07; dialog closed and no dirty work.

**Steps**

1. Create a uniquely named subject in English and record its ID.
2. Switch to Marathi, wait for context loading, and search that name.
3. Create a different Marathi-only subject; switch back.

**Expected results**

- Each table and insights panel resolves the selected medium's dataset.
- An English record does not appear as a Marathi record, and vice versa; each saved subject stays in its intended medium.
- No stale success feedback is mistaken for saving in the newly selected context.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

## QA-ACM-SUB-FUN-038: Imported lifecycle states survive ordinary edits

**Priority:** P1 | **Status:** Not run | **Basis:** S2,S4,S6

**Setup and data:** SC-Manager; D09 Active, Inactive, Archived rows.

**Steps**

1. Import the three documented states and inspect table labels and Status filter options.
2. Edit the Inactive record's Display Name and save.
3. Inspect archived row actions, then restore the archived fixture.

**Expected results**

- Labels and filters reflect Active, Inactive, Archived.
- Editing an Inactive record does not silently make it Active; there is no visible single-form Status selector.
- Archived records follow the restore flow and become Active only after successful restore.

**Cleanup:** Follow the run ledger and shared reset rules; restore baseline fixtures and remove only run-owned, unused records.

[Suite index](README.md)
