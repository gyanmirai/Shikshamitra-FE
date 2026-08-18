---
module: hr
domain: workflows
content_type: Reference
status: canonical
updated_on: 2026-08-15
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
| Employee profile update    | Employee list and profile tabs                                              | `employeeApi.ts`                             |
| Employee profile dashboard | Employee profile Dashboard tab and self-service HR dashboard fallback       | `employeeApi.ts`                             |
| Employee documents         | Employee profile documents tab                                              | `employeeApi.ts`                             |
| I-card generation          | `/hr/i-card`                                                                | `employee-icard-template-api.ts`             |
| Payroll component setup    | `/hr/payroll/setting/*`                                                     | `employee-payroll-api.ts`                    |
| ESI statutory setup        | `/hr/payroll/setting/statutory-schemes`                                     | `statutory-scheme-api.ts`                    |
| Salary structure           | `/hr/payroll/structure`                                                     | `employee-salary-structure-api.ts`           |
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
The Payroll onboarding step and dedicated Payroll Structure screen reuse the same salary builder.
Salary templates explain that ESI is system-managed and link to the statutory setup workflow.
The ESI workflow keeps establishment, wage mapping, employee readiness, and impact approval in a four-step URL-addressable workspace.
Authorized users can add dated, reasoned ESI exceptions from an employee impact row and review the immutable exception history before approval.
Run Payroll shows ESI wages, coverage decision, rule version, insurance number, contribution period, employee deduction, and employer contribution.
Users select a template, choose Gross or Take-home, enter the quoted monthly amount, select PF applicability and rule, calculate, review the formula trace, and apply the generated lines.
Applying preserves temporary components, replaces recurring lines, stores provenance, and distinguishes editable ordinary lines from rule-controlled PF and professional-tax lines.
Professional-tax settings also control whether tax is deducted in an employee's employment cessation month.
Salary Template settings creates a blank draft and then opens the dedicated editor route.
The Salary Template list opens in the standard table view, with an optional URL-backed Card view.
Selecting a table row, template-name link, View action, or card opens the latest template version.
Drafts remain editable only with Edit permission, while published and archived versions open read-only.
The editor adds, removes, configures, and reorders active earning and deduction components in separate sections.
Incomplete drafts can be saved, while publishing requires one Basic earning and one remainder earning and shows an actionable validation summary.
Template formulas override component-master formulas only when the template generates an employee salary structure.
