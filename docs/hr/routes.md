---
module: hr
domain: routes
content_type: Reference
status: canonical
updated_on: 2026-10-27
owner: frontend-team
audience: humans-and-agents
---

# Find HR routes and permissions

TL;DR: use this page to map HR menu entries, App Router pages, and frontend permission gates.
Verify `src/constants/hr-menus.ts` before treating a page as active navigation.

## Route map

The route map is frontend integration truth, not backend product truth:

| Area                      | Routes                                                                                                  | Frontend permission                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Dashboard                 | `/hr/dashboard`                                                                                         | `HR.Dashboard.View`                                                             |
| Staff Directory           | `/hr/employee`                                                                                          | `HR.Employee.EmployeeList`                                                 |
| Staff finalization | `/hr/employee/onboarding/{applicationId}/finalize` | Inherits HR/Staff Directory navigation guards; application reads require `HR.Employee.EmployeeOnboarding.View`, and the page requires the existing `.Finalize` action. Salary/statutory write gates remain independent. |
| I-card                    | `/hr/i-card`                                                                                            | `HR.Employee.ICard.View`                                                   |
| Document settings         | `/hr/setting`                                                                                           | `HR.Employee.Setting.DocumentTypes`                                        |
| Payroll overview          | `/hr/payroll`                                                                                           | `HR.PayrollManagement.Overview`                                            |
| Run payroll               | `/hr/payroll/run-payroll`                                                                               | `HR.PayrollManagement.RunPayroll` plus lock, audit, and adjustment actions |
| Payslip & statement settings | `/hr/payroll/setting/payslip-statement-settings` | Payroll Settings visibility plus `HR.PayrollManagement.GenerateSalarySlip.View`; editing uses `.Add` and server HR-wide scope. |
| Payslips                  | `/hr/payroll/payslip-generation`                                                                        | `HR.PayrollManagement.GenerateSalarySlip`                                  |
| Payroll compensation      | `/hr/payroll/structure/{employeeId}/edit`                                            | `HR.PayrollManagement.PayrollStructure` plus Compensation View or Manage   |
| Payroll settings          | `/hr/payroll/setting/*`                                                                                 | `HR.PayrollManagement.Settings.*`                                          |
| Salary templates          | `/hr/payroll/setting/salary-templates`, `/hr/payroll/setting/salary-templates/new`, `/hr/payroll/setting/salary-templates/{templateId}` | `HR.PayrollManagement.Settings.SalaryTemplates.*`                          |
| Professional tax          | `/hr/payroll/setting/professional-tax`                                                                  | `HR.PayrollManagement.Settings.ProfessionalTax.*`                          |
| Statutory schemes         | `/hr/payroll/setting/statutory-schemes`                                                                 | `HR.PayrollManagement.Settings.StatutorySchemes.*`                         |
| Attendance dashboard      | `/hr/attendance-dashboard`                                                                              | `HR.AttendanceAndLeave.Dashboard`                                          |
| Device attendance         | `/hr/biometric-attendance`                                                                              | `HR.AttendanceAndLeave.BiometricAttendance`                                |
| Attendance register       | `/hr/attendance-tracking`                                                                               | `HR.AttendanceAndLeave.AttendanceTracking`                                 |
| Mark attendance           | `/hr/manual-attendance`                                                                                 | `HR.AttendanceAndLeave.MarkAttendance`                                     |
| Shift management          | `/hr/attendance-setting/shiftManagement`                                                                | `HR.AttendanceAndLeave.Setting.ShiftManagement`                            |
| Leave center and requests | `/hr/leave-center`, `/hr/apply-leave`, `/hr/leave-approvals`, `/hr/leave-balance`                       | `HR.LeaveManagement.LeaveCenter`                                           |
| Leave policies            | `/hr/leave-policies`                                                                                    | `HR.LeaveManagement.Setting.LeavePolicy`                                   |
| Policies                  | `/hr/calendars`, `/hr/payrollPolicies`, `/hr/attendance`, `/hr/assignments`    | `HR.Policies.*`                                                            |
| Professional management   | `/hr/professional-management/**`                                                                        | `HR.ProfessionalManagement.View` and action constants                      |
| Reports                   | `/hr/reports`                                                                                           | `HR.Reports`                                                               |
| Notifications             | `/hr/hr-notification`                                                                                   | `HR.Notification`                                                          |

## Breadcrumb hierarchy

HR uses inline `CustomBreadcrumbs` without the redundant `HR/Staff` prefix. The final item is
current-page text. Ancestors use route constants or existing guarded return callbacks for
unsaved forms; never expose record IDs, raw route segments, or duplicate destinations.

