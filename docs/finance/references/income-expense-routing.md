---
module: finance
domain: accounts
content_type: Reference
status: active
updated_on: 2026-10-31
owner: frontend-team
audience: humans-and-agents
---

# Select categories and school bank accounts in Finance

Income Categories, Expense Categories, and Bank Accounts have independent settings forms. Account Heads are removed from navigation, editors, selectors, and posting setup controls. The former `/finance/settings/account-heads` route redirects to `/finance/settings/incomeCategories`. Fee Heads remain available.

## Screens and selectors

| Screen | Financial fields |
|---|---|
| Fee Head editor and embedded Fee Head editor | Income Category |
| Charge create/update forms | Charge Category; income mapping is resolved by the backend |
| Charge detail | Charge Category |
| Collection Policy late-fee section | Late Fee Income Category |
| Refund Policy editor | Expense Category and Default Paying Bank Account |
| Fee Collection | Receiving School Bank Account for non-cash payments |
| Refund approval | Expense Category, Payout Method, and Paying Bank Account |
| Refund payout recording | Approved method and bank, reference, and evidence |
| Income/Expense tables | Automatic source entries visible; manual edit/delete actions hidden for those rows |
| Separate Income and Expenses registers | Category and masked bank snapshots; each payment counted once |

The shared `FinanceRoutingFields` component uses searchable `CustomSelect` controls with Formik for flows that choose routing. It reports failed lookups and displays an unavailable saved selection explicitly. Policy drafts may omit mappings, while activation requires them. Charge Category settings own the income mapping; the charge form has no routing selector.

`src/redux/finance/financeRoutingApi.ts` calls `/finance-routing-options` with an owning operation. Cashiers and refund approvers do not need category/bank master View permission merely to choose an eligible account. Category and bank edits invalidate lookup tags. Collection, reconciliation, and payout mutations refresh income/expense activity.

Refund approval defaults come from the request's pinned policy snapshot. Changing the configured category or bank requires a reason in approval notes. Recording payout uses the approved bank and method. A refund becomes Expense after payment confirmation, and returned payments appear as signed corrections.

Selecting Cash hides the school bank selector for fees and charges, clears a previously selected bank, and excludes it from the payment payload and review. Non-cash payments show the required school bank selector. For non-cash charge routing and separate-collection requirements, see the backend routing reference below. The existing pending-payment restriction remains: multiple instruments or mixed fee/charge receipts cannot be deferred for receipt-level reconciliation. Confirmed split instruments remain a supported API contract.

## Validation and rollout

Each tenant/academic year has persisted Income and Expense categories named None. Every live
Finance category selector offers that stored option first: Fee Category, standalone Fee Head,
Charge Category, collection/refund policies, manual income/expenses and refund payment recording.
General category administration lists exclude it. Selecting None is valid, while leaving a
required category unselected is invalid. Stored None records remain protected from modification.
The shared routing fields and Fee Head editors pin None first. Unavailable saved categories remain
visible and disabled after live choices. Failed lookups remain distinct from empty setup states.
Selected None guidance explains the Accounts exclusion, and manual-entry success feedback does
not claim an income/expense was added when None was selected. Account rows, totals and details
follow the [backend exclusion contract](../../../../Shikshamitra-BE/docs/modules/finance/references/income-expense-routing.md#accounting-integrity).
Deploy/apply `AddNoneTransactionCategories` for existing years before using the updated selectors.
New academic years initialize the two defaults automatically. No frontend placeholder is appended.

Run the account settings form tests and charge validation tests, TypeScript, focused lint, and an authenticated browser check for every changed form. Verify retired-route navigation, required-field messages, year changes, empty options, failed lookups, inactive saved records, locked routing after partial approval, and exact payment/refund amounts.

Deploy the backend migration before these clients. Review existing pending charges and active policies with missing mappings. Historical journal references remain backend compatibility evidence; General Accounts journal posting is currently unavailable.

Backend invariants and API ownership: [backend routing reference](../../../../Shikshamitra-BE/docs/modules/finance/references/income-expense-routing.md).

Active workspaces now expose View-only row actions and routed manual creation; see [the workspace contract](./income-expense-workspaces.md).
