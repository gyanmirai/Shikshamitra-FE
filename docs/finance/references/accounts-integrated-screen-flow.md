---
module: finance
domain: accounts-integrated-screen-flow
content_type: Conceptual
status: active
updated_on: 2026-09-30
owner: frontend-team
audience: humans-and-agents
---

# Present the integrated Fees and Accounts flow

TL;DR: keep staff in the existing business screen, show the server-calculated financial impact, and link the automatic Accounts entry after confirmation.
This is the active frontend target contract; new tabs, lifecycle actions and accounting clients described here are not shipped.
The [backend end-to-end contract](../../../../Shikshamitra-BE/docs/modules/finance/references/accounts-integrated-end-to-end-flow.md) owns accounting equations, API proposals, permission definitions, migration and complete school examples.
Use [routes](../routes.md), [clients](../clients.md) and the current [Finance menu](../../../src/constants/finance-menu.ts) for actual navigation and client ownership.

## Staff flow and navigation

```text
Fees: assigned schedule -> issued demand -> collection -> receipt
      student detail: balance, credit and timeline
      optional: concession / waiver / adjustment / refund / source correction

Accounts: other income / school expenses
          payment verification -> settlement and bank matching
          accountant detail: ledger, exceptions and period close
```

Preserve the existing Fees, Accounts, Policies, Reports and Audit positions.
Student Account can initially be a tab inside student collection detail; Demand can be a schedule/issued tab over assignment and dues.
Do not add a permanent menu item for every status or action.
Keep Waive on the eligible Collection row and keep Refund in Fees Refunds.
Add a Journals/Ledger route only after its real permissioned APIs exist; accountant controls may be tabs in that workspace.
Keep bank matching alongside the current reconciliation workspace with clearly separate Payment Verification and Bank Matching tabs.
The backend contract decides which actions are available; a frontend route or label cannot establish a new money operation.

## Screen-by-screen contract

All fields marked required below are business facts, not extra accounting controls.
Date defaults use the school's operational date; the API determines whether an actual backdated payment is permitted.
The chosen school currency and context are displayed read-only; routine staff do not select currency or financial-period IDs.

