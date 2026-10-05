---
module: hr
domain: testing
content_type: Reference
status: canonical
updated_on: 2026-10-05
owner: frontend-team
audience: humans-and-agents
---

## Staff terminology and policy setup regression coverage

Run `e2e/hr/hr-staff-policy-navigation.spec.ts` and `e2e/hr/employee/employee-list.spec.ts` with the authenticated Chromium project.
The navigation suite verifies the five ordered setup tabs, keyboard route changes, academic-year preservation, mobile Staff Directory and Staff Onboarding labels, and the standard not-found page at `/hr/effective-preview`.
Policy-resolution precedence and retroactive-lock assertions now use authenticated APIs in the existing policy golden, precedence, and edge-case suites.
Keep mutation impact previews, version history, audit, and payroll lock checks in those suites.

Run `HRPolicyWorkspace.navigation.test.tsx` to cover dirty calendar, attendance, payroll, and assignment drafts with the real shared tab and browser-history guards.
Verify declined navigation preserves drafts, confirmed navigation clears the guard, and closing, resetting, reopening, or unmounting a workspace resets its dirty state.
View-only drawers and background updates without a workspace drawer must not overwrite another form's guard.

Run the changed HR Vitest suites with `node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run --pool=forks --maxWorkers=1` and the relevant file paths.
The setup-state and alert suites cover loading, request failure, incomplete pages, missing defaults, multiple defaults, permission-gated recovery, and the explicit sole-default archive reason.
The assignment drawer suite covers preserving an edited draft, declining discard, and navigating after confirmed discard.
Staff creation uses current-year responses and blocks submission when defaults cannot be verified.
The last completed broad run passed 393 of 395 tests across 52 files.
The two failing cases were corrected and passed in a focused rerun of 28 tests.
A subsequent full rerun stalled after startup on Windows and was stopped.
Scoped lint passed after the final changes.

On 2026-10-05, signed-in Codex browser checks verified desktop and 390 px mobile setup navigation, Staff labels, keyboard tab changes, academic-year context, and the removed URL's standard 404.
The two new navigation Playwright tests passed before the local preview was interrupted.
After the interruption, the local backend could not restore its database configuration and returned HTTP 500 during authenticated setup.
The final directory rerun and signed-in restricted-role acceptance remain blocked by that environment issue.
Global typecheck reports only the two unchanged `exact` option errors in `src/screens/student/admissions/admission-intake-assignment.test.tsx` at lines 178 and 195.
The existing deployment security-workflow assertion also fails on the baseline and is outside this change's deployment-file exclusion.

# Validate HR frontend changes

TL;DR: run the docs check for HR docs changes, then choose focused unit, contract, or browser checks based on the screen or client you changed.

## Required docs check

Run this from `Shikshamitra-FE`:

```bash
npm run docs:hr:check
```

## Focused test commands

The ESIC browser regression uses an authenticated, disposable local FullDemo environment.
Set `ESI_LOCAL_E2E=1` and `E2E_BASE_URL=http://localhost:3100`, then run `npx playwright test e2e/hr/esi-configuration.guest.spec.ts --project=chromium-guest --workers=1`.
The guest project supplies a clean browser context; the test signs in with the existing synthetic administrator and checks 390, 768, and 1440 pixel layouts, keyboard input, loading, and preview-error recovery.
It does not save payroll settings.
The API regression suite owns save, cancellation, stale-preview, locked-period, and concurrency assertions.

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

For the module overview dashboard, run `operational-dashboard-state.test.ts`, professional-management utilities, permission catalogue tests, and `e2e/hr/hr-dashboard-standard-design.spec.ts`.
The browser suite covers four primary modules, exact partial grants, scoped onboarding, workflow shortcuts, date changes and reload, retired URL keys, complete IST payroll timestamps, empty and failed sections, read-only refresh, and revoked access.
Verify the actual active light or dark theme at 390, 768, 1366, and 1440 pixels, with keyboard attendance tooltips, reduced motion, and no page overflow.
Module counts come from overview data and must not request or depend on a staff page.
Backend tests prove counts beyond 100 records, distinct appraisal deadlines, tenant isolation, and review drill-down scope.
Finish with signed-in local Codex browser checks against the real backend for existing authorized HR, principal, and supervisor accounts.
Mocked browser contracts supplement API scope tests rather than proving database authorization.

