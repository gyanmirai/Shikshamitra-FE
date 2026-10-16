---
module: finance
domain: student-fee-assignment
content_type: Reference
status: canonical
updated_on: 2026-10-15
owner: frontend-team
audience: humans-and-agents
---

# Student fee assignment workspace

The `/finance/fee-structure-assign` route lists assignment status for the selected academic year and academic scope. The route/menu/table require `Finance.Fees.StructureAssign.View`; create controls additionally require `.Add`. Backend contracts and financial invariants belong to [the backend assignment reference](../../../../Shikshamitra-BE/docs/modules/finance/references/student-fee-assignment.md).

## User flow

For a single student, the drawer header identifies the student; the body does not repeat their name at each step. Step one exposes an icon-only **Edit policies** action on the right of the Policies heading, gated by the existing policy-override permission. The finish-editing icon returns to the summary without discarding values. Both actions have accessible names and tooltips. Step two edits fees and dates directly. Custom start date, end date and reason share one desktop row and stack on narrow screens. Academic-year dates are available through the shared select's option information rather than a repeated helper line. The final preview puts the fee structure above its totals and uses **Payment Term** and **Assigned Amount** column labels.

1. Select academic context and students. Selection clears when context, search or page changes. Assigned students open a read view; inactive students cannot be selected for creation.
2. Open the themed assignment drawer with the shared `DrawerHeader`. Select a published structure revision and review per-student policies before choosing Next.
3. Review each student's mandatory heads and select optional heads separately. Fixed published amounts appear as read-only values, not inputs. Included variable heads require a student coverage amount; zero requires a reason. Configure supported verified transport dates or authorized manual service dates with the existing permission gates.
4. Review **Policies** for each student: Refund and Collection use the structure's supported pinned selections. With `Finance.Fees.StructureAssign.OverridePolicies`, choose current active versions for the selected year or clear an optional refund policy. Collection remains required. Changes require a reason; Restore fee structure defaults clears student overrides. Historical concession and proration evidence remains in the contracts, but these families cannot be selected here.
5. Preview. Each student receives an independent result/error. Review head totals, dates, preserved installment percentages, payment-term versions and policy treatment.
6. Confirm successful previews. The server returns canonical results and the client preserves successful students when retrying failed items.
7. Open **View assignment** to see current policy selections and any historical proration evidence, their names/versions and override reason. **Edit assigned policies** requires `.OverridePolicies`, saves with a concurrency stamp and invalidates assignment and collection/detail caches. Existing dues and receipts remain unchanged. Historical proration pins remain unchanged; proration cannot be selected in this form.

The compact academic filter card follows `DESIGN.md` with `Paper`, `p: 1` and `spacing={1}`. Board, medium, class and division fill the row on desktop and stack on mobile. The shared table fills the remaining height; its controlled page index is zero-based while its server callback is one-based.

The student table offers Student (full name), GR No., Class/Division, Roll No., Enrollment and Assignment by default. Columns also exposes Board, Medium, Academic Stage, Class and Division. Text columns use text operators; Roll No. uses numeric comparisons/ranges and excludes missing numbers from numeric matches. Enrollment and Assignment use labelled enum choices, including inactive and unassigned records. Every data column supports server sorting; status sorting follows the displayed labels. Search matches full name, GR number or roll number. Column filters and sorting apply before server counts and paging. Context, search, filter and sort changes reset to page one and clear selection; page changes preserve filters and sort. Student and assignment/actions remain sticky when scrolling horizontally. Selection and action controls are excluded from export.

`CustomStepperWithFormik` owns the form values across exactly three steps: Structure & policies, Fees & dates, and Review & assign. Results are displayed within the third step. Editing is available only in the first two steps; the third step contains a read-only preview and final assignment action, with no section Edit buttons. Back and completed-step navigation preserve values and invalidate the previous preview; another preview is required before assignment. There is no draft-save action. Small themed buttons have leading Iconify icons, and the stepper owns scrolling and its action footer.

The drawer follows Add Charge's shared section-card pattern, theme spacing and responsive fields. A single student has open Fees & dates and Policies sections, with no student accordion or collapsed fee controls. Required fixed fees remain read-only; optional fees retain their checkboxes. Included variable fees use shared numeric inputs. Display amounts use `formatNumber`; payload amounts are unchanged. Policy defaults, permitted overrides and reasons are available together in step one. Override reasons are validated before advancing. The duplicate Select fee structure heading is omitted. Fees & dates uses compact shared-card spacing and responsive fee/control columns.

Bulk assignment uses a wider responsive workspace with a searchable, paginated selected-student list and one active student's configuration or review. The list shows readiness, needs-attention and committed status. Switching students preserves their own Formik requests and policy reasons; only the published structure is shared. Twenty student rows render per list page. The layout stacks at narrow widths. Successfully committed students remain read-only, and retries include only remaining students.