| Screen | Current behavior | Required fields and conditional fields | Required behavior, actions and flow |
|---|---|---|---|
| Account Heads | Name/type/parent/notes and status/history exist | Required: name, type. Optional: parent, notes | Preserve form; display protected-head/dependency explanation; no code, policy, journal-rule, period or payment-mode input |
| Income/Expense Categories | Default-head mapping exists; tags optional in current branch | Required: name, matching account head. Optional: description/tags | Keep mapping once at setup; show dependency/history; the transaction form selects category and derives its account |
| Bank Accounts | Stored bank and Asset-head mapping; internal code generated in current branch | Required real bank/account/IFSC facts; head confirmation where needed. Optional: branch/UPI details according to actual use | Reuse this list for every collection/payout/statement; mask in tables; no manual code; do not invent a school-bank options array |
| Fee Categories / Fee Heads | Existing category/head setup; income mapping manually required | Required: category/name; normal fee versus deposit treatment where needed. Optional: description; conditional integration/module link | Inherit unambiguous category mapping; same rules in embedded/standalone forms; accountant override only when necessary; no code or Accounts policy selector |
| Payment Terms / Fee Structure | Versioned schedule, published term and structure editors | Keep existing amounts, heads, service coverage, installment/demand/due dates and policy attachments in their owning setup screens | Show readiness blockers; preserve draft/publish/version journey; publishing does not show fake collection or annual earned income |
| Fee Structure Assignment | Student selection and server preview/commit exist | Existing context, students, published structure/version and effective assignment facts | Preview schedule and net obligation; show scheduled versus issued amounts; assign once with retry result |
| Student Account tab | Fee Collection already displays fee details/ledger | Student and academic year filters; optional as-of/date filters | Show separate issued debt, upcoming schedule, pending payment, available credit and reserved credit; timeline -> source/receipt; gated accountant entry link |
| Demand tab | Demand date is represented through due snapshots | Context/eligible rows; issue date if permitted; cancellation reason only for cancel | Scheduled/Issued/Part-paid/Paid/Cancelled buckets; issue preview -> confirm; paid cancellation shows credit/refund impact and leaves receipts intact |
| Fee Collection | Allocations, split modes and receipt preview exist | Required: student, accepted amount, allocations and existing payment modes. Conditional: active bank/reference/instrument details. Optional: notes | Default issued due before advance; allow explicit future-installment advance/earmark; show amount-to-fees, pending amount, advance, remaining debt; confirm once -> receipt and status |
| Receipts | Existing receipt list/PDF and provisional/final behavior | Search/filter only; no mutable amount/account fields | Keep numbered evidence; show instrument-level accepted/pending amounts and linked corrections; never rewrite an old receipt after benefit/refund |
| Concession request/review | Existing context, preview, evidence and independent approval | Existing student/assignment/type/amount-or-percent only where allowed; required reason/evidence when applicable | Show current debt versus credit created; review -> approve/apply; linked refund uses same credit; no account-head or refund-expense selection |
| Direct waiver | Reason-only row action supported in Collection | Required: selected eligible late-fee/charge row and reason; amount is read-only | Display full live remaining amount; apply once; refresh affected row/debt/timeline; no amount field or new approval module |
| Adjustment | Existing source/target selection and application | Required: genuine available credit source, target outstanding rows, applicable amount, reason | Unpaid fee is never in credit list; server preview -> independent apply; show reserved/applied/remaining credit; named reversal for correction |
| Refund request | Existing eligibility, preview, request and approval | Required: eligible paid/credit source, refund amount/reason. Conditional: policy evidence | Show eligible, already refunded, reserved and currently available; request -> independent approval; treatment read-only; no Expense Category |
| Refund payout | Existing process/retry UI with hardcoded bank options in payment configuration | Required: approved amount and supported payout mode. Conditional: stored school bank ID, recipient/instrument/reference/settlement facts | Processing preview -> Record confirmed payout or initiate a configured provider attempt; unknown result stays pending investigation; never offer blind Pay again |
| Accounts Income | Category/name/amount/method/date form and CRUD exist | Required: category, description/name, amount and occurrence/receipt facts. Conditional: payer, bank/reference/evidence when needed | Clearly mark other income; approved/recorded and received states; normal simple receipt flow; pending instrument accepted later; posted correction via Reverse |
| Accounts Expense | Similar form/CRUD exists | Required: category, description, amount, bill date, Paid or Pay later. Conditional: payee, invoice/reference/evidence; method/date/bank only when paid | Paid expense records cost and payment once; Pay later creates approved payable; later Pay shows remaining amount and supports partial payout |
| Payment Verification tab | Reconciliation approves/rejects provisional receipts | Instrument and linked source read-only; decision reason/evidence where required | Verify/fail one instrument; preserve other valid payments; show pending/accepted/failed status; clearly identify bank settlement separately |
| Settlement / Bank Matching tab | Statement UI is not a complete authoritative bank matching flow | Required: stored bank and statement file/period; matched source and amount. Conditional: discrepancy reason/fee evidence | Import -> server candidates -> review residuals -> match -> close batch; matching previously posted bank movement creates no duplicate posting |
| Journals / Ledger | No authoritative live journal API | Account/date/context filters; source links; no routine debit/credit form | Accountant/auditor sees balanced lines and source timeline; correction opens the original source's permitted action; show opening and closing balances |
| Posting Exceptions tab | Draft posting surface is explicitly unavailable | Filter by source/reason; retry reason if required; immutable source read-only | Show only real migration/asynchronous exceptions; Retry accounting never recollects/pays/refunds money; link missing setup to its owner |
| Period Close tab | No live period-close backend | Generated period selection; close review; required reason for Reopen | Check balances/clearing/match residuals/posting exceptions; legitimate documented uncleared items can carry forward; confirm close only after current server checks |
| Reports / Audit | Existing operational reports and audit screens | Existing authorised filters; accountant reports add account/as-of dimensions | Use backend reports and export jobs; connect source -> event -> journal -> settlement; distinguish legacy operational history from new ledger coverage |