Use this table to choose validation:

| Change area                                        | First checks                                                                                                                                                                                                                                                                                                                   |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Employee list, profile, documents, or status       | `e2e/hr/employee/**`, employee Redux tests, employee screen tests                                                                                                                                                                                                                                                              |
| Employee profile dashboard                         | `employeeApi.contract.test.ts`, `employee-dashboard-utils.test.ts`, and the employee profile browser flow                                                                                                                                                                                                                      |
| Employee onboarding and public applications        | Status graph, full finalization validation, academic permission, explicit role-approval and employee-group audience, incompatible role-selection clearing, forward-step opt-in, busy-dialog close, public validation, table export, and shared-toast unit tests, plus `e2e/hr/employee-onboarding/employee-onboarding.spec.ts` |
| Employee I-card designer or export                 | `src/screens/hr/i-card/i-card-builder-utils.test.ts`, I-card client contract tests, and `e2e/hr/employee/employee-email-icard-regression.spec.ts`                                                                                                                                                                              |
| Payroll settings and component dependencies        | Earning and deduction component utility tests, salary-template editor utilities and client contracts, ESI URL normalization, direct saves, server query, stale edits and idempotent retries, conditional enrollment, dirty-form, settings screen, and client contract tests, plus focused settings flows                                                                                       |
| Compensation builder and revisions                 | Salary calculation contract tests, revision client tests, Monthly salary and Monthly cost to school examples, effective-month behavior, direct save, revision history, one-time component separation, and empty numeric component editing                                                                                         |
| Payroll run, readiness, adjustment, lock, or slips | Payslip-selection tests, compensation provenance and drift display tests, ESI government-share display tests, `e2e/hr/hr-module-full-cycle.spec.ts`, and run payroll client tests                                                                                                                                                |
| Attendance and imports                             | Attendance status-mapper tests, attendance client contract tests, attendance import month tests, and focused Playwright flows                                                                                                                                                                                                  |
| Leave center, requests, approvals, or policies     | Leave utility tests, leave API contract tests, leave policy archive and restore screen tests, and HR calendar E2E                                                                                                                                                                                                              |
| HR policies                                        | `hr-audit-format.test.ts`, `PolicyAuditDrawer.audit.test.tsx`, server-paged policy workspace tests, and HR calendar E2E                                                                                                                                                                                                        |
| Professional management                            | Professional management client and screen tests                                                                                                                                                                                                                                                                                |
| Reports                                            | `HrReportCenterEnhancements.test.tsx`, `index.test.tsx`, `useHrReportsCenterActions.test.ts`, `TableBody.empty-state.test.tsx`, `hrReportsApi.ts` tests, and report screen checks                                                                                                                                              |

## E2E environment

ESI unsaved-navigation checks must cover sidebar links,  Keep editing, Discard changes, Escape, focus return, and browser back/forward.
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
| Payroll compensation-builder tests should cover the school default template, joining-month default, template switching, Monthly salary and Monthly cost to school requests, derived protection, employee statutory context, PF applicability, controlled overrides, calculation summaries, ESI funding, target variance, direct save, activation readiness, immutable history, and month-scoped one-time components. |
| Salary-template composer tests should cover complete active creation, Needs setup recovery, row-click edit mode, editable empty fixed and percentage values, calculated-automatically formulas, PF defaults, quote defaults, role-dependent formulas, duplicate special roles, ordering, removal, server validation, stale-save recovery, read-only archived state, and unsaved navigation. |

## Salary template page regressions

