---
module: finance
domain: testing
content_type: Troubleshooting
status: canonical
updated_on: 2026-10-28
owner: frontend-team
audience: humans-and-agents
---

# Validate Finance frontend changes

## Bank account activity checks

`BankAccManagement/index.loading.test.tsx` uses the real RTK Query client and
shared table to check initial request completion, the request timeout contract,
error/Retry recovery and waiting for academic context without a false empty list.
It also checks that academic-year hydration and opening/closing activity never
call route navigation, while preserving the activity selection in the URL.

Run `bankAccountActivityApi.test.ts`, `BankAccountActivityDrawer.test.tsx` and
`BankAccountTable.test.tsx` in their owning BankAccountManage/BankAccManagement
folders, plus `accounts/bankAccountEntryContext.test.ts`,
`Registers/AccountsRegisterTable.test.tsx`, `Registers/ManualEntryForm.test.tsx`,
`CashManagement/CashManagement.test.tsx` and `CashManagement/CashBulkDepositDialog.test.tsx`.
Verify exactly two drawer tabs, independent credit/debit criteria, server-enforced
direction, direction-scoped export queries, current bank/year
data, permission denial, error states, safe return URLs, bank prefill, cash
semantics and historical source navigation. Run `npm run ts` and focused ESLint.

Serve `e2e/fixtures/bank-account-activity/vite.config.mts` on port 4194 and use
the Codex in-app browser for the production bank screen/drawer and existing
entry flows with synthetic APIs. Check 390x844, 768x1024, 1440x900 and short
desktop layouts, both themes, keyboard/focus, both tabs, date/filter
controls, source details, source/entry return and contained table scrolling.
`readonly` removes write capabilities and `fixtureError` simulates an activity
request failure. This fixture verifies UI behavior; backend persistence and
PostgreSQL query correctness require the backend suites.

Concession update regression: run `ConcessionRequestForm.test.tsx`, `ConcessionPolicyFields.test.tsx`
and `concessionValueValidation.test.ts` in `src/screens/finance/Concession/Components/`,
`ReadOnlyConcessionApprovalView.test.tsx` and `ReadOnlyConcessionApprovalView.benefit.test.tsx`
in `src/screens/finance/ConcessionAdmin/`, `src/redux/finance/ConcessionManagement/concessionManagementApi.benefit.test.ts`
and `src/utils/concession-request-error.test.ts`.
Run `src/utils/api-problem-details.test.ts` separately for shared error-message compatibility.
Build and serve the [local regression fixture](../../e2e/fixtures/concession-request-update/README.md)
on port 4228 and use the in-app browser to
submit the valid synthetic fixed ₹1,000 request across ₹58,166 and ₹717 eligible fees.
Check the captured update uses the reviewed stamp and submit uses the update response stamp.
Exercise stale, approved, policy-version, eligibility and unknown-error scenarios; each failure
must keep the form open and show its actionable reason or fallback with a support reference.
The fixture mounts the production form with synthetic APIs; it does not verify backend persistence.
The backend HTTP update-to-submit regression establishes persisted response-stamp correctness.

Verification on 28 October 2026: 71 focused checks passed with one worker.
The core 24 cover request validation, reviewed stamps, own-request exclusion, policy/assignment
independence, eligibility refresh after raced rejections, approval blocking, support references
and real RTK Query cache refresh after Cancel, Reject and Approve.
The remaining 47 cover the shared select, policy fields, value/error handling and approval review;
that UI group used the existing `e2e/fixtures/concession-request-ui/setup.ts` component-test setup.
All 19 synthetic fixture scenarios passed in the Codex in-app browser, including the original six
error/update scenarios, active-benefit blockers, reapplication after released history, independent
year/type scope, policy switching, own pending approval and rejection of a legacy pending request.
The rejection form was also checked at a 355px panel width after making the fixture responsive.
These frontend checks do not establish backend financial persistence or replace a full-repository
TypeScript check; the latter did not complete in the resource-constrained session.

Required income choices, Payment Term names, assignment review and clone feedback: run
`FeeCategoryForm.ui.test.tsx`, `usePaymentTermForm.errors.test.tsx`,
`usePaymentTermForm.impact.test.tsx`, the three Assignment workflow/review/table tests, and
`proration-policy-error.test.ts` in their owning source folders. In the in-app browser use
`e2e/fixtures/fee-category-readonly` (also the `income=empty` query),
`e2e/fixtures/payment-term-template` with `name-conflict`,
`e2e/fixtures/fee-assignment` with `studentColumns` and `bulkSidebar`, and
`e2e/fixtures/proration-policy` with `clone=default` or `clone=blocked`.
Check None is first only in Fee Category's fee-head Income Category and Refund Policy Expense
Category, retained after blur without a required error, and excluded elsewhere (including standalone
Fee Head). Test unsorted lookup responses with ordinary categories ahead of None. Run
`FinanceRoutingFields.test.tsx` for unavailable saved Refund Policy categories and empty lookups. Check missing-category
validation, padded/repeated-space name rejection
and trimmed successful save, assigned-row exclusion and header selection, left-aligned roll
numbers, independent review collapses, adjacent policy/total cards and direct reached-step
navigation. An unchanged review must remain valid; changed input must obtain fresh evidence.
Cloning a default with an existing Copy must produce a new Draft without replacing the source
default; blocked clones must state a corrective action. Fixtures use synthetic responses;
backend tests separately establish persisted name and clone invariants.

Fee Structure setup and bulk review layout: run `feeStructureFields.test.tsx`,
`ClassAccordionPanel.test.tsx`, `FeeStructureReviewStep.test.tsx`,
`AssignmentWorkflow.test.tsx`, and `custom-stepper/index.regression.test.tsx` in their owning
source folders. Check missing Collection/Refund IDs and versions, direct/restored Review
navigation, incomplete draft saves, bordered icon actions, and schedule expansion. In the
Codex in-app browser use `e2e/fixtures/fee-structure` and
`e2e/fixtures/fee-assignment` with the `bulkSidebar` query flag. Verify Fee Head action placement, left-aligned
annual amounts, adjacent help, compact bordered warnings/schedules, and required policy
selectors without a clear option. With the 45-student fixture, scroll the fee details and
student list separately, switch/search/page students, check long names and selection,
and keep counts/totals and Back/Assign fees visible at desktop and phone widths. These
fixtures use synthetic responses and do not establish backend persistence or policy enforcement.

