---
module: hr
domain: testing
content_type: Reference
status: canonical
updated_on: 2026-10-27
owner: frontend-team
audience: humans-and-agents
---

## Onboarding cards and salary setup

Run `node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vitest/vitest.mjs run src/screens/hr/employee-onboarding src/screens/hr/payroll/structure/SalaryStructureBuilder.test.tsx src/screens/hr/payroll/structure/salary-template-setup-state.test.tsx src/components/custom-stepper --pool=forks --maxWorkers=1` on Windows.
Coverage includes full-card/text/control toggles, one tab stop, Space/Enter, disabled cards, vertical section focus, salary/statutory draft preservation, preview invalidation, distinct loading/empty/403/failure states, fixed same-origin new-tab creation links, exact creation/route grants and explicit setup retry. Existing finalization and PF/ESIC tests retain required gates and verify no salary save or activation during preview.
Authenticated browser acceptance must separately verify new-tab creation/publish/return, bank/staff draft retention across the complete wizard, dirty-close/reopen, finalization and responsive light/dark layouts at 390/768/1440px. Synthetic component tests do not establish those browser or backend runtime results.

## Finalize onboarding role lookup

Assignment regression checks: `npx vitest run src/screens/hr/employee-onboarding/work-assignment.test.ts src/screens/hr/employee-onboarding/work-assignment-field.test.tsx src/components/custom-select --pool=threads`. Cover all three modes without role-name restrictions, no setup, multiple specific units, error/retry with preserved drafts, unavailable IDs, explicit year changes, keyboard/search/Escape and legacy text separated from functional department. The onboarding E2E helper confirms the assignment in Review. Full in-app browser, responsive/both-theme and live backend acceptance remain separate gates.

Run `node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vitest/vitest.mjs run src/screens/hr/employee-onboarding/finalize-role-field.test.tsx src/screens/hr/employee/employee-role-options.test.ts src/screens/hr/employee/employee-form-fields/RenderRole.test.tsx src/screens/security/role/employee-onboarding-role.test.ts --pool=forks --maxWorkers=1` on Windows.
The synthetic transport tests cover the Security endpoint, custom and legacy metadata, reserved/non-employee/group exclusions, every-open refresh, empty results, 403/503 recovery without draft loss, invalid selected IDs and Security mutation cache invalidation.
They do not establish a tenant's deployed role metadata or authenticated browser acceptance. Backend tenant filtering and assignment authorization remain unchanged and require their existing backend security gates before release.

## Payslip & statement settings regression

Run `node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vitest/vitest.mjs run src/screens/hr/payroll/salarySlip-generate/payslip-settings --pool=forks --maxWorkers=1` on Windows. The preview tests cover debounce, stale response suppression, cancellation, retry and identical viewer/download URLs; settings tests cover draft reset/cancel, save recovery and navigation. Browser acceptance must additionally check 390/768/1440px, both themes, keyboard focus and live PDF layout; automated component tests alone do not certify these states.

For HR keyboard coverage, the route/component inventory, synthetic browser procedure, and remaining authenticated acceptance limits, see [Keyboard usability](references/keyboard-usability.md).

`e2e/hr/payroll-document-settings.guest.spec.ts` verifies the settings link, removal of the embedded form, save/reload, view-only controls and contained widths at 390, 768 and 1440 pixels.
The settings component suites cover draft preservation, optimistic concurrency, interrupted responses, request ordering and deliberate navigation discard.
The navigation component suite verifies exact Overview selection while retaining payroll ancestry.
The shared ProgressBar currently adds a same-URL history guard entry; browser traversal coverage accounts for that existing behavior.

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

## Informational and loading notices

Run `src/screens/hr/components/hr-notice.test.tsx` and
`src/screens/hr/policies/components/PolicyImpactDrawer.summary.test.tsx` with the focused Vitest
command above. These cover polite versus assertive announcements, accessible recovery/dismissal,
preserved semantic outcomes, one loading announcement, and idle/loading/error transitions.
The payroll overview prerequisite test expects the routine context to use `status`.

For visual review, render the production Policy Impact drawer and HR notice components with
synthetic state and the production theme. Check loading, loaded, error, blocked, and contextual
notices at 390 x 844, 768 x 1024, and 1440 x 900 in light and dark mode. Verify neutral text and
paper tokens in both schemes, one progress indicator, no page overflow, wrapped long references,
reachable review/dismissal controls, contrast, and keyboard activation. Finish in the Codex in-app
browser. Synthetic component checks do not establish authenticated backend behavior.

Reporting-manager regression: run `AssignReportingManager.test.tsx`, `employee-form-validation.policy.test.ts` and `employeeApi.contract.test.ts`. Verify explicit administrator selection with no automatic default, stable identity kind on reload, no employee-detail lookup for an administrator login, clearing back to required validation, and self-exclusion. Backend clean-school API tests own tenant bootstrap, eligibility and persisted identity references; local synthetic selector checks are not authenticated deployed acceptance.

TL;DR: run the docs check for HR docs changes, then choose focused unit, contract, or browser checks based on the screen or client you changed.

## Staff policy permission contract

`src/constants/hr-policy-permissions.ts` owns the exact policy action IDs used by HR navigation and explicit policy assignment.
`src/constants/hr-policy-permissions.contract.test.ts` locks independent expectations from the backend `ShikshaMitraSubmodulePermissions.HR.Policies` and `LeaveManagement_SettingLeavePolicy` catalogue definitions.
Check those backend definitions when changing this contract; the unit test does not fetch a deployed catalogue.
Keep browser fixture grants and contract expectations independent of the implementation constants.
Run the contract, HR menu, employee form-state and payroll-edit suites together.
Run `node node_modules/@playwright/test/cli.js test --config e2e/hr/staff-policy-access.config.ts` for creation without policy reads or overrides, failure/retry draft preservation, and desktop/mobile/dark-tablet layouts.
Finish with the Codex in-app browser against the local fixture; synthetic responses do not prove deployed account access.

## Required docs check

Run this from `Shikshamitra-FE`:

```bash
npm run docs:hr:check
```

## Focused test commands

For Staff Directory creation, run `node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run src/screens/hr/employee/employee-form-state.test.ts src/screens/hr/employee/employee-form.payroll.test.tsx src/screens/hr/employee/employee-form-fields/RenderRole.test.tsx --pool=threads --maxWorkers=1`.
The tests cover saved identity continuity, existing payroll edits, and the employee-specific role lookup.
Run `node node_modules/@playwright/test/cli.js test --config e2e/hr/staff-policy-access.config.ts` for the production Personal Information form with synthetic authentication and API responses.
The isolated fixture stubs only unvisited later wizard steps and uses no school data.
It covers delegated creation, no initial policy reads for any permission/setup state, failure/retry, return navigation and editing; deployed acceptance still requires a real delegated account.

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

## Local regression checks before deployment

Run the complete HR Vitest surface locally before merging.
The frontend deployment workflow runs HR documentation validation, the production build, and TypeScript validation on `main`; it does not run tests.

```bash
npm run docs:hr:check
npx vitest run src/redux/hr src/screens/hr src/utils/hr-audit-format.test.ts
npm run build
npm run ts
```

## Coverage map

For the module overview dashboard, run `operational-dashboard-state.test.ts`, professional-management utilities, permission catalogue tests, and `e2e/hr/hr-dashboard-standard-design.spec.ts`.
The browser suite covers four primary modules, exact partial grants, scoped onboarding, absence of workflow shortcuts, date changes and reload, retired URL keys, complete IST payroll timestamps, empty and failed sections, read-only refresh, and revoked access.
Verify the actual active light or dark theme at 390, 768, 1366, and 1440 pixels, with keyboard date input, accessible trend counts, reduced motion, and no page overflow.
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
| Reports                                            | `reporting-workspace.test.tsx`, captured result tables, API helpers, and authenticated template/generation checks                                                                                                                                              |

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
Covered employees with pending registration can activate with valid salary rules; payroll applies eligible contributions and shows a registration warning.
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

## Payslip completion acceptance

The [payslip specification](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/modules/hr/references/payslip-design.md) owns the acceptance matrix and implementation ledger.
Run payslip-selection.test.ts, use-payslip-actions.test.tsx and payslip-document-action-dialog.test.tsx.
These cover late-selection responses, one private server artifact for all actions, URL cleanup, preserved correction drafts, discard confirmation and payment evidence without document amount fields.
Verify screen, print, download and email use the same issued revision, with no employer contribution or internal compensation fields.
Exercise auto-email off/on, manual Send/Resend, missing address, failed/uncertain delivery, recipient visibility and history.
Exercise unpaid correction/reissue and paid future-payroll adjustment without losing the original document.
Render generated PDFs and inspect normal, long-name and multi-page cases.
Finish with authenticated Codex browser journeys at 390, 768 and 1440 px, including keyboard, loading and recovery states.