Run the focused editor, list, model, and client-contract tests after changing the salary template pages.
Cover direct create/edit/view routes, denied permissions, same-page calculation validation and first-error focus, compact and expanded rows, additions, ordering, removal, and at least 15 components.
Verify only the two salary bases are offered, the amount label follows the selection, and no separate protection control or help dialog appears.
Check keyboard disclosure operation, focus restoration, and preservation of unsaved edits and the current calculation.
Verify unsaved-navigation protection and that background refetches preserve both edits and their original concurrency context.
Check preview invalidation, expiry, late responses, failed saves, and save/reopen for all compensation bases.
Finish in the authenticated Codex browser at 390 by 844, 768 by 1024, and 1440 by 900 pixels.
Confirm side-by-side large-screen collections, independent desktop component scrolling, accessible error focus, fixed footer actions, 30 px labeled buttons, right alignment, and no document horizontal overflow.

Salary-template visual checks cover light and dark themes at 390x844, 768x1024, 1440x900, and 2052x1221.
Verify populated Basic Information spacing, equal-height top cards with aligned headers, statutory disclosure keyboard support, and equal 480 px desktop component panels with stationary headers.
Verify compact rows omit Ordinary labels, preserve meaningful purpose text, and align editable values with expand actions without clipping long names or validation messages.
Verify empty states, long names, 15 or more components, independent list scrolling, natural mobile heights, and a reachable footer without horizontal overflow.
Adding, reordering, and validation must reveal the relevant row without losing focus behind a panel header or the footer.
Verify keyboard Preview Calculation navigation, pending-save interaction locking, and inline conflict recovery without losing edits.

Verify ESIC settings have no routine save confirmation, scheduling controls, impact cards, or empty attention section.
Test default-on initialization, error-only failed loads, draft preservation, and exact before-save compensation totals.

## ESIC onboarding registration checks

The 2026-10-01 salary-basis fix adds a regression ensuring CTC save does not copy partial template provenance into the independent payroll form.
All 7 salary-builder tests passed.
Authenticated local browser validation covered CTC save followed by an empty one-time-component save, then a bank-details update and persisted bank readback.
Global typecheck remains blocked by two unrelated `primaryText` prop errors on `ReferenceFileUpload` in the academic assignment and homework forms after synchronizing main.

Verify an inactive employee can open **ESIC details** under Payroll > Statutory Details and from salary setup.
Cover View and ManageEnrollment separately, failed-save draft preservation, readiness refresh, and removal of stale salary calculations after registration changes.
Covered employees without an insurance number must remain blocked from activation, including registration-pending employees.
Keep the server-side activation test in the backend compensation API suite authoritative.

On 2026-10-01, the focused salary-builder and ESIC settings suites passed all 12 tests, with typecheck and scoped lint passing.
Authenticated Codex browser checks passed at 390x844, 768x1024, and 1440x1000 using a synthetic inactive employee in the disposable local database.
Verified number entry, save and reopen, keyboard opening, Escape dismissal, and focus return.
The broader frontend security run passed 9 tests and failed 2 existing checks: I-card permission naming and deployment security-workflow wiring.
Those unrelated files remain unchanged.

## ESIC correctness and editing regression suites

Run esi-enrollment-drawer.test.tsx, esi-override-dialog.test.tsx, SalaryStructureBuilder.test.tsx and esi-statutory-settings.test.tsx.
Verify clean dismissal, all dirty close routes, declined discard, failed saves, refresh failure after success, whole-month serialization and leap-year month ends.
Verify form-shaped salary loading and absence of the permanent save banner.
Finish with authenticated in-app browser checks at 390, 768 and 1440 px, including keyboard focus and error recovery.
Report browser acceptance separately from automated checks.
Run the full src/screens/hr/payroll Vitest scope for calculation-preview state, settings, salary setup and editing regressions.
Check that the payroll readiness disclosure works with Enter and Space and retains focus.
At 390, 768 and 1440 px, inspect complete readiness labels and currency values, plus the stale and blocking-issue statuses.
The backend [calculation audit matrix](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/modules/hr/testing.md#final-calculation-audit-matrix) owns monetary and transaction acceptance.
