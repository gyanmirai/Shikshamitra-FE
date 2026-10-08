---
module: finance
domain: admin-request-auto-approval-ui
content_type: Reference
status: active
updated_on: 2026-10-07
owner: frontend-team
audience: humans-and-agents
---

# Admin request confirmation: frontend design

The [backend contract](../../../../Shikshamitra-BE/docs/modules/finance/references/admin-request-auto-approval-contract.md) owns who qualifies as an administrator, the exact permissions, final state, and monetary side effects. This document owns the interaction in the existing refund, charge, and concession forms.

## Affected screens

| Flow | Current owner | Admin submission change |
| --- | --- | --- |
| Refund | `src/screens/finance/feeRefund/NewRefundForm/RefundForm.tsx` | After form validation and a fresh refund preview, show a final confirmation with student, academic year, receipt, requested amount, method, and approved-request outcome. |
| Charge | `src/screens/finance/ChargesManagement/Components/UpdateChargeForm/UpdateChargeForm.tsx` | Require a valid charge category before submission. After validation and student-audience resolution, show charge name/category, amount **per student**, resolved student count and total, due date, and approved-line outcome. Keep the existing all-scope audience confirmation as an earlier step; never stack dialogs. |
| Concession | `src/screens/finance/Concession/Components/ConcessionRequestForm.tsx` | After validation and fresh preview, show student, academic year, type, total concession, affected dues, and whether the pinned policy creates linked refund requests. State that the concession will affect dues immediately. |

Use the shared `ConfirmDialog` with a compact list of actual values, `Keep editing` and `Create and approve` (or `Submit and approve` for a draft). The message must say: **“This request will be approved automatically when you confirm.”** For refunds add: **“Approval does not send the payout; payout is recorded separately.”** For concessions with paid amounts, explain that any linked refund request follows its own approval workflow. Do not describe a charge's per-student amount as the batch total.

Only a create/submit action opens this dialog. Draft save and ordinary edit keep their current interactions. Non-admins see the existing submission flow and copy. On an admin response show the returned `Approved` status, move the row into the correct list tab, and invalidate the same RTK Query tags that explicit approval invalidates. Do not optimistically display Approved before the server responds.

## Gating and request sequence

1. Read the current session's role claims only to decide whether to **show** the admin confirmation. The shared client helper recognizes the current `admin` and `super-admin` roles. Deployments that extend the server's administrator role configuration must expose the same eligibility to the frontend before those roles use this flow. The backend is authoritative if session data is stale. Never send `isAdmin` or `autoApprove` from the browser.
2. Resolve the exact create/submit and approve permissions before offering the admin action. If the role qualifies but approve permission is absent, show an explicit permission explanation and do not send a create request that the server will reject. Other roles retain their normal create/submit permission behavior.
3. Run Formik/Yup validation and the current server preview before opening the confirmation. Build a snapshot of the reviewed payload and preview fingerprint. On any field, year, student selection, document, or audience change, close/clear that snapshot; require a new preview and confirmation.
4. The confirmation action sends **one** create or submit mutation. Disable double-click and dismissal while loading. Preserve the idempotency key for retry after an uncertain network result. Closing or cancelling sends no mutation and keeps entered values.
5. Render the server-returned status and error. If validation or approval fails, close the confirmation, keep the form, and show a specific recovery message. A stale preview requires a fresh review. Do not claim success or navigate away on a pending response.

Charge creation sends the charge category, amount, due date, and audience. The backend resolves the income mapping from Charge Category settings. The charge form does not ask for an income category or receiving bank account. A bank account is selected with a non-cash payment at collection time.

## UX/accessibility checks

- ConfirmDialog opens with a clear title and readable amount, currency, student and request details. Focus and keyboard actions are accessible; backdrop dismissal is disabled during the decision.
- The admin-only dialog never appears for ordinary roles, including users who hold `Approve` but are not configured administrators.
- All-scope charge audience changes after first review force a new count and total review.
- Refund approval wording never implies payment has been made.
- Concession preview and linked-refund wording reflect the pinned policy. A failed or unavailable preview prevents submission.
- Successful response moves the request out of Pending; failed response retains form values and gives a retry route.