## Validations, statuses and permissions

| Area | Validation shown to the user | Status/action/permission behavior |
|---|---|---|
| Settings | Name uniqueness, matching head type, same context, active/effective mapping, valid actual bank facts and dependency restrictions | Existing exact View/Add/Edit/Delete/ChangeStatus authority; protected/used settings cannot be deleted or reinterpreted |
| Collection | Positive whole-paise amounts; payment/allocations agree; same student/context; conditional reference/bank; valid server preview | Collect requires source Add authority and ready setup; accepted/pending/settled states are derived; journal access is independent |
| Benefits | Amount within live eligible capacity; mandatory reason/evidence; stale preview refresh | Preserve exact concession actions; waiver uses ApplyWaiver; approver is independent where the workflow requires it |
| Credit/refund | Available credit after reservations; refund cap; approved amount/bank; matching current stamp | Apply/Process/Retry/Reverse are separate server capabilities; creator cannot approve; no role-name bypass |
| Income/Expense | Positive money, active category/mapping, valid dates and conditional bank/evidence; payout <= unpaid amount | Draft-only edit/delete; server-provided submit/approve/record/pay/reverse actions; restricted users cannot invent lifecycle actions |
| Verification/bank | Reference/evidence, live instrument status, match amount <= both residuals, explained discrepancy | Separate verify/fail, settle, import/match/approve capabilities; scope and maker-checker remain backend-enforced |
| Ledger/close | Valid filters, active ledger coverage, current close preview and required reopen reason | Accountant/auditor view; dedicated Close/Reopen/Retry/Export actions; restricted staff never see unrelated student lines |

Do not add frontend-only permission strings or broaden an existing Add permission to authorise financial approval.
Introduce new grants in backend constants/catalogue first, then use that exact mapping for menu, route, page, query and button.
Show policy resolution read-only where the existing Fees workflow needs an explanation; never ask for Accounts-side policy selection.
Keep technical event versions, mapping versions, journal IDs, row stamps, fingerprints and retry keys in the client state/request contract, not editable fields.

## Error, empty, loading and success states

| State | Presentation and safe next action |
|---|---|
| Loading | Keep breadcrumb/context mounted; use table/detail skeletons; lock only dependent controls during option loading |
| Confirmation in progress | Keep review visible; lock duplicate confirmation and conflicting controls; clearly label Collecting/Applying/Recording payout |
| No setup | Name the missing bank/category/period/mapping and its owner; link only when user has permission |
| No records | Explain no student demands/credits/matches exist; do not show meaningless placeholder zero accounting totals |
| No search/filter results | Preserve search/filter and offer Clear search/filters; do not offer another collection/create as the recovery |
| Forbidden | Show the deliberately forbidden state; never fetch/render unauthorised student or school-wide accounting records first |
| Validation failure | Field-level explanation and retained inputs; amount/remaining-credit cap from server |
| Balance changed | Explain another payment/refund/adjustment changed the balance; reload impact and require review of the changed result |
| Network failure/retry | Preserve original unchanged command and key; return recorded outcome if already committed; do not generate a fresh collection/payout |
| Unknown external payout | Show pending outcome and reference; Investigate/check status is the next action, not another payout |
| Success | Source reference, receipt/payout state, updated student debt/credit and gated Accounts entry link; no vague Saved for a pending payout |
| Recoverable PDF failure | Source transaction remains committed; retry receipt generation/download, never retry payment as a new action |

## Clients, cache and implementation ownership

