---
module: finance
domain: charge-management
content_type: Reference
status: active
updated_on: 2026-10-14
owner: frontend-team
audience: humans-and-agents
---

# Charge Management frontend flow

## Implementation status (2026-10-02)

The canonical workspace is `/finance/charge-management`; the former `chargesRequest` and `chargesList` URLs redirect there. The workspace now uses typed charge requests/responses, explicit all-in-scope versus selected-student audience modes, server paging/search, exact action permissions plus backend `availableActions`, optimistic concurrency stamps, collected/outstanding amounts, and an audited void dialog. Charge Category setup requires an Income Category and displays its resolved account head.

Collected charges cannot be voided from this screen. Users are directed to reconciliation/refund handling, and the backend enforces that boundary. A charge-specific paid-refund UI, immutable event timeline, notifications, export parity, and browser automation remain follow-up work.

The inbox now shows Pending, In Process, Completed and Rejected with server counts and status badges. Every new charge requires approval, and category setup no longer offers a bypass. Detail distinguishes approval decisions from collection status and shows collected, waived and outstanding amounts per student. Payment, waiver and reconciliation mutations refresh subscribed charge queries. Completion uses the server's batch `workflowStatus`; the original student `status` remains the approval decision. See [Finance testing](../testing.md) for focused regression commands.

The table uses the shared Columns, Export and full-screen tools and a filter on every
data column. Students shows the total in the selected scope, with the reviewed count
underneath; its numeric filter applies to that total. Status and Actions are pinned on
the right, with at most two direct actions and the remainder in the shared menu.
`chargeTableFilters.ts` serializes text, numeric/range, calendar-date and workflow-status
filters into the list API's `filters` parameter. The API applies filters before counting
and pagination, and tab counts follow the same search and filters. Changing a tab clears
only the workflow-status column filter. Charge Name, Amount and Due Date support server
sorting with a stable tie-breaker; unsupported columns do not show a sort control.
The table's zero-based pages are converted to the API's one-based pages.

Focused checks: `ChargesTable.test.tsx` covers page conversion, filter/sort persistence,
tab transitions, date serialization and allowed actions. Backend
`ChargeColumnFilter_Tests.cs` covers validation, filter combinations, date boundaries
and PostgreSQL predicate translation. Finish the browser smoke check on
`/finance/charge-management`, including filter menus, empty results, page changes and
right-side sticky columns at narrow widths.

Backend behavior, financial invariants, gaps, and the target lifecycle are canonical in [Charge management end to end](../../../../Shikshamitra-BE/docs/modules/finance/references/charge-management-end-to-end.md).

## Current route and component map

| Surface | Current role | Source | Disposition |
|---|---|---|---|
| `/finance/charge-management` | Active menu destination; renders `ChargesManage` | `src/app/(auth-route)/finance/charge-management/page.tsx` | Keep as the one workspace |
| `/finance/charge-management/chargesRequest` | Legacy bookmark compatibility | `.../chargesRequest/page.tsx` | Redirects to `/finance/charge-management` |
| `/finance/charge-management/chargesList` | Legacy bookmark compatibility | `.../chargesList/page.tsx` | Redirects to `/finance/charge-management` |
| `ChargesManagement/index.tsx` | Older Fees/Approvals shell | `src/screens/finance/ChargesManagement/index.tsx` | Remove after confirming no imports |
| `ChargeForm.tsx` | Older form | `src/screens/finance/ChargesManagement/Components/ChargesManage/Component/ChargeForm.tsx` | Remove after confirming no imports |
| `UpdateChargeForm` | Active create/edit form | `src/screens/finance/ChargesManagement/Components/UpdateChargeForm/UpdateChargeForm.tsx` | Refactor onto typed context/preview contract |
| `chargeApi.ts` | Active RTK Query client | `src/redux/finance/ChargeManagement/chargeApi.ts` | Keep, type, and align with backend actions |
| `studentChargeDataApi.ts` | Comment-only obsolete file | `src/redux/finance/ChargeManagement/studentChargeDataApi.ts` | Delete when references are proven absent |

The route layout and menu protect navigation with Charge View. Navigation access is not permission to create, edit, delete, approve, or reject.

## Current user journey

1. The active page lists charge request batches in Pending, In Process, Completed and Rejected tabs.
2. Add/Edit opens `UpdateChargeForm`, which loads Charge Categories and only students with a fee-structure assignment for the selected academic year, builds an audience, and posts to `api/charges`.
3. A detail/review surface loads the request and lets a checker approve or reject selected pending student lines.
4. Approved lines are fetched by Fee Collection. The collector can include full or partial charge allocations with normal fee allocations.
5. The backend issues a separate charge receipt and collection views can display the paid charge lines.
6. The batch becomes Completed when all approved student balances are settled, including applied waivers. A reversed allocation can return it to In Process. Pending rejection moves a fully rejected batch to Rejected; partial decisions remain Pending until every student is reviewed.