Bank transfer evidence: run `BankTransferTable.test.tsx`,
`FeeCollectionPreviewDialog.test.tsx` and `FinalPaymentReviewDialog.test.tsx` in their owning
Finance screen folders, plus `collectionPaymentDetails.test.ts` and `reconciliation.test.ts`.
In the local browser, collect a QA fee using Bank Transfer with a reference, transfer date,
holder and receiving bank; compare Payment Details, Payment Verification, provisional PDF,
the reconciliation row and the official PDF after approval.
Confirm the receiving bank stays masked and missing historical transfer dates stay unavailable.
Backend persistence and receipt coverage lives in `BankTransferEvidenceApi_Tests`.

Reconciliation initial loading: run `ReconciliationQuery.test.tsx` under
`src/screens/finance/Finance-reconciliation/Component`. It covers all payment tables waiting
for academic-year context, querying once available, changing year/month and pausing again
when context clears. In the browser, reload Reconciliation and switch payment tabs; verify
there is no empty academic-year request or invalid-value toast.

`ConcessionItemCard.test.tsx` covers decisions directly from saved Pending cards, independent reviewers, positive approval amounts, required documents and server action/grant checks. Browser checks retain icon-only card controls with Leave Center decision glyphs and no leading card-header icon.

Minimal concession request forms: run `ConcessionFeeHeadSelection.test.tsx`,
`ConcessionSteps/ValueEntryStep.test.tsx`, `ConcessionDocumentList.test.tsx` and
`ConcessionPolicyFields.test.tsx`. Verify common cards, independent fee inspection/selection,
server-only summary values, recalculation/empty states, and compact
installment fields retaining raw values, whole-rupee validation and policy limits. In the local
browser check create/update, required selectors and documents, fee breakdown, absence of remarks,
the existing fixed footer, narrow layouts and both themes without submitting financial changes.
For request-entered fixed amounts, serve `e2e/fixtures/concession-request-ui` and append
the `?mode=fixed` query to its browser URL.
With the synthetic ₹11,111 policy cap, enter ₹10,111 and verify Maximum concession allowed,
Entered and Remaining show ₹11,111, ₹10,111 and ₹1,000 immediately. Allocate the remaining
₹1,000 to another installment, check the maximum-reached guidance and blocked additions, then
reduce or clear an existing amount and verify allowance becomes available again. Check fee-head
deselection/reselection, percentage mode, invalid fractional rupees and the saving lock. This
fixture renders production components with synthetic data and does not establish persistence.

Copy, refund details and DD dates: run `copyFeeStructure.test.ts`,
`Components/CopyFeeStructureDialog.test.tsx`, `feeStructureWorkspace.test.ts`,
`FinancePolicyDetailsDrawer.test.tsx`, `custom-tooltip/info-tooltip-icon.test.tsx`, and
`DemandDraftTable.test.tsx` in their owning source folders. Local production-component
fixtures are `e2e/fixtures/fee-structure/copy.html?copyPolicy=current|stale|unavailable|race`,
`e2e/fixtures/refund-policy-details` (`?empty=1`, `?dark=1`), and
`e2e/fixtures/dd-reconciliation`. Check current/stale selection, named version-race recovery,
zero copies on failure, one copy on retry, unchanged source snapshots, populated/empty
settlement limits, keyboard/Escape/touch help, panel bounds, distinct DD dates and missing
values. Fixtures use synthetic data; persisted backend tests separately establish integrity.

Concession view decisions: run `ConcessionItemCard.test.tsx`, `StucentConcessionCard.test.tsx` and
`concessionDecisionEligibility.test.ts`. Cover icon-only actions, read-only request details and
full activity, view grants, unsubmitted Pending cards, exact-request review
callbacks, missing Edit/Submit/decision grants, ownership, explicit empty server actions,
independent submitted decisions, mandatory documents and final states. In the local browser,
open a student with multiple requests and confirm Review and submit opens the clicked card's
policy, values and documents without submitting or deciding it. Check two-column/stacked cards,
Policy-style student details, document preview, keyboard tooltips, light/dark themes, overflow
and modal close/focus restoration at desktop, tablet and phone sizes.

Bank-account effective dates: run `BankManageForm.dates.test.tsx` under
`src/screens/finance/settings/BankAccManagement/Components`. It exercises the real
pickers and Formik validation for incomplete/invalid entry, leap days, dependent
date ordering, same-day ranges, optional end dates, and UTC payload boundaries.
Browser checks cover Add/Edit, keyboard entry, disabled earlier end dates, inline
errors, and responsive picker display.

Charge Category deletion: run `ChargeCategory.deletion.test.tsx`, `ChargeCategory.test.tsx`,
and `src/redux/finance/chargeCategory.test.ts`. Browser checks cover the in-use dependency
warning and Review charges link, unused-category confirmation/cancel, failed preflight/retry,
busy locks, and a dependency created after preflight. Confirm that no DELETE is sent from a
blocked warning or cancellation. Backend dependency and permission cases live in
`ChargeCategoryDependencyApi_Tests` and `ChargeCategoryApiContract_Tests`.

Automatic collection allocation: run focused Vitest checks for
`collectionAllocationOrder.test.ts`, `preview/paymentAllocationUtils.test.ts`,
`FeeCollectionForm.context.test.tsx`, `CollectionLedgerTable.test.tsx`,
`useCollectionPolicyForm.test.tsx` and `CollectionPolicyDrawer.test.tsx` in their owning Finance
folders. Browser fixtures are `e2e/fixtures/collection-policy` and
`e2e/fixtures/fee-collection-late-fees` (append `?allocationBasis=Installment` or `FeeHead`).
They render production components with synthetic data and do not establish backend correctness.
Check priority selection/save, amount-only entry in both modes, funded summary and submitted amounts,
explicit-selection limits, partial/exact/excess amounts, remaining balances, Clear All, review,
stale refresh and keyboard/mobile behavior. Change Group by and display filters while an amount
is entered and confirm the allocation stays unchanged. No priority editor is expected.

## Admission and withdrawal proration result

Run `FeeProrationResult.test.tsx`, `admission-fee-collection-panel.test.tsx`, `CollectionLedgerTable.test.tsx`, `transition-batch-form.test.tsx` and `student-record-proration-cache.test.ts`, plus typecheck and focused lint. Verify saved Finance values, regular/no-policy suppression, collection-error retry/deferral, owner cache refresh and existing permission guards. Browser component acceptance uses the real shared section with synthetic Finance output at desktop and 390px mobile widths; this is separate from persisted backend/HTTP tests and is not production-site payment proof.

