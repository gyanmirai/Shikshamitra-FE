---
module: finance
domain: workflows
content_type: How-to
status: canonical
updated_on: 2026-10-02
owner: frontend-team
audience: humans-and-agents
---

## Shared permission editing

The original [Security editor layout](../security/workflows.md) is retained, with complete catalogue coverage and independent action toggles.
Do not enumerate grants from a fixed CRUD list, infer action bundles, or restore revoked access through reseeding.
The backend [security standard](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/common/security/permission-consistency.md) owns authorization and approved repair rules.
Existing backend operations that share one permission identifier remain one capability until a separately approved domain change.

# Trace Finance frontend workflows

## Accounts source activity

`/finance/accounts/activity` shows final fee and charge receipts alongside
confirmed refund subledger entries for the selected academic year. The table
keeps collection/refund tabs, search and server pagination. It requires
`Finance.Accounts.Activity.View`; source navigation requires the corresponding
Fees view grant. “Not posted” means these source actions have no General
Accounts journal. This screen does not update account balances or reports.
The backend contract is in
[Accounts source activity](../../../Shikshamitra-BE/docs/modules/finance/references/accounts-source-activity.md).

## Late-fee charge in Fee Collection

A positive late fee returned by the collect-form API is shown at the top of the Fee Ledger in
the Additional Charges list as a **System generated** charge. The waiver action is available on
that charge row. Selecting and collecting it sends a `lateFeePayments` allocation using its
`sourceId` (`DueFeeId`), while ordinary charges continue to use `chargePayments`.

Collections renders the server's `totalCharges` and `pendingCharges`, including system-generated late fees.
Paying only fee installments sends no late-fee allocations; unpaid Additional Charges remain visible and selectable individually or through **All Charges** when collection is reopened.
The checkout's **Overall Outstanding** uses the current collect-form `summary.pendingFee` plus its charge `pendingAmount` values, so a stale Collections row cannot hide unpaid charges.
Payment and waiver mutations invalidate the Collections and fee-details tags, refreshing subscribed grid, ledger, and details queries together.

The fee-head/month ledger does not show or select the same late fee a second time. These generated
rows are collection-only and do not appear on the Charge Management screen.

Month, Fee Head, and Status filters apply to both fee installments and Additional Charges in
both ledger views. The entry badge counts the matching installments and charge rows; a filter
with no matches shows an explicit empty state. Charges keep their own collection status, so a
Pending system late fee does not appear under Paid, Overdue, or Partial Pending merely because
its source installment has that status. Generated late fees follow the source installment's
month and fee head; manual charges have no installment month or fee head and appear only when
those filters are All. Filtering preserves the collector's existing selections.

Fee-line status and overdue classification come from the backend; see the
[Finance product rules](../../../Shikshamitra-BE/docs/modules/finance/product.md).

TL;DR: trace Finance workflows from the menu route to the App Router page, then screen folder, client, mapper, and backend contract.
Use this page to pick the first files for common Finance changes.

## Trace charge management changes

