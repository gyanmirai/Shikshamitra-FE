---
module: finance
domain: workflows
content_type: How-to
status: canonical
updated_on: 2026-07-06
owner: frontend-team
audience: humans-and-agents
---

# Trace Finance frontend workflows

TL;DR: trace Finance workflows from the menu route to the App Router page, then screen folder, client, mapper, and backend contract.
Use this page to pick the first files for common Finance changes.

## Trace charge management changes

Charge changes start at `/finance/charge-management`.

1. Inspect `src/app/(auth-route)/finance/charge-management/**`.
2. Inspect `src/screens/finance/ChargesManagement/**`.
3. Inspect `src/redux/finance/ChargeManagement/chargeApi.ts`.
4. Inspect `src/redux/finance/ChargeManagement/chargeMappers.ts`.
5. Confirm backend behavior in `../../../Shikshamitra-BE/docs/modules/finance/api.md`.

## Trace collection and receipt changes

Fee collection and receipt flows span Finance and shared fee client folders.

| Workflow | Inspect first |
|---|---|
| Fee collection | `src/app/(auth-route)/finance/fee-collection/**` and `src/redux/feeCollection/**` |
| Invoice and receipt | `src/app/(auth-route)/finance/invoice-receipt/**` and `src/redux/invoiceAndReceipt/**` |
| Receipt rendering | `src/screens/finance/viewReceipt/**` |

## Trace concession and adjustment changes

Concession and adjustment workflows should preserve approval and audit behavior.

| Workflow | Inspect first |
|---|---|
| Concessions | `src/screens/finance/Concession/**`, `src/screens/finance/ConcessionAdmin/**`, and `src/redux/finance/ConcessionManagement/**` |
| Adjustments | `src/screens/finance/adjustments/**` and `src/redux/finance/adjustments/adjustmentApi.ts` |
| Audit Trail | `src/screens/finance/AuditTrail/**` and `src/redux/finance/audit/financeAuditApi.ts` |

## Trace settings changes

Finance settings routes are split across fees and accounts.
Use `src/constants/finance-menu.ts` to confirm active visibility before changing navigation.
