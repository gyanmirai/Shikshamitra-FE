---
module: academic
domain: clients
content_type: Reference
status: canonical
updated_on: 2026-10-30
owner: frontend-team
audience: humans-and-agents
---

# Trace Academic setup clients

TL;DR: `src/redux/academic-setup/api.ts` persists guide position and reads configuration status; existing module clients continue to save the actual settings.
Use the [backend API reference](../../../Shikshamitra-BE/docs/modules/academic/api.md) for endpoint semantics and authorization.

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

The [backend read reference](../../../Shikshamitra-BE/docs/modules/academic/references/ui-read-performance.md) owns exact endpoint contracts, counts, compatibility and scope.
These clients replace broad initial reads while retaining existing mutation tags and explicit post-save refreshes.

| Screen or flow | Client or hook | Frontend behavior |
| --- | --- | --- |
| Assign Class Teacher | `src/redux/classManagementApi/classTeacherAssignmentApi/classTeacherAssignmentApi.ts` | Read rows, summary and eligible teachers through one workspace query. |
| Subject and chapter selectors | `src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi.ts`, `src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api.ts` | Request lightweight lookup options; management lists keep full records. |
| Lesson List, Teacher Diary and Review Queue | `src/screens/academic/course-management/lessonPlan/hooks/use-lesson-plan-workspace.ts` | Send current page/search/filter/sort and visible search columns; use global response counts/options and only page-associated diaries. Review queue is independent of selected medium. |
| Rubric templates | `src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricTemplateReadApi.ts`, `src/screens/academic/homework-assignment-management/setting/rubricConfig/hooks/useRubricTemplateDetails.ts` | Page summary rows; fetch criterion details only for the selected action. |
| Rubric scoring | `src/screens/academic/homework-assignment-management/marksAndFeedback/useRubricEvaluationQueries.ts` | Read the selected submission/student evaluation; refresh the saved evaluation chain after mutations. |
| Elective assignments and exam readiness | `src/redux/classManagementApi/studentElectiveAssignment/studentElectiveAssignment.ts`, `src/screens/examination/scheduleExam/components/use-elective-readiness.ts` | Reuse shared options and grouped selection counts instead of downloading student selections to count them. |
| Rooms and approvals | `src/redux/academicAPI/timetableApi/roomAvailabilityApi.ts`, `src/screens/academic/timetable-schedule-management/roomAvailability/useRoomReservationPage.ts` | Page active reservation/approval views; read badge summaries separately; mount audit reads on demand. |
| Weekly timetable room assignment | `src/components/timetable/useWeeklyRoomOptions.ts`, `getWeeklyTimetableRooms` in `roomAvailabilityApi.ts` | Send the weekly day and period times without a calendar date. Read current-query options, preserve saved choices, retry failed reads and validate prospective assignments before applying them. Room catalogue and timetable mutations invalidate these options. See the [backend room read contract](../../../Shikshamitra-BE/docs/modules/academic/references/ui-read-performance.md#read-contracts). |
| Student Academic 360 drawer | `src/screens/academic/student-academic-360/hooks/useStudentAcademic360Detail.ts` | Query only while open; reset filters/page on student or tab changes. Overview requests 10 tasks/5 exams; detail pages request 20 tasks or 10 exams and retain historical pagination. |
| Published seating and subject-card teachers | `src/screens/examination/seatingPlan/guided/published/use-published-seating-data.ts`, `src/screens/academic/curriculum-management/subjectAssignment/component/subjectAssignmentForm/hooks/useTeacherSelection.ts` | Keep reusable plan roster queries and delay optional teacher detail reads until needed. |

Lesson, rubric and reservation tables cap visible page size at 100.
Their export hooks collect every matching page with the current criteria and cancellation support, rather than exporting only visible rows.
Lesson and reservation exports fetch batches of 250; rubric export fetches batches of 100.
Existing server refresh choices remain explicit; a warm cache does not replace required save invalidation.

## Report preview and download lifecycle

`src/redux/academicAPI/AcademicReportApi.ts` consumes completed exports as native Blobs, retaining content type and filename headers.
`src/screens/academic/components/reports/useAcademicReportDownload.ts` shares job polling across report lists, stops timers on unmount/account changes, ignores stale completions and backs off transient failures.
Completed jobs download directly without creating another export.

Curriculum, timetable, homework/assignment and Examination lists mount only the selected preview drawer.
Opening a paged preview begins at page one without first requesting the previous page.
Optional PDF renderers load when their export action is used.
Report generation and download semantics remain owned by the backend reference.