This is a partial flow. Charge correction, void, refund, source drill-through, account classification, and a complete audit timeline are not available from Charge Management. The approved target deliberately keeps waiver controls out of this screen and places the reason-only full-balance toggle in Fee Collection.

## Historical gap assessment (2026-09-21)

This table records the original assessment; the implementation status above and current source describe delivered behavior.

| ID | Priority | Current issue | Required frontend behavior |
|---|---|---|---|
| FE-CM-01 | P0 | Active list query does not send selected `academicYearId` | Make academic year a required query input and cache-key member; clear prior-year data while switching |
| FE-CM-02 | P0 | Add/Edit/Delete/Approve/Reject controls rely mainly on status | Require exact action permission and server `availableActions`; never infer authorization from a tab or status |
| FE-CM-03 | P0 | Empty `studentIds` is mapped to `AllInScope` | Add an explicit audience mode and confirmation; zero selected students must not silently expand the batch |
| FE-CM-04 | P0 | Class deselection writes the literal string `studentIds` in one path | Store the calculated ID array and cover the transition with a form test |
| FE-CM-05 | P0 | No authoritative audience preview, fingerprint, idempotency key, or concurrency stamp | Use the backend preview/command contract and retain one key per logical retry |
| FE-CM-06 | P1 | Request list paging is not wired and student history caps each status call at 100 | Use server pagination with visible totals; do not approximate a complete ledger |
| FE-CM-07 | P1 | The processed tab can contain mixed batches and client labels assume one batch status | Render server-derived batch/line summaries and pending counts |
| FE-CM-08 | P1 | Create/update/approve/reject errors become generic toasts | Map stable business error codes to actionable messages while retaining correlation details |
| FE-CM-09 | P1 | UI/backend validation differ for due date and purpose; priority/notes are hidden | Share typed validation metadata and send only supported fields |
| FE-CM-10 | P1 | Edit disables fields the backend accepts and may allow student edits the backend rejects | Render `availableActions` and immutable-field reasons from the server |
| FE-CM-11 | P1 | Approval initially selects all pending students and does not explain maker-checker/override state | Require deliberate selection/confirmation and show why an action is unavailable |
| FE-CM-12 | P1 | Student history Remove only shows a toast | Remove the action until a real void/correction endpoint and permission exist |
| FE-CM-13 | P1 | Collection filters payment methods using `allowOnlineCollection`, but the server does not guarantee the same decision | Display the server decision and treat backend rejection as authoritative |
| FE-CM-14 | P2 | Charge client uses broad `any` contracts and a stale client comment describes the wrong endpoint | Define typed DTOs/mappers and delete obsolete client surfaces |
| FE-CM-15 | P2 | No focused Charge Management tests were found | Add client, mapper, permission, form, stale-command, retry, and browser coverage |

## Target workspace

Keep one route with these views:

| View | Purpose | Required behavior |
|---|---|---|
| Requests | Search, filter, page, and summarize batches | Academic year is mandatory; status, scope, source, category, and dates are server filters |
| Pending approvals | Review only lines the user may check | Exact Approve/Reject grants, maker-checker explanation, deliberate line selection |
| Student obligations | Drill into approved/outstanding/paid/corrected lines | Server paging, source/category/receipt links, no placeholder mutations |
| Batch detail | Explain one batch and its lines | Audience snapshot, origin, category/account snapshot, line states, totals, timeline, available actions |
| Create/Edit drawer | Preview and create/update safely | Explicit audience mode, server preview/fingerprint, stamps, idempotency, confirmation |
| Correction drawer | Void/waive/refund only when backend supports it | Impact preview, reason, exact permission, stamp, idempotency, receipt/account effect |

## Exact permission contract

Mirror backend constants instead of inventing UI bundles.

| UI capability | Existing permission |
|---|---|
| Open/list/detail | `Finance.Fees.Charges.View` |
| Create | `Finance.Fees.Charges.Add` |
| Edit a legal pending request | `Finance.Fees.Charges.Update` |
| Delete a legal pending request | `Finance.Fees.Charges.Delete` |
| Approve pending lines | `Finance.Fees.Charges.Approve` |
| Reject pending lines | `Finance.Fees.Charges.Reject` |

Future Submit, Cancel/Void, Refund/Reverse, Export, ViewAudit, or maker-checker override buttons require separately approved backend permissions. Do not map them to an existing grant for convenience.

Every mutation button needs both:

```text
hasExactPermission(action) && response.availableActions.includes(action)
```

The API remains authoritative and must return 403 or a stable business error when the action is illegal.

## Target frontend/backend sequence

### 1. Load context

- Require tenant session, selected academic year, and Charge View.
- Request a typed context containing allowed filters, categories, user scope, payment/policy indicators, and action permissions.
- Do not display stale data from another year while a new request is loading.

### 2. Preview audience and money

