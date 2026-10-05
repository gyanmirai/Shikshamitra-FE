---
module: finance
domain: fee-assignment
content_type: How-to
status: active
updated_on: 2026-10-02
owner: frontend-team
audience: humans-and-agents
---

# Configure and assign variable fee heads

TL;DR: Finance settings no longer expose Module on Fee Heads or nested Fee Category heads.
Structure rows have independent Variable and Optional switches, and variable amounts are entered per student.
The [backend contract](../../../../Shikshamitra-BE/docs/modules/finance/references/variable-fee-assignment.md) owns validation and persistence.

## Staff flow

1. Create the Fee Head with its category and Income Category; no source or module selector is shown.
2. Add the head to a draft Fee Structure.
3. Enable Variable to hide and clear the configured amount; choose the Payment Term and version as usual.
4. Set Optional independently when some students may skip this head.
5. Save, review and publish; variable schedule previews show dates/percentages and an amount calculated during assignment.
6. Assign the published structure to students.
7. Required variable heads always show a student amount input.
8. Optional variable heads show the input only after selection; deselection clears its entered amount and service-period draft.
9. Enter the total for Payment Term coverage before Finance proration; enter a reason for an intentional zero amount.
10. Review the authoritative student preview, then confirm the assignment.

Switching Variable off requires a new fixed amount.
No module rate, route, stop, room, source mapping or provider selection is added to Finance settings.
The fixed subtotal is identified separately from variable heads awaiting student pricing.
Initial variable entry does not require fixed amount override permission.
Existing fixed override, policy and manual-date permissions are preserved.
Changing amounts or selections clears the old preview.

## UI and client ownership

| Surface | Source |
|---|---|
| Fee Head form | `src/screens/finance/settings/feeHead/Components/FeeHeadForm.tsx` |
| Nested Fee Category form/table | `src/screens/finance/settings/FeeCategory/Components/` |
| Variable structure switch, null preview labels and payment terms | `src/screens/finance/settings/FeeStructure/Components/FeeStructureWorkspaceCard.tsx` |
| Changed-only variable/amount PATCH | `src/screens/finance/settings/FeeStructure/feeStructureModel.ts` |
| Variable row input, null schedule labels and fixed row regression checks | `src/screens/finance/settings/FeeStructure/feeStructureFields.test.tsx` |
| Student selection and amount entry | `src/screens/finance/FeeStructureAssign/Components/AssignmentStudentInputs.tsx` |
| Pre-step validation | `src/screens/finance/FeeStructureAssign/Components/variableAssignmentValidation.ts` |
| Student review and workflow | `src/screens/finance/FeeStructureAssign/Components/AssignmentReview.tsx`, `AssignmentWorkflow.tsx` |
| Nullable structure and assignment contracts | `src/redux/finance/feeStructureWorkspace.ts`, `studentFeeAssignment.ts` |
| Admission intent display | `src/screens/student/admissions/fee-selection/` |

The assignment request keeps `selectedOptionalFeeHeadIds` as inclusion authority and sends `variableFeeHeads` entries only for included variable heads.
Empty amount inputs serialize as null, never numeric zero.
Older fixed structures normalize a missing `isVariable` to false.
Existing assigned obligations remain read-only in the assignment review.

## Focused checks

Run `npm run ts`, focused ESLint, `npm run docs:check`, and the structure model, variable assignment validation, nested category initial-values, and assignment workflow Vitest suites.
On Windows use the existing `src/test/patch-vite-windows-net-use.cjs` wrapper and one worker if startup times out.
Finish with the in-app browser: verify no Module field, Variable hides Amount, Payment Term remains, Optional selection controls amount visibility, missing amounts block Next, and preview/retry behavior retains fixed fees.
Browser checks that require a signed-in API session must be reported as unverified if that session is unavailable.

## Local verification on 2 October 2026

The structure model (15), variable assignment validation (10), category initial values (2),
assignment workflow (10), and variable student input (2) tests passed in focused runs.
The structure input and publication review suite also passed (10), including the existing
fixed fee cases and new Variable toggle/null-preview cases: 49 passing frontend tests in total.
The finance documentation check passed.

The in-app browser verified real structure and assignment components using synthetic fixture data:
Variable hides and clears Amount, Payment Term stays selected, Optional remains independent,
the draft saves without a variable amount, and publication review labels monetary values as calculated during assignment.
For assignments, required blank amounts block Next, selecting an optional variable head reveals a required input,
deselection clears it, and a preview with Tuition 12,000 plus Hostel 6,000 excludes skipped Transport.
The synthetic confirmation succeeded. These browser checks performed no backend writes.
An authenticated live frontend-to-API assignment was not verified because the local app is at its login screen.

The full TypeScript check reports two existing `ReferenceFileUploadProps.primaryText` errors in
the academic homework and assignment forms; no Finance type errors were reported.
The all-module documentation check also reports pre-existing issues outside Finance.
A full production frontend build is not certified until those checks are clean.