The resumed focused payslip suites passed 14 tests across three files, and scoped ESLint passed.
Global typecheck still reports the two unrelated primaryText prop errors in assignmentForm.tsx and homeworkForm.tsx.
Authenticated browser verification confirmed delivery history recovers after the local API restarts and re-enables Resend without discarding the selected document.
This does not constitute the delivery worker process-restart acceptance check.
The earlier native PDF iframe was blank in the Codex browser despite its PDF-viewer capability reporting enabled.
The replacement PDF.js viewer renders the stored revision 4 in the authenticated Codex browser.
The print action reached copied document pages, but browser commands subsequently timed out during printing; full print acceptance remains unverified.
The incoming unrelated package-lock.json changes were captured before installation and restored byte-for-byte after the archive-only lock proved machine-specific.
The archive installation added PDF.js locally and removed eight installed test peer packages, which were restored from the existing local installation for verification.
The current manifest pins pdfjs-dist 5.6.205, which supports the deployment's Node 20 runtime, and bundles its worker through the application build.
Preserve unrelated incoming lockfile changes when reconciling the intentional PDF.js dependency before publication.

The independent settings/history probes reproduced four failures before the fix, with dirty-draft preservation already passing.
Clean settings now adopt refreshed server facts, and discarding a dirty form restores the latest observed server baseline.
Delivery history now uses current selection data during pending, failed, repeated and interrupted employee selections.
The resumed payslip scope passed thirty-one tests across six files in .artifacts/payslip-correction-ui-tests.log.
Correction controls cover required reasons, idempotent start retry, failed recalculation, dirty background refresh, review/reissue tokens, permission-disabled actions, server cancellation and shared discard confirmation.
The correction clock regressions cover field validation and focus, exact unedited timestamp precision, changed-clock serialization, failed saves and dirty background refreshes.
Keep valid punches within the same displayed minute intact, and reject newly submitted equal or reversed punches.
Check the labelled time controls at 390, 768 and 1440 px, including keyboard use, Keep editing, discard and cancellation without changing the issued PDF.
Adding missing attendance requires an explicit status and a date in the source period; it never silently creates Present attendance.
Five focused permission/security suites passed twenty-seven tests in .artifacts/payslip-correction-security-tests.log.
Scoped lint passed in .artifacts/payslip-correction-ui-lint.log.
Typecheck still reports only the two existing Academic primaryText errors in this older checkout; those files remain unchanged.
Authenticated browser reproduction confirmed the clean-refresh and stale-discard settings defects before the fix.
At that checkpoint, post-fix browser acceptance remained open because the expired local session could not be recovered with the saved sign-in credentials.
The delivery-history selection matrix and responsive correction layouts were then unrun; the later dated sections record the recovered session and executed flows.

## Resumed payslip correction checks

On 2026-10-03, the focused payslip suite passed 39 tests across nine files.
Settlement controls require a current target run, preserve the month after failed writes and ignore an interrupted calculation from another academic year.
Settings regressions cover clean refresh, dirty draft retention, latest-baseline discard and a refresh observed during a pending save.
A real RTK Query store regression confirms structurally identical GET results retain their object reference, so a cloned component prop alone does not establish production reachability of that pending-save race.
The shared navigation-hook regression covers internal links and browser traversal with both keep-editing and discard choices.
Authenticated Codex browser checks confirmed the settings link and Back guards with a dedicated synthetic local identity.
Full failed-request, repeated history selection, correction and responsive document acceptance remains open.
The authenticated paid correction journey reached reasoned draft, attendance edit, recalculation, review, later-month preview, recovery-limit rejection, retry and cancellation.
The browser verified the actionable recovery message after fixing its generic conflict response.
Cancelled evidence remained visible and revision 4 remained paid and current.
Correction layouts were inspected at 390, 768 and 1440 pixels, including scrolling and persistent actions; this does not establish PDF rendering or every responsive workflow.
The mobile raw-issue-code overflow was corrected by sharing the existing Run Payroll labels and omitting routine comparison information.

## Resumed payslip UI repairs, 2026-10-05

Authenticated local reproduction confirmed that settings saves exposed TypeError: Failed to fetch during an API outage.
FETCH_ERROR and TIMEOUT_ERROR now show plain retry guidance while preserving the exact draft and request key.
The real outage, API recovery, successful retry and restoration of the original synthetic settings were verified in the Codex browser.
The calculated correction table previously extended beyond its dialog at 390 px.
A bounded MUI table container and compact mobile cells keep all four issued/recalculated rows inside the dialog.
Authenticated calculated comparisons fit at 390, 768 and 1440 px, and keyboard focus reaches the comparison region.
The temporary correction was cancelled without applying it or changing the paid original.
The focused payslip suite passed 46 tests across ten files, including transport retry and accessible comparison regressions.
Scoped ESLint passed for the four repaired component/test files.
Full typecheck still reports only the two known Academic primaryText errors in this older checkout, which remain outside payslip scope.
These checks do not complete the remaining jurisdiction, correction race and full distribution acceptance matrix.

The final expanded UI selection passed 66 tests across 15 files with no failures or skips.
It includes the payslip folder, payroll preview/error/adjustment utilities, shared navigation guard and shared dialog close guard.
The preceding combined run exposed a transient MUI menu/combobox label ambiguity in a correction assertion.
The regression now selects the labelled combobox by its role and retains the same attendance expectation.
Authenticated delivery-history checks used two issued synthetic employees with different recorded recipients.
A controlled pending database read, an interrupted selection, a late response and an actual API failure never displayed the other employee's recipient.
The failed current selection displayed the existing history retry state and recovered after the owned API restarted.
The retry control disappeared during recovery before the attempted click, so that attempted click is not counted as a successful manual retry.
The API outage and pending read controls were confined to the disposable database and all temporary locks were rolled back.
The newly issued canonical PDF renders without missing-glyph markers or NUL text at 390, 768 and 1440 px on PDF.js 5.6.205.
Previously issued synthetic PDFs remain byte-identical, including their existing incomplete-text announcement.
The actual browser Resend flow reached provider acceptance through the running host worker and a loopback-only SMTP capture accepting one explicit synthetic recipient.
The captured attachment hash equals the stored document hash and contains only that employee's PDF.
The production webpack build passed on Node 24.19.0 with the bundled PDF.js worker.
This does not establish a Node 20 execution pass or override the separately failed full typecheck.
The scoped security run passed 21 tests and failed the unchanged deployment-workflow expectation, which remains outside payslip scope.
Native in-app download event capture timed out; independent stored-artifact download and print evidence remains separate from native printer acceptance.
An additional authenticated two-tab settings journey changed the server baseline while the first tab retained an unsaved draft.
An actual correction mutation triggered the existing RTK Query background refresh without replacing that draft.
Keep editing retained the draft, and Discard changes restored the latest server name rather than the original loaded name.
The clean form subsequently adopted another refreshed server value.
Both temporary settings changes were restored, automatic email stayed off and the temporary correction was cancelled without reissue.
This verifies actual background refresh and discard behavior; it does not establish every possible pending-save response ordering.
The final real Print action created a PDF-derived print frame with the same extracted text and page count in the native accessibility tree.
The subsequent DOM snapshot timed out while that frame had focus, so native printer selection and a new print-pixel comparison remain unverified.
Final authenticated keyboard month switches and settled October/November PDF rendering passed at 390, 768 and 1440 pixels on PDF.js 5.6.205, with no horizontal page overflow.
The older stored artifacts retain their explicit incomplete-text warning; the newly issued synthetic PDF has complete accessible text.
No immutable PDF was rewritten or reconstructed from payroll facts.

The continued authenticated correction journey verified the recalculated comparison at 390, 768 and 1440 px with keyboard focus and no page overflow.
Changing one recorded working day to unpaid leave recalculated the synthetic employee's earned gross, employee ESI and net through the backend correction pipeline while the issued PDF retained its original amounts.
Escape and Close displayed the shared discard guard for a verified attendance edit.
Keep editing retained that edit, discard restored the saved attendance when reopened, and focus returned to Correct payroll.
Cancellation retained the reason in correction history and did not reissue the original document.
The final stored PDF again rendered its exact employee deduction and net with no NUL or missing-glyph markers at all three widths.
An initial page-count probe used an explicit role selector, but the viewer uses a semantic section with an implicit region role.
The corrected probe counts the observed page sections and retains the one-page, currency, text-integrity and viewport assertions.
The native date-input fill attempt left its DOM value empty and does not establish an application failure or a successful date-entry browser check.

