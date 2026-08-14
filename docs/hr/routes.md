---
module: hr
domain: routes
content_type: Reference
status: canonical
updated_on: 2026-08-13
owner: frontend-team
audience: humans-and-agents
---

# Find HR routes and permissions

TL;DR: use this page to map HR menu entries, App Router pages, and frontend permission gates.
Verify `src/constants/hr-menus.ts` before treating a page as active navigation.

## Route map

The route map is frontend integration truth, not backend product truth:

| Area | Routes | Frontend permission |
|---|---|---|
| Dashboard | `/hr/dashboard` | `HR.Dashboard` |
| Employee list | `/hr/employee` | `HR.Employee.EmployeeList` |
| I-card | `/hr/i-card` | `HR.Employee.ICard.View` |
| Document settings | `/hr/setting` | `HR.Employee.Setting.DocumentTypes` |
| Payroll overview | `/hr/payroll` | `HR.PayrollManagement.Overview` |
| Run payroll | `/hr/payroll/run-payroll` | `HR.PayrollManagement.RunPayroll` plus lock, audit, and adjustment actions |
| Payslips | `/hr/payroll/payslip-generation` | `HR.PayrollManagement.GenerateSalarySlip` |
| Payroll structure | `/hr/payroll/structure` | `HR.PayrollManagement.PayrollStructure` |
| Payroll settings | `/hr/payroll/setting/*` | `HR.PayrollManagement.Settings.*` |
| Salary templates | `/hr/payroll/setting/salary-templates` | `HR.PayrollManagement.Settings.SalaryTemplates.*` |
| Professional tax | `/hr/payroll/setting/professional-tax` | `HR.PayrollManagement.Settings.ProfessionalTax.*` |
| Attendance dashboard | `/hr/attendance-dashboard` | `HR.AttendanceAndLeave.Dashboard` |
| Device attendance | `/hr/biometric-attendance` | `HR.AttendanceAndLeave.BiometricAttendance` |
| Attendance register | `/hr/attendance-tracking` | `HR.AttendanceAndLeave.AttendanceTracking` |
| Mark attendance | `/hr/manual-attendance` | `HR.AttendanceAndLeave.MarkAttendance` |
| Shift management | `/hr/attendance-setting/shiftManagement` | `HR.AttendanceAndLeave.Setting.ShiftManagement` |
| Leave center and requests | `/hr/leave-center`, `/hr/apply-leave`, `/hr/leave-approvals`, `/hr/leave-balance` | `HR.LeaveManagement.LeaveCenter` |
| Leave policies | `/hr/leave-policies` | `HR.LeaveManagement.Setting.LeavePolicy` |
| Policies | `/hr/calendars`, `/hr/payrollPolicies`, `/hr/attendance`, `/hr/assignments`, `/hr/effective-preview` | `HR.Policies.*` |
| Professional management | `/hr/professional-management/**` | `HR.ProfessionalManagement.View` and action constants |
| Reports | `/hr/reports` | `HR.Reports` |
| Notifications | `/hr/hr-notification` | `HR.Notification` |

## Partial routes

These routes require source verification before product claims:

| Route | Status |
|---|---|
| `/hr/events-holidays` | Page exists, but HR menu visibility may be commented |
| `/hr/payroll/setting/tds` | Page exists, but menu activation is partial |
| `/hr/training` | Legacy or unconfirmed ownership |
| `/hr/performance` | Prefer professional-management routes unless menu proves otherwise |

## Permission rule

Frontend permission names are gates for navigation and actions.
Backend permission constants remain canonical for security.
Compare with `../../../Shikshamitra-BE/docs/modules/hr/references/permissions.md` before changing permission names.
