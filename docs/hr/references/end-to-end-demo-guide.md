---
module: hr
domain: demo
content_type: How-to
status: active
updated_on: 2026-10-05
owner: frontend-team
audience: humans-and-agents
---

# Demo the HR module end to end

TL;DR: use this guide as a presenter checklist for a complete HR demo.
The main path follows active HR navigation from `src/constants/hr-menus.ts`, uses frontend routes under `src/app/(auth-route)/hr/**/page.tsx`, and respects backend rules in `../../../Shikshamitra-BE/docs/modules/hr/README.md`.

## Demo goal

Show HR as one connected operating module, not separate screens.
The story is: configure HR rules, onboard an staff, maintain the staff profile, capture attendance and leave, process payroll, run performance management, publish reports, and review notifications.

## Demo account and data

Prepare this before the meeting:

| Item | Example |
|---|---|
| Demo tenant | `Deep Darshan Vidhya Sankul` |
| Demo viewer | `Jayesh Bhagat` |
| Demo HR user | `hr.admin@ddvs.edu` with HR, payroll, attendance, leave, policy, report, and performance permissions |
| Academic year | `2026-2027` |
| Teaching staff | `Aarav Sharma`, Mathematics Teacher, Teaching group |
| Non-teaching staff | `Meera Iyer`, Admin Executive, Non Teaching group |
| Reporting manager | `Priya Nair`, HR Manager |
| Payroll month | `July-2026` or another unlocked past month |
| Attendance demo date | A working day in the payroll month, such as `2026-07-15` |
| Leave demo dates | One or two working days in the same month |
| Salary example | Basic `30000`, HRA `12000`, Transport Allowance `2000`, PF deduction `1800` |

Do not use the current live payroll month if background jobs or real users may change the data during the demo.
Use a disposable tenant or a clearly marked demo staff whenever payroll lock or report export is shown.

## Presenter rule

For every screen, say three things:

| Beat | What to say |
|---|---|
| Purpose | What school operation this screen supports |
| Input | What HR user enters or reviews |
| Output | Which downstream area is affected |

Keep repeating the link: staff profile feeds attendance, leave, payroll, reports, and dashboard summaries.

## Full demo checklist

Use this as the top-level sequence:

| Step | Demo area | Route |
|---|---|---|
| 1 | HR dashboard | `/hr/dashboard` |
| 2 | Policy setup | `/hr/calendars`, `/hr/attendance`, `/hr/leave-policies`, `/hr/payrollPolicies`, `/hr/assignments` |
| 3 | Staff document settings | `/hr/setting` |
| 4 | Staff onboarding | `/hr/employee/onboarding` |
| 5 | Staff Directory and profile | `/hr/employee` |
| 6 | I-card | `/hr/i-card` |
| 7 | Attendance dashboard | `/hr/attendance-dashboard` |
| 8 | Device attendance | `/hr/biometric-attendance` |
| 9 | Attendance register | `/hr/attendance-tracking` |
| 10 | Manual attendance | `/hr/manual-attendance` |
| 11 | Leave center | `/hr/leave-center` |
| 12 | Payroll settings | `/hr/payroll/setting/earning-component`, `/hr/payroll/setting/deduction-component`, `/hr/payroll/setting/pf` |
| 13 | Salary structure | `/hr/payroll/structure` |
| 14 | Payroll overview and run | `/hr/payroll`, `/hr/payroll/run-payroll` |
| 15 | Payslips | `/hr/payroll/payslip-generation` |
| 16 | Performance management | `/hr/professional-management/overview`, `/hr/professional-management/reviews`, `/hr/professional-management/cycles`, `/hr/professional-management/outcomes`, `/hr/professional-management/reports` |
| 17 | HR reports | `/hr/reports` |
| 18 | Notifications | `/hr/hr-notification` |

## 1. Open HR dashboard

Route: `/hr/dashboard`.

Demo steps:

1. Open the HR module from the main navigation.
2. Show workforce summary, attendance trend, payroll status, leave requests, alerts, birthdays, anniversaries, and recent activities.
3. Filter or refresh the dashboard if controls are available.
4. Open the New Joiners or staff summary drilldown if demo data exists.

Example narration:

`This is the HR command center for Deep Darsh Vidhya Sankul. The principal or HR admin can see staff strength, missing attendance, leave pressure, payroll readiness, and upcoming staff events before opening individual workflows.`