The subsequent production webpack build passed on integrity-verified Node 20.19.5 with the pinned PDF.js 5.6.205 dependency.
The generated standalone server started on loopback without changing product authentication or email settings.
Static extraction of the exact stored/captured synthetic PDF passed on that runtime, retaining its checksum, one page, employee ESI of 60.00 and net pay of 7940.00 without NUL or employer-contribution fields.
These runtime checks do not replace authenticated browser acceptance or the separately failed full typecheck.
The Codex browser subsequently blocked fresh navigation to both the temporary production port and the existing development port.
Earlier responsive and keyboard observations remain preserved, but the final fresh-navigation acceptance remains blocked.
Temporary servers and agent-created tabs were stopped, and the viewport override was reset.

Seven additional issued PDFs from the actual backend pipeline passed static extraction on Node20.19.5 and PDF.js5.6.205.
The cases cover monthly salary, CTC, reduced attendance, joining, zero pay, an additional earning and ESIC-off payroll.
The recorded ₹10,000 CTC fixture produces gross of ₹9,685, employee ESI of ₹73 and net pay of ₹9,612 while retaining employer ESI of ₹315 in school cost evidence.
The employee PDFs contain the recorded earnings, employee deductions, net, employee identity and stable slip number without employer contribution fields or incomplete text mappings.
A long synthetic name wraps within its unbroken identifier at the same column, so its extraction assertion retains every recorded glyph in order while ignoring only line-boundary whitespace.
The initial failed probe remains recorded separately.
No stored PDF or salary fact was altered for those assertions.

The expanded backend document qualification exports eleven payroll scenarios and the original/replacement artifacts for both paid and unpaid identity corrections.
All fifteen issued PDFs passed static extraction on Node20.19.5 and PDF.js5.6.205 against the actual API evidence, including overtime, the employee-share exemption, non-coverage, leaving-month pay and configured department/designation.
The backend regression reproduced and fixed retained post-exit attendance increasing pay; see the owning backend HR testing and workflow guides for calculation details.
Every extracted document preserves complete recorded text, exact component amounts and the absence of employer contribution fields.
This is content verification of stored artifacts, not a substitute for authenticated rendering, print preparation or download checks in the Codex browser.
Fresh navigation to the existing local test page still failed with net::ERR_BLOCKED_BY_CLIENT in the next continuation, so no new browser acceptance is claimed.
The blank temporary tab was closed without changing authentication, browser security or application settings.

The final backend-issued artifact selection additionally verifies the Non-payable days label against recorded API evidence rather than presenting employment-boundary days as unpaid leave.
All fifteen issued PDFs passed that content probe on Node20.19.5 and PDF.js5.6.205.
Read-only Poppler layout inspection covered the fifteen-document contact sheet and the three-page long-name/45-earning fixture without observed clipping or overlapping content.
Those artifacts are separate from the earlier stored browser fixtures and were not substituted into their immutable history.
Final authenticated browser, native printer selection and legal-format acceptance remain outstanding.

## Settings response ordering and current runtime, 2026-10-05

The disposable API host was restarted from the rebuilt application assembly rather than the older fixture output.
Authenticated synthetic-identity reads returned both recorded PDF revisions with hashes matching the stored document metadata.
Anonymous reads returned empty local login redirects and an invalid bearer returned 401 without protected document content.
No permissions were changed, and the verification host uses process-only loopback SMTP binding with automatic email off.

The live unauthenticated settings-write probe followed a login redirect to an empty 400 response.
The proposed PARSING_ERROR was not reproduced and is not counted as a confirmed production defect.
The observed empty response previously rendered the shared fallback Something went wrong.
Its permanent settings regression now requires contextual retry guidance, the retained draft and the identical retry request.

Two authenticated settings saves using each current concurrency stamp established the valid backend ordering for a delayed earlier read.
The original synthetic values were restored after that probe, and no email was requested.
The production RTK Query endpoints and authenticated API-service path are used in a controlled HTTP component regression; the settings hooks and cache are not mocked.
That regression reproduced the first save's delayed refresh replacing the second acknowledged save.
The fix keeps the acknowledged baseline, rejects the in-flight read, retains it through a failed follow-up refresh and accepts a later successful refresh.
Both successful and failed follow-up cases pass together with the existing settings/navigation/history checks: 17 tests in five files, no failures or skips.
These HTTP and component results establish the request/cache ordering, not a fresh authenticated browser pass.

The Codex browser again rejected the original local Payslips URL with net::ERR_BLOCKED_BY_CLIENT before login.
Only the agent-created blank tab was closed; no alternate host, browser interface or security relaxation was used.
The latest production-build and full frontend validation results are recorded separately in the implementation handoff.
Gujarat wage-slip applicability remains unverified for both private unaided and government-aided schools.

The complete UI selection initially failed to import the shared close and navigation guards because their MUI icon barrel exhausted the Windows open-file limit.
Repeating without a concurrent build reproduced that failure.
Only the three used icon imports were switched to direct module paths; guard behavior, test assertions and icon rendering remain unchanged.
The same full selection then passed 69 tests across 16 files with no failures or skips.
The twelve-scenario backend matrix additionally issues an employer-share-relief document and verifies government-funded cost evidence stays outside the employee contract.
All twelve current issued artifacts pass PDF.js5.6.205 extraction on Node20.19.5, and the relief page was inspected through read-only Poppler rendering.
This does not establish a new browser or legal-format acceptance pass.

## Correction response ordering and failed-history recovery

The permanent correction request-order regression uses the production RTK Query endpoints, store, middleware and authenticated request path with controlled HTTP responses.
The correction hooks and query cache are not mocked; the session adapter and dialog/navigation shell are synthetic test boundaries.
Four orderings reproduced an earlier history response replacing a later acknowledged calculation, including arrival before and after the second write and successful or failed follow-up reads.
The failed-refresh cases also reproduced reopening an older cached calculation as actionable.
The fix retains the acknowledged calculation/review, prevents pending or failed initial reads from exposing actionable cached comparisons, and recovers through Retry.
Each write must use the current server concurrency token, and a later independent successful read must still replace a clean form and clear an obsolete review.
The final payslip-directory selection passed 53 tests in twelve files with no failures or skips on 2026-10-05, including all four response-order cases.
Scoped lint passed with no warnings.
Full typecheck still fails on the two unrelated Academic primaryText properties in assignmentForm.tsx and homeworkForm.tsx; those files remain untouched.
The separate backend PostgreSQL regression proves that the consecutive authenticated writes, delayed history body, stale-review rejection and latest-version reissue are valid API orderings.
These HTTP/component and API results do not establish a fresh authenticated browser, responsive layout or native-print pass.

## Document-status freshness and preserved drafts

The permanent document-freshness regression uses the actual RTK Query endpoints, middleware, cache, PDF-fetch hook and Redux permission checks against controlled synthetic HTTP responses.
Search, session, salary-summary and dialog/PDF presentation adapters remain explicit test boundaries; no real email or browser rendering is claimed.
Seven pre-fix cases reproduced actionable stale document metadata, lost document-detail reasons and visible protected correction content after View revocation.
The final test also checks that pending and failed metadata refreshes retain one already fetched immutable artifact URL instead of fetching its PDF again.
The stable lazy-preview adapter matches production hook identity, and the test store uses the application's existing Blob middleware settings.
An earlier unstable adapter caused unrelated test timeouts; those attempts are retained separately from the one-case artifact-refetch reproduction.
Payment, replacement, correction and resend actions are disabled until current document status is known, and Retry preserves the draft.
A replaced source stays visible with its unsaved reason and a blocked write rather than silently adopting a new revision.
Removing View hides an already open protected dialog, while removing Add disables an already open resend.
The document-action regression also rejects implicit form submission when its source status is unavailable.
An HTTP 403 scope-denial reproduction confirmed that previously loaded content and Download remained available despite lost access.
The regression now requires that protected content disappear, its artifact URL be revoked and pending Retry remain blocked until the selected document read succeeds.
This security failure is distinct from a network failure, which preserves the immutable artifact.
A further controlled HTTP reproduction denied the deliveries refresh while the older document query still retained its successful request ID.
It reproduced visible cached recipient/requester facts, an open correction and an enabled artifact action after the denied read.
The screen now records denial request identities per employee/period, stops protected queries and revokes the artifact until a new successful document request revalidates access.
Recovery retains the preceding history denial through failed metadata retries and ignores only that acknowledged older history result after the fresh authorized document read.
Resubscribing also refreshes delivery history instead of relying on its failed warm cache.
Three permanent cases cover first-observed history denial, interrupted selections with failed retries, and an ordinary 503 history outage that retains the authorized artifact while blocking duplicate sends.
They use forced endpoint refreshes through actual RTK Query, not a mocked query result or an assertion that the five-second timer itself fired.
The final full selection passed 79 tests in fifteen files with no failures or skips; the seventeen cases in this document-freshness file are included in that total.
Backend permission and employee-scope enforcement remain unchanged and have their separately recorded API/direct-service evidence.
The final executed counts, lint, typecheck, security and build results are recorded in the implementation handoff rather than inferred from these component assertions.
Fresh authenticated, responsive, keyboard and native-print acceptance remains separate and must run in the Codex in-app browser.

