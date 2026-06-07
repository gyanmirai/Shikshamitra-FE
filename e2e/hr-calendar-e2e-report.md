# HR and Calendar E2E Report

Date: 2026-06-07

## Scope Covered

- HR employee lifecycle, attendance marking, payroll run, and salary slip verification.
- HR policy routes and APIs: work calendar, payroll policy, attendance policy.
- HR leave routes and APIs: leave type, leave policy, leave request creation.
- Calendar Group Management route and APIs: HR-backed employee selection, create group with multiple employees, reload details, update group after removing one employee, and verify split counts.
- Calendar Event and Holiday UI: create event/holiday through the actual screens, select audience group, and verify persisted audience IDs.

## Commands Run

```powershell
$env:E2E_HR_FULL_CYCLE='1'
$env:E2E_HR_EMAIL='admin-ddvs'
$env:E2E_HR_PASSWORD='Temp@123'
$env:NEXT_PUBLIC_API_URL='https://localhost:44332'
$env:E2E_API_URL='https://localhost:44332'
$env:E2E_BASE_URL='http://localhost:3000'
$env:NEXT_PUBLIC_APP_URL='http://localhost:3000'
$env:AUTH_URL='http://localhost:3000'
$env:AUTH_TRUST_HOST='true'
$env:E2E_TENANT='DDVS'
npx playwright test e2e/hr/hr-module-full-cycle.spec.ts --project=chromium --reporter=list
```

Result: passed, 2/2 tests.

```powershell
$env:E2E_HR_FULL_CYCLE='1'
$env:E2E_HR_EMAIL='admin-ddvs'
$env:E2E_HR_PASSWORD='Temp@123'
$env:NEXT_PUBLIC_API_URL='https://localhost:44332'
$env:E2E_API_URL='https://localhost:44332'
$env:E2E_BASE_URL='http://localhost:3000'
$env:NEXT_PUBLIC_APP_URL='http://localhost:3000'
$env:AUTH_URL='http://localhost:3000'
$env:AUTH_TRUST_HOST='true'
$env:E2E_TENANT='DDVS'
npx playwright test e2e/hr-calendar-e2e.spec.ts --project=chromium --reporter=list
```

Result: passed, 2/2 tests.

Re-run on 2026-06-07 after the latest Calendar API/UI fixes:

```powershell
$env:E2E_HR_EMAIL='admin-ddvs'
$env:E2E_HR_PASSWORD='Temp@123'
$env:NEXT_PUBLIC_API_URL='https://localhost:44332'
$env:E2E_API_URL='https://localhost:44332'
$env:E2E_BASE_URL='http://localhost:3000'
$env:NEXT_PUBLIC_APP_URL='http://localhost:3000'
$env:AUTH_URL='http://localhost:3000'
$env:AUTH_TRUST_HOST='true'
$env:E2E_TENANT='DDVS'
npx playwright test e2e/hr-calendar-e2e.spec.ts --project=chromium --reporter=list
```

Result: passed, 2/2 tests. The first attempt failed in auth setup because the backend API was not serving on `https://localhost:44332`; after starting `ShikshaMitra.HttpApi.Host`, auth and the full calendar flow passed.

UI-level Calendar Group Management coverage added on 2026-06-07:

```powershell
$env:E2E_HR_EMAIL='admin-ddvs'
$env:E2E_HR_PASSWORD='Temp@123'
$env:NEXT_PUBLIC_API_URL='https://localhost:44332'
$env:E2E_API_URL='https://localhost:44332'
$env:E2E_BASE_URL='http://localhost:3000'
$env:NEXT_PUBLIC_APP_URL='http://localhost:3000'
$env:AUTH_URL='http://localhost:3000'
$env:AUTH_TRUST_HOST='true'
$env:E2E_TENANT='DDVS'
npx playwright test e2e/calendar-group-ui.spec.ts --project=chromium --reporter=list
```

Result: passed, 2/2 tests. This creates a group through the actual Group Management UI, selects an active HR employee through Direct Selection, saves it, searches the table, reopens edit mode, and verifies the selected employee displays by name/code.

Combined Calendar E2E run:

```powershell
npx playwright test e2e/hr-calendar-e2e.spec.ts e2e/calendar-group-ui.spec.ts --project=chromium --reporter=list --workers=1
```

Result: passed, 3/3 tests. These specs share authenticated state and tenant data, so the combined run is intentionally serial.

UI-level Calendar Event/Holiday coverage added on 2026-06-07:

```powershell
$env:E2E_API_URL='https://localhost:44332'
$env:NEXT_PUBLIC_API_URL='https://localhost:44332'
npx playwright test e2e/calendar-event-holiday-ui.spec.ts --project=chromium --reporter=list
```

Result: passed, 2/2 tests. This creates an event and a holiday through the actual Calendar UI, selects a HR-backed group audience, verifies persistence through the API, and cleans up created records.

Combined Calendar E2E run after adding Event/Holiday UI coverage:

