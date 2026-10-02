---
module: hr
domain: clients
content_type: Reference
status: canonical
updated_on: 2026-10-02
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
| `hrOperationalDashboardApi.ts`     | Live HR overview and server-paged staff reads                                                | HR operational dashboard        |
| `hrDashboardApi.ts`                | Separate attendance and payroll previews and refresh                                        | HR dashboard previews           |
| `employeeApi.ts`                   | Employees, profile tabs, status, documents, reporting, search                                 | HR employees                    |
| `employee-icard-template-api.ts`   | I-card templates, assets, and PDF download                                                    | HR employees and I-card         |
| `employee-payroll-api.ts`          | Earning components, deduction components, provident fund, professional tax, pay elements      | HR payroll settings             |
| `employee-salary-structure-api.ts` | Employee salary structure get and update                                                      | HR payroll salary structure     |
| `compensation-revision-api.ts`     | Direct effective-dated compensation save, history, and activation readiness                    | HR payroll compensation         |
| `runPayrollApi.ts`                 | Generation-bound reviews and lock, adjustments, salary slips, PDFs                            | HR payroll operations           |
| `payroll-preview-run-api.ts`       | Start/resume background calculation, status polling, and server-paged generation results       | HR payroll operations           |
| `statutory-scheme-api.ts`          | ESI rule, earning classifications, registration details, exceptions, and employee impact | HR payroll statutory settings   |
| `esi-configuration-api.ts` | ESIC settings read and direct save with concurrency stamp and idempotency key | HR payroll statutory settings |
| `attendanceApi.ts`                 | Attendance tracking, employee attendance, import preview, confirm, template, register, adjust | HR attendance and leaves        |
| `attendanceImportApi.ts`           | Automated attendance runs, rows, lock, unlock, save rows                                      | HR attendance imports           |
| `leaveApi.ts`                      | Leave policies, leave requests, actions, balances                                             | HR attendance and leaves        |
| `hr-policy-api.ts`                 | Work calendars, policies, assignments, impact, versions, audit                                | HR policies                     |
| `professional-management-api.ts`   | Dashboard, templates, cycles, reviews, evidence, feedback, outcomes, reports, audit           | HR professional management      |
| `hrReportsApi.ts`                  | Report sources, options, templates, preview, export, history                                  | HR reports                      |
| Calendar clients                   | Event and holiday type APIs, event and holiday APIs, employee selection                       | HR calendar and Calendar module |

## Cache and invalidation rules

Operational dashboard queries use existing HR dashboard, employee, attendance, and payroll tags.
The client-only access key isolates identity and grants in RTK Query without sending that key to the API.
Operational queries retain unused data for zero seconds and use `currentData` to avoid displaying a previous date or scope.
The retired combined summary and Main preview are not used by the main HR dashboard.

Use these expectations when reviewing client behavior:

| Mutation                                               | Expected invalidation                                                                        |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Attendance save, import, lock, unlock, or adjust       | Attendance views and payroll preview assumptions                                             |
| Compensation save or supersede                           | Salary structure, activation readiness, run payroll, and slips                               |
| One-time salary component update                         | Salary structure, run payroll, and slips                                                     |
| Payroll review, adjustment, or lock                    | Run payroll rows and salary slips                                                            |
| Leave create, approve, reject, or cancel               | Leave lists, balances, HR dashboard, and payroll impact                                      |
| Policy create, update, assignment, restore, or archive | Policy workspace, impact, audit, effective preview, and dependent payroll or attendance data |
| Professional management mutation                       | Review, cycle, outcome, report, and audit tags                                               |

## Contract rule

The durable payroll preview client is a pending coordinated release and requires the additive backend schema.
`src/screens/hr/payroll/run-payroll/use-payroll-preview-run.ts` owns month/run URL state, bounded polling, debounced search, and late-response protection.
The monthly workbench and Payroll Overview consume the same background-run contract instead of invoking synchronous readiness calculations.
Only the requested employee page is fetched, and the backend summary remains unfiltered.
The workbench keeps the last completed page visible during recalculation and disables review, adjustment, and locking until current results are available.
Salary calculation errors use the shared problem-details parser so allocation discrepancies include the server's gross, allocated amount, and difference.

Do not infer backend behavior from a client helper alone.
Confirm request and response behavior in `../../../Shikshamitra-BE/docs/modules/hr/api.md` and backend `Application.Contracts/HR/**`.
The salary-template RTK Query client is `src/redux/hr/salary-template-api.ts`.
It owns the complete template list, active-template choices, active component catalog, atomic active create or update, calculation, version history, default selection, and archiving through the shared authenticated API service.
The calculation contract includes Monthly salary (GROSS) and Monthly cost to school (EMPLOYER_COST) salary bases, effective month, optional employee context, target variance, and ESI preview details.
The separate employee-independent `previewSalaryTemplate` mutation posts current rules to `/payroll/salary-templates/preview` without invalidating cached templates.
Create/update send the returned preview token with sample amount and effective month; saved-template employee calculations retain their existing endpoint and authorization.
The compensation-revision client saves recurring results directly through the employee-scoped compensation endpoint, reads immutable history and readiness, and never converts system statutory preview lines into editable salary rows.
The configuration client posts the unsaved form and optional employee filters to the draft impact endpoint.
Its summary remains unfiltered, employee rows use server-authored issue labels, and saving submits the exact reviewed fingerprint.

ESIC saves invalidate payroll, payslip, salary setup, and statutory query tags.
Failed settings loads display an error instead of assuming ESIC is enabled.
The server owns the effective current month and derives compensation protection from the selected basis.

ESIC exception month inputs serialize to the first day of Start month and the inclusive last day of End month.
The existing EffectiveFrom and EffectiveTo contract remains date-based, with server validation of month boundaries.
Completed SUPERSEDED payroll runs may return their previous rows with IsCurrent false and CanLock false.
Cached rows never override the status response when determining whether payroll actions are available.
