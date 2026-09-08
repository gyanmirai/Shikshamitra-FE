# Curriculum Management End-to-End Smoke and Edge-Case Test Plan

## Purpose

This plan defines the browser-driven validation of Curriculum Management in the Academics module. It is designed to be executed by Codex through the in-app browser against a running ShikshaMitra frontend and backend.

The plan separates the fast release smoke gate from the broader regression and edge-case gate:

- **Smoke gate:** proves that the critical curriculum lifecycle works end to end.
- **Regression gate:** covers validation, permissions, state transitions, resilience, and boundary conditions.

## In-scope active routes

| Area | Route | Primary roles |
|---|---|---|
| Subject Creation | `/academic/curriculumSetting/subjectCreation` | Academic Admin |
| Elective Group Creation | `/academic/curriculumSetting/electiveGroupCreation` | Academic Admin |
| Subject Allocation | `/academic/curriculumSubjects` | Academic Admin |
| Student Elective Assignment | `/academic/assign-elective-subject` | Academic Admin |
| Syllabus | `/academic/courseSubjects` | Academic Admin, Teacher |
| Lesson Plan / Teacher Diary | `/academic/lesson-plan` | Teacher, Reviewer, Academic Admin |
| Curriculum Reports | `/academic/curriculumReports` | Academic Admin |

## Routes outside the active Curriculum menu

The following routes exist in source but are hidden, orphaned, shared with another module, or incomplete. They are exploratory targets and are not release-smoke gates unless product scope explicitly activates them:

- `/academic/learningResources`
- `/academic/courseProgress`
- `/academic/curriculumDashboard`
- `/academic/choose-elective-subject`
- `/academic/teacher`
- `/academic/curriculum/settings/academic-categories`

## End-to-end dependency flow

```text
Subject Creation
      |
      v
Elective Group Creation
      |
      v
Subject Allocation -> Draft -> Publish
      |                         |
      v                         v
Syllabus / Chapters       Student Elective Assignment -> Save -> Lock
      |
      v
Lesson Plan -> Submit -> Request Changes -> Resubmit -> Approve
      |
      v
Teacher Diary -> Submit
      |
      v
Create Homework + Generate Curriculum Reports
```

## Environment and data prerequisites

Use a disposable E2E tenant or a dedicated E2E academic structure. Do not use production or shared operational records.

Required setup:

- Frontend and backend are running and reachable.
- One active academic year is available.
- One board and education medium are configured.
- Two classes exist, each with at least two divisions.
- One full-permission Academic Admin account exists.
- One Teacher account exists and is linked to an HR employee record.
- One reviewer exists: Principal, Admin, Coordinator, or a manager with the teacher as a subordinate.
- One view-only or restricted Curriculum user exists.
- At least two active teachers are available for primary and secondary assignment.
- At least four enrolled students exist in the disposable division.
- Two students have elective preferences and two have no preference.
- One valid teaching day and one holiday or vacation date exist.
- A published timetable period exists for the test teacher.
- At least one homework type is configured.
- The report preview/export services are available.

Use unique data names with this format:

```text
e2e-curr-<timestamp>-<record-purpose>
```

Only records containing the current run marker may be removed during cleanup.

## Global pass criteria

Every scenario must verify the following where applicable:

- The correct route and page heading are displayed.
- The page does not crash or show an unhandled error.
- No unexpected error appears in the browser console.
- A mutation produces an appropriate visible success or error message.
- Saved state remains correct after a full page refresh.
- Lists, KPIs, status chips, and downstream selectors reflect the mutation.
- Unauthorized actions are hidden and direct access is denied.
- A rejected action does not partially persist data.
- Failures are classified using `docs/testing/BUG_CLASSIFICATION_POLICY.md`.

## Gate 1: critical smoke flow

### CUR-SMK-001: authentication and navigation

1. Sign in as Academic Admin.
2. Select the active academic year, board, and medium.
3. Open each active Curriculum route.
4. Verify the expected heading on every route.
5. Confirm there is no login redirect, access-denied screen, blank page, or crash.
6. Refresh each route and verify that the academic context remains selected.

