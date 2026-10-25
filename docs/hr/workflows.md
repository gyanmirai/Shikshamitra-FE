---
module: hr
domain: workflows
content_type: Reference
status: canonical
updated_on: 2026-10-25
owner: frontend-team
audience: humans-and-agents
---

# Trace HR frontend workflows

TL;DR: use this page to connect HR screens, clients, and browser tests.
Backend workflow rules are canonical in `https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/modules/hr/workflows.md`.

## Core workflows

Use this map to find the first screen and client:

| Workflow                   | Screen entry                                                                | Main client                                  |
| -------------------------- | --------------------------------------------------------------------------- | -------------------------------------------- |
| Employee onboarding        | `/hr/employee/onboarding`                                                   | `employeeOnboardingApi.ts`                   |
| HR leadership dashboard    | `/hr/dashboard`                                                             | `hrOperationalDashboardApi.ts`           |
| Employee profile update    | Employee list and profile tabs                                              | `employeeApi.ts`                             |
| Employee profile dashboard | Employee profile Dashboard tab       | `employeeApi.ts`                             |
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
| HR reports                 | `/hr/reports`                                                               | `hrReportingWorkspaceApi.ts`                 |

## Leave Center balance and history

My Balance uses compact leave-type cards with the shared section header, contextual help, balance status, entitlement-usage bar, and grouped used/pending days.
Finite leave cards reveal accrued days through Balance details; unlimited types explain their unbounded tracking in the same disclosure.
Apply Leave and the active panel actions share the contained tab row, with actions wrapping below the tabs on narrow screens.
Apply Leave from My Balance opens the existing request dialog in My Requests.
A missing allocation shows one scoped message, while loading, failed reads, and missing academic-year or employee context remain distinct states.
My Requests owns the single searchable request/history table, including applied date, reason, status, existing request actions, and export.
Submitted By, Organization, and Remarks remain available through Columns without crowding the default request view.
The staff-profile leave tab retains its existing employee-specific history.

## Employee onboarding behavior

Staff Directory's Add Staff form opens Personal Information without fetching policy lists or requiring policy-management grants.
Its profile photo is optional; a selected photo retains the 3MB form limit and is sent as the `ProfilePicture` multipart part.
Saving a basic profile omits `policyOverride`; it uses backend effective-policy inheritance rather than creating an employee-specific assignment.
Missing policy setup does not block profile entry. Payroll/activation readiness and explicit assignment remain separate authorized workflows.
Creation failures keep entered details and allow retry on the same step.
The Role field uses the employee-specific assignable-role lookup, so Staff Add/Edit does not require access to security role administration.
Existing staff edits retain their independent save flow.
Backend authorization and error contracts remain owned by the [HR API documentation](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/modules/hr/api.md).

An invitation remains at Invitation sent until the candidate submits the public application, and only that unsubmitted state offers link regeneration.
Workflow statuses move forward, while Finalized, Rejected, and Withdrawn applications are terminal and their status selector is disabled.
Deleting an application requires explicit confirmation.
Finalization validates the complete employee record, including Category and Family Caste, before it sends one atomic request containing academic permissions only for a teaching employee.
The finalization wizard blocks step changes, its close control, backdrop handling, and Escape while saving, and it focuses the first invalid field when validation fails.
The public application requires a name for entered family details and organization, designation, and start date for entered work details.
Public date checks use the Asia/Kolkata institution date, and untouched work rows are omitted from the payload.
The public onboarding form requires both a resume and a photo before submission; Staff Directory's optional-photo rule does not apply to this flow.
Selected files retain their upload validation, and backend file rules remain owned by the HR API contract.
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
The Dashboard tab uses four compact metrics, a bounded attendance calendar, the next five holidays, and an attendance trend only when records exist.
A finite leave balance with unlimited leave types displays the finite days separately from the unlimited entitlement explanation.
The calendar only navigates within the period represented by the dashboard response and exposes day status and remarks to keyboard and screen-reader users.
Inactive profile panels and populated trend charts load on demand.
Dashboard refreshes retain the current staff member’s loaded data and offer retry feedback on failure; switching staff shows loading until the matching response arrives.

## Attendance and payroll interaction behavior

Reset on manual attendance restores the last loaded day state, including an approved leave status, instead of inventing a new pending state.
Changing the selected attendance date clears the prior date's rows and lock state until the new response arrives, and row, save, reset, and lock actions stay disabled during that transition.
Manual Present and Half Day clock values are retained independently when a user switches between those statuses before saving.
Saving manual attendance invalidates cached attendance, payroll, HR dashboard, and substitution availability/suggestion data after the day data is persisted.

