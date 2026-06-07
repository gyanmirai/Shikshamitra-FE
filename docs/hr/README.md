# HR Module Documentation

Last verified against repo: 2026-06-07.

Primary sources: `src/constants/hr-menus.ts`, `src/app/(auth-route)/hr/**`, `src/screens/hr/**`, `src/redux/hr/**`, `src/redux/runPayroll/**`, `../Shikshamitra-BE/src/ShikshaMitra.Application.Contracts/HR/**`, `../Shikshamitra-BE/src/ShikshaMitra.Application/HR/**`, `../Shikshamitra-BE/src/ShikshaMitra.Domain/HR/**`, `../Shikshamitra-BE/src/ShikshaMitra.Domain.Shared/Constants/Permissions/SubmodulePermissions/HR/**`.

## Purpose

HR manages employee records, employee documents and I-cards, attendance, leave, payroll, HR policies, performance reviews, HR reports, notifications, and HR-backed calendar/holiday scenarios.

This pack is for agents and engineers who need to change, test, or reason about the current implementation quickly.

## Read Order

| Need | Open |
| --- | --- |
| Product behavior and acceptance | [prd.md](prd.md) |
| Code architecture and data boundaries | [technical-spec.md](technical-spec.md) |
| End-to-end user and system flows | [workflows-and-scenarios.md](workflows-and-scenarios.md) |
| Route, API, and permission lookup | [api-and-permissions-map.md](api-and-permissions-map.md) |
| Tests, commands, and verification gaps | [testing-and-acceptance.md](testing-and-acceptance.md) |

## Module Map

| Area | Status | Main frontend surfaces | Main backend contracts |
| --- | --- | --- | --- |
| Dashboard | Implemented | `/hr/dashboard`, `src/screens/hr/hr-dashboard/**` | `HR/Dashboard/*` |
| Employees | Implemented | `/hr/employee`, `/hr/i-card`, `/hr/setting`, `src/screens/hr/employee/**`, `src/screens/hr/i-card/**` | `HR/Employees/**` |
| Payroll | Implemented | `/hr/payroll`, `/hr/payroll/run-payroll`, `/hr/payroll/payslip-generation`, `/hr/payroll/structure`, `/hr/payroll/setting/*` | `HR/Payroll/**`, `HR/Employees/Payroll/**` |
| Attendance | Implemented | `/hr/attendance-dashboard`, `/hr/manual-attendance`, `/hr/attendance-tracking`, `/hr/biometric-attendance`, `/hr/attendance-setting/shiftManagement` | `HR/AttendanceAndLeaves/**`, `HR/Payroll/AttendanceImports/**` |
| Leave | Implemented | `/hr/leave-center`, `/hr/apply-leave`, `/hr/leave-approvals`, `/hr/leave-balance`, `/hr/leave-management-setting/*` | `HR/AttendanceAndLeaves/LeaveManagementInfo/**`, `Settings/**` |
| Policies | Implemented | `/hr/calendars`, `/hr/leave-policies`, `/hr/payrollPolicies`, `/hr/attendance`, `/hr/assignments`, `/hr/effective-preview` | `HR/Policies/**` |
| Performance management | Implemented | `/hr/professional-management/**` | `HR/ProfessionalManagement/**` |
| Reports | Implemented | `/hr/reports` | `HR/Reports/**` |
| Notifications | Implemented | `/hr/hr-notification` | HR notification screens plus notification history/settings contracts |
| HR events/holidays | Partially implemented/commented in menu | pages exist under `/hr/events-holidays`; menu entry is commented | `HR/Calendar/**`, calendar/group APIs |
| TDS and professional tax pages | Partially implemented/commented in menu | pages exist; menu entries are commented in payroll settings | `HR/Payroll/Settings/**` |
| Training/performance legacy pages | Known caveat | `/hr/training`, `/hr/performance` pages exist outside main HR menu | confirm usage before extending |

## Agent Quick Start

1. Start with `src/constants/hr-menus.ts` to confirm visible menu, route, shortcut, and permission intent.
2. For UI behavior, inspect the matching `src/screens/hr/<area>/**` folder.
3. For API behavior, inspect the matching RTK client in `src/redux/hr/**` or `src/redux/runPayroll/runPayrollApi.ts`.
4. For server contracts, inspect `../Shikshamitra-BE/src/ShikshaMitra.Application.Contracts/HR/**`.
5. For domain rules, inspect `../Shikshamitra-BE/src/ShikshaMitra.Domain/HR/**` and `../Shikshamitra-BE/src/ShikshaMitra.Application/HR/**`.
6. For permissions, compare frontend `hrPermissions` with backend `ShikshaMitraSubmodulePermissions.HR.*`.
7. For regression coverage, use `e2e/hr/**`, HR Redux contract tests, and HR utility unit tests.

## Source Of Truth Notes

| Topic | Source |
| --- | --- |
| Visible navigation | `src/constants/hr-menus.ts` |
| App Router pages | `src/app/(auth-route)/hr/**/page.tsx` |
| Screens/components | `src/screens/hr/**` |
| Frontend API clients | `src/redux/hr/**`, `src/redux/runPayroll/runPayrollApi.ts` |
| Backend API contracts | `../Shikshamitra-BE/src/ShikshaMitra.Application.Contracts/HR/**` |
| Backend application logic | `../Shikshamitra-BE/src/ShikshaMitra.Application/HR/**` |
| Domain model/rules | `../Shikshamitra-BE/src/ShikshaMitra.Domain/HR/**` |
| Persistence configuration | `../Shikshamitra-BE/src/ShikshaMitra.EntityFrameworkCore/HR/**` |
| Permissions | `../Shikshamitra-BE/src/ShikshaMitra.Domain.Shared/Constants/Permissions/SubmodulePermissions/HR/**` |
| Demo/seed data | `../Shikshamitra-BE/src/ShikshaMitra.Domain/Seeders/HRSeederContributor*.cs` |
| E2E coverage | `e2e/hr/**`, `e2e/hr-calendar-e2e.spec.ts`, `e2e/calendar-*.spec.ts` |

