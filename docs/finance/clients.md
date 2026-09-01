---
module: finance
domain: clients
content_type: Reference
status: canonical
updated_on: 2026-09-01
owner: frontend-team
audience: humans-and-agents
---

# Find Finance frontend clients

TL;DR: Finance clients live mostly under `src/redux/finance/**`.
Several older fee and receipt surfaces still use shared clients outside that folder.

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
| Categories and settings | `src/redux/finance/*Category*`, `src/redux/feeCategory/**`, and `src/redux/feeHeadManage/**` |

Fee-head module options are defined by the numeric `FeeHeadModule` enum in `src/redux/feeHeadModule/feeHeadModuleApi.ts`. Fee-category and fee-head clients send the selected number, or `null` when no module is selected, so create and edit forms use the same value type as backend responses.

Payment Term create/update requests send `status` as `Draft` or `Active`. The client does not collect or send a version-effective date; when `Active` is submitted, the backend derives the next valid activation date inside the board period and publishes that version in the same unit of work. Board list responses provide `startDate` and `endDate`, which are the UI and API validation boundaries for installment periods. Payment-term responses use named enum values; the API client also normalizes legacy numeric enum responses at the boundary so form controls and derived bill-generation dates receive one stable string contract.

The Payment Terms workspace queries the paged list separately for current and archived master records. Its Status column presents one user-facing lifecycle value only: `Draft`, `Active`, or `Archived`; version lifecycle fields remain internal to version history and assignment checks. Draft terms are activated from the row actions through `POST /finance/payment-terms/{paymentTermId}/versions/{versionId}/publish`, and the Status column has no toggle. Archiving moves a term to the Archived tab; restoring preserves the underlying version state, so the term returns to the Current tab as Draft or Active. Details come from `GET /finance/payment-terms/{paymentTermId}`; the audit-style history table lazily queries `GET /finance/payment-terms/{paymentTermId}/versions` when its drawer tab opens. The Default chip is shown in the Status column, and default selection remains part of create/update-draft requests, where the backend clears the previous board/year default atomically; there is no standalone set-default endpoint. An existing default cannot be cleared directly in its editor; selecting another payment term as default replaces it.

## Backend contract source

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