Do not claim that approved leave is counted as absent.
Backend HR dashboard logic excludes approved leave without stored attendance from the missing-attendance count.

## 2. Configure HR policies and rules

Start with policy setup because later workflows depend on it.
This is one of the strongest sections in the HR demo because it proves the system is rule-driven instead of manual-only.

Use this presenter line before opening the screens:

`Policies and Rules decide how the school calendar, attendance, leave, and payroll behave for each employee. I will create the rules first, assign them to a staff group, and then review the assignment preview and confirm the change impact.`

### Policy demo story

Use one teaching group and one non-teaching group example:

| Group | Example staff | Rule difference to show |
|---|---|---|
| Teaching staff | `Aarav Sharma`, Mathematics Teacher | School teaching calendar, teaching attendance rules, staff leave, monthly payroll |
| Non-teaching staff | `Meera Iyer`, Admin Executive | Same payroll policy, but an attendance policy with office-shift timing |

Explain this model:

| Policy type | Simple meaning | Downstream effect |
|---|---|---|
| Work Calendar | Which dates are working days, weekly offs, and holidays | Profile dashboard, attendance calendar, policy preview |
| Attendance Policy | How punches, late arrivals, missing punches, and holiday work are treated | Attendance dashboard, manual attendance, register, payroll warnings |
| Leave Policy | Which paid and unpaid leave buckets staff can use | Leave center, leave approvals, leave balance, payroll paid/unpaid days |
| Payroll Policy | How pay days, holidays, Saturdays, and month days are calculated | Payroll preview, payroll lock, payslip basis |
| Policy Assignment | Which staff or group receives each policy from an effective date | Effective policy preview, payroll readiness, attendance behavior |

### Work calendars

Route: `/hr/calendars`.

Demo steps:

1. Open Policies and Rules, then Work Calendars.
2. Create or open a calendar named `DDVS Standard Calendar 2026-2027`.
3. Select academic year `2026-2027`.
4. Mark weekly offs.
5. Add holiday sync behavior if configured.
6. Save the calendar.
7. Open the version or audit drawer if visible.
8. Clone the calendar only if you want to show next-year setup.
9. Archive or restore only on disposable demo data.

Example:

| Field | Value |
|---|---|
| Name | `DDVS Standard Calendar 2026-2027` |
| Academic year | `2026-2027` |
| Effective from | `2026-06-01` |
| Effective to | `2027-05-31` |
| Weekly off | Sunday |
| Special non-working day | `2026-08-15`, Independence Day |
| Special working day | `2026-08-22`, Saturday working day for annual day preparation |
| Holiday sync mode | Linked with overrides, if available |

Second example for non-teaching staff:

| Field | Value |
|---|---|
| Name | `DDVS Admin Office Calendar 2026-2027` |
| Academic year | `2026-2027` |
| Effective from | `2026-06-01` |
| Effective to | `2027-05-31` |
| Weekly off | Sunday plus second Saturday, if custom weekly offs are available |

Call out that the system prevents all seven days from becoming weekly offs.
This protects accidental setup where every day becomes a non-working day.

Best thing to show:

| UI action | Demo value | What it proves |
|---|---|---|
| Create calendar | `DDVS Standard Calendar 2026-2027` | HR can define the school work year |
| Add weekly off | Sunday | Attendance and payroll know normal non-working days |
| Add holiday | `2026-08-15` | Holidays can be interpreted later by attendance and payroll policies |
| Open audit or versions | Show latest change | Policy history is traceable |

Say this before moving on:

`The calendar only tells us the date pattern. Attendance and payroll will interpret these dates differently.`

### Attendance policies

Route: `/hr/attendance`.

Demo steps:

1. Open Attendance Policies.
2. Create or review `Teaching Staff Attendance Policy`.
3. Choose the work calendar if the drawer asks for it.
4. Show punch rules, late arrival rules, early exit rules, missing punch behavior, overtime, and holiday-work behavior if present.
5. Save as draft or active, depending on demo data.
6. Show policy impact, versions, or audit if visible.

Example:

