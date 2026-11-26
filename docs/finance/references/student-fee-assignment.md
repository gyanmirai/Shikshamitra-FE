---
module: finance
domain: student-fee-assignment
content_type: Reference
status: canonical
updated_on: 2026-11-03
owner: frontend-team
audience: humans-and-agents
---

# Student fee assignment workspace

The `/finance/fee-structure-assign` route lists assignment status for the selected academic year and academic scope. The route/menu/table require `Finance.Fees.StructureAssign.View`; create controls additionally require `.Add`. Backend contracts and financial invariants belong to [the backend assignment reference](../../../../Shikshamitra-BE/docs/modules/finance/references/student-fee-assignment.md).

## User flow

The four academic selectors use the Charges screen's 248 px desktop width and wrap on smaller screens.
The checkbox column stays pinned on the left and uses the standard square checkbox for every row.
Student cells show the GR number beneath the name; the separate GR column remains available through Columns.
Assignment sections and Student Policies reuse `FormSectionCard`. The policy editor has no duplicate task heading.
Cancel, close, Escape and backdrop dismissal share the drawer's dirty-state guard and return to the table;
discarding policy edits never opens the saved assignment view.

For a single student, the drawer header identifies the student. Authorized Refund and Collection policy selectors are editable immediately in Step 1, with no separate Edit toggle. Step 2 separates Required Fee Heads from Optional Fee Heads using shared section headers. Optional checkboxes include or exclude each fee and its dependent inputs. Service ranges use the Dashboard's shared two-month picker and do not require a date-change reason. Other policy, zero-amount, correction and service-stop reasons retain their existing contracts. Review shows the server's fee breakdown and totals.

1. Select academic context and students. Selection clears when context, search or page changes. Assigned students expose a permission-gated **View fee structure** eye action through `AdaptiveThreeDotsActions`; only this action opens the existing read drawer, not a table-row click. The neighboring **Edit fee structure assignment** pencil opens the same saved-assignment editor for a single student. **Fees & dates** shows the saved amounts and dates. When the server permits correction and the user has `.Add`, **Edit fees** opens the correction steps in the same drawer. Policy and optional service actions follow their own permissions. Both actions lock during table refresh. Assigned status remains visible on the normal table background. Unpaid editable assigned students may be selected together only for the same original structure/revision; paid and inactive students remain excluded. Header selection uses the selected group, and refreshed eligibility is checked before action payloads are built. The Assign Fee Structure action uses an icon and visible border. Inactive assigned students remain viewable.
2. Open the existing assignment drawer. New single and bulk assignments use one screen for the published structure, policies, fees and service dates. The saved view uses `FinancePolicyDrawerHeader`, an Assigned badge and the Concession Policy view width (`min(760px, 92vw)`, full width on phones).
3. Review each student's mandatory heads and select optional heads separately. Fixed published amounts appear as read-only values. Variable fees on monthly payment terms use a monthly amount. Other terms use a single amount for the selected service period. Zero requires a reason. With a verified Registration joining date, recurring service dates default from joining through the board end date. One-time fees and full-charge annual fees with one installment use a single service month. Configure supported verified transport dates or authorized manual service dates with the existing permission gates.
4. Review **Policies** for each student: Refund and Collection use the structure's supported pinned selections. With `Finance.Fees.StructureAssign.OverridePolicies`, choose current active versions for the selected year or clear an optional refund policy. Collection remains required. Changes require a reason; Restore fee structure defaults clears student overrides. Historical concession and proration evidence remains in the contracts, but these families cannot be selected here.
5. Select **Preview**. Results appear in the **Assignment Preview** area beside the form when space permits and below it on narrow screens. Each student receives an independent result or error. Review head totals, dates, installment percentages, payment-term versions and policy treatment. The installment schedule starts collapsed.
6. Select **Assign Fees** to confirm successful previews from the same footer. The server returns canonical results and the client preserves successful students when retrying failed items.
7. Open **View fee structure** to review Student Details (name, year, GR/roll number, class/division, board, medium and stage), Assignment Total (structure/revision and server totals), Fee Breakdown (selected heads, payment-term versions and saved service dates), Installment Schedule (dates and recorded balances), and Applicable Policies (current saved versions). Shared `DetailSection`/`DetailField` components and section help match the policy view; missing identity values remain unavailable. The header stays fixed while the body scrolls; its X dismisses the drawer. There is no inline edit action or footer Close button. Loading and errors do not display saved financial content as current. Editing starts from the table pencil action; unpaid structure corrections require `.Add`, while policy-only edits require `.OverridePolicies`. The shared stepper owns the fixed Cancel/Back, Next and final Save policies footer. Saving uses a concurrency stamp and invalidates assignment and collection/detail caches. Existing dues and receipts remain unchanged. Historical proration pins remain unchanged; proration cannot be selected in this form.

