---
module: hr
domain: testing
content_type: Reference
status: canonical
updated_on: 2026-07-06
owner: frontend-team
audience: humans-and-agents
---

# Validate HR frontend changes

TL;DR: run the docs check for HR docs changes, then choose focused unit, contract, or browser checks based on the screen or client you changed.

## Required docs check

Run this from `Shikshamitra-FE`:

```bash
npm run docs:hr:check
```

## Focused test commands

Use these commands for common HR frontend changes:

```bash
npx vitest run src/redux/hr src/screens/hr src/utils/hr-audit-format.test.ts
npx playwright test e2e/hr/employee --project=chromium --reporter=list
npx playwright test e2e/hr-calendar-e2e.spec.ts --project=chromium --reporter=list
```

Run the full payroll cycle only against disposable or seeded local data:

```powershell
$env:E2E_HR_FULL_CYCLE='1'
npx playwright test e2e/hr/hr-module-full-cycle.spec.ts --project=chromium --reporter=list
```

## Coverage map

Use this table to choose validation:

| Change area | First checks |
|---|---|
| Employee list, profile, documents, or status | `e2e/hr/employee/**`, employee Redux tests, employee screen tests |
| Payroll run, readiness, adjustment, lock, or slips | `e2e/hr/hr-module-full-cycle.spec.ts`, run payroll client tests |
| Attendance and imports | Attendance client tests, attendance import tests, focused Playwright flows |
| Leave center, requests, approvals, or policies | Leave utility tests, leave screen tests, HR calendar E2E |
| HR policies | `hr-policy-api.ts` tests, policy workspace tests, HR calendar E2E |
| Professional management | Professional management client and screen tests |
| Reports | `hrReportsApi.ts` tests and report screen checks |

## E2E environment

Use these environment variables for browser tests:

| Variable | Use |
|---|---|
| `E2E_HR_EMAIL` | HR or admin login |
| `E2E_HR_PASSWORD` | Password for HR or admin login |
| `E2E_HR_FULL_CYCLE=1` | Enables the mutating payroll full-cycle spec |

## Acceptance gates

Each frontend HR change should satisfy these gates:

| Gate | Pass condition |
|---|---|
| Route | [routes.md](./routes.md) matches menu and page behavior |
| Client | [clients.md](./clients.md) names the client and backend owner |
| Workflow | [workflows.md](./workflows.md) covers the user path or marks it partial |
| Backend contract | Backend [api.md](../../../Shikshamitra-BE/docs/modules/hr/api.md) is still accurate |
| Test | Focused test or documented residual risk exists |
| Docs | `npm run docs:hr:check` passes |