## Security action bundles

Finance controls are defined in `src/screens/security/role/finance-permission-groups.ts`.
They write exact catalogue keys; runtime checks continue to use exact backend action names.
Finance layouts use `ExactPermissionGuard` with their exact View action or configured module flag.
Policy pages require Policies module visibility; they do not require Fees module visibility.
Run `finance-permission-groups.test.ts`, the Security role suite and Finance action-guard tests.
Browser checks cover View-only, Add (including editing/approval), Delete-only, revoked View/direct
URL denial, saved role grants, user overrides, and restoration of test-account overrides.
Verify Charges, Collections, Adjustments, Income/Expenses, fee/account settings and all policy families.
Embedded fee details require Collection Add for Collect Fees and Auditing View for
Audit Trail; the audit drawer and adjustment audit query must also fail closed.
The posting-setup compatibility page uses an exact View guard even though posting is unavailable.
Receipts/Audit are read-only; Collections, Fee Structure Assign and Reconciliation have no Delete control. Use the authorized local
test workspace and synthetic records for writes; do not perform real payments for a permission test.
Wait for the academic-year context and the target screen to finish loading before
checking actions; Income/Expenses initially render a context-only header. Test adjustment
application in a disposable local database because the shipped workflow has no reversal.
Restore exact test-account overrides, remove disposable databases, and use supported
void/reversal/refund corrections for posted test records while retaining their audit history.

TL;DR: run docs validation for documentation changes and targeted Finance tests for client, mapper, cache, and audit changes.
Do not claim Finance behavior is validated unless the relevant tests or a stronger suite ran.

Active Fee Structure editor, typed client and browser checks: [workspace implementation](./references/fee-structure-workspace.md).

## Documentation checks

Run one of these commands after editing Finance docs.

```powershell
node scripts/docs/validate-docs.mjs --module finance
npm run docs:check
```

## Focused frontend checks

### Fee-head usage disclosure

Run `FeeCategoryForm.ui.test.tsx` to verify editing shows no inline usage warning or View usage
control while preserving the removal guard. Serve `e2e/fixtures/fee-category-readonly/` and open it
with the `?dependencies` query to check the editor in light/dark themes and narrow layouts.
Dependency warnings and their View/Hide usage controls remain in the affected action dialogs.
This fixture uses synthetic data and performs no backend writes.

### Concession status groups

Run `StudentConcessionTable.test.tsx` and `concessionTablePresentation.test.ts` under
`src/screens/finance/Concession/Components`. Check exactly Pending, Approved and Rejected in
the Status dropdown, a draft rendered as Pending, grouped server criteria including status zero,
status/tab synchronization, retained unrelated filters, and unchanged action eligibility.
The `e2e/fixtures/concession-status` browser fixture renders the production table with synthetic
responses; it does not establish backend persistence or approval behavior.

### Policy clone, names and recorded scope

Run `node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run src/screens/finance/policies --pool=threads --maxWorkers=1 --no-file-parallelism`.
The policy regressions cover normalized payload names, inline server conflicts with preserved
values, two-decimal concession precision, every Apply On label/representation and semantic
snapshot comparisons. These checks do not prove live cloning or database uniqueness.

In the Codex in-app browser, inspect Create Policy casing, Value/limit and Actions alignment,
three direct row actions, compact default control and the single Status field presentation.
Try percentage typing/paste beyond two decimals, discard/reopen, and saving locks. Inspect
Apply On before/after in both Audit Trail and Version History, including numeric legacy snapshots,
right-anchored help, full policy-name tooltips and right-aligned read-only metadata. Use the
existing `e2e/fixtures/concession-policy` fixture for isolated component checks. A rebuilt backend
and authenticated session are required to verify cloning the default proration policy after
archiving previous copies and rejecting normalized duplicate names through direct API calls.

### Concession request form presentation

For View Concession, run the focused `ConcessionAdmin/StucentConcessionCard.test.tsx` and
`ConcessionAdmin/ConcessionItemCard.test.tsx` suites. The `e2e/fixtures/concession-card` fixture
renders production cards with synthetic data. Check six student facts in one desktop row,
saved Board / Medium values, responsive wrapping, and equal-sized icon-only Edit/Delete
controls. Check the Edit accessible name and delegation without changing draft permissions.

Run `node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vitest/vitest.mjs run src/screens/finance/Concession/Components/ConcessionPolicyFields.test.tsx src/screens/finance/Concession/Components/ConcessionFeeHeadSelection.test.tsx --pool=forks --maxWorkers=1` for required searchable policy/type controls, exact policy-version selection, associated errors, disabled edits and independent fee inspection. The synthetic fixture's **Preview saving lock** control exposes the shared busy overlay and locks fields and footer actions without submitting a financial request. Verify the authenticated form also blocks its breadcrumb/back controls during draft validation, draft saving and submission; confirm values return after a failed save.

In the Codex in-app browser, open Concession Request. Check neutral icons, keyboard-accessible heading help, compact academic fields on desktop and stacked fields on narrow screens. Select a student and verify the fee-assignment warning or the Policy & Fees workspace as applicable. Inspect each fee without changing checkbox selection or request totals; check its installment breakdown, original/paid/eligible amounts, and server concession. Verify document reminders name the missing evidence, request-entered values remain editable, and the right panel stacks below the form at narrow container widths. Confirm the body scrolls while the unchanged Cancel, Save draft, and permitted submit action remain reachable, with no horizontal page overflow. Presentation checks do not prove financial persistence or approval behavior.

Run `node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vitest/vitest.mjs run --config e2e/fixtures/concession-request-ui/vitest.config.mts` for decimal/empty numeric entry, percentage limits, the fixed request cap across installments, read-only policy values, stable review metrics, server preview before approval, preserved approval metadata, changed-balance blocking and error retry.

Run `node node_modules/vite/bin/vite.js --config e2e/fixtures/concession-request-ui/vite.config.mts` and open `http://127.0.0.1:4211/` in the Codex in-app browser for the actual value editor, impact summary and approval components with synthetic balances. Check percentage, fixed and policy-controlled modes at 390×844, 768×1024 and 1440×900; verify aligned original/paid/eligible values, no page overflow, persistent labels, and the approval footer. The fixture simulates preview responses and never writes backend financial records. The authenticated request form, document upload, permissions and persisted approval still require the real application session.

### Read-only detail presentation