- Ask the author to choose `All students in scope` or `Selected students` explicitly.
- List only enrolled students with a fee-structure assignment for the selected academic year; the backend revalidates this prerequisite for explicit and all-in-scope audiences.
- For selected mode, require at least one ID.
- Send scope/category/amount/due date to the preview endpoint.
- Show resolved count, excluded students and reasons, per-student amount, total obligation, approval rule, revenue mapping, and source identity.
- Require confirmation for a broad batch. Never calculate the authoritative total only in the browser.

### 3. Create or update

- Generate one idempotency key when the user starts the logical command; reuse it only for retries of the same payload.
- Send preview fingerprint and, for edits, the current concurrency stamp.
- On stale preview/stamp, preserve form input, refresh context, explain the change, and require a fresh confirmation.
- Invalidate exact list/detail/student-obligation tags after success.

### 4. Approve or reject

- Load batch detail and pending lines from the server.
- Do not pre-authorize from status. Disable or hide the action using exact permission plus `availableActions`.
- Make selected students and total impact obvious. Apply backend reason-length rules before submit.
- Refresh the batch and both approval/request lists after success; handle mixed batches without moving or duplicating them incorrectly.

### 5. Collect

- Fee Collection displays approved outstanding lines with charge category, purpose, due date, source, original, collected, and outstanding amounts.
- Allocation UI may support partial amounts, but it cannot exceed server outstanding.
- Display payment-channel eligibility returned by the server. Do not rely on filtered dropdown options as enforcement.
- After success, show separate fee and charge receipts when returned and refresh charge, collection, receipt, account, and posting data.

### 6. Correct and audit

- Until a real backend workflow exists, do not show Remove, Void, Waive, or Refund mutations.
- Once available, use preview/confirm, reason, permission, stamp, and idempotency patterns.
- Show the immutable original line and linked corrective transaction together.

## Typed client requirements

Replace `any` with explicit types for:

- context and Charge Category/account snapshot;
- paged request and line filters/responses;
- audience preview, exclusions, total, fingerprint, and expiry;
- create/update request and response;
- detail, line summary, timeline, concurrency stamp, and `availableActions`;
- approve/reject inputs and results;
- collection charge input/output and receipt reference;
- stable backend business errors.

Use decimal-safe string or platform-approved monetary serialization consistently. Use ISO-8601 offset timestamps for due dates; format them only at the presentation boundary.

## Cache rules

- Include tenant context, academic year, filters, page, and page size in every list cache key.
- Invalidate request list, approval list, batch detail, student obligations, collection form, receipts, postings, accounts, and reports after their relevant state-changing command.
- Optimistic delete/undo must not be restored until the server contract is idempotent and the exact cache key is proven. Prefer confirmed mutation for financial records.
- Never merge pages or years into a cache entry using only a status label.

## UI states and errors

Every workspace view must distinguish loading, empty, permission denied, invalid academic context, stale preview/stamp, conflict, validation error, and unexpected failure. An empty list must never represent a failed or unauthorized request.

Stable backend errors should drive messages such as:

- selected category is inactive or belongs to another year;
- audience changed; review the new resolved students;
- request changed since it was opened;
- maker cannot check their own request;
- one or more lines are no longer pending;
- charge outstanding changed before collection;
- payment method is not allowed;
- correction/refund is unsupported for this receipt scope.

## Acceptance coverage

### Unit and client tests

- audience mapper never converts accidental empty selection into AllInScope;
- class/student selection remains an array after deselection;
- academic year participates in request args and cache keys;
- exact permission plus `availableActions` controls every action;
- preview fingerprint, concurrency stamp, and idempotency key are retained correctly;
- stable errors map to the right UI state;
- list/detail/collection tags refresh after commands;
- decimal/date serialization matches the backend contract.

### Browser journeys

1. Author creates a selected-student charge after preview and cannot approve it.
2. Independent checker approves a subset; the batch stays Pending until all lines are reviewed, then appears in In Process or Rejected.
3. Collector makes a partial then final charge payment and opens both returned receipts.
   Verify that partial settlement stays In Process, all-student settlement becomes Completed, and reversing a payment restores In Process when a balance returns.
4. A stale approval or collection is blocked, refreshed, and safely retried.
5. A user with View only sees no mutation controls and direct mutation calls are rejected.
6. Switching academic years never displays or mutates the previous year's charges.
7. Broad AllInScope creation requires explicit selection and count confirmation.
8. Source-posted transport charge links to its origin and cannot be duplicated on retry.
9. Correction/refund is absent until supported, then preserves the original receipt and timeline.

## Implementation order

1. Fix FE-CM-01 through FE-CM-05 together with backend CM-01 through CM-05.
2. Consolidate the route and remove placeholder/obsolete surfaces.
3. Introduce typed context, preview, detail, and command contracts.
4. Complete paging, errors, collection provenance, and correction UX.
5. Add unit/contract/browser evidence before release sign-off.

Do not implement the frontend target independently of the backend contract. Money, authorization, scope, status, and available actions are server-owned.