| Field | Value |
|---|---|
| Policy name | `Teaching Staff Attendance Policy` |
| Academic year | `2026-2027` |
| Applies to | Teaching staff |
| Shift basis | Fixed school shift |
| Expected in time | `08:00` |
| Expected out time | `15:30` |
| Late threshold | 15 minutes after expected in time |
| Early exit threshold | 15 minutes before expected out time |
| Missing in punch | Flag for HR review |
| Missing out punch | Flag for HR review |
| Half-day minimum | 4 working hours, if configured |
| Holiday work | Mark separately for review or overtime, if configured |

Second example:

| Field | Value |
|---|---|
| Policy name | `Admin Office Attendance Policy` |
| Applies to | Non Teaching staff |
| Expected in time | `09:30` |
| Expected out time | `17:30` |
| Late threshold | 10 minutes |
| Missing punch action | Flag for correction before payroll |

Explain that attendance policy affects dashboard warnings, manual attendance interpretation, attendance register details, and payroll basis.

Best thing to show:

| UI action | Demo value | What it proves |
|---|---|---|
| Set expected time | `08:00` to `15:30` | Late and early rules are policy-driven |
| Set missing punch behavior | Flag for review | HR gets exception handling before payroll |
| Set holiday-work behavior | Review or overtime | The same holiday can be handled differently for attendance |
| Open audit | Show changed threshold | Policy changes are reviewable |

Presenter example:

`If Aarav punches in at 08:20, the attendance policy marks him late because the allowed grace period is 15 minutes. If Meera follows a different office policy, her expected time can be different without changing the whole tenant.`

### Leave policies

Route: `/hr/leave-policies`.

Demo steps:

1. Open Leave Policies.
2. Create or review `DDVS Staff Leave Policy`.
3. Add paid leave buckets.
4. Add unpaid leave behavior.
5. Show half-day support if configured.
6. Save and show archive, restore-as-draft, impact, version, or audit behavior if visible.

Example:

| Field | Value |
|---|---|
| Policy name | `DDVS Staff Leave Policy 2026-2027` |
| Academic year | `2026-2027` |
| Paid casual leave | 12 days |
| Paid sick leave | 8 days |
| Paid privilege leave | 6 days, if the school uses it |
| Unpaid leave without pay | Unlimited or no fixed balance |
| Half-day leave | Allowed for casual leave and sick leave |
| Attachment requirement | Required for sick leave above 2 days, if available |

Leave bucket examples:

| Leave bucket | Balance | Half day | Payroll impact | Demo use |
|---|---:|---|---|---|
| Casual Leave | 12 | Yes | Paid | One-day family function |
| Sick Leave | 8 | Yes | Paid | Medical absence |
| Leave Without Pay | Unlimited | Optional | Unpaid | Show payroll deduction impact |

Explain that paid and unpaid leave are separate because payroll impact depends on that classification.

Best thing to show:

| UI action | Demo value | What it proves |
|---|---|---|
| Add paid leave bucket | Casual Leave, 12 days | Leave balance can be tracked |
| Add unpaid leave bucket | Leave Without Pay | Payroll can distinguish unpaid absence |
| Enable half day | Casual Leave | HR can approve partial-day requests |
| Restore archived policy as draft | Only on demo data | Old policies can be reused safely without changing history |

Presenter example:

`When Aarav applies for Casual Leave, his leave balance reduces but payroll still treats the day as paid. If he applies for Leave Without Pay, the payroll run can show an unpaid-day impact.`

### Payroll policies

Route: `/hr/payrollPolicies`.

Demo steps:

1. Open Payroll Policies.
2. Create or review `Monthly Staff Payroll Policy`.
3. Show day calculation basis.
4. Show payroll month rules.
5. Show holiday handling.
6. Show Saturday units or manual month days if available.
7. Save the policy.
8. Show version, audit, clone, set default, archive, or restore controls if visible.

Example:

| Field | Value |
|---|---|
| Policy name | `Monthly Staff Payroll Policy 2026-2027` |
| Academic year | `2026-2027` |
| Day calculation mode | Calendar month |
| Holiday treatment | Paid holiday |
| Weekly off treatment | Paid weekly off |
| Saturday unit | Full day, or half day if the school uses half-day Saturdays |
| Manual month days | Blank for calendar month, or `30` for fixed 30-day payroll |
| Unpaid leave treatment | Deduct from payable days |

Alternate example for a fixed-pay school:

| Field | Value |
|---|---|
| Policy name | `Fixed 30 Day Payroll Policy` |
| Day calculation mode | Manual fixed days |
| Manual month days | `30` |
| Holidays | Paid |
| Unpaid leave | Deduct actual unpaid leave days |