Run the existing `FinancePolicyDetailsDrawer`, `ViewFeeDetails`, Accounts register,
ConcessionAdmin and ChargesManagement tests when changing the shared detail components.
Check the Income/Expenses transaction dialog, concession and charge views, Collections
details, receipt preview and post-collection receipts in the Codex in-app browser.
Verify three-column facts on wide cards, stacked facts on narrow cards, wrapping
names/notes, full-width tables, and reachable Close/Done actions while scrolling.
Retain loading, unavailable, error/Retry and current status/amount treatments.

### Concessions and Collections tables

Run `npm run test -- src/screens/finance/Concession/Components/StudentConcessionTable.test.tsx src/screens/finance/FeeCollection/Components/FeeCollectionTable.query.test.tsx` for query-state, status, paging and maker/checker controls.
Retain the existing Collections status, balance and academic-filter regression tests under `src/screens/finance/FeeCollection/Components/FeeCollectionTable*.test.tsx`.
In the Codex in-app browser, inspect both routes with their context filters, open text/numeric/date/status filter menus, combine filters, clear them, change concession tabs, and check fullscreen and sticky right columns.
Verify failure/Retry and no-results treatments, keyboard actions, and absence of document-level horizontal overflow.
Use a backend rebuilt with the new list-query inputs when validating actual filtered results across pages.

### Accounts settings regression

Run `node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run src/screens/finance/settings/account-settings-forms.test.ts src/screens/finance/settings/components/account-setting-save-error.test.ts src/screens/finance/settings/components/category-tags.test.ts src/screens/finance/settings/components/AccountSettingVersionDialog.test.tsx src/screens/finance/settings/components/account-setting-history-formatters.test.ts src/components/customizabaleTable/indic-pdf-export.test.ts src/components/customizabaleTable/table-export.test.tsx src/redux/finance/bankAccountOptionLabel.test.ts src/redux/finance/financeRoutingApi.bankAccounts.test.ts --pool=threads --maxWorkers=1 --testTimeout=30000`.
Run `node scripts/qa/render-account-settings-pdf.cjs` and compare rendered and extracted Hindi/Gujarati content, including multi-page output.
Run `node --max-old-space-size=8192 node_modules/typescript/bin/tsc -p e2e/fixtures/account-settings-qa/tsconfig.json` for the three settings screens and their imports, including the app's theme augmentations. This scoped check is independent of the full repository type check.
For the final in-app browser check, start `node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vite/bin/vite.js --config e2e/fixtures/account-settings-qa/vite.config.mts` and open `http://127.0.0.1:4186/`.
The fixture uses the real Income Category, Expense Category and Bank Accounts screens with synthetic local API hooks; it does not prove live persistence or authorization.
Verify numbers/Unicode in names, displayed maximum errors, saved masked UPI output, record-specific status switch labels, mobile names at 390px, named bank deletion confirmation, duplicate field errors, and Unicode PDF downloads.
Backend audit persistence and masking are covered by the [backend testing guide](../../../Shikshamitra-BE/docs/modules/finance/testing.md).

Use these commands as the first validation set.

| Risk area                                        | Command                                                                                                                                                                                                                                                                      |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Charge inbox, validation and collection refresh  | `npm run test -- src/screens/finance/ChargesManagement src/redux/feeCollection/feeCollection.charges.test.ts`                                                                                                                                                                |
| Finance audit client contract                    | `npm run test -- src/redux/finance/audit/financeAuditApi.contract.test.ts`                                                                                                                                                                                                   |
| Finance audit UI utilities                       | `npm run test -- src/screens/finance/AuditTrail`                                                                                                                                                                                                                             |
| Concession document constraints                  | `npm run test -- src/screens/finance/Concession/Components/concessionDocumentUpload.test.ts`                                                                                                                                                                                 |
| Concession request types and UI                  | `npm run ts` plus focused ESLint on `src/screens/finance/Concession`, `src/screens/finance/ConcessionAdmin`, and `src/redux/finance/ConcessionManagement`                                                                                                                    |
| TypeScript impact                                | `npm run ts`                                                                                                                                                                                                                                                                 |
| Collections class/division filters               | `npm run test -- src/screens/finance/hooks/useFinanceAcademicFilters.test.tsx src/screens/finance/FeeCollection/Components/FeeCollectionTable.filters.test.tsx`                                                                                                              |
| Ledger status, charge filters and counts         | `npm run test -- src/screens/finance/FeeCollection/FeeCollectionComponent/FeeCollectionForm.charges.test.tsx src/screens/finance/FeeCollection/FeeCollectionComponent/feeLedgerStatus.test.ts`                                                                               |
| Selection ownership and academic-year boundaries | `npm run test -- src/screens/finance/FeeCollection/FeeCollectionComponent/feeLedgerSelection.test.ts src/screens/finance/FeeCollection/FeeCollectionComponent/FeeCollectionForm.charges.test.tsx`                                                                            |
| Receiving-bank display labels                    | `npm run test -- src/redux/finance/bankAccountOptionLabel.test.ts src/redux/finance/financeRoutingApi.bankAccounts.test.ts`                                                                                                                                                  |
| Policy default controls and lifecycle            | `npm run test -- src/screens/finance/policies/components/DefaultPolicyToggle.test.tsx src/screens/finance/policies/components/PolicyDefaultLifecycle.test.tsx`                                                                                                               |
| Fee Structure default lookups                    | `npm run test -- src/screens/finance/settings/FeeStructure/hooks/useFeeStructureLookups.test.tsx src/screens/finance/settings/FeeStructure/feeStructureModel.test.ts`                                                                                                        |
| Collections additional charges                   | `npm run test -- src/redux/feeCollection/feeCollection.charges.test.ts src/screens/finance/FeeCollection/Components/FeeCollectionTable.charges.test.tsx src/screens/finance/FeeCollection/FeeCollectionComponent/FeeCollectionForm.charges.test.tsx`                         |
| Payment Term date entry                          | `npm run test -- src/components/custom-date-range-picker/custom-date-range-picker.test.tsx src/screens/finance/settings/PaymentTerm/Components/sections/InstallmentSection.test.tsx src/screens/finance/settings/PaymentTerm/Components/PaymentTermValidationSchema.test.ts` |

## Add coverage when needed