For bulk assignment, the selected-student list retains its search, counts and pagination. Individual previews remain available in the preview area. Review selection has a visible highlight and `aria-current`, and the same student's full name appears above their details. Long names use two-line cards with full-name help. On phones the content stacks and drawer footer actions remain reachable.

The compact academic filter card follows `DESIGN.md` with `Paper`, `p: 1` and `spacing={1}`. Board, medium, class and division fill the row on desktop and stack on mobile. The shared table fills the remaining height; its controlled page index is zero-based while its server callback is one-based.

The student table offers Student (full name), GR No., Class/Division, Roll No., Enrollment and Assignment by default. Columns also exposes Board, Medium, Academic Stage, Class and Division. Text columns use text operators; Roll No. values align left while retaining numeric comparisons/ranges and excluding missing numbers from numeric matches. Enrollment and Assignment use labelled enum choices, including inactive and unassigned records. Every data column supports server sorting; status sorting follows the displayed labels. Search matches full name, GR number or roll number. Column filters and sorting apply before server counts and paging. Context, search, filter and sort changes reset to page one and clear selection; page changes preserve filters and sort. Student and assignment/actions remain sticky when scrolling horizontally. Selection and action controls are excluded from export.

New assignments use one Formik form with a fixed Cancel, Preview and Assign Fees footer. The shared fee structure selector, fee-head rows and optional checkboxes are also used by Admissions Payment. Changing the structure, policies, fees or dates invalidates the preview. The final command must match the reviewed input fingerprint and token. Saved assignment corrections and policy edits continue to use their existing stepper.

The drawer follows Add Charge's shared section-card pattern, theme spacing and responsive fields. A single student has open Fees & Dates and Policies sections. Required fixed fees appear read-only and optional fees use checkboxes. Included variable fees use shared numeric inputs. Display amounts use `formatNumber`. Policy defaults, permitted overrides and reasons are shown together, and required reasons are validated before preview.

Bulk assignment uses a wider responsive workspace with a searchable, paginated selected-student list. During setup, the list shows names only and one common configuration applies the structure, policies, override reason, optional heads, amounts and service dates to every selected student. Student-specific transport records are unavailable in bulk because a verified record cannot be shared between students; academic-year or permitted custom dates remain available. Twenty student rows render per list page and the layout stacks at narrow widths. Final review retains individual server previews, readiness, needs-attention and committed status. Successfully committed students remain read-only; shared edits and retries affect only remaining students.

Service dates use `CustomDateRangePicker` in `DD/MM/YYYY` format. Inclusive calendar limits come from the selected structure's board inside the assignment academic year, with the selected academic-year limits available for legacy configurations. Authorized staff apply a complete custom range without entering a date-change reason. Verified transport records remain a separate action for individual students. Service boundaries preserve the selected calendar day when serialized to UTC midnight.

