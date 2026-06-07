# HR Testing And Acceptance

Last verified against repo: 2026-06-07.

Sources: `e2e/hr/**`, `e2e/hr-calendar-e2e.spec.ts`, `e2e/hr-calendar-e2e-report.md`, `src/redux/hr/*.test.ts`, `src/screens/hr/**/*.test.*`, `../Shikshamitra-BE/test/**`.

## Automated Test Coverage

| Layer | Coverage | Files |
| --- | --- | --- |
| HR employee E2E | create, list, profile, edit stepper, documents, status, salary structure, permissions | `e2e/hr/employee/*.spec.ts` |
| HR full-cycle E2E | employee context, attendance, payroll preview/review/lock, salary slip | `e2e/hr/hr-module-full-cycle.spec.ts` |
| HR/calendar E2E | policies, leave, group management, event/holiday UI coverage | `e2e/hr-calendar-e2e.spec.ts`, `e2e/calendar-group-ui.spec.ts`, `e2e/calendar-event-holiday-ui.spec.ts` |
| Manual regression | Employee list/profile responsiveness and user checks | `e2e/hr/employee/manual-regression.md` |
| Redux contract tests | HR dashboard, employee, attendance, attendance import, policies, I-card | `src/redux/hr/*.contract.test.ts`, `src/redux/hr/hrReportsApi.test.ts` |
| HR utility/unit tests | audit formatting, policy helpers, leave utilities, attendance status mapping, salary/payslip utilities, I-card builder | `src/utils/*hr*.test.ts`, `src/screens/hr/**/*.test.*` |
| Backend API tests | HR/calendar API groups referenced in report | `../Shikshamitra-BE/test/ShikshaMitra.HttpApi.Tests/**` |

## Important Commands

Run from `Shikshamitra-FE` unless stated otherwise.

| Purpose | Command |
| --- | --- |
| Employee E2E suite | `npx playwright test e2e/hr/employee --project=chromium --reporter=list` |
| Full HR payroll cycle | `$env:E2E_HR_FULL_CYCLE='1'; npx playwright test e2e/hr/hr-module-full-cycle.spec.ts --project=chromium --reporter=list` |
| HR/calendar policy and leave E2E | `npx playwright test e2e/hr-calendar-e2e.spec.ts --project=chromium --reporter=list` |
| Calendar group/event/holiday E2E | `npx playwright test e2e/calendar-group-ui.spec.ts e2e/calendar-event-holiday-ui.spec.ts --project=chromium --reporter=list --workers=1` |
| HR frontend unit/contract tests | `npx vitest run src/redux/hr src/screens/hr src/utils/hr-audit-format.test.ts` |
| Focused HR lint from report | `npx eslint e2e/hr-calendar-e2e.spec.ts src/screens/hr/policies/hr-policy-workspace.constants.ts` |
| Backend calendar/HR API group tests | From `Shikshamitra-BE`: `dotnet test test\ShikshaMitra.HttpApi.Tests\ShikshaMitra.HttpApi.Tests.csproj --filter "FullyQualifiedName~GroupManagementApi_Tests|FullyQualifiedName~CalendarViewApi_Tests|FullyQualifiedName~EventApi_Tests|FullyQualifiedName~HolidayApi_Tests|FullyQualifiedName~EventTypeApi_Tests|FullyQualifiedName~HolidayTypeApi_Tests|FullyQualifiedName~WorkCalendarPolicyApi_Tests"` |

## E2E Environment

| Variable | Use |
| --- | --- |
| `E2E_HR_EMAIL` | HR/admin login used by auth setup and HR specs |
| `E2E_HR_PASSWORD` | Password for HR/admin E2E login |
| `E2E_HR_FULL_CYCLE=1` | Enables the destructive/current-month full-cycle payroll spec |

Known caveat: `hr-module-full-cycle.spec.ts` creates data and locks a prepared employee payroll row for the current month. Run it only against a disposable or seeded local environment.

## Acceptance Checklist

| Area | Check |
| --- | --- |
| Navigation | Every documented active route is present in `hr-menus.ts` or `src/app/(auth-route)/hr/**` |
| API map | Every documented frontend client exists under `src/redux/hr/**`, `src/redux/runPayroll/**`, or related calendar clients |
| Backend map | Every contract family exists under `Application.Contracts/HR/**` |
| Permissions | Frontend permission names are compared with `ShikshaMitraSubmodulePermissions.HR.*` |
| Employee | Create, edit, profile tabs, documents, status, salary structure, and permissions tests pass |
| Attendance | Manual attendance, import, tracking/register, lock/unlock behavior is covered before payroll changes |
| Payroll | Readiness, preview, adjustment, review, lock, salary slip, and PDF paths are covered |
| Leave | Apply/action/balance behavior is checked with policy setup |
| Policies | CRUD, assignment, impact, audit, version, holiday/work calendar behavior is checked |
| Performance | Template/cycle/review/outcome/report/audit flows are checked if changed |
| Reports | Source/options/template/preview/export/history are checked if report code changes |

## Known Verification Gaps

| Gap | Risk |
| --- | --- |
| Some HR pages are not visible in main menu but have route files | Agent may assume active navigation; verify menu before changing UX |
| Full-cycle payroll test is gated and mutating | CI may skip it; run manually for payroll lock/slip changes |
| Calendar HR integration spans calendar and HR modules | Route/API ownership can be missed if only `src/screens/hr` is inspected |
| Shift management backend permission mapping needs confirmation before new gates | Frontend permission exists, but backend constant should be checked on change |
| TDS/professional tax pages are present but menu commented | Treat as partial unless product confirms activation |

## Documentation Quality Bar

| Requirement | Pass condition |
| --- | --- |
| Fast agent onboarding | `README.md` identifies HR boundaries, source paths, and doc links in under 2 minutes |
| Accurate implementation map | Routes, clients, contracts, and permissions can be traced to source files |
| No aspiration | Docs mark partial/commented surfaces instead of presenting them as active shipped menu features |
| Regression ready | Each major workflow has at least one test pointer or explicit verification gap |

