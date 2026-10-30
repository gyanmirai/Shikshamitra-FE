---
module: finance
domain: cash-management
content_type: Reference
status: active
updated_on: 2026-10-30
owner: frontend-team
audience: humans-and-agents
---

# Cash Management workspace

Finance / Accounts / Cash Management at `/finance/accounts/cash-management` requires
`Finance.Accounts.CashManagement.View`. The screen is owned by
`src/screens/finance/accounts/CashManagement/`; its RTK Query client is
`src/redux/finance/cashManagementApi.ts`.

## Academic-year cash and display filters

The globally selected academic year owns the available cash balance. Board, dependent Medium,
Month, search and column filters affect the displayed records only. Month options come from the
selected year's actual start/end dates, using the shared Accounts register helper; the current
month is selected when it belongs to that year, otherwise the first academic month is selected.
All months is available. Changing Board clears Medium; changing a display filter resets pagination.
Filters, sorting, search and page selection remain URL-backed. Retired approval-status criteria in
saved URLs are ignored.

The compact Board, Medium and Month dropdowns share one card with the left-aligned Collected,
Spent, Deposited and Academic-year cash available metrics and the Deposit cash action. The action
aligns with the dropdowns on wide screens and wraps below them on smaller screens. Metrics use
the server's year-wide summary. Monetary table values remain right-aligned. The available amount
and deposit action are independent of the visible page and every display filter. The table retains
receipt/source, payer, collected, spent,
deposited, remaining cash, receiving bank and collection date, with optional legacy transit through
Columns. It has no Status or Actions column. Row activation opens the shared details drawer.

## Deposit cash

The single Deposit cash action requires the exact `Finance.Accounts.CashManagement.Deposit`
grant and a fresh, positive year-wide balance. Its shared `CustomDialog` shows the total as a
read-only value, requires an active receiving school bank account, and accepts optional notes and
one PDF/JPG/JPEG/PNG document up to 5 MB. Notes are limited to 1,000 characters.

Submit sends one multipart `POST /finance/cash-management/bulk-deposit` containing
`academicYearId`, `bankAccountId`, `expectedAmount`, `idempotencyKey`, optional `notes` and
optional `file`. It sends no table filters or page selection. The server recalculates the available
amount and deposits all eligible academic-year cash atomically. No manual approval is involved.

The form uses Formik/Yup, `CustomSelect`, the shared required-field wrapper, `CustomUpload`,
section cards, shared feedback and the existing dialog footer pattern. Upload selection does not
save evidence until submission. Busy state locks fields, upload actions, submission and closing.
The saved supporting document is downloadable from Cash Details through the scoped
`GET /finance/cash-management/{id}/supporting-document?academicYearId=...` client under View.
Dirty cancellation offers Keep editing / Discard changes. Failures preserve the draft; stale
balances require a refresh, while an uncertain outcome retries the original request and key.

## Expenses and evidence

Cash expenses use the academic-year cash pool automatically. Add Expense has no cash source
receipt or cash payment reference input. The server allocates cash and updates the spent/remaining
balances; cash and register queries refresh after the mutation. Non-cash payment fields retain
their existing evidence requirements. Manual cash Income remains held cash until deposited.

Cash details retain collection evidence, amounts, bank deposits, notes and expense allocations.
They have no approval action, approval status, or individual deposit button. Eligible legacy
in-transit deposits retain bank-credit confirmation under the exact Reconcile grant and server
capability; this does not introduce another step for new bulk deposits.

Business rules, authority, persistence and endpoints: [backend Cash Management contract](../../../../Shikshamitra-BE/docs/modules/finance/references/cash-management.md).

## Validation

Focused tests cover the list/display-filter versus deposit-scope distinction, academic months,
absence of approval controls, details, multipart transport, required bank, document types/size,
dirty cancellation, busy locks, stale balances and exact uncertain retries. Run the owning
Cash Management and Accounts register suites, TypeScript, focused lint and Finance docs validation.
The synthetic fixture in `e2e/fixtures/cash-management/` validates UI behavior without backend
writes. Real financial persistence and authorization acceptance belong to backend tests.