Collect Fees UI regressions are included in `FeeCollectionForm.charges.test.tsx`: visible
student context, grouped fee selection, grouping changes with an edited payment amount, table
sorting without selection loss, and row View breakdown access. Automatic ledger-selection regressions
cover both policy priorities, partial allocation, increasing/decreasing/clearing the amount, display
filters/grouping, and switching to manual selection without restricting automatic candidates. Run the collection selection/status suites in
the command table above. The `e2e/fixtures/fee-collection-late-fees` fixture renders the actual
form against synthetic RTK Query responses. Finish in the in-app browser at 390, 768 and
1440 px: exercise fee-group expansion and selection, Filters and month grouping, filtered hidden selections,
fee/charge details and waiver access, partial collection, Cash/non-cash fields, receiving-bank
validation, both review dialogs and generated receipts. Confirm the table owns horizontal
scrolling and the document does not overflow. This fixture does not verify live backend writes.

For repeatable browser coverage, build that fixture using its README and run
`node node_modules/@playwright/test/cli.js test --config e2e/finance/fee-collection-ui.config.ts`.
The suite exercises every filter option, both groupings, selection ownership, balance refresh,
Clear All and keyboard actions, all seven payment methods through the visible dropdown,
validation, review and request payloads. Selected-item rows are always visible in the payment
body. Pointer and keyboard reorder tests verify fee allocation order, charge ordering through
review/submission, and trailing remove actions. Fees continue to allocate before charges.
It also checks independent payment scrolling and stationary summary/actions at all three
viewports in light and dark themes. Reports are written under `.artifacts/fee-collection-ui`.
Mock responses cover frontend receipts; backend settlement/reconciliation and PDF output remain
separate integration checks.

For the Finance drawer and navigation regressions, run these focused suites serially on memory-constrained Windows hosts:

```powershell
node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run src/components/nav-section/vertical/nav-list.test.tsx src/components/nav-section/path-utils.test.ts --pool=threads --maxWorkers=1
node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run src/screens/finance/settings/PaymentTerm/Components/PaymentTermValidationSchema.test.ts src/screens/finance/settings/PaymentTerm/Components/sections/InstallmentSection.test.tsx src/screens/finance/settings/PaymentTerm/Components/FormFooter.test.tsx --pool=threads --maxWorkers=1
node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run src/screens/finance/policies/hooks/useRefundPolicyForm.test.tsx src/screens/finance/policies/components/FinancePolicyDetailsDrawer.test.tsx src/screens/finance/policies/workspaces/PolicyArchiveWorkspaces.test.tsx --pool=threads --maxWorkers=1
```

Finish in the in-app browser: collapse Fees and Settings on Fee Category and confirm the active item remains visible; check Refund Policy Create/Edit/View loading and retry states; enter invalid invoice dates, excessive offsets, and incomplete allocations in Payment Terms and confirm inline errors, checklist failures, and disabled Submit. No policy mutation is needed for this smoke check.

For the unified Payment Term template workflow, run `node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vite/bin/vite.js --config e2e/fixtures/payment-term-template/vite.config.mts` on Windows and open `http://127.0.0.1:4185/` in the in-app browser.
This fixture renders the real drawer with synthetic API data and supports Create, Edit, and a copied draft; it does not prove live backend integration or introduce a production Duplicate action.
Check conditional Days Before Due, zero-gap and excessive-offset blocking, per-installment specific dates, complete preview dates, replacement warning, atomic rule/row application, Cancel preservation, and disabled Submit for invalid manual dates.

Proration form validation and event interactions are covered by
`src/screens/finance/policies/hooks/useProrationPolicyForm.test.ts` and
`src/screens/finance/policies/components/proration/ProrationFeeHeadsSection.test.tsx`.
They check independent event controls, admission preset scope, disabled-event validation,
numeric boundaries, shared rounding, payload compatibility, checklist consistency,
collapsed error rows, and invalid-submit focus.
Use `e2e/fixtures/proration-policy` in the in-app browser for desktop/mobile create and edit
checks. Its create/update API is an in-memory fixture; it never writes financial records.

Run `node node_modules/@playwright/test/cli.js test --config e2e/finance/configuration-section-scroll.config.ts` for Fee Head Configuration and Payment Term Installment Schedule scrolling regressions. Verify short and long lists, first/last-item access, stable section controls and footer positions during internal scrolling, retained expansion, and new-installment focus. The fixtures render production drawers with synthetic responses; these checks do not establish backend persistence or authorization.

Receipt visibility and collection cache refresh are covered by
`npm run test -- src/screens/finance/InvoiceAndReceipt/Components/ReceiptManagement/index.test.tsx`.
The suite checks All months on entry, January/December API values, clearing the month,
pagination reset, academic-year changes, and an already loaded list after collection.
Finish in the in-app browser on `/finance/invoice-receipt`: verify existing receipts
appear under All months, select a month, and return to All months.

Add or update tests when a change affects these areas.

| Change                                    | Expected coverage                                                                                                                                                                           |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Charge request payload                    | Client or mapper test                                                                                                                                                                       |
| Optimistic cache update                   | Client cache test                                                                                                                                                                           |
| Approval, rejection, or reversal behavior | Preview/confirm screen or client mutation test                                                                                                                                              |
| Concession decisions from Pending list    | Different checker with exact grant sees direct actions; requester cannot decide; approval preview and confirmation, reason-required rejection, backend denial, and list/tab count refresh   |
| Late-fee waiver queue and decisions       | Type check, exact permission visibility, Pending/Applied/Rejected tabs, reason-required rejection, maker-checker API denial, student-scope isolation, and collection refresh after approval |
| Audit Trail mapping                       | Mapper test                                                                                                                                                                                 |
| Route-level behavior                      | Playwright test before release sign-off                                                                                                                                                     |

Charge release evidence must cover the selected academic year in every query/cache key, exact action permissions plus server `availableActions`, explicit AllInScope versus selected-student audience, preview/stale/idempotent command behavior, server paging, collection refresh, and absence of placeholder correction actions. The complete matrix is in [Charge Management frontend flow](./references/charge-management-frontend-flow.md).

## Collections additional charges

For the additional-charge regression, verify server charge totals in the grid, fresh fee-plus-charge **Overall Outstanding**, empty late-fee allocations on fee-only collection, and unpaid charges remaining selectable after the parent installment is paid.
The cache tests cover subscribed grid, collection ledger, and details refresh after payment and waiver.
On Windows, run each focused test file separately with `node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run <test-path> --pool=threads` if worker startup times out during a combined run.
Finish UI verification with the Codex in-app browser: collect principal alone, reopen collection, select **All Charges**, then confirm charge payment and waiver update the grid and outstanding balance.

