---
module: finance
domain: clients
content_type: Reference
status: canonical
updated_on: 2026-10-29
owner: frontend-team
audience: humans-and-agents
---

# Find Finance frontend clients

## Inline feedback

`src/theme/module-feedback-styles.tsx` applies the shared Finance alert appearance to
`/finance` and its child routes, including portalled dialogs and drawers. Existing MUI
`Alert` messages use a paper background, divider border, neutral text, compact padding,
and a severity-colored icon. Render the message directly without adding generic
Info/Warning/Error/Success headings. Preserve meaningful issue titles, alert semantics,
and recovery actions. Toasts retain their shared styling.

## Bank account activity

The bank-account list waits for the selected academic year before fetching.
Its GET request has a 30-second timeout; failures use the shared table error
and Retry action. Same-year refreshes retain the current rows with refresh
progress instead of replacing the table with initial-loading skeletons.
Activity selection uses the native History API for local URL state. Academic-year
hydration does not navigate the route; an actual year change clears the selected
account without reloading the page.

`src/redux/finance/BankAccountManage/bankAccountActivityApi.ts` injects typed
activity, deposit, movement-detail and complete-export operations into the
existing Finance API. `BankAccountActivityDrawer.tsx` reads `currentData` only
for the selected bank and academic year. Credit and Debit request incoming and
outgoing activity respectively; cash credits remain in Credit. Each tab keeps
independent search, column filters, sorting and pagination and shares the date
period. Pending amounts and cash in transit remain separate from recorded credit.
Exports send the selected direction's normalized query and
visible column order to the server, rather than exporting the loaded page.
Bank, income, expense, cash, collection, refund and reconciliation tags refresh
the projection after owning mutations; returning to the drawer refetches it.
The [backend Finance API](../../../Shikshamitra-BE/docs/modules/finance/api.md)
owns permissions, monetary sources and historical-attribution limitations.