Explain that payroll preview and payroll lock use the same policy basis, so salary slips match locked payroll.

Best thing to show:

| UI action | Demo value | What it proves |
|---|---|---|
| Set calendar-month basis | July has 31 days | Payroll can use real month length |
| Change to fixed-days example | 30 days | Schools can follow fixed salary-day rules |
| Show holiday treatment | Paid holiday | Holidays do not accidentally reduce salary |
| Show audit/version | Latest policy change | Payroll rule changes are traceable |

Presenter example:

`This policy tells payroll how many payable days exist before salary is calculated. That is why the payslip later can explain its basis instead of just showing a number.`

### Policy assignments

Route: `/hr/assignments`.

Demo steps:

1. Open Policy Assignments.
2. Create a group-level assignment for Teaching staff.
3. Assign work calendar, attendance policy, leave policy, and payroll policy.
4. Use effective date `2026-06-01`.
5. Save the assignment.
6. Create a second group-level assignment for Non Teaching staff if you have time.
7. Create an staff-level override for `Aarav Sharma` only if you want to show precedence.
8. Show conflict, priority, or effective-date messaging if it appears.

Example:

| Target | Work calendar | Attendance policy | Leave policy | Payroll policy | Effective from |
|---|---|---|---|---|---|
| Teaching group | `DDVS Standard Calendar 2026-2027` | `Teaching Staff Attendance Policy` | `DDVS Staff Leave Policy 2026-2027` | `Monthly Staff Payroll Policy 2026-2027` | `2026-06-01` |
| Non Teaching group | `DDVS Admin Office Calendar 2026-2027` | `Admin Office Attendance Policy` | `DDVS Staff Leave Policy 2026-2027` | `Monthly Staff Payroll Policy 2026-2027` | `2026-06-01` |

Staff override example:

| Target | Override | Effective from | Why show it |
|---|---|---|---|
| Aarav Sharma | `Teaching Staff Attendance Policy - Relaxed Demo` | `2026-07-01` | Staff-level assignment beats group assignment |

Best thing to show:

| UI action | Demo value | What it proves |
|---|---|---|
| Assign policies to Teaching group | All four policies from above | New teachers inherit rules automatically |
| Assign different attendance to Non Teaching group | Office timing policy | Different staff groups can follow different attendance expectations |
| Add staff override | Aarav relaxed policy | Specific staff rules beat group rules |
| Try overlapping assignment | Same target and date range | System warns or blocks conflicting effective rules |

Presenter example:

`Policies are reusable. Assignment is where the school decides who gets which rule. Group assignment keeps setup fast, and employee override handles exceptions without changing everyone else.`

### Verify effective policies

Use the preview inside the assignment drawer and the change-impact confirmation before saving.
For automated precedence and date checks, use the authenticated effective-policies API documented in the backend HR API guide.
There is no standalone Policy Impact screen.

Example result to expect:

| Staff | Date | Resolved calendar | Resolved attendance | Resolved leave | Resolved payroll |
|---|---|---|---|---|---|
| Aarav Sharma | `2026-07-15` | `DDVS Standard Calendar 2026-2027` | `Teaching Staff Attendance Policy` | `DDVS Staff Leave Policy 2026-2027` | `Monthly Staff Payroll Policy 2026-2027` |
| Meera Iyer | `2026-07-15` | `DDVS Admin Office Calendar 2026-2027` | `Admin Office Attendance Policy` | `DDVS Staff Leave Policy 2026-2027` | `Monthly Staff Payroll Policy 2026-2027` |

Resolution order to explain:

| Priority | Source | Demo explanation |
|---|---|---|
| 1 | Staff assignment | Direct staff override wins |
| 2 | Group assignment | Teaching or Non Teaching group rule applies |
| 3 | Default policy | Used only when no specific assignment applies |

This is the best place to prove that policy setup has actually connected to an staff.

### Policy demo close

Before leaving Policies and Rules, say:

`Now the system knows Aarav's working calendar, attendance expectations, leave balances, and payroll calculation basis. The rest of the demo will reuse these rules instead of entering the same decisions again.`

Use this quick proof chain:

| Later screen | Policy proof to mention |
|---|---|
| Staff profile dashboard | Resolved calendar shows holidays and attendance context |
| Manual attendance | Attendance policy decides late, half-day, missing-punch, and lock behavior |
| Leave center | Leave policy decides available balance and paid or unpaid impact |
| Payroll run | Payroll policy and leave/attendance facts decide payable days and net pay |
| Payslip | Locked payroll snapshot preserves the final policy basis |

## 3. Configure staff document settings

Route: `/hr/setting`.

Demo steps:

1. Open Staff, Settings, Document Types.
2. Create or review document types such as `Aadhaar Card`, `PAN Card`, `Qualification Certificate`, and `Experience Letter`.
3. Mark required documents if the screen supports it.
4. Save and show active or inactive status if visible.

Example narration:

`Before onboarding staff, HR defines which documents the school wants to collect. The employee profile document tab uses these configured document types.`

## 4. Demo staff onboarding

Route: `/hr/employee/onboarding`.

Demo steps:

1. Open Staff Onboarding.
2. Create a new invitation for `Aarav Sharma`.
3. Select Teaching group.
4. Select only an Staff-audience role that is approved for onboarding.
5. Enter email `aarav.sharma.demo@ddvs.edu` and mobile `9876501234`.
6. Send the invitation.
7. Show status `Invitation sent`.
8. Regenerate the invitation link only while the application is unsubmitted, if needed.
9. Open the public application link in a demo browser session.
10. Submit personal, family, work, education, and optional file details.
11. Return to HR, open the submitted application, and move it through review stages.
12. Finalize the application.

Example invitation data:

| Field | Value |
|---|---|
| Name | `Aarav Sharma` |
| Staff group | Teaching |
| Role | `Teacher` |
| Email | `aarav.sharma.demo@ddvs.edu` |
| Mobile | `9876501234` |

Example public application data:

| Section | Example |
|---|---|
| Personal | Date of birth `1992-04-12`, joining date `2026-07-01`, category `General`, family caste `Sharma` |
| Family | Father `Mahesh Sharma`, spouse `Nisha Sharma` |
| Work | Organization `Bright Future School`, designation `Math Teacher`, start date `2018-06-01`, end date `2026-05-31` |
| Files | PDF resume and JPG photo under the allowed size |

During finalization, say:

`Finalization is atomic. The backend creates the employee, identity user, policy defaults, academic scope, organization assignment, and final application status in one unit of work.`

Avoid these mistakes:

| Mistake | Why it fails |
|---|---|
| Selecting Admin or Super Admin as the staff role | Reserved roles are not assignable to staff |
| Finalizing a Teaching staff without academic year and academic scope | Teaching staff require academic scope |
| Adding family details without a family-member name | Public application validation blocks incomplete family rows |
| Uploading unsafe or oversized files | Backend file validation checks size, extension, MIME, filename, and signature |

## 5. Demo Staff Directory and profile

Route: `/hr/employee`.

Demo steps:

1. Search for `Aarav Sharma`.
2. Open the staff profile.
3. Show profile overview and dashboard tab.
4. Edit personal information.
5. Edit family information.
6. Edit additional details.
7. Add or review work experience.
8. Assign reporting manager `Priya Nair`.
9. Upload required documents.
10. Review payroll details or policy overrides if visible.
11. Show status change, such as Active to Left, only on disposable demo data.

Suggested profile changes:

| Area | Example |
|---|---|
| Personal | Update alternate mobile `9876505678` |
| Family | Add emergency contact `Nisha Sharma` |
| Work experience | Add prior school experience |
| Reporting manager | `Priya Nair` |
| Documents | Upload `Qualification Certificate` |

Call out:

`The employee profile is the master record. Changes here affect reporting, attendance eligibility, leave center, salary structure readiness, dashboards, and reports.`

For the profile dashboard, show attendance, leave balance, pending leaves, and upcoming holidays.
If data is missing, say the system shows explicit unavailable or not-marked states instead of fake sample values.

## 6. Demo staff I-card

Route: `/hr/i-card`.

Demo steps:

1. Open I-card.
2. Select staff `Aarav Sharma`.
3. Choose an I-card template or create a template.
4. Show field palette, QR code, barcode, orientation, layout preview, and selected staff navigation.
5. Generate or download the PDF if the environment supports it.

Example narration:

`The I-card designer uses live employee data, so HR can generate printable cards without retyping staff information.`

If changing orientation, show that elements stay inside the printable card.

