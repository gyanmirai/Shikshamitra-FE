---
module: finance
domain: clients
content_type: Reference
status: canonical
updated_on: 2026-07-06
owner: frontend-team
audience: humans-and-agents
---

# Find Finance frontend clients

TL;DR: Finance clients live mostly under `src/redux/finance/**`.
Several older fee and receipt surfaces still use shared clients outside that folder.

## Client map

Use this table to find the first integration file.

| Surface | Client source |
|---|---|
| Shared Finance API base | `src/redux/finance/financeModuleApi.ts` |
| Charges | `src/redux/finance/ChargeManagement/chargeApi.ts` |
| Charge mappers | `src/redux/finance/ChargeManagement/chargeMappers.ts` |
| Student charge grouping | `src/redux/finance/ChargeManagement/studentChargeDataApi.ts` |
| Concessions | `src/redux/finance/ConcessionManagement/**` |
| Adjustments | `src/redux/finance/adjustments/adjustmentApi.ts` |
| Audit Trail | `src/redux/finance/audit/financeAuditApi.ts` |
| Reconciliation | `src/redux/finance/reconciliation.ts` |
| Receipt Book | `src/redux/finance/receiptBookApi.ts` |
| Fee collection | `src/redux/feeCollection/**` |
| Invoice and receipt | `src/redux/invoiceAndReceipt/**` |
| Fee structure | `src/redux/finance/financeFeeStructure.tsx` |
| Categories and settings | `src/redux/finance/*Category*`, `src/redux/feeCategory/**`, and `src/redux/feeHeadManage/**` |

## Backend contract source

Backend Finance behavior is canonical in [Finance backend APIs](../../../Shikshamitra-BE/docs/modules/finance/api.md).
Confirm request and response behavior there before changing a client shape.

## Cache and mapper rules

Keep these rules when changing Finance clients.

| Rule | Reason |
|---|---|
| Normalize backend fields in mapper utilities | Screens should not duplicate DTO alias logic |
| Use exact query args for cache updates | Optimistic updates need the same cache key as the query |
| Keep mutation invalidation predictable | Financial records must refresh after status changes |
| Keep backend DTO changes as the fallback | Prefer frontend mappers unless the backend contract blocks correctness |