Teaching employees marked Absent or Half Day have an Arrange substitution row action when the user holds both Timetable Management View and Add. When the page has unsaved changes, Save attendance & arrange substitution persists those changes first; a failed save leaves the drawer closed. The date and attendance grid stay disabled during this transition.
The shared quick-substitution drawer is also used from Academic teacher availability. It loads the saved attendance absence window, scoped published periods, and current substitute suggestions. Staff assign one period at a time; unavailable or partial-only candidates are disabled, failures preserve the selection for retry, and successful assignment refreshes period coverage without closing the drawer. Acknowledgement remains a separate state.
Locked saved attendance may still be used to arrange cover. Approved-leave rows, non-teaching employees, Present/Pending rows, holidays, future dates, and dates outside the selected year do not offer this manual-attendance action. Approved-leave synchronization and batch assignment remain separate follow-up work.
The device attendance screen starts with the current month and keeps the empty-state icon and message in the shared empty-state layout.
Payslip content is keyed by both employee and payroll month, and a previous response is not rendered while a new selection is loading.
Only a 404 response is shown as a missing payslip, while access, server, and network failures provide a retry action.
Percentage-based earning components list only valid earning-component dependencies and surface backend dependency errors on the component field.

### Policies & Rules navigation

Work Calendars, Attendance Policies, Leave Policies, Payroll Policies, and Policy Assignments use the HR sidebar for navigation.
Each page shows its current title in the shared header and uses the global academic-year selector without a duplicate year row or navigation tabs.
The primary table fills the remaining workspace.
Expanded year-end settlement details scroll within a bounded secondary panel so settlement rows and the main leave-policy table remain reachable on narrow screens.
On mobile, policy identity and status columns scroll with the table while row actions remain pinned, avoiding overlapping frozen columns.

### Run Payroll preview feedback

Generate preview and Refresh preview sit in the register action row alongside readiness, review, audit, and lock controls.
Vertical dividers separate preview, readiness/audit, and review/lock action groups on desktop.
On smaller screens, dividers are hidden and action groups wrap.
Payroll month stays in the context row.
Academic year comes from the global header selector without a duplicate page label.
View readiness uses an outlined button beside the register review, audit, and lock actions.
Readiness status and attention details appear inside the drawer instead of a page-level badge.
The read-only drawer starts closed, opens from the right on desktop, and fills the screen on mobile.
Its checks cover attendance, salary setup, payroll policies, and additional server-reported blockers.
The attendance check links to manual attendance.
Preview summary values come from the run-level readiness aggregate, including when search returns no employees.
Unavailable checks are not shown as ready, and genuine zero totals remain visible.
Closing the drawer restores focus without changing table selection, search, or pagination.
Changing month or academic year closes the drawer and discards the previous context.
Initial preparation uses table skeletons, while recalculation retains completed rows with localized progress.
Search and pagination show table progress without labelling payroll outdated.
Only server-confirmed stale or superseded results show Preview needs refresh.
Review, adjustment mutations, and locking require a current loaded preview.
An explicit generate, refresh, or retry shows one completion toast after the requested run and its rows are ready, including empty results.
Failures retain a Retry action, and navigation or changing month/year clears pending notifications.

## Policy, dashboard, and report behavior

Policy workspaces show page-specific guidance, keep save errors next to the submit action, and search employee assignment targets through the server after two characters.
Work calendars prevent all seven days from becoming weekly offs and constrain effective-date years to 1900 through 2100 before submission.
The leave-policy impact drawer is read-only, and archive confirmation is a separate explicit action.
Policy tables query current and archived records independently with server-side search, count, and pagination.
The leave-policy workspace can restore an archived policy as a draft, while employee and assignment selectors continue to request active policies only.
Policy audit entries omit unchanged values and missing editor metadata, render weekly-off numbers as weekday names, and show semantic holiday changes and real holiday-summary counts.
Audit events show the first eight semantic changes and provide a Show N more control without discarding the remaining differences.
The reporting workspace opens Templates with the category rail, one template search, and built-in/private/school filters.
Generate opens a separate parameter page and never opens the designer or changes a definition.
Create/customize opens the full-width guided designer with columns, fixed conditions, advanced options, and preview.
Unsaved changes are guarded when navigating or switching datasets.
School edits retain the published revision until a manager publishes the replacement.
Generated reports show private captured history, status, period, staff selection, warnings, and fixed result rows.
Excel and PDF download from that captured result and expire after seven days.
The server owns row meanings, calculation rules, capabilities, publication, authorization, and cutover behavior.
See the [backend reporting contract](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/modules/hr/references/reporting-workspace.md).
Scheduling, delivery, AI planning, and result sharing are excluded.