Expected result: all seven active routes load successfully with the correct user and academic context.

### CUR-SMK-002: create subject masters

1. Open Subject Creation.
2. Create four uniquely named subjects:
   - Core Subject A.
   - Core Subject B.
   - Elective Subject A.
   - Elective Subject B.
3. Enter name, category, color, and a valid sort order.
4. Verify the success message after every creation.
5. Search for the created subjects.
6. Refresh and verify persistence.
7. Edit Core Subject A's display name, description, color, and sort order.
8. Open View Usage and verify that a newly created subject has no usage.

Expected result: all subjects are created, searchable, editable, and persisted.

### CUR-SMK-003: create an elective group

1. Open Elective Group Creation.
2. Add a group containing Elective Subject A and Elective Subject B.
3. Select a group type and color.
4. Save and verify the group appears in the table.
5. Refresh and verify persistence.
6. Edit the group name or description.
7. Open View Usage and verify that the group has no class usage yet.

Expected result: the elective group lifecycle works before it is used by an allocation.

### CUR-SMK-004: allocate and publish subjects

1. Open Subject Allocation.
2. Select the source class.
3. Click Subject Allocation.
4. Select Core Subject A and the test elective group.
5. For each resulting subject:
   - Enter a unique subject code between 3 and 10 characters.
   - Select a primary teacher.
   - Optionally select secondary teachers.
   - Enter a learning goal, prerequisites, and description.
6. Save as Draft.
7. Refresh and verify Draft status and saved values.
8. Open View and verify the assignment details.
9. Edit the draft and verify the updated values persist.
10. Publish the assignment.
11. Verify Published status, setup health, and KPI values.
12. Verify the published subject is available in Syllabus and Curriculum Reports.

Expected result: both core and elective subjects are allocated and published for the source class.

### CUR-SMK-005: copy allocation to another class

1. From Subject Allocation, select the target class.
2. Open Copy Subject from Class.
3. Select the original source class.
4. Copy all subjects.
5. Include documents and teacher assignments.
6. Use the Skip Existing conflict strategy.
7. Confirm the operation.
8. Verify copied allocations appear in Draft status in the target class.

Expected result: class-copy produces safe Draft allocations without overwriting target data.

### CUR-SMK-006: create and manage syllabus chapters

1. Open Syllabus.
2. Select the source class, division, and published Core Subject A.
3. Add one chapter with:
   - A unique chapter number.
   - A chapter name.
   - Start and end dates inside the academic year.
   - Estimated teaching days and periods.
   - Optional learning and planning metadata.
4. Save and verify the chapter row.
5. Edit the chapter and verify persistence.
6. Use Bulk Add to create two additional chapters.
7. Verify chapter count, sequence, dates, progress, and status columns.
8. Open View Documents.
9. Refresh and verify all chapters remain available.

Expected result: individual and bulk chapter creation work for a published class subject.

### CUR-SMK-007: assign student electives

Use only a disposable class and division because the screen has no normal unlock workflow.

1. Open Student Elective Assignment.
2. Select class, division, and the test elective group.
3. Assign subjects individually to two students.
4. Select the remaining rows and use bulk assignment.
5. Verify assigned/unassigned counts, preference match, issues, and capacity summaries.
6. Save Draft.
7. Refresh and verify selections persisted.
8. Ensure every student has an assignment and save again.
9. Open Review & Lock.
10. Verify zero unassigned students and no unsaved changes.
11. Lock the allocation.
12. Verify all assignment controls become read-only after refresh.

Expected result: all student electives are saved and permanently locked for the disposable context.

### CUR-SMK-008: create and submit a lesson plan

As Teacher:

1. Open Lesson Plan / Teacher Diary.
2. Open Daily Timeline.
3. Select a valid timetable period.
4. Create a lesson plan using a published subject and chapter.
5. Enter topic, learning objective, teaching method, resources, and completion target.
6. Save as Draft.
7. Refresh and reopen the draft.
8. Edit it and submit it for review.

Expected result: the teacher can create, edit, persist, and submit a valid lesson plan.

### CUR-SMK-009: review and approve a lesson plan

As Reviewer:

1. Open Review Queue.
2. Locate the submitted plan.
3. Request Changes with a comment.
4. Verify the teacher can see the feedback.
5. As Teacher, update and resubmit the plan.
6. As Reviewer, approve the plan.
7. Verify Approved status in the reviewer and teacher views.

Expected result: the plan completes the teacher-to-reviewer workflow.

### CUR-SMK-010: submit teacher diary and create homework

As Teacher:

1. Open the approved lesson plan.
2. Create a Teacher Diary entry.
3. Mark Class Conducted.
4. Enter actual topic and completion percentage.
5. Enter reflection and student-response details.
6. Save as Draft.
7. Refresh, reopen, and verify the draft.
8. Submit the diary.
9. Verify Submitted status.
10. From the approved lesson plan, open Create Homework.
11. Save one homework as Draft.
12. Create another homework using Publish Now or Schedule Publish.

Expected result: an approved lesson can produce a submitted diary and homework.

### CUR-SMK-011: preview and export curriculum reports

1. Open Curriculum Reports.
2. Create a Chapter Progress Report.
3. Select organization, class, divisions, subject, and optional chapters.
4. Click Preview.
5. Verify columns, rows, total count, and pagination.
6. Change rows per page between 10, 25, and 50 when enough data exists.
7. Queue a PDF export.
8. Verify the job progresses from Queued or Processing to Completed.
9. Download the completed file.
10. Refresh the report list and verify the export remains in history.

Expected result: preview, background export, status polling, history, and download work.

## Gate 2: edge-case and regression matrix

### Authentication, authorization, scope, and tenancy

| ID | Scenario | Expected result |
|---|---|---|
| CUR-AUTH-001 | Guest opens each active Curriculum route | Redirected to login; no Curriculum data is exposed |
| CUR-AUTH-002 | User without Curriculum root permission opens the menu | Curriculum is not visible |
| CUR-AUTH-003 | User without route permission opens a direct URL | Access is denied |
| CUR-AUTH-004 | View-only user opens every route | Data is visible; mutation actions are absent or disabled |
| CUR-AUTH-005 | User has Add but not Delete permission | Add works; delete/archive controls are unavailable |
| CUR-AUTH-006 | Scope-limited user changes medium/class/division | Only authorized scope values and records appear |
| CUR-AUTH-007 | Session expires during a save | No false success; user is re-authenticated or shown a controlled error |
| CUR-AUTH-008 | Academic year or medium is missing | Controlled setup/empty state; no crash or invalid API request |
| CUR-AUTH-009 | Same marker is queried in a second tenant | No cross-tenant read, update, or delete exposure |

### Subject Creation

| ID | Scenario | Expected result |
|---|---|---|
| CUR-SUB-001 | Submit with required fields empty | Name, category, and color errors are shown |
| CUR-SUB-002 | Name lengths 1, 2, 100, and 101 | 1 and 101 rejected; 2 and 100 accepted |
| CUR-SUB-003 | Display name lengths 50 and 51 | 50 accepted; 51 rejected |
| CUR-SUB-004 | Description lengths 500 and 501 | 500 accepted; 501 rejected |
| CUR-SUB-005 | Subject name contains unsupported punctuation | Validation rejects unsupported characters |
| CUR-SUB-006 | Name contains leading, trailing, or repeated spaces | Name is normalized or duplicate detection still works |
| CUR-SUB-007 | Exact or case-only duplicate | Save is blocked with duplicate feedback |
| CUR-SUB-008 | Similar subject name | Warning appears; Cancel blocks and Continue allows creation |
| CUR-SUB-009 | Sort order is empty, 0, 1, 999999, 1000000, decimal, or text | Only supported values inside the valid range persist |
| CUR-SUB-010 | Bulk drawer has no valid rows | Save is blocked |
| CUR-SUB-011 | Bulk rows contain duplicate names | Duplicate rows are identified and blocked |
| CUR-SUB-012 | Bulk name duplicates an existing subject | Save is blocked or returns controlled duplicate feedback |
| CUR-SUB-013 | Close a dirty bulk drawer | Unsaved Changes confirmation appears |
| CUR-SUB-014 | Delete unused subject | Confirmation succeeds and the row disappears after refresh |
| CUR-SUB-015 | Delete a used subject | Delete is blocked; usage is explained |
| CUR-SUB-016 | Archive and restore a used subject | Status changes correctly and downstream availability follows status |
| CUR-SUB-017 | Archived subject is selected in a new group | Archived subject is unavailable for new selection |

