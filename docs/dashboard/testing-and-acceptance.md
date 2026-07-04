# Dashboard Testing And Acceptance

## Production Readiness Scope

This acceptance note covers the role-based `/dashboard` foundation through Phase O plus the current Student Records, Student/Parent, and Academic curriculum/exam/result slices. It verifies the dashboard shell, template resolver, permission filtering, frontend data adapter, backend summary API, backend widget metadata, API fallback, dev/test contract preview, live student records, live student/teaching-staff attendance, live action queue counts, live Academic curriculum completion/health/pacing signals, Principal/Admin exam workflow and result outcome signals, Finance/HR snapshots, visible Calendar item enrichment, local compliance readiness, permission-gated Transport/Security readiness, limited Teacher personalization, limited Student/Parent personalization, backend slice failure isolation, and E2E behavior against DDVS seeded users.

Live integration is intentionally limited to existing scoped or exact personal sources. Student Records uses scoped enrolled-student rows. Academic curriculum completion, academic health, and pacing risk use scoped published subject assignments, chapters, divisions, planned chapter end dates, and chapter-progress rows. Principal/Admin academic exam workflow backlog uses scoped `ExamMarksWorkflowState` rows that have not reached `Published`. Principal/Admin result outcome uses scoped published/frozen `ExamResultHeader` and `ExamResultDetail` rows. Teacher homework workload is limited to creator-owned homework/assignment submissions pending review, Teacher attendance is limited to assigned-class missing attendance action count, Teacher class performance is limited to assigned-class published/frozen result pass-rate, and Teacher exam evaluation is limited to scoped `TeacherSubjectAllocation` rows joined to pending `ExamMarksWorkflowState` records. Student/Parent personalization is limited to exact single enrolled-student email resolution for attendance, open learning-task submissions, outstanding fees, required-document action, and latest published/frozen result summary. Broader Academic student-level risk summaries, announcements, Transport/Security exception counts, broad Teacher workload, and Student/Parent transport/safety values remain readiness/drilldown-only until reliable module-owned aggregate or identity mapping sources exist.

## Acceptance Checklist

