---
module: finance
domain: refund-policy-frontend-flow
content_type: Conceptual
status: proposed
updated_on: 2026-09-07
owner: frontend-team
audience: humans-and-agents
---

# Build the staff-friendly Refund Policy frontend flow

TL;DR: retain the existing Refund Policy and Fee Refund workspaces, replace generic and mismatched clients with typed backend contracts, and guide staff through Student and Receipt -> Refundable Items -> Reason and Payout -> Review and Submit.
The backend remains authoritative for policy resolution, eligibility, calculation, approval, settlement, accounting, concurrency, and permissions.

## Document status and ownership

This page is the frontend integration and staff-experience specification.
Typed Refund Policy setup, Collection-style status selection, lifecycle actions, version history, and fee-structure selection are implemented in the current working tree. The receipt-first request and settlement screens remain the target for the existing refund transaction workspace.

Product rules, API contracts, statuses, permissions, data integrity, and calculations are canonical in the [backend Refund Policy flow](../../../../Shikshamitra-BE/docs/modules/finance/references/refund-policy-flow.md).
This page owns visible routes, screen behavior, client wiring, cache behavior, validation feedback, accessibility, and browser acceptance.

The target extends the current sources under `src/screens/finance/policies/**`, `src/screens/finance/feeRefund/**`, and `src/redux/finance/**`.
It must remove or retire duplicate legacy refund components only after route and import checks prove they are inactive.

## User experience principles

| Principle | Required interface behavior |
|---|---|
| Use school language | Say Student, Receipt, Paid, Already Refunded, Reserved, Available, Refund Amount, Approval, and Payment Reference. |
| Hide internal identifiers | Never ask staff for DueFee, policy-version, transaction, or allocation IDs. |
| Resolve context automatically | The selected student and receipt determine assignment, policy, fee heads, installments, and eligible allocations. |
| Explain the amount | Show one server-calculated summary with the reason for every deduction or cap. |
| Make the next action obvious | Each page has one primary action based on status and permission. |
| Keep setup separate | Policy configuration and daily refund processing remain separate workspaces. |
| Preserve context | Academic year, filters, selected tab, page, and search remain stable after dialogs and refetches. |
| Prevent accidental repeats | Disable in-flight actions and send an idempotency key for every financial mutation. |
| Protect sensitive data | Mask bank account and UPI values unless the user has the dedicated permission. |

## Current frontend baseline

| Surface | Current behavior | Required frontend change |
|---|---|---|
| Refund Policy route | The route exists and renders the shared policy table and drawer. | Keep the route but use dedicated typed Refund Policy hooks and exact policy permissions. |
| Policy persistence | Uses the generic `/finance-policies` client. | Replace it with the dedicated backend Refund Policy API. |
| Policy calculation | A technical simulation endpoint exists. | Keep it out of the standard policy editor; use the server-calculated preview in the actual refund request flow. |
| Fee-structure policy | A refund-policy selector exists, but the save client drops its value. | Send policy ID and version ID through the typed fee-structure attachment contract. |
| Refund worklist | Fetches at most 100 records and filters statuses in the browser. | Use server-side pagination, search, status, date, student, receipt, and academic-year filters. |
| Status display | Frontend enum values disagree with backend values. | Consume one generated or shared status contract and display every state. |
| Refund request | Selects student and DueFee-derived rows. | Start with student and receipt, then show eligible receipt allocations returned by the server. |
| Approval | Approve and Reject are available from pending rows. | Show actions only when both status and exact permission allow them. |
| Processing | An inactive form displays a Generate Receipt toast without performing settlement. | Replace it with a real typed settlement dialog and remove the simulated success behavior. |

## Navigation and workspace structure

Keep two clear staff destinations.

| Workspace | Primary users | Purpose |
|---|---|---|
| Refund Policy | Fee setup staff | Configure eligibility, save as Draft or Active, attach, version, archive, unarchive to Draft, and inspect policies. |
| Fee Refunds | Makers, checkers, cashiers, and finance managers | Create, review, approve, settle, track, and reverse refunds. |

The Fee Refunds page remains a full-height table workspace.
The page header contains the academic year, concise guidance, and Create Refund when permitted.
The table owns scrolling, loading, empty state, errors, server pagination, sorting, and search.