## Real-query employee-history selection

The document-freshness fixture also supplies two issued synthetic employees with distinct recorded recipients through the actual documents and deliveries endpoints.
It retains the first employee's history in the Redux cache while delaying the second employee's HTTP response.
Both late-success and late-failure cases interrupt that request by returning to the first employee, then select each employee repeatedly.
The visible expanded history must belong to the current selection, and a late response must not overwrite the selected employee's history.
The failed second selection uses the real Retry control and must recover without displaying the first recipient or posting a delivery.
These two regressions use real RTK Query arguments, subscription changes, middleware, cached responses and controlled HTTP ordering rather than mocking the query hooks.
Search, session, salary summary and PDF/dialog presentation retain the explicit synthetic boundaries described above.
An initial substring collision between synthetic addresses and a query against a collapsed accordion were fixture failures, retained separately from the final visible-control assertions.
No production change was required for these two cases, and they do not replace the outstanding authenticated browser selection checks.

## Delivery requester visibility

Three actual RTK Query history regressions first failed because the screen omitted the requesting actor.
They now require the visible Requested by label for a resolved account, an unavailable account and an unrecorded actor without exposing a raw internal ID as the primary label.
The typed delivery response includes requestedByDisplayName, while requestedBy remains the audit identifier.
The caption stays within the existing history row and wraps long values without a separate colored surface or helper banner.
An authenticated PostgreSQL API regression separately exercises same-tenant name resolution, automatic and manual responses, idempotent retry and unavailable foreign/missing accounts.
Fresh responsive and keyboard browser acceptance remains separate from these controlled HTTP/component checks.

## Salary-summary authorization and recovery

The document-freshness fixture now runs the actual salary-summary query alongside the production document and delivery endpoints through the same RTK Query store and middleware.
Employee search, session, preview-PDF and dialog presentation remain explicit synthetic adapters.
This supersedes the earlier salary-summary adapter boundary for this test file, without claiming an authenticated browser run.

The pre-fix HTTP regression denied the summary refresh while retaining the successful document request and cached summary response.
It reproduced visible recipient/requester content and an open correction after access had been denied.
The screen now records the summary request identity with the existing per-employee/per-month denial state, hides protected content, revokes the artifact and stops delivery history until a new successful document request revalidates access.
It retains the recorded denial while an old summary error is still cached rather than clearing it prematurely.
An ordinary 503 summary failure preserves the authorized immutable PDF and does not require regeneration.

Three permanent cases cover first-observed summary denial, employee switches with failed document retries, and ordinary network-error recovery.
The existing seventeen document/history cases also run with the real summary hook.
All twenty cases passed, and the final payslip/shared-guard selection passed 82 tests in fifteen files with no failures or skips in 53.76 seconds.
The fixture verifies that the separately typed endpoint modules share the same reducer and middleware at runtime, and uses their intersected selector-state types without suppressing TypeScript errors or weakening assertions.
Scoped ESLint passed with no warnings.
The security selection passed 95 tests and failed the unchanged deployment-workflow expectation in 16.79 seconds.
The final build, full typecheck, current source hashes and remaining browser/legal acceptance are recorded separately in the implementation handoff.

## Canonical issued artifact qualification

`src/test/payslip-artifact-qualification.test.ts` reads exact stored PDFs exported by the authenticated, capture-only backend payroll matrix and document-facts correction workflows.
Its eighteen cases cover fourteen calculated scenarios and four issued original/replacement identity documents.
It uses the installed PDF.js 5.6.205 Node 20 module without a mocked renderer, replacement layout or inferred payroll calculations.
Each case verifies A4 size, recorded identity and amounts, employee-only ESI presentation, the India-local issue date, accessible text and headings matching recorded payment/statutory facts.
The off-bank case requires preserved bank details without statutory presentation, and the off case rejects empty payment/statutory panels.
Previously issued PDFs remain immutable.

Set PAYSLIP_PDF_ARTIFACT_DIRECTORY to the complete exported eighteen-artifact directory, then run `node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run src/test/payslip-artifact-qualification.test.ts --pool=forks --maxWorkers=1` on Node 20.
The directory must contain each expected PDF and recorded API response JSON; missing fixtures fail qualification.
Without that environment variable the suite is unconfigured and skipped, so an ordinary test run does not prove artifact qualification.
Acceptance requires eighteen passing configured cases with zero skips.
These checks complement the [backend HR tests](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/modules/hr/testing.md) and do not establish browser rendering, native printing or Gujarat legal applicability.

The original accepted Gujarati profile reproduced incomplete conjuncts and reordered vowel marks in stored PDF text.
The approved generator now records logical spans with exact page/content associations and keeps each span on one page.
The reader uses those recorded values without guessing missing facts or deduplicating independently repeated fields by equal text.
The immutable two-page synthetic fixture proves reader behavior with separate spans, not a replacement spanning pages or authenticated issuance.
Meaningful negative cases reject conflicting, unrelated and figure tags and retain uncovered NUL as an error.
A separate real continued-span probe remains negative evidence for the unsupported spanning form.
Canvas rendering and print preparation consume the same stored bytes; document rendering errors keep Print disabled and offer Retry.

Record exact current test/build results, checksums and failed attempts in the implementation handoff.
The two unchanged Academic primaryText errors remain outside this task, and the unchanged build configuration's skipped type validation does not override that typecheck failure.
The Vite configuration warning remains visible.
The earlier Codex in-app browser attempt failed before app/login with ERR_BLOCKED_BY_CLIENT.
After the execution reset, the same approved route instead failed with ERR_CONNECTION_REFUSED while the local test services were stopped.
Both errors remain historical failed attempts, not evidence that the final UI passed or that the original client block is still present.
Automatic approval review subsequently rejected both environment-loading and normal Next.js start commands for localhost:3041, leaving current authenticated browser acceptance blocked pending an approved running test service.
No alternate interface, host or security bypass is used to retry the rejected service start.
The isolated Node 20 accessControlSubmit retry still failed before executing any cases with EMFILE while importing the existing MUI icon barrel.
The earlier three-case Node 24 pass remains supporting evidence; it does not turn that Node 20 loader failure into a pass.

## Controlled employee account email

`src/screens/hr/employee/employee-account-email-action.test.tsx` uses the actual shared dialog, Formik form and discard guard with typed API mocks.
Its nine cases cover the two required permissions, initial failure/retry, explicit reason and verification, clean refresh, dirty refresh, same-key failed-save retry and stale-token reload.
Read and write access-denial cases hide protected values until access is revalidated.
Cancel, close and Escape follow Keep editing/Discard behavior, pending saves block dismissal, successful saves close directly, and native dialog focus returns to its opening control.
This component evidence does not prove actual RTK/browser ordering or responsive authenticated navigation.

Run the employee account-email test together with the payslip directory, payroll salary-card test, shared unsaved-navigation test and shared-dialog test on Node 20 with the Windows single-fork workaround.
`src/screens/hr/employee/employee-account-email-transport.test.tsx` additionally uses the actual RTK Query hooks, reducer, middleware and fetch parser with an MSW transport boundary.
It models a committed account change before a lost response or unreadable HTTP 200 JSON, with and without a subsequent real-query refresh.
All four pre-fix cases reproduced misleading no-change feedback or a raw parsing exception.
They require truthful confirmation/readability feedback, preserved dirty address/reason/verification and the original payload/key/concurrency token, followed by a duplicate-free acknowledgement.
The corresponding PostgreSQL account regression verifies a real committed write followed by a dropped HTTP acknowledgement and same-key replay, as described in the [backend HR testing guide](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/modules/hr/testing.md).
The typed component test separately covers `TIMEOUT_ERROR`; the current base query does not configure a timeout, so that case is not claimed as a demonstrated network path.
These transport/component checks do not establish final authenticated Codex browser acceptance.
The combined UI/security selection passed 112 cases and failed one unchanged deployment-workflow expectation on 2026-10-06.
Ninety-one of those passing cases cover the employee/payslip/payroll/shared-dialog workflows; the remaining twenty-one are permission/security checks.
Scoped ESLint and the production build passed on the earlier snapshot, while full typecheck retained the two unrelated Academic primaryText failures.
Final frozen-source results, actual browser blockers and source hashes are recorded in the handoff.
The final Node 20 selection passed 93 employee/payslip/navigation cases and 18 additional payroll/shared-dialog cases, all with zero skips.
The final configured stored-artifact selection also passed all eighteen PDF.js 5.6.205 cases with zero skips.
Scoped lint, production webpack build and both HR documentation validators passed.
The final typecheck first exhausted its default compiler heap, then completed with an 8 GiB heap and exactly the same two unrelated Academic primaryText errors.
Responsive, keyboard, correction/settlement, account-recipient repair and native-print browser checks remain unexecuted on this final source.
Use the current runtime status and exact failed command recorded in the handoff rather than treating an older browser error as the current blocker.

