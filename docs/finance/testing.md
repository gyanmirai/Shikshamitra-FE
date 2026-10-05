---
module: finance
domain: testing
content_type: Troubleshooting
status: canonical
updated_on: 2026-10-03
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

| Risk area                         | Command                                                                                                                                                   |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Charge inbox, validation and collection refresh | `npm run test -- src/screens/finance/ChargesManagement src/redux/feeCollection/feeCollection.charges.test.ts` |
| Finance audit client contract     | `npm run test -- src/redux/finance/audit/financeAuditApi.contract.test.ts`                                                                                |
| Finance audit UI utilities        | `npm run test -- src/screens/finance/AuditTrail`                                                                                                          |
| Concession document constraints   | `npm run test -- src/screens/finance/Concession/Components/concessionDocumentUpload.test.ts`                                                              |
| Concession request types and UI   | `npm run ts` plus focused ESLint on `src/screens/finance/Concession`, `src/screens/finance/ConcessionAdmin`, and `src/redux/finance/ConcessionManagement` |
| TypeScript impact                 | `npm run ts`                                                                                                                                              |
| Collections class/division filters | `npm run test -- src/screens/finance/hooks/useFinanceAcademicFilters.test.tsx src/screens/finance/FeeCollection/Components/FeeCollectionTable.filters.test.tsx` |
| Ledger status, charge filters and counts | `npm run test -- src/screens/finance/FeeCollection/FeeCollectionComponent/FeeCollectionForm.charges.test.tsx src/screens/finance/FeeCollection/FeeCollectionComponent/feeLedgerStatus.test.ts` |
| Selection ownership and academic-year boundaries | `npm run test -- src/screens/finance/FeeCollection/FeeCollectionComponent/feeLedgerSelection.test.ts src/screens/finance/FeeCollection/FeeCollectionComponent/FeeCollectionForm.charges.test.tsx` |
| Receiving-bank display labels | `npm run test -- src/redux/finance/bankAccountOptionLabel.test.ts src/redux/finance/financeRoutingApi.bankAccounts.test.ts` |
| Policy default controls and lifecycle | `npm run test -- src/screens/finance/policies/components/DefaultPolicyToggle.test.tsx src/screens/finance/policies/components/PolicyDefaultLifecycle.test.tsx` |
| Fee Structure default lookups | `npm run test -- src/screens/finance/settings/FeeStructure/hooks/useFeeStructureLookups.test.tsx src/screens/finance/settings/FeeStructure/feeStructureModel.test.ts` |
| Collections additional charges | `npm run test -- src/redux/feeCollection/feeCollection.charges.test.ts src/screens/finance/FeeCollection/Components/FeeCollectionTable.charges.test.tsx src/screens/finance/FeeCollection/FeeCollectionComponent/FeeCollectionForm.charges.test.tsx` |
| Payment Term date entry            | `npm run test -- src/components/custom-date-range-picker/custom-date-range-picker.test.tsx src/screens/finance/settings/PaymentTerm/Components/sections/InstallmentSection.test.tsx src/screens/finance/settings/PaymentTerm/Components/PaymentTermValidationSchema.test.ts` |

## Add coverage when needed

Add or update tests when a change affects these areas.

| Change                                    | Expected coverage                              |
| ----------------------------------------- | ---------------------------------------------- |
| Charge request payload                    | Client or mapper test                          |
| Optimistic cache update                   | Client cache test                              |
| Approval, rejection, or reversal behavior | Preview/confirm screen or client mutation test |
| Late-fee waiver queue and decisions        | Type check, exact permission visibility, Pending/Applied/Rejected tabs, reason-required rejection, maker-checker API denial, student-scope isolation, and collection refresh after approval |
| Audit Trail mapping                       | Mapper test                                    |
| Route-level behavior                      | Playwright test before release sign-off        |

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

Run `npm run test -- src/screens/finance/ChargesManagement src/redux/feeCollection/feeCollection.charges.test.ts` for four-tab counts, server status parameters, pending-only decision actions, field validation and charge cache refresh after collection/waiver. In the in-app browser, open `/finance/charge-management`, switch each tab, inspect detail balances and approval status, and verify the server status after final settlement and reversal. Browser checks are unverified when the browser connection cannot be established.

## Income, expense, and bank routing

The implemented selectors, retired Account Heads route, lookup permissions, cache updates, and rollout checks are documented in [Income, expense, and bank routing](./references/income-expense-routing.md).


## Variable fee assignment checks

See [variable fee assignment](./references/variable-fee-assignment.md) for focused suites and the current workflow acceptance checks.