## 7. Demo attendance dashboard

Route: `/hr/attendance-dashboard`.

Demo steps:

1. Open Attendance Management, Dashboard.
2. Show live status, late trend, action center, shift monitoring, top defaulters, and problem detection widgets if populated.
3. Filter by date or group if controls are available.
4. Use quick actions to navigate to Mark Attendance or Attendance Register.

Example narration:

`This dashboard helps HR find missing punches, late arrivals, shift issues, and attendance exceptions before payroll is calculated.`

## 8. Demo device attendance

Route: `/hr/biometric-attendance`.

Demo steps:

1. Open Device Integration.
2. Show monthly import/run history.
3. Download the attendance import template if the option is available.
4. Upload or preview a sample attendance file only in demo data.
5. Review matched rows, warnings, and invalid rows.
6. Confirm the import if safe.
7. Show lock or unlock behavior if the batch is disposable.

Example file row:

| Staff code | Date | In time | Out time | Status |
|---|---|---|---|---|
| `EMP-DEMO-001` | `2026-07-15` | `08:02` | `15:35` | Present |

Call out that import preview validates headers, staff matching, month consistency, and warnings before confirmation.

## 9. Demo attendance register

Route: `/hr/attendance-tracking`.

Demo steps:

1. Open Attendance Register.
2. Filter the date range to the payroll month.
3. Search `Aarav Sharma`.
4. Show date-wise or staff-wise rows.
5. Open row details if available.
6. Show adjustment action only if the row is not locked.

Example narration:

`The register is the audit-friendly view of attendance facts that payroll will read. Locked rows protect the payroll basis.`

## 10. Demo manual attendance

Route: `/hr/manual-attendance`.

Demo steps:

1. Select date `2026-07-15`.
2. Search or filter to `Aarav Sharma`.
3. Mark Present with in time `08:05` and out time `15:30`.
4. Change another disposable staff to Half Day to show status-specific clock handling.
5. Save.
6. Reset before save if you want to show the day returning to last loaded state.
7. Lock the day only if this is disposable demo data.

Example statuses to show:

| Staff | Status | In | Out |
|---|---|---|---|
| Aarav Sharma | Present | `08:05` | `15:30` |
| Meera Iyer | Half Day | `09:10` | `12:30` |

Explain that manual attendance save invalidates cached attendance, payroll, and HR dashboard data after persistence.

## 11. Demo leave management

Main route: `/hr/leave-center`.

Additional direct routes exist: `/hr/apply-leave`, `/hr/leave-approvals`, `/hr/leave-balance`.

Demo steps:

1. Open Leave Center.
2. Search `Aarav Sharma`.
3. Show balances, pending requests, approved history, and leave calendar.
4. Apply for casual leave for `2026-07-18`.
5. Use reason `Family function`.
6. Submit the request.
7. Open approvals and approve or reject the request if the route is available to your role.
8. Return to Leave Center and show updated balance.
9. Mention payroll impact for paid and unpaid leave.

Example request:

| Field | Value |
|---|---|
| Staff | Aarav Sharma |
| Leave type | Casual leave |
| Dates | `2026-07-18` to `2026-07-18` |
| Duration | Full day |
| Reason | `Family function` |

Call out:

`Approved leave can overlay an unrecorded attendance day on dashboards, but a stored attendance record remains authoritative for the same date.`

## 12. Demo payroll settings

Active menu routes:

| Setting | Route |
|---|---|
| Earning Component | `/hr/payroll/setting/earning-component` |
| Deduction Component | `/hr/payroll/setting/deduction-component` |
| PF Rule | `/hr/payroll/setting/pf` |

### Earning components

Demo steps:

1. Open Earning Component.
2. Create or review `Basic Salary`.
3. Create or review `HRA`.
4. If supported, show percentage dependency such as HRA based on Basic.

Example:

| Component | Type | Example |
|---|---|---|
| Basic Salary | Fixed earning | `30000` |
| HRA | Percentage earning | `40% of Basic Salary` |
| Transport Allowance | Fixed earning | `2000` |

Explain that percentage components must reference valid active earning components and cannot create dependency cycles.

### Deduction components

Demo steps:

1. Open Deduction Component.
2. Create or review `Professional Deduction` or `Staff Welfare Deduction`.
3. Show active/inactive status if available.

Example:

| Component | Type | Example |
|---|---|---|
| Staff Welfare Deduction | Fixed deduction | `500` |

### PF rules

Demo steps:

1. Open PF Rule.
2. Create or review `Standard PF Rule`.
3. Show employer and staff contribution settings if available.

Example:

| Field | Value |
|---|---|
| Rule name | `Standard PF Rule` |
| Staff contribution | `12%` |
| Employer contribution | `12%` |

TDS and professional tax pages exist, but the active HR menu comments them out.
Only show those pages by direct route if the demo intentionally covers partial surfaces.

## 13. Demo salary structure

Route: `/hr/payroll/structure`.

Demo steps:

1. Search `Aarav Sharma`.
2. Open salary structure.
3. Add earning rows: Basic, HRA, Transport Allowance.
4. Add deduction rows: PF and Staff Welfare Deduction.
5. Add temporary component only if you want to show month-bound adjustments.
6. Save and reload.

Example structure:

| Line | Amount |
|---|---:|
| Basic Salary | `30000` |
| HRA | `12000` |
| Transport Allowance | `2000` |
| PF | `1800` |
| Staff Welfare Deduction | `500` |

Call out that saved salary-component rows are the source of payroll readiness.
Optional payroll metadata should not falsely block payroll when the salary structure exists.

## 14. Demo payroll overview and run payroll

Routes: `/hr/payroll` and `/hr/payroll/run-payroll`.

Demo overview steps:

1. Open Payroll Management, Overview.
2. Show readiness, recent payroll runs, pending issues, and quick links if available.
3. Move to Run Payroll.

Run payroll steps:

1. Select month `July-2026`.
2. Load readiness or preview.
3. Search `Aarav Sharma`.
4. Show attendance days, paid leave, unpaid leave, gross, deductions, net pay, and warnings.
5. Mark the staff row reviewed.
6. Add an adjustment, such as `Demo arrears +1000`, if safe.
7. Refresh preview if prompted.
8. Lock payroll only for the disposable demo staff or demo month.

Example adjustment:

| Field | Value |
|---|---|
| Type | Earning adjustment |
| Label | `Demo arrears` |
| Amount | `1000` |
| Reason | `Approved demo adjustment` |

Important narration:

`Payroll preview reads employee salary structure, attendance, leave, and effective policies. Lock creates the salary-slip snapshot, and finalized or paid salary slips become immutable facts.`

Do not lock real payroll by accident.
If the environment is not disposable, stop after preview and review.

## 15. Demo payslips

Route: `/hr/payroll/payslip-generation`.

Demo steps:

1. Select staff `Aarav Sharma`.
2. Select month `July-2026`.
3. Load payslip.
4. Show earnings, deductions, gross, net, attendance or policy basis, and generated date.
5. Download or print PDF if available.

If no locked payroll exists, explain:

`Payslip generation needs a locked payroll snapshot. I will show the empty or missing-payslip state instead of generating a fake slip.`

Only a true missing payslip should be described as missing.
Access, server, or network failures are different and should be retried or acknowledged.

## 16. Demo performance management

Active menu label: Performance Management.

Routes:

| Area | Route |
|---|---|
| Overview | `/hr/professional-management/overview` |
| Reviews | `/hr/professional-management/reviews` |
| Cycles and Templates | `/hr/professional-management/cycles` |
| Outcomes | `/hr/professional-management/outcomes` |
| Reports | `/hr/professional-management/reports` |
| Settings | `/hr/professional-management/settings/setup` |

Demo steps:

1. Open Overview and show dashboard metrics.
2. Open Settings and show setup readiness.
3. Open Cycles and Templates.
4. Create or review a review cycle named `Term 1 Staff Review 2026`.
5. Assign `Aarav Sharma` to the cycle.
6. Open Reviews and add observation, evidence, feedback, and ratings if demo data allows.
7. Finalize or move the review only on disposable data.
8. Open Outcomes and show result tracking.
9. Open Performance Reports and export or preview if available.

Example cycle:

| Field | Value |
|---|---|
| Cycle | `Term 1 Staff Review 2026` |
| Period | `2026-07-01` to `2026-09-30` |
| Template | `Teaching Staff Review` |
| Staff | Aarav Sharma |

Narration:

`This area connects staff performance cycles, reviews, evidence, outcomes, and reports so HR can manage professional development beyond payroll.`

