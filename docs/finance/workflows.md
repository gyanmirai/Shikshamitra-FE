---
module: finance
domain: workflows
content_type: How-to
status: canonical
updated_on: 2026-10-21
owner: frontend-team
audience: humans-and-agents
---

## Shared permission editing

The original [Security editor layout](../security/workflows.md) is retained, with complete catalogue coverage and independent action toggles.
Do not enumerate grants from a fixed CRUD list, infer action bundles, or restore revoked access through reseeding.
The backend [security standard](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/common/security/permission-consistency.md) owns authorization and approved repair rules.
Existing backend operations that share one permission identifier remain one capability until a separately approved domain change.

# Trace Finance frontend workflows

## Table row actions

Across Finance tables, show the first three permitted actions directly using
`AdaptiveThreeDotsActions` with `directActionLimit={3}`. Show the three-dot menu only
when more actions exist, and include only the fourth and subsequent actions in it.
Keep this split on mobile, preserve action order and disabled states, and continue
applying each action's existing permission and workflow checks.

Open record details from the row instead of a View action. Use the shared table's
`getRowAction` to retain the existing detail callback, permission and availability
checks, plus keyboard activation and focus return. Keep inline buttons, links,
checkboxes and action menus independent of opening the record. Fee ledger rows
open their detail dialog; selection remains on their existing checkboxes. Omit
Actions columns when viewing was their only operation. History, schedule selection
and other distinct operations retain their own labels and action rules.

## Finance help and feedback

Finance screens, tables, forms, dialogs, and drawers retain their information icons and tooltip
explanations. Omit informational banners, visible section/page explanations, character counters,
and nonessential field hints. Keep field validation, API/load errors and
retry actions, blocking restrictions, concise empty/loading states, saved record descriptions,
and transaction confirmations. Financial calculations, permissions, and submission rules are unchanged.

## Shared read-only details

Finance policy views, Accounts income/expense transaction dialogs, concessions, charges,
student fee details, receipt previews and receipts generated after collection use
`src/components/detail-view`. `DetailSection` extends the common `FormSectionCard`;
`DetailField` provides the policy reference's uppercase caption and body-value typography.
`DetailGrid` uses one, two or three columns based on the section's available width.
Descriptions and notes span the row, and related tables use the full content width.
The body owns scrolling while dialog headers and action footers remain reachable.

This is a presentation contract: existing feature queries remain the source for saved
amounts, student context, policy versions, approval statuses and receipt documents.
Finance owns these views; existing action permissions, payment/approval commands,
academic scope and server calculations remain in their owning workflows. Missing
student facts show an unavailable marker rather than sample student data.

## Concession request presentation

Concession requests group student scope, policy/type, selectable fee heads, installment values,
review and supporting documents in the existing form. Installment rows show original, paid and
eligible amounts beside compact concession inputs. Request-entered installment values retain raw
decimal text while editing and convert to numbers at the existing command boundary. Policy-fixed
values remain read-only. The review keeps eligible fees, concession reduction and net payable in
one compact summary; only the server preview supplies those amounts. Its layout remains present
while calculations refresh. Approval presents installment amounts in labeled columns with the
existing server impact review and confirmation in a persistent footer. Required documents,
maker/checker permissions, refund behavior, allocation rules and API commands remain unchanged.

Fee-head totals remain visible above collapsed installment breakdowns. Fixed request-entered
concessions show the policy maximum once, plus entered and remaining totals; each row's allowance
includes its current value and excludes amounts entered elsewhere. Reaching the shared limit
explains how to release allowance. Supporting-document rows keep Upload/Replace beside the status
and filename, and the warning lists the missing required documents by name.