Assignment sections reuse the Policies View `DetailSection` and `DetailField` components for compact neutral icons, subtitle headings, uppercase field labels and body-sized values. Redundant help icons, policy-source tooltips and repeated structure context are omitted. Review places server-returned totals above the fee breakdown. Fee-head evidence uses an embedded three-column `CustomizableTable`; payment-term versions, policy names/versions and override reasons remain visible. Consequential warnings remain visible. The compact installment table groups existing server lines only when installment label, sequence, demand date and due date match, summing their recorded obligations and balances without repricing or rounding. The complete grouped installment schedule stays inline without a separate details dialog. Legacy assignments omit unknown configured amounts. Bulk review shows ready or confirmed totals separately for each currency. The final step shows canonical outcomes; bulk students can be selected to inspect their committed evidence. The student table uses shared status labels and `ThreeDotsActions`, an indeterminate page-selection checkbox and a clear-selection action; sorting unavailable in the server contract is disabled.

Changing any input invalidates the previous preview. Late preview responses are discarded. Failed commits retain an actionable error; identical network retries use the backend's saved result. Results offers Review remaining students after partial success and Close when all students succeed. The drawer blocks closing during requests and uses the shared `ConfirmDialog` before discarding unassigned changes. Successful assignments remain intact.

Preview and confirmation use an accessible busy overlay with the number of students being processed.
The bulk endpoint returns results together, so the client does not invent a completed-student count while waiting.
The local operation state keeps the drawer and navigation locked for the entire request.
Server-provided `previewExpiresAt` disables confirmation when any remaining preview expires and offers Review and refresh without losing inputs or successful results.
Older responses without this optional field continue to rely on server validation.
Each student has one canonical outcome; successful evidence replaces stale error labels.
An interrupted confirmation is labelled unconfirmed and can safely be retried with its original token, including after expiry, so the server can retrieve saved evidence.

## Editing unpaid assignments

The table pencil opens a saved admission fee selection for review and confirmation when it is pending finance. It also opens the three-step wizard for editable unpaid assignments with assignment Add access. Saved optional choices, variable amounts, verified periods and policy pins prefill the form. Staff can select another matching published structure and provide a change reason. The Fees & Dates step displays required dates and fixed amounts as read-only. Staff can enter variable amounts, select optional fees and adjust optional dates with the existing date permission. Deselecting an optional fee removes its unused obligations. After payment or protected downstream use, Step 1 supports permitted policy edits, Step 2 offers the optional-service actions, and Step 3 reviews the saved assignment and pending policy changes.

Assigned rows are selectable only when the server reports canEditStructure, the enrollment is active and the row has its original structure ID/revision. Selecting one limits further selection and page selection to the same original structure/revision; new assignments and corrections cannot mix. Bulk edits use one configuration while retaining each student's assignment identity, concurrency stamp and verified service evidence. Preview and commit use the existing endpoints with explicit editAssignmentId, assignmentConcurrencyStamp and editReason. The backend rechecks eligibility at save; partial-success retries retain successful results. Errors preserve unsaved inputs.

The opt-in synthetic browser fixture uses ?unpaidEdit for two unpaid saved assignments and ?unpaidEdit&paidEdit for a paid first student. It exercises production components without backend writes and does not prove financial calculations or transaction safety.

For an assigned recurring optional fee, **Cancel service** uses the separate StopOptionalService permission. Select the first day the service is no longer provided, enter the reason, and review the cancelled installment count and amount before confirming. The drawer shows the saved effective date and disables **Cancel service** once the stop is recorded.

In **Fees & dates**, staff with both assignment Add and StopOptionalService permissions can select **Enable service** for a stopped recurring optional fee. The dialog loads dates from the cancellation effective date, the monthly rate, and the versioned payment terms and proration policies from the assignment API. **Preview monthly breakdown** shows existing installments and their outstanding balances, alongside proration and the new assigned amount for uncovered months. Prepaid credit from cancelled installments is shown separately. **Confirm service restart** saves the reviewed period, including periods with zero new charges. An expired preview requires another review. Other failures keep the draft and confirmation retry uses the same request ID.