| Requirement | Evidence |
| --- | --- |
| `/dashboard` renders through the shared template shell. | Component tests cover all five templates; browser E2E coverage exists, with local browser sign-off tracked below. |
| All five templates are reachable in dev/test override. | `e2e/dashboard/dashboard-smoke.spec.ts` covers `leadership`, `principalAdmin`, `teacher`, `financeHr`, and `studentParent`; API smoke validates the same template set when local browser tooling is blocked. |
| Production rendering does not depend on manual role switching. | `main-dashboard.tsx` guards the template switcher behind non-production or `NEXT_PUBLIC_ENABLE_DASHBOARD_TEMPLATE_SWITCHER=true`. |
| Contract preview is not a production backend commitment. | `dashboard-data-source.test.tsx` verifies production preview mode is disabled unless explicitly enabled. `data-contract.md` marks the preview route as a test seam. |
| Permission filtering hides unauthorized widgets. | Unit/component tests cover denied and unknown widgets; E2E signs in as `finance-officer@ddvs.com` and verifies HR/payroll widgets are absent. |
| Hidden widgets do not expose labels, counts, or drilldown actions. | Component tests assert hidden HR widgets and their `Open HR Dashboard` action are not in the DOM. |
| Data adapter handles partial and unsafe payloads. | Adapter tests cover missing arrays, unknown templates, unsafe absolute and protocol-relative `drilldownUrl`, registry enrichment, preview success, partial payloads, and fallback. |
| Frontend fallback registry protects must-have anchors. | Registry tests verify required HR/Student/Finance/Academic anchors remain registered, permission-gated, and actionable or owner-accountable when backend metadata fallback is used. |
| Dashboard summary API is the default source. | Data-source tests verify API success and `apiFallback`; E2E intercepts `/api/dashboard/summary` and verifies the changed KPI value renders. |
| Backend widget metadata is preferred in API mode. | Metadata tests verify `/api/dashboard/widgets` normalization, unsafe drilldown filtering, fallback to the frontend registry, and permission filtering after metadata enrichment. |
| Backend summary endpoint enforces the contract. | `MainDashboardApi_Tests` covers contract shape, invalid template/date range, missing Dashboard permission, must-have HR/Student/Finance/Academic anchors for all templates, safe relative drilldowns or owner accountability for those anchors, server-side attendance widget filtering, attendance widget emission when permitted, record-list-only users not receiving mark-attendance drilldowns, broad Calendar/Communication module grants not exposing leaf dashboard drilldowns, action metadata hiding, unregistered slice widget filtering, and live scoped admission action counts. |
| Student Records total uses scoped live data. | Backend dashboard tests verify `leadership-total-students` counts scoped `Enrolled` students, hides without Student Records permission, and returns zero for users with permission but no UserScope. |
| Action queue widgets use safe live sources only. | Phase F backend aggregation enriches admissions, HR leave/payroll, and finance reconciliation from existing scoped module readers; unsupported actions stay readiness/drilldown-only. |
| Academic curriculum widgets use scoped live data. | Backend dashboard tests verify `principal-curriculum`, `leadership-academic-health`, `principal-weak-classes`, and `principal-academic-dashboard` are enriched from scoped published curriculum chapter-progress data, and return safe empty/readiness states for users with permission but no UserScope. |
| Principal/Admin academic exam workflow backlog uses scoped live data. | Backend dashboard tests verify `principal-academic-dashboard` includes only scoped pending exam marks workflow rows and returns zero for users with permission but no UserScope. |
| Principal/Admin academic result outcome uses scoped live data. | Backend dashboard tests verify `principal-academic-dashboard` includes only scoped published/frozen result pass-rate and failed-student follow-up when Result Creation permission is granted, applies UserScope, and hides result outcome text when permission is missing. |
| Finance/HR widgets use scoped live sources. | Backend dashboard tests cover Principal/Admin teaching-staff attendance plus Finance/HR KPI, risk, and module snapshot enrichment; hidden Finance/HR metadata stays hidden when permissions are missing. |
| Calendar uses a scoped visible source when available. | Backend dashboard tests seed a Calendar event and verify `calendar-safety-drill` is enriched through the Calendar view reader. |
| Transport and Security are permission-gated readiness widgets. | Backend dashboard tests verify `principal-transport-applications` and `principal-security-dashboard` are emitted only when permitted. |
| Student/Parent transport remains safe without personal mapping. | Backend dashboard tests verify `student-transport-alert` is not emitted even when transport dashboard permission is present. |
| Compliance readiness is local and scoped. | Backend dashboard tests seed student identity compliance and verify APAAR/UDISE readiness appears only through permitted leadership compliance. |
| Teacher personalization is scoped and limited. | Backend dashboard tests verify mapped Teacher users receive assigned-class context only through scoped class-teacher assignments; unmapped Teacher users keep readiness widgets. |
| Teacher attendance action is assigned-class scoped. | Backend dashboard tests verify `teacher-attendance` counts assigned classes without attendance marked on the selected date. |
| Teacher learning-task workload is safe and narrow. | Backend dashboard tests verify `teacher-homework` counts only creator-owned, scoped, pending-review homework/assignment submissions; other-user, reviewed, and out-of-scope submissions are not counted. |
| Teacher class performance is assigned-class scoped. | Backend dashboard tests verify `teacher-class-performance` uses only mapped Teacher class-teacher assignments and published/frozen result rows when Academic result permission is granted. |
| Teacher exam evaluation is teacher-subject scoped. | Backend dashboard tests verify `teacher-exam-evaluation` counts only scoped `TeacherSubjectAllocation` rows joined to pending exam marks workflow rows and hides without Record Marks permission. |
| Backend slice failures do not blank the dashboard. | Backend dashboard tests verify a forced slice failure restores base widgets, returns `zoneErrors`, and still applies permission filtering. |
| Teacher unsafe academic areas remain readiness-only when ownership is missing. | Backend dashboard tests verify exam evaluation is not populated from homework or class-performance sources when no scoped teacher-subject allocation exists. |
| Student/Parent personal data is limited to exact identity mapping. | Backend dashboard tests verify exact single-email mapping surfaces personal attendance, assignments, fee, document status, and academic result summary; missing or ambiguous mapping keeps readiness widgets; school-wide attendance, fee, academic, transport, or safety data is not used as personal values. |
| Dashboard remains usable when API or preview data fails. | Unit/component tests and browser specs cover `apiFallback`; contract preview tests verify `contractPreviewFallback` renders mock dashboard data with a warning. |
| Every visible widget is actionable or accountable. | Component tests verify mock widgets have either `drilldownUrl` or `owner`; registry owns drilldowns and required permissions. |
| Generated build churn is not included. | `next-env.d.ts` is restored after build-generated changes. |