Charge changes start at `/finance/charge-management`. The workspace has Pending, In Process, Completed and Rejected tabs with server counts. Each row and detail header displays the server `workflowStatus`; the student table distinguishes approval, collected, waived and outstanding amounts. New charges always need an independent checker, and the form explains this for every category. Collection/waiver and reconciliation decisions invalidate the charge cache so rows move between tabs after settlement or reversal. The active tab is preserved when returning from detail. See the [backend lifecycle contract](../../../Shikshamitra-BE/docs/modules/finance/references/charge-management-end-to-end.md#four-state-batch-lifecycle) for state and compatibility rules.

1. Inspect `src/app/(auth-route)/finance/charge-management/**`.
2. Inspect `src/screens/finance/ChargesManagement/**`.
3. Inspect `src/redux/finance/ChargeManagement/chargeApi.ts`.
4. Inspect `src/redux/finance/ChargeManagement/chargeMappers.ts`.
5. Confirm backend behavior in `../../../Shikshamitra-BE/docs/modules/finance/api.md`.

The current workspace creates and reviews charge batches, while Fee Collection collects approved student lines and displays charge receipts. It uses academic-year filters, exact action permissions, explicit audience modes, concurrency stamps and server pagination. Full paid-charge refund handling, audience preview/fingerprints and command idempotency remain follow-up work. Follow [Charge Management frontend flow](./references/charge-management-frontend-flow.md) for the current state, target interaction sequence and acceptance coverage.

## Trace collection and receipt changes

Fee collection and receipt flows span Finance and shared fee client folders.

The Collections status column renders the API's `NoFeeAssigned` status as a neutral **No Fee Assigned** badge and includes it in the status column filter. The [backend product rules](../../../Shikshamitra-BE/docs/modules/finance/product.md) own classification and export semantics. The badge and filter option regression is covered by `src/screens/finance/FeeCollection/Components/FeeCollectionTable.test.tsx`.

| Workflow            | Inspect first                                                                          |
| ------------------- | -------------------------------------------------------------------------------------- |
| Fee collection      | `src/app/(auth-route)/finance/fee-collection/**` and `src/redux/feeCollection/**`      |
| Invoice and receipt | `src/app/(auth-route)/finance/invoice-receipt/**` and `src/redux/invoiceAndReceipt/**` |
| Receipt rendering   | `src/screens/finance/viewReceipt/**`                                                   |

### Direct late-fee and charge waiver

The current screen supports a late-fee request and approval lifecycle only.
The approved target removes the Waiver tab, request queue, and approval/rejection flow.

1. Collection Policy and Charge Management contain no waiver fields.
2. Fee Collection shows a waiver toggle for each positive eligible late-fee and approved charge balance.
3. The collector turns the required row ON and enters only a mandatory reason.
4. The frontend does not accept or send a waiver amount.
5. Confirmation makes the server waive the full live remaining balance and refreshes collection totals.
6. There is no global setting, pending request, approver action, or `/finance/waiver-management` route.

See the [approved Fee Collection waiver target](../../../Shikshamitra-BE/docs/modules/finance/references/fee-collection-waiver-end-to-end.md).

## Trace concession and adjustment changes

Concession and adjustment workflows should preserve approval and audit behavior.

| Workflow    | Inspect first                                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Concessions | `src/screens/finance/Concession/**`, `src/screens/finance/ConcessionAdmin/**`, and `src/redux/finance/ConcessionManagement/**` |
| Adjustments | `src/screens/finance/adjustments/**` and `src/redux/finance/adjustments/adjustmentApi.ts`                                      |
| Audit Trail | `src/screens/finance/AuditTrail/**` and `src/redux/finance/audit/financeAuditApi.ts`                                           |

### Concession Type and evidence lifecycle

1. Settings shows active and inactive types so historical configuration stays visible.
2. The form collects a Concession Type Name and document definitions with mandatory/optional, maximum file size, and accepted formats. New document rows start with backend defaults.
3. The server is authoritative for normalized-name uniqueness. Active types cannot be deleted. After deactivation, Delete is available only while the type is unused; used types remain undeletable and lock document-definition changes.
4. A new concession request lists active types only. Editing an existing request may resolve its inactive historical type.
5. Before upload, the shared upload control filters extensions and checks size; the concession upload API repeats extension, MIME, signature, and size validation. The backend expires unattached staged files after 24 hours. Saved evidence opens in the shared preview dialog through an authenticated request-scoped URL only when `ViewDocument` is granted.
6. Missing mandatory evidence blocks approval. Optional evidence is shown and uploadable but is not required.
7. Version History is available from each row's action menu and shows the audited create, edit, and status changes with actor, timestamp, and changed fields.

### Concession request and approval

The request form loads active policies for the selected academic year and fee assignment, defaults the designated policy when present, and requires the user to select one policy before calculation. Preview and save commands include the selected policy and immutable version. Concession management presents three operational buckets: Pending includes Draft and Pending, Approved includes Approved/Partially Reversed/Reversed, and Rejected includes Rejected/Cancelled; cards retain the exact audit status.

1. The request form selects academic context and student, then loads the assignment-derived context. When the server reports more than one current assignment, the form uses the shared select component to require one explicit assignment before showing its policy and types. The policy name, code, version, calculation method, limits, installment scope, eligible heads, and due rows are read-only server values; there is no policy selector.
2. Policy-fixed modes render server preview values without editable money fields. Request-entered percentage and fixed-total inputs are validated for usability, while the rendered concession and net payable always come from the matching latest preview.
3. Save Draft remains available after student, year, type, and assignment context resolve even when fee selections or mandatory evidence are incomplete. Submit requires the current authoritative preview and all mandatory evidence. Removing all evidence sends an empty replacement list.
4. Draft, Pending, Approved, Rejected, Cancelled, Partially Reversed, and Reversed are distinct tabs and labels. Edit/delete appear only for Draft; an owner with Cancel can withdraw Draft or Pending with a reason.
5. Approval is two-step: Review Impact calls the approval-preview endpoint, then Confirm and Apply sends the returned fingerprint and current request stamp. The panel shows submitted and current maximum amounts, warns when balances changed, and requires a reason for a reduction. Reversal follows the same preview/confirm pattern and sends allocation due-row stamps.
6. Buttons require both the matching `Finance.Fees.Concession` permission and the server-provided available action. Detail views render the stored lifecycle timeline. Opening a View-only detail does not call an approval mutation. API authorization and maker-checker checks remain authoritative.

## Trace settings changes

Finance settings routes are split across fees and accounts.
Use `src/constants/finance-menu.ts` to confirm active visibility before changing navigation.

### Payment Term lifecycle

Before manually entering installment rows, a user may choose **Apply Template** after selecting a board. Annual, half-yearly, quarterly, monthly, and custom-count presets are previewed by the backend using the board's exact period and the form's invoice-date rule. The user reviews dates and percentages, explicitly applies or replaces the local schedule, may edit any generated row, and then follows the normal Draft/Active save lifecycle. One schedule-level toggle controls invoice creation for every installment; manual and template-generated rows inherit its value. The form labels the demand date as **Invoice Date** and the coverage range as **Installment Start-End Date** while preserving the existing API contract.

1. The drawer exposes the same editable lifecycle as HR Attendance Policy: `Draft` or `Active`. Archive remains a separate guarded action.
2. Saving as `Draft` keeps the schedule unassignable. Saving as `Active` atomically publishes an immutable version; the backend derives its activation date inside the selected board period.
3. Every installment period and due date must be inside the selected board's own start/end dates, which may be narrower than the academic year. The installment range accepts typing or pasting `DD/MM/YYYY - DD/MM/YYYY`, with strict calendar-date, date-order, and board-period validation. Invalid or incomplete input clears the stored range and blocks saving until corrected. The calendar button remains available and initially opens at the selected range or, for an empty range, the board's start month. Payment Due Date and specific Invoice Date support keyboard entry as `DD/MM/YYYY`; calculated Invoice Dates remain read-only. Empty single-date calendars start at the installment start date, or the board start date when no installment start has been entered. Values retain the existing date-only API contract.
4. Fee Structure lists published and superseded versions of active terms and stores the explicitly selected version ID. Existing pins never upgrade automatically; see [the active workspace flow](./references/fee-structure-workspace.md).
5. Student fee assignment creates immutable DueFee schedule snapshots for the full year.
6. Only one Active Payment Term may be selected as the default for each Education Board in an academic year. Draft and Archived terms cannot be defaults. Selecting a new Active default clears the previous default for the same board in the same transaction, while other boards retain their defaults. A filtered unique database index enforces the invariant, and the workspace board selector scopes the list to one board.
7. The list separates current and archived records and presents one user-facing status: `Draft`, `Active`, or `Archived`. Internal version lifecycle states remain available in version history and assignment checks.
8. Activation is a one-way Draft-to-Published version action in the current API and is exposed through row actions, not a Status-column toggle. Archive and restore are separate master-record transitions; archiving requires a reason and is blocked while fee structures reference the term. Restoring preserves the version state and returns the term to Current as Draft or Active.
9. Version History opens in the details drawer as a simple audit table showing version/status, action, creation date and user, and change reason. Its paged data is loaded only when the history tab opens.
10. Collection shows an installment only when its server-calculated bill generation date has arrived. If a structure is assigned late, all dates already reached are available immediately.

The four bill-generation rules are: installment start date, X days before due date, due date, and a specific per-installment date. The frontend previews calculated dates, but the backend remains authoritative.

### Fee Structure policy defaults

When a new Fee Structure opens, the Policies form loads the academic year's Active Collection, Refund, and Proration policies. It fills an untouched empty selection with that type's Default before the Policies tab is opened. Staff can choose a different policy; saved structures keep their explicit selections, including intentionally absent optional policies.

All four policy editors use the same Default control. A current Default explains why it cannot
be cleared or moved to Draft, and the archive action requires staff to designate a replacement
first. Default selection uses the policy's current immutable version; manual choices and explicit
clears are retained when lookups refresh. The backend owns the
[default invariant](../../../Shikshamitra-BE/docs/modules/finance/product.md).

### Collection Policy history and audit

1. The row action menu exposes Audit Trail and Version History only when Collection Policy `View` is granted.
2. Both drawers lazily load the immutable Collection Policy version stream when opened.
3. Version History compares each snapshot with its predecessor and shows field-level changes, actor, timestamp, action, status, and reason when present.
4. Audit Trail presents those same immutable records as create, update, clone, archive, and unarchive lifecycle events, so policy audit evidence cannot drift from version history.

## Student fee assignment

The active assignment drawer, typed client, permissions, retries and verification fixture are documented in [Student fee assignment](./references/student-fee-assignment.md).