### Elective Group Creation

| ID | Scenario | Expected result |
|---|---|---|
| CUR-EGR-001 | Required name, type, color, or subjects are missing | Relevant validation errors appear |
| CUR-EGR-002 | Name lengths 1, 2, 100, and 101 | 1 and 101 rejected; 2 and 100 accepted |
| CUR-EGR-003 | Zero or one subject selected | Save blocked; at least two are required |
| CUR-EGR-004 | Duplicate name with case/whitespace variation | Duplicate is blocked |
| CUR-EGR-005 | Different name but identical subject combination | Save is blocked with same-combination feedback |
| CUR-EGR-006 | Same subject is selected more than once | Duplicate subject selection is prevented |
| CUR-EGR-007 | Inactive or archived subject is selected | It is unavailable unless preserved from an existing edit |
| CUR-EGR-008 | Edit a group containing a now-inactive subject | Existing selection is preserved without allowing new inactive choices |
| CUR-EGR-009 | Delete unused group | Deletion succeeds and persists |
| CUR-EGR-010 | Delete used group | Deletion is blocked; archive remains available |
| CUR-EGR-011 | Archive and restore group | Status and downstream availability update correctly |

### Subject Allocation

| ID | Scenario | Expected result |
|---|---|---|
| CUR-ALL-001 | No class or no subject selected | Save is blocked with required-field feedback |
| CUR-ALL-002 | Subject code lengths 2, 3, 10, and 11 | 2 and 11 rejected; 3 and 10 accepted |
| CUR-ALL-003 | Same core subject is selected twice | Duplicate allocation is prevented |
| CUR-ALL-004 | Core subject already exists inside selected elective group | Conflict is blocked |
| CUR-ALL-005 | Elective group contains an already allocated core subject | Conflict is blocked |
| CUR-ALL-006 | Two elective groups contain the same subject | Only one conflicting group can be selected |
| CUR-ALL-007 | Primary teacher is also selected as secondary | Same teacher cannot occupy both roles |
| CUR-ALL-008 | No teacher is assigned | Draft is allowed and setup health reports the missing teacher |
| CUR-ALL-009 | Incomplete assignment is published | Publish is blocked with readiness details |
| CUR-ALL-010 | Complete assignment is published | Status changes to Published |
| CUR-ALL-011 | Published assignment is edited | Locked fields remain read-only or require moving back to Draft |
| CUR-ALL-012 | Published assignment is moved to Draft | Status and downstream availability update correctly |
| CUR-ALL-013 | Assignment is archived and restored | Restore returns the assignment as Draft after duplicate checks |
| CUR-ALL-014 | Core allocation is removed | Only the selected core allocation is removed |
| CUR-ALL-015 | Elective allocation is removed | Group and contained subjects are removed consistently |
| CUR-ALL-016 | Copy source equals target | Copy is blocked |
| CUR-ALL-017 | Copy all versus selected subjects | Only the chosen scope is copied |
| CUR-ALL-018 | Copy documents and teachers on/off | Included components follow the chosen switches |
| CUR-ALL-019 | Copy with Skip Existing | Existing target configuration remains unchanged |
| CUR-ALL-020 | Copy with Overwrite Existing | Existing target configuration is replaced as confirmed |
| CUR-ALL-021 | Search by teacher and clear search | Table filters and restores correctly |
| CUR-ALL-022 | Open assignment through `assignmentId` or `subjectId` query | Workspace opens and URL parameters are safely cleared on exit |

### Syllabus and Chapter Management