## Verification Commands

Run from `Shikshamitra-FE`:

```powershell
npm run test:dashboard
npm run lint:dashboard
$env:NODE_OPTIONS='--max-old-space-size=8192'; npm run ts
npm run build
```

Run from `Shikshamitra-BE`:

```powershell
dotnet test test\ShikshaMitra.HttpApi.Tests\ShikshaMitra.HttpApi.Tests.csproj --filter Dashboard
```

Run with local FE and BE available:

```powershell
$env:E2E_API_URL='https://localhost:44332'
$env:NEXT_PUBLIC_API_URL='https://localhost:44332'
$env:E2E_BASE_URL='http://localhost:3000'
$env:E2E_TENANT='DDVS'
$env:E2E_HR_EMAIL='hr-manager@ddvs.com'
$env:E2E_HR_PASSWORD='Temp@123'
npm run test:e2e:dashboard
```

Run API-level dashboard smoke when browser E2E is blocked by local frontend/browser tooling:

```powershell
$env:E2E_API_URL='http://localhost:44334'
$env:E2E_TENANT='DDVS'
.\e2e\dashboard\dashboard-api-smoke.ps1
```

## Latest Verification Result

Latest completed dashboard-focused verification:

- Dashboard validation scripts: `npm run test:dashboard`, `npm run lint:dashboard`, and `npm run test:e2e:dashboard` are available for focused release checks.
- Clean-environment CI gates are defined in FE `.github/workflows/dashboard-validation.yml` and BE `.github/workflows/dashboard-api-tests.yml`.
- Backend Dashboard API tests: `76 passed` using `dotnet test ... --filter Dashboard`. This includes server-side filtering for unregistered widgets emitted by successful dashboard slices, record-list-only users not receiving mark-attendance drilldowns, broad Calendar/Communication module grants not receiving route-leaf dashboard drilldowns, plus must-have HR/Student/Finance/Academic anchor coverage with safe relative drilldowns or owner accountability for all templates.
- Targeted Student/Parent personalization tests: `4 passed` using `dotnet test ... --filter "FullyQualifiedName~Student_Parent"`.
- Targeted Teacher exam evaluation tests: `2 passed` using `dotnet test ... --filter "FullyQualifiedName~Teacher_Exam_Evaluation"`.
- Targeted Teacher personalization/workload/evaluation tests: `11 passed` using `dotnet test ... --filter "FullyQualifiedName~Teacher"`.
- Dashboard unit/component tests: `79 passed` using `npm run test:dashboard`. The focused script uses a test-only Vite Windows `net use` probe shim and Vitest `--pool=threads` so local validation can run even when this shell blocks Node child-process spawning. Registry tests verify FE fallback widget IDs, permissions, zones, drilldowns, owners, required HR/Student/Finance/Academic anchors, and target route leaf guards stay aligned with backend metadata; adapter and metadata tests reject unsafe absolute and protocol-relative drilldowns.
- Dashboard E2E script discovery: `16 tests in 2 files` listed using `npm run test:e2e:dashboard -- --list`; the script writes artifacts to `test-results-dashboard`, and FE dashboard CI now runs this discovery check before build.
- Targeted dashboard eslint: passed using `npm run lint:dashboard`.
- TypeScript check: passed using `$env:NODE_OPTIONS='--max-old-space-size=8192'; npm run ts`.
- Dashboard API smoke: passed against `http://localhost:44334` with `AuthServer__DisableTransportSecurityRequirement=true`; `/api/dashboard/widgets` returned `43` widgets, `/api/dashboard/summary` returned valid payloads for all five templates, expanded HR/Student/Finance/Academic anchor widgets were present across KPIs, actions, and module snapshots, all returned widget IDs were registered, drilldowns were safe relative URLs, every returned widget was actionable or owner-accountable, and seeded `finance-officer@ddvs.com` received finance widgets while HR/payroll widgets were absent.
- Production build: passed using `npm run build`. The build compiled successfully, generated `348` static/dynamic route entries, and included `/dashboard`.
- Host development OpenIddict hardening: backend dashboard tests pass after enabling the existing repo-local ephemeral OpenIddict certificate path in Development.
- Dashboard E2E against local DDVS: not signed off in this pass. A diagnostic HTTP backend launch with `AuthServer__Authority=http://localhost:44334` and `AuthServer__DisableTransportSecurityRequirement=true` returns `200` for `GET /api/abp/application-configuration` for tenant `DDVS`, and the built frontend can be served with `npm run start -- --port 3001`. However, starting the matching frontend through `npm run dev` is blocked by Next dev `spawn EPERM`; running `npm run test:e2e:dashboard` fails before any browser test executes because Playwright worker startup hits `spawn EPERM`; and a direct single-process Playwright Chromium launch also fails with `browserType.launch: spawn EPERM`. Dashboard browser E2E remains blocked by local frontend/runtime process restrictions, not by a dashboard API test failure.