`feeStructureWorkspace.ts` exposes `useGetStructureCopyPoliciesQuery` for the scoped
`GET /fee-structures/{sourceId}/copy-policies` preflight. The copy form sends returned
current snapshot IDs through the existing draft-create mutation, which revalidates them.
See the [backend contract](../../../Shikshamitra-BE/docs/modules/finance/api.md#fee-structure-copy-policy-preflight).
Reconciliation rows expose nullable `paymentDate`; the DD table prefers the saved instrument
payment date and uses the recorded collection date for legacy instruments.

Bank Transfer reconciliation reads the stored `transactionReferenceNumber`, `transferDate`
and `accountHolderName` from `instrumentDetails` and the masked `bankLabel` snapshot.
It does not substitute receipt creation time for a missing transfer date.
Collection retains the form's `transactionId` key, accepted by the backend compatibility mapper.
Receipt details expose `paymentInstruments`; receipt previews use the server-generated PDF.
See [bank transfer evidence](../../../Shikshamitra-BE/docs/modules/finance/api.md#bank-transfer-evidence).

Admission collection responses and Records withdrawal preview rows share the output-only `src/redux/finance/fee-proration-result.ts` type. Existing Admission collection queries read/prepare the result. Existing transition mutations invalidate affected Finance owner caches after applied withdrawal or correction. Fee ledger line types expose a separate withdrawal-credit amount/explanation. No new Student route or policy mutation is introduced.

Refund eligibility and request types in `src/redux/finance/RefundManagement/feeRefundManage.ts`
support the separate **Paid charges** and **Paid late fees** groups with distinct selection keys. `FeeHeadRefundTable` preserves the charge/payment/
receipt references when selecting one row or a whole group. `buildFeeRefundApiPayload` sends
`chargeId` for charge payments, `lateFeeDueFeeId` for late-fee payments, and `dueFeeId` for fee dues; all use the existing receipt selection
restriction. Replacement hydration and the refund detail table retain charge names and amounts.
When the policy requires the whole receipt, the client preserves all selected source amounts
and lets the server apportion any policy cap, including sources whose payout share rounds to zero.
See the [backend contract](../../../Shikshamitra-BE/docs/modules/finance/api.md#paid-charges-in-refund-requests).
Focused checks: `RefundSelection.test.tsx` and `RefundForm.test.tsx` in the refund form folder.

Collection Policy forms, summaries and saved details use calendar days for the grace period.
Create/update and fee-head override requests omit `gracePeriodType`; the calculation selector has been removed.
See the [backend policy contract](../../../Shikshamitra-BE/docs/modules/finance/api.md) for legacy snapshot compatibility.

Collection Policy create/update/clone/read/version responses carry `allocationBasis`; no priority
list is sent. `src/redux/feeCollection/feeCollection.ts` types the collect form's resolved basis,
policy identity/version, ordered due IDs and opaque revision. Student and Admission collection
share `automaticAllocation: { revision, dueFeeIds, chargeIds }`, including unfunded selected dues.
The server recalculates money and rejects stale or altered allocations. See the
[backend contract](../../../Shikshamitra-BE/docs/modules/finance/api.md#automatic-collection-allocation).

TL;DR: Finance clients live mostly under `src/redux/finance/**`.
Several older fee and receipt surfaces still use shared clients outside that folder.

Charge Category deletion uses `useLazyGetChargeCategoryUsageQuery` in
`src/redux/finance/chargeCategory.tsx` for a fresh dependency preflight. The confirmation stays
open while checking or deleting, blocks unknown usage, and shows the category name, charge count,
student assignment count and permitted charge names when used. Review charges opens Charges
Management for callers with Charges View; unused categories require an explicit Delete action.
`Finance:Charge:010028` refreshes usage after a dependency appears between check and confirmation.
See the [backend deletion contract](../../../Shikshamitra-BE/docs/modules/finance/api.md).

Active Fee Structure editor, typed client and browser checks: [workspace implementation](./references/fee-structure-workspace.md).

## Client map

Use this table to find the first integration file.

| Surface                 | Client source                                                                                                                 |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Shared Finance API base | `src/redux/finance/financeModuleApi.ts`                                                                                       |
| Charges                 | `src/redux/finance/ChargeManagement/chargeApi.ts`                                                                             |
| Charge mappers          | `src/redux/finance/ChargeManagement/chargeMappers.ts`                                                                         |
| Student charge grouping | Charge line endpoint in `src/redux/finance/ChargeManagement/chargeApi.ts`; `studentChargeDataApi.ts` is obsolete/comment-only |
| Concessions             | `src/redux/finance/ConcessionManagement/**`                                                                                   |
| Adjustments             | `src/redux/finance/adjustments/adjustmentApi.ts`                                                                              |
| Audit Trail             | `src/redux/finance/audit/financeAuditApi.ts`                                                                                  |
| Reconciliation          | `src/redux/finance/reconciliation.ts`                                                                                         |
| Accounts Activity       | `src/redux/finance/accountsActivityApi.ts`                                                                                     |
| Receipt Book            | `src/redux/finance/receiptBookApi.ts`                                                                                         |
| Fee collection          | `src/redux/feeCollection/**`                                                                                                  |
| Direct charge/late-fee waiver | `src/redux/feeCollection/feeCollection.ts`                                                                                    |
| Invoice and receipt     | `src/redux/invoiceAndReceipt/**`                                                                                              |
| Fee structure           | `src/redux/finance/financeFeeStructure.tsx`                                                                                   |
| Fee categories          | `src/redux/feeCategory/feeCategoryApi.ts`                                                                                     |
| Payment terms           | `src/redux/finance/paymentTerm.tsx`                                                                                           |
| Collection policies     | `src/redux/finance/collectionPolicy.ts`                                                                                       |
| Concession Types        | `src/redux/finance/concessionType.ts`                                                                                         |
| Categories and settings | `src/redux/finance/*Category*`, `src/redux/feeCategory/**`, and `src/redux/feeHeadManage/**`                                  |

Fee-head module options are defined by the numeric `FeeHeadModule` enum in `src/redux/feeHeadModule/feeHeadModuleApi.ts`. Fee-category and fee-head clients send the selected number, or `null` when no module is selected, so create and edit forms use the same value type as backend responses. Both Fee Head entry surfaces load active Income Categories for the selected academic year and send the required `incomeCategoryId`. Lists and details show the Income Category; used Fee Heads keep this selector locked. Account Head selectors are retired.

Collections owns academic filter state in `FeeCollection/index.tsx` and passes it to its table. `useFinanceAcademicFilters` subscribes to standards by medium and uses `currentData`, so changing class/division or returning from a student view does not force another standards request or reuse another medium's options. Selecting a division preserves the class; changing a class clears only its division, and changing board, medium, or academic year clears both. Refreshing the same valid academic year preserves selections. The collection request and visible paginator switch to page 1 together when academic filters change, avoiding a request for the old page in the new scope.

Payment Term create/update requests send `status` as `Draft` or `Active`. The client does not collect or send a version-effective date; when `Active` is submitted, the backend derives the next valid activation date inside the board period and publishes that version in the same unit of work. Board list responses provide `startDate` and `endDate`, which are the UI and API validation boundaries for installment periods. Payment-term responses use named enum values; the API client also normalizes legacy numeric enum responses at the boundary so form controls and derived bill-generation dates receive one stable string contract.

The installment-template dialog calls `POST /finance/payment-terms/templates/preview` with the selected board, preset, due-date choice, and dialog invoice rule (`demandGenerationRule` / `demandOffsetDays`).
For `SpecificDate`, `specificDemandDates` supplies calendar dates in installment sequence order.
The dialog first obtains server-generated period boundaries to validate offsets and specific dates, then presents the complete server-generated schedule before applying it.
Applying updates the local Formik rows and invoice rule together; the ordinary create/update request remains the persistence boundary and the backend revalidates the full schedule.

Invoice creation is controlled once for the complete payment-term schedule. The editor synchronizes that choice to every installment's `demandEnabled` field, and manual or template-generated installments inherit the current choice.

The Payment Terms workspace selects an Education Board at the top and sends its `boardId` when querying one paged master-record list with `includeArchived: true` and no fixed status. Its Status column presents one user-facing lifecycle value only: `Draft`, `Active`, or `Archived`; version lifecycle fields remain internal to version history and assignment checks. Draft terms are activated from the row actions through `POST /finance/payment-terms/{paymentTermId}/versions/{versionId}/publish`, and the Status column has no toggle. Archived terms remain in the same table; restoring preserves the underlying version state, so their status becomes Draft or Active. Details come from `GET /finance/payment-terms/{paymentTermId}`; the audit-style history table lazily queries `GET /finance/payment-terms/{paymentTermId}/versions` when its drawer tab opens. The Default chip is shown in the Status column. Only an Active term can be selected as default, and create/update requests that select a new default atomically clear the previous default for the same board. Other boards retain their own defaults. Draft and Archived terms cannot retain the flag; there is no standalone set-default endpoint.

The Concession Type settings client includes inactive records for administration and history, while the request form receives active types only for new requests. The row action menu loads audit-backed history from `GET /concession-types/{id}/versions`. Delete is shown only for inactive, unused records. Its document contract uses `maxFileSizeBytes`, `acceptedFormats`, and `isRequired`. New document rows use local defaults of 5 MB and PDF/JPG/JPEG/PNG, so opening the form does not make a defaults request. Supporting files use the concession-scoped multipart upload endpoint in `ConcessionManagement/concessionManagementApi.ts`, which returns an opaque uploader-owned staged URL. The UI renders the shared `UploadButton` and `DocumentPreviewDialog`; saved evidence preview uses the authenticated request-scoped download route and is gated by `ViewDocument`.

`ConcessionManagement/concessionManagementApi.ts` is the single concession-request client. It owns typed context, calculation preview, draft, submit, detail, evidence, list, approval context/preview, approve, reject, withdraw, delete-draft, reversal preview, and reversal endpoints. Context responses may require an explicit fee-assignment selection before active concession policies and types become available. The form selects one active policy and sends its exact version on preview/draft/create/update; the policy is not selected in Fee Structure. Submit and approve send the latest server fingerprint; existing-request commands send the request stamp, approval and reversal lines send due-row stamps, and mutations retain one idempotency key for retries of the same logical action. Detail and list contracts include server-derived available actions, while detail/student views include timeline entries. The client invalidates concession request, posting, and account views after balance-changing actions. The retired duplicate `concessionRequestApi.ts` client must not be restored.

Collection Policy Version History and its policy-specific Audit Trail both lazily query `GET /finance/collection-policies/{id}/versions`. The immutable version stream is the canonical source for create, edit, clone, archive, and unarchive events; the UI renders the same records either as field-level version diffs or as a lifecycle audit timeline. Both row actions require the Collection Policy `ViewVersions` permission.

The Charge Management client uses typed core contracts, sends academic year and server paging/search, and accepts batch workflow filters 0..3. List and detail consume `workflowStatus` rather than treating the stored approval `status` as the lifecycle. The four tab counts come from the server. Approval/rejection/void invalidates charge and collection details; collection/waiver and reconciliation decisions invalidate charge lists/details. Full timeline, preview/fingerprint, create idempotency and paid-charge correction contracts remain gaps. The route/client consolidation and cache requirements are in [Charge Management frontend flow](./references/charge-management-frontend-flow.md).

## Backend contract source

Income Categories, Expense Categories, and Bank Accounts are independent masters. Account Heads editors and lookups have been retired. Workflow selectors use `src/redux/finance/financeRoutingApi.ts` and `FinanceRoutingFields`, with the owning operation's permission and selected academic year. Options expose category labels and masked bank labels. Collection and refund changes invalidate the related Income/Expense register tags.

The routing client normalizes bank labels once with `bankAccountOptionLabel.ts` before
storing lookup results, so collection dropdowns, selected values, and payment review
receive the same safe display text.
Canonical server labels retain their masked identifier; delimited missing-value tokens
are omitted, with compatibility fallbacks to `maskedAccountNumber` or
`accountHolderName` when supplied.
Bank-only labels also include an available masked identifier or account holder name.
The mapper never reads a full account number and never changes the bank-account ID.

Fee Collection resolves selection months from the selected academic year's
server-provided `startDate` and `endDate`.
The existing academic-month lookup remains a compatibility path for older context
responses without dates; collectors with dated context do not need Fee Structure
settings access to use the six-month selection controls.
Preset and manual selections retain separate ownership, so removing a preset preserves
rows selected manually or by another preset. Completed ledger refreshes reconcile existing
selections with current collectible rows: paid/missing items are removed and reduced
balances replace stale amounts. Refreshing never adds newly arrived obligations to checkout.

Income/Expense manual entry forms send category IDs, and the backend validates active categories of the correct type. Source-linked automatic entries cannot be edited or deleted through those forms. General Accounts journal posting remains unavailable.

Focused coverage: `src/screens/finance/settings/account-settings-forms.test.ts` and `src/screens/finance/ChargesManagement/Components/UpdateChargeForm/UpdateChargeValidation.test.ts`. See [Income, expense, and bank routing](./references/income-expense-routing.md) for the implemented contracts and rollout checks.

The current late-fee waiver client owns the scoped paged queue, due-line history, request, approve, and reason-bearing reject operations.
The approved but unshipped target removes that queue and approval client, and neither Collection Policy nor Charge Management exposes waiver settings.
Fee Collection receives server-derived `canWaive` actions and uses one reason-only command that applies the full live remaining balance for an eligible late fee or approved charge as described in [Fee Collection waiver end to end](../../../Shikshamitra-BE/docs/modules/finance/references/fee-collection-waiver-end-to-end.md).

Backend Finance behavior is canonical in [Finance backend APIs](../../../Shikshamitra-BE/docs/modules/finance/api.md).
Confirm request and response behavior there before changing a client shape.

## Cache and mapper rules

Keep these rules when changing Finance clients.

| Rule                                         | Reason                                                                 |
| -------------------------------------------- | ---------------------------------------------------------------------- |
| Normalize backend fields in mapper utilities | Screens should not duplicate DTO alias logic                           |
| Use exact query args for cache updates       | Optimistic updates need the same cache key as the query                |
| Keep mutation invalidation predictable       | Financial records must refresh after status changes                    |
| Keep backend DTO changes as the fallback     | Prefer frontend mappers unless the backend contract blocks correctness |

## Student fee assignment

The active assignment drawer, typed client, permissions, retries and verification fixture are documented in [Student fee assignment](./references/student-fee-assignment.md).

## Income, expense, and bank routing

The implemented selectors, retired Account Heads route, lookup permissions, cache updates, and rollout checks are documented in [Income, expense, and bank routing](./references/income-expense-routing.md).

## Cash Management client

Cash Management uses `src/redux/finance/cashManagementApi.ts` for list/detail, action-owned options, approval, deposit dispatch and bank-credit confirmation. The register form reads year-wide cash options with operation `expense` to show pooled availability and block amounts above that balance; cash expense requests omit the source receipt, source concurrency stamp and payment reference. The backend allocates the expense against available cash. Collection and cash mutations invalidate the Cash Management and affected register tags. See [cash client and retry behavior](./references/cash-management.md).

Cash expense forms request category options with routing operation `cash-expense`; other payment methods retain `expense-entry` and the existing optional payment reference. The cash category response contains no bank accounts and does not require Cash Management View or bank-settings access.

Expense cash options contain only positive pending balances. Approval submits `countedAmount` equal to the current `remainingAmount`, including zero; original `amount` and `spentAmount` remain display evidence. The unchanged approval endpoint finalizes the net bank deposit and Income, while legacy deposit/credit endpoints remain available through server capability flags.

## Separate Accounts register client

`src/redux/finance/accountsActivityApi.ts` owns direction/month/year/category/search/paging, selected-record details and manual creation.
`src/redux/finance/financeRoutingApi.ts` adds income-entry and expense-entry operations with owning Add permissions.
Manual requests include payer/payee and a stable UUID idempotency key retained on retry. Noncash requests include bankAccountId and the optional paymentReference; cash expense requests omit both bank routing and payment reference.
Register list/detail queries subscribe to Income, Expense, Fee Collection and Fee Refund cache tags.
Use [the workspace contract](./references/income-expense-workspaces.md) for UI behavior and backend ownership.

## Receipt lifecycle client fields

Reconciliation list queries for every payment method wait until `queryParams.academicYearId` is available, matching the tab-count query guard. Initial academic-year hydration must not send an empty GUID to the API; selecting another year or month resumes querying with that scope.

The feeReceiptApi list/detail contract adds paymentMethodLabel and pdfFileName. ReceiptPreviewDialog displays the method and downloads the authenticated PDF blob using pdfFileName. Receipt kind enum values remain unchanged; display labels use Provisional Receipt / Official Receipt. The combined document label is supplied by the backend. Reconciliation approve/reject mutations invalidate receiptType.receipt. Tab counts still include cashOfficial in the API contract; the Reconciliation screen renders only non-cash tabs and falls back to Cheque for unsupported tab parameters.

Reconciliation PDF downloads also use `/v1/fee-receipts/{id}/pdf`. The mutation returns `{ blob, fileName }`; `fileName` comes from the exposed Content-Disposition header (UTF-8 filename preferred). Approved rows select the linked official receipt ID, and their preview displays the official number.

Collection PDF downloads use that same endpoint for both `feeReceiptId` and `chargeReceiptId`;
receipt scope does not select a separate charge-receipts API. Each preview tracks its own
loading/failure state and retries only the PDF GET. Collection, receipt and refresh errors are
handled in their owning regions so a PDF failure cannot report the accepted payment as failed.