| ID | Scenario | Expected result |
|---|---|---|
| CUR-SYL-001 | Class or subject is not selected | Add Chapter and Bulk Add are disabled |
| CUR-SYL-002 | Subject allocation is still Draft | Draft subject is not offered in the Syllabus selector |
| CUR-SYL-003 | Chapter number or name is missing | Save is blocked with validation feedback |
| CUR-SYL-004 | Chapter name has fewer than 3 characters | Validation rejects it |
| CUR-SYL-005 | Chapter number duplicates an existing chapter | Duplicate is blocked |
| CUR-SYL-006 | Teaching days, periods, revision days, buffer days, question count, or marks are negative | Validation rejects negative values |
| CUR-SYL-007 | Health score is below 0 or above 100 | Validation rejects it |
| CUR-SYL-008 | Start date is outside the academic year or in the past | New chapter save is blocked |
| CUR-SYL-009 | End date is before start date | Save is blocked |
| CUR-SYL-010 | End date is outside the academic year | Save is blocked |
| CUR-SYL-011 | Existing historical chapter is edited | Existing past dates can be retained while valid edits save |
| CUR-SYL-012 | Bulk form has no chapters | Submission is blocked |
| CUR-SYL-013 | Bulk rows duplicate each other | Conflicting rows are blocked |
| CUR-SYL-014 | Bulk number conflicts with an existing chapter | Submission is blocked and conflict numbers are identified |
| CUR-SYL-015 | Supported document is uploaded, previewed, and removed | Each document action updates the UI and persists where supported |
| CUR-SYL-016 | Unsupported, oversized, duplicate, or failed document upload | Controlled feedback appears and chapter data remains intact |
| CUR-SYL-017 | Chapter is deleted | Confirmation succeeds and row disappears after refresh |
| CUR-SYL-018 | Create/View Questions is opened | Class, subject, and chapter context is preserved |

### Student Elective Assignment

| ID | Scenario | Expected result |
|---|---|---|
| CUR-SEA-001 | No class, division, group, student, or selectable subject exists | Controlled empty state; no crash |
| CUR-SEA-002 | Context changes with unsaved edits | Unsaved Changes dialog appears |
| CUR-SEA-003 | Context change is cancelled | Local changes and current context remain intact |
| CUR-SEA-004 | Unsaved changes are discarded | Server values are restored |
| CUR-SEA-005 | Search by name, roll number, or GR number | Matching student rows are returned |
| CUR-SEA-006 | Assigned, Unassigned, and Preference Mismatch filters | Each filter returns the correct rows |
| CUR-SEA-007 | Select All is used on a filtered list | Only currently filtered rows are selected |
| CUR-SEA-008 | Bulk assign and bulk clear | Selected rows change and counts update immediately |
| CUR-SEA-009 | Preference is absent, matched, or mismatched | Preference status is calculated correctly |
| CUR-SEA-010 | Stale or invalid subject is saved | Save fails cleanly without partial persistence |
| CUR-SEA-011 | Partial assignment is saved | Draft persists; lock remains blocked |
| CUR-SEA-012 | Lock is attempted with unsaved changes | Lock is disabled with an explanatory tooltip |
| CUR-SEA-013 | Lock is attempted with unassigned students | Lock is disabled and issues identify affected students |
| CUR-SEA-014 | All assignments are saved, then locked | Lock succeeds |
| CUR-SEA-015 | User attempts changes after lock | Individual, bulk, clear, save, and selection controls remain disabled after refresh |

### Lesson Plan and Teacher Diary