## Policy defaults and ledger browser checks

For selection regressions, open the existing `fee-collection-late-fees` fixture and
choose **Selection regression** before opening Diya's collection dialog.
The June–May academic year has June–October tuition and Quarter 1 transport paid.
Verify one click selects 10 installments for All Pending, five unpaid charges for
All Charges, two installments for First 6 Month, and eight for Last 6 Month.
Verify overlapping filters, independent unticking, manual row edits, clearing all,
both grouping views, and display filters preserve consistent selected counts and totals.
Choose Cheque and inspect the receiving-bank options: malformed `SBI - null` and
`AXIS - undefined` labels must render only their bank names; masked and named account
labels must remain usable in both the dropdown and its selected value.
Verify bank-only labels use supplied masked/account-holder metadata while preserving
the chosen account ID. Use **Refresh selection balances** while presets are checked:
paid rows must leave checkout, partial rows must use their current amount, and independent
unticking must still preserve selections owned by other presets or manual ticks.
This fixture supplies synthetic API responses through the actual client/components;
it does not verify deployed student data or post backend payments.
Also verify a collector with academic-year dates and no Fee Structure settings
access can use both six-month controls, and shortened/extended academic years use
their actual first and last six calendar months.

Use the in-app browser with the isolated fixtures under `e2e/fixtures/fee-structure` and
`e2e/fixtures/fee-collection-late-fees`; each uses a separate dependency cache.
Verify default Collection, Proration and Refund selections on a new structure, a manual
replacement, saved nondefault version pins, and an intentionally empty saved Refund selection.
In collection, compare All, Pending, Paid, Overdue, Partial Pending and In Reconciliation in both
grouping views, including charge-only results, zero matches, source month/head filters, matching
entry counts, and preserved selections while changing filters.
These fixtures use synthetic responses and make no backend financial writes; backend due-date,
default uniqueness and state-transition rules require their independent regression suites.

## Student fee assignment

The active assignment drawer, typed client, permissions, retries and verification fixture are documented in [Student fee assignment](./references/student-fee-assignment.md).

## Charge lifecycle regression checks

For charge creation, cover stable division/student selections during refetch and mode changes,
failed and out-of-order student responses, combined quick filters, filtered Select All, the
`Finance.Fees.Charges.Add` permission, required-field validation, unsaved Cancel/back confirmation,
and a successful Pending charge. The `e2e/fixtures/charge-create` fixture uses synthetic data;
it does not create backend charges.

For Payment Terms, verify the all-version Used In breakdown, inline default replacement impact,
Cancel without writes, and Confirm before saving in Create, Edit, and Duplicate. Existing fee
structure version assignments must remain unchanged. The focused hook regression is
`usePaymentTermForm.impact.test.tsx`; the browser fixture is `e2e/fixtures/payment-term-impact`.

For archived Fee Categories, verify mapped fee-head status controls are disabled with the restore
tooltip and direct API status changes are rejected. For Fee Structure Policies, clear Collection
Policy and verify its inline error blocks Next and direct Review navigation while draft saving
and an empty Refund Policy remain allowed.

Run `npm run test -- src/screens/finance/ChargesManagement src/redux/feeCollection/feeCollection.charges.test.ts` for four-tab counts, server status parameters, pending-only decision actions, field validation and charge cache refresh after collection/waiver. In the in-app browser, open `/finance/charge-management`, switch each tab, inspect detail balances and approval status, and verify the server status after final settlement and reversal. Browser checks are unverified when the browser connection cannot be established.

## Income, expense, and bank routing

The implemented selectors, retired Account Heads route, lookup permissions, cache updates, and rollout checks are documented in [Income, expense, and bank routing](./references/income-expense-routing.md).

## Variable fee assignment checks

Collection policy bounds and discard regressions use the actual components in
`e2e/fixtures/collection-policy` with synthetic lookups and no backend writes.
Check long typing and paste, scientific notation, day/rate/amount boundaries and
decimal precision for each calculation type. Check first-day gaps, overlaps,
reversed ranges and cutoff violations, including a single invalid slab. Confirm
invalid fields block submission and preview; compound growth must remain readable
without silently truncating the calculated fee. Confirm Create/Edit/Duplicate
discard sessions reopen with defaults or saved source values. The retained summary
component can be tested separately via the fixture's simulation toggle.

See [variable fee assignment](./references/variable-fee-assignment.md) for focused suites and the current workflow acceptance checks.

## Income and Expenses workspaces

See [the workspace contract](./references/income-expense-workspaces.md) for separate registers, academic-year months, selected-record details, manual creation and automatic refund visibility.

Focused Accounts regressions: `node node_modules/vitest/vitest.mjs run --config e2e/fixtures/accounts-register/vitest.config.mts`.

Full-page entry-form regressions (cash/non-cash, exact decimal payloads, draft protection, locked saving and idempotent failure retry): `node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run src/screens/finance/accounts/Registers --pool=threads --maxWorkers=1 --testTimeout=30000`.
The config isolates pure date/money tests from unrelated global browser setup.
For the real-component smoke test, run `node node_modules/vite/bin/vite.js --config e2e/fixtures/accounts-register/vite.config.mts` and open `http://127.0.0.1:4209/` in the Codex in-app browser.
The fixture exercises both registers, View, cash/non-cash creates, year/month filtering, permission visibility, failure states and refund cache refresh using synthetic data only.

## Finance consistency and form lifecycle regressions

Refund detail drawer regression: run `node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vitest/vitest.mjs run src/screens/finance/feeRefund/Components/RefundRemarksForm.test.tsx --pool=threads`.
In the in-app browser, open a refund row and verify the status/help header, section
help, saved amounts, timeline and settlement history, both Close controls, Escape,
focus return, and eligible approval actions. Check narrow screens for local
installment scrolling and a visible footer; check loading and Retry on read failure.

Focused regressions cover the three-direct-action threshold, disabled assignment-dependent
collection actions, protected confirmation dialogs, in-app discard and unload cleanup,
Fee Category Edit-to-Add reset, normalized/archived duplicate guidance, Payment Term code
conflicts, and Apply On numeric/name equivalence in both audit renderers. Key suites include
`src/hooks/use-finance-form-close.test.tsx`, `src/components/customDialog/close-guard.test.tsx`,
`src/screens/finance/settings/FeeCategory/FeeCategory.lifecycle.test.tsx`, and
`src/screens/finance/settings/PaymentTerm/hooks/usePaymentTermForm.errors.test.tsx`.