## HR leadership dashboard behavior

The English-only `/hr/dashboard` requires the exact `HR.Dashboard.View` grant for every role.
The shared HR heading and breadcrumbs remain visible during loading, empty results, failed reads, and refreshes.
Workforce, Leave approvals, Onboarding, and Appraisals form the primary module grid, followed by one seven-day attendance chart and saved payroll progress.
The grid uses four columns on desktop, two on tablet, and one on mobile, with neutral leading icons, outlined MUI Paper surfaces, theme typography, and consistent section spacing.
Module details use aligned labels and values without workflow buttons or footer links.
The attendance date field sits beside the section heading, above a single Present-count chart and compact read-only daily counts.
Staff Directory and existing module workflows own detailed tables and decisions.
Current scope, current IST date, and the backend generation timestamp appear above the grid.
Only attendance changes through the date field, with the selected date retained in the URL.
All other module summaries remain current even when attendance shows a historical date.
Obsolete staff-filter and chart-view URL keys are removed with a dismissible explanation.
Scoped onboarding shows Unavailable with its backend explanation and no shortcut.
Unavailable and failed summaries do not display zero, while real empty results do.
The selected date shows the full status breakdown, and a screen-reader list exposes present/total counts for all seven days.
Attendance counts stay neutral, and overlapping review flags remain separate from status totals.
Payroll progress uses saved counts, and its complete saved timestamp converts to IST before formatting.
Refresh performs a read, reserves progress space, and announces explicit results without announcing each background poll.
Operational reads refresh every 60 seconds while focused, on focus return, and after relevant cache invalidations.
Failed refreshes retain the last successful data with a stale label, while access denial clears displayed data.
Identity, tenant, or grant changes remount the dashboard with a separate cache identity and zero unused cache retention.
The dashboard is read-only and does not expose module shortcuts, Mark Attendance, Open Payroll, Add Staff, or HR Reports actions.
Appraisal list, detail, and evidence queries use the same access identity and clear results after failed reads.
Role names never substitute for a permission, and backend capabilities and section states constrain displayed content.
Backend rules remain canonical in [HR API documentation](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/modules/hr/api.md#operational-hr-dashboard).

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
Pending PF/ESIC registration appears as a warning and a direct staff-editor action; valid salary setup remains activatable.
Enrollment failures and background refreshes preserve the open draft.
Salary templates pair PF and ESIC under Statutory defaults.
Choose Calculate in ShikshaMitra with a named policy, or Handled outside ShikshaMitra with a required reason.
ESIC uses one compact Formik settings form with a calculation switch, conditional school registration fields, and standard Save/Cancel actions.
The server persists an ESIC-on baseline for new schools with unknown legal registration facts left empty.
Changes apply from the selected effective payroll month without rewriting locked payroll or issued payslips.
Save is direct, without a separate confirmation step.
Errors and background refreshes preserve the draft and original concurrency token.
Calculation help uses the ESIC section information control; Change History is an outlined section-header action.
A compact staff status row provides one Review Staff action, initially filtering to attention items when present.
Save and Cancel use compact shared button styling in the stationary bottom-right footer.
Earning classification is managed beside each salary component through its ESIC treatment action.
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
Users select a template, choose Monthly salary or Monthly cost to school (CTC), select the effective month, enter the quoted monthly amount, select PF applicability and rule, preview, and review earnings, employee deductions, employer contributions, ESI, target variance, and the formula trace.
Application finalization includes salary template, monthly amount, preview, and PF/ESIC registration in the final Salary and confirm step.
Finalize sends the salary and statutory profile together, and reports success only when the backend returns a persisted compensation revision.
Salary controls stay mounted across back/forward step navigation; failed finalization keeps entered values available for retry.
Cancel and browser reload warn about unsaved changes; discarding or completing a reload clears the unsaved draft and requires re-entry.
Successful finalization leaves the staff Inactive with salary saved, and shows any remaining activation blockers.
Login does not activate staff; an authorized HR user must use the existing activation action.
Direct employee creation retains its separate salary setup flow.
Deploy the backend salary finalization contract before this frontend flow.
Salary setup preselects the school default template, the template salary basis, the joining month, and the template PF defaults.
Users preview and save salary directly as an effective immutable revision without a draft or approval queue.
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
Payroll readiness displays Needs attention when the server reports an ESIC or compensation blocker, and Preview needs refresh for stale results.
Readiness labels and monetary totals wrap without truncation on narrow screens.
The disclosure uses a labelled keyboard-accessible button with its expanded state exposed.

## Policies & Rules setup guidance

The header reads “Configure staff calendars, policies, and assignments.”
The selected academic year appears separately, and an absent selection shows “Select an academic year”.
Missing and multiple-default warnings are derived only from a successful current-year query containing the complete unfiltered policy population.
Loading, failed queries, and incomplete pages do not establish missing configuration.
Recovery actions appear only when the user can access the corresponding policy destination.
Opening Leave Policies from a modified assignment requires discarding the unsaved draft explicitly and retains the selected academic year.
Secondary guidance remains available under Details.
An explicit sole-default archive rejection reads “Choose another default before archiving”; reused missing-default and inactive-reference error codes keep their own meaning.
Saving, archiving, assigning, and changing defaults still use impact previews, confirmation tokens, payroll lock blockers, versions, and audit.
Attendance templates use Staff Code and Staff Name; imports accept Employee aliases, including mixed aliases for different fields, and reject duplicate aliases for one field.

## Payslip completion requirements

Immutable issued documents, payment recording, document-detail replacement and delivery are implemented with focused regression coverage.
Unpaid reissue and paid later-payroll settlement are implemented with focused regression coverage and authenticated correction/settlement journeys.
On 2026-10-07 the user deferred DOC-15 current Gujarat legal-format verification for both private unaided and government-aided schools, allowing engineering to proceed with the existing document.
The deferred review does not change payroll rules, document immutability, signature fields, permission checks or recipient controls, and does not establish legal certification.
The owning [payslip specification](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/modules/hr/references/payslip-design.md) defines issuance, money, corrections, email and acceptance requirements.
Keep the existing Payslips route, standard breadcrumbs and employee/month controls.
Use one server-generated document for the screen document preview, Print, Download and email attachment.
PDF.js renders the stored document with a bundled worker rather than relying on native PDF frames.
The PDF zoom control offers fit-width and explicit scales with keyboard-accessible scrolling on narrow screens.
Changing zoom reuses the same rendered pages and keeps the controls outside the A4 print content.

Account-email drafts remain mounted during payslip metadata refreshes, and successful dialog actions return focus to their opening control once it is enabled.
After a successful document Retry, focus returns to Print when the selected PDF is ready, or to Staff member for an empty period.
A changed selection or another focused control cancels this restoration.
Correction breakdowns omit empty sections while preserving explicitly recorded zero-value components.
The logical text reader uses standard tagged text-span replacements only when the stored PDF associates them with actual page content.
PDF.js5.6.205 returns page-specific structure trees without a shared identity for a span continued across pages.
The reader does not deduplicate fields by equal text, because independently repeated fields must remain visible.
New server generation keeps each logical span and its corresponding glyphs on one page, avoiding full-text repetition across page-specific trees.
It retains uncovered text and reports unmapped glyphs instead of guessing employee names or using API facts to repair the preview.
This reader support does not repair already stored untagged PDFs or establish PDF/UA or legal conformance.
Print becomes available only after every selected document page renders and copies those pages using the existing print library.
Changing the selection cancels the previous renderer and cannot publish its pages into the new selection.
Rendering failures keep Print disabled and provide Retry without regenerating payroll facts.
Official documents become available after payroll finalization, with payment status recorded separately.
HR manages distribution; no employee portal is included.
The school can enable automatic employee email after successful locking, with the setting off by default.
Authorized HR can Send and Resend even when automatic email is off.
Show the employee's recorded recipient address and delivery state.
HR repairs a missing or wrong recipient through Change account email in employee information or the selected official payslip.
The action requires both employee Edit and Identity Users.Update; generic personal-information email edits remain protected.
Use the shared Formik dialog for the new email, a reason and confirmation that HR verified the address with the employee.
An email-based sign-in name follows the address; a distinct sign-in name remains unchanged and is shown in the dialog.
Failed writes preserve the draft and retry key, dirty refreshes retain the reviewed concurrency token, and explicit Reload account preserves the draft but requires verification again.
Successful changes invalidate employee and payslip queries without rewriting issued PDFs or clearing failed delivery history.
An explicit new send request retries delivery to the updated recipient; reusing a failed send's request key does not silently resend.
Unconfirmed Send requests retain separate retry keys for each document across employee selections.
When authorized history confirms that key, a deliberate Resend creates a new request instead of replaying the old accepted attempt.
Confirm the response document, request key and supported status before clearing a pending retry key.
Report acknowledged failed, uncertain and provider-accepted attempts accurately instead of claiming every response queued a new email.
Keep delivery history and document revisions under secondary disclosures.
Viewing a replaced revision disables sending and mutation actions.
Recording payment keeps the PDF unchanged and stores a payment reference separately.
Replacing document details requires a reason and uses current employee/school facts while retaining frozen monetary and attendance evidence.
Payment and replacement forms preserve drafts and idempotency keys after failed writes.
Deliberate resend uses the shared confirmation and shows the employee recipient.
Provider acceptance is not labelled as inbox delivery.
Failed document-history loading blocks a draft fallback; HR retries the failed request.
Pending or failed document-status refreshes do not establish current revision, payment or recipient facts and disable payment, replacement, correction and send actions.
The already loaded immutable official PDF stays available for reading and download without another artifact fetch.
Open payment, document-detail and correction forms retain drafts during refresh failures, offer Retry and remain blocked if their source revision has been replaced.
Removing payslip View permission removes protected document and dialog content immediately; exact action permissions and server guards continue to apply.
An authorization or scope denial also hides cached document/history content and revokes its artifact URL; Retry keeps it hidden until a successful current-selection read restores access.
Unpaid corrections require a reason and a replacement retaining the original; paid monetary differences go through later payroll.
Correct payroll opens a compact reasoned draft for an unpaid or paid current revision.
Recorded attendance remains editable without fabricating Present values for missing records.
Recalculate shows issued and candidate earnings, employee deductions, net pay and school cost, with component evidence for HR.
Run Payroll and correction comparisons use `formatPayrollCurrency` to retain authoritative paise in earnings, deductions, settlements and net pay.
Do not apply the Finance whole-rupee display formatter to payroll evidence or introduce renderer-side statutory rounding.
Keep this comparison inside a bounded, keyboard-focusable table container, with compact mobile cell spacing and horizontal scrolling when amounts need more room.
Attendance edits disable review and reissue until recalculated.
For a reviewed paid correction, select a later settlement month and calculate its payroll through the existing preview service.
Apply settlement requires a current successful target preview and the existing payroll Lock permission.
Changing the month or academic year invalidates the selected target run; interrupted requests from another selection cannot enable settlement.
Successful settlement leaves the paid document unchanged and requires target payroll regeneration, review and locking.
Failed settlement retains the month and shows the server's actionable error.
Review and reissue follow the existing RunPayroll permissions in addition to payslip permissions.
Close protects unsaved edits, failed writes retain the draft, and failed follow-up history refresh is reported separately from an acknowledged write.
An already-started correction-history read cannot replace a subsequently acknowledged calculation or review.
Clean correction forms adopt later successful reads; dirty attendance remains editable through background refreshes.
Each correction attendance row provides the existing compact MUI time inputs beside its status, with persistent labels and a responsive layout.
Time edits use attendance's offset-zero clock contract, preserve untouched timestamp precision, and serialize only when calculating.
Invalid time ranges show a field error without clearing the draft, and time edits participate in the existing discard and background-refresh guards.
Reopening with pending or failed history keeps cached comparison results non-actionable until a successful read.
Retry restores the current correction and concurrency token without creating another draft or calculation.
Cancellation preserves audit evidence and does not discard the issued document.
Clean settings adopt refreshed server values; dirty settings retain their draft and original concurrency token until saved or discarded.
Discard restores the latest observed server baseline.
Internal links and browser traversal use the shared keep-editing/discard guard.
An earlier refresh observed during saving cannot overwrite the acknowledged save response.
Connection and timeout failures show plain save/retry guidance while retaining the draft and its idempotency key.
Server validation and concurrency messages remain actionable rather than being replaced by that connection message.
Preserve compact labelled controls, stable loading/error layouts, draft protection and keyboard focus behavior.

## Staff payroll profile

The Payroll section shares salary and policy summaries between the staff profile and employee editor.
Salary uses server compensation revisions for the current month, with scheduled changes listed separately and estimated net salary explicitly excluding monthly attendance and one-time adjustments.
Change salary opens the existing salary workspace with the employee selected.
Back to staff profile restores Payroll, which refetches compensation on mounting.
One-time adjustments remain in monthly payroll; profile details never submit earning or deduction components.
Assigned policies show their source, effective date, and both derived work calendars.
Change assignment offers organization policies or employee-specific selectors, followed by required date, reason, impact review, warnings, and confirmation.
Lookup failures display retry states rather than organization defaults.
The staff profile edits bank details, statutory identifiers, and attendance integration in a drawer that submits only changed groups.
Both drawers retain failed edits and protect unsaved changes; mobile drawers fill the viewport width.
Employee creation inherits effective school policies; activation readiness remains enforced by the backend.

In Update Staff, those same details are inline fields with their own saved baseline.
Save persists changed groups without advancing; Save & Next advances only after a successful save, or immediately without a write when nothing changed.
Validation failures focus the first invalid field, and failed saves preserve the draft.
Policy changes remain in their separate drawer and never reset the inline draft during employee/payroll refetches.
The edit URL accepts `mode=form&editEmployee=<id>&step=payroll`, loads the selected employee with existing access checks, and never falls back to Add Staff after a failed lookup.
Salary setup opened from this step returns through Back to staff edit and refetches compensation.
Dirty navigation is confirmed, navigation and duplicate actions are blocked while saving, and other steps and creation retain their existing behavior.

## Recurring salary editor

Payroll Structure and Staff Directory share the recurring Edit Salary sub-page.
The staff payroll salary link and return link use client-side navigation to preserve the application shell.
Hovering or focusing the salary link preloads the editor's independent reads through RTK Query, reusing data fetched within the last 30 seconds.
Salary deep links start reads from the employee ID immediately; employee details still gate form initialization, and failed staff reads offer a retry.
The footer owns Preview salary and Save salary; saving keeps the page open, refreshes history, and clears the draft baseline.
Footer feedback explains calculation readiness, active operations, and completed saves without changing action permissions or enabled states.
The compact employee header includes ESIC access, and the quoted monthly amount uses the shared currency input without rounding its numeric request value.
Invalid amounts show inline errors after blur; saving with a missing customization reason focuses the reason field and preserves the draft.

History starts collapsed, and employee deductions remain separate from employer contributions.
History dates use readable month names, and monthly preview totals remain prominent above their annual equivalents.
Preview and history amounts use the shared payroll formatter to preserve recorded paise without changing calculation rules.
Input changes require recalculation, failures retain the draft, and leaving with unsaved changes requires confirmation.
One-time additions use the monthly payroll link and its existing employee and month selection.
The editor never calls the legacy component-update API or removes existing temporary components.

## Salary editor navigation

Run Payroll displays `PF_WAGE_BASIS_REQUIRED` as a critical readiness issue: "PF wage basis required. Update the salary structure to match the assigned PF rule."
Use the existing Edit Salary navigation to correct the affected structure, then refresh the payroll preview and review the new generation.
Existing readiness controls prevent locking affected staff.
See the [backend calculation release and PF remediation workflow](https://github.com/gyanmirai/Shikshamitra-BE/blob/4d5bdd84f55695c984ea6ececb2f71a269436430/docs/modules/hr/workflows.md#calculation-release-and-pf-remediation) for calculation, release, and historical correction rules.

Payroll Structure and Staff Directory open the dedicated Edit Salary page for the selected staff member.
Staff-profile and staff-edit links return to their original payroll context through a validated same-origin `returnTo` URL.
Existing `/hr/payroll/structure?employeeId={employeeId}&setup=salary` bookmarks redirect to the page with history replacement, including the previous `from=staff-profile` or `from=staff-edit` context.
The editor keeps Preview salary and Save salary in its persistent footer and preserves current compensation behavior.
ESIC details open in the existing drawer over the page, with an independent enrollment draft guard.
Closing the drawer preserves salary inputs, and saving enrollment invalidates the salary preview through the existing callback.
One-time adjustments remain in monthly payroll.

## PF enrollment and ESIC calculation settings

Salary setup retains the Gross/CTC choice and one monthly amount.
Authorized HR staff record previous PF membership during onboarding salary setup or later salary updates.
PF defaults on up to INR 25,000 Gross and presents explicit Opt in to PF / Opt out of PF choices above that amount.
Authorized HR can turn PF off with a reason while preserving eligibility evidence.
New voluntary enrollment has no preselected choice, and calculation or saving waits for that choice.
Opting in reveals the PF rule and voluntary consent reference; opting out excludes the PF rule from the request.
CTC setup confirms the requirement from the backend-calculated Gross, while changing salary preserves the draft and requires a fresh calculation.
Existing membership remains visibly Required, and the backend owns coverage and contribution rules described in [the payroll API contract](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/modules/hr/api.md).
The salary calculation returns the enrollment decision and blocks saving when required evidence or enrollment is missing.
The PF settings page records school establishment coverage with an effective month and evidence reference.
Its write requires the exact PF Add capability and backend-confirmed school-wide scope.

ESIC school settings use automatic statutory calculation, an effective payroll month, and an optional registration number.
The settings panel owns one scrollable content region and a separate bottom action footer.
Save and Cancel remain compact, content-width and right-aligned at every breakpoint.
The footer reserves safe-area space and does not cover form fields or expanded details.
Coverage start date is available under Registration details.
The page displays server-provided rates as one read-only summary, with calculation help and history available on demand.
School administrators cannot enter contribution-rate overrides or choose wage bases in this form.
Earning Component row actions open ESIC treatment for one earning, with an effective month and explicit statutory classification.
The page-level ESIC treatment action also lists custom staff earnings that are outside the master table.
That dialog uses the existing configuration save client, preserving school registration, calculation mode, concurrency and idempotency while changing one classification.
Treatment editing requires Edit, Activate, ConfigureCalculation, and backend-confirmed school-wide scope.
Failed saves preserve the draft and reuse the idempotency key; a stale concurrency token requires reviewing the latest settings.
Missing classifications link to Earning Component from the ESIC settings page.
Locked payroll and issued payslips retain their original calculation snapshots.

See the [backend contracts](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/modules/hr/api.md#pf-enrollment-and-esic-calculation-settings) for eligibility, effective dates, rates, and immutable payroll rules.

## Shared enrollment and salary documents

Onboarding, Staff Edit Payroll and salary setup reuse `src/screens/hr/employee/statutory-profile-fields.tsx`.
Existing staff use `src/screens/hr/employee/statutory-profile-editor.tsx` for guarded drafts, scheme permissions, concurrency and idempotent writes.
Each compact card shows the Apply switch, status, identifier and contextual Off or Pending warning.
Run Payroll offers a registration review list before preparation and staff-editor links from distinct missing-number and disabled-scheme warnings.
Mark Reviewed acknowledges the displayed warning evidence before locking.
ESIC eligibility and contributions use classified earnings automatically; salary components own the statutory treatment.

The existing payslip-generation route now presents Monthly payslips, Employee statements and School register tabs.
Monthly issuance retains its existing immutable PDF workflow.
Statements choose one staff member and an inclusive range; registers choose one month.
Filters survive tab changes; inactive panels stop previews and export polling.
Previews debounce, cancel obsolete requests and reject stale responses.
PDF/Excel use existing export jobs, ownership checks, status, download and expiry.
Salary documents use the shared soft status chips and download actions in the compact toolbar, with one standard success toast when an active export completes.
The report-notes information control beside Preview exposes all coverage and truncation notes in the shared popover; failures retain an announced error and a relevant recovery action.
Payroll Management > Settings > Payslip & statement settings owns Compact/Detailed layouts, optional fields, saved column presets and automatic email.
The Payslips workspace retains a Payslip & statement settings link and no longer embeds the settings form below its preview.
School name, address and logo use Institute Setup; the settings page displays the returned name and address without editable duplicates.
The existing save, retry, concurrency and dirty-navigation safeguards remain in the dedicated settings form.
Preview loading is labelled and compact rather than reserving a 560-pixel grey block.
Overview matches only the payroll root so sibling payroll destinations do not also select it.
Identity, totals and all nonzero deductions remain mandatory.

Staff Edit Payroll saves its statutory draft before bank changes through Save and Save & Next.
Its navigation guard and busy state include both editors.

## Operational dashboard decision cues

The active `/hr/dashboard` screen consumes `hrOperationalDashboardApi.ts` and uses exact permissions and backend scope to determine visible cards and actions.
Pending leave requests use an informational Awaiting decision label, while positive overdue appraisal counts use a warning label.
Attendance uses one read-only seven-day Present chart, a selected-day present/total count, and a compact status summary.
The date input sits beside the section heading; the dashboard has no day navigation buttons, chart selectors, highlighted attendance tiles, legend, or expandable details.
A screen-reader list exposes each day's present and total counts without extra interactive controls.
Needs review remains a separate count because it can overlap attendance statuses.
Payroll guidance describes saved records only and distinguishes absent records, pending reviews, fully locked records, and reviewed records that remain unlocked.
The guidance does not imply payroll readiness, payment completion, or authority to lock records.
Refresh and the attendance date input are viewing controls only.
Date, scope, and freshness use a compact caption row grouped with the standard breadcrumb header.
The dashboard uses the shared inline CustomBreadcrumbs defaults without local colour or action-alignment overrides.
Loading uses matching placeholders, while failed, unavailable, and forbidden summaries do not display actionable counts or completion messages.

## Payroll structure salary overview

The Payroll Structure route stores employeeId and month in the URL and reads the employee-scoped salary summary endpoint.
The overview shows full-month gross, employee deductions, estimated take-home, school cost, PF, ESIC and professional-tax status before editing.
One summary card groups the preview month, totals, salary effective date and full-month estimate guidance.
The four amounts use separate tiles, with a restrained accent on available estimated take-home.
Initial loading follows the same amount-tile and section layout, respects reduced motion, and avoids displaying placeholder monetary values.
Same-staff refreshes retain the visible summary and month context, with progress feedback positioned outside the content flow.
Differences from saved monthly CTC appear as a neutral comparison within the summary, with an absolute amount and a higher or lower label.
The comparison preserves the distinction between school cost and unchanged agreed gross salary.
Unavailable statutory calculations show an incomplete estimate instead of zero totals.
Registration pending appears separately from contribution applicability.
The salary editor defaults routine changes to the current month or a future joining month, and preserves an explicitly selected month.
Changing the effective month reloads that month's statutory profile and asks before discarding unsaved statutory edits, while retaining other salary inputs.
It discloses an older source-template version before allowing a current-template preview.
Registration details, staff customization and salary history use progressive disclosure.
The footer offers Preview salary or Update preview and Save salary; any input change requires a current preview before saving.
Attendance and one-time adjustments remain in Run Payroll.
Links from the overview and editor carry the selected salary month into Run Payroll, where pending registration remains a warning and genuine payroll setup issues still prevent locking.
Salary details and statutory settings use the shared form-section cards and the configured Minimal UI card theme.
The editor has one scrollable form body and a separate persistent footer, with an outlined preview action and a contained save action.
Employee and school contribution amounts stay together when statutory rows stack on narrow screens.

## Consistent table workflow

Use the shared breadcrumb/header, domain filters, optional shared tabs and the main table workspace.
Place one global search inside the table toolbar.
Keep Columns, Export and Full screen independent of column filtering.
Read-only tables offer Excel and PDF using all matching rows and visible ordered data columns.
Compact embedded tables retain the same utilities without full-page sizing.
Editable configuration controls are explicit exceptions in [the coverage checklist](./references/hr-table-coverage.md).

## Select ESIC and review salary

Create or select a named policy in Statutory Schemes, then use its effective-month summary in the template or staff salary editor.
Archived policies remain visible on existing assignments but cannot be newly selected.
Copying a template initializes the employee assignment; later template edits do not replace it.
Change an employee assignment through the existing effective salary revision workflow.
Salary preview keeps amount, basis, month and its single action together.
Explain that this is a full-month estimate before attendance, unpaid leave and monthly adjustments; actual payable salary belongs to Run Payroll.
Show Preview required, Preview needs refresh or Preview ready inline and require a current valid preview before Save.
Invalidate the employee preview when the effective ESIC policy version changes, and submit the previewed version with Save.
If Save reports `HR:Payroll:CompensationPreviewStale`, preserve the draft and require Refresh preview without treating it as a salary-history conflict.
Show gross, estimated deductions, estimated take-home and monthly school cost, then separate earnings, employee deductions and school contributions.
Show PF/ESIC status and actionable target differences without repeated yearly totals.
Failed catalogue requests offer Retry and preserve the draft; missing effective versions require policy setup.

## Reporting navigation

Open Reporting > Reports to generate a report or reopen captured results.
Choose Generate report, select a published template, then choose the reporting period and applicable staff filters.
Generation opens the fixed captured result, where downloads, cancellation, retry, and Generate again retain their existing behavior.
Back from report options restores the template chooser's filters.

Open Reporting > Templates to create, customize, edit, publish, or archive templates according to current grants and ownership.
The management library shows editable drafts and lifecycle status; the generation chooser reads published definitions only.
Archiving a template preserves captured results.

### Reporting table tools

Templates and the template chooser provide shared table search, column filters, sorting, column visibility, Excel/PDF export, density and fullscreen controls.
Reports and captured results apply search, typed column filters and sorting before server pagination.
Exports contain every authorized matching row in the selected column order.
Captured totals and charts describe the original report; filtered exports omit original totals.
Designer preview controls refine the first 50 sampled rows, while preview exports apply the same criteria to the complete captured output.