| ID | Scenario | Expected result |
|---|---|---|
| CUR-LPD-001 | Teacher, date, period, class, division, subject, chapter, or topic is missing | Save is blocked with precise feedback |
| CUR-LPD-002 | Completion is 0, 100, below 0, or above 100 | 0 and 100 accepted; out-of-range values rejected |
| CUR-LPD-003 | Same teacher/date/timetable slot already has a plan | Duplicate slot is blocked |
| CUR-LPD-004 | Same normalized topic exists for the teacher/date | Duplicate topic is blocked |
| CUR-LPD-005 | Period is blocked by holiday, vacation, or timetable insight | Plan creation is blocked with the reason |
| CUR-LPD-006 | Teacher loads lesson-plan data | Only self/authorized records are visible |
| CUR-LPD-007 | Reviewer loads Review Queue | Only permitted subordinate/scope records are visible |
| CUR-LPD-008 | Draft is edited and submitted | Draft remains editable; Submitted transition succeeds |
| CUR-LPD-009 | Invalid repeated submit/approve/reject transition occurs | Controlled error; status remains consistent |
| CUR-LPD-010 | Reject has no reason | Rejection is blocked |
| CUR-LPD-011 | Request Changes has no comment | Request is blocked |
| CUR-LPD-012 | Approve includes an optional comment | Approval succeeds and audit details persist |
| CUR-LPD-013 | Homework is created from non-approved plan | Action is blocked |
| CUR-LPD-014 | Diary is created from non-approved plan | Action is blocked |
| CUR-LPD-015 | Conducted diary has no actual topic | Submission is blocked |
| CUR-LPD-016 | Conducted diary completion is outside 0-100 | Submission is blocked |
| CUR-LPD-017 | Class not conducted has no missed reason | Submission is blocked |
| CUR-LPD-018 | Actual or rescheduled date is outside the academic year | Submission is blocked |
| CUR-LPD-019 | Backdated entry has no reason or exceeds configured limit | Submission is blocked |
| CUR-LPD-020 | Diary is saved as Draft and reopened | All persisted fields are restored |
| CUR-LPD-021 | Diary is submitted | Submitted state persists after refresh |
| CUR-LPD-022 | Evidence file is attached and diary is reopened | Evidence remains attached and downloadable |
| CUR-LPD-023 | Two reviewers act on the same submission | Stale reviewer cannot silently overwrite the final decision |

### Curriculum Reports

Validate all report types:

1. Chapter Progress Report.
2. Subject-wise Chapter Coverage.
3. Chapter Description Summary.
4. Timeline Report.
5. Class-wise Chapter Assignment Report.
6. Curriculum Completion Report.
7. Chapter Revision Tracker.

| ID | Scenario | Expected result |
|---|---|---|
| CUR-RPT-001 | Required fields are omitted for each report type | Report-specific validation appears |
| CUR-RPT-002 | Organization changes | Class, division, subject, and chapter selections reset |
| CUR-RPT-003 | Class changes | Subject and chapter selections reset |
| CUR-RPT-004 | Subject allocation is Draft | Draft subject is not selectable |
| CUR-RPT-005 | Preview contains no rows | Valid empty state is displayed |
| CUR-RPT-006 | Result has multiple pages | Page navigation and 10/25/50 page size work |
| CUR-RPT-007 | Export is Queued or Processing | UI polls without duplicate jobs or downloads |
| CUR-RPT-008 | Export completes | Download becomes available and file is valid |
| CUR-RPT-009 | Export fails | Server error is shown and polling stops |
| CUR-RPT-010 | Export expires | Download is blocked with controlled feedback |
| CUR-RPT-011 | Download is clicked repeatedly | Duplicate downloads are prevented while one is active |
| CUR-RPT-012 | Saved `requestJson` is invalid | Controlled parsing error is shown |
| CUR-RPT-013 | Unauthorized user previews, exports, or downloads | Action is rejected without leaking report data |
| CUR-RPT-014 | PDF is downloaded | Filename, MIME type, nonzero size, and report content are correct |

## Resilience and usability checks

| ID | Scenario | Expected result |
|---|---|---|
| CUR-RES-001 | List API is slow | Loading skeleton/progress appears without layout corruption |
| CUR-RES-002 | List API returns no records | Useful empty state and permitted create action appear |
| CUR-RES-003 | Mutation API returns controlled 4xx | Server message appears; no false success |
| CUR-RES-004 | API returns 5xx or becomes unavailable | Stable error state and retry path appear |
| CUR-RES-005 | User double-clicks a save/publish/lock action | Only one mutation is created |
| CUR-RES-006 | Browser refreshes during a mutation | Result remains consistent after reload |
| CUR-RES-007 | Back/close is used on a dirty form | Unsaved Changes guard appears |
| CUR-RES-008 | Keyboard-only navigation is used | Inputs, menus, dialogs, and actions are operable in logical order |
| CUR-RES-009 | Dialog opens and closes | Focus moves into the dialog and returns to the trigger |
| CUR-RES-010 | Page is checked at desktop and mobile widths | No inaccessible controls, overflow, or hidden primary action |