```powershell
$env:E2E_API_URL='https://localhost:44332'
$env:NEXT_PUBLIC_API_URL='https://localhost:44332'
npx playwright test e2e/hr-calendar-e2e.spec.ts e2e/calendar-group-ui.spec.ts e2e/calendar-event-holiday-ui.spec.ts --project=chromium --reporter=list --workers=1
```

Result: passed, 4/4 tests. The run is intentionally serial because these specs share authenticated state, tenant data, and local dev-server compilation.

```powershell
npx eslint e2e/hr-calendar-e2e.spec.ts src/screens/hr/policies/hr-policy-workspace.constants.ts
```

Result: passed.

```powershell
npx eslint src/screens/calendar src/redux/calendar src/enums/event-type.ts src/enums/holiday-status-type.ts src/enums/calendar-status.test.ts e2e/hr-calendar-e2e.spec.ts
```

Result: passed.

```powershell
npx eslint e2e/auth.setup.ts e2e/calendar-group-ui.spec.ts e2e/hr-calendar-e2e.spec.ts src/screens/calendar/GroupManagement/Components/GroupForm.tsx src/screens/calendar/GroupManagement/Components/GroupTable.tsx
```

Result: passed.

```powershell
npx eslint e2e/hr-calendar-e2e.spec.ts e2e/calendar-group-ui.spec.ts e2e/calendar-event-holiday-ui.spec.ts src/screens/calendar/GroupManagement/Components/GroupForm.tsx src/screens/calendar/Events/addeventForm.tsx src/screens/calendar/Events/Components/EventTable.tsx src/screens/calendar/Events/components/getValidationEventSchema.tsx src/screens/calendar/Holiday/Components/HolidayForm.tsx src/screens/calendar/Holiday/Components/HolidayTable.tsx e2e/auth.setup.ts
```

Result: passed.

```powershell
npm run ts
```

Result: passed.

```powershell
dotnet build ShikshaMitra.sln --no-restore
```

Result: passed after stopping and restarting the stale API host process that was locking host DLLs.

```powershell
dotnet test test\ShikshaMitra.HttpApi.Tests\ShikshaMitra.HttpApi.Tests.csproj --filter "FullyQualifiedName~GroupManagementApi_Tests|FullyQualifiedName~CalendarViewApi_Tests|FullyQualifiedName~EventApi_Tests|FullyQualifiedName~HolidayApi_Tests|FullyQualifiedName~EventTypeApi_Tests|FullyQualifiedName~HolidayTypeApi_Tests|FullyQualifiedName~WorkCalendarPolicyApi_Tests" -p:BaseOutputPath=C:\Repo\ShikshaMitra\Shikshamitra-BE\artifacts\codex-test-bin\
```

Result: passed, 40/40 tests.

## Bugs and Fixes

- Fixed E2E login flakiness by waiting for the School Code field before filling credentials in `e2e/auth.setup.ts`.
- Fixed the HR full-cycle payroll test using a weekend attendance date by choosing the first elapsed weekday in the month.
- Increased HR full-cycle timeout and made Run Payroll navigation wait for route rendering instead of failing during slow dev compilation.
- Added a broad repeatable E2E spec for HR policies, leave, and calendar group management in `e2e/hr-calendar-e2e.spec.ts`.
- Fixed the new leave E2E flow to use multipart form submission, matching the leave controller contract.
- Fixed repeatability for leave creation by selecting an available weekday that does not overlap the employee's existing leave requests.
- Cleaned mojibake section divider comments in `src/screens/hr/policies/hr-policy-workspace.constants.ts`.
- Restarted the backend host so E2E ran against the updated Calendar group DTO/API code, including `employeeStatusType`.
- Added an explicit backend readiness check to authenticated E2E setup so missing API host failures are reported clearly before login token polling.
- Added stable non-visual test hooks to Calendar Group Management form/table for UI E2E coverage.
- Added UI-level group creation/edit E2E coverage in `e2e/calendar-group-ui.spec.ts`.
- Added UI-level event/holiday creation E2E coverage in `e2e/calendar-event-holiday-ui.spec.ts`.
- Fixed cold local auth setup failures by increasing the setup timeout after the backend readiness check.
- Fixed Calendar Event validation using event type ID as if it were the `"Meeting"` name; meeting-specific validation now keys off `typeName`, and non-meeting end date is required correctly.
- Fixed Calendar Group UI create failures when the form submitted before `currentYear.id` was available; the wizard now waits for academic year and guards submit.
- Added stable non-visual hooks to Calendar Event/Holiday forms and rows for repeatable UI coverage.
- Hardened calendar route smoke waits for cold Next.js route compilation in local E2E runs.

## Remaining Notes

- The existing auth setup test name still says "authenticate HR manager" even when the admin E2E user is supplied by env.
- The repository contains unrelated dirty files from other HR/reporting/professional-management work; this report only covers the calendar/HR E2E pass.
