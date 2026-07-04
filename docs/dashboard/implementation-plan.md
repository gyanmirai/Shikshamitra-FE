# Role-Based Dashboard Implementation Plan

Last verified against repo: 2026-06-25.

Related PRD: [prd.md](prd.md)
Start-here overview: [README.md](README.md)

## Summary

Implement the Dashboard PRD in controlled phases so `/dashboard` evolves from placeholder role screens into a template-driven ERP command center. The first releases stay frontend-safe with mock/adapted data, then progressively add permission filtering, stable test coverage, and backend-ready contracts before real module integrations.

## Key Changes

| Area | Implementation direction |
| --- | --- |
| Template model | Add five dashboard templates: `Leadership`, `Principal/Admin`, `Teacher`, `Finance/HR`, `Student/Parent`. |
| Role resolution | Resolve session roles to templates, with seeded-role fallback until Security owns explicit mapping. |
| Shared shell | Render standard dashboard zones for KPIs, actions, risks, charts, calendar, announcements, and drilldowns. |
| Permission safety | Filter widgets by required permissions using existing frontend permission helpers. |
| Data contract | Add a frontend adapter for the PRD contract without locking final backend endpoint names. |
| Drilldowns | Keep existing module dashboards and operational screens as drilldown destinations. |

## Phases And Gates

| Phase | Work | Quality gate |
| --- | --- | --- |
| 0. Baseline and documentation | Capture current behavior and keep dashboard scope isolated from nav/layout/logo changes. | `npm run ts`, `npm run lint`, `npm run build` |
| 1. Template foundation | Add template types, resolver, registry, demo/dev switcher, and test IDs. | Resolver unit tests, TypeScript, lint, build |
| 2. Shared shell | Add reusable zones, empty/loading/error states, and five template views. | Component/unit tests and E2E smoke for all templates |
| 3. Permission and scope safety | Add widget metadata and permission filtering; document UserScope expectations. | Permission unit tests and limited-permission E2E |
| 4. Data contract and adapter | Add adapter for `dashboardTemplate`, `academicYearId`, `dateRange`, `kpiCards`, `actionItems`, `riskAlerts`, `calendarItems`, `moduleSnapshots`, `announcements`, and `drilldownUrl`. | Adapter contract tests and mocked-response E2E |
| 5. Progressive module integration | Phase E starts this path with `GET /api/dashboard/summary`, live scoped student attendance for Leadership/Principal templates, API fallback, and academic readiness drilldowns. Phase F adds selected action queue counts. Phases G-K add Finance/HR snapshots, visible Calendar items, Transport/Security readiness widgets, local compliance readiness, and safe Teacher/StudentParent readiness behavior. | Backend API tests, adapter tests, targeted E2E, TypeScript, lint, build per slice |
| 6. Full dashboard sign-off | Validate templates, permissions, drilldowns, API failure states, and responsive layout. | `npm run test`, `npm run ts`, `npm run lint`, `npm run build`, `npm run test:e2e -- e2e/dashboard` |
| 7. Rollout and cleanup | Hide demo switcher in production, remove production mocks when real APIs exist, add technical/testing docs. | No unrelated shared UI drift, no unintended `next-env.d.ts` change, dashboard E2E passing |

## Test Plan

| Test type | Coverage |
| --- | --- |
| Unit | Template resolver fallback and priority behavior; widget permission filtering; adapter mapping and safe drilldown handling. |
| Component | Zone empty states, visible widget lists, action/drilldown rendering, loading and partial failure states. |
| E2E | `/dashboard` renders for authenticated user, all five templates render in dev/test override, permission-limited users do not see unauthorized widgets, drilldowns route correctly, API failures do not blank the page, desktop/mobile smoke tests. |

## Assumptions

- First implementation is frontend-led and can use mock/adapted data until backend dashboard aggregation exists.
- Security module will eventually own custom role to dashboard-template mapping.
- Existing module dashboards remain valid drilldown destinations.
- No broad nav, layout, logo, or unrelated styling changes should be included.
- `next-env.d.ts` may be changed by build tooling and should be restored if it is not part of intentional work.

## Phase E Notes