## Cleanup order

Cleanup must run in reverse dependency order and only against the current E2E marker:

1. Cancel/remove generated homework if supported.
2. Remove test teacher-diary and lesson-plan records if supported.
3. Remove report export records only when a supported cleanup action exists.
4. Delete test syllabus chapters.
5. Remove or archive test subject allocations.
6. Remove or archive the elective group.
7. Remove unused test subject masters.

Locked student elective assignments may not have a supported UI cleanup path. This is why lock testing must use disposable data. Browser deletion requires confirmation at action time.

## Current automation coverage and known gaps

Current repository coverage includes:

- Route smoke checks in `e2e/academic/academic-smoke.spec.ts`.
- Subject and elective-group API lifecycle coverage in `e2e/academic/academic-curriculum-api.spec.ts`.
- Lesson-plan contract/boundary coverage in `e2e/academic/academic-remaining-workflows-api.spec.ts`.
- Subject Creation and Subject Allocation UI specifications under `tests/academic/subject-management/`.

Known gaps that must be tracked before full Curriculum sign-off:

- `/academic/assign-elective-subject` is missing from the current Academic route smoke list.
- `tests/academic/subject-management/` is outside the main Playwright `testDir`, which is `e2e/`.
- Elective Group, Syllabus, Student Elective Assignment, Lesson/Diary, and Reports lack complete browser-driven lifecycle coverage.
- The current lesson-plan API scenario does not prove the complete valid teacher-to-reviewer-to-diary lifecycle.
- Diary approval, diary rejection, and diary change requests report that they are not wired.
- Mark Missed reports that it is not wired.
- Diary evidence is stored in client-side `mockFiles` and is not present in the diary save payload.
- `maxBackdateDays` is not enforced in the diary form, and a new entry is not automatically marked backdated.

## Existing automated preflight commands

Codex can run these from the `Shikshamitra-FE` directory before the final in-app browser smoke:

```powershell
npm run test:e2e:academic:smoke
npx playwright test e2e/academic/academic-curriculum-api.spec.ts
npx playwright test e2e/academic/academic-remaining-workflows-api.spec.ts
npm run test:e2e:all-reports
```

Required environment values should be provided securely through the environment rather than pasted into prompts or committed files:

```text
E2E_BASE_URL
E2E_API_URL or NEXT_PUBLIC_API_URL
E2E_TENANT
E2E_ADMIN_EMAIL
E2E_TEACHER_EMAIL
E2E_PASSWORD
```

## Failure-report format

| Test ID | Route | Role | Result | Evidence | Classification | Defect summary |
|---|---|---|---|---|---|---|
| CUR-SMK-001 | `/academic/...` | Academic Admin | Pass/Fail/Blocked | Screenshot/log | `PRODUCT_BUG`, `TEST_DATA_FAILURE`, etc. | Concise observed-versus-expected description |

Do not label an intermittent or unexplained failure as flaky without evidence.

## Reusable Codex browser prompt

```text
Use the Codex in-app browser to execute the complete Curriculum Management
smoke and edge-case plan in:
e2e/academic/curriculum-management-test-plan.md

Target application: <APP_URL>

Use only a disposable E2E tenant, class, and division. Prefix every record
created in this run with e2e-curr-<timestamp>. Execute active Curriculum routes
in dependency order: Subject Creation, Elective Group Creation, Subject
Allocation, Syllabus, Student Elective Assignment, Lesson Plan/Teacher Diary,
and Curriculum Reports.

Use Academic Admin, Teacher, Reviewer, and restricted-viewer roles. Verify every
mutation through its visible UI result and a full page refresh. Inspect browser
console errors after each workflow. Capture screenshots for failures. Do not
weaken expectations or classify unknown failures as flaky.

Do not lock student elective assignments in shared data. Ask me immediately
before browser deletion or cleanup. Finish with a result table containing test
ID, route, role, result, evidence, failure classification, and defect summary.
```

