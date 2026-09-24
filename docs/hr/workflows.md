---
module: hr
domain: workflows
content_type: Reference
status: canonical
updated_on: 2026-09-17
owner: frontend-team
audience: humans-and-agents
---

# Trace HR frontend workflows

TL;DR: use this page to connect HR screens, clients, and browser tests.
Backend workflow rules are canonical in `../../../Shikshamitra-BE/docs/modules/hr/workflows.md`.

## Core workflows

Use this map to find the first screen and client:

| Workflow                   | Screen entry                                                                | Main client                                  |
| -------------------------- | --------------------------------------------------------------------------- | -------------------------------------------- |
| Employee onboarding        | `/hr/employee/onboarding`                                                   | `employeeOnboardingApi.ts`                   |
| HR leadership dashboard    | `/hr/dashboard`                                                             | `hrDashboardApi.ts`, `leaveApi.ts`           |
| Employee profile update    | Employee list and profile tabs                                              | `employeeApi.ts`                             |
| Employee profile dashboard | Employee profile Dashboard tab and self-service HR dashboard fallback       | `employeeApi.ts`                             |
| Employee documents         | Employee profile documents tab                                              | `employeeApi.ts`                             |
| I-card generation          | `/hr/i-card`                                                                | `employee-icard-template-api.ts`             |
| Payroll component setup    | `/hr/payroll/setting/*`                                                     | `employee-payroll-api.ts`                    |
| ESI statutory setup        | `/hr/payroll/setting/statutory-schemes`                                     | `statutory-scheme-api.ts`                    |
| Compensation revisions     | `/hr/payroll/structure`                                                     | `compensation-revision-api.ts`                |
| One-time salary components | `/hr/payroll/structure`                                                     | `employee-salary-structure-api.ts`            |
| Payroll run                | `/hr/payroll/run-payroll`                                                   | `runPayrollApi.ts`                           |
| Payslips                   | `/hr/payroll/payslip-generation`                                            | `runPayrollApi.ts`                           |
| Manual attendance          | `/hr/manual-attendance`                                                     | `attendanceApi.ts`                           |
| Attendance tracking        | `/hr/attendance-tracking`                                                   | `attendanceApi.ts`                           |
| Attendance import          | Device or file import screens                                               | `attendanceApi.ts`, `attendanceImportApi.ts` |
| Leave policy setup         | `/hr/leave-policies`                                                        | `leaveApi.ts`                                |
| Leave request and approval | `/hr/apply-leave`, `/hr/leave-approvals`, `/hr/leave-center`                | `leaveApi.ts`                                |
| Policy management          | `/hr/calendars`, `/hr/payrollPolicies`, `/hr/attendance`, `/hr/assignments` | `hr-policy-api.ts`                           |
| Professional management    | `/hr/professional-management/**`                                            | `professional-management-api.ts`             |
| HR reports                 | `/hr/reports`                                                               | `hrReportsApi.ts`                            |

## Employee onboarding behavior

An invitation remains at Invitation sent until the candidate submits the public application, and only that unsubmitted state offers link regeneration.
Workflow statuses move forward, while Finalized, Rejected, and Withdrawn applications are terminal and their status selector is disabled.
Deleting an application requires explicit confirmation.
Finalization validates the complete employee record, including Category and Family Caste, before it sends one atomic request containing academic permissions only for a teaching employee.
The finalization wizard blocks step changes, its close control, backdrop handling, and Escape while saving, and it focuses the first invalid field when validation fails.
The public application requires a name for entered family details and organization, designation, and start date for entered work details.
Public date checks use the Asia/Kolkata institution date, and untouched work rows are omitted from the payload.
Resume and photo selections are optional, and selected files are validated against the backend size, extension, MIME, safe-filename, and signature rules.
Employee role selectors fail closed unless the backend marks the role with Employee `roleAudience` and `employeeOnboardingAssignable: true`, and Admin, Super Admin, Student, and Parent remain excluded.
Missing employee-group metadata remains compatible with both employee groups only after the role passes that explicit onboarding approval.
Changing Employee Group clears an already selected role when its explicit Teaching or Non Teaching classification is no longer compatible.
Role Management lets administrators classify Employee roles as Teaching only, Non Teaching only, or available to both groups and explicitly approve non-reserved Employee roles for onboarding.
Employee document upload, view, and download controls are excluded from exports, and their mutations rely on the shared request layer for one success or failure toast.

## I-card designer behavior

The field palette and the QR code and barcode controls share one visibility state.
Changing card orientation reflows the selected preset so every element remains inside the printable card.
Changing a layout palette color immediately updates preset-bound styles without replacing inspector-customized colors.
The live preview supports one-card navigation and a searchable, scrollable view of all selected employees.
The one-card preview clamps its position whenever the selected employee set shrinks.

## Employee profile dashboard behavior