| Existing source owner | Required client change |
|---|---|
| [Fee collection client](../../../src/redux/feeCollection/feeCollection.ts) and [collection screen](../../../src/screens/finance/FeeCollection/FeeCollectionComponent/FeeCollectionForm.tsx) | Add preview, instrument statuses, credit/advance result and source-posting links; preserve current allocation UI and unchanged-command retries |
| [Refund client](../../../src/redux/finance/RefundManagement/feeRefundManage.ts) and [refund payment fields](../../../src/screens/finance/feeRefund/NewRefundForm/refundPaymentDetailsConfig.ts) | Replace hardcoded school banks with scoped active stored bank options; attach credit/reservation/payout outcome |
| [Adjustment client](../../../src/redux/finance/adjustments/adjustmentApi.ts) | Map genuine credit-source eligibility, reservation state and authoritative preview; never adapt unpaid fees into available credit |
| [Income client](../../../src/redux/finance/incomeTrackingManagement/incomeTracking.ts) and [Income screen](../../../src/screens/finance/IncomeTracking/index.tsx) | Add lifecycle/preview contracts after backend delivery; preserve short form and optional tags |
| [Expense client](../../../src/redux/finance/expenseApi/expenseApi.tsx) and [Expense screen](../../../src/screens/finance/ExpenseTracking/index.tsx) | Add payable/paid and partial payout actions; attach sources/evidence/posting links |
| [Bank account client](../../../src/redux/finance/BankAccountManage/bankAccountApi.ts) | Reuse scoped active options across payouts and statement import; preserve masks and conditional details |
| [Unsupported posting screen](../../../src/screens/finance/accounts/DraftPostingQueue/index.tsx) | Keep unavailable until actual exception-query/retry contracts and exact permissions exist |
| [Finance Reports clients](../../../src/redux/finance/reports/financeReportsApi.ts) | Use existing preview/export pipeline for trial balance, cash/bank, receivables and statements after backend reports exist |

Use the shared RTK Query base API; do not create a second Finance client stack.
Invalidate Student Account, affected due/collection, credit, source detail, receipts, journal/ledger and relevant report tags after monetary success.
Refresh refund/adjustment eligibility after either one reserves or consumes the same credit.
Settlement refreshes instrument, clearing, bank and reconciliation data without manufacturing new student debt changes.
Scope tags by tenant/context/source and clear session data at tenant/auth changes; do not reuse another school's financial cache.
Use backend decimal/paise contracts and current date serialization; no independent frontend journal or credit arithmetic as source of truth.

Reuse CustomBreadcrumbs, CustomizableTable, CustomDialog/ConfirmDialog, shared selects and toast, Formik/Yup and the theme.
Keep advanced journal detail out of the main cashier review; responsive forms stack normally and preserve keyboard focus/error summaries.

## Walkthrough and acceptance

Present the twelve-step Aarav journey and the Meera after-payment concession from the [backend examples](../../../../Shikshamitra-BE/docs/modules/finance/references/accounts-integrated-end-to-end-flow.md#school-example-a-complete-normal-journey).
On every step, verify the visible source, amount, receipt/payment state and remaining debt/credit; accountant drill-down then proves the journal.
Also verify cash plus rejected cheque, two simultaneous credit uses, pending payout timeout, closed-period correction, reset navigation without reposting, forbidden views and mobile/keyboard operation.

Run docs checks now; type/lint/contract tests and the required in-app browser smoke test apply when runtime screens are changed.
No rendered UI or new API behavior is claimed as tested by this document.

## Inconsistencies

Confirmed source mismatch: refund payment configuration contains a hardcoded school-bank array rather than stored Bank Account IDs/options.
Confirmed source mismatch: the adjustment source contract can expose debt as credit; its UI must not present that as usable money.
Current unsupported posting routes correctly state their limitation; they must remain unavailable until backend delivery.
New tabs, empty/error states, responsive rendering and exact new permission parity remain unverified until implementation.
