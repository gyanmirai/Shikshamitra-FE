---
module: finance
domain: cash-management
content_type: Reference
status: active
updated_on: 2026-10-27
owner: frontend-team
audience: humans-and-agents
---

# Cash Management workspace

Finance / Accounts has one new Cash Management submenu at `/finance/accounts/cash-management`, guarded by the exact `Finance.Accounts.CashManagement.View` grant. Its owning screen is `src/screens/finance/accounts/CashManagement/` and its client is `src/redux/finance/cashManagementApi.ts`.

The table separates approval status from bank deposit progress. All cash, Pending approval and Approved use the compact status-filter surface with server counts across all pages. Counts respect search and column criteria independently of the selected status. The original receipt/source leads the table; Status and Actions remain sticky at the right. In transit remains available through Columns and starts hidden. Text, numeric, date and status header filters and single-column sorting run on the server before paging. Search, filters, status, sorting and page selection are URL-backed. Loading, refresh, empty, retry and forbidden states use the shared Finance components.

An eligible reviewer can select Approve directly in the Actions column; it loads current detail evidence and opens the existing counted-amount/bank dialog without opening the detail drawer. View and row activation retain the detail drawer. No Reject action or rejected status exists in this flow.

Pending cash can fund paid expenses before approval. Approve Cash shows Collected amount, Expenses paid, and Remaining to deposit, prefills the counted amount with the remaining balance (including zero), and requires a matching count and an active receiving school bank account. Approval finalizes that deposit and confirms only the remainder as Income. For a collected receipt of 10000 and stationery expense of 2000, pending cash is 8000; final approval records Income/deposit 8000 and leaves held cash zero, with the original receipt 10000 and Expense 2000 unchanged. Fully spent cash can be finalized at zero without a positive Income or deposit. Pending summary uses the server's net remaining total.

Legacy approved-held cash retains Record Bank Deposit when `canDeposit` allows it. Legacy transit retains independent bank-credit confirmation when `canConfirm` allows it. New approval requires no additional deposit action. Server capability flags and exact action grants govern every action.

Pending receipt details retain a disabled Approve Cash action when approval is unavailable. Inline help explains self-approval restrictions, missing approval permission, or refreshing eligibility. An eligible reviewer opens the bank selection and counted-amount form from that action. Administrators with cash approval permission may approve their own collections; the backend resolves current administrator membership and returns `canApprove`. Other collectors need a different reviewer. The frontend follows that capability without inferring administrator access from client role claims or granting permissions.

Existing Add Expense shows a Cash source picker for Cash, populated through the owning expense-action lookup with pending receipts that have a positive remaining balance. Approved receipts are unavailable for new expenses. The source label identifies its linked receipt, available pending cash, and pending cash after payment. The client sends `cashCollectionId` and `cashConcurrencyStamp`; actual expense payment refreshes cash and register data. Manual Cash Income reports that it awaits cash approval. Collection continues generating the official receipt immediately, with pending Income explained in success feedback.

Cash mutations refresh the Cash Management and affected Income/Expenses clients. Forms retain entered values after errors, block double submission and protect dirty closing. A stale approval refreshes the balance and concurrency stamp without replacing the draft; submission must then match the latest remainder. An uncertain result locks fields and retries the exact original command and idempotency key. Amount inputs and displays use the existing Finance numeric/currency utilities.

Business rules, endpoints and migration ownership: [backend Cash Management contract](../../../../Shikshamitra-BE/docs/modules/finance/references/cash-management.md).

The controlled fixture in `e2e/fixtures/cash-management/` mounts the actual screen with synthetic API responses. Its browser evidence verifies presentation and interactions, not persisted bank or cash records. Real HTTP acceptance belongs to the backend tests.