The profile dashboard loads attendance, leave balance, pending leave requests, and work-calendar holidays from `/api/employees/{employeeId}/dashboard`.
The signed-in employee path resolves `/api/employees/me` first, while HR users can load the same tenant- and scope-checked dashboard for an accessible employee.
Missing attendance, academic-year, or leave-policy data is shown as an explicit unavailable or not-marked state and is never replaced with sample values.
Approved leave fills an unrecorded dashboard attendance day, while a stored attendance record remains authoritative for the same date.
Stored attendance alone drives the recorded-day count and attendance percentage.
Approved leave remains distinct from recorded absence in the day detail and monthly trend.
Profile tabs use a horizontally scrollable, consistently aligned tab list on narrow layouts.

## Attendance and payroll interaction behavior

Reset on manual attendance restores the last loaded day state, including an approved leave status, instead of inventing a new pending state.
Changing the selected attendance date clears the prior date's rows and lock state until the new response arrives, and row, save, reset, and lock actions stay disabled during that transition.
Manual Present and Half Day clock values are retained independently when a user switches between those statuses before saving.
Saving manual attendance invalidates cached attendance, payroll, and HR dashboard data after the day data is persisted.
The device attendance screen starts with the current month and keeps the empty-state icon and message in the shared empty-state layout.
Payslip content is keyed by both employee and payroll month, and a previous response is not rendered while a new selection is loading.
Only a 404 response is shown as a missing payslip, while access, server, and network failures provide a retry action.
Percentage-based earning components list only valid earning-component dependencies and surface backend dependency errors on the component field.

## Policy, dashboard, and report behavior

Policy workspaces show page-specific guidance, keep save errors next to the submit action, and search employee assignment targets through the server after two characters.
Work calendars prevent all seven days from becoming weekly offs and constrain effective-date years to 1900 through 2100 before submission.
The leave-policy impact drawer is read-only, and archive confirmation is a separate explicit action.
Policy tables query current and archived records independently with server-side search, count, and pagination.
The leave-policy workspace can restore an archived policy as a draft, while employee and assignment selectors continue to request active policies only.
Policy audit entries omit unchanged values and missing editor metadata, render weekly-off numbers as weekday names, and show semantic holiday changes and real holiday-summary counts.
Audit events show the first eight semantic changes and provide a Show N more control without discarding the remaining differences.
Changing an effective-policy employee lookup clears the selected employee ID as soon as the visible text diverges, and the prior preview is hidden until the current request resolves.
The HR dashboard New Joiners metric opens a selected-month employee summary before the user chooses whether to open the full directory.
The HR dashboard excludes approved leave without stored attendance from the missing-attendance count and attendance-rate denominator.
Approved half-day leave removes one-half attendance unit while the unrecorded remainder stays visible as missing attendance.
Stored attendance overrides a same-day approved-leave overlay in HR dashboard totals and trends.
The reports center filters export history by requested-date presets or a custom range and offers removal only for an owned failed export when the user has delete permission.
An inverted custom export-history range pauses the query instead of loading unfiltered history.
Changing export-history filters clears open details and delete confirmation state, hides prior-query rows, and disables row actions until the current response arrives.
Queue, retry, regenerate, and schedule-run actions clear the history date filter before highlighting the new export.
Custom report empty states render directly, so the reports center shows one icon and one message.

## HR leadership dashboard behavior

The permissioned `/hr/dashboard` keeps the standard HR Dashboard heading and stacked breadcrumb visible while its saved snapshot is loading, empty, stale, refreshing, or failed.
The page presents one summary surface followed by Action Center and Workforce Overview, Attendance Overview and Payroll Readiness, and a full-width People Updates section.
Summary metrics stay read-only when a user lacks the destination permission, while permitted metrics use normal links to employee, attendance, leave, and payroll workflows.
The dashboard omits Onboard Employee and Reports shortcuts because those destinations remain available through HR navigation.
Refresh is the only page-header control and freshness metadata appears below the title without a separate bordered surface.
Action Center combines deterministic insights with recent leave approvals and keeps explicit approval or rejection confirmation, required rejection remarks, mutation feedback, and the permission-aware View All link.
Attendance charts include a text summary of each plotted day, and long employee or insight text wraps without causing page-level horizontal overflow.
The dashboard uses opaque neutral surfaces, low elevation, and spacing for structure, with separators reserved for repeated rows in dialogs.
Semantic colors remain limited to statuses, icons, progress, chart series, and primary actions.
Users without the permissioned HR dashboard continue to receive the employee self-service profile dashboard fallback.

## Integration rules

Frontend workflows must respect backend data ownership:

| Integration                        | Rule                                                                                                        |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Attendance to payroll              | Attendance mutations must refresh payroll preview assumptions                                               |
| Leave to payroll                   | Paid and unpaid leave state must be visible in payroll impact paths                                         |
| Policy to attendance and payroll   | Effective policy preview must explain the source policy and date                                            |
| Payroll lock to payslip            | Locked payroll snapshot is the source for slip totals                                                       |
| Employee status to module behavior | Inactive, left, and retired employees must not behave as active candidates without explicit backend support |
| Calendar to HR                     | Event and holiday audience selection may involve Calendar module ownership                                  |

## Partial workflow rule

