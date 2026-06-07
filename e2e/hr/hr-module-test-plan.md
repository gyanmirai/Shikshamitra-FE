# HR Module End-to-End Browser Test Plan

## Scope

Validate HR end to end across frontend, backend APIs, and payroll calculations:

- Employee creation and profile persistence
- Payroll component and salary structure setup
- Current-month attendance capture and attendance register visibility
- Payroll preview, review, lock, and salary slip verification
- Policy, permission, and locked-period safeguards

Run against a seeded local DDVS backend, not staging, because the full-cycle test can create employees and lock payroll rows.

## Environment

- Backend: `https://localhost:44332`
- Frontend: `http://localhost:3000`
- Tenant: `DDVS`
- Full-cycle local user: `admin-ddvs` / `Temp@123`
- Permission regression user: `hr-manager@ddvs.com` / `Temp@123`
- Required Playwright env:

```powershell
$env:E2E_API_URL='https://localhost:44332'
$env:NEXT_PUBLIC_API_URL='https://localhost:44332'
$env:E2E_BASE_URL='http://localhost:3000'
$env:NEXT_PUBLIC_APP_URL='http://localhost:3000'
$env:AUTH_URL='http://localhost:3000'
$env:AUTH_TRUST_HOST='true'
$env:E2E_TENANT='DDVS'
$env:E2E_HR_EMAIL='admin-ddvs'
$env:E2E_HR_PASSWORD='Temp@123'
```

For the payroll-locking full cycle:

```powershell
$env:E2E_HR_FULL_CYCLE='1'
```

## Automated Suites

1. Employee CRUD and profile suites:
   - `e2e/hr/employee/employee-create.spec.ts`
   - `e2e/hr/employee/employee-edit-stepper.spec.ts`
   - `e2e/hr/employee/employee-profile.spec.ts`
   - `e2e/hr/employee/employee-documents.spec.ts`
   - `e2e/hr/employee/employee-status.spec.ts`
   - `e2e/hr/employee/employee-salary-structure.spec.ts`

2. Full HR payroll cycle:
   - `e2e/hr/hr-module-full-cycle.spec.ts`
   - Creates an employee context, creates/reuses fixed earning and deduction components, saves payroll details and salary structure, marks current-day attendance through the attendance register adjustment API, opens attendance/payroll browser routes, previews payroll for the current month, marks the employee reviewed, locks payroll for that employee, and verifies salary slip values.

Run:

```powershell
npm run test:e2e -- e2e/hr/employee e2e/hr/hr-module-full-cycle.spec.ts --project=chromium
```

Verified local runs:

```powershell
npm run test:e2e -- e2e/hr/employee/employee-create.spec.ts --project=chromium
$env:E2E_HR_FULL_CYCLE='1'
npm run test:e2e -- e2e/hr/hr-module-full-cycle.spec.ts --project=chromium
```

## Core Test Cases

| ID | Area | Scenario | Expected result |
| --- | --- | --- | --- |
| HR-E2E-001 | Auth | HR manager logs in and persisted auth state is reused | Protected HR routes load without redirecting to login |
| HR-E2E-002 | Employee | Create a teaching employee from the web form | Employee code is generated; employee is searchable by email, name, code, and mobile |
| HR-E2E-003 | Employee | Required and invalid fields | Controlled validation appears for invalid mobile, email, pincode, and future DOJ |
| HR-E2E-004 | Profile | Save family, additional, work experience, payroll/bank, reporting manager | Values persist after refresh and profile tabs render |
| HR-E2E-005 | Documents | Upload, view/download, reject invalid document | Valid file is listed; invalid or oversized upload is rejected |
| HR-E2E-006 | Payroll Components | Create earning and deduction components | Components appear in component lists and can be selected in salary structure |
| HR-E2E-007 | Salary Structure | Assign fixed basic/HRA and deduction to employee | Salary structure GET returns same earning/deduction amounts |
| HR-E2E-008 | Attendance | Mark current-month attendance as present/half-day/absent | Attendance day and register reflect selected status and summary counts |
| HR-E2E-009 | Attendance Lock | Lock day and attempt edit | Edit is blocked or returns controlled error; payroll preview invalidates after unlock/edit |
| HR-E2E-010 | Payroll Readiness | Open run payroll for current month | Readiness shows no blocking issue for the prepared employee |
| HR-E2E-011 | Payroll Preview | Preview current-month payroll | Gross, deductions, payable days, and net pay match expected salary and attendance basis |
| HR-E2E-012 | Payroll Review | Mark employee payroll row reviewed | Row status changes to reviewed and becomes lockable |
| HR-E2E-013 | Payroll Lock | Lock payroll for employee | Lock succeeds; preview/salary slip are finalized and idempotent re-lock does not duplicate |
| HR-E2E-014 | Salary Slip | Fetch salary slip after lock | Net salary, total earning, deductions, payable days, employee name/code, and month match preview |
| HR-E2E-015 | Adjustment | Add payroll-only earning/deduction before lock | Preview recalculates net pay and salary slip matches adjusted values |
| HR-E2E-016 | Permissions | Lower-permission user opens HR routes | Write actions hidden or blocked with controlled 403 |

## Payroll Value Assertions

For a full-month present employee with fixed components:

- `grossSalary = sum(earning components)`
- `totalDeduction = sum(deduction components + statutory rules)`
- `netPay = grossSalary - totalDeduction + positiveAdjustments - negativeAdjustments`
- `payableDays` equals policy basis days when all required working days are present
- Half-day and absent entries reduce payable days according to the active attendance/payroll policy
- Final salary slip values must equal the locked payroll preview snapshot

## Current Known Harness Notes

- Playwright Chromium was missing locally and was installed with `npx playwright install chromium`.
- `auth.setup.ts` now waits for `/api/auth/session` to expose an access token before saving storage state.
- Onboarding is marked completed in the saved Playwright storage state to avoid tour overlays intercepting clicks.
- Employee web creation now uploads an in-memory profile image, scopes first/last-name fields to the employee form, and uses alphabetic-only name fixtures because the UI rejects digits in name fields.
- `hr-manager@ddvs.com` currently receives `403` from `/api/identity/roles/all`, so web employee creation cannot populate the Role dropdown under that account. The verified create/full-cycle runs use `admin-ddvs`.
- The full-cycle spec is intentionally gated by `E2E_HR_FULL_CYCLE=1` because it creates local data and locks the prepared employee payroll row for the current month.
- Current-month payroll preview is prorated by `payableDays / totalWorkingDays`; a one-day attendance mark against a `30000` monthly earning produced prorated gross/net values, then salary slip matched the locked payroll snapshot.