## Payslip action transport recovery

`src/screens/hr/payroll/salarySlip-generate/payslip-action-transport.test.tsx` uses the actual Formik forms, MUI/shared dialogs, RTK Query reducers, middleware and typed endpoints.
MSW intercepts HTTP with synthetic fetch failures, unreadable JSON and an actionable backend rejection; session, router and discard navigation remain explicit test adapters.
The first run reproduced four visible raw fetch/parser diagnostics in payment, document replacement, correction and settlement preparation.
The regression retains those message expectations after the fix and additionally checks explicit settlement retry and preservation of the backend blocking explanation.
Failed requests preserve the reason, payment reference, date, selected target and existing request identity, without closing the dialog or adding money fields.
The message does not assume that losing the response means the server did not commit the request.
These six integration cases prove the tested UI-to-transport behavior; they do not replace authenticated browser, scope, native print or real server concurrency acceptance.
Run the file with the existing Node 20 single-fork Windows workaround and retain the initial four-case failure alongside the final configured result.

## Current-main payroll money integration

The correction comparison regression reproduces authoritative INR 9,428.45 being displayed as INR 9,429 after the Finance formatter began rounding displays to whole rupees.
The scoped payroll formatter preserves paise in correction evidence, salary-detail components and Run Payroll without changing Finance display rules, calculated amounts or issued PDFs.
Run `payslip-correction-dialog.test.tsx`, `src/utils/payroll-currency.test.ts` and `src/utils/money-formatting.test.ts` together.
The original failing comparison expectation remains unchanged; all 28 selected cases passed on Node 20 after the fix.
These checks used the existing installed Vite 8.3.2 toolchain, while the current-main lock requires Vite 8.3.3.
A clean locked installation is still required separately; the offline installation failure and exact missing archive remain preserved.
The approved localhost:3041 runtime reached synthetic sign-in on the reconciled source, but Codex navigation to the protected payslip route returned `ERR_BLOCKED_BY_CLIENT`.
Final authenticated responsive, keyboard, printing and full-workflow acceptance remain unproved by this check.

## Send acknowledgment and selection recovery

`payslip-send-recovery.test.tsx` exercises the actual RTK Query reducers, middleware and endpoints through controlled MSW transports.
It reproduces a lost send response followed by an acknowledged history read, independent unconfirmed requests across interrupted employee selections, and a technical network error.
It also rejects inaccurate queued messages for failed, uncertain or already accepted attempts and retains the retry identity after empty or mismatched acknowledgments.
The nine assertions passed after the fix; the original six-case failure and subsequent three-response failure remain preserved.
The complete current-main payroll selection then passed 145 cases across 25 files with zero failures or skips using the supporting installed toolchain.
The single payslip icon now uses its supported typed subpath, avoiding the reproduced Windows icon-catalogue file limit without changing rendering or expectations.
These client-to-transport checks are separate from authenticated Codex browser acceptance and server persistence/concurrency evidence.

The send test's unsupported Testing Library `exact` option was removed without changing its string-name matching or assertions.
The nine-case file passed again, and a fresh full typecheck then reported only the two unchanged Admissions test errors at lines 178 and 195.
Those unrelated tests are not altered, excluded or reported as a passing full typecheck.
Scoped lint passed across all changed frontend source and tests.
The final Node 20 production build passed with the repository's supported Webpack option and TLS verification enabled.
An initial default Turbopack build rejected the existing dependency junction outside the isolated checkout; that failure remains preserved separately.
The successful build still uses the supporting installed dependencies and does not establish a clean install of the current-main lockfile.
The normal server runs only on approved localhost:3041 and retains the existing standalone-start warning without a configuration or deployment edit.
The refreshed approved login shell remains blank, so final authenticated responsive, keyboard, focus, repeated-selection, correction and native-print checks remain outstanding.

## Exact current-main dependency verification

The integrity-matched Vite 8.3.3 archive was recovered from the existing local npm cache without a network request.
A clean `npm ci --offline --ignore-scripts --no-audit --no-fund` installed the exact final lock on Node 20.19.5.
Installed package versions match that lock, including Next 16.3.5, Vitest 4.1.11 and PDF.js 5.6.205.
The original dependency junction and incoming unrelated lockfile remain preserved.
The normal Turbopack production build now passes with physical dependencies, without the earlier Webpack fallback.
Its skipped type validation does not change the separate full typecheck failure for the two untouched Admissions tests.
The emitted PDF.js worker is a bundled build asset, not an external CDN or an untracked runtime asset.

The explicit final selection passes 151 cases across 28 files with zero skips on the locked tree.
It includes the actual RTK Query/MSW ordering tests, controlled account email, shared navigation, salary-basis, payroll-summary and correction/settlement coverage.
The eighteen configured stored-artifact qualifications also pass on PDF.js 5.6.205.
Test fixtures await Formik updates and wrap direct focus in React `act` while retaining their draft, permission, retry and focus assertions.
The ESI navigation fixture records whether the real document capture guard prevented each allowed click before cancelling Happy DOM's native navigation.
It additionally requires no application navigation, avoiding an unintended port 3000 request without masking guard behavior or suppressing diagnostics.
The final run has no React `act` or connection-refused diagnostics; the existing Vite configuration warning remains visible.

The fresh protected-route Codex navigation still returns `ERR_BLOCKED_BY_CLIENT`, and the retained approved login shell has no visible form.
The locked build and test passes do not establish final authenticated responsive, keyboard, correction, selection or native-print acceptance.
The current authenticated capture-only API delivery now passes with the same stored PDF checksum, as recorded in the [backend HR tests](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/modules/hr/testing.md).
Final browser Send/Resend controls and current Gujarat applicability for both supported school categories remain separate acceptance checks.

## Settings acknowledgement recovery

`payslip-settings-transport.test.tsx` uses the real RTK Query settings hooks, reducers, middleware and response parser with an MSW response boundary.
Four cases persist the requested settings before dropping the response or returning unreadable successful JSON, including an actual background refresh while the form remains dirty.
The pre-fix run reproduced misleading save-failure feedback and raw parsing diagnostics in all four cases.
The settings form reuses the existing action-error handler to report an unconfirmed request or unreadable response without claiming the write did not happen.
The regressions require preserved name/address, the same payload, original concurrency stamp and idempotency key, and one fixture commit across retry acknowledgement.
Typed component coverage additionally exercises TIMEOUT_ERROR; the current base query configures no timeout, so actual timeout reachability is not claimed.
The corresponding authenticated PostgreSQL test consumes the real committed response before throwing a transport exception, then verifies an authenticated read and same-key acknowledgement without another configuration change.
These client and API checks remain separate from final authenticated Codex browser acceptance.

The final physical exact-lock install also passes with lifecycle scripts enabled through `npm ci --offline --no-audit --no-fund --ignore-scripts=false` on Node20.19.5 and normal certificate validation.
The normal prepare script runs, preserving the original incoming lock and the reconciled lock.
The prior ignored-lifecycle installation and supporting-toolchain failures remain historical evidence rather than proof of this stronger install gate.

## Current-main completion verification on 7 October

This section supersedes the earlier pending browser, dependency and typecheck statuses above, without changing their historical results.
The reconciled frontend is based on main `3abb69a8c3af0ee4fc7daf22eaa459da554b835c`.
Normal npm tooling repaired two missing transitive lock entries, `fast-uri` 3.1.7 and `json-schema-traverse` 1.0.0, without changing existing package versions or incoming metadata.
The subsequent exact `npm ci --prefer-offline --no-audit --no-fund` passed with lifecycle scripts enabled and normal TLS validation on Node 20.19.5.
The installed toolchain includes Vite 8.3.3 and bundled PDF.js 5.6.205.

The final focused payslip, account-email, currency, ESIC navigation and upstream shared-component selection passed 151 cases across 24 files with zero failures or skips.
Full TypeScript, nine-file scoped lint and the production Webpack build passed on this source.
The 12-file security selection passed 92 cases and failed the unchanged deployment-workflow wiring assertion.
That failure remains explicit; no deployment file, expectation, source mock or skip was changed.
The supported temporary dependency optimizer avoids the independently reproduced Windows icon-catalogue file limit while preserving assertions.