### Worklist views

Use task-oriented tabs instead of hiding backend states.

| Tab | Included statuses | Staff meaning |
|---|---|---|
| Needs Review | Submitted and Under Review | A checker needs to decide. |
| Ready to Pay | Approved and Failed | A cashier must process or retry. |
| In Progress | Processing | Settlement is underway and actions are locked. |
| Completed | Processed | Money has been recorded as paid. |
| Closed | Rejected, Cancelled, and Reversed | No ordinary action remains. |
| Drafts | Draft | The current maker may continue or delete a draft. |

Each tab count comes from the server and represents the full filtered result set.
The frontend must not calculate counts from the current page of rows.

### Table columns

Show these default columns:

- Refund number.
- Student name and admission or GR number.
- Academic year.
- Original receipt number.
- Requested or approved amount.
- Processed amount when applicable.
- Status with text and semantic theme color.
- Submitted date.
- Processing target or overdue indicator.
- Current owner or last actor when available.
- Sticky Actions column.

Policy IDs, internal request IDs, allocation IDs, and full account details remain hidden from the default table.

## Create Refund journey

Use a focused full-page or large drawer flow with four meaningful steps.
Do not add decorative steps for fields that can fit in one section.

### Step 1: Student and receipt

Staff complete these actions:

1. Confirm the academic year.
2. Search for a student within their permitted scope.
3. Choose one eligible receipt from the server result.

The receipt card shows:

- Receipt number and payment date.
- Payment method and transaction status.
- Original paid amount.
- Already processed refund amount.
- Amount reserved by approved refunds.
- Remaining refundable amount.
- A clear reason when a receipt is not eligible.

The policy is resolved automatically and appears as read-only Policy Name, Version, and a short rule summary.
If no policy snapshot exists, show a setup message and a link to Refund Policy only when the user can manage it.

Do not show a policy selector in this flow.
Do not show internal DueFee IDs.

### Step 2: Refundable items

Group receipt allocations by fee head and installment or month.

Each row shows:

- Fee head.
- Installment or month.
- Amount paid by this receipt allocation.
- Previously processed refund.
- Active reservation.
- Available amount.
- Selected refund amount.

Rows that are unpaid, unverified, reversed, cancelled, outside the policy, outside the date window, or fully refunded are disabled with a plain-language reason.

When the policy uses Remaining Paid Amount, Fixed Amount, or Percentage, the amount is read-only and returned by the preview.
When the policy permits Manual up to Eligible, the client constrains input for immediate feedback but does not claim authority.

Provide Select all eligible items only when the server context says the operation is allowed.
Full Refund means all remaining policy-eligible money on the selected receipt allocations.
Partial Refund means a positive amount below or equal to the available amount.

### Step 3: Reason and payout

Keep the form short.

| Field | Behavior |
|---|---|
| Reason | Required selection from school-configured categories. |
| Remarks | Required only when the selected reason or policy requires it. |
| Payout Method | List only methods allowed by the resolved policy. |
| Beneficiary | Default from the student or guardian context but require confirmation. |
| Method details | Render only the minimum fields required for the selected method. |
| Supporting document | Optional unless policy or method context requires it. |

Account and UPI fields are masked after entry.
Never place sensitive payout data in route parameters, analytics, console logs, persistent browser storage, or table rows.

Use typed method forms rather than a generic dictionary.
Dates use the backend contract's date-only or DateTimeOffset format.
IFSC, UPI, cheque, demand-draft, and transaction-reference validation must match the backend contract exactly.

### Step 4: Review and submit

Call the server preview when selected receipt items, amount, reason, method, or relevant dates change.
Debounce non-submit previews and cancel stale requests.

The review shows:

```text
Selected settled amount
- Prior processed refunds
- Active reservations
= Remaining eligible amount
- Policy deduction
- Policy cap adjustment
= Final refund amount
```

Show each amount as currency using the shared formatter.
Display the policy version, original receipt, selected items, reason, payout method, and expected processing target.

Submission uses one clear confirmation:

> Submit refund request for ₹X against receipt Y?

The Submit button remains disabled until the latest preview succeeds and its context hash is current.
Generate and retain one idempotency key for the logical submission until success or an intentional form reset.

