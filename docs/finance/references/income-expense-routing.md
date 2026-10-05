---
module: finance
domain: accounts
content_type: Reference
status: active
updated_on: 2026-10-02
owner: frontend-team
audience: humans-and-agents
---

# Select categories and school bank accounts in Finance

Income Categories, Expense Categories, and Bank Accounts have independent settings forms. Account Heads are removed from navigation, editors, selectors, and posting setup controls. The former `/finance/settings/account-heads` route redirects to `/finance/settings/incomeCategories`. Fee Heads remain available.

## Screens and selectors

| Screen | Financial fields |
|---|---|
| Fee Head editor and embedded Fee Head editor | Income Category |
| Charge create/update forms | Required Income Category and Receiving Bank Account |
| Charge detail | Saved category and masked bank label |
| Collection Policy late-fee section | Late Fee Income Category |
| Refund Policy editor | Expense Category and Default Paying Bank Account |
| Fee Collection | Receiving School Bank Account; default from selected charges when they share one bank |
| Refund approval | Expense Category, Payout Method, and Paying Bank Account |
| Refund payout recording | Approved method and bank, reference, and evidence |
| Income/Expense tables | Automatic source entries visible; manual edit/delete actions hidden for those rows |
| Combined Income & Expenses register | Category and masked bank snapshots; each payment counted once |

The shared `FinanceRoutingFields` component uses searchable `CustomSelect` controls with Formik. It reports failed lookups and displays an unavailable saved selection explicitly. Forms validate mandatory routing; policy drafts may omit mappings, while activation requires them.

`src/redux/finance/financeRoutingApi.ts` calls `/finance-routing-options` with an owning operation. Cashiers and refund approvers do not need category/bank master View permission merely to choose an eligible account. Category and bank edits invalidate lookup tags. Collection, reconciliation, and payout mutations refresh income/expense activity.

Refund approval defaults come from the request's pinned policy snapshot. Changing the configured category or bank requires a reason in approval notes. Recording payout uses the approved bank and method. A refund becomes Expense after payment confirmation, and returned payments appear as signed corrections.

Cash fee collections may leave the school bank empty. Charges and non-cash payments require a school bank. Charges routed to different banks require separate collections; the backend checks the routing even if a client sends a different bank. The existing pending-payment restriction remains: multiple instruments or mixed fee/charge receipts cannot be deferred for receipt-level reconciliation. Confirmed split instruments remain a supported API contract.

## Validation and rollout

Run the account settings form tests and charge validation tests, TypeScript, focused lint, and an authenticated browser check for every changed form. Verify retired-route navigation, required-field messages, year changes, empty options, failed lookups, inactive saved records, locked routing after partial approval, and exact payment/refund amounts.

Deploy the backend migration before these clients. Review existing pending charges and active policies with missing mappings. Historical journal references remain backend compatibility evidence; General Accounts journal posting is currently unavailable.

Backend invariants and API ownership: [backend routing reference](../../../../Shikshamitra-BE/docs/modules/finance/references/income-expense-routing.md).