Browser smoke checks use the real components with synthetic responses. Verify blank Add after
closing Edit; Keep editing and Discard; archived-name guidance; Status ascending/descending;
three direct actions; unassigned Collect Fees/Adjustment tooltips; archive-reason retention on
backdrop and Escape; footer alignment; Payment Term grids and allocation validation; and policy
percentage precision and audit labels. The Payment Term fixture is
`e2e/fixtures/payment-term-template`; policy checks use `e2e/fixtures/concession-policy`.
These checks do not authenticate to a deployed tenant or perform financial writes. Follow with
a signed-in API-backed smoke test in the target academic year before deployment acceptance.

Backend suites independently cover current/archived copy names, default-source cloning,
repeated clone-code uniqueness, normalized names, and Status ordering before pagination.
Existing historical duplicate records are preserved; no reconciliation migration is included.


## Finance list and request regressions

Finance list creation actions belong below domain filters, beside the status tabs where present.
Check Adjustments, Concessions, Refunds, Charges, Income and Expenses at 390×844, 768×1024 and
1440×900. Actions use the requested labels New Adjustment, Concession Request, Fee Refund,
Add Charge, Add Income and Add Expense; table search, Columns and Export stay in the table toolbar.

Run the date-range picker and Payment Term InstallmentSection suites after date-entry changes.
An equivalent controlled date tuple recreated by Formik must preserve the calendar draft.
Check typed, partial, invalid and calendar ranges in create and edit; Apply requires both valid
ordered endpoints. Cancel retains committed dates. Date-only payloads must round-trip without
timezone conversion. The real-component browser harness is `e2e/fixtures/payment-term-template`.

Refund request regressions cover repeatable bulk Apply, every selected amount being required,
blocked confirmation for incomplete selections, and complete requests reaching confirmation.
Use `e2e/finance/refund-request-validation.config.ts` for desktop/mobile automated checks and
`e2e/fixtures/refund-request-validation` for the final in-app browser smoke. Synthetic harnesses
do not prove persistence against a deployed tenant.

### Local verification evidence (24 October 2026)

The signed-in local application was checked in the Codex in-app browser across all six list
pages. On the GSEB In Process Charges list, Uniform charge showed six assigned, two paid and
four outstanding; the detailed student amounts matched, and Cancel Charge was disabled.
Uncollected charges retained Cancel Charge with a required-reason dialog. Payment-status
sorting, column hide/restore and the downloaded Excel values were verified. The narrow-screen
action row wrapped below the tabs without overlapping the search toolbar.

Real-component browser fixtures covered refund Apply twice, incomplete selected installments,
valid confirmation, mobile/tablet refund detail layout, concession decimal validation and the
valid fixed-amount ceiling, plus typed and calendar Payment Term ranges in create and edit.
Fixture responses are synthetic and do not perform tenant financial writes. The backend
Payment Term create/edit round-trip test independently verifies persisted date endpoints.

Focused frontend suites passed for charges, refunds, concessions, account register labels,
date ranges and unsaved-form navigation. Backend domain and HTTP API regressions passed for
charge collection counts, reversal, waiver, list/detail parity and cancellation rejection.
The full frontend TypeScript check, scoped ESLint and backend API compilation passed. Evidence images and
validation logs are retained in the wrapper workspace's `output/finance-bugfix-verification/`
and `tmp/` folders, with backend logs under its ignored `.artifacts/` directory.

## Cash Management checks

The 28 October year-wide cash flow supersedes the approval/source-selection scenarios below.
Run CashManagement, CashBulkDepositDialog, CashDetails, cashManagementApi, ManualEntryForm,
manualEntrySchema and cashExpenseSource suites. Acceptance: display-filter changes never change
academic-year summary/deposit totals; one deposit covers every available source beyond pagination;
cash expenses have no receipt/reference input and reduce the pooled balance; supporting evidence
is optional, validated, saved and downloadable. Check required bank, insufficient cash, stale balance,
exact uncertain retries, permissions, busy/dirty-close states and legacy transit separately.

Local verification for the 28 October flow passed 58 distinct frontend tests across the cash
workspace/dialog/detail/API and expense form/schema suites. A combined run passed 55 tests but
one worker failed to start under machine load; the three affected tests passed on the focused
retry, alongside eight deposit-dialog tests. Full `npm run ts`, focused TypeScript and typed ESLint checks passed,
and the synthetic cash fixture production bundle compiled. The required in-app browser smoke
remains unverified: the browser bridge reported that the in-app browser was unavailable.
The backend separately passed 21 HTTP and 12 domain checks; see its
[verification record](../../../Shikshamitra-BE/docs/modules/finance/testing.md).

The 27 October pending-cash correction supersedes the earlier approve-before-expense browser scenario below. The current focused suite passes 47 tests across ten files, including collected/expenses/remaining approval evidence, prefilled net counts of 8000 and zero, stale expense-race refresh preserving the draft while requiring the latest count, pending source balances, exact uncertain retry, manual-entry validation, cache invalidation and permission controls. Command: `node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run src/screens/finance/accounts/CashManagement src/screens/finance/accounts/cashManagementRules.test.ts src/screens/finance/accounts/Registers/ManualEntryForm.test.tsx src/screens/finance/accounts/Registers/manualEntrySchema.test.ts src/screens/finance/accounts/Registers/cashExpenseSource.test.ts src/redux/finance/cashManagementApi.test.ts src/redux/feeCollection/feeCollection.cashCache.test.ts src/screens/security/role/cash-management-permissions.test.ts --pool=threads --maxWorkers=1`. The wrapper verification log is `tmp/simple-cash-management/pending-net-fe-final-tests.log`.

Current browser acceptance uses the synthetic fixture at port 4188: start with pending receipt 10000, Add Expense 2000, verify pending cash 8000, then approve the receiving-bank deposit with prefilled count 8000. Details must retain collected 10000 and expense 2000, show deposited 8000/held zero, and omit a new deposit step. Repeat with a fully spent receipt, ordinary collector (`?collector`), administrator collector (`?collector&admin`), read-only/error states, and legacy approved-held cash (`?legacy`). Fixture state resets on reload and makes no backend writes.

The wrapper focused TypeScript project (`tmp/simple-cash-management/tsconfig.frontend.json`) and Finance documentation validation pass. Typed ESLint reports no errors across the eleven changed source/test/fixture files; its single test import-order warning was corrected. Verification logs use `tmp/simple-cash-management/pending-net-fe-*`. Full-repository TypeScript/build acceptance is not implied by these focused checks.

