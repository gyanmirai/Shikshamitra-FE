---
module: finance
domain: workflows
content_type: How-to
status: canonical
updated_on: 2026-09-01
owner: frontend-team
audience: humans-and-agents
---

## Shared permission editing

The original [Security editor layout](../security/workflows.md) is retained, with complete catalogue coverage and independent action toggles.
Do not enumerate grants from a fixed CRUD list, infer action bundles, or restore revoked access through reseeding.
The backend [security standard](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/common/security/permission-consistency.md) owns authorization and approved repair rules.
Existing backend operations that share one permission identifier remain one capability until a separately approved domain change.

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

| Workflow            | Inspect first                                                                          |
| ------------------- | -------------------------------------------------------------------------------------- |
| Fee collection      | `src/app/(auth-route)/finance/fee-collection/**` and `src/redux/feeCollection/**`      |
| Invoice and receipt | `src/app/(auth-route)/finance/invoice-receipt/**` and `src/redux/invoiceAndReceipt/**` |
| Receipt rendering   | `src/screens/finance/viewReceipt/**`                                                   |

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
5. Before upload, the UI filters extensions and checks size; the concession upload API repeats extension, MIME, signature, and size validation.
6. Missing mandatory evidence blocks approval. Optional evidence is shown and uploadable but is not required.
7. Version History is available from each row's action menu and shows the audited create, edit, and status changes with actor, timestamp, and changed fields.

## Trace settings changes

Finance settings routes are split across fees and accounts.
Use `src/constants/finance-menu.ts` to confirm active visibility before changing navigation.

### Payment Term lifecycle

1. The drawer exposes the same editable lifecycle as HR Attendance Policy: `Draft` or `Active`. Archive remains a separate guarded action.
2. Saving as `Draft` keeps the schedule unassignable. Saving as `Active` atomically publishes an immutable version; the backend derives its activation date inside the selected board period.
3. Every installment period and due date must be inside the selected board's own start/end dates, which may be narrower than the academic year. Dates are entered as `DD/MM/YYYY`.
4. Fee Structure lists published and superseded versions of active terms and stores the explicitly selected version ID. Existing pins never upgrade automatically; see [the active workspace flow](./references/fee-structure-workspace.md).
5. Student fee assignment creates immutable DueFee schedule snapshots for the full year.
6. Only one Payment Term may be selected as the default for a board in an academic year. The flag may be set while the term is a draft, but the term remains unavailable to Fee Structures until activation. Selecting a new default clears the previous default in the same transaction, and a filtered unique database index enforces the invariant.
7. The list separates current and archived records and presents one user-facing status: `Draft`, `Active`, or `Archived`. Internal version lifecycle states remain available in version history and assignment checks.
8. Activation is a one-way Draft-to-Published version action in the current API and is exposed through row actions, not a Status-column toggle. Archive and restore are separate master-record transitions; archiving requires a reason and is blocked while fee structures reference the term. Restoring preserves the version state and returns the term to Current as Draft or Active.
9. Version History opens in the details drawer as a simple audit table showing version/status, action, creation date and user, and change reason. Its paged data is loaded only when the history tab opens.
10. Collection shows an installment only when its server-calculated bill generation date has arrived. If a structure is assigned late, all dates already reached are available immediately.

The four bill-generation rules are: installment start date, X days before due date, due date, and a specific per-installment date. The frontend previews calculated dates, but the backend remains authoritative.

### Collection Policy history and audit

1. The row action menu exposes Audit Trail and Version History only when Collection Policy `View` is granted.
2. Both drawers lazily load the immutable Collection Policy version stream when opened.
3. Version History compares each snapshot with its predecessor and shows field-level changes, actor, timestamp, action, status, and reason when present.
4. Audit Trail presents those same immutable records as create, update, clone, archive, and unarchive lifecycle events, so policy audit evidence cannot drift from version history.

## Student fee assignment

The active assignment drawer, typed client, permissions, retries and verification fixture are documented in [Student fee assignment](./references/student-fee-assignment.md).