Collection payment, transfer, cheque and issue dates share the same `DD/MM/YYYY` picker and typed
validation. Picker values remain Dayjs objects during segment edits; invalid and past dates block
submission. The server repeats validation and preserves the selected institution-calendar date
through provisional receipts, reconciliation month filtering and final receipts. See the
[backend collection workflow](../../../Shikshamitra-BE/docs/modules/finance/workflows.md#non-cash-collection-and-reconciliation).

## Fee settings and charge authoring

Payment Terms display usage across all versions with a class, Fee Structure, Fee Head and version breakdown. Create, Edit and Duplicate show the current-to-new default and current-default usage when Default is on; saving a replacement requires Confirm/Cancel. The server impact is refreshed before confirmation. Existing structure assignments retain their saved versions. Archived Fee Category mapped-head status switches are disabled with a restore-category explanation.

The Fee Category table applies category name and description text filters, fee-head-count numeric filters, status options, and single-column sorting on the server before pagination. Current and Archived tabs set the status scope; the Status filter offers Active and Archived within that scope. Clicking a category row, or pressing Enter or Space on a focused row, opens its detail view; View is not an Actions-column item. The fee-head drawer loads the full category detail, so its search, filters, and sorting cover every mapped head even if the parent table page changes. Its status switch sits in the Actions column and is disabled while the category is archived.
Export retrieves every page matching the current query and visible column order; cancellation or incomplete results do not produce a partial file.
Category details keep one income-category value per fee head, labeled concession badges, wrapping text, and responsive cards inside the shared scrollable dialog.

Charge authoring keeps academic scope and selected students in the form. Search and quick filters narrow results without removing selections; Select All applies to matching results, and All students in scope remains the complete eligible academic scope. Failed reloads preserve selections and offer retry. Invalid selections are removed only after an authoritative scope load and a visible notice. The persistent footer checks the canonical Add/Update grant, required values and audience. Successful creation returns to the list as Pending; Cancel and back use the unsaved-changes guard. Fee Structure Policies validate Collection before Next/Review while retaining optional Refund and incomplete draft saves.

## Accounts setting forms and history

Income Category, Expense Category, and Bank Accounts use the shared Accounts
version-history dialog. It shows the selected record and type, newest-first
versions, actor and local time zone, and labeled Before/After values. Bank account
numbers stay masked. Missing legacy audit details are identified explicitly;
loading, no history, and request errors have separate states, with Retry on errors.
The dialog body scrolls independently of its header and Close footer. Category
and bank-account forms use the same section cards as Academic Subject forms.

| UI behavior          | Implementation                                                                                                                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Names and limits     | Preserve entered case, numbers, symbols and Unicode; trim at save; show Income 40, Expense 128, bank names 100 and Purpose 500 limits; validate in Formik rather than relying only on HTML maxlength |
| Duplicate failures   | Create/edit failures map to the Name or Account Number field and remain visible in a form alert; entered values are retained                                                                         |
| Bank UPI             | Render/export the server's `maskedUpiId`; keep full detail values only in the edit form                                                                                                              |
| Mobile tables        | Keep the identifying Name/Bank Name column on the left; disable right-side status/action pinning below the small breakpoint so it cannot cover names                                                 |
| Status accessibility | Each switch names its action and selected record                                                                                                                                                     |
| Bank deletion        | Confirmation identifies bank, branch and masked account number; the primary action reads Delete                                                                                                      |
| Income deletion      | Unused active categories can be deleted after confirmation; dependency restrictions use the server's `canDelete`. Failed deletes keep the dialog and error visible; pending deletes lock its actions. |
| Exports              | Feature-specific filenames; Hindi/Gujarati exports use shaped embedded-font text; Actions remain excluded                                                                                            |

The [backend contract](../../../Shikshamitra-BE/docs/modules/finance/api.md#category-and-bank-settings-data) owns validation, masking and history persistence.

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
The collapsed **Student information** section's **Total outstanding** uses the current collect-form `summary.pendingFee` plus its charge `pendingAmount` values, so a stale Collections row cannot hide unpaid charges.
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

## Fee Collection selection and receiving bank

Collection Policy's **Automatic Payment Priority** section selects **Installment first (earliest due)**
or **Fee head first (A–Z)**. The latter clears each head's earliest dues before the next head.
The collect form receives the assignment's pinned `allocationBasis`, policy identity/version,
`allocationDueFeeOrder` and `allocationRevision`. With no fees or charges selected, entering an
amount allocates across eligible outstanding fees from the complete ledger in the returned order.
Additional charges require explicit selection. Selecting any fees or charges limits collection to
that selection. Entering an amount updates Pay now and Remaining; amount-only summaries show
the funded fees. Group by remains editable, and grouping, sorting and display filters never change
payment priority or the amount-only candidate set. No fee-head priority editor is introduced.
Configured fee rows have numbered positions; table sorting and summary dragging cannot change
the automatic allocation sequence. Charge ordering remains in its existing separate group.
Review and collection submit every selected due ID, including unfunded rows, and the revision
through `automaticAllocation`. A changed-policy/balance rejection refreshes the form and requires
another review; an uncertain network outcome retains the original retry key.
Policies and historical snapshots without the setting retain **Existing selection order**.
Existing assignments continue using their pinned version until refreshed through the assignment workflow.
Backend rules: [collection allocation contract](../../../Shikshamitra-BE/docs/modules/finance/api.md#automatic-collection-allocation).

Collect Fees shows the student identity, academic year and total outstanding above expandable
fee-head cards and a payment summary. Each card has independent group selection, a selected
amount/count badge, and an embedded shared table showing Due Period with installment label,
Amount, Status and an icon-only View action. The Filters button expands Month, Fee Head, Status,
Group by and all four selection presets. Grouping by month uses the same cards and preserves
selection, payment drafts and allocation order; additional charges retain a separate group.
View opens the row's full breakdown, including proration, concessions, refunds, reconciliation
and the existing waiver controls. The compact read-only dialog groups due period, installment
and status in Fee Details (Charge Details for charges), followed by Amount Breakdown with a
prominent outstanding amount. Its shared section grid uses two columns when space allows and
stacks on narrow screens; the scrollable body keeps the outlined Close action reachable.
Amounts retain the ledger's existing values and shared INR display formatting.
The record header and each section expose a keyboard-accessible information control, following
the Policy view's section typography and help pattern.
The group list owns vertical scrolling and each embedded table contains horizontal scrolling.
For legacy policies, sorting never reorders the selected allocations.

Payment summary keeps its heading and outlined Clear All action above a scrollable
payment-details body. Selected rows appear first with Fee item, Term and Amount columns,
drag handles and trailing remove actions for legacy policies. Pointer, touch and keyboard dragging reorder legacy fee rows
or charge rows within their own allocation groups. Fees retain precedence over charges; the
displayed order within each group is used by both payment review and the submitted allocations.
The neutral dark Collect action, outlined Cancel and Collecting now amount stay in a stationary
footer, outside that scroll region. Amount to collect and one Payment Method dropdown share a
row when the panel has room. All policy-permitted methods and their required details remain
available directly in the dropdown. Receiving-bank lookup is preserved. Cash Received is a local
tender draft used only to display Change to return; only Amount to collect is allocated, posted
and printed on receipts. Insufficient cash blocks collection. Clear All also clears cash tender.

The student identity card uses compact padding and a smaller avatar. Selected-item rows are
compact, with a separate field group below. Summary guidance lives in the header info tooltip;
fields show validation errors without routine instructional helper text.
Collect and Cancel sit in
the payment summary; mobile stacks it after the fee groups. Hidden selections
are counted visibly when filters exclude them. Both existing review dialogs and receipt flows
remain in place.

Selection Filters operate on the student's complete ledger independently of the Month,
Fee Head, Status, and grouping controls, which only change the visible rows.
**All Pending** selects collectible fee installments; **All Charges** selects unpaid
Additional Charges, including generated late fees.
**First 6 Month** and **Last 6 Month** use the academic-year month sequence, including
months whose installments are already paid, and select only collectible installments.
Combining selection filters adds their matching rows without duplicates.
Unticking a filter removes its contribution while preserving rows retained by another
active filter or a manual selection.
Manual row changes update the selection controls, counts, and checkout totals together;
a partially selected active filter scope is shown as indeterminate.
Paid and other noncollectible rows cannot enter the payment selection.

Checkout receiving-bank options come from the academic-year collection routing lookup.
Their labels retain the server's masked account identifier or account name.
Missing identifiers omit the separator and missing-value suffix; a bank with no usable
display fields shows **Bank account (details unavailable)**.
The selected option and payment-review label use the same normalized label, while the
submitted bank-account ID remains the server-issued identifier.

TL;DR: trace Finance workflows from the menu route to the App Router page, then screen folder, client, mapper, and backend contract.
Use this page to pick the first files for common Finance changes.

## Trace charge management changes

Charge changes start at `/finance/charge-management`. The workspace has Pending, In Process, Completed and Rejected tabs with server counts. Each row and detail header displays the server `workflowStatus`; the student table distinguishes approval, collected, waived and outstanding amounts. Ordinary staff requests need an independent checker; administrator creation shows a final confirmation and returns approved lines. Collection/waiver and reconciliation decisions invalidate the charge cache so rows move between tabs after settlement or reversal. The active tab is preserved when returning from detail. See the [backend lifecycle contract](../../../Shikshamitra-BE/docs/modules/finance/references/charge-management-end-to-end.md#four-state-batch-lifecycle) and [admin confirmation flow](./references/admin-request-auto-approval-ui.md).

## Concession decisions

The Pending concession table offers View, Approve, and Reject through the shared two-icon/overflow action pattern when the exact action permission and server available action allow them. The immutable requester ID must be present, and the signed-in requester or submitter cannot decide the request. Approval stays on the list: it loads the current approval context, previews the server-calculated impact, and requires confirmation before submitting the preview fingerprint and request stamp. Rejection requires a reason. Both decisions invalidate the concession query so the row and Pending/Approved/Rejected counts refresh. The View Concession controls apply the same identity restriction. The backend enforces the decision rule independently of these UI guards.

### Concessions and Collections table controls

Both workspaces use `CustomizableTable` with a contextual title, column filters, visible filter chips, server search/sorting/pagination, and sticky Status/Actions columns on the right.
Finance table headings are left aligned; numeric body cells may keep comparison alignment through `cellSx`.
The rightmost Actions column explicitly sets `align: 'left'`, `sticky: true`, and `stickyPosition: 'right'`, with no sorting, filtering, or export data.
Its controls align to the left inside that cell. Use `AdaptiveThreeDotsActions` with two direct actions and the remaining permitted operations in the overflow menu.
Payment terms and the legacy fee-structure list expose Columns, current-page Export, and Fullscreen. Their current list integrations support search and paging only; per-column filter/sort controls remain unavailable until the owning endpoint/query supports them.
The table's controlled `page` is zero-based, but `onServerPagination` reports one-based server pages. Collections and Charges pass that callback page directly to their API state; Concessions and Refunds subtract one for their zero-based state. This keeps Next and Previous from skipping records.
Student filters include the displayed GR number; Class/Division filters match the combined value, including division.
Money columns use raw balances for numeric comparisons and ranges, while displaying the shared INR format.
Concessions keeps the raw request timestamp for calendar-day filtering and renders exact lifecycle statuses; the Status choices belong to the active operational tab.
Changing a concession tab clears only the status filter and resets to page one; other filters and sorting survive.
Collections offers Pending, Paid, Overdue and No Fee Assigned, the statuses its summary read model can produce.
Query errors appear with Retry in the table region, and neither table applies filters only to the currently loaded page.
The shared Columns/Export/Fullscreen utilities remain available; table export reflects the loaded table rows and excludes Actions.

1. Inspect `src/app/(auth-route)/finance/charge-management/**`.
2. Inspect `src/screens/finance/ChargesManagement/**`.
3. Inspect `src/redux/finance/ChargeManagement/chargeApi.ts`.
4. Inspect `src/redux/finance/ChargeManagement/chargeMappers.ts`.
5. Confirm backend behavior in `../../../Shikshamitra-BE/docs/modules/finance/api.md`.

The current workspace creates and reviews charge batches, while Fee Collection collects approved student lines and displays charge receipts. It uses academic-year filters, exact action permissions, explicit audience modes, concurrency stamps and server pagination. Full paid-charge refund handling, audience preview/fingerprints and command idempotency remain follow-up work. Follow [Charge Management frontend flow](./references/charge-management-frontend-flow.md) for the current state, target interaction sequence and acceptance coverage.

## Trace collection and receipt changes

Fee collection and receipt flows span Finance and shared fee client folders.

The Receipts workspace opens on **All months** within the selected academic year,
board, and medium so a newly collected payment is visible regardless of the year's
starting month. The Month selector can narrow the list to a calendar month or return
to All months; changing the academic year clears that month filter. Month values follow
the [backend receipt contract](../../../Shikshamitra-BE/docs/modules/finance/api.md).
Filter changes reset server pagination. Successful fee collection invalidates the
shared Receipt cache tag so an already loaded receipt list refreshes.

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

1. Settings shows active and inactive types so historical configuration stays visible. The list and archived count wait for the selected academic year before sending requests, including on a direct first visit.
2. The form collects a Concession Type Name and document definitions with mandatory/optional, maximum file size, and accepted formats. New document rows start with backend defaults. Update shows matching name, document-row, and description skeletons while details load; the dialog header and Cancel/Update footer stay visible, with Update disabled until the record is ready. Failed detail requests offer Retry.
3. The server is authoritative for normalized-name uniqueness. Active types cannot be deleted. After deactivation, Delete is available only while the type is unused; used types remain undeletable and lock document-definition changes.
4. A new concession request lists active types only. Editing an existing request may resolve its inactive historical type.
5. Before upload, the shared upload control filters extensions and checks size; the concession upload API repeats extension, MIME, signature, and size validation. The backend expires unattached staged files after 24 hours. Saved evidence opens in the shared preview dialog through an authenticated request-scoped URL only when `ViewDocument` is granted.
6. Missing mandatory evidence blocks approval. Optional evidence is shown and uploadable but is not required.
7. Version History opens from each row's action menu in the same wide, read-only layout as Payment Terms: a searchable newest-first version sidebar, selected-version author/date/action, and a Field/Before/After comparison table. Missing field-level audit data remains explicitly identified. Fixed Back to details and Close actions preserve the table context.

### Concession request and approval

The concession request form follows the charge form's shared `FormSectionCard` layout: neutral section icons, heading help tooltips, responsive two-column academic fields, a scrollable body, and a stable action footer. Student information, fee assignment (when needed), concession details, fee heads, values, preview, and documents retain their existing conditional visibility and validation.

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

The create/edit drawer uses shared `FormSectionCard` sections for General Information and
Installment Schedule. Each installment has its sequence number outside its field card. Wide
drawers align the name, coverage dates, invoice date, due date, allocation and remove action in
one row; smaller drawers wrap to two columns, then one. Required field errors appear after
touch or submission, with live allocation-total feedback retained.

The read-only drawer follows the Concession Policy section-card layout, with General Information
and Installment Schedule sections, saved values, and section help. It omits the tab/context strip
and the redundant Displayed schedule heading. Use Version history in the schedule section or
the table's Version History action to inspect immutable snapshots; Back to details returns to
the record. General Information reuses the Concession Policy detail section and its bold uppercase
field labels. History reuses the policy version sidebar and Before/After table: versions are searchable
by version, author, date, or reason. Comparisons use recorded schedule snapshots only; term identity
and defaults are not retroactively attributed to older versions. Missing preceding snapshots are
explicitly identified. Saved version details expands the full snapshot and installment schedule.
Close remains available while loading.

After selecting a board, **Apply Template** configures the schedule preset, payment due-date rule, and invoice-date rule together.
Days Before Due appears only for the X-days rule and is limited by the shortest generated start-to-due gap; Generate preview stays disabled while that value is invalid.
For a specific invoice date, enter one date per generated installment within its start-to-due range before generating the final preview.
The preview shows each installment's start/end, due date, invoice date, and allocation; applying it replaces the local rows and invoice rule together after the replacement warning.
Changing dialog inputs invalidates the previous preview, and Cancel preserves the drawer's current schedule and rule.
The Installment Schedule includes compact invoice-rule controls for manual entry, alongside the link to Apply Template; there is no separate bottom Invoice Schedule section.
Create, Edit, and Duplicate use the same controls and validation; the selected invoice rule remains visible beside the schedule.
One schedule-level toggle controls invoice creation for every installment; manual and template-generated rows inherit its value.
The form labels the demand date as **Invoice Date** and the coverage range as **Installment Start-End Date** while preserving the existing save contract.

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

Invoice dates must be on or after both the installment start and selected board start, and on or before the payment due date. Historical dates remain allowed for backfilled terms. Days Before Due accepts whole days from 1 through the smallest start-to-due gap across all installments and identifies the limiting installment. The date picker, inline validation, and Submit readiness use these same bounds. Create, Edit, Duplicate, and applied templates revalidate immediately; Submit stays disabled until all form checks pass, with a tooltip explaining the correction needed.

The Payment Term editor follows the Collection Policy drawer: a bounded width on desktop, full width on mobile, one scrolling form body, and fixed Cancel/Submit actions. Name/status and description/default controls share rows on desktop and stack on mobile. Drawer and section guidance uses keyboard-accessible information tooltips. Default replacement and mapped-term impact stay beside the related fields; the auxiliary live summary and validation-checklist sidebar are omitted. Loading and saving lock the form and close actions with a progress overlay, and closing a changed form requires a discard decision.

The shared vertical navigation keeps every ancestor of the active page expanded, including Finance groups whose nesting differs from the URL structure. Clicking an active ancestor cannot hide the current page; unrelated groups can still be opened and closed. Direct access, reloads, and route changes use the same behavior across modules.

### Fee Structure policy defaults

When a new Fee Structure opens, the Policies form loads the academic year's Active Collection and Refund policies. It fills an untouched empty selection with that type's Default before the Policies tab is opened. Staff can choose a different policy; saved structures keep their explicit selections, including intentionally absent optional policies.

All four policy editors use the same Default control. A current Default explains why it cannot
be cleared or moved to Draft, and the archive action requires staff to designate a replacement
first. Default selection uses the policy's current immutable version; manual choices and explicit
clears are retained when lookups refresh. The backend owns the
[default invariant](../../../Shikshamitra-BE/docs/modules/finance/product.md).

### Collection Policy form

The create/edit drawer follows the Concession Policy form: a bounded desktop width,
full width on mobile, independently scrolling section cards, and fixed Cancel/Submit
actions. General information pairs name/status and description/default controls.
Drawer and section guidance is available through accessible information tooltips.
Status uses the shared dropdown with option help; late-fee selectors have associated
labels and consistent sentence-case field names.
Late-fee and online-collection switches support keyboard interaction. The selected
status still determines whether submission saves a draft or activates the policy.
Saving locks the form, close, and footer actions with a visible progress overlay;
unsaved changes retain the discard confirmation. The configuration form omits the
auxiliary live summary, illustrative payment simulation, and validation checklist.

### Proration Policy form

The Proration Policy editor uses the same bounded drawer, section cards, information
tooltips and fixed Cancel/Submit footer as Concession Policy. Name/status and
description/default controls share rows on desktop and stack on mobile. The form
body owns scrolling, with no summary or validation-checklist sidebar and no submit
shortcut. Fee-head admission and early-withdrawal settings remain independent;
presets and inline validation are retained. The permission-gated simulator remains
available for saved policies and uses the last saved version. Loading and saving
lock the form and close actions; unsaved changes retain the discard confirmation.

### Collection Policy history and audit

1. The row action menu exposes Audit Trail and Version History only when Collection Policy `View` is granted.
2. Both drawers lazily load the immutable Collection Policy version stream when opened.
3. Version History compares each snapshot with its predecessor and shows field-level changes, actor, timestamp, action, status, and reason when present.
4. Audit Trail presents those same immutable records as create, update, clone, archive, and unarchive lifecycle events, so policy audit evidence cannot drift from version history.

Collection and Concession use the same read-only audit drawer and date-grouped
activity cards. The bounded desktop drawer provides a wider comparison area and
becomes full width on mobile. Policy identity and activity count remain visible
while the timeline scrolls. Expanding an event shows its recorded reason and a
Before/After table; events without a diff state that no changes were recorded.

The version-history drawer uses a searchable snapshot list and a separate scrolling
comparison. Accessible info icons explain read-only history, the Latest badge,
recorded change reasons, and Before/After values. The selected version remains
visible when a search returns no matches, and clearing search restores the list.

### Concession Policy workspace

The Current policies and Archived tabs share a full-height table with server search and status
filtering. Values use the same concession labels in the table, form fields and detail view;
missing or invalid dates display `—`, and amounts use the shared Indian currency formatter.
Create/edit, details, audit and version drawers share a header and stable footer. The form body
owns scrolling, stacks fields on narrow screens and locks interaction while saving. Section
guidance uses accessible info tooltips. The form presents status once in the Status field;
read-only drawer status, version and Read Only metadata sit in a separate right-aligned header group.
Policy name and Status share a row; Description and the concise Set as default toggle
share the next row on wider screens. The create/edit form has a neutral Submit action, no
submit shortcut, and no policy-summary, balance-preview or completion-checklist sidebar.
Archive and restore use focused confirmations; restore returns a policy to Draft.

All four policy editors trim names and collapse repeated internal whitespace at the payload
boundary. Server duplicate-name rules appear inline under Policy name, retain entered values,
and explain that conflicts may exist in Current or Archived for the academic year. Row clones
omit a proposed name so the server can choose an available copy name across both lists.
Concession percentage and maximum-percentage entry preserves raw decimal text while typing,
allows up to two fractional digits, validates precision, and converts to numbers only on save.

Status, value source, calculation method and application scope use option info tooltips in the
menu and beside the selected value. Descriptive dropdown helper text is omitted; validation
errors stay inline. The four scope options are unchanged. Automatic refund creation is enabled
only for the scope including paid installments and is cleared when an unpaid scope is selected.
The approval impact panel describes automatic or manual refund creation. Approved student
request cards show the paid concession and creation mode; Refund Add permits the manual
creation action when the server reports eligibility. The mutation refreshes concession and
refund caches. Business rules and historical-version behavior are owned by the
[backend concession contract](../../../Shikshamitra-BE/docs/modules/finance/references/concession-policy-end-to-end.md).

Policy audit events are grouped by date, newest first, with expandable Before/After field
comparisons. Version history uses keyboard-accessible snapshot selection and identifies the
newest snapshot as Latest, independently of policy status. Both drawers use the same neutral
diff table, resolve policy and academic-year references to names, and offer retry on failure.
Apply On uses the form's exact labels for numeric, serialized and named snapshot values,
including All installments, including paid. Equivalent numeric/name representations do not
produce an Apply On change. Change/reason help opens beside its info control, and truncated
activity policy names expose the full name on pointer hover or keyboard focus.

Actual request eligibility and amounts remain server-owned. The offline
[verification fixture](../../e2e/fixtures/concession-policy/README.md)
mounts the actual components with synthetic data for responsive and lifecycle checks.

## Student fee assignment

The active assignment drawer, typed client, permissions, retries and verification fixture are documented in [Student fee assignment](./references/student-fee-assignment.md).

## Income, expense, and bank routing

The implemented selectors, retired Account Heads route, lookup permissions, cache updates, and rollout checks are documented in [Income, expense, and bank routing](./references/income-expense-routing.md).

## Variable fee structure assignment

See [variable fee assignment](./references/variable-fee-assignment.md) for the active fixed/variable and required/optional conditions.
Included variable heads require a student amount before preview and commit; skipped optional heads create no dues.

## Whole-rupee amount display

Collection policy numeric entry uses plain decimal text: exponent notation, signs,
extra digits and more than two fractional digits are rejected before storage.
Grace is 0–365 whole days; charging cutoffs and finite slab endpoints are 1–365.
Rates are 0.01–100%; amounts and optional ceilings are 0.01–999999. Empty ceilings
mean no limit. Slab days begin after grace, start at charging day 1 and must be
continuous without overlaps and within the configured cutoff; the last slab may
remain open-ended. Backend validation applies the same bounds on policy writes.
Invalid configuration blocks submission and simulation; excessive compound
results require a ceiling or shorter preview rather than displaying huge totals.
Closing a Finance policy or Payment Term editor ends its form session. Confirmed
discard restores defaults on Create and saved source values on Edit/Duplicate.

Collection, concession, refund and proration editors, fee-head overrides and policy details no longer show a selectable rounding field. The client sends the system RoundUp rule (RoundUpRupee for proration), and the server remains authoritative for amounts and caps. Shared monetary formatters round upward and show no decimal places, including receipts, library charges, admission payments, transport amounts and payroll displays. Percentages retain fractional precision.

Installment previews use server amounts: ordinary installments discard fractional shares and the last installment receives the remainder, preserving the rounded fee total. See the [backend monetary rules](../../../Shikshamitra-BE/docs/modules/finance/product.md#whole-rupee-monetary-rules) for calculation order, caps and historical compatibility.

The Fee Structure payment-term dialog shows every installment in sequence with aligned date,
allocation, and read-only INR amount columns. Its local amount preview uses the fixed fee-head
amount and current allocations with the same whole-rupee/remainder rule; it does not save amounts.
Incomplete or invalid allocations display an em dash until corrected. Variable fee amounts remain
`Calculated during assignment`. The footer stays reachable while the schedule scrolls, and changes
apply only to the owning Fee Structure; the published Payment Term is preserved.

## Income and Expenses workspaces

See [the workspace contract](./references/income-expense-workspaces.md) for separate registers, academic-year months, selected-record details, manual creation and automatic refund visibility.

## Finance form sessions and table actions

Finance tables show the first three permitted actions directly; only additional actions use the
more menu. Actions retain their disabled explanation when a required fee assignment is missing.
Collections supports Status sorting through the server query, before pagination. Collect Fees
is unavailable for an unassigned student, while assignment and view flows remain reachable.
Fee Adjustment is hidden from Collections row actions. The collection empty state fills and
centres in the available content area.

Finance editor Cancel, X and navigation share an in-app discard confirmation. Keeping changes
preserves the current form; discarding, successful submission or closing ends the form session.
Add starts with defaults, and Edit loads only the selected record. Saving locks navigation and
confirmation controls. Browser unload protection exists only while an open form is dirty.
Archive/delete confirmations ignore backdrop and Escape dismissal to preserve entered reasons.

Fee Category names collapse repeated whitespace before validation and saving. Duplicate errors
identify Current or Archived categories and explain restoration for archived conflicts. The API
repeats normalization and uniqueness checks. Payment Term generated-code conflicts appear at the
name field, preserve entered data, and use one error notification path. Payment Term codes are
unique within the academic year; changing Board alone does not resolve a code conflict.
