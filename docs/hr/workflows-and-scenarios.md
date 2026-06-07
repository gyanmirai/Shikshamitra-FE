# HR Workflows And Scenarios

Last verified against repo: 2026-06-07.

Sources: `src/screens/hr/**`, `src/redux/hr/**`, `src/redux/runPayroll/runPayrollApi.ts`, `e2e/hr/**`, `e2e/hr-calendar-e2e.spec.ts`, `../Shikshamitra-BE/src/ShikshaMitra.Application.Contracts/HR/**`.

## Core Workflows

| Workflow | Actor | Trigger | Core steps | Data/API touchpoints | Success | Failure/edge cases |
| --- | --- | --- | --- | --- | --- | --- |
| Employee onboarding | HR admin | Open `/hr/employee` and create employee | Fill personal info, upload profile image where used, assign organization/role details, save | `employeeApi.ts`, employee personal/basic contracts | Employee code generated; record appears in search/list/profile | Required fields, invalid email/mobile/pincode, future DOJ, duplicate identifiers |
| Employee profile update | HR admin | Edit existing employee | Update personal, family, additional, work experience, payroll/bank, reporting, academic steps | `employeeApi.ts`, family/additional/work-experience/reporting/payroll contracts | Tabs reload without runtime errors and values persist | Work date ordering, bank validation, missing manager, permission denial |
| Employee status change | HR admin | Change status from employee profile/list | Select status, enter remarks, submit | `employeeApi.ts`, status contracts | Status and remarks persist | Left/Retired to Active blocked; remarks required; same-status API idempotent |
| Employee documents | HR admin | Open profile Documents tab | Upload valid file, list/download/view document | `employeeApi.ts`, document contracts | File appears in document list | Missing, unsupported, or oversized files are rejected |
| I-card generation | HR admin | Open `/hr/i-card` | Configure template/assets, select employees, generate/download PDF | `employee-icard-template-api.ts`, I-card contracts | Generated PDF uses employee profile fields | Invalid layout/schema, missing asset, missing employee fields |
| Payroll component setup | Payroll operator | Open payroll settings | Create/update earning, deduction, PF; preview update/delete impact where supported | `employee-payroll-api.ts`, payroll settings contracts | Active components are selectable in salary structure | Impact preview hash required for confirmed destructive updates/deletes |
| Salary structure | Payroll operator | Open `/hr/payroll/structure` or employee salary structure dialog | Select employee, assign fixed and temporary earning/deduction lines, save | `employee-salary-structure-api.ts`, salary structure contracts | Saved structure reloads and feeds run payroll preview | Invalid fixed amount, bad temp month, missing active component |
| Manual attendance | Attendance operator | Open `/hr/manual-attendance` | Select date, edit employee statuses, save, optionally lock/unlock day | `attendanceApi.ts`, take-attendance contracts | Day summary/register reflects statuses | Locked day blocks edits; weekend/holiday policy may affect payroll basis |
| Attendance tracking/register | Attendance operator | Open `/hr/attendance-tracking` | View date-wise/employee-wise, grouped register, adjust or bulk adjust | `attendanceApi.ts`, attendance tracking/register contracts | Register rows and payroll preview invalidate after adjustment | Invalid date range, locked payroll basis, permission denial |
| Attendance import | Attendance operator | Upload attendance file or review device import | Preview, confirm, inspect automated run rows, save rows, lock/unlock batch | `attendanceApi.ts`, `attendanceImportApi.ts`, import contracts | Rows classify and save into attendance basis | Header parse errors, row warnings, unknown employee, locked batch |
| Leave setup | HR admin | Open leave settings | Configure leave types and policies | `leaveApi.ts`, leave type/policy contracts | Active leave types/policies are available for requests | Invalid accrual/paid settings, duplicate names, archived/inactive policy |
| Leave request/action | Employee/manager/HR | Apply or act on leave | Submit leave request, approve or reject, inspect center/balance | `leaveApi.ts`, leave management contracts | Status changes and balances update | Insufficient balance, invalid date range, missing reason, unauthorized approver |
| Policy management | HR admin | Open Policies & Rules | Manage work calendar, leave, payroll, attendance policies; clone/archive/default; inspect versions/audit | `hr-policy-api.ts`, policy contracts | Policy list and audit/version/impact views update | Overlapping/effective date conflicts, restore impact, archived policy restrictions |
| Policy assignment | HR admin | Open `/hr/assignments` or employee override | Assign policy by scope or employee override; preview impact | `hr-policy-api.ts`, assignment contracts | Effective employee policies resolve for selected date | Conflicting assignments, disabled override, missing scope |
| Payroll run | Payroll operator | Open `/hr/payroll/run-payroll` | Check readiness, preview month, add adjustments, mark reviewed, lock selected employees | `runPayrollApi.ts`, run payroll contracts | Locked snapshot created; row status and counts update | Missing attendance/salary/policy data, stale preview, already locked row |
| Payslip | Payroll operator/employee | Open payslip generation | Fetch salary slip, PDF, or preview PDF | `runPayrollApi.ts`, salary slip contracts | Slip totals match locked snapshot | No locked snapshot, stale draft, employee not eligible |
| Performance cycle | HR/performance admin | Open professional management | Manage templates, publish cycle, assign employees, run reviews, observations/evidence/feedback, finalize outcomes | `professional-management-api.ts`, professional management contracts | Cycle/review/outcome/report state progresses | Missing template, unassigned employees, invalid transition, confidential outcome permission |
| HR reports | HR admin/leadership | Open `/hr/reports` | Select source/options/template, preview, export, monitor history | `hrReportsApi.ts`, report contracts | Preview/export match selected report definition | Large export job pending/failure, invalid filters |
| HR notifications | HR admin | Open `/hr/hr-notification` | Configure employee, attendance/leave, event/holiday notification screens | notification screens, notification history/settings contracts | Notifications are configurable and traceable | Missing channel/settings or permission denial |
| HR calendar events/holidays | HR/admin calendar user | Use HR or calendar event/holiday pages | Create event/holiday, select HR-backed group audience, verify persistence | calendar event/holiday APIs and HR employee/group selection | Audience IDs persist and render | Menu item is commented in HR; calendar module owns active route variants |

