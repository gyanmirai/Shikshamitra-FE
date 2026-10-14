---
module: finance
domain: student-fee-assignment
content_type: Reference
status: canonical
updated_on: 2026-10-13
owner: frontend-team
audience: humans-and-agents
---

# Student fee assignment workspace

The `/finance/fee-structure-assign` route lists assignment status for the selected academic year and academic scope. The route/menu/table require `Finance.Fees.StructureAssign.View`; create controls additionally require `.Add`. Backend contracts and financial invariants belong to [the backend assignment reference](../../../../Shikshamitra-BE/docs/modules/finance/references/student-fee-assignment.md).

## User flow

1. Select academic context and students. Selection clears when context, search or page changes. Assigned students open a read view; inactive students cannot be selected for creation.
2. Open the themed assignment drawer with the shared `DrawerHeader`. Select a published structure revision, then choose Next.
3. Review each student's mandatory heads and select optional heads separately. Fixed published amounts appear as read-only values, not inputs. Included variable heads require a student coverage amount; zero requires a reason. Configure supported verified transport dates or authorized manual service dates with the existing permission gates.
4. Review **Policies** for each student: Refund and Collection use the structure's supported pinned selections. With `Finance.Fees.StructureAssign.OverridePolicies`, choose current active versions for the selected year or clear an optional refund policy. Collection remains required. Changes require a reason; Restore fee structure defaults clears student overrides. Historical concession and proration evidence remains in the contracts, but these families cannot be selected here.
5. Preview. Each student receives an independent result/error. Review head totals, dates, preserved installment percentages, payment-term versions and policy treatment.
6. Confirm successful previews. The server returns canonical results and the client preserves successful students when retrying failed items.
7. Open **View assignment** to see current policy selections and any historical proration evidence, their names/versions and override reason. **Edit assigned policies** requires `.OverridePolicies`, saves with a concurrency stamp and invalidates assignment and collection/detail caches. Existing dues and receipts remain unchanged. Historical proration pins remain unchanged; proration cannot be selected in this form.

The compact academic filter card follows `DESIGN.md` with `Paper`, `p: 1` and `spacing={1}`. Board, medium, class and division fill the row on desktop and stack on mobile. The shared table fills the remaining height; its controlled page index is zero-based while its server callback is one-based.

`CustomStepperWithFormik` owns the form values across Structure, Heads and service, Policies, Review and Results. Each step renders its own content. Back preserves values and invalidates the previous preview; another preview is required before confirmation. There is no draft-save action. Small themed buttons have leading Iconify icons, and the stepper owns scrolling and its action footer.

The drawer uses shared `FormSectionHeader` guidance and `Label` statuses. Mandatory heads have readable headings instead of disabled checkboxes; optional selection retains its checkbox. Variable amounts and service controls use a responsive two-column grid. Policy choices sit side by side on desktop and stack on mobile. Completed setup steps can be revisited before any assignment is committed; doing so preserves form values and invalidates preview evidence. The first step offers Cancel through the owning close/discard guard.

Review starts with server-returned obligation, configured schedule and service reduction. Fee-head evidence and installment balances use embedded `CustomizableTable` instances with no hidden pagination or toolbar. The drawer body owns vertical scrolling and each table contains horizontal overflow. Policy names and versions remain visible in a collapsed disclosure; head treatment expands on demand. Legacy assignments omit unknown configured amounts and label unknown shares. The student table uses shared status labels and `ThreeDotsActions`, an indeterminate page-selection checkbox and a clear-selection action; sorting unavailable in the server contract is disabled.

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
| `Components/AssignmentReview.tsx` | Human-readable immutable evidence, totals, policies and balances |
| `Components/AssignmentPolicies.tsx` | Per-student policy defaults, version selection, restore and reason |
| `Components/AssignedPolicyEditor.tsx` | Concurrent policy edits with reason, busy/dirty guards and unchanged obligations |
| `Components/StudentFeeStructureAssignmentForm.tsx` / `BulkFeeStructureAssignmentForm.tsx` | Compatibility wrappers for existing collection/profile entry points |

The flow reads policy choices through the scoped assignment endpoint. Policy overrides use the existing exact `.OverridePolicies` permission. The visual refresh does not change role grants, monetary equations, API payloads, policy resolution, preview tokens or persisted financial evidence. It changes presentation only within the existing tenant/year/student scope and preview-to-commit state machine. The flow does not fabricate verified service dates or expose technical UUIDs as picker labels. Legacy views label missing evidence instead of displaying a reconstructed price or percentage.

## Checks

- `npm run ts` for client/component types.
- `node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run src/screens/finance/FeeStructureAssign/Components --pool=threads` checks input behavior, recorded review amounts/balances, all installment rows, policy disclosure, preview invalidation and partial-success retries.
- `node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run src/screens/finance/FeeStructureAssign/Components/AssignmentWorkflow.test.tsx src/components/custom-stepper/button-props.test.ts src/components/custom-stepper/formik-validation.test.ts --pool=threads` verifies required structure selection, Back/preview invalidation, busy navigation guards, token submission and failed-student-only bulk retry.
- `node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vite/bin/vite.js --config e2e/fixtures/fee-assignment/vite.config.mts` serves the synthetic component fixture on `127.0.0.1:4179` for in-app browser checks. It uses real workflow components and RTK Query against a synthetic base query; it is not full-stack or calculation evidence.
- Verify light/dark themes, a narrow viewport, scrolling, optional-head preview changes, preserved 60/40 shares and canonical confirmation. The table should scroll locally on narrow screens and footer actions remain reachable.
- Production sign-off still requires authenticated FE/API/PostgreSQL checks, tenant/permission isolation and the backend deployment gates. No live financial writes were made during component verification.