| Page family | Breadcrumb pattern |
| --- | --- |
| HR dashboard, Staff Directory, onboarding list, policy page | Current page |
| Staff profile / add / update | Staff Directory → Current page |
| Staff I-Card list / Document Types | Current page; Staff Directory is a sibling |
| I-card template editor | Staff I-Card → Create Staff I-Card / Update Staff I-Card (existing Back callback) |
| Onboarding application | Staff Onboarding → Candidate application |
| Payroll | Payroll Management (`/hr/payroll`) → Current page |
| Salary template editor | Payroll Management → Salary Templates → Create / View / Edit |
| Salary editor | Payroll Management → Payroll Structure (staff query retained) → Edit Salary |
| Attendance | Attendance Management (`/hr/attendance-dashboard`) → Current page |
| Leave detail / balance / approvals | Leave Center (`/hr/leave-center`) → Current page |
| Report templates and designer | Reports → Report templates → Create / Edit template |
| Report generation / result | Reports → Choose template (for options) → Current page |
| Performance setup | Performance Management → Settings → Setup & Readiness |
| Performance root / overview | Performance Management as current-page text |

Sidebar-only Settings and Policies & Rules groups have no landing screen, so they are omitted.
Self-service Dashboard / My Leave breadcrumbs keep their existing non-HR behavior.
Staff Directory uses exact active-path matching so onboarding does not select both entries.
Staff Onboarding appears before Staff Directory; routes, grants, and shortcuts are unchanged.
HR route-loading fallbacks show progress only; the owning screen supplies the single header.

## Partial routes

These routes require source verification before product claims:

| Route                     | Status                                                             |
| ------------------------- | ------------------------------------------------------------------ |
| `/hr/events-holidays`     | Page exists, but HR menu visibility may be commented               |
| `/hr/payroll/setting/tds` | Page exists, but menu activation is partial                        |
| `/hr/training`            | Legacy or unconfirmed ownership                                    |
| `/hr/performance`         | Prefer professional-management routes unless menu proves otherwise |

## Permission rule

Frontend permission names are gates for navigation and actions.
Backend permission constants remain canonical for security.
Compare with `../../../Shikshamitra-BE/docs/modules/hr/references/permissions.md` before changing permission names.

## Staff terminology and policy navigation

HR labels use Staff, including Staff Directory, Staff Onboarding, Staff Profile, and Staff Code.
Technical routes, API fields, and permission keys keep their employee identifiers.
Policies & Rules contains Work Calendars, Attendance Policies, Leave Policies, Payroll Policies, and Policy Assignments in that order.
The standalone `/hr/effective-preview` page is removed and returns the standard not-found response without a redirect.
Holiday Impact is not a visible workspace tab; holiday services and backend permissions remain available.

## Reporting views

Reporting has two nested destinations: Reports and Templates.

| Destination | Route |
| --- | --- |
| Reports, the default landing page | `/hr/reports` |
| Template management | `/hr/reports/templates` |
| Generate, step 1: choose a published template | `/hr/reports/generate` |
| Generate, step 2: reporting options | `/hr/reports/generate/[templateId]` |
| Captured result | `/hr/reports/runs/[runId]` |
| Create or customize a template | `/hr/reports/templates/new`, with optional `copyFrom` |
| Edit an owned or managed template | `/hr/reports/templates/[templateId]/edit` |

The former tab/mode query URLs are replaced without redirects.
Template category, library, search, page, and pageSize stay in the URL.
Report history uses URL-backed page and pageSize.
Generation carries chooser filters into the options URL and restores them on Back.
A built-in definition opens the designer only through Customize a copy.
Personal design requires Build; school management requires ManageTemplates; preview additionally requires Build.

## HR table coverage

Audit primary pages and reachable employee drawers against [the table checklist](./references/hr-table-coverage.md).
Keep reporting library, designer, generation and fixed result routes separate.

## ESIC policy settings

`hrPaths.payroll.settings.esiPolicies` opens `/hr/payroll/setting/statutory-schemes?view=policies` in the existing Statutory Schemes area.
School settings and ESIC Policies are URL-backed tabs gated by exact Statutory Schemes View permission.
Policy writes additionally require Edit, Activate, ConfigureCalculation and school-wide scope.
Template and salary editors use the selection catalogue through their own permissions without exposing policy management.

Finalize actions in Staff Onboarding list/detail navigate to the application-specific subpage. Its thin App Router entry lives in `src/app/(auth-route)/hr/(Employee)/employee/onboarding/[applicationId]/finalize/page.tsx`; the owning reader is `src/screens/hr/employee-onboarding/finalize-page.tsx`, and `FinalizeWorkflow` in the existing screen file owns the single form implementation. There is no additional sidebar destination. Return links accept only the same-origin Staff Onboarding path and known list/detail query fields; they never carry staff, statutory or salary draft values. The selected academic year stays in the existing global scope store; page navigation does not change it.