Full repo `npm run test` remains outside this dashboard acceptance gate and has historically been blocked by unrelated non-dashboard failures. Phase O relies on backend dashboard tests, targeted dashboard unit/component tests, targeted lint, production build, and local-stack E2E when the DDVS stack is available.

## Release Notes

- Keep `NEXT_PUBLIC_ENABLE_DASHBOARD_TEMPLATE_SWITCHER` unset or `false` in production.
- Keep `NEXT_PUBLIC_ENABLE_DASHBOARD_CONTRACT_PREVIEW` unset or `false` in production unless intentionally testing the frontend contract seam.
- Backend dashboard aggregation must apply UserScope before returning live counts, lists, risks, calendar items, or module snapshots.
- Backend widget metadata from `GET /api/dashboard/widgets` is the preferred runtime metadata source; the frontend registry remains a fallback until metadata is generated or shared.
- Phase L-O plus current completion slices return live scoped student records, student attendance, Principal/Admin teaching-staff attendance, selected action queue counts, Academic curriculum completion/health/pacing signals, Principal/Admin exam marks workflow backlog, Principal/Admin published/frozen result outcome pass-rate, Finance/HR KPI and module snapshots, visible Calendar item enrichment, local scoped compliance readiness, limited Teacher assigned-class context/attendance action/result pass-rate/exam marks workflow count, creator-owned Teacher learning-task review counts, limited Student/Parent exact-email personal attendance/assignment/fee/document/result status, and slice-level failure isolation through `zoneErrors`.
- Do not add fake announcement, transport/security, broad Teacher workload, Student/Parent transport/safety, or Student/Parent class-performance/risk values. Keep unsupported widgets readiness/drilldown-only until their owning modules expose safe sources.
