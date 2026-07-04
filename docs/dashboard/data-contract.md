# Dashboard Data Contract

## Purpose

`/dashboard` reads through a frontend data source layer before rendering any template. As of Phase E, the default source is the backend dashboard summary API. Mock data and contract-preview payloads still use the same adapter path, so fallback and test data follow the same normalization, registry enrichment, and permission-filtering rules as API data.

As of Phase L, API-mode dashboards also request backend widget metadata from `GET /api/dashboard/widgets`. Backend metadata is preferred for `requiredPermissions`, `drilldownUrl`, and `owner`; the frontend registry remains a fallback if metadata is unavailable or incomplete.

This document is a dashboard contract note. It records the frontend-facing contract and the Phase E backend summary endpoint, but does not define future caching, persisted preview, background refresh, or every downstream module DTO.

## Contract Shape

The frontend dashboard contract remains:

| Field | Purpose |
| --- | --- |
| `dashboardTemplate` | Resolved template for the current user. |
| `academicYearId` | Optional academic year context for the displayed data. |
| `dateRange` | Display range label and optional `from` / `to` dates. |
| `kpiCards` | School pulse widgets. |
| `actionItems` | Pending work and approvals. |
| `riskAlerts` | Risk, exception, and compliance widgets. |
| `calendarItems` | Calendar items relevant to the user. |
| `moduleSnapshots` | Drilldowns into existing module dashboards or routes. |
| `announcements` | School communication and notice widgets. |
| `drilldownUrl` | Relative in-app route attached to an actionable widget. |

The backend response also includes `zoneErrors`, keyed by dashboard zone, outside the `DashboardDataContract`. Zone errors allow one backend slice to fail without blanking the full dashboard.

Every visible widget must be actionable through a safe relative `drilldownUrl` or accountable through an `owner`.

## Phase E Backend Endpoint

`GET /api/dashboard/summary`

Query:

| Parameter | Rule |
| --- | --- |
| `dashboardTemplate` | Required by the frontend; valid values are `leadership`, `principalAdmin`, `teacher`, `financeHr`, and `studentParent`. |
| `academicYearId` | Optional academic year context. |
| `from` / `to` | Optional `yyyy-MM-dd` range. When omitted, the backend defaults to month-to-date using server time. |

Backend rules:

- Requires `ShikshaMitraModulePermissions.Dashboard`.
- Invalid template or invalid date range returns `400`.
- Missing Dashboard permission returns `403`.
- Backend emits only known dashboard widget IDs that are already registered in the frontend widget registry.
- Backend filters labels, values, counts, and links by server-side permissions before returning widgets.
- Widget permissions must authorize the returned drilldown. For example, student attendance widgets that link to `/student/attendance/take-attendance` require Mark Attendance permission; Student Records permission alone must not expose that action link. Broad module grants also must not expose leaf drilldowns such as `/calendar/view` or `/communication/dashboard` unless the corresponding route guard permission is present.
- Frontend permission filtering remains defense in depth.

## Phase L Widget Metadata Endpoint

`GET /api/dashboard/widgets`

Backend rules:

- Requires `ShikshaMitraModulePermissions.Dashboard`.
- Returns backend-owned widget metadata for known dashboard widget IDs.
- The frontend normalizes the metadata before use and drops invalid zones, missing permission arrays, and unsafe non-relative or protocol-relative drilldown URLs.
- Metadata request failure does not blank `/dashboard`; the frontend falls back to the local widget registry.
- The local frontend registry remains temporary until widget metadata is generated/shared or the backend owns all widget metadata end to end.

## Adapter Responsibilities

- Normalize missing arrays to empty dashboard zones.
- Fall back to the resolved template when a payload sends an unknown template.
- Normalize missing or invalid `dateRange` values to `Today`.
- Drop unsafe non-relative or protocol-relative `drilldownUrl` values from raw payloads.
- Apply backend widget metadata after payload mapping when available; otherwise apply the frontend widget registry fallback.
- Keep only known `zoneErrors` keys: `kpis`, `actions`, `risks`, `modules`, `calendar`, and `announcements`.
- Leave final permission filtering to the existing dashboard permission layer.

