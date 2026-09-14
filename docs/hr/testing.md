---
module: hr
domain: testing
content_type: Reference
status: canonical
updated_on: 2026-09-03
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

The payroll full-cycle spec uses a future non-current month so the background current-month worker cannot race the test.
The spec aggregates every payroll preview page before selecting its fixture employee.
Employee E2E helpers select only an explicitly onboarding-approved Employee-audience role that supports the requested employee group.

## Deployment regression gate

The frontend deployment workflow runs the HR documentation validator and the complete HR Vitest surface before the production build.
Keep these commands aligned with `.github/workflows/deploy.yml`:

```bash
npm run docs:hr:check
npx vitest run src/redux/hr src/screens/hr src/utils/hr-audit-format.test.ts
npm run build
```

## Coverage map

Use this table to choose validation:

| Change area                                        | First checks                                                                                                                                                                                                                                                                                                                   |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Employee list, profile, documents, or status       | `e2e/hr/employee/**`, employee Redux tests, employee screen tests                                                                                                                                                                                                                                                              |
| Employee profile dashboard                         | `employeeApi.contract.test.ts`, `employee-dashboard-utils.test.ts`, and the employee profile browser flow                                                                                                                                                                                                                      |
| Employee onboarding and public applications        | Status graph, full finalization validation, academic permission, explicit role-approval and employee-group audience, incompatible role-selection clearing, forward-step opt-in, busy-dialog close, public validation, table export, and shared-toast unit tests, plus `e2e/hr/employee-onboarding/employee-onboarding.spec.ts` |
| Employee I-card designer or export                 | `src/screens/hr/i-card/i-card-builder-utils.test.ts`, I-card client contract tests, and `e2e/hr/employee/employee-email-icard-regression.spec.ts`                                                                                                                                                                              |
| Payroll settings and component dependencies        | Earning and deduction component utility tests, salary-template editor utilities and client contracts, ESI URL normalization, automatic preview, server query, stale activation, conditional enrollment, dirty-form, settings screen, and client contract tests, plus focused settings flows                                                                                       |
| Compensation builder and revisions                 | Salary calculation contract tests, revision client tests, Gross, Take-home, and Employer Cost examples, effective-month behavior, separate approval, revision history, one-time component separation, and empty numeric component editing                                                                                         |
| Payroll run, readiness, adjustment, lock, or slips | Payslip-selection tests, compensation provenance and drift display tests, ESI government-share display tests, `e2e/hr/hr-module-full-cycle.spec.ts`, and run payroll client tests                                                                                                                                                |
| Attendance and imports                             | Attendance status-mapper tests, attendance client contract tests, attendance import month tests, and focused Playwright flows                                                                                                                                                                                                  |
| Leave center, requests, approvals, or policies     | Leave utility tests, leave API contract tests, leave policy archive and restore screen tests, and HR calendar E2E                                                                                                                                                                                                              |
| HR policies                                        | `hr-audit-format.test.ts`, `PolicyAuditDrawer.audit.test.tsx`, server-paged policy workspace tests, and HR calendar E2E                                                                                                                                                                                                        |
| Professional management                            | Professional management client and screen tests                                                                                                                                                                                                                                                                                |
| Reports                                            | `HrReportCenterEnhancements.test.tsx`, `index.test.tsx`, `useHrReportsCenterActions.test.ts`, `TableBody.empty-state.test.tsx`, `hrReportsApi.ts` tests, and report screen checks                                                                                                                                              |

## E2E environment

ESI unsaved-navigation checks must cover sidebar links, workspace tabs, payroll-month changes, Keep editing, Discard changes, Escape, focus return, and browser back/forward.
The workspace uses cancellable Navigation API traversal in supporting browsers and retains the native unload warning for page reload or exit.
Run `esi-unsaved-navigation.test.tsx` and verify the current supported browser at 390x844, 768x1024, and 1440x900 without adding synthetic history entries.

Use these environment variables for browser tests:

| Variable              | Use                                          |
| --------------------- | -------------------------------------------- |
| `E2E_HR_EMAIL`        | HR or admin login                            |
| `E2E_HR_PASSWORD`     | Password for HR or admin login               |
| `E2E_HR_FULL_CYCLE=1` | Enables the mutating payroll full-cycle spec |

## Acceptance gates

Each frontend HR change should satisfy these gates:

| Gate                                                                                                                                                                                                                                                                                      | Pass condition                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Route                                                                                                                                                                                                                                                                                     | [routes.md](./routes.md) matches menu and page behavior                                                           |
| Client                                                                                                                                                                                                                                                                                    | [clients.md](./clients.md) names the client and backend owner                                                     |
| Workflow                                                                                                                                                                                                                                                                                  | [workflows.md](./workflows.md) covers the user path or marks it partial                                           |
| Backend contract                                                                                                                                                                                                                                                                          | Backend [api.md](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/modules/hr/api.md) is still accurate |
| Test                                                                                                                                                                                                                                                                                      | Focused test or documented residual risk exists                                                                   |
| Docs                                                                                                                                                                                                                                                                                      | `npm run docs:hr:check` passes                                                                                    |
| Payroll compensation-builder tests should cover template defaults, Gross, Take-home, and Employer Cost requests, local and selected effective month, protection policy, employee statutory context, PF applicability, calculation summaries, ESI funding, target variance, permission-gated maker-checker actions, recoverable drafts, and month-scoped one-time components. |
| Salary-template composer tests should cover blank and incomplete drafts, editable empty fixed and percentage values, calculated-automatically formulas, quote defaults, role-dependent formulas, duplicate special roles, ordering, removal, server validation, and Edit versus Publish permission behavior.             |
