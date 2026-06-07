# HR Module Technical Spec

Last verified against repo: 2026-06-07.

Sources: `src/constants/hr-menus.ts`, `src/app/(auth-route)/hr/**`, `src/screens/hr/**`, `src/redux/hr/**`, `src/redux/runPayroll/**`, `../Shikshamitra-BE/src/ShikshaMitra.Application.Contracts/HR/**`, `../Shikshamitra-BE/src/ShikshaMitra.Application/HR/**`, `../Shikshamitra-BE/src/ShikshaMitra.Domain/HR/**`, `../Shikshamitra-BE/src/ShikshaMitra.EntityFrameworkCore/HR/**`.

## Frontend Architecture

| Layer | Location | Responsibility |
| --- | --- | --- |
| Navigation and permissions | `src/constants/hr-menus.ts` | Defines HR visible menu, paths, shortcut keys, and frontend permission names |
| App Router pages | `src/app/(auth-route)/hr/**/page.tsx` | Route entry points that render HR screens |
| Screens | `src/screens/hr/**` | UI state, forms, tables, drawers, validation helpers, workflow components |
| API clients | `src/redux/hr/**`, `src/redux/runPayroll/runPayrollApi.ts` | RTK Query endpoints, cache tags, payload shaping |
| Shared utilities | `src/utils/hr-audit-format.ts`, HR screen utilities | Audit formatting, policy diff/value rendering, status mapping, payroll helpers |
| Tests | `src/redux/hr/*.test.ts`, `src/screens/hr/**/*.test.*`, `e2e/hr/**` | Contract, unit, component, and browser regression coverage |

## Route Boundaries

| Area | Main routes |
| --- | --- |
| Dashboard | `/hr/dashboard` |
| Employee | `/hr/employee`, `/hr/i-card`, `/hr/setting`, `/hr/profile` |
| Payroll | `/hr/payroll`, `/hr/payroll/dashboard`, `/hr/payroll/run-payroll`, `/hr/payroll/payslip-generation`, `/hr/payroll/structure`, `/hr/payroll/setting/earning-component`, `/hr/payroll/setting/deduction-component`, `/hr/payroll/setting/pf`, `/hr/payroll/setting/tds`, `/hr/payroll/setting/professional-tax` |
| Attendance | `/hr/attendance-dashboard`, `/hr/manual-attendance`, `/hr/attendance-tracking`, `/hr/biometric-attendance`, `/hr/biometric-integration`, `/hr/attendance-notification`, `/hr/attendance-setting/shiftManagement` |
| Leave | `/hr/leave-center`, `/hr/apply-leave`, `/hr/leave-approvals`, `/hr/leave-balance`, `/hr/leave-management-setting/leaveType`, `/hr/leave-management-setting/leavePolicy` |
| Policies | `/hr/calendars`, `/hr/leave-policies`, `/hr/payrollPolicies`, `/hr/attendance`, `/hr/assignments`, `/hr/holiday`, `/hr/effective-preview` |
| Performance | `/hr/professional-management`, `/hr/professional-management/overview`, `/reviews`, `/cycles`, `/outcomes`, `/reports`, `/settings`, `/settings/setup`, plus `/hr/performance` |
| Reports/notifications | `/hr/reports`, `/hr/hr-notification` |
| Events/holidays | `/hr/events-holidays`, `/hr/events-holidays/request` |

## Backend Architecture

| Layer | Location | Responsibility |
| --- | --- | --- |
| Contracts | `Application.Contracts/HR/**` | DTOs, validators, app-service interfaces |
| Application | `Application/HR/**` | Workflow orchestration, authorization, projections, exports, PDFs |
| Domain | `Domain/HR/**` | Aggregates, entities, managers, services, repositories |
| Shared domain | `Domain.Shared/HR/**` | Enums, constants, error codes, ETOs |
| EF Core | `EntityFrameworkCore/HR/**` | Entity configuration, repositories, query implementations |
| Seeding | `Domain/Seeders/HRSeederContributor*.cs` | Demo employees, policy defaults, shifts, salary profiles, attendance, leave, performance templates |
| Permissions | `Domain.Shared/Constants/Permissions/SubmodulePermissions/HR/**` plus `HRPermissionDefinitionProvider.cs` | Backend permission constants and ABP permission definitions |

