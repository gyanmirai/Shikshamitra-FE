# HR API And Permissions Map

Last verified against repo: 2026-06-07.

Sources: `src/constants/hr-menus.ts`, `src/redux/hr/**`, `src/redux/runPayroll/runPayrollApi.ts`, `../Shikshamitra-BE/src/ShikshaMitra.Application.Contracts/HR/**`, `../Shikshamitra-BE/src/ShikshaMitra.Domain.Shared/Constants/Permissions/SubmodulePermissions/HR/**`.

## Route And Permission Map

| Menu area | Route(s) | Frontend permission | Backend permission family |
| --- | --- | --- | --- |
| Dashboard | `/hr/dashboard` | `HR.Dashboard` | `HR.Dashboard.View` |
| Employee list | `/hr/employee` | `HR.Employee.EmployeeList` | `HR.Employee.EmployeeList.*` |
| I-card | `/hr/i-card` | `HR.Employee.ICard.View` | `HR.Employee.ICard.*` |
| Document settings | `/hr/setting` | `HR.Employee.Setting.DocumentTypes` | `HR.Employee.Setting.DocumentTypes.*` |
| Payroll overview | `/hr/payroll` | `HR.PayrollManagement.Overview` | `HR.PayrollManagement.Overview.*` |
| Run payroll | `/hr/payroll/run-payroll` | `HR.PayrollManagement.RunPayroll` plus lock/audit/adjustment actions | `HR.PayrollManagement.RunPayroll.*` |
| Payslips | `/hr/payroll/payslip-generation` | `HR.PayrollManagement.GenerateSalarySlip` | `HR.PayrollManagement.GenerateSalarySlip.*` |
| Payroll structure | `/hr/payroll/structure` | `HR.PayrollManagement.PayrollStructure` | `HR.PayrollManagement.PayrollStructure.*` |
| Payroll settings | `/hr/payroll/setting/*` | earning/deduction/PF/TDS/professional tax permissions | `HR.PayrollManagement.Settings.*` |
| Attendance dashboard | `/hr/attendance-dashboard` | `HR.AttendanceAndLeave.Dashboard` | `HR.AttendanceAndLeave.Dashboard.View` |
| Device/biometric attendance | `/hr/biometric-attendance` | `HR.AttendanceAndLeave.BiometricAttendance` | `HR.AttendanceAndLeave.BiometricAttendance.*` |
| Attendance register | `/hr/attendance-tracking` | `HR.AttendanceAndLeave.AttendanceTracking` | `HR.AttendanceAndLeave.AttendanceTracking.*` |
| Mark attendance | `/hr/manual-attendance` | `HR.AttendanceAndLeave.MarkAttendance` | `HR.AttendanceAndLeave.MarkAttendance.*` |
| Shift management | `/hr/attendance-setting/shiftManagement` | `HR.AttendanceAndLeave.Setting.ShiftManagement` | frontend constant; validate backend before adding gates |
| Leave center/apply/approvals/balance | `/hr/leave-center`, `/hr/apply-leave`, `/hr/leave-approvals`, `/hr/leave-balance` | `HR.LeaveManagement.LeaveCenter` | `HR.LeaveManagement.LeaveCenter.*` |
| Leave type setting | `/hr/leave-management-setting/leaveType` | `HR.LeaveManagement.Setting.LeaveType` | `HR.LeaveManagement.Setting.LeaveType.*` |
| Leave policy setting | `/hr/leave-management-setting/leavePolicy`, `/hr/leave-policies` | `HR.LeaveManagement.Setting.LeavePolicy` | `HR.LeaveManagement.Setting.LeavePolicy.*` |
| Policies | `/hr/calendars`, `/hr/payrollPolicies`, `/hr/attendance`, `/hr/assignments`, `/hr/effective-preview` | `HR.Policies.*` | `HR.Policies.*` |
| Performance | `/hr/professional-management/**` | `HR.ProfessionalManagement.View`; performance action constants also exist | `HR.ProfessionalManagement.*`, `HR.PerformanceManagement.*` |
| Reports | `/hr/reports` | `HR.Reports` | `HR.Reports.*` |
| Notification | `/hr/hr-notification` | `HR.Notification` | `HR.Notification.*` |
| Events/holidays | `/hr/events-holidays` | no visible HR menu entry | `HR.Calendar.*` and calendar module permissions |