Widget metadata from the backend metadata endpoint is preferred for `requiredPermissions`, `drilldownUrl`, and `owner`. Unknown widgets are hidden when permission enforcement is active.

## Data Sources

- `api`: default source. Reads `GET /api/dashboard/summary`.
- `apiFallback`: API failed, so the dashboard renders mock data with a warning.
- `mock`: explicit local/dev source requested with `?dashboardDataSource=mock`; production access requires `NEXT_PUBLIC_ENABLE_DASHBOARD_MOCK_SOURCE=true`.
- `contractPreview`: dev/test-only mode requested with `?dashboardDataSource=contractPreview`.
- `contractPreviewFallback`: preview mode failed, so the dashboard renders mock data with a warning.

In `api` mode, summary data and widget metadata are fetched separately. Summary API failure triggers `apiFallback`; metadata API failure does not change the source and only uses local registry fallback.

The current preview path is `/api/dashboard/contract-preview`. It is a frontend test seam for Playwright and is not a committed backend route. Do not wire production backend work to this path without replacing it through the later dashboard technical specification.

## Phase E Live Scope

- Student attendance is the first live aggregate slice.
- The backend maps scoped attendance percentage into `leadership-attendance` and `principal-student-attendance`.
- The backend calls the existing student attendance summary service so existing UserScope logic applies.
- Student/Parent personal attendance is never populated from school-wide attendance. The current live Student/Parent slice only uses the exact-email identity rule described below.
- Academic widgets are readiness/drilldown-only in Phase E. They remain actionable through `/academic/dashboard`; no new academic aggregate API is introduced.

## Phase F Action Queue Scope

- `leadership-admission-approvals` is backed by scoped students in `Admission` status.
- `principal-pending-admissions` uses the same scoped admission count as a KPI for Principal/Admin.
- `principal-leave-approvals` and `hr-leave-approvals` are backed by scoped HR employee and leave readers.
- `leadership-payroll-review` is backed by the existing HR payroll readiness reader.
- `finance-reconciliation` is backed by the existing Finance reconciliation tab-count service when `academicYearId` is a valid GUID.
- Slice failures are returned through `zoneErrors.actions` or `zoneErrors.kpis`; successful zones remain usable.
- No action widget should invent a live count when the owning module does not yet expose a safe scoped source.

## Phase G-K Backend Scope

- Phase G adds live Finance/HR snapshot enrichment through the existing dashboard summary endpoint:
  - `leadership-fee-collection` uses scoped fee receipts for the selected range when `academicYearId` is valid.
  - `finance-collection` uses scoped fee receipts for the requested `to` date.
  - `finance-dues` uses scoped due records for the requested year.
  - `finance-concession-impact` counts scoped pending concession requests.
  - `finance-dashboard` summarizes today's scoped collection, due-student follow-up count, and pending concession reviews.
  - `principal-teacher-attendance` uses scoped active teaching-employee attendance records for the requested `to` date.
  - `hr-payroll-readiness` uses the existing HR payroll readiness reader.
  - `hr-staff-attendance` uses scoped active employee attendance records.
  - `hr-dashboard` summarizes payroll readiness and staff attendance health from the same scoped HR sources.
