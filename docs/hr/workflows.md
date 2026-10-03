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
The Payroll onboarding step links to the dedicated salary setup screen.
Salary setup saves amounts and template provenance in the compensation revision, without copying partial salary metadata into the separate bank-details or one-time-component form.
Full-month gross is agreed through salary setup; earned gross is calculated by payroll using payable days and the configured salary-day basis.
After saving an employee as inactive, HR can open **ESIC details** directly from the Payroll onboarding step or salary setup before saving salary or activating the employee.
The action reuses the enrollment drawer and requires Statutory Schemes View; its fields and Save action additionally require ManageEnrollment.
The onboarding drawer omits unavailable contribution totals and the settings-only override history.
Saving registration refreshes activation readiness and clears the previous salary calculation without resetting salary inputs.
An insurance-number activation blocker directs HR to complete ESIC details; registration pending does not enable activation.
Enrollment failures and background refreshes preserve the open draft.
Salary templates explain that ESI is system-managed and link to the statutory setup workflow.
ESIC uses one compact Formik settings form with a calculation switch, conditional school registration fields, and standard Save/Cancel actions.
The server persists an ESIC-on baseline for new schools with unknown legal registration facts left empty.
The scope text reads "Applies to current and future unlocked payroll."
Save is direct, without an impact preview, confirmation, month picker, or scheduling controls.
Errors and background refreshes preserve the draft and original concurrency token.
Rules, earning classifications, and change history remain collapsed.
Employee attention items appear only when relevant.
An optional shared employee table uses server-backed paging, search, and sorting.
Employee details open in the existing drawer, where HR supplies registration facts and supported exceptions.
Navigation and reload guards protect unsaved edits.
Compensation-revision blockers link directly to Payroll Structure with an `employeeId` query parameter that preselects the employee.
Authorized users can add dated, reasoned ESI exceptions from an employee impact row and review the immutable exception history before approval.
PwD enrollment review can record a government-funded employer-share relief period only after the PwD category, start date, and disability evidence are supplied.
The impact preview distinguishes employee, employer, and government ESI funding.
Payslips show earned gross, employee deductions, and net pay.
Employer contributions remain in school cost reporting and audit evidence.
Off mode omits ESI amounts and presentation, including empty ESI payslip rows.
Users select a template, choose Monthly salary or Monthly cost to school (CTC), select the effective month, enter the quoted monthly amount, select PF applicability and rule, calculate, and review earnings, employee deductions, employer contributions, ESI, target variance, and the formula trace.
New employees remain Inactive after direct creation or application finalization and show Payroll setup required.
Salary setup preselects the school default template, the template salary basis, the joining month, and the template PF defaults.
Users calculate and save salary directly as an effective immutable revision without a draft or approval queue.
A later save creates another revision, supersedes the previous effective revision for the same month, and keeps future-effective revisions scheduled.
After salary is ready, users with Employee Edit permission activate the employee as a separate action.
Only effective revisions drive payroll, while one-time earning and deduction components remain a separate editable list.
System-managed statutory lines stay visible in the calculation but are never persisted as editable employee components.
Run Payroll shows compensation revision provenance and protected-target drift without silently changing salary or blocking lock.
Employee payslips omit employer cost and compensation protection details.
Professional-tax settings also control whether tax is deducted in an employee's employment cessation month.
Salary Template settings uses one full-height table for Active, Needs setup, and Archived templates.
The shared inline breadcrumb header owns the Create template action and places reusable-default guidance in its information tooltip.
Dedicated create, edit, and view pages use a continuous form with compact shared controls, a month picker, and a persistent action footer.
Basic Information and compact Statutory Defaults share the desktop top row at a two-to-one width ratio with equal content-driven heights and aligned headers.
Earnings and Deductions use equal-width, 480 px desktop panels with stationary headers and independently scrolling component lists.
Tablet and mobile stack the sections with natural heights, and Sample Calculation spans the page below the component panels.
Statutory guidance stays concise, with longer explanations available through How statutory rules apply.
Compact rows place the name and calculation summary beside the editable value and expand action.
Ordinary has no row label; meaningful purposes appear inline without chips.
Expandable details expose formulas, purpose, dependencies, ordering, and removal.
New rows expand and scroll into view before focusing their first setting; validation expands and reveals invalid rows inside the correct list.
Reordering keeps focus with the moved component when its action remains available.
Preview Calculation scrolls to and focuses the sample section without saving or calculating.
Calculate validates configuration, expands invalid rows, and focuses the first error before sending a preview request.
Create Template or Save Changes creates the version after a current successful preview, with the footer explaining unmet save requirements.
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
Sample Calculation shows the sample earning and deduction breakdown, employer contributions, target difference, and statutory warnings.
The sample does not establish universal employee eligibility.
Basic Information explains that the new version applies to future salary setups while existing employees remain pinned to their saved version.
Template formulas override component-master formulas only when the template generates an employee salary structure.
Template versions define a default salary basis, PF applicability, and PF rule.
New templates default to Monthly cost to school (CTC); the backend derives the corresponding protection target.
One salary-basis selector determines the target and amount label; the backend derives the protection policy.
Viewing or closing this help preserves the draft and preview, including in read-only mode.
Fixed and percentage formulas keep an editable empty numeric value, while remainder and statutory formulas explicitly show that their value is calculated automatically.

