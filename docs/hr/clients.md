---
module: hr
domain: clients
content_type: Reference
status: canonical
updated_on: 2026-08-13
owner: frontend-team
audience: humans-and-agents
---

# Find HR frontend API clients

TL;DR: use this page to locate RTK Query clients and backend contract ownership for HR screens.
Backend endpoint behavior is canonical in `../../../Shikshamitra-BE/docs/modules/hr/api.md`.

## Client map

Use this table before searching `src/redux`:

| Client                             | Endpoint families                                                                             | Backend owner                   |
| ---------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------- |
| `hrDashboardApi.ts`                | HR dashboard summary, preview, refresh                                                        | HR dashboard                    |
| `employeeApi.ts`                   | Employees, profile tabs, status, documents, reporting, search                                 | HR employees                    |
| `employee-icard-template-api.ts`   | I-card templates, assets, and PDF download                                                    | HR employees and I-card         |
| `employee-payroll-api.ts`          | Earning components, deduction components, provident fund, professional tax, pay elements      | HR payroll settings             |
| `employee-salary-structure-api.ts` | Employee salary structure get and update                                                      | HR payroll salary structure     |
| `runPayrollApi.ts`                 | Payroll run, readiness, reviews, adjustments, salary slips, PDFs                              | HR payroll operations           |
| `attendanceApi.ts`                 | Attendance tracking, employee attendance, import preview, confirm, template, register, adjust | HR attendance and leaves        |
| `attendanceImportApi.ts`           | Automated attendance runs, rows, lock, unlock, save rows                                      | HR attendance imports           |
| `leaveApi.ts`                      | Leave policies, leave requests, actions, balances                                             | HR attendance and leaves        |
| `hr-policy-api.ts`                 | Work calendars, policies, assignments, impact, versions, audit                                | HR policies                     |
| `professional-management-api.ts`   | Dashboard, templates, cycles, reviews, evidence, feedback, outcomes, reports, audit           | HR professional management      |
| `hrReportsApi.ts`                  | Report sources, options, templates, preview, export, history                                  | HR reports                      |
| Calendar clients                   | Event and holiday type APIs, event and holiday APIs, employee selection                       | HR calendar and Calendar module |

## Cache and invalidation rules

Use these expectations when reviewing client behavior:

| Mutation                                               | Expected invalidation                                                                        |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Attendance save, import, lock, unlock, or adjust       | Attendance views and payroll preview assumptions                                             |
| Salary structure or component update                   | Payroll components, salary structure, run payroll, and slips                                 |
| Payroll review, adjustment, or lock                    | Run payroll rows and salary slips                                                            |
| Leave create, approve, reject, or cancel               | Leave lists, balances, HR dashboard, and payroll impact                                      |
| Policy create, update, assignment, restore, or archive | Policy workspace, impact, audit, effective preview, and dependent payroll or attendance data |
| Professional management mutation                       | Review, cycle, outcome, report, and audit tags                                               |

## Contract rule

Do not infer backend behavior from a client helper alone.
Confirm request and response behavior in `../../../Shikshamitra-BE/docs/modules/hr/api.md` and backend `Application.Contracts/HR/**`.
The salary-template RTK Query client is `src/redux/hr/salary-template-api.ts`.
It owns template listing, the active component catalog, blank draft creation, draft updates, calculation, version creation, publishing, default selection, cloning, and archiving through the shared authenticated API service.