Authenticated Codex verification uses the final production build `zXHmu38lvSuOON9Oqhlru` on approved `http://localhost:3041` and the capture-only disposable API on `http://localhost:5100`.
The canonical November revision 3 renders at 390, 768 and 1440 px without outer horizontal overflow, retains exact INR 10,526.55 and matching paise wording, and exposes no NUL characters in accessible text.
Keyboard scrolling remains inside the zoomed PDF viewer.
Repeated employee and period selection suppresses the previous employee's document and recipient while the new selection is unavailable, and returns the matching issued artifact after loading.
Earlier authenticated interrupted-selection, settings save/refresh/discard/navigation, correction, settlement, focus, download, capture-only send/resend and canonical print-preparation evidence remains separately recorded in the acceptance ledger.
Native printer selection and physical output are unrun; provider acceptance is not inbox receipt.

The user deferred DOC-15 legal-format applicability for this iteration on 7 October.
Applicability for both private unaided and government-aided Gujarat schools remains unverified, with no legal certification or change to statutory, permission, scope, freshness or immutable-document guards.
Independent review and publication remain outside the writer's completion handoff.

## Staff payroll profile checks

Run `src/screens/hr/employee/payroll-profile.test.tsx` and `src/screens/hr/employee/payroll-profile-policy-editor.test.tsx` alongside the employee policy override and default-policy assignment tests.
Cover missing/current/scheduled compensation, recurring lines, fixed salary return routes, policy lookup failures, exact action guards, changed-group requests, retained failed edits, impact confirmation, and return to organization policies.
Authenticated browser acceptance must cover desktop, tablet, mobile, keyboard access, drawer dismissal, and salary return navigation.
Live profile writes require the matching backend profile-details endpoint; frontend preview alone does not establish save acceptance.

Inline payroll tests live in `src/screens/hr/employee/payroll-edit-details.test.tsx` and `src/screens/hr/employee/employee-form.payroll.test.tsx`.
Run them with the profile, policy drawer, default-policy, and shared unsaved-navigation tests.
Verify Save versus Save & Next, unchanged continuation, group-only requests, failed-save retention, validation focus, draft preservation on refetch, and salary edit-return links.

## Recurring salary editor acceptance

Run the structure screen and salary-editor-prefetch tests for parallel loading, employee switching, deep links, and permission-gated preloading.
Verify the staff payroll salary link and return link do not reload the document, and that hover/focus followed by opening the editor reuses requests.

Run SalaryStructureBuilder, salary-editor-screen, and salary-editor-navigation tests for calculation freshness, failed-save retention, unchanged-save prevention, activation, and unsaved navigation.

Check both Staff Directory and Payroll Structure entry points at desktop, tablet, and mobile widths.
Verify sticky footer access, keyboard history expansion, draft retention, and return to staff edit.
Assert compensation requests contain no temporary component collections and monthly payroll restrictions remain unchanged.

Run `e2e/hr/employee/employee-salary-structure.spec.ts` for page entry, draft preservation, ESIC drawer focus, legacy redirects, and return navigation.
The salary editor tests cover denied access, unavailable staff reads, persistent footer actions, guarded navigation, and validated return destinations.
They also cover formatted decimal and large amounts with unchanged numeric payloads, inline amount errors, missing-reason focus, and calculation/save feedback through the history refresh.
Verify the compact employee/ESIC header, readable history months, full-month summary amounts, and footer wrapping in the authenticated browser at desktop and narrow widths.

## Enrollment and salary document coverage

Run statutory-profile-editor.test.tsx for dirty refreshes, concurrency, retry keys, boundary choice and atomic salary-save responses.
Run salary-documents-workspace.test.tsx for cancellation, stale responses, retained filters, mandatory columns, duplicate exports and expired downloads.
The same suite verifies accessible report notes, standard PDF/Excel status chips, deduplicated completion toasts, ready downloads, status refresh and download-error recovery without replacing preview results.
Run SalaryStructureBuilder.test.tsx, esi-configuration-form.test.ts, payslip-settings-form.test.tsx and runPayroll.test.tsx for integration regressions.
Run focused ESLint, TypeScript, HR docs validation and security regressions.
Use an authenticated local backend for the final Codex-browser smoke at 390, 768 and 1440 pixel widths.
Inspect application-rendered monthly PDFs, inclusive statements, missing months and register totals with anonymized data.

## Operational dashboard decision cue checks

Run `operational-dashboard-state.test.ts` for selective cue colours, unavailable data, payroll guidance precedence, and singular/plural and Indian-number formatting.
Run `e2e/hr/hr-dashboard-standard-design.spec.ts` for loading geometry, selective priority cues, compact header spacing, minimal attendance, payroll messages, stale data, permissions, and keyboard behaviour.
Verify attendance has one chart series, no buttons, compact daily status counts, and an accessible seven-day trend list.
Check Needs review stays separate from status totals and the date input survives URL reload.
Cover no saved payroll records, pending reviews, fully locked records, reviewed-but-unlocked records, missing sections, and large counts.
Verify light/dark themes, reduced motion, desktop card edge alignment, mobile stacking, and absence of document-level horizontal overflow.
Assert standard inline breadcrumbs and the absence of card workflow buttons, Mark Attendance, Open Payroll, and the bottom quick-action row.
Keep view-control coverage for refresh and the date input.
Finish automated checks with a Codex in-app browser visual review of the loading and loaded components.

## Reporting workspace replacement

Run `reporting-workspace.test.tsx`, the report-table and API helper suites, typecheck, focused lint, production build, and HR documentation validation.
Run the authenticated reporting Playwright workflow and finish with the Codex in-app browser.
Verify template reuse across months, school revisions, fixed results/downloads, narrow layouts, keyboard ordering, unsaved navigation, and source permission revocation.
The backend owns canonical attendance/leave/payroll reconciliation and PostgreSQL materialization tests.

Validated locally on 19 October 2026 against frontend main `bae2e85f8`.
Focused reporting tests pass all 14 cases across three files.
TypeScript, zero-warning focused ESLint, and the production webpack build pass.
The authenticated `e2e/hr/hr-reporting-workspace.guest.spec.ts` workflow passes all four cases with normal synthetic school sign-in.
It covers a saved template reused across September and October without revision changes, keyboard column ordering, the unsaved-navigation guard, all 20 starter previews, a 390-pixel library, and daily/monthly Excel and PDF downloads.
The daily report captures 900 September staff-day rows and 930 October rows, including staff without attendance records.
The monthly register captures 30 staff rows and 44 output columns.
Export inspection verifies typed Excel dates, filters, frozen identifiers, PDF repeating headers/page numbers, and readable wide-register sections.

The broader reporting/security frontend run passes 163 of 164 cases.
The remaining deployment-workflow assertion targets a file identical to main and is an existing baseline failure.
Deployment files remain unchanged.
The final signed-in Codex browser smoke verifies the library, dedicated generator, and completed 900-row result.
All-module docs validation additionally encounters unrelated testing-document taxonomy and sibling-checkout link failures; the HR-only validators pass.

## Salary structure preview regression

