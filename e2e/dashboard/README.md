# Dashboard E2E Runbook

This folder contains the dashboard browser E2E spec and the API-level smoke check used when local browser tooling is blocked.

## Browser E2E

Run from `Shikshamitra-FE` after the backend and frontend are already running:

```powershell
$env:E2E_API_URL='https://localhost:44332'
$env:NEXT_PUBLIC_API_URL='https://localhost:44332'
$env:E2E_BASE_URL='http://localhost:3000'
$env:E2E_TENANT='DDVS'
$env:E2E_HR_EMAIL='hr-manager@ddvs.com'
$env:E2E_HR_PASSWORD='Temp@123'
npm run test:e2e:dashboard
```

The browser spec validates authenticated dashboard access, all five dev/test template overrides, API and preview fallback behavior, drilldown routing, and limited finance-user permission filtering.
The npm script writes Playwright artifacts to `test-results-dashboard` so dashboard runs do not contend with the default shared `test-results` folder.

## API Smoke

Use this when browser E2E cannot run because of local Playwright, Next.js, or filesystem restrictions. It still validates the backend dashboard contract against DDVS:

```powershell
$env:E2E_API_URL='https://localhost:44332'
$env:E2E_TENANT='DDVS'
.\e2e\dashboard\dashboard-api-smoke.ps1
```

The API smoke authenticates, reads `/api/dashboard/widgets`, reads `/api/dashboard/summary` for all five templates, verifies required HR/Student/Finance/Academic anchor widgets across KPIs, actions, and module snapshots, checks returned widget IDs against metadata, enforces safe relative drilldowns, and verifies the seeded finance officer cannot see unauthorized HR/payroll widgets.

For local HTTP diagnostics only, the backend may be launched with `AuthServer__DisableTransportSecurityRequirement=true`. Do not use that setting for production.
