---
module: finance
domain: testing
content_type: Troubleshooting
status: canonical
updated_on: 2026-10-06
owner: frontend-team
audience: humans-and-agents
---

# Validate Finance frontend changes

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
| Concession decisions from Pending list    | Different checker with exact grant sees direct actions; requester cannot decide; approval preview and confirmation, reason-required rejection, backend denial, and list/tab count refresh |
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