## Domain Subsystems

| Subsystem | Main contracts | Main implementation/domain |
| --- | --- | --- |
| Dashboard | `HR/Dashboard/*` | `Application/HR/Dashboard`, `EntityFrameworkCore/HR/Dashboard` |
| Employees | `HR/Employees/**` | `Application/HR/Employees`, `Domain/HR/Employees`, `EntityFrameworkCore/HR/Employees` |
| Employee payroll details | `HR/Employees/Payroll/**` | `Application/HR/Employees/Payroll`, `Domain/HR/Employees/Payroll` |
| Payroll settings | `HR/Payroll/Settings/**` | `Application/HR/Payroll/Settings`, `EntityFrameworkCore/HR/Payroll/Settings` |
| Salary structure | `HR/Payroll/SalaryStructure/**` | `Application/HR/Payroll/SalaryStructure` |
| Run payroll | `HR/Payroll/RunPayroll/**` | `Application/HR/Payroll/RunPayroll`, snapshot and lock workflows |
| Salary slips | `HR/Payroll/SalarySlips/**` | `Application/HR/Payroll/SalarySlips`, PDF services |
| Attendance and leave | `HR/AttendanceAndLeaves/**` | `Application/HR/AttendanceAndLeaves`, `Domain/HR/AttendanceAndLeaves` |
| Attendance imports | `HR/AttendanceAndLeaves/Import/**`, `HR/Payroll/AttendanceImports/**` | Preview/confirm imports and automated run row save workflows |
| Calendar | `HR/Calendar/**` | `Application/HR/Calendar`, `Domain/HR/Calendar` |
| Policies | `HR/Policies/**` | `Application/HR/Policies`, `EntityFrameworkCore/HR/Policies` |
| Professional management | `HR/ProfessionalManagement/**` | `Application/HR/ProfessionalManagement`, `EntityFrameworkCore/HR/ProfessionalManagement` |
| Reports | `HR/Reports/**` | `Application/HR/Reports`, report catalog/export services |
| Audit | `HR/Audit/**` | HR audit trail app service and frontend audit renderers |

## State And Cache Rules

| Frontend change | Expected invalidation |
| --- | --- |
| Attendance save/import/adjust | Attendance and run payroll tags refresh |
| Salary structure/component updates | Payroll component, salary structure, run payroll, and salary slip data may need refresh |
| Payroll review/lock/adjustment | Run payroll and salary slip tags refresh |
| Leave create/approve/reject | Employee and HR dashboard tags refresh |
| Policies create/update/assignment | Policy workspace, impact, audit, and effective preview data refresh |
| Professional management mutations | Professional review tag refresh |

## Cross-Module Dependencies

| Dependency | Usage |
| --- | --- |
| Academic year and organization hierarchy | Employee assignment, attendance/payroll periods, policy scope |
| Identity/users/roles | Employee account creation, role assignment, reporting manager, permissions |
| Calendar/groups | Event/holiday audiences and HR-backed employee selection |
| File/blob storage | Employee documents, profile picture, I-card assets, generated PDFs |
| Notifications | Leave/attendance/employee/event notification management and history |
| Payroll month normalizer | Consistent payroll month input and salary slip lookup |

## Known Caveats

| Caveat | Source |
| --- | --- |
| Some pages exist without visible menu entries | App routes include HR events/holidays, TDS, professional tax, training/performance; menu comments or omits several |
| Frontend and backend permission naming are close but not always identical in grouping | Compare `hrPermissions` with `ShikshaMitraSubmodulePermissions.HR.*` before adding gates |
| Calendar event/holiday workflows live partly under calendar module | HR docs include them only where HR employees/groups/policies are involved |
| Attendance import has two surfaces | Manual file preview/confirm and automated device-run row save/log flows both exist |