## 17. Demo HR reports

Route: `/hr/reports`.

Demo steps:

1. Open Reports.
2. Show report catalog.
3. Pick an staff, attendance, leave, payroll, policy, or performance report.
4. Select filters, such as academic year, date range, department, staff group, or payroll month.
5. Preview the report.
6. Save as a template if useful.
7. Export to PDF or Excel if the environment supports background export.
8. Open export history.
9. Filter history by requested date.
10. Show details, retry, regenerate, share, schedule, or delete failed export if available and safe.

Example report:

| Field | Value |
|---|---|
| Source | Attendance summary |
| Date range | `2026-07-01` to `2026-07-31` |
| Staff group | Teaching |
| Format | PDF preview, Excel for full data |

Call out:

`Reports use the same filters for preview and export, and exports store tenant and UserScope snapshots so shared files do not leak data outside permitted scope.`

For wide PDF reports, mention that PDF can cap rows and Excel is better for complete raw export.

## 18. Demo HR notifications

Route: `/hr/hr-notification`.

Demo steps:

1. Open Notification.
2. Show staff notification settings.
3. Show attendance and leave notification settings.
4. Show event and holiday notification settings if visible.
5. Review notification history or delivery status if available.

Example settings to mention:

| Notification area | Example |
|---|---|
| Staff | New staff finalized |
| Attendance and leave | Missing attendance, leave approval |
| Event and holiday | Upcoming staff holiday |

Narration:

`Notifications turn HR records into operational reminders, so attendance gaps, leave decisions, employee updates, and calendar events reach the right staff.`

## Optional partial surfaces

These routes exist in code but are not active main-menu demo steps.
Use them only if the product owner asks for a deep link.

| Surface | Route | Demo guidance |
|---|---|---|
| Events and holidays | `/hr/events-holidays` | Page exists, but HR menu visibility is commented in `src/constants/hr-menus.ts` |
| Holiday impact | `/hr/holiday` | Route exists, but menu entry is commented |
| TDS | `/hr/payroll/setting/tds` | Page exists, but menu entry is commented |
| Professional tax | `/hr/payroll/setting/professional-tax` | Page exists, but menu entry is commented and backend docs mark the surface partial |
| Training | `/hr/training` | Route exists, but HR ownership is unconfirmed |
| Legacy performance route | `/hr/performance` | Prefer `/hr/professional-management/**` for the active performance demo |
| Attendance import direct page | `/hr/biometric-integration` | Route exists, but main menu points to Device Integration at `/hr/biometric-attendance` |

## End-to-end story script

Use this short script if time is limited:

1. `I will start at the HR dashboard to show the current staff health of the school.`
2. `Then I will configure policies because attendance, leave, and payroll depend on the effective policy assigned to each employee.`
3. `Next I will onboard a teacher and finalize the application into a real employee record.`
4. `After that I will maintain the employee profile, upload documents, and generate an I-card.`
5. `Then I will capture attendance and apply leave to show how daily HR facts are recorded.`
6. `Now I will run payroll, review calculated earnings and deductions, and generate the payslip from the locked snapshot.`
7. `Finally I will show performance management, reports, and notifications as the management and communication layer on top of HR data.`

## Quick recovery notes

Use this table when demo data is not perfect:

| Problem | What to say or do |
|---|---|
| Dashboard is empty | Explain that widgets show live tenant data and move to policy or staff setup |
| Staff cannot be finalized | Check staff group, role approval, category, family caste, academic year, and teaching academic scope |
| Role dropdown is empty | Use a role marked as Staff audience and explicitly approved for onboarding |
| Attendance row is locked | Do not edit it; show that locks protect payroll facts |
| Leave balance is unavailable | Explain that leave policy assignment is required for balance calculation |
| Payroll preview says not ready | Check salary structure, policy assignment, attendance facts, and selected month |
| Payslip is missing | Confirm payroll has been locked for that staff and month |
| Report export takes time | Show preview first, then export history and queued status |
| Partial route is requested | State that the page exists but is not active main navigation unless product confirms it |

## Close the demo

End with this summary:

`The HR module covers the complete staff lifecycle: policy setup, onboarding, employee records, documents, I-cards, attendance, leave, payroll, payslips, performance, reports, and notifications. The important point is that each step feeds the next one, so the school can demo and operate HR as a connected end-to-end process.`