- The first backend-backed path is `GET /api/dashboard/summary`.
- The endpoint is authorized by `ShikshaMitraModulePermissions.Dashboard`.
- Server-side filtering emits only permitted registered widgets; frontend filtering remains defense in depth.
- Live attendance uses the existing scoped student attendance dashboard summary service and maps only to `leadership-attendance` and `principal-student-attendance`.
- Academic content remains readiness/drilldown-based until reliable academic aggregate APIs exist.
- API failure falls back to mock dashboard data with `source = apiFallback` and a visible warning.

## Phase F Notes

- The first live action queue slice enriches existing action widgets from module-owned readers without changing module workflows.
- Admission approval counts use scoped student records and count students in `Admission` status.
- HR leave action counts use the scoped HR employee/leave readers, and payroll action counts use the existing payroll readiness reader.
- Finance reconciliation counts use the existing reconciliation tab-count service when an academic year context is available.
- The dashboard still emits only registered widget IDs and still filters the response server-side before labels, counts, values, or links leave the backend.
- At Phase F, Teacher class attendance and Student/Parent document actions remained readiness/drilldown placeholders until class assignment and student/parent identity mapping were reliable.

## Phase G-K Roadmap

Phase G-K execution is documented in [phase-g-to-k-roadmap.md](phase-g-to-k-roadmap.md):

- Phase G: Finance, fee, and payroll snapshot.
- Phase H: Calendar and announcements.
- Phase I: Transport, security, and safety exceptions.
- Phase J: Compliance readiness.
- Phase K: Teacher and Student/Parent personalization.

## Phase G-K Notes

- Finance/HR widgets now enrich existing registered widgets from scoped fee receipt, dues, concession, payroll, and HR attendance sources.
- Calendar enrichment uses the existing Calendar view reader. Announcements stay readiness/drilldown-only until a scoped announcement summary feed exists.
- Transport and Security widgets are permission-gated readiness/drilldowns only; no operational counts are invented without scoped aggregate sources.
- Compliance readiness is local ERP readiness for scoped APAAR, PEN, and UDISE fields. It does not imply official external portal status.
- Teacher and Student/Parent templates remain readiness/drilldown-first where personal identity mapping is not yet reliable. Student/Parent widgets must not display school-wide aggregates as personal data.

## Phase L-M Notes

- Phase L adopts `GET /api/dashboard/widgets` as the preferred runtime widget metadata source in API mode. The frontend registry remains a fallback for metadata fetch failures or incomplete metadata.
- Phase M adds limited Teacher personalization from trusted `Employee.UserId` mapping and scoped class-teacher assignments only.
- Phase M did not add Student/Parent live values; the current exact-email Student/Parent slice is documented below.
- Backend permission filtering remains authoritative; frontend filtering remains defense in depth.

## Phase N Notes

- Phase N adds the first live Teacher academic workload signal without changing dashboard endpoints or frontend contract fields.
- The backend updates only `teacher-homework` for mapped Teacher users.
- The live count is limited to creator-owned, UserScope-filtered homework/assignment submissions pending review.
- This is not total teacher workload: admin-created tasks, inferred subject-teacher assignments, missing submissions, exam evaluation, class attendance, and class performance remained readiness/drilldown-only in Phase N.

## Phase O Notes

- Phase O hardens dashboard reliability without adding a new live module integration.
- Backend summary slices now have explicit registration metadata for name, order, affected zone, and fallback warning message.
- Unexpected slice exceptions restore the dashboard to its pre-slice base/readiness state, add `zoneErrors`, and continue permission filtering instead of failing the whole summary response.
- Communication announcements, Transport/Security exception counts, and broader Student/Parent transport/safety signals remain blocked until module-owned scoped sources exist.

## Current Completion Slice Notes

- Student/Parent now extends the exact-email personal slice to `student-assignments` and `student-academic-summary`.
- `student-assignments` counts existing personal learning-task submission rows that are open or awaiting review.
- `student-academic-summary` shows the latest personal published/frozen exam result summary.
- Teacher now extends assigned-class personalization to `teacher-attendance` with missing attendance action counts for the selected date.
- Teacher now extends assigned-class personalization to `teacher-class-performance` with published/frozen result pass-rate when Academic result permission is granted.
- Teacher now extends Academic exam personalization to `teacher-exam-evaluation` with pending exam marks workflow counts only for scoped `TeacherSubjectAllocation` rows.
- Student/Parent transport, safety, richer assignment feeds, and class-performance/risk summaries remain readiness/drilldown-only until trusted module-owned personal sources exist.