On success, navigate to or open the persisted request detail.
Do not show success until the mutation has unwrapped successfully.

## Request detail and action flow

Use one detail workspace for every status.
The header shows refund number, student, amount, and status.

Organize the content into these sections:

1. Request summary.
2. Original receipt and payment.
3. Refund allocations and calculation.
4. Reason and supporting evidence.
5. Masked payout details.
6. Approval and settlement information.
7. Audit timeline.

### Status actions

| Status | Primary action | Secondary actions |
|---|---|---|
| Draft | Submit | Edit, Delete Draft, Cancel. |
| Submitted | Start Review or Approve | Reject, Cancel when permitted. |
| Under Review | Approve | Reject, Cancel. |
| Approved | Record Payment | Cancel before payment. |
| Processing | None | Refresh status. |
| Failed | Retry Payment | Cancel and release reservation. |
| Processed | None | Reverse when specially permitted. |
| Rejected, Cancelled, Reversed | None | View and export only. |

Render an action only when the backend status allows it and the user has its exact permission.
The backend remains responsible for rejecting stale or unauthorized attempts.

### Approval dialog

The approval dialog repeats the final amount, receipt, remaining eligible balance, policy version, and maker identity.
It requires optional notes unless an override or amount reduction requires a mandatory reason.

If the user created the request, disable Approve and explain maker-checker separation.
An explicit override permission requires a separate acknowledgement and reason.

When the server reports a stale preview or balance conflict, keep the dialog open, show the refreshed calculation, and require the checker to review again.

### Rejection and cancellation

Reject and Cancel use separate labels and reason dialogs.
Explain whether an approved reservation will be released.
Never reuse the Approve permission or generic status mutation UI for these actions.

### Settlement dialog

The primary label is Record Payment, not Generate Receipt.
The form shows the approved amount as read-only.

Staff select the school cash or bank account and enter the method-specific evidence required by the backend contract.
The dialog displays the external reference, payment date, and an optional proof attachment.

One submission creates or resumes one idempotent settlement attempt.
Disable close and duplicate actions only while the final request is in flight; do not trap the user during ordinary field validation.

On success, show the processed settlement number and offer View Voucher.
On failure, show whether the request is safe to retry and preserve non-sensitive inputs when appropriate.
Never claim that money was paid when only approval succeeded.

### Reversal dialog

Only users with Refund Reverse can open the action.
Show the original settlement, account posting, processed amount, and downstream impact.
A reason and explicit confirmation are mandatory.
The resulting view keeps both original and compensating settlement records.

## Refund Policy workspace

Retain the existing policy workspace pattern, but keep the staff editor to two sections.

| Section | Visible fields |
|---|---|
| General Information | Name, optional description, and Draft or Active status. Status uses the same labelled dropdown and single status-aware submit action as Collection Policy. |
| What Can Be Refunded? | Payment requirement, all or selected fee heads, optional request deadline, partial-refund choice, paid charges, and paid late fees. |

Do not show Archived as an editable status.
Archive and Unarchive are confirmed row actions.
Do not show a default-policy toggle because attachment is explicit.
Do not expose compatibility fields that are not in the typed backend contract.

### Policy field sources and UI behavior

