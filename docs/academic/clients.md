---
module: academic
domain: clients
content_type: Reference
status: canonical
updated_on: 2026-11-20
owner: frontend-team
audience: humans-and-agents
---

# Trace Academic setup clients

TL;DR: `src/redux/academic-setup/api.ts` persists guide position and reads configuration status; existing module clients continue to save the actual settings.
Use the [backend API reference](../../../Shikshamitra-BE/docs/modules/academic/api.md) for endpoint semantics and authorization.

## Notification rules client

`src/redux/academic-notifications/api.ts` supplies the Rules workspace with the event catalogue, paged effective rules, published template choices, and scoped rule saves. Template choices use a metadata endpoint that also finds published versions when a newer draft exists.

Weekly summary rules pass a weekday as `timing.weeklySummaryDay` alongside the school-local `timing.reminderLocalTime`.
The catalogue cache is keyed by tenant and user. The task reminder reads `manualAvailability` when present. The Rules workspace uses `availability` to show which events can run automatically. The rule cache also includes the requested academic hierarchy, event filter and page. Each request verifies the identity of the session that supplies the token. The request sends the hierarchy and paging fields, and the save sends the current rule concurrency stamp. Successful saves refresh rule queries for the same user and tenant. Rejected saves retain the existing results.

## Notification template client

`src/redux/academic-notifications/template-api.ts` reads templates by event, medium, name search, and page. It loads history and sample previews on demand. Queries key the school and account, and mutations recheck the request owner before sending.

Draft edits and publication send the saved revision stamp. Creating a subsequent draft or restoring default wording sends the template header stamp. Successful revisions refresh template lists, previews, history, and the published choices used by Rules for the same session.

Test send submits just the saved revision ID and stamp. Its queued response provides the operation ID for the sender's Delivery History link.

## Notification delivery and inbox clients

`src/redux/academic-notifications/delivery-api.ts` reads the operation status and paged delivery attempts for an authorized source. A link with an operation ID reads its authorized source before requesting its attempt rows. Staff cancellation refreshes both reads for the same school and user.

`src/redux/academic-notifications/manual-api.ts` submits the source, selected recipient references and channel choices for review. Confirmation submits only the review token and its stable idempotency key. A successful confirmation returns the operation for Delivery History. The same session guard applies to both requests.

`src/redux/academic-notifications/delivery-api.ts` displays the history retry action from its server-provided eligibility flag. Confirmation sends the dispatch ID and the attempt ID from the selected row, then refreshes the operation and history for the same account.

