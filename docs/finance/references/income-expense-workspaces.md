---
module: finance
domain: accounts-workspaces
content_type: Reference
status: canonical
updated_on: 2026-10-24
owner: frontend-team
audience: humans-and-agents
---

# Income and Expenses workspaces

TL;DR: Income and Expenses are separate Accounts submodules with academic-year month filtering, transaction-specific read-only details, and manual-entry creation.
This contract was written before implementation on 14 October 2026.
Backend ownership and acceptance rules are in [the backend workspace contract](../../../../Shikshamitra-BE/docs/modules/finance/references/income-expense-workspaces.md).

## Navigation and screen contract

| Surface                | Contract                                                                                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Income                 | Reuse `/finance/income-tracking`; show confirmed collections and manual income                                                                                                                                            |
| Expenses               | Reuse `/finance/expenseTracking`; show paid manual expenses, completed refunds and linked returned-payment corrections                                                                                        |
| Combined legacy routes | Redirect `/finance/income-and-expense` and `/finance/accounts/activity` to an authorized separate workspace                                                                                                               |
| Header                 | Common breadcrumb with + Income / + Expense on the right; compact Month and Category selectors in a shared surface before the full-height table                                                               |
| Month                  | All months plus calendar months intersecting the selected academic year's actual dates; include the calendar year in each label                                                                                           |
| Initial month          | Current month if inside the selected year; otherwise the first academic-year month                                                                                                                                        |
| Context change         | Year/category/month/search changes reset pagination; year changes reset dependent month/category selections                                                                                                        |
| Table                  | Shared CustomizableTable; server paging/search/column filters/sort; reference, Student (GR No.), Class/Division, separate Payer/Payee, category, masked bank, amount, Transaction Date, sticky Status and Actions |
| Row actions            | View only; no edit/delete or generic links to source lists                                                                                                                                                                |
| Export                 | Label Export current page accurately; exclude Actions                                                                                                                                                                     |

Student identity uses the same **Student (GR No.)** and **Class/Division** headings as Fee Collections. Manual counterparties belong in **Payer** (Income) or **Payee** (Expenses), with a neutral dash in student-only cells. Reference and category headings name the owning Income/Expense direction, and **Bank Account** replaces the ambiguous school-bank heading.

Each data column has a server filter: names use text operators, Status uses the direction's labelled choices, Amount uses raw numeric comparisons/ranges, and Transaction Date uses calendar-day comparisons. Filters apply before server counts and paging; changes return to page one. Counterparty sorting is unavailable rather than sorting a different value. Column filters remain visible, and View keeps its selected-record context.

Source is not shown as a selector, table/export column, or detail field. Internal transaction provenance remains available to the client for scoped detail requests. Income and expense category tags are absent from category forms, tables, version history, and transaction forms/details/exports. Editing a category preserves existing stored tags for API compatibility. Creation buttons keep their plus icons and use Income / Expense labels with action-specific accessible names.

## Record details

View loads a scoped, selected-record detail through the Accounts register client, independent of another source module's navigation permission.
Use the standard read-only dialog with the reference and status in its header, and shared section cards for transaction, student, allocation, payment and refund details.
Show reference, category breakdown, payment method/date, masked bank, reference/notes, and available source evidence.
For student collections, include the student identity, academic placement, fee/charge lines and covered periods supplied by the server.
For refunds, include the original receipt, reason, approval and payout facts.
Unavailable historical facts remain explicitly unavailable; do not guess student placement, payment references, bank accounts or categories.
Closing View preserves filters, search and pagination.

## Create flow

Use a full-page form matching Add Charge: back breadcrumb, a scrolling card containing shared Income/Expense details, Payment details and Additional notes sections, and a fixed neutral Submit/Cancel footer.
Use Formik/Yup, NumericFormatCustom with raw string money and two-decimal validation, and shared routing lookups.
Back, the register breadcrumb and Cancel use the shared discard confirmation when the form is dirty. Loading/saving locks the form and its navigation, and an overlay communicates progress.
Manual entries collect name/payer or payee, category, amount, payment date, method, non-cash school bank, optional reference and notes.
Cash clears the bank; non-cash requires an eligible account.
Cancel and Submit sit at the right of the fixed neutral footer, in that order; lock duplicate submissions and unsafe closure during saving; retain input on failure.
Successful creation invalidates the corresponding register tag and preserves list filters.
Student payments and refunds must never be recreated using these manual forms.

## Refund visibility

Approval reserves the refund amount; expense category and paying account are selected in Record Payment using policy defaults as initial values.
Approved/processing refunds remain in Refunds and do not appear in Expenses.
Recording payment completes the refund and adds the canonical Paid expense in one transaction; retries must not duplicate it. See the [refund payment workspace](./fee-refund-payout-workflow.md).
Expense status filters offer Paid and Returned; unpaid refund requests are excluded from register rows and counts.
Returned payouts retain their linked signed correction.

## Acceptance checks

Check academic years crossing calendar years, partial/extended years, All months, year switching and out-of-range rejection.
Check both manual creates, cash/non-cash requirements, decimal values, failed lookup/save and double submit.
Check View on automatic/manual/historical rows, exact permission denials and student-scope isolation.
Check that approved/processing refunds are absent, recording payment adds one Paid row, and linked returns remain Returned; verify refresh/cache invalidation and no duplicate expense.
Run focused frontend tests, type/lint checks, docs validation and a final Codex in-app browser smoke test.

Refund expenses use the recorded payment/posting date. Historical direct-detail reads remain compatible with older clients.

Verify pending receipts now uses the same academic-month option utility, with a single required month and no All months option.
Its month resets immediately when the global academic year changes.

Reference, category, bank, amount, date and status columns use single-column server sorting across the complete filtered result set.
Unsupported column filters/sorts remain disabled; source/category/month filters stay above the table.

## Local verification — 14 October 2026

The focused month/date and manual money/schema tests passed: 15 tests.
The full frontend TypeScript check, focused ESLint check and focused Prettier check passed.
The Finance documentation validator and `git diff --check` passed.
The Codex in-app browser verified the real register components with synthetic data at desktop and 390px mobile widths: bounded month options/year reset, View details, cash/non-cash form validation and saves, server sorting, shared toolbar, read-only permissions, failure/Retry and awaiting/paid/returned cache refresh.
Browser fixtures do not post financial transactions or prove deployed backend behavior. Backend API coverage is documented in the backend contract.
Screenshots are saved in the workspace `reports/income-expense-workspaces-qa` directory.

The Charge-style UI refresh passes 22 focused tests across academic months, money validation and the full-page form. Form coverage includes exact decimal/date payloads, cash/non-cash bank rules, discard confirmation, save locking, failed-input preservation and idempotent retry. TypeScript, focused ESLint/Prettier and Finance docs checks pass. The in-app browser verifies the real components with synthetic data at desktop and 390px mobile widths: table and section-card layouts, cash income/bank expense creation, required-field errors, read-only details, unsaved drafts, keyboard focus, error recovery and no horizontal document overflow. Refresh screenshots are in `reports/accounts-charge-style-ui` outside the frontend repository.