- Phase H uses `CalendarViewReadService` for the next visible Calendar event/holiday when `academicYearId` and Calendar permission are available. Announcement widgets remain readiness/drilldown-only because the current Communication backend exposes announcement type settings, not a scoped announcement summary feed.
- Phase I adds permission-gated readiness/drilldown widgets for `principal-transport-applications` and `principal-security-dashboard`. No transport, route, visitor, or gate-pass counts are invented because no scoped dashboard aggregate source exists yet. `student-transport-alert` is registered but intentionally not emitted until personal route identity mapping exists.
- Phase J enriches `leadership-compliance` with local, scoped APAAR, PEN, and UDISE readiness when the user has student identity compliance permission. This is local ERP readiness only, not official UDISE+, APAAR, CBSE, or safety certificate portal status.
- Phase K remained safety-first before exact-email Student/Parent personalization was added:
  - Teacher widgets stay readiness/drilldown-only until authenticated user to teacher/employee assignment and class scope can be proven.
  - At that point, Student/Parent widgets stayed readiness/drilldown-only until authenticated user to student/guardian mapping was reliable.
  - Student/Parent cards must not use school-wide attendance, transport, fee, or academic aggregates as personal data.

## Phase M Personalization Scope

- Teacher personalization uses `Employee.UserId` to resolve the authenticated user to exactly one active employee.
- Teacher live enrichment includes scoped class-teacher assignment context for `teacher-classes` and `teacher-student-risk`.
- `teacher-attendance` counts assigned class divisions whose attendance is not marked for the selected `dateRange.to` date when the mapped teacher has Student Attendance permission.
- `teacher-class-performance` shows assigned-class published/frozen result pass-rate when the mapped teacher has Academic Dashboard and Result Creation permissions.
- At Phase M, Teacher homework and exam evaluation stayed readiness/drilldown-oriented unless later phases could prove narrower scoped sources. Current live limits are recorded in the Phase N and Current Teacher Exam Evaluation sections below.
- Student/Parent personalization uses a conservative exact-email resolver until a durable student/guardian-to-user mapping exists.
- The resolver returns live values only when the authenticated email matches exactly one enrolled student's contact email or one parent/guardian email. No match, non-enrolled match, or multiple matches keeps readiness/drilldown-only widgets.
- Student/Parent widgets must not display school-wide attendance, transport, fee, academic, or safety data as personal values.

## Phase N Teacher Learning-Task Workload

- Phase N keeps the same `GET /api/dashboard/summary` and `GET /api/dashboard/widgets` contracts.
- The backend updates only the existing `teacher-homework` widget for `dashboardTemplate=teacher`.
- The live value is limited to pending review submissions for `HomeworkAssignmentEntity` and `AssignmentEntity` rows where `CreatorId == CurrentUser.Id`.
- The backend first resolves the current user to exactly one active employee through `Employee.UserId`; unmapped or ambiguous users keep readiness widgets.
- The backend applies UserScope to homework and assignment rows before counting submissions.
- Pending review means submitted, late, or needs-review submission rows without review/grading completion.
- This is creator-owned learning-task review, not total assigned teacher workload.
- Admin-created tasks, other-user-created tasks, inferred subject-teacher workload, missing submissions, exam evaluation, class attendance, and class performance remain out of scope.
- Student/Parent homework/assignment widgets remain limited to exact-email personal rows until Academic exposes richer personal assignment feeds.

## Current Teacher Exam Evaluation Scope

- `teacher-exam-evaluation` uses existing `TeacherSubjectAllocation` rows to resolve the mapped teacher to standard, division, and subject.
- The backend applies UserScope to those teacher-subject allocations through the academic organization hierarchy before counting any workflow rows.
- The live count uses existing `ExamMarksWorkflowState` rows joined to `Exam.StandardId`; only workflows for the teacher's scoped standard/division/subject allocations are counted.
- `Published` workflows are excluded. Draft, submitted, verified, or other non-published states are counted as pending marks workflow action.
- If the teacher is unmapped, has no scoped teacher-subject allocation, or lacks Record Marks permission, the widget remains readiness-only or is hidden by permission filtering.

## Phase O Reliability Hardening

