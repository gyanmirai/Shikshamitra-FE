# HR Module PRD

Last verified against repo: 2026-06-07.

Sources: `src/constants/hr-menus.ts`, `src/screens/hr/**`, `src/redux/hr/**`, `src/redux/runPayroll/**`, `e2e/hr/**`, `../Shikshamitra-BE/src/ShikshaMitra.Application.Contracts/HR/**`.

## Product Goal

Give school administrators and HR staff one module to manage staff records, attendance, leave, payroll, HR policy assignment, performance reviews, reports, and HR notifications.

## Personas

| Persona | Main needs |
| --- | --- |
| HR administrator | Configure HR, manage employees, run payroll, approve leave, export reports |
| Payroll operator | Maintain components, assign salary structures, preview/review/lock payroll, issue payslips |
| Attendance operator | Mark attendance, import device rows, correct registers, lock days/batches |
| Reporting manager | Review leave/performance for assigned employees |
| Employee/teacher | View profile-related HR data, apply leave, see balances/payslips where permitted |
| Principal/leadership | View dashboards, payroll readiness, attendance, reports, performance outcomes |

## Functional Requirements

| Area | Current requirements | Success state |
| --- | --- | --- |
| Dashboard | Show HR summary, attendance trend, payroll status, leaves, alerts, quick actions, birthdays/anniversaries, recent activity | Users can assess HR health without opening detail screens |
| Employees | Create/search/update employees; manage personal, family, additional, work experience, payroll, reporting, Academic Permission, status, documents, and profile tabs. Personal Information does not capture organization; Academic Permission owns organization/stage scope. | Employee profile persists and is searchable by name, code, email, mobile |
| Employee documents | Upload/list/download profile documents and profile picture; validate file constraints | Valid documents display; invalid uploads fail with controlled UI errors |
| I-card | Manage I-card templates/assets and generate employee I-card PDFs | Templates and generated cards use employee profile data |
| Payroll settings | Manage earning components, deduction components, PF rules; pages also exist for TDS/professional tax | Active components/rules can be selected by salary/payroll flows |
| Salary structure | Assign fixed and temporary earning/deduction lines to employees | Saved structure reloads and feeds payroll preview |
| Run payroll | Check readiness, preview month payroll, add adjustments, mark reviewed, lock selected employees | Locked payroll creates stable salary slip snapshots |
| Payslips | Fetch salary slip data and PDF/preview PDF | Slip totals match locked payroll snapshot |
| Attendance | Mark day attendance, import attendance file, view date-wise and employee-wise tracking, adjust attendance register | Attendance summaries, register rows, and payroll tags update after changes |
| Attendance locks | Lock/unlock day attendance and imported batches | Locked state blocks or guards edits and protects payroll basis |
| Leave | Configure leave policies with Paid/Unpaid rule buckets, apply leave, approve/reject, show leave center and balances | Request status, balances, and payroll impact reflect Paid or Unpaid rules |
| HR policies | Manage work calendar, leave, payroll, attendance policies; clone/archive/default; assign policies; preview impact/audit/version data | Effective employee policies can be inspected for a date |
| Performance management | Manage templates, cycles, assignments, reviews, observations, evidence, feedback, outcomes, reports, audit, PDFs | Review cycle progresses through publish, assignment, stages, calibration/finalization |
| Reports | Build templates, preview report data, export, track export history | HR report outputs reflect selected source/options |
| Notifications | Manage employee, attendance/leave, and event/holiday notification screens | HR notifications can be configured and reviewed |
| Calendar integration | Use HR employees/groups for calendar events and holidays; policy calendars interact with holiday impact | Event/holiday audiences persist and can be validated through APIs |

## Scope Markers

| Surface | Status | Notes |
| --- | --- | --- |
| Main HR menu in `hr-menus.ts` | Implemented | Dashboard, Employee, Payroll, Attendance, Leave, Performance, Policies, Reports, Notification |
| `/hr/events-holidays` | Partially implemented/commented in menu | Pages exist, but HR menu item is commented; calendar module has active event/holiday routes |
| `/hr/payroll/setting/tds` and professional tax | Partially implemented/commented in menu | Pages and backend settings contracts exist; menu entries are commented |
| `/hr/training`, `/hr/performance` | Known caveat | Pages exist outside main menu model; verify ownership before adding requirements |
| Device integration naming | Known caveat | Menu label maps `/hr/biometric-attendance`; separate `/hr/biometric-integration` page exists |

## Acceptance Criteria

| Workflow | Acceptance |
| --- | --- |
| Employee onboarding | Create succeeds, generated employee code appears, employee is searchable and profile tabs load |
| Employee edit | Personal, family, additional, work experience, payroll, reporting, and academic fields persist |
| Employee status | Required remarks are enforced; blocked transitions remain blocked; same-status API stays idempotent |
| Payroll setup | Earning/deduction/PF settings save, update, preview impact, and feed salary structure |
| Payroll cycle | Readiness has no blocker for prepared employee, preview totals are correct, review/lock succeeds, slip matches preview |
| Attendance | Manual or imported changes update attendance summaries and invalidate payroll preview |
| Leave | Apply/approve/reject paths update status and leave center/balance views |
| Policies | CRUD/clone/archive/default/assignment/impact/audit/version flows use correct permissions and visible audit/value formatting |
| Performance | Templates/cycles/reviews/outcomes/report endpoints map to professional-management UI states |
| Reports | Catalog/options/preview/export/history all route through HR report API client |
| Permissions | Lower-permission users cannot perform protected write workflows |

