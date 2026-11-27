---
module: finance
domain: cash-management
content_type: Reference
status: active
updated_on: 2026-11-26
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
Date range, search and column filters affect the displayed records and activity metrics. The shared
`CustomDateRangePicker` starts with the current month when it belongs to the academic year, or the
first academic month otherwise. Saved month links remain valid. Clear date range shows all dates.
Changing Board clears Medium, and changing a display filter resets pagination. Filters, sorting,
search and page selection remain URL-backed.

The header shows Collected, Spent, Deposited and Academic-year cash available. The available amount
and Deposit cash action use the academic-year balance across all pages and display filters.
View expenses opens a paged drawer with the cash expense allocations behind Spent and carries
the current date and source filters. Monetary table values are right-aligned. The table shows
receipt/source, payer, collected, deposited, remaining cash, receiving bank and collection date,
with optional legacy transit through Columns. Row activation opens the shared details drawer.

## Deposit cash

The single Deposit cash action requires the exact `Finance.Accounts.CashManagement.Deposit`
grant and a fresh, positive year-wide balance. The dialog pre-fills the editable Deposit amount
with the available balance and permits a positive partial amount up to that balance. It requires
an active receiving school bank account and accepts optional notes and one PDF/JPG/JPEG/PNG
document up to 5 MB. Notes are limited to 1,000 characters.

Submit sends one multipart `POST /finance/cash-management/bulk-deposit` containing
`academicYearId`, `bankAccountId`, `expectedAmount`, `amount`, `idempotencyKey`, optional
`notes` and optional `file`. The server verifies the year-wide balance and deposits the requested
amount atomically.

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

Focused tests cover date-range metrics, the cash expense drawer, partial amount validation,
absence of approval controls, details, multipart transport, required bank, document types/size,
dirty cancellation, busy locks, stale balances and exact uncertain retries. Run the owning
Cash Management and Accounts register suites, TypeScript, focused lint and Finance docs validation.
The synthetic fixture in `e2e/fixtures/cash-management/` validates UI behavior without backend
writes. Real financial persistence and authorization acceptance belong to backend tests.