## Built-in Gross Salary

Earning and deduction settings offer Gross Salary in the percentage calculation-base selector under System values.
The selected base and fixed or variable value behavior survive save and reopen.
New template rows inherit the master calculation base and configured percentage.
Salary structure generation labels the resolved value Full-month gross and supports Monthly salary and Monthly cost to school (CTC) inputs.
Run Payroll and payslips distinguish Full-month gross, attendance-adjusted Gross Salary, Additional earnings, Total earnings, deductions, and net pay.
Gross Salary is a read-only summary, separate from the regular earning lines that allocate it.
The backend calculation contract and policy behavior are documented in [HR backend workflows](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/modules/hr/workflows.md#built-in-gross-salary).

## ESIC editing and stale payroll

ESIC exceptions use Start month and End month fields and apply to complete payroll months.
The employee ESIC drawer uses one guarded handler for Cancel, close, Escape and backdrop dismissal.
Dirty forms offer Keep editing or Discard changes; ordinary saving stays confirmation-free.
Blocking loading and saving prevent competing dismissal, while failures and background refreshes preserve edits.
A successful save remains successful if the subsequent refresh fails.

Employee salary setup uses form-shaped skeletons while preserving the surrounding navigation and action layout.
Background refreshes retain the existing form.
Superseded payroll previews remain non-actionable and require recalculation and review through the existing payroll workflow.
Payroll readiness displays Needs attention when the server reports an ESIC or compensation blocker, and Needs recalculation for stale results.
Readiness labels and monetary totals wrap without truncation on narrow screens.
The disclosure uses a labelled keyboard-accessible button with its expanded state exposed.

## Payslip completion requirements

Immutable issued documents, payment recording, document-detail replacement and delivery are implemented with focused regression coverage.
Unpaid reissue and paid later-payroll settlement are implemented with focused regression coverage; the complete acceptance matrix remains open.
The owning [payslip specification](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/modules/hr/references/payslip-design.md) defines issuance, money, corrections, email and acceptance requirements.
Keep the existing Payslips route, standard breadcrumbs and employee/month controls.
Use one server-generated document for the screen document preview, Print, Download and email attachment.
PDF.js renders the stored document with a bundled worker rather than relying on native PDF frames.
Print becomes available only after every selected document page renders and copies those pages using the existing print library.
Changing the selection cancels the previous renderer and cannot publish its pages into the new selection.
Rendering failures keep Print disabled and provide Retry without regenerating payroll facts.
Official documents become available after payroll finalization, with payment status recorded separately.
HR manages distribution; no employee portal is included.
The school can enable automatic employee email after successful locking, with the setting off by default.
Authorized HR can Send and Resend even when automatic email is off.
Show the employee's recorded recipient address and delivery state, with failed/missing-address recovery through existing employee details.
Keep delivery history and document revisions under secondary disclosures.
Viewing a replaced revision disables sending and mutation actions.
Recording payment keeps the PDF unchanged and stores a payment reference separately.
Replacing document details requires a reason and uses current employee/school facts while retaining frozen monetary and attendance evidence.
Payment and replacement forms preserve drafts and idempotency keys after failed writes.
Deliberate resend uses the shared confirmation and shows the employee recipient.
Provider acceptance is not labelled as inbox delivery.
Failed document-history loading blocks a draft fallback; HR retries the failed request.
Unpaid corrections require a reason and a replacement retaining the original; paid monetary differences go through later payroll.
Correct payroll opens a compact reasoned draft for an unpaid or paid current revision.
Recorded attendance remains editable without fabricating Present values for missing records.
Recalculate shows issued and candidate earnings, employee deductions, net pay and school cost, with component evidence for HR.
Attendance edits disable review and reissue until recalculated.
For a reviewed paid correction, select a later settlement month and calculate its payroll through the existing preview service.
Apply settlement requires a current successful target preview and the existing payroll Lock permission.
Changing the month or academic year invalidates the selected target run; interrupted requests from another selection cannot enable settlement.
Successful settlement leaves the paid document unchanged and requires target payroll regeneration, review and locking.
Failed settlement retains the month and shows the server's actionable error.
Review and reissue follow the existing RunPayroll permissions in addition to payslip permissions.
Close protects unsaved edits, failed writes retain the draft, and failed follow-up history refresh is reported separately from an acknowledged write.
Cancellation preserves audit evidence and does not discard the issued document.
Clean settings adopt refreshed server values; dirty settings retain their draft and original concurrency token until saved or discarded.
Discard restores the latest observed server baseline.
Internal links and browser traversal use the shared keep-editing/discard guard.
An earlier refresh observed during saving cannot overwrite the acknowledged save response.
Preserve compact labelled controls, stable loading/error layouts, draft protection and keyboard focus behavior.
