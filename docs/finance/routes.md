---
module: finance
domain: routes
content_type: Reference
status: canonical
updated_on: 2026-10-14
owner: frontend-team
audience: humans-and-agents
---

# Find Finance frontend routes

TL;DR: Finance routes are owned by `src/constants/finance-menu.ts` and `src/app/(auth-route)/finance/**`.
Use the menu source to decide whether a route is active navigation.

Active Fee Structure editor, typed client and browser checks: [workspace implementation](./references/fee-structure-workspace.md).

## Active menu routes

Use this table for visible Finance navigation.

| Menu label           | Route                                       | Source                          |
| -------------------- | ------------------------------------------- | ------------------------------- |
| Dashboard            | `/finance/dashboard`                        | `src/constants/finance-menu.ts` |
| Audit Trail          | `/finance/audit-trail`                      | `src/constants/finance-menu.ts` |
| Collections          | `/finance/fee-collection`                   | `src/constants/finance-menu.ts` |
| Charges              | `/finance/charge-management`                | `src/constants/finance-menu.ts` |
| Waivers              | `/finance/waiver-management`                | `src/constants/finance-menu.ts` |
| Refunds              | `/finance/fee-refund`                       | `src/constants/finance-menu.ts` |
| Receipts             | `/finance/invoice-receipt`                  | `src/constants/finance-menu.ts` |
| Concessions          | `/finance/concession`                       | `src/constants/finance-menu.ts` |
| Adjustments          | `/finance/adjustments`                      | `src/constants/finance-menu.ts` |
| Fee Structure Assign | `/finance/fee-structure-assign`             | `src/constants/finance-menu.ts` |
| Fee Category         | `/finance/settings/fee-category`            | `src/constants/finance-menu.ts` |
| Fee Head             | `/finance/settings/fee-head`                | `src/constants/finance-menu.ts` |
| Payment Terms        | `/finance/settings/payment-term`            | `src/constants/finance-menu.ts` |
| Fee Structure        | `/finance/settings/create-fee-structure`    | `src/constants/finance-menu.ts` |
| Concession Type      | `/finance/settings/concession-type`         | `src/constants/finance-menu.ts` |
| Charge Category      | `/finance/settings/chargeCategory`          | `src/constants/finance-menu.ts` |
| Reconciliation       | `/finance/reconciliation`                   | `src/constants/finance-menu.ts` |
| Legacy combined page | `/finance/income-and-expense` | Redirects to an authorized Income or Expenses workspace |
| Old Accounts Activity | `/finance/accounts/activity` | Redirects through the authorized workspace selector |
| Income               | `/finance/income-tracking`                  | `src/constants/finance-menu.ts` |
| Expenses             | `/finance/expenseTracking`                  | `src/constants/finance-menu.ts` |
| Income Category      | `/finance/settings/incomeCategories`        | `src/constants/finance-menu.ts` |
| Expense Category     | `/finance/settings/expenseCategories`       | `src/constants/finance-menu.ts` |
| Bank Accounts        | `/finance/settings/bank-account-management` | `src/constants/finance-menu.ts` |
| Reports              | `/finance/reports`                          | `src/constants/finance-menu.ts` |
| Notifications        | `/finance/finance-notification`             | `src/constants/finance-menu.ts` |

The Waivers row reflects the current source only.
The approved target removes that menu item and `/finance/waiver-management` route without adding a replacement; waiver application moves into Fee Collection as documented in [Fee Collection waiver end to end](../../../Shikshamitra-BE/docs/modules/finance/references/fee-collection-waiver-end-to-end.md).

## Nested charge routes

Charge Management has nested pages under the active menu route.

| Surface | Route | Source | Current status |
|---|---|---|---|
| Charge workspace | `/finance/charge-management` | `src/app/(auth-route)/finance/charge-management/page.tsx` | Active menu destination |
| Charge requests (legacy) | `/finance/charge-management/chargesRequest` | `src/app/(auth-route)/finance/charge-management/chargesRequest/page.tsx` | Redirects to `/finance/charge-management` for bookmark compatibility |
| Charge list (legacy) | `/finance/charge-management/chargesList` | `src/app/(auth-route)/finance/charge-management/chargesList/page.tsx` | Redirects to `/finance/charge-management`; the legacy screen is not user-accessible |

The supported current and target route flow is documented in [Charge Management frontend flow](./references/charge-management-frontend-flow.md).

## Known inactive or partial surfaces

These routes or path constants exist but should not be treated as active menu navigation without checking source and product status.

| Surface                 | Status                                                                           |
| ----------------------- | -------------------------------------------------------------------------------- |
| Receipt Book menu child | Commented in `finance-menu.ts`, although a page folder exists                    |
| Budgeting path          | `financePaths.budgeting` exists, but active navigation needs source confirmation |
| Draft Postings           | Removed from Accounts menu; the direct route explains that no posting API exists |
| Posting Automation       | Removed from Accounts Settings; the direct route has no fake Save action         |

Accounts Settings does not contain a Payment Modes item. Fee Collections owns the current payment-method choices. The proposed Accounts implementation is tracked in [Accounts frontend/backend delivery](../../../Shikshamitra-BE/docs/modules/finance/references/accounts-frontend-backend-delivery.md).

## Student fee assignment

The active assignment drawer, typed client, permissions, retries and verification fixture are documented in [Student fee assignment](./references/student-fee-assignment.md).

## Income, expense, and bank routing

The implemented selectors, retired Account Heads route, lookup permissions, cache updates, and rollout checks are documented in [Income, expense, and bank routing](./references/income-expense-routing.md).

Separate registers use exact IncomeTracking.View and ExpenseTracking.View grants in navigation, route and screen guards.
See [Income and Expenses workspaces](./references/income-expense-workspaces.md).
