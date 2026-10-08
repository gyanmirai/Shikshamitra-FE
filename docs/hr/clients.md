---
module: hr
domain: clients
content_type: Reference
status: canonical
updated_on: 2026-10-07
owner: frontend-team
audience: humans-and-agents
---

# Find HR frontend API clients

TL;DR: use this page to locate RTK Query clients and backend contract ownership for HR screens.
Backend endpoint behavior is canonical in `https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/modules/hr/api.md`.

## Client map

Use this table before searching `src/redux`:

| Client                             | Endpoint families                                                                             | Backend owner                   |
| ---------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------- |
| `hrOperationalDashboardApi.ts`     | Live module overview and separate server-paged staff reads                                                | HR operational dashboard        |
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

Operational overview queries use existing HR dashboard, employee, attendance, leave-policy, onboarding-application, professional-review, and payroll tags.
The dashboard consumes only the overview endpoint, while the separate staff endpoint remains available.
Appraisal list, detail, and evidence queries include a client-only access identity, refetch on entry, and discard unused data immediately.
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

`src/redux/hr/payslip-api.ts` owns issued document metadata/PDFs, version history, delivery attempts, Send/Resend, school settings, payment recording, non-monetary detail replacement and unpaid correction read/start/calculate/review/cancel/apply contracts.
It uses the shared authenticated API service and invalidates salary-slip tags after mutations.
Payment recording also invalidates payroll views.
Correction application invalidates payroll views as well as document and correction queries.
Correction controls consume recorded attendance, original totals, candidate components and concurrency stamps from the server.
The client cannot submit arbitrary monetary figures or a conflicting calculation basis.
Current selection data, rather than retained previous query data, determines delivery history.
Delivery responses include `idempotencyKey` so the selected history can acknowledge a previously unconfirmed Send request.
An unconfirmed retry reuses its document-specific key; an explicit Resend after acknowledgment uses a new key.
Delivery responses retain requestedBy as audit identity and provide requestedByDisplayName resolved by the server within the school tenant.
The history label uses that name, or Unavailable/Not recorded when the corresponding fact is absent; it never looks up arbitrary user identities from the browser.
The employee/month selection and returned current document ID determine which stored artifact is displayed.
The client never regenerates an issued PDF or fabricates a fallback document after an API failure.
`payslip-pdf-viewer.tsx` renders that private stored-artifact URL with PDF.js and a worker bundled from the installed package.
The preview and print content contain those rendered PDF pages, not a second salary template.
Download retains the original stored bytes.

The durable payroll preview client is a pending coordinated release and requires the additive backend schema.
`src/screens/hr/payroll/run-payroll/use-payroll-preview-run.ts` owns month/run URL state, bounded polling, debounced search, and late-response protection.
The monthly workbench and Payroll Overview consume the same background-run contract instead of invoking synchronous readiness calculations.
Only the requested employee page is fetched, and the backend summary remains unfiltered.
The workbench keeps the last completed page visible during recalculation and disables review, adjustment, and locking until current results are available.
Salary calculation errors use the shared problem-details parser so allocation discrepancies include the server's gross, allocated amount, and difference.

Do not infer backend behavior from a client helper alone.
Confirm request and response behavior in `https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/modules/hr/api.md` and backend `Application.Contracts/HR/**`.
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

## HR display and import contracts

Staff wording is presentation-only; RTK Query URLs, field keys, tags, enums, and permission keys retain their employee identifiers.
Policy lookup APIs remain available to assignment previews and authenticated regression tests after removal of the standalone lookup page.
Attendance download columns are Staff Code and Staff Name, while the backend normalizes Staff and Employee header aliases into the existing employee fields.

## Paid correction settlement

The payslip RTK Query client exposes settlePayslipCorrection with correction ID, concurrency stamp, target month and preview run ID.
The settlement control reuses startPayrollPreview and getPayrollPreviewStatus rather than introducing another payroll calculator.
Use currentData and the active month/academic-year selection to prevent cached or interrupted target results enabling Apply settlement.
Invalidate payslip and payroll tags after an acknowledged settlement, then require the ordinary payroll regeneration/review workflow.

The payslip settings form adopts a completed successful settings read only when the draft is clean.
An acknowledged save excludes the read that was already in flight, including a response arriving after a second consecutive save.
Pending or failed refreshes cannot replace the saved baseline with retained cache data.
Background refresh failure has its own Retry state and does not report an acknowledged write as failed.
Failed writes retain the draft and its idempotency key; transport and empty-response failures use concise settings-specific retry messages.

## Controlled employee account email

src/redux/hr/employee-account-email-api.ts exposes typed read and change operations through the shared authenticated API service.
GET /employees/{id}/account-email returns employeeEmail, accountEmail, userName, userId and the joint concurrencyToken.
PUT sends email, reason, confirmEmployeeVerified, concurrencyToken and an idempotencyKey retained for the same failed payload.
Only successful writes invalidate employee and salary-slip tags; failed writes retain the form and caches.
The backend [HR API contract](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/modules/hr/api.md) owns Identity synchronization, audit, permissions, scope, transaction and credential behavior.
No arbitrary payslip recipient or separate contact field is sent.

## Staff payroll profile integration

`src/redux/hr/employee-payroll-profile-api.ts` owns the typed profile-details PATCH and invalidates the existing employee/payroll tags.
The profile reads existing bank details, effective compensation revisions, revision history, and effective policy assignments.
Salary changes reuse the compensation workspace; policy changes reuse direct employee override, disable-override, and impact-preview clients.
The backend owns permitted groups, atomic validation, and authorization in [HR API contracts](../../../Shikshamitra-BE/docs/modules/hr/api.md).