For an unselected recurring optional fee on a locked assignment, **Add service** opens the same date, monthly-rate, policy, and preview flow. The row reflects the new selection after confirmation.

In the table, **View assignment history** opens a read-only drawer for the selected student and academic year. Events are grouped by date, newest first. Expand an event to review assignment and policy changes and the changes for each fee head. Each field shows the recorded value and any previous value that changed. Expand installments within a fee head to see dates, charges and proration rules.

A successful restart returns to the saved assignment, shows the service as **Active** or **Scheduled** until its new end date passes, and keeps the previous cancellation visible. The mutation refreshes the affected student assignment and Collection views through RTK Query.

## Source and client ownership

| File | Responsibility |
|---|---|
| `src/redux/finance/studentFeeAssignment.ts` | Typed queries and preview/commit contracts; invalidates student admission and fee collection tags on successful commits |
| `src/screens/finance/FeeStructureAssign/index.tsx` | Page and year context |
| `Components/AssignmentDrawer.tsx` | Themed drawer, shared header, busy guard and discard confirmation |
| `Components/FeeStructureAssignTable.tsx` | Context filters, paging, eligible selection and year-specific assignment status |
| `Components/AssignmentWorkflow.tsx` | Shared single/bulk review, dirty state, stale-response protection, canonical outcomes and retry handling |
| `Components/AssignmentStudentInputs.tsx` | Optional heads, permitted amount/date inputs and verified transport record picker |
| `Components/AssignmentReview.tsx` | Read-only preview, inline evidence tables, totals and policy fields |
| `Components/assignmentReviewPresentation.ts` | Group matching recorded installments and aggregate totals separately by currency; no pricing rules |
| `Components/AssignmentPolicies.tsx` | Per-student policy defaults, version selection, restore and reason |
| `Components/AssignedPolicyEditor.tsx` | Concurrent policy edits with reason, busy/dirty guards and unchanged obligations |
| `Components/StudentFeeStructureAssignmentForm.tsx` / `BulkFeeStructureAssignmentForm.tsx` | Compatibility wrappers for existing collection/profile entry points |

The flow reads policy choices through the scoped assignment endpoint. Policy overrides use the existing exact `.OverridePolicies` permission. The visual refresh does not change role grants, monetary equations, API payloads, policy resolution, preview tokens or persisted financial evidence. It changes presentation only within the existing tenant/year/student scope and preview-to-commit state machine. The flow does not fabricate verified service dates or expose technical UUIDs as picker labels. Legacy views label missing evidence instead of displaying a reconstructed price or percentage.

## Checks

- `npm run ts` for client/component types.
- `node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run src/screens/finance/FeeStructureAssign/Components --pool=threads --maxWorkers=1` checks input behavior, recorded review amounts/balances, all installment rows, read-only policy fields, grouped schedule preservation, preview invalidation and partial-success retries.
- `node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run src/screens/finance/FeeStructureAssign/Components/AssignmentWorkflow.test.tsx src/components/custom-stepper/button-props.test.ts src/components/custom-stepper/formik-validation.test.ts --pool=threads` verifies required structure selection, Back/preview invalidation, busy navigation guards, token submission and failed-student-only bulk retry.
- `node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vite/bin/vite.js --config e2e/fixtures/fee-assignment/vite.config.mts` serves the synthetic component fixture on `127.0.0.1:4179` for in-app browser checks. Add `?assignedView` to preload a saved synthetic assignment for the View action and drawer checks. It uses real workflow components and RTK Query against a synthetic base query; it is not full-stack or calculation evidence.
- Verify light/dark themes, a narrow viewport, scrolling, optional-head preview changes, preserved 60/40 shares and canonical confirmation. The table should scroll locally on narrow screens and footer actions remain reachable.
- Production sign-off still requires authenticated FE/API/PostgreSQL checks, tenant/permission isolation and the backend deployment gates. No live financial writes were made during component verification.