## Frontend API Clients

| Client | Endpoint families | Backend contract area |
| --- | --- | --- |
| `hrDashboardApi.ts` | HR dashboard summary/preview/refresh | `HR/Dashboard/*` |
| `employeeApi.ts` | employees, personal/basic info, status, documents, settings, reporting, search/profile areas | `HR/Employees/**` |
| `employee-icard-template-api.ts` | `/employees/i-card/templates`, assets, PDF download | `HR/Employees/ICards/**` |
| `employee-payroll-api.ts` | `/payroll/earning-components`, `/payroll/deduction-components`, PF/professional tax/pay elements | `HR/Payroll/Settings/**` |
| `employee-salary-structure-api.ts` | employee salary structure get/update | `HR/Payroll/SalaryStructure/**` |
| `runPayrollApi.ts` | `/payroll/run`, readiness, reviews, adjustments, salary slips, PDFs | `HR/Payroll/RunPayroll/**`, `HR/Payroll/SalarySlips/**` |
| `attendanceApi.ts` | attendance tracking, employee attendance, import preview/confirm/template, take-attendance day, register/grouped/adjust | `HR/AttendanceAndLeaves/**` |
| `attendanceImportApi.ts` | `/hr/attendance/automated-runs`, rows, lock/unlock, row save | `HR/Payroll/AttendanceImports/**` |
| `leaveApi.ts` | leave types, leave policies, leave-management requests/actions/balances | `HR/AttendanceAndLeaves/**` |
| `hr-policy-api.ts` | work calendars, payroll/attendance policies, assignments, impact, versions, audit, holiday impact | `HR/Policies/**` |
| `professional-management-api.ts` | professional dashboard, templates, cycles, reviews, stages, evidence, feedback, outcomes, reports, audit | `HR/ProfessionalManagement/**` |
| `hrReportsApi.ts` | sources, options, templates, preview, export, export history | `HR/Reports/**` |
| Related calendar clients | event/holiday type and event/holiday APIs, HR employee selection | `HR/Calendar/**`, calendar/group contracts |

## High-Value Endpoint Families

| Area | Endpoint examples from clients |
| --- | --- |
| Run payroll | `GET/POST /payroll/run`, `GET /payroll/run/readiness`, `POST/DELETE /payroll/run/reviews`, `/payroll/run/adjustments`, `/payroll/salary-slips`, `/payroll/salary-slips/pdf` |
| Attendance | `/attendance-tracking/date-wise`, `/attendance-tracking/employee-wise`, `/attendance/employees`, `/attendance-import/preview`, `/attendance-import/confirm`, `/attendance-import/template`, `/hr/attendance/take-attendance/day`, `/hr/attendance/register` |
| Automated attendance imports | `/hr/attendance/automated-runs`, `/hr/attendance/automated-runs/{id}/rows`, `/lock`, `/rows/save` |
| I-card | `/employees/i-card/templates`, `/employees/i-card/templates/assets`, template PDF download URL builder |
| Professional management | `/hr/professional-management/dashboard`, `/templates`, `/review-cycles`, `/reviews`, `/observations`, `/evidence`, `/feedback`, `/development-plan`, `/reports/*`, `/audit` |
| Policies | work calendar, payroll, attendance, assignment, effective preview, version, audit, and holiday impact routes in `hr-policy-api.ts` |

## Permission Caveats

| Caveat | Action for implementers |
| --- | --- |
| Frontend `hrPermissions` sometimes uses module-level constants for parent menu nodes | Check leaf permissions before hiding actions |
| `HR.ProfessionalManagement.View` and `HR.PerformanceManagement.*` both exist | Use screen/API behavior to choose the correct gate for new performance actions |
| Shift management frontend permission is declared in menu | Confirm backend constant before adding new server authorization |
| Commented menu entries can still have pages and backend contracts | Do not document as active navigation unless `hr-menus.ts` exposes them |