- Phase O keeps `GET /api/dashboard/summary`, `GET /api/dashboard/widgets`, dashboard DTOs, and frontend contract fields unchanged.
- Backend summary slices are registered with an explicit name, order, affected zone, and fallback warning message.
- If a slice throws unexpectedly, the backend restores dashboard widgets to the pre-slice base/readiness state, records a `zoneErrors` entry for the affected zone, logs the failure, and continues to server-side permission filtering.
- Existing slice-level partial failures still use `zoneErrors`; successful zones remain usable.
- Announcements and Transport/Security exception counts remain readiness/drilldown-only until their owning modules expose scoped sources. Student/Parent personalization remains limited to the exact-email personal slice below.

## Current Student/Parent Personalization Scope

- `dashboardTemplate=studentParent` resolves the current user by `CurrentUser.Email`.
- The resolver matches against `Student.ContactDetail.Email`, `Student.FamilyDetail.FatherDetails.Email`, `MotherDetails.Email`, and `GuardianDetails.Email`.
- Live values are emitted only when the match resolves to exactly one `Enrolled` student. Ambiguous emails and missing mappings keep the base readiness widgets.
- `student-attendance` shows personal attendance percentage from existing `AttendanceEntry` and `AttendanceDay` rows in the selected date range.
- `student-assignments` shows personal open learning-task submission rows from existing `StudentSubmissionEntity` records. It is a status signal for rows that are open or awaiting review, not a complete assignment-feed replacement.
- `student-fee-status` shows outstanding personal fee amount from existing `DueFee` rows.
- `student-document-update` shows required-document follow-up from existing student document types and uploaded `StudentDocument` rows.
- `student-academic-summary` shows the latest published/frozen personal exam result detail from existing `ExamResultHeader` and `ExamResultDetail` rows.
- `student-transport-alert`, safety values, richer assignment details, and personal class-performance/risk summaries remain readiness/drilldown-only until the owning modules expose trusted personal sources.

## Current Student And Academic Completion Scope

- `leadership-total-students` is live for `dashboardTemplate=leadership` when the user has Student Records permission.
- The live total counts only scoped `Student` rows in `StudentLifeCycleStatusEnum.Enrolled`; admissions, registration, inquiries, inactive, and left students stay in their existing module/action contexts.
- `principal-curriculum` is live for `dashboardTemplate=principalAdmin` when the user has Academic chapter-management permission.
- `leadership-academic-health`, `principal-weak-classes`, and `principal-academic-dashboard` are live when the user has Academic Dashboard permission. `principal-weak-classes` is a curriculum pacing risk signal, not a student result/performance aggregate.
- The live curriculum percentage and pacing risk use scoped academic organization rows, published `AssignedSubject` records, `AssignedSubjectChapter` rows, scoped divisions, planned chapter end dates, and the most recent `ChapterProgress` row for each chapter/division pair.
- `principal-academic-dashboard` also surfaces a scoped exam marks workflow backlog when the user has Academic Dashboard and Record Marks permission. It counts existing `ExamMarksWorkflowState` rows joined to scoped exam standard/division pairs where marks have not reached `Published`.
- `principal-academic-dashboard` also surfaces scoped published/frozen result outcome when the user has Academic Dashboard and Result Creation permission. It reads existing `ExamResultHeader` and `ExamResultDetail` rows, applies UserScope by division, excludes absent students from appeared counts, treats `Pass` and `Compartment` as passed, and reports pass-rate plus failed-student follow-up.
- Student-level outcome risk and broader class-performance analytics remain readiness/drilldown-only until Academic exposes reliable scoped aggregate readers for those workflows. Teacher currently receives assigned-class attendance action count, assigned-class result pass-rate, and scoped assigned-subject exam marks workflow count; Student/Parent currently receives only the latest exact personal published/frozen result summary described above.

## UserScope Requirement

Frontend permission gating is UI safety only. Backend dashboard aggregation must apply UserScope before returning counts, lists, calendar items, risks, or module snapshots.

Aggregates for student, academic, HR, finance, safety, transport, compliance, and communications data must not bypass module-level scope rules. The dashboard should only summarize data the current user could inspect through the owning module.