Manual service dates use general MUI `DatePicker` controls in `DD/MM/YYYY` format. Their inclusive limits come from the globally selected year's configured `startDate` and `endDate`, never its name or an assumed April–March range. Year IDs must match the assignment context. Start/end validity, year bounds, date order and the override reason are checked before leaving Fees & dates, including typed dates. Missing bounds disable manual date entry. Service boundaries serialize as the selected calendar day at UTC midnight, matching the backend contract. Academic holidays do not block service-period boundaries. The backend remains authoritative for date scope and verified transport evidence.

Assignment sections reuse the Policies View `DetailSection` and `DetailField` components for compact neutral icons, subtitle headings, uppercase field labels and body-sized values. Redundant help icons, policy-source tooltips and repeated structure context are omitted. Review places server-returned totals above the fee breakdown. Fee-head evidence uses an embedded three-column `CustomizableTable`; payment-term versions, policy names/versions and override reasons remain visible. Consequential warnings remain visible. The compact installment table groups existing server lines only when installment label, sequence, demand date and due date match, summing their recorded obligations and balances without repricing or rounding. The plain eye-and-text View all action opens every original installment, share and balance in a shared read-only `CustomDialog`. Preview uses a compact medium-width dialog; saved balances retain the wider layout. Shared, keyboard-focusable info icons explain installment shares, demand dates, due dates, obligations and recorded row calculations; repeated row explanation text is omitted. Closing this dialog preserves the parent form dirty state. Legacy assignments omit unknown configured amounts and label unknown shares. Bulk review shows ready or confirmed totals separately for each currency. The final step shows canonical outcomes; bulk students can be selected to inspect their committed evidence. The student table uses shared status labels and `ThreeDotsActions`, an indeterminate page-selection checkbox and a clear-selection action; sorting unavailable in the server contract is disabled.

Changing any input invalidates the previous preview. Late preview responses are discarded. Failed commits retain an actionable error; identical network retries use the backend's saved result. Results offers Review remaining students after partial success and Close when all students succeed. The drawer blocks closing during requests and uses the shared `ConfirmDialog` before discarding unassigned changes. Successful assignments remain intact.

## Source and client ownership

| File | Responsibility |
|---|---|
| `src/redux/finance/studentFeeAssignment.ts` | Typed queries and preview/commit contracts; invalidates student admission and fee collection tags on successful commits |
| `src/screens/finance/FeeStructureAssign/index.tsx` | Page and year context |
| `Components/AssignmentDrawer.tsx` | Themed drawer, shared header, busy guard and discard confirmation |
| `Components/FeeStructureAssignTable.tsx` | Context filters, paging, eligible selection and year-specific assignment status |
| `Components/AssignmentWorkflow.tsx` | Shared single/bulk review, dirty state, stale-response protection, canonical outcomes and retry handling |
| `Components/AssignmentStudentInputs.tsx` | Optional heads, permitted amount/date inputs and verified transport record picker |
| `Components/AssignmentReview.tsx` | Read-only preview, shared evidence tables/dialog, totals and policy fields |
| `Components/assignmentReviewPresentation.ts` | Group matching recorded installments and aggregate totals separately by currency; no pricing rules |
| `Components/AssignmentPolicies.tsx` | Per-student policy defaults, version selection, restore and reason |
| `Components/AssignedPolicyEditor.tsx` | Concurrent policy edits with reason, busy/dirty guards and unchanged obligations |
| `Components/StudentFeeStructureAssignmentForm.tsx` / `BulkFeeStructureAssignmentForm.tsx` | Compatibility wrappers for existing collection/profile entry points |

The flow reads policy choices through the scoped assignment endpoint. Policy overrides use the existing exact `.OverridePolicies` permission. The visual refresh does not change role grants, monetary equations, API payloads, policy resolution, preview tokens or persisted financial evidence. It changes presentation only within the existing tenant/year/student scope and preview-to-commit state machine. The flow does not fabricate verified service dates or expose technical UUIDs as picker labels. Legacy views label missing evidence instead of displaying a reconstructed price or percentage.

## Checks

- `npm run ts` for client/component types.
- `node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run src/screens/finance/FeeStructureAssign/Components --pool=threads --maxWorkers=1` checks input behavior, recorded review amounts/balances, all installment rows, read-only policy fields, grouped schedule preservation, preview invalidation and partial-success retries.
- `node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run src/screens/finance/FeeStructureAssign/Components/AssignmentWorkflow.test.tsx src/components/custom-stepper/button-props.test.ts src/components/custom-stepper/formik-validation.test.ts --pool=threads` verifies required structure selection, Back/preview invalidation, busy navigation guards, token submission and failed-student-only bulk retry.
- `node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vite/bin/vite.js --config e2e/fixtures/fee-assignment/vite.config.mts` serves the synthetic component fixture on `127.0.0.1:4179` for in-app browser checks. It uses real workflow components and RTK Query against a synthetic base query; it is not full-stack or calculation evidence.
- Verify light/dark themes, a narrow viewport, scrolling, optional-head preview changes, preserved 60/40 shares and canonical confirmation. The table should scroll locally on narrow screens and footer actions remain reachable.
- Production sign-off still requires authenticated FE/API/PostgreSQL checks, tenant/permission isolation and the backend deployment gates. No live financial writes were made during component verification.
