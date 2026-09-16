---
module: finance
domain: clients
content_type: Reference
status: canonical
updated_on: 2026-09-15
owner: frontend-team
audience: humans-and-agents
---

# Find Finance frontend clients

TL;DR: Finance clients live mostly under `src/redux/finance/**`.
Several older fee and receipt surfaces still use shared clients outside that folder.

Active Fee Structure editor, typed client and browser checks: [workspace implementation](./references/fee-structure-workspace.md).

## Client map

Use this table to find the first integration file.

| Surface                 | Client source                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| Shared Finance API base | `src/redux/finance/financeModuleApi.ts`                                                      |
| Charges                 | `src/redux/finance/ChargeManagement/chargeApi.ts`                                            |
| Charge mappers          | `src/redux/finance/ChargeManagement/chargeMappers.ts`                                        |
| Student charge grouping | `src/redux/finance/ChargeManagement/studentChargeDataApi.ts`                                 |
| Concessions             | `src/redux/finance/ConcessionManagement/**`                                                  |
| Adjustments             | `src/redux/finance/adjustments/adjustmentApi.ts`                                             |
| Audit Trail             | `src/redux/finance/audit/financeAuditApi.ts`                                                 |
| Reconciliation          | `src/redux/finance/reconciliation.ts`                                                        |
| Receipt Book            | `src/redux/finance/receiptBookApi.ts`                                                        |
| Fee collection          | `src/redux/feeCollection/**`                                                                 |
| Invoice and receipt     | `src/redux/invoiceAndReceipt/**`                                                             |
| Fee structure           | `src/redux/finance/financeFeeStructure.tsx`                                                  |
| Payment terms           | `src/redux/finance/paymentTerm.tsx`                                                          |
| Collection policies     | `src/redux/finance/collectionPolicy.ts`                                                      |
| Concession Types        | `src/redux/finance/concessionType.ts`                                                        |
| Categories and settings | `src/redux/finance/*Category*`, `src/redux/feeCategory/**`, and `src/redux/feeHeadManage/**` |

Fee-head module options are defined by the numeric `FeeHeadModule` enum in `src/redux/feeHeadModule/feeHeadModuleApi.ts`. Fee-category and fee-head clients send the selected number, or `null` when no module is selected, so create and edit forms use the same value type as backend responses. Both Fee Head entry surfaces load active Income Categories for the selected academic year and send the required `incomeCategoryId`. Lists and details show the category together with its server-resolved default Income Account Head; used Fee Heads keep this selector locked.

Payment Term create/update requests send `status` as `Draft` or `Active`. The client does not collect or send a version-effective date; when `Active` is submitted, the backend derives the next valid activation date inside the board period and publishes that version in the same unit of work. Board list responses provide `startDate` and `endDate`, which are the UI and API validation boundaries for installment periods. Payment-term responses use named enum values; the API client also normalizes legacy numeric enum responses at the boundary so form controls and derived bill-generation dates receive one stable string contract.

The Payment Terms workspace queries the paged list separately for current and archived master records. Its Status column presents one user-facing lifecycle value only: `Draft`, `Active`, or `Archived`; version lifecycle fields remain internal to version history and assignment checks. Draft terms are activated from the row actions through `POST /finance/payment-terms/{paymentTermId}/versions/{versionId}/publish`, and the Status column has no toggle. Archiving moves a term to the Archived tab; restoring preserves the underlying version state, so the term returns to the Current tab as Draft or Active. Details come from `GET /finance/payment-terms/{paymentTermId}`; the audit-style history table lazily queries `GET /finance/payment-terms/{paymentTermId}/versions` when its drawer tab opens. The Default chip is shown in the Status column, and default selection remains part of create/update-draft requests, where the backend clears the previous board/year default atomically; there is no standalone set-default endpoint. An existing default cannot be cleared directly in its editor; selecting another payment term as default replaces it.

The Concession Type settings client includes inactive records for administration and history, while the request form receives active types only for new requests. The row action menu loads audit-backed history from `GET /concession-types/{id}/versions`. Delete is shown only for inactive, unused records. Its document contract uses `maxFileSizeBytes`, `acceptedFormats`, and `isRequired`. New document rows use local defaults of 5 MB and PDF/JPG/JPEG/PNG, so opening the form does not make a defaults request. Supporting files use the concession-scoped multipart upload endpoint in `ConcessionManagement/concessionManagementApi.ts`, which returns an opaque uploader-owned staged URL. The UI renders the shared `UploadButton` and `DocumentPreviewDialog`; saved evidence preview uses the authenticated request-scoped download route and is gated by `ViewDocument`.

`ConcessionManagement/concessionManagementApi.ts` is the single concession-request client. It owns typed context, calculation preview, draft, submit, detail, evidence, list, approval context/preview, approve, reject, withdraw, delete-draft, reversal preview, and reversal endpoints. Context responses may require an explicit fee-assignment selection before types and policy data become available. Submit and approve send the latest server fingerprint; existing-request commands send the request stamp, approval and reversal lines send due-row stamps, and mutations retain one idempotency key for retries of the same logical action. Detail and list contracts include server-derived available actions, while detail/student views include timeline entries. The client invalidates concession request, posting, and account views after balance-changing actions. The retired duplicate `concessionRequestApi.ts` client must not be restored.

Collection Policy Version History and its policy-specific Audit Trail both lazily query `GET /finance/collection-policies/{id}/versions`. The immutable version stream is the canonical source for create, edit, clone, archive, and unarchive events; the UI renders the same records either as field-level version diffs or as a lifecycle audit timeline. Both row actions require the Collection Policy `ViewVersions` permission.

## Backend contract source

Account Head lookups use `src/hooks/useAccountHeadOptions.ts` and `src/redux/finance/accountHeadApi.ts`.
The hook waits for permission initialization and a selected academic year, and exposes permission/API failures separately from empty results. Master and bank selectors require Account Head View. Income and Expense Category forms pass `categoryType` and use their own `/income-categories/account-head-options` or `/expense-categories/account-head-options` endpoint with the corresponding category Add or Edit permission. Options display account names and filter by type and active status.
It uses current query data so switching academic years cannot reuse another year's account options.
`src/screens/security/role/account-settings-permissions.ts` maps Accounts menu `.View` gates back to their action base for the role editor.
The editor exposes View, Add, Edit, Change Status and Delete only when defined by the server, and warns when an older catalog omits Accounts settings actions.
Account Head forms and contracts omit code, currency, direct-posting/control toggles, and effective dates. Both category forms omit code and effective dates; the server owns legacy category metadata. A category's default-head selector is enabled for permitted creation and unused-category editing. Used categories retain the server mapping lock and show an explanation. These changes require the matching backend release and migration described in the [backend API guide](../../../Shikshamitra-BE/docs/modules/finance/api.md).

Focused coverage: `src/hooks/useAccountHeadOptions.test.ts`, `src/screens/finance/settings/account-settings-forms.test.ts`, `src/screens/security/role/account-settings-permissions.test.ts`, and `src/screens/security/role/permission-node.test.tsx`.

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
