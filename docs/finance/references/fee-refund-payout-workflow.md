---
module: finance
domain: accounts
content_type: Reference
status: active
updated_on: 2026-10-24
owner: frontend-team
audience: humans-and-agents
---

# Fee refunds workspace

The Fees → Refunds worklist shows Pending, Approved, Completed, Rejected, and Failed tabs. The History tab is removed. Search, academic/class/division filters, and pagination are server driven. Each row shows only the actions returned by the API for the signed-in user. Completed displays the existing processed status value (7).

The table orders Refund no., Student, Class / Division, Original receipt, Amount, Method,
Requested, Status, and Actions. Each data column has the shared header filter; Status and
Actions stay pinned on the right. Class / Division shows both names, with `—` for a missing
value. Amount filters compare the numeric amount, and Requested uses calendar-day filters
with the browser's local timezone. `refundWorklistFilters.ts` serializes these filters into
the list API's `filters` query parameter; the server filters before counting and paging.
Alternatives on one column use OR and different columns use AND. Counts use the same
column filters. Switching status tabs clears only the status column filter. Row actions use the shared adaptive menu,
with at most two direct actions and the remaining actions in its overflow menu.

Validate the date/status request mapping with
`src/screens/finance/feeRefund/Components/refundWorklistFilters.test.ts`. In the in-app
browser, check every column's filter menu, filtered counts across multiple pages, clear
filters, Completed status labels, narrow-screen scrolling, and the pinned right columns.

The request form uses shared Student information, Refund details, and Refund payment details sections, with optional guidance in accessible heading tooltips and one **Submit** action in the stable footer. Refund details shows the resolved policy name and server-returned maximum refundable amount beside the full/partial controls. The fee allocation table retains paid, refunded, refundable, and receipt information; duplicate summary cards, utilization progress, and instructional banners are omitted. The request captures the allowed payout method, required recipient details, and a single required Refund reason (empty or whitespace-only reasons block submission); payment remarks, instrument details, school account, and payout dates belong to payment recording. The server recalculates on submission. A Failed request can open a linked replacement form with the source allocations filled in; staff must choose and review payment details again.

Full-refund selections stay within the server policy limit, and a policy that disallows partial refunds resets a partial selection to full. Eligibility loading retains entered amounts and never reuses a previous student's response. The method selector and submission both enforce the policy's allowed methods; legacy drafts use their saved method snapshot. Checking or saving locks the form using the shared busy overlay.

Paid installments remain visible after selection. Refund selection is restricted to one original
receipt: the fee-head checkbox selects eligible installments from the selected receipt, or the
first refundable receipt when none is selected. Other receipts remain visible and disabled with
a tooltip explaining how to switch; clearing the selection unlocks them. Counts, amounts, and
the submitted allocation lines use the same selection. Adjustment selection still permits
multiple receipts. Selection validation appears as compact field feedback after submission,
without instructional or receipt-lock banners. Narrow tables scroll inside the fee-head card.

Add-form eligibility loading uses matching refund and payment section skeletons. Edit and
replacement forms retain skeletons for student, refund, payment, and footer summary content
until the saved request and allocation mapping are ready. Failed reads expose Retry and block
submission; stale allocation responses cannot replace a newer request. Focused checks are
`RefundSelection.test.tsx`, `RefundForm.test.tsx`, `FeeHeadRefundTable.test.tsx`, and
`FeeRefundDetailForm.test.tsx` in `src/screens/finance/feeRefund/NewRefundForm/`.

Approved refunds show **Record payment**, opening a single Payment Details dialog. Every method requires an Expense category and Source school bank account; new non-cash payments also require the cheque/DD number or transaction reference. Cash has no signed handover field and receives a server-generated voucher reference. Submit completes the refund and creates its expense atomically. There is no subsequent verification dialog or Awaiting verification state. A previously recorded pending payment opens this same dialog with its original reference, date, and any saved bank preserved. Its masked reference is display-only and is omitted from the payout payload; the server reuses the stored payment reference. Confirmed non-cash returns remain available from Completed rows.

Historical statuses remain readable through existing refund detail and API responses. The old processing route is not used for new requests.
Approval collects optional remarks and reserves the refund amount; expense routing is collected during payment recording. The review detail shows saved policy methods; legacy method aliases are normalized before payment selection. Reject and Cancel require a reason.
The **Record payment** method options come from the request's saved `allowedPayoutMethods` policy snapshot. They never expand to all methods when the snapshot is absent or empty; payment recording remains disabled until the selected method is allowed. Policy edits therefore do not change historical request choices.

The detail view shows the net refund subledger amount and a balance check against the request, refund lines, and due fees. Recording payment creates a source-linked expense and refund subledger entry; a late return creates compensating entries. The payout mutation refreshes refund, fee, collection, expense, and account posting caches. These entries are not General Accounts journal postings.