The administrator self-approval amendment passed 11 focused details/dialog/rules tests, focused TypeScript and typed ESLint checks. The in-app browser verified an enabled Approve Cash action for a synthetic administrator who collected the cash and opened bank selection. The UI follows server `canApprove`; ordinary collectors and users without approval permission remain blocked with explanatory help. Screenshot evidence: wrapper `output/finance-cash-management/admin-self-approval-enabled.png`.

On 27 October 2026 the focused cash, manual-entry, API-cache and permission suites passed 32 tests across nine files. Focused TypeScript and typed ESLint checks passed. The actual shared components passed an Edge browser fixture flow: approve 10000, pay expense 2000, dispatch 6000, confirm credits 5000 and 1000, leaving held cash 2000 and transit zero. Desktop/mobile, read-only permissions and error/retry states were checked. Fixture responses are synthetic; backend persistence is verified separately. The in-app browser bridge was unavailable, so its required smoke remains unverified. Full-repository TypeScript/build acceptance is not implied by these focused checks. See [Cash Management](./references/cash-management.md).

After the final category-routing and required-reference changes, the three affected form/schema suites passed 26 tests; focused TypeScript and typed lint passed again. A fresh Edge flow also checked Cash → Bank Transfer → Cash and the reference requirement. Backend HTTP acceptance passed 43 checks, including persisted deposits/credits and replay stamps; see [backend verification and release limits](../../../Shikshamitra-BE/docs/modules/finance/testing.md).

## Collection receipt grouping

Run the focused `useCollectionPolicyForm`, `CollectionPolicyDrawer`, `FeeCollectionForm.charges` and `FeeCollectionOutcomePanel` Vitest suites after changing receipt configuration or collection preview. The policy tests cover both choices, historical defaults, payloads and invalid submissions. The outcome test covers one versus two verification entries. Use the existing `e2e/fixtures/collection-policy` harness for the final in-app browser smoke: select each receipt option, inspect its accessible info, check discard/reopen, and verify the fixed footer and narrow-screen layout. Backend persistence and reversal evidence belongs to [Finance backend testing](../../../Shikshamitra-BE/docs/modules/finance/testing.md).

## Receipt lifecycle checks

Charge-only collection regression: run `feeCollection.receipt.test.ts`,
`feeCollection.charges.test.ts` and `FeeCollectionForm.context.test.tsx`. They cover the unified
PDF endpoint, cache invalidation, loading, receipt-only retry, cleared payment drafts and
summary-refresh failure without reclassifying a successful payment.
Build the collection fixture as described in
[`e2e/fixtures/fee-collection-late-fees/README.md`](../../e2e/fixtures/fee-collection-late-fees/README.md),
then run `node node_modules/@playwright/test/cli.js test --config e2e/finance/charge-receipt-preview.config.ts`.
Finish in the in-app browser with **Charge receipt regression** and **Charge receipt retry regression**:
collect ₹1,000, verify PDF preview/download, refresh to paid/zero pending, and retry a failed PDF
without a second payment POST. Synthetic browser responses verify frontend behavior; persisted
PDF generation and missing-blob recovery are covered by the backend HTTP regression.

Run the focused FinalPaymentReviewDialog.test.tsx and paymentReceiptSummary.test.ts tests, npm run ts, and npm run docs:check.

Browser acceptance: collect cash fees and charges → Official Receipt in Receipts; Reconciliation shows six non-cash tabs with Cheque selected by default, and saved Cash-tab links fall back to Cheque. Record each non-cash method → Provisional Receipt; approve → linked Official Receipt; reject → rejected history without an official document. Check fee-only, charge-only, combined, PDF download filename, payment method, long student names and narrow screens. Old cashier confirmation flags must never finalize a new non-cash payment. Mixed non-cash instruments must fail validation. Backend behavior and test suites: [Receipt lifecycle](../../../Shikshamitra-BE/docs/modules/finance/references/receipt-lifecycle.md).

### Local verification evidence (23 October 2026)

The receipt change passed the full Next.js production build, independent TypeScript checking, and focused ESLint checking. The production build used one worker and isolated output to fit local memory; it loaded the project configuration without changing production settings. Focused Vitest checks passed: FinalPaymentReviewDialog and paymentReceiptSummary (12), ReceiptManagement (5), and reconciliation PDF transport/filename parsing (4), for 21 passing tests.

The real Collections, Receipts and Reconciliation components were exercised in the in-app browser using `e2e/fixtures/receipt-lifecycle`: cash issuance and the read-only Cash tab, UPI provisional issuance, approval with linked official history, required rejection remarks, rejected history, and receipt-type filtering. Browser state and payment identifiers are synthetic. The fixture makes no backend financial writes; persisted collection, idempotency and reversal invariants are verified separately by the HTTP API suite. See the fixture README for setup and PDF sample provenance.

Final browser PDF checks: the Provisional Receipt downloaded from Receipts with the canonical provisional filename. After approval, reconciliation displayed the linked official number and rendered/downloaded its PDF with the canonical official filename. The official download bytes matched the real API export; no browser console errors were reported. The seven non-cash tables use the typed reconciliation download endpoint, which returns the blob plus server filename. The standalone fixture bundle and focused ESLint check passed after correcting these hook imports.

The final preview implementation reuses `src/components/preview-document/pdf-preview` in collection outcomes, receipt detail and reconciliation detail. Native PDF iframes were blank in the in-app browser; the canvas viewer renders pages directly with navigation, zoom/fit width, accessible page text and retry. The final project `npm run ts` check passed with its configured 8 GiB Node heap, and the changed preview components passed focused ESLint and the standalone browser bundle build.

In-app browser visual acceptance passed for canvas-rendered provisional pages in collection outcomes and receipt detail, and the linked official page in reconciliation. Zoom/fit width was checked on the provisional viewer; one-page navigation is disabled at its bounds. Both API-exported pages were rendered independently and inspected for clipping, alignment, payment method, exact INR totals and the official predecessor reference.

The final full Next.js production build after the shared viewer change exited successfully: compilation, all seven static pages, route traces and standalone server output completed. Isolated build files are retained in the wrapper workspace `tmp/receipt-next-production-build`; generated receipt-validation TypeScript config paths were removed afterward. Validation logs and PDF/browser evidence are retained under the wrapper `tmp/` and `output/` folders.