The focused structure suite covers month and staff URL context, pending registration, unavailable totals, retry, salary permissions, preview freshness, draft protection and explicit template upgrades.
The overview tests also cover higher and lower CTC comparisons, paise, absent or immaterial differences, and unavailable school cost without suppressing incomplete-estimate warnings.
Verify that initial loading exposes a named busy state without monetary placeholders, and that refreshes preserve existing totals and month context until the busy feedback clears.
Run the compensation client contract tests and statutory-profile editor tests with the structure suite.
Authenticated browser acceptance covers the overview, salary edit, full-month preview, saving and returning to the same staff/month context at 390x844, 768x1024 and 1440x900.
Backend-owned payroll review, lock and immutable payslip checks are documented in the backend HR testing guide.
The real local API regression in `e2e/hr/payroll-salary-structure.guest.spec.ts` exercises both light and dark themes with a disposable seeded employee.
It checks preview/save parity, return context, registration follow-up, responsive contribution rows, horizontal containment, and non-overlapping editor header, body and footer at 390, 768 and 1440 pixel widths.
It also opens salary history and verifies month-change confirmation, draft retention on cancel, and the selected month's profile and concurrency version on the next preview.
Verify that the monthly-payroll handoff preserves the working salary month and that identifier warnings permit reviewed rows to lock while missing attendance still blocks them.
The visual reference is the [Minimal UI invoice editor](https://minimals.cc/dashboard/invoice/e99f09a7-dd88-49d5-b1c8-1daf80c2d7b2/edit), adapted through the project's existing card theme, compact controls and inline HR breadcrumbs.

## HR table redesign validation

Run shared table tests, `use-hr-table-export.test.tsx`, reporting workspace tests and salary documents tests.
Run TypeScript, focused ESLint, production build, `docs:hr:check` and executable security regressions.
Run `e2e/hr/hr-reporting-workspace.guest.spec.ts` and the HR table consistency browser cases.
Verify complete multi-page exports, source query snapshots, cancellation, retries, unknown totals and inaccessible result downloads.
The backend PostgreSQL suite checks more than 25,000 records, immutable downloads, typed dates and retention.
Finish with signed-in Codex in-app browser review and inspection of fresh Excel/PDF outputs.

## HR navigation performance validation

Run `e2e/hr/hr-navigation-performance.guest.spec.ts` with the `chromium-guest` project.
The suite uses controlled API fixtures in the real authenticated shell.
A delayed design catalogue must not block the template library or report history.
History and captured results must not request library or catalogue data.
Generation must still load its template, field metadata and options.
Repeat HR-to-Reports navigation must preserve working navigation and dashboard refresh.
These checks isolate client dependencies; use a signed-in local or staging API session to measure database and network latency.

## HR table redesign execution, 19 October 2026

The feature branches include frontend main b4b689d9b and backend main 6f6a98d0.
The focused frontend run passes 156 tests across 23 files, covering shared table controls, complete export callbacks, captured reporting, payroll, policy drawers and the integrated salary summary.
Two test files that render shared icon controls now isolate decorative icon requests; their focused rerun passes all three cases without network teardown errors.
TypeScript, zero-warning focused ESLint, the production webpack build and HR documentation validation pass.
The signed-in Playwright workflow passes all six cases.
Its visual matrix covers seven active HR pages at 390, 768 and 1440 pixels in both themes, after loading finishes and onboarding is dismissed.
It also verifies template reuse, all accessible starters, keyboard ordering, navigation protection, daily/monthly captured downloads, and complete staff directory Excel plus filtered PDF exports.
The directory export contains all 33 authorized fixture staff across pages and excludes action controls.
Fresh files were reopened to inspect date types, filters, frozen columns, readable PDF sections, date presentation, repeating headers and page numbering.
Final signed-in Codex in-app browser review verifies the shared menu, full-screen table, Escape close and restored keyboard focus.

Frontend security checks pass 16 of 17 cases.
The remaining deployment-workflow assertion targets a workflow unchanged from main.
The unchanged PDF text artifact test is not counted as passing because this local environment lacks the optional native canvas support required by PDF.js and reports DOMMatrix unavailable.
Backend validation and confirmed main-branch baseline failures are recorded in backend HR testing and PR 709.
Generated browser state, screenshots, downloaded files and logs remain ignored.
Neither pull request has been merged or deployed.

## Staff profile dashboard regression coverage

`employee-dashboard.test.tsx` covers explicit staff and self-service requests, stale employee data, background refresh, retry, honest zero/unavailable values, and empty versus populated trends.
`employee-dashboard-utils.test.ts` covers leave entitlement explanations, calendar range bounds, date formatting, and leave-only chart data.
Run `npx playwright test e2e/hr/employee/employee-profile-dashboard.spec.ts --project=chromium --workers=1` against an authenticated test environment.
Set `E2E_EMPLOYEE_ID` to an accessible staff record when the seeded DDVS administrator record is unavailable.
The browser cases use the real application shell and authentication, with deterministic responses only for the employee dashboard endpoint.
They cover 350, 390, 768, 1024, 1440, and 2235 pixel widths, calendar keyboard details and month limits, request deduplication, empty/populated trends, failed-request retry, dark theme, and reduced motion.
Use `employee-profile.spec.ts` to verify tab navigation, deep links, browser history, and long profile details.

## Named ESIC policies and salary preview

Run the focused `esi-policy-api.test.ts`, `esi-policy-fields.test.tsx`, `salary-template-editor.test.tsx`, `salary-template-form.test.ts`, `salary-template-policy-help.test.tsx`, `salary-template-api.test.ts` and `SalaryStructureBuilder.test.tsx` suites.
Check effective boundaries and gaps, archived selection, external reasons, load/retry, template copy, stale previews, save/reopen payloads and navigation guards.
Run typecheck, changed-file lint, docs validation and a fresh production build.
Use authenticated Codex browser checks for policy create/version/archive, salary preview refresh/save/reopen, keyboard operation and narrow-width containment.

## Reporting navigation acceptance

Run reporting-workspace.test.tsx and reporting-navigation.test.tsx for template management, published-only selection, URL state, permission combinations, and route-specific reads.
Run the HR menu and navigation-path tests for mutually exclusive Reports/Templates selection, including nested pages.
Run the shared table controlled-state tests when changing pagination callbacks.
Use e2e/hr/hr-reporting-workspace.guest.spec.ts against the local acceptance frontend and API for saved-template reuse, generation, exports, responsive layouts, and history.
Finish with a signed-in Codex in-app browser check of Reports, Templates, both generation steps, and a captured result.

### Reporting table tools acceptance

Run `report-table-query.test.ts`, the shared table controlled-state tests and `use-hr-table-export.test.tsx`.
Verify numeric, date, boolean and enum filters, sort direction, column visibility, reload and browser Back/Forward.
Check complete filtered Excel/PDF exports against rows on later pages.
Repeat on desktop and mobile, then finish in the signed-in Codex browser.

## Leave Center card layout

Run `leave-center-overview.test.tsx`, `leave-request.utils.test.ts`, and `leave-status.utils.test.ts` for loading, allocation, per-type pending days, fractional/negative balances, unlimited entitlement, read-error retry, and balance details.
The existing `hr-leave-policy-leave-center.spec.ts` checks the leave-type regions and expands Balance details before checking accrued days.
Verify My Balance has no tables and My Requests has one request/history table at 390, 768, and 1440 pixels in both themes.
Check keyboard expansion, history after an empty allocation, applied dates, request actions, table-owned scrolling, and self-service tab visibility.
Synthetic browser responses verify frontend rendering and navigation; authenticated deployment acceptance remains a separate check.

The polished card layout uses shared section headers/help, semantic status labels, finite usage bars and MUI accordion disclosures.
Verify the tab-row Apply Leave action opens the existing request dialog once, preserves close behavior, and does not reopen after browser Back or a later tab visit.
Verify the embedded calendar has a Back to Requests action in the same tab action row.

## Minimal ESIC school settings

Run `esi-statutory-settings.test.tsx`, `esi-configuration-form.test.ts`, and `earning-esi-treatment-dialog.test.tsx`.
Cover automatic statutory bases, removed rate inputs, optional registration details, help disclosure, per-component classification, scheduled school settings, restricted editing, stale versions and retry idempotency.
Browser checks should verify the compact school settings and Earning Component treatment action at desktop and narrow widths.

## Validation recovery checks

Run `hr-failure.test.ts`, `hr-recovery-middleware.test.ts`, `hr-recovery-provider.test.tsx`, `SalaryStructureBuilder.test.tsx`, `salary-editor-screen.test.tsx`, `leave-request.utils.test.ts` and `use-unsaved-navigation.test.tsx`. Run scoped ESLint, `npm run ts`, both docs validators and an isolated production build.

For Run Payroll recovery, run `src/screens/hr/payroll/run-payroll` and `src/screens/hr/recovery` with `hr-recovery-middleware.test.ts`, using one Vitest worker. The hook cases cover FAILED jobs, safe polling/result-query reasons, unsafe diagnostics, forbidden/unconfirmed errors, known-code setup and explicit retries. Screen cases cover consistent toast/alert reasons, denied setup access and retained adjustment name/amount/reason while the selected staff setup link opens in a new tab. Setup contract tests deny each missing ancestor/action and unresolved permissions. Browser acceptance must additionally exercise the actual new tab and return without submitting real staff data.

The isolated harness uses production recovery components and actual RTK mutation lifecycle actions with synthetic responses, no authentication and no backend writes:

```sh
node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vite/bin/vite.js --config tests/browser/hr-recovery-fixture/vite.config.mjs --configLoader runner
```

Open `http://127.0.0.1:4196/hr/employee` in the desktop Codex in-app browser. Enter a synthetic note, submit prerequisite/field/network/forbidden failures, inspect the persistent summary, open setup in the separate tab, return and refresh, exercise refresh failure/retry and discard/keep-editing, then confirm successful save clears old feedback. Check keyboard focus and narrow layouts. The harness proves the shared recovery contract; it does not prove authenticated salary/finalize or every HR route. See [the route/form coverage matrix and lifecycle limits](references/validation-recovery.md).

## HR table capability re-audit

Run `node scripts/hr/check-ui-consistency.mjs` for route/table ownership and `--capabilities` for the per-instance operation matrix.
The [coverage reference](references/hr-table-coverage.md#25-october-capability-re-audit) separates supported local controls, real server integrations, backend dependencies and specialized editable grids.

Run shared-table tests plus `HRPolicySharedUI.table.test.tsx`, `leave-balance.filters.test.tsx`, salary-template settings, performance and policy regression suites after table metadata/data-processing changes.
Use `node node_modules/@playwright/test/cli.js test --config tests/browser/hr-table-workspace.config.ts` for an isolated fixture of actual shared table, policy adapter and editable calendar/payroll grids at 390, 768 and 1440 pixels.
It checks filtered Excel data and excluded Actions, numeric criteria, sorting, theme changes, loading/empty/error/retry and draft editing without backend writes.
Run the existing numeric-menu fixture separately with `--config tests/browser/hr-table-filter.config.ts`.
Finish with Codex in-app browser inspection of the local fixture; signed-in tenant/backend acceptance must be reported separately.

The endpoint follow-up also checks `server-column-filters.test.ts`, shift and leave API contract tests, and manual-attendance `table-filters.test.tsx`. The latter verifies group/department page reset, identical export predicates, and scope/export locks while a draft is dirty.
The browser fixture uses the actual complete-export hook with local synthetic paged readers; it verifies status zero, filtered totals, a 15-row filtered workbook from a 10-row page, synchronized name search and clearing; unit regressions also cover scalar replacement.

### Paired operational-query regressions

Run `use-hr-table-query.test.tsx`, complete-export, controlled-table, professional-tax request and the existing screen suites. The screen tests retain their owning-reader mocks and explicitly mock the new query dependency; transport behavior has dedicated assertions for salary, ESI and the shared adapter. The expanded workspace browser fixture mounts the actual operational hook and table with a 260-row synthetic transport, checking global order, fractional numeric predicates, unlimited ordering, 38 matching export rows from a 10-row page, page reset, actions exclusion, responsive containment and loading/empty/error/retry states.

The document API regression uses valid whole-MB configuration sizes: its existing list DTO casts stored sizes to integers. The initial direct-repository fractional fixture therefore produced six matches for >18 rather than twelve. Correcting the fixture to whole sizes preserves the twelve-match expectation, the match beyond the first source page and cross-tenant exclusion; it does not lower the assertion. Backend numeric regressions separately exercise fractional amounts/days.

The 26 October combined HR/shared-table run passed 1,125 tests before the academic-only main refresh. On refreshed main `0f5293a486bb2fd4dbd805c10994effb02b22906`, all 168 manager/keyboard/salary/recovery regressions passed; independent full TypeScript, scoped ESLint and the isolated Next.js 16.3.5 production webpack build passed. The frontend/server field catalogs match for all 30 declared sources. The all-module docs validator reports exactly the same 160 issues as an archive of main; HR docs and the 61-route/74-table inventory check pass. No assertion was removed or lowered to obtain these results.

All nine responsive browser scenarios passed again on refreshed main at 390, 768 and 1440 pixels, including complete filtered Excel contents, typed global order/count/page reset, loading/empty/error/retry, light/dark themes and the editable calendar/payroll exceptions. The new fixture assertions use MUI's actual en-dash pagination text and filtered-empty copy; its unlimited renderer uses the raw row because the shared renderer substitutes a dash for null cell values.

Table criteria change matching row counts and response order; canonical payroll/statutory domain summaries keep their selected business scope. Salary displayed-row totals follow the matching page. Authenticated role/tenant browser acceptance and an actual setup-tab/return cycle on the paired backend remain unverified. Earlier internal-browser URL/cleanup denials were not retried. The synthetic Playwright workflow verifies shared production components with local synthetic transports and does not establish authenticated acceptance.

### Import draft, active retry and offset regressions

`import-detail-draft.test.tsx` mounts the production review component and checks active-criteria row identity, status/time edits, background replacement protection, open-editor cancel, pending-save controls/exit, successful save followed by a global query, failed-save retention and explicit keep-editing/discard. `use-attendance-import-row-draft.test.tsx` additionally checks competing editor context and partial-save acknowledgement of submitted rows only. The workspace browser suite has twelve responsive scenarios: three added cases use the production draft controller and table/query components, pause a synthetic save in flight, and verify edited values returned by the subsequent sorted/search request. The salary workspace test verifies Retry and Refresh use the failed operational query, preserving both filters and sorting instead of reloading the legacy base preview.

The backend offset test has a separate disposable tenant with 130 rows, keeping the existing 125-row export fixture and its assertions unchanged. It checks that `offset=1,size=5` returns the same native rows 1–5 with empty and active criteria, and that a 500-row request crosses the source reader's 100-row pages correctly.

The final correction run passed all 1,133 combined HR/shared tests, including the 18 focused correction cases, and all twelve responsive browser scenarios. Independent full TypeScript, scoped ESLint, the isolated Next.js 16.3.5 production build, HR docs/inventory and whitespace checks passed. All-module documentation still reports the identical 160 baseline issues. The new post-save filter case verifies rows/count are reconciled without losing unsubmitted pending drafts; its operational mock retains the real hook's refetch contract. No source permission, assertion, compiler check or filter capability was weakened.

### Column capability follow-up

Run `node scripts/hr/check-column-capabilities.mjs --json` for the complete route/table/column contract, and `node --test scripts/hr/column-capabilities.test.mjs` for enumeration regressions. This complements the route/import inventory: wrapper presence alone does not establish functionality. See the [active column matrix](references/hr-column-capabilities.md) for all data fields, dynamic schemas and exceptions.

The directory screen regression enumerates Name/Role/DOB/Gender/DOJ/Email/Mobile/Group/Shift/Organization/Status, date/choice metadata and the Actions exception. The shared header test requires a visible neutral sort affordance. The responsive synthetic browser contract clicks every directory data-column sort ascending/descending, combines Group false with Upcoming status, and inspects the filtered workbook and excluded Actions. It also finds an off-page I-card identifier while retaining selected IDs across filters/pages; preserves Register adjustment/save context; checks matching Register exception export; and exercises actual salary component amounts and readable/redacted audit values.

Backend operational regressions preserve owning-reader scope/permissions, numeric/boolean enum codes, readable labels, name sorting plus visible identifier predicates, positive Register exception categories, arbitrary offsets and query/export parity. The older export assertion that included a zero missing-punch category and omitted visible locked count was corrected to the actual positive labels; new locked-only/absent-only/clear tests prevent that mismatch. The fixture now explicitly carries the real DTO's hasExceptions flag.

The 500,000-row bounded-capture limit remains a fail-closed safety cap, not a performance guarantee. The current synthetic in-process measurements were 10,000 rows: 100 reader calls, 288 ms and 50.5 MB allocated; 25,000 rows: 250 calls, 544 ms and 120.4 MB allocated. Each response had 10 rows; export reused the capture. These timings exclude a production database/network and do not establish production latency. Changed totals, incomplete pages and over-cap populations fail rather than return partial global results.

Fresh final validation results and unresolved review limits must be recorded at handoff; older completion counts above are historical evidence, not proof for this follow-up. Authenticated/in-app tenant acceptance remains distinct from the permitted synthetic Playwright checks. The canonical import-status and displayed secondary-text projection regressions cover the same labels as the frontend while retaining primary name/date order and existing reader permissions.

The column follow-up passed independent full TypeScript, scoped ESLint, an isolated Next.js 16.3.5 production build, four column-enumeration regressions and all 24 responsive scenarios at 390/768/1440 pixels. The enumeration includes performance template/cycle UI aliases, their global query/export semantics and exact allowed field sets, plus the query-only I-card export restriction. The expanded backend review run passed 82/83 API/query/export cases and 48/48 application regressions, including off-page imported staff codes and rejection of generic I-card export creation/legacy download after staff leaves scope. Its sole professional-tax permitted-reader HTTP 500 also fails on exact clean main cc4af601 (4/5 comparison cases passed), with identical resolved package versions and unchanged assertions. All-module frontend docs have the identical 161 findings as clean f2708973; backend HR docs have the same three baseline issues as clean cc4af601. HR frontend docs/inventory pass. The final combined-suite result and exact review heads are recorded in [FE #1443](https://github.com/gyanmirai/Shikshamitra-FE/pull/1443), paired with [BE #743](https://github.com/gyanmirai/Shikshamitra-BE/pull/743), which must precede the frontend. Browser cases use pointer interactions; keyboard acceptance relies on the existing shared/HR unit regressions and is not a new authenticated browser claim. Local combined merge-tree checks with notice head 5558007f and breadcrumb head 21ba172e are conflict-free; combined authenticated runtime acceptance remains unverified.