The backend field contract is canonical in [Refund Policy fields](../../../../Shikshamitra-BE/docs/modules/finance/references/refund-policy-flow.md#refund-policy-fields).
The frontend renders only controls that have the following explicit source and effect.

| UI field | Source | UI behavior and meaning |
|---|---|---|
| Policy Name | Refund Policy | Required staff label with backend uniqueness validation. |
| Policy Code | Refund Policy | Backend-generated internal identifier. Never displayed or entered in the school-staff Refund Policy UI. |
| Academic Year | Active Finance context backed by Institute Setup | Required and read-only after create; scopes every dependent query. |
| Description | Refund Policy | Optional bounded setup guidance. |
| Status | Refund Policy | Draft or Active only; changing Active to Draft shows impact and may be blocked when attached. |
| Version and Concurrency Stamp | Server response | Read-only; the stamp is sent on edits and status actions. |
| Eligible Payment State | Refund Policy, evaluated by Collections | Fully Paid Only or Partially/Fully Paid; explanatory copy makes clear that only settled money is eligible. |
| Fee Head Scope and Fee Heads | Active same-year Finance Fee Heads | All Refundable or Selected; selected values show attachment coverage and backend errors. |
| Include Paid Charges | Refund Policy plus paid Charge allocations | Boolean with an explanation that unpaid charges remain excluded. |
| Include Paid Late Fee | Refund Policy plus paid late-fee allocations | Boolean; do not call it clawback. |
| Request Deadline Days and Basis | Refund Policy | Eligibility window; keep separate from the processing SLA. |
| Allow Partial Request | Refund Policy | Controls whether request amount entry is offered; disabled or forced when incompatible with Amount Mode. |
| Refund Amount | Refund transaction | Staff enter the requested amount while processing a refund; the backend caps it at the eligible settled balance. It is not configured in the policy editor. |
| Calculation, Caps, Rounding, and Deduction | Backend compatibility profile | Hidden from the standard staff editor. New policies use Manual Up to Eligible, no extra cap, exact decimals, and no automatic deduction. Existing advanced values remain intact when an older policy is edited. |
| Payout Method | Refund transaction and shared Finance payment-method contract | Chosen when processing the actual refund, where method-specific details can be validated. It is not configured in the policy editor. |
| Processing Target | Refund workflow | Not configured in the policy editor. Operational due dates should come from the refund workflow or tenant configuration when that module is implemented. |

Never render Policy Code, Default Policy, calculation mode, rounding, policy caps, deductions, payout-method limits, processing SLA, Bank Details Required, Require Approval, Approval Role IDs, duplicate Processing Days, or a generic refund-method field in the standard Refund Policy editor.
Those values are system-managed compatibility data, transaction-time choices, mandatory workflow rules, permission-owned behavior, or concerns of a future workflow/tenant configuration.

### Policy status management

Mirror the existing Collection Policy status interaction: the selected status controls the single submit action label and submitted status.

```text
Draft <-> Active
  |         |
  +----> Archived ----> Draft (Unarchive)
```

| Current status | Form behavior | Row actions | Required safeguards |
|---|---|---|---|
| Draft | Editable; Status offers Draft and Active. | Edit, Clone, Archive, View Versions. | The backend validates all required eligibility fields when Active is submitted. |
| Active | Editable; Status offers Active and Draft. | Edit, Clone, Archive, View Versions. | Show impact, require change reason, send concurrency stamp; Active-to-Draft and Archive are blocked while attached/in use. |
| Archived | Read-only; never an option in the form. | Unarchive, View Versions. | Unarchive always returns Draft and never automatically reattaches or activates. |

Create and Update carry Draft or Active status, as Concession Policy does.
Archive uses the dedicated archive mutation and a consequence confirmation.
Unarchive uses the dedicated action and reports that the policy was restored to Draft.
The workspace keeps separate Current and Archived views and invalidates list, detail, version, and available-attachment caches after each status action.

### Policy calculation

The technical simulation endpoint remains available for automated verification and support tooling, but it is not shown in the school-staff policy editor.
At refund-request time the server calculates eligibility from settled money, prior refunds, and active reservations and returns the authoritative maximum amount.

Submitting Active runs server validation and keeps any validation failure on the relevant form field.
An active policy edit creates a new version and shows the impact on future attachments.
Existing assignments and refund requests display their original version unchanged.

### Fee-structure attachment

The fee-structure policy tab lists only Active same-year Refund Policies.
Selecting one calls the attachment-impact endpoint before save.
The impact summarizes covered and uncovered fee heads.

The save payload contains both policy ID and server-resolved version ID.
The saved response, not the previous Formik value, repopulates the selector.

## Client integration

Use the authenticated shared RTK Query service.
Replace generic, mock, legacy, and duplicate refund clients only after checking their consumers.

| Client concern | Required behavior |
|---|---|
| Policy queries | Typed list, detail, version, simulation, and available-policy responses. |
| Policy mutations | Create/update with Draft or Active status, archive, unarchive to Draft, clone, and attachment impact/save. |
| Refund queries | Server-paged worklist, counts, detail, context, eligible receipts, preview, and audit. |
| Refund mutations | Draft save, update, delete, submit, review, approve, reject, cancel, settle, retry, and reverse. |
| Status contract | Import from generated contracts or maintain one explicitly tested mapping from backend values. |
| Idempotency | Add the operation key in the backend-agreed header or body for create, submit, settlement, retry, and reversal. |
| Concurrency | Return and send the request concurrency token for mutable actions. |
| Errors | Normalize stable business errors into field, row, dialog, or page guidance. |
| Sensitive data | Keep masked response models separate from privileged detail responses. |

### Cache behavior

Define precise tags for Refund Policy lists/details/versions, fee-structure policy options, refund worklist/counts/details, student eligibility, receipt details, student statements, and account/report summaries.

| Mutation | Required invalidation |
|---|---|
| Policy save/status | Policy list, detail, versions, and available attachment options. |
| Policy attachment | Fee-structure detail and policy options. |
| Draft create/update/delete | Refund list, counts, detail, and affected student context. |
| Submit/review/approve/reject/cancel | Refund list, counts, detail, audit, eligibility, and affected receipt context. |
| Settlement/retry/reversal | Refund detail/list/counts, eligibility, receipt, student statement, account, ledger, and report summaries. |

Preserve safe existing rows during background refetch.
Never keep full beneficiary account details in persistent Redux state.

## Validation and error presentation

Client validation provides immediate guidance but never replaces backend validation.

| Condition | UI response |
|---|---|
| Missing academic year | Disable dependent queries and explain the required context. |
| No eligible receipts | Show why payments may be excluded and the next useful action. |
| Zero or negative manual amount | Inline error and disabled preview/submit. |
| Amount above current availability | Inline maximum plus server refresh. |
| Missing method details | Field-specific error matching the typed backend rule. |
| Policy not configured | Setup guidance without permitting manual bypass. |
| Stale preview | Replace totals with the refreshed server result and require reconfirmation. |
| Duplicate request or retry | Open the existing persisted request returned by the server. |
| Concurrent conflict | Keep entered non-sensitive context, refetch, and explain what changed. |
| Unauthorized action | Hide unavailable actions; if state changed, show a safe permission message. |
| Processing failure | Show Failed status, safe retry guidance, and the previous attempt in history. |
| Network uncertainty | Do not resubmit with a new idempotency key; query the operation or request status first. |

Never display raw exception text, full account values, stack traces, or internal IDs in user-facing errors.

## Loading, empty, and disabled states

- Initial table loads use table-shaped skeleton rows.
- Refetches preserve safe rows and show a labelled progress indicator.
- Student search, receipt loading, preview, submit, approve, and settlement have separate loading states.
- Buttons disable only for missing context, validation, permission, status, or the same in-flight operation.
- Empty worklist tabs say what the tab represents and whether filters are excluding results.
- Preview and settlement errors remain visible until resolved or retried.
- A processing request cannot be edited, approved again, cancelled, or resubmitted.

## Confirmation and consequence copy

Use specific confirmations with the actual amount and identifier.

| Action | Required consequence text |
|---|---|
| Submit | Sends the request for independent review; no money is paid yet. |
| Approve | Reserves the approved amount; payment still must be recorded. |
| Reject | Closes the request without reserving or paying money. |
| Cancel approved | Releases the reserved amount and closes the request. |
| Record Payment | Records that money left the selected school account and updates statements and reports. |
| Reverse | Creates a compensating financial record; it does not delete the original refund. |
| Archive policy | Stops new attachments and requests from using the policy; history is unchanged. |

## Permission mapping

Use the exact backend permissions defined by the canonical backend flow.
Do not alias Refund Policy to Fee Collections.

Guard all of these layers:

1. Menu item.
2. App Router page.
3. Workspace tab when it reveals restricted data.
4. Primary page action.
5. Row action.
6. Dialog submission.

The UI permission guard improves clarity but is never treated as API authorization.

## Accessibility and responsive behavior

- Every table has a contextual accessible name.
- Status uses text and an icon or chip, never color alone.
- Row actions have record-specific accessible names.
- The four-step flow is fully keyboard operable with visible focus.
- Validation messages are associated with their fields and announced after submit.
- Currency summaries have text labels, not tooltip-only explanations.
- Confirmation dialogs return focus to the invoking action.
- Narrow screens stack receipt and summary cards without horizontal page scrolling.
- Wide allocation tables own their internal horizontal scroll and retain a sticky action or amount column where helpful.
- Masked financial values remain understandable to screen-reader users.

## Frontend implementation sequence

1. Add the shared typed Refund Policy, Refund Request, calculation, settlement, status, error, and permission contracts.
2. Replace the handwritten mismatched refund status enum.
3. Add dedicated RTK Query endpoints, tags, adapters, idempotency, and concurrency handling.
4. Rewire Refund Policy list, editor, simulation, version, status, and fee-structure attachment flows.
5. Rebuild the refund worklist around server pagination, task tabs, counts, and exact action permissions.
6. Rework Create Refund around student, eligible receipt, allocation selection, server preview, and submit.
7. Add one request detail workspace with audit timeline and status-specific actions.
8. Add approval, rejection, cancellation, settlement, retry, and reversal dialogs.
9. Add student statement, receipt history, account, and report links after their backend projections are available.
10. Remove the simulated Generate Receipt behavior and retire confirmed-unused mock or legacy refund screens.
11. Complete contract, component, screen, permission, accessibility, responsive, and browser tests before enabling the feature flag.

## Required frontend tests

### Contract and adapter tests

- Every status maps to the correct label, color, tab, and allowed actions.
- Policy, eligibility, preview, request, settlement, audit, and error responses normalize correctly.
- Academic year, search, filters, sort, page, and page size are sent to list APIs.
- Idempotency keys remain stable across safe retries and reset for intentional new operations.
- Concurrency tokens are sent on mutable requests.
- Cache invalidation refreshes every affected list, detail, eligibility, statement, and report surface.
- Sensitive fields remain masked in ordinary view models and outside persisted state.

### Component and workflow tests

- No policy, no receipts, fully refunded, partially refunded, unverified receipt, reversed payment, and old-year states.
- Simple defaults, eligible-balance enforcement, and preservation of legacy advanced policy values.
- Zero, negative, over-limit, exact-balance, decimal, and very large manual input.
- Full refund after partial refund and multiple eligible receipt allocations.
- Draft save, update, delete, submit, approve, reject, cancel, settle, fail, retry, process, and reverse journeys.
- Maker-checker and every action permission.
- Stale preview, duplicate submission, double-click, API retry, concurrent conflict, and uncertain network result.
- Payout method field visibility and server-aligned validation.
- Loading, refetch, empty, error, disabled, and success states.
- Keyboard navigation, focus restoration, accessible names, screen-reader status, and narrow-screen layout.

### Browser acceptance journeys

1. Setup staff create a Draft, change the status to Active, attach it, version it, archive it, and unarchive it back to Draft.
2. Maker creates a partial refund from a verified receipt and submits it once despite a double-click.
3. Checker sees the exact original payment and policy calculation and approves another user's request.
4. Cashier records a bank settlement and views the generated voucher.
5. The student statement, receipt history, refund worklist, and account/report views show the same processed amount.
6. Finance manager reverses the processed refund and all views show the compensating result.
7. Invalid student/year, unverified/reversed payment, over-refund, duplicate, stale preview, unauthorized action, and processing failure show clear recoverable outcomes.

## Frontend definition of done

- Daily refund staff never select a policy, fee structure, internal due row, or accounting head.
- The original receipt and remaining refundable amount are always visible before submission and approval.
- The browser displays but never invents the authoritative calculation.
- Every backend status is visible and mapped correctly.
- Every action is gated by both status and its exact permission.
- Approval and processed payment use different language, actions, and timestamps.
- Double-click and retry reuse one idempotency key.
- Sensitive payout values are masked and are not persisted locally.
- Worklist counts and pagination are server-driven.
- Refund facts agree across request, receipt, student statement, account, and report screens.
- No mock API, fake simulation, or toast-only settlement remains reachable from the active route.

## Related documentation

- [Frontend Finance routes](../routes.md)
- [Frontend Finance clients](../clients.md)
- [Frontend Finance workflows](../workflows.md)
- [Frontend Finance testing](../testing.md)
- [Backend Refund Policy flow](../../../../Shikshamitra-BE/docs/modules/finance/references/refund-policy-flow.md)
- [Finance Engineering Constitution](../../../../Shikshamitra-BE/docs/modules/finance/references/constitution.md)