Do not add a route to docs as active navigation until `src/constants/hr-menus.ts` exposes it.
If a page exists but menu access is commented or unclear, mark the workflow as partial.
The Payroll onboarding step and dedicated Payroll Structure screen reuse the same compensation builder.
Salary templates explain that ESI is system-managed and link to the statutory setup workflow.
The ESI workflow uses three URL-backed recurring work areas named Overview, Employees, and Settings, while preserving the `view=advanced` URL value.
Legacy `tab=applicability|wages|employees|review` links normalize to setup readiness, earning classifications, Employees, and monthly impact respectively.
Overview combines readiness tasks, the effective rate strip, unfiltered monthly totals, human-readable blockers, and fingerprinted activation review.
Employees automatically loads the current-month preview with server-backed search, filters, sorting, and pagination, then opens contribution, enrollment, and override details in a responsive drawer.
Settings shows only earning classifications needing attention by default and saves changed classifications for one effective payroll month.
Workspace navigation and reloads warn about unsaved changes; application-wide browser-history protection remains an acceptance gap.
Compensation-revision blockers link directly to Payroll Structure with an `employeeId` query parameter that preselects the employee.
Authorized users can add dated, reasoned ESI exceptions from an employee impact row and review the immutable exception history before approval.
PwD enrollment review can record a government-funded employer-share relief period only after the PwD category, start date, and disability evidence are supplied.
The impact preview distinguishes employee, employer, and government ESI funding.
Run Payroll shows ESI wages, coverage decision, rule version, insurance number, contribution period, employee deduction, employer contribution, and government contribution.
Users select a template, choose Gross, Take-home, or Employer Cost, select the protection policy and effective month, enter the quoted monthly amount, select PF applicability and rule, calculate, and review earnings, employee deductions, employer contributions, ESI, target variance, and the formula trace.
New employees remain Inactive after direct creation or application finalization and show Payroll setup required.
Salary setup preselects the school default template, the template basis and protection policy, the joining month, and the template PF defaults.
Users calculate and save salary directly as an effective immutable revision without a draft or approval queue.
A later save creates another revision, supersedes the previous effective revision for the same month, and keeps future-effective revisions scheduled.
After salary is ready, users with Employee Edit permission activate the employee as a separate action.
Only effective revisions drive payroll, while one-time earning and deduction components remain a separate editable list.
System-managed statutory lines stay visible in the calculation but are never persisted as editable employee components.
Run Payroll and payslips show revision provenance and protected-target drift without silently changing salary or blocking lock.
Professional-tax settings also control whether tax is deducted in an employee's employment cessation month.
Salary Template settings uses one full-height table for Active, Needs setup, and Archived templates.
The shared inline breadcrumb header owns the Create template action and places reusable-default guidance in its information tooltip.
Dedicated create and edit pages use Configure and Review, with compact shared controls, a month picker, and a fixed action footer.
Configure shows Basic Information above side-by-side Earnings and Deductions on large screens, stacking the collections on smaller screens.
Component values remain directly editable, while expandable details expose formulas, purpose, dependencies, ordering, and removal.
New rows expand and focus their first setting; validation expands invalid rows.
Review validates configuration without saving or calculating; Create Template or Save Changes creates the version after a current successful preview.
The title and breadcrumb return action remain available while loading and when loading fails.
Selecting an editable table row, template-name link, or Edit action opens the dedicated template page directly in edit mode.
The create page requires Add and a template detail page requires View; mutation controls additionally require Edit.
The page guards unsaved navigation and pins the loaded version so background refreshes do not overwrite edits.
View-only users and archived templates open the same editor read-only.
The editor adds, removes, configures, and reorders active earning and deduction components in separate sections.
Save changes validates the complete template and atomically creates the next active immutable version.
Calculate previews the current rules for new and existing templates before saving.
Changes to rules, values, dependencies, order, compensation defaults, PF, sample amount, or effective month clear the result and disable Save until another successful calculation.
Name and description edits retain the preview.
Late responses for superseded inputs are ignored, calculation errors remain inline, and the preview expires after 30 minutes.
Review shows the sample earning and deduction breakdown, employer contributions, target difference, and statutory warnings.
The sample does not establish universal employee eligibility.
The review step explains that the new version applies to future salary setups while existing employees remain pinned to their saved version.
Template formulas override component-master formulas only when the template generates an employee salary structure.
Template versions define a default quote basis, protection policy, PF applicability, and PF rule.
Fixed and percentage formulas keep an editable empty numeric value, while remainder and statutory formulas explicitly show that their value is calculated automatically.

## Built-in Gross Salary

Earning and deduction settings offer Gross Salary in the percentage calculation-base selector under System values.
The selected base and fixed or variable value behavior survive save and reopen.
New template rows inherit the master calculation base and configured percentage.
Salary structure generation labels the resolved value Full-month gross and supports Gross, Take-home, and Employer Cost / CTC inputs.
Run Payroll and payslips distinguish Full-month gross, attendance-adjusted Gross Salary, Additional earnings, Total earnings, deductions, and net pay.
Gross Salary is a read-only summary, separate from the regular earning lines that allocate it.
The backend calculation contract and policy behavior are documented in [HR backend workflows](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/modules/hr/workflows.md#built-in-gross-salary).