The same client loads assigned approvals by cursor and reads the review for the selected operation when its status exposes `canReviewApproval`. Approval and rejection refresh the queue, review and delivery history for the current account. [Approval API](../../../Shikshamitra-BE/docs/modules/academic/api.md#staff-notification-configuration)
The Student Academic 360 drawer loads its audience only after a staff member chooses an action. The query includes the saved student, event and session owner. The shared composer uses published template options for the returned medium and includes the chosen relationships in the review request.

The submitted Teacher Diary drawer loads available follow-up recipients using the diary ID and the current school and account. Its action sends the selected staff reference through the same preview and confirmation client. See the [diary follow-up contract](../../../Shikshamitra-BE/docs/modules/academic/api.md#teacher-diary-follow-up).

`src/redux/communication/notification-self-api.ts` supplies the dashboard bell's unread count and the drawer's All and Unread pages. Separate requests record reading and acknowledgement. Queries use the current school and account, and changes invalidate only that account's inbox reads. Polling pauses while the page is unfocused.

## Personal notification preferences

`src/redux/communication/notification-self-api.ts` loads category options, linked students and saved preferences when the bell's preferences dialog opens. Each query and save uses the current school and user owner. A save includes the selected category, student context and saved concurrency stamp. The dialog retains drafts on conflict and refreshes the accessible student options if a save is denied.

## Browser notifications

`src/redux/communication/notification/web-push-api.ts` injects the public-key, register and disable operations into the shared authenticated API.
Each operation checks the expected school and account against the session that supplies the request token.
`src/hooks/notifications/web-push-device.ts` stores the browser installation and subscription IDs for the signed-in account.
Account changes and sign-out unsubscribe the browser locally so a previous account's endpoint can stop receiving pushes after its session expires.
The root manifest and `public/notification-sw.js` use the school origin.
The worker displays generic notices and opens or focuses the authenticated dashboard and Notifications drawer.
The worker registers no fetch handler and keeps no authenticated cache.

## Student submission attachments

`studentSubmissionAttachments.tsx` under `src/screens/academic/homework-assignment-management/marksAndFeedback/` displays the selected student's files in homework and assignment evaluation, independently of submission type.
Images use the shared lightbox for zoom/full-screen inspection; PDFs use `DocumentPreviewDialog` with authenticated direct fetching.
Downloads use `fetchProtectedPreview` and retain the original filename.
The section resets when navigating between students and leaves the feedback form mounted while previewing.
The [backend API reference](../../../Shikshamitra-BE/docs/modules/academic/api.md#student-submission-attachments) owns attachment response fields and tenant storage references.

## Guide client

| Hook | Request | Frontend responsibility |
| --- | --- | --- |
| `useAcademicSetupVisitStatusQuery` | `GET /academics/setup/visit-status` | Read whether configuration was visited and setup is accessible; scope the cache key to the tenant and authenticated user. |
| `useRecordAcademicSetupVisitMutation` | `POST /academics/setup/visit` | Record the guide or an included settings visit; invalidate visit status. |
| `useAcademicSetupStateQuery` | `GET /academics/setup/{academicYearId}` | Read cursor, deferred keys, concurrency, and actual configuration states for the selected medium/class scope. |
| `useSaveAcademicSetupProgressMutation` | `PUT /academics/setup/{academicYearId}/progress` | Save guide cursor/deferred state with the current concurrency stamp and update the matching query cache. |

Scope and progress interfaces live in `src/redux/academic-setup/types.ts`.
Selected standard IDs come from the existing timetable forms, rather than a second global class selector.
The guide retains the most recently selected class for review and resets it when academic context changes.

Configuration queries distinguish `configured`, `empty`, `context-required`, and `unavailable`.
A failed status request must not become successful empty configuration or a completed stage.
The state query provides the existing subject, elective-group, timetable, homework, assignment, rubric, grade-scale, and exam-type tags so successful domain mutations refresh guide status.

## Existing configuration clients

All paths below are under `src/redux/academicAPI/` and use the existing shared API.

| Settings | Client | Existing endpoint family |
| --- | --- | --- |
| Subjects | `CurriculumManagementApi/Setting/Core-SubjectApi.ts` | `/academic-mediums/{academicMediumId}/subjects` |
| Elective groups | `CurriculumManagementApi/Setting/Elective-GroupApi.ts` | `/academic-mediums/{academicMediumId}/elective-groups` |
| Weekly lectures | `timetableApi/weeklyLecturesApi.ts` | `/academics/timetable/settings/weekly-lecture-slots` |
| Lecture slots | `timetableApi/lectureSlotsApi.ts` | `/academics/timetable/settings/lecture-slots` |
| Homework types | `HomeworkAssignmentApi/Settings/HomeworkTypesApi.tsx` | `/homework-type` |
| Assignment types | `HomeworkAssignmentApi/Settings/AssignmentTypesApi.tsx` | `/assignment-type` |
| Rubric templates | `HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi.ts` | `/academic/rubrics` |
| Grade scales | `ExaminationApi/examSetting/grade-scalling-api.ts` | `/academics/examination/settings/grading-scales` |
| Exam types | `ExaminationApi/examSetting/exam-type-api.ts` | `/academics/examination/settings/exam-type` |

Preserve each client's parameter casing, response adapter, payload mapper, and cache tags.
The guide does not duplicate these mutations or serialize unsubmitted form fields into progress.
Rubric templates retain their own Save draft and Publish Rubric operations and their `isTemplate` contract.

## Insights dashboard client

`src/redux/academicAPI/academicInsightsApi.ts` reads `GET /academic/dashboard/insights` through the shared authenticated RTK Query API.
The dashboard requires the selected year, board and medium; verified family accounts can additionally select a linked student returned by the service.
`academicInsightsResponse.ts` rejects malformed sections, duplicate keys, non-finite values and invalid timestamps before caching.
Zero remains a real measurement; null metrics and absent samples remain unavailable.

The query key includes academic context, child selection, tenant, user and permission initialization revision.
The identity key is never sent as a request parameter.
`use-academic-insights.ts` renders only `currentData`, clears child selection on context changes, and skips requests without initialized module and dashboard grants.
The active route starts this hook before its lazy dashboard presentation loads, so the request and presentation code load concurrently.
Unused snapshots remain in memory for five minutes. Returning to the same scope reuses the snapshot immediately; snapshots at least one minute old revalidate in the background.
Manual refresh always re-reads the current scope. No snapshot is shared across identity, permission revision, academic context or student keys.
Academic, calendar, class-management and student-attendance mutation tags invalidate active insights.
Refresh and retry re-read the current scope without changing selection.

The new route uses this aggregate response instead of the legacy administrator section calls below.
See the [backend API reference](../../../Shikshamitra-BE/docs/modules/academic/api.md) for authorization and aggregation rules.

## Legacy dashboard section responses

`src/redux/academicAPI/academicDashboardApi.ts` reads the administrator dashboard's curriculum, timetable, and assessment sections.
`admin-dashboard-response.ts` verifies their required numeric metrics are finite and their list fields are arrays before those responses enter the query cache.
Malformed successful responses become section errors with retry; missing metrics are never converted into valid zero scores.
These retained clients and components are not mounted by the Insights dashboard.
Real numeric zeros remain valid for their existing consumers.
`AcademicHealthScoreCard` also renders an unavailable state for a non-finite score, without showing misleading factors or a numeric progress bar.

## Operational read clients

Dated room list, timeline, suggestion and booking requests include the currently selected `academicMediumId` through `useRoomCalendarMedium`.
Room list and timeline cache entries subscribe to `AcademicCalendar` and `AcademicCalendarDay`, so calendar mutations refresh mounted reads and invalidate inactive cached results.
See the [backend calendar context](../../../Shikshamitra-BE/docs/modules/academic/product.md#room-reservation-calendar-context) for authoritative selection and saved-booking behavior.

The [backend read reference](../../../Shikshamitra-BE/docs/modules/academic/references/ui-read-performance.md) owns exact endpoint contracts, counts, compatibility and scope.
These clients replace broad initial reads while retaining existing mutation tags and explicit post-save refreshes.

| Screen or flow | Client or hook | Frontend behavior |
| --- | --- | --- |
| Assign Class Teacher | `src/redux/classManagementApi/classTeacherAssignmentApi/classTeacherAssignmentApi.ts` | Read rows, summary and eligible teachers through one workspace query. |
| Subject and chapter selectors | `src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi.ts`, `src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api.ts` | Request lightweight lookup options; management lists keep full records. |
| Copy Subject Allocations | `src/screens/academic/curriculum-management/subjectAssignment/component/subject-copy-dialog/useEligibleCopyClasses.ts` | Eligibility checks use non-subscribing imperative queries. Closing the dialog does not retain background subscriptions that refetch candidate classes after later mutations. |
| Lesson List, Teacher Diary and Review Queue | `src/screens/academic/course-management/lessonPlan/hooks/use-lesson-plan-workspace.ts` | Send current page/search/filter/sort and visible search columns; use global response counts/options and only page-associated diaries. Review queue is independent of selected medium. |
| Rubric templates | `src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricTemplateReadApi.ts`, `src/screens/academic/homework-assignment-management/setting/rubricConfig/hooks/useRubricTemplateDetails.ts` | Page summary rows; fetch criterion details only for the selected action. |
| Rubric scoring | `src/screens/academic/homework-assignment-management/marksAndFeedback/useRubricEvaluationQueries.ts` | Read the selected submission/student evaluation; refresh the saved evaluation chain after mutations. |
| Evaluation and Feedback | `HomeworkAssessmentAndFeedbackApi.ts`, `AssignmentAssessmentAndFeedbackApi.ts`, `marksAndFeedback/evaluationSubmissionDetail.tsx` | Request `Lightweight=true` for the complete scalar roster and summary. Keep local cohort filtering, sorting, exports and previous/next navigation. Read answer text and attachments only for the selected student; current-query data prevents a previous student's content appearing while selection changes. Backend contracts remain in the [read reference](../../../Shikshamitra-BE/docs/modules/academic/references/ui-read-performance.md#read-contracts). |
| Elective assignments and exam readiness | `src/redux/classManagementApi/studentElectiveAssignment/studentElectiveAssignment.ts`, `src/screens/examination/scheduleExam/components/use-elective-readiness.ts` | Reuse shared options and grouped selection counts instead of downloading student selections to count them. |
| Locked elective corrections | `studentElectiveAssignment.ts`, `electiveCorrectionTypes.ts`, `assignElectiveSubject/hooks/useLockedElectiveCorrection.ts` | Typed preview/confirm mutations use the roster capability and backend review token. Confirmation invalidates elective assignment and timetable tags; preview does not mutate or invalidate data. |
| Rooms and approvals | `src/redux/academicAPI/timetableApi/roomAvailabilityApi.ts`, `src/screens/academic/timetable-schedule-management/roomAvailability/useRoomReservationPage.ts` | Page active reservation/approval views; read badge summaries separately; mount audit reads on demand. Room Availability filters use `getRoomBuildingLookup` at `/academics/timetable/room-availability/buildings/lookup`, with the existing building cache tag, instead of the Institute Setup management list. See the [backend lookup contract](../../../Shikshamitra-BE/docs/modules/academic/references/ui-read-performance.md#read-contracts). |
| Weekly timetable room assignment | `src/components/timetable/useWeeklyRoomOptions.ts`, `getWeeklyTimetableRooms` in `roomAvailabilityApi.ts` | Send the weekly day and period times without a calendar date. Read current-query options, preserve saved choices, retry failed reads and validate prospective assignments before applying them. Room catalogue and timetable mutations invalidate these options. See the [backend room read contract](../../../Shikshamitra-BE/docs/modules/academic/references/ui-read-performance.md#read-contracts). |
| Student Academic 360 drawer | `src/screens/academic/student-academic-360/hooks/useStudentAcademic360Detail.ts` | Query only while open; reset filters/page on student or tab changes. Overview requests 10 tasks/5 exams; detail pages request 20 tasks or 10 exams and retain historical pagination. |
| Published seating and subject-card teachers | `src/screens/examination/seatingPlan/guided/published/use-published-seating-data.ts`, `src/screens/academic/curriculum-management/subjectAssignment/component/subjectAssignmentForm/hooks/useTeacherSelection.ts` | Keep reusable plan roster queries and delay optional teacher detail reads until needed. |

Lesson, rubric and reservation tables cap visible page size at 100.
Their export hooks collect every matching page with the current criteria and cancellation support, rather than exporting only visible rows.
Lesson and reservation exports fetch batches of 250; rubric export fetches batches of 100.
Existing server refresh choices remain explicit; a warm cache does not replace required save invalidation.

## Report preview and download lifecycle

`src/redux/academicAPI/AcademicReportApi.ts` consumes completed exports as native Blobs, retaining content type and filename headers.
`src/screens/academic/components/reports/useAcademicReportDownload.ts` owns job creation, serialized status polling and download coordination for the active preview drawers as well as report-list downloads. It aborts pending work and stops timers on unmount/account changes, ignores stale completions and backs off transient failures. A creation response arriving after close cannot install a new polling loop. Creating, generating and downloading states remain visible in the owning drawer.

The report recovery screen uses owner-keyed status and regenerate endpoints in `AcademicReportApi.ts`. It polls only while the replacement is queued or running and uses the same authenticated download path when the file is ready.
Completed jobs download directly without creating another export.
Curriculum previews, including the active timetable and homework consumers of that shared drawer, retain the protected native download route. Generated Examination previews retain their Blob download behavior.

Curriculum history View uses `hooks/useCurriculumReportPreview.ts` to fetch fresh job details before opening the drawer.
History summaries omit `requestJson`; the detail request supplies the saved parameters. Pascal-case stored DTO keys and camel-case keys normalize to the preview request without dropping class, division, subject or chapter filters.
Pending detail reads disable View; missing/malformed parameters and failed reads show shared feedback without issuing an unfiltered preview. Unmounts and account changes prevent late responses from opening a drawer.
The drawer keeps the completed PDF job ID, so Download PDF retrieves that file instead of queuing another export. The preview queries current records using saved filters; the PDF remains the generated snapshot.

Curriculum, timetable, homework/assignment and Examination lists mount only the selected preview drawer.
Opening a paged preview begins at page one without first requesting the previous page.
Optional PDF renderers load when their export action is used.
Report generation and download semantics remain owned by the backend reference.

## Timetable conflict messages

`src/components/timetable/timetableValidationIssues.ts` formats the backend's structured teacher and room conflicts. Optional `ConflictingAcademicYearName`, `ConflictingEducationBoardName`, and `ConflictingEducationMediumName` appear beside the competing class and in issue details. Both Pascal-case and camel-case fields are accepted; older responses retain their class/division wording. These labels identify the competing timetable, which can belong to another board or medium. See the [backend context contract](../../../Shikshamitra-BE/docs/modules/academic/api.md#timetable-conflict-context).

## Division room defaults in the timetable

`src/components/timetable/useDivisionRoomDefaults.ts` subscribes to the division lookup from
`src/redux/division/divisionApi.ts`. Saving a division already invalidates its `Division` tag;
the timetable consumes the refreshed result and resolves the current room through the room-detail API.
Opening the builder and returning browser focus refresh the division lookup.
Pending, failed, cleared or superseded lookups cannot apply the previous default to new lectures.
The default fills only unassigned lecture rooms; saved room assignments and lecture overrides remain intact.