## Scenario Matrix

| Scenario | Preconditions | Expected behavior |
| --- | --- | --- |
| New teaching employee with payroll | Active academic year, role/options loaded, payroll components active | Employee can be created, salary structure assigned, payroll preview includes employee |
| Current-month payroll lock | Employee active, salary structure saved, attendance prepared, readiness clean | Review then lock succeeds; salary slip becomes stable |
| Attendance correction after preview | Payroll not locked, attendance day/register editable | Attendance edit invalidates payroll preview and recalculates payable days |
| Locked attendance day | Day locked by authorized user | Edit is blocked or controlled; unlock restores edit path |
| Leave approval from reporting chain | Request has valid submitter and approver chain | Approve/reject changes status and dashboard/leave lists refresh |
| Policy change with impact | Existing policy assigned to employees | Impact preview shows affected employees before change/assignment/restore |
| Performance finalized review | Cycle published and employees assigned | Self/reviewer stages, outcome, and finalization are recorded with audit/report access |
| Lower-permission HR route access | User lacks write permission | View may load if permitted; write actions hidden or API returns controlled 403 |

## Integration Rules

| Integration | Rule |
| --- | --- |
| Attendance to payroll | Attendance mutations must invalidate run payroll previews and salary slip assumptions |
| Salary structure to payroll | Salary lines and active components define payroll preview line items |
| Payroll lock to payslip | Locked payroll snapshot is the source for salary slips and PDFs |
| Policies to attendance/leave/payroll | Effective policy resolution depends on employee, assignment scope, and date |
| Employee status to module behavior | Inactive/left/retired employees should not behave as active payroll/attendance candidates |
| Calendar to HR | Event/holiday audiences can use HR-backed groups and employees |

