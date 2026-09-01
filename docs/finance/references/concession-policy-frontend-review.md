---
module: finance
domain: concession-policy-frontend-review
content_type: Reference
status: proposed
updated_on: 2026-09-01
owner: frontend-team
audience: humans-and-agents
---

# Review the Concession Policy frontend and target workflow

TL;DR: the current Concession Policy drawer is a strong visual prototype, but it is not yet an end-to-end feature.
Its generic API is not implemented, its fields do not match the list/detail views, it is not connected to fee-structure assignment or concession requests, and several paid-fee options cross into refund/accounting behavior.
Use the [canonical backend flow](../../../../Shikshamitra-BE/docs/modules/finance/references/concession-policy-flow.md) for product rules and this page for frontend corrections and screen behavior.

## Reviewed surfaces

| Surface | Source |
|---|---|
| Route and permission guard | `src/app/(auth-route)/finance/(Policies)/concession-policy/**` |
| Workspace and table | `src/screens/finance/policies/workspaces/ConcessionPolicyWorkspace.tsx`, `src/screens/finance/policies/components/FinancePolicyTable.tsx` |
| Drawer | `src/screens/finance/policies/components/ConcessionPolicyDrawer.tsx` |
| Form state and simulation | `src/screens/finance/policies/hooks/useConcessionPolicyForm.ts` |
| Drawer sections | `src/screens/finance/policies/components/concession/**` |
| Types | `src/screens/finance/policies/types/finance-policy.types.ts` |
| Generic policy client | `src/redux/finance/financePolicy.ts` |
| Fee-structure policy UI | `src/screens/finance/settings/FeeStructure/Components/FeePoliciesTab.tsx` |
| Student fee assignment | `src/screens/finance/FeeStructureAssign/**` |
| Concession Type | `src/screens/finance/settings/ConcessionTypeSetting/**` |
| Student request | `src/screens/finance/Concession/**` |
| Approval allocation | `src/screens/finance/ConcessionAdmin/ConcessionFeeHeadApprovalView.tsx` |
| Current request client | `src/redux/finance/ConcessionManagement/**` |

## Current end-to-end reality

```text
Concession Type setup
        |
        v
Student has assigned Fee Structure -> generated DueFee rows
        |
        v
Create Concession Request
  - select Concession Type
  - select fee heads
  - manually choose amount or percentage per head
  - upload Type-required documents
        |
        v
Approver selects eligible DueFee rows
        |
        v
Backend applies approved allocations to outstanding dues
```

The Concession Policy route is currently outside that chain:

```text
Concession Policy drawer -> generic /finance-policies client -> no dedicated backend contract
```

It does not currently provide data to Concession Type, Fee Structure, student assignment, request creation, approval, collection, refund, receipt, or reports.

## What is good in the current drawer

- The form is separated into identity, calculation, fee-head scope, and application behavior.
- Conditional calculation fields are easy to understand.
- Selected fee-head mode uses a searchable multi-select.
- The summary panel makes the intended impact visible.
- Unsaved-change confirmation is present.
- The UI already anticipates version history, audit, clone, archive, and dependency checks in the shared policy table.
- The approval UI already works at `DueFee` line level, which is the correct operational grain.

These parts can be retained after the contract and terminology are corrected.

## Critical gaps

| Priority | Gap | Evidence and impact |
|---|---|---|
| P0 | No backend Concession Policy contract | `financePolicy.ts` calls generic `/finance-policies`; `FinancePolicyTable.tsx` states only Collection Policy has a real backend |
| P0 | No request integration | `ConcessionRequestForm.tsx` loads Concession Types and accepts manual per-head values; it never loads a policy |
| P0 | No assignment integration | assignment payload contains structure, optional heads, and head details only; no policy snapshot is returned or displayed |
| P0 | Permission mismatch | frontend maps Concession Policy to `Finance.Fees.FeeCollections`; backend defines `Finance.Policies.ConcessionPolicy.*` |
| P0 | Client simulation is not authoritative | calculation is in a React hook, uses JavaScript numbers, and can differ from ledger balances and backend rounding |
| P0 | Paid-fee options mix domains | refund, wallet, credit note, and future adjustment require separate refund/credit/accounting records not present in the concession policy contract |
| P1 | Policy lifecycle is inconsistent | form defaults to `Active`, status dropdown exposes Active/Archived, types include Draft/Published, and the footer only shows Submit |
| P1 | Active edit is unsafe | list can edit non-archived policies directly; published versions must be immutable |
| P1 | Hidden required concepts | academic year, effective dates, policy code, and `concessionType` exist in state/types but are not fully presented or validated |
| P1 | Fee Structure cannot attach Concession Policy | `FeePoliciesTab.tsx` includes payment, collection, refund, and proration only |
| P1 | One policy would be insufficient | a fee structure can support several concession programs; use multiple attachments, not one `concessionPolicyId` |
| P1 | List/detail contract differs from drawer | table/detail use `eligibilityType`, `discountType`, `discountValue`, `maximumDiscountAmount`, and stacking fields absent from the new form |
| P1 | Dependent fields are optional | paid adjustment, pending handling, future strategy, and wallet head are not required when their selected modes need them |
| P1 | Dummy fee heads can enter an active route | `ConcessionFeeHeadsSection.tsx` falls back to hardcoded head IDs when the API returns none |
| P1 | Existing fee-head requests calculate annual totals | the requester sees fee-head annual amounts while approval applies to due rows; timing rules are therefore not expressed at request time |
| P2 | Table filters do not reflect all lifecycle states | table filter presents Active/Archived although generic types include Draft and Published |
| P2 | Policy code generation is unstable | code uses `Date.now()` in the browser and is neither visible nor server-validated |
| P2 | Error handling hides useful server failures | create/update catches errors and shows a generic failure message without stable business-code mapping |

## Current field review

### General information

| Current field | Keep/change | Required frontend behavior |
|---|---|---|
| Policy Name | Keep | Show uniqueness check from backend; trim; 3-100 characters |
| Status | Replace | Do not edit status in the form; show read-only lifecycle badge and separate Save Draft, Publish, Archive actions |
| Description | Keep | Optional, maximum 500, sanitized by server |
| Default Concession Policy | Rename | Use `Request default`; explain that it preselects a request but never grants money |
| Policy Code | Show | Server-generated suggestion or user-confirmed code; read-only after first publish |
| Academic Year | Show | Required, read-only from current context after draft creation, with explicit label |
| Concession Type | Add visible selector | Required and filtered to active types in the same academic year |
| Effective From/To | Add | Required publication controls using date-only semantics |
| Academic scope | Add | Board, medium, stage/class, division with clear `All` meaning and cascading validation |

### Eligibility

The current drawer has no eligibility section even though the list displays an eligibility column.

Add a dedicated section with:

- eligibility mode: manual review, rule validated, or verified entitlement;
- student/admission categories where supported;
- controlled merit, sibling, employee-dependent, and income rules;
- request window;
- evidence checklist inherited from Concession Type;
- a plain-language eligibility summary and missing-source behavior.

Avoid a generic arbitrary condition builder until all source facts and operators have typed backend contracts.

### Calculation rules

| Current field | Keep/change | Required behavior |
|---|---|---|
| Calculation Method | Keep with rename | Percentage, Fixed Total, Full Waiver, Manual Capped |
| Percentage Value | Keep | Greater than 0 and at most 100; decimal precision specified |
| Fixed Amount | Keep | Means one total award, not an amount per fee head |
| Calculation Base | Simplify | Original Eligible Amount or Outstanding Eligible Amount |
| Round Off | Keep | Preview comes from backend; labels explain currency precision |
| Minimum Concession | Remove/rename | Prefer Minimum Qualifying Base; add Maximum per Request, Annual Cap, and Maximum Percentage |
| Manual method | Restrict | Require manual cap, reason, and exact permission; normal requesters cannot override a published formula |

The current readiness check requires values greater than zero while Yup permits zero.
Use one shared schema/contract so field error, validation summary, and Publish button agree.

### Applicable fee heads

| Current behavior | Target behavior |
|---|---|
| Entire structure or selected fee heads | All eligible heads or selected heads, with exclusions for non-concessionable heads |
| Hardcoded fallback heads | Explicit loading, empty, error, and retry states; never substitute dummy financial data |
| IDs only | Display category, recurring/one-time, optional/mandatory, module owner, and compatibility count |
| Clears selection when switching to entire structure | Preserve draft selection in local state if switching back, but omit it from payload while all-head mode is active |

Optional additions are per-head cap, include/exclude flag, and allocation priority.

### Application behavior

Replace the current overlapping `Apply Concession On` choices.

| Current value | Target treatment |
|---|---|
| Pending Fees Only | Rename to All Outstanding Dues |
| Current Installment Only | Keep after the backend defines current installment by demand/coverage date |
| Future Installments Only | Keep after the backend defines future consistently |
| Entire Fee Structure | Move to fee-head scope; it is not a timing rule |
| Paid Fees Only | Remove from ordinary concession policy |
| Paid + Pending | Replace with a separate retroactive-benefit workflow |

Remove `Pending Fee Handling` from ordinary user configuration.
The allocation method should directly define Oldest Due First, Pro Rata Outstanding, Newest Due First, or Installment Priority.

Do not show refund, wallet, or credit-note behavior until dedicated backend ledgers and permissions exist.
When added later, present it as `Excess retroactive benefit settlement`, not as a concession calculation field.

### Approval, stacking, and controls

Add:

- exclusive or capped stacking mode and group;
- maximum active grants and annual student cap;
- single/two-level/verified-auto approval mode;
- approval threshold and above-threshold explanation;
- budget reference if budget control is enabled;
- renewal rule, normally new request each academic year;
- reason requirements for manual, override, publish, archive, reject, and reverse actions.

## Simulation review

The current simulation has these defects:

- it calculates with client JavaScript numbers instead of server decimals;
- `OriginalFee` and `FeeHeadAmount` currently use the same input;
- fixed amount ignores the selected calculation base;
- full waiver adds paid and pending values even though the new outstanding is calculated only from pending;
- the late-fee input is returned but does not affect the displayed equation;
- minimum concession can exceed the eligible base;
- rounding is always finally `Math.round`, regardless of selected round-off rule;
- it does not model multiple fee heads, installments, previous concessions, caps, stacking, or current due balances.

Replace it with `POST /api/concession-policies/{id}/simulate` for policy setup and `POST /api/concession-requests/preview` for a real student.

The policy simulator should accept scenario inputs only and label them `Example scenario`.
The request preview must load canonical student due rows and return:

- eligible and excluded lines with reasons;
- original, paid, existing concession, adjustment, late fee, and outstanding;
- raw formula result, each cap applied, and final amount;
- deterministic allocation and post-concession balance;
- calculation version/hash and warnings.

## Target screen flow

### 1. Create a Concession Type

Keep this setup focused on reason/category and evidence.

1. Enter stable name/code and description.
2. Define required document names, formats, and size limits.
3. Activate or archive the type through its own lifecycle.
4. Do not enter discount amount or percentage here.

### 2. Create and publish a Concession Policy

1. Choose academic year and Concession Type.
2. Configure academic/eligibility scope.
3. Configure formula and caps.
4. Configure eligible fee heads and installment timing.
5. Configure stacking and approval controls.
6. Run server simulation.
7. Save Draft.
8. Publish with confirmation and reason.

After publish, Edit creates a new draft version.

### 3. Attach policies to a Fee Structure

Add a Concession Programs block to the existing Policies tab.

1. List compatible published policies grouped by Concession Type.
2. Allow multiple selection.
3. Show code, version, effective dates, scope, formula summary, and compatible head count.
4. Allow one request-default attachment per type.
5. Block locking if an attachment is expired, incompatible, or outside the structure year/scope.

The helper text must say that attachments make programs available; they do not discount the fee structure.

### 4. Assign the Fee Structure to a student

Extend the assignment preview with:

- locked structure/version and academic year;
- gross fee-head/installment schedule;
- available concession programs resolved by the server;
- verified entitlements and whether they will create a request;
- gross total, approved concession applied now, and net outstanding.

Normal assignment sends no caller-calculated concession amount.
The response returns snapshotted policy versions and any system-created request/grant references.

### 5. Create a student Concession Request

Replace manual type-first configuration with policy resolution:

1. Select student.
2. Load available programs.
3. Choose a policy; show its Concession Type, version, scope, formula, caps, and evidence.
4. Capture reason and documents.
5. Show eligible due lines; allow selection only if the policy permits requester choice.
6. For Manual Capped only, capture requested amount with reason.
7. Load server preview.
8. Save Draft or Submit.

The amount/percentage toggle in `ValueEntryStep.tsx` must disappear for formula-based policies.

### 6. Review and approve

Retain the due-line approval layout but add policy context, eligibility results, evidence verification, existing benefits, caps, and preview hash.

The approver can reduce proposed allocations.
Increasing or overriding requires a distinct permission and reason.
If a payment or another concession changed the due balance, show a conflict banner and force preview refresh.

### 7. Collection and student fee details

Display every due line as:

`Original | Concession | Adjustment | Paid | Late fee | Outstanding`

Show policy name/version and grant/request link in concession details.
Receipts should show concession as a non-cash reduction but must not imply it was part of the received payment.

### 8. Correct an approved concession

Do not expose Delete or Cancel for approved requests.
Show Reverse Concession only with permission.
Require reason, impact preview, and confirmation, then display linked reversing allocations and any balance conflict.

## Frontend contract mapping

Replace broad `any` payloads with generated or handwritten exact types.

| Frontend model | Important fields |
|---|---|
| Policy list row | ID, code, name, type, version, effective dates, scope summary, formula summary, usage counts, lifecycle |
| Policy draft form | Typed identity, eligibility, calculation, head scope, timing, stacking, approval, concurrency token |
| Simulation request/response | Scenario lines and server calculation explanation |
| Fee-structure attachment | Structure version ID, policy version ID, request-default, priority |
| Student options | Policy/version, resolver source, eligibility result, exclusion reasons, evidence |
| Request preview | Due rows, eligible bases, formula, caps, allocations, totals, calculation hash |
| Approval command | Request ID, allowed allocation reductions, reason, calculation hash, idempotency key |

Use distinct RTK Query tags for policy list/detail/version, attachments, student options, request list/detail/preview, approval context, fee details, and reports.
Approval invalidates request, approval context, student fee details, fee collection, dashboard, audit, and report projections as applicable.

## Permission corrections

The frontend currently defines:

`financePermissions.policies.concessionPolicy = Finance.Fees.FeeCollections`

That must be replaced with exact backend policy permissions.
Menu and layout use View; buttons use their own action permission.

| UI action | Permission intent |
|---|---|
| Open policy list/details | ConcessionPolicy.View |
| Create draft | ConcessionPolicy.CreateDraft |
| Edit draft | ConcessionPolicy.EditDraft |
| Simulate | ConcessionPolicy.Simulate |
| Publish | ConcessionPolicy.Publish |
| Archive/restore | ConcessionPolicy.Archive/Restore |
| Clone | ConcessionPolicy.Clone |
| Versions/audit | ConcessionPolicy.ViewVersions/ViewAudit |
| Attach to structure | ConcessionPolicy.ManageAttachment plus FeeStructure edit |
| Submit request | ConcessionRequest.Submit |
| Approve/reject | ConcessionRequest.Approve/Reject |
| Reverse | ConcessionGrant.Reverse |

Do not copy the current broad alias as precedent.

## Loading, empty, error, and disabled states

| State | Required UI |
|---|---|
| No academic year | Block create and explain how to select a year |
| No Concession Types | Link to type setup; do not allow publish |
| No fee heads | Show setup dependency; do not load dummy heads |
| No eligible policies for student | Explain scope, assignment, request window, and eligibility exclusions |
| Policy API unavailable | Error/retry state; do not show an empty list as a valid result |
| Publish disabled | List every unmet requirement and focus the first invalid section |
| Attached/in-use policy | Disable hard delete and explain usage counts; offer new version/archive where allowed |
| Balance conflict | Show changed lines and reload preview |
| Forbidden | Deliberate route/action forbidden state without data leakage |

## Implementation sequence

| Phase | Frontend work | Dependency |
|---|---|---|
| 0 | Mark route partial and remove misleading production assumptions | Product decision |
| 1 | Add exact types, permissions, dedicated client, errors, draft/publish lifecycle | Backend policy contract |
| 2 | Rebuild drawer sections and server simulation | Policy APIs |
| 3 | Add multi-policy Fee Structure attachments | Attachment APIs |
| 4 | Add assignment policy/entitlement preview | Assignment snapshot response |
| 5 | Integrate request options and server preview; remove free amount/percent for formula policies | Resolver and request APIs |
| 6 | Enhance approval context, concurrency handling, and invalidation | Approval contract |
| 7 | Add grant links, reversal UI, collection/receipt/report visibility | Ledger/reversal/report APIs |
| 8 | Remove legacy generic policy client and reconcile old request UI | Migration complete |

## Frontend test matrix

| Area | Tests |
|---|---|
| Policy form | Conditional fields, one schema, draft save, publish gate, effective dates, selected heads, caps, stacking |
| Permissions | Menu, route, query, and every action allowed/denied independently |
| Simulation | Request mapper, response display, stale response cancellation, backend error mapping |
| Attachments | Multiple policies, one default per type, incompatible scope/head, locked structure |
| Assignment | No silent discount, snapshot summary, auto-entitlement result, bulk per-item result |
| Request | Policy filtering, evidence, manual-capped only input, eligible lines, preview hash |
| Approval | Maker-checker, threshold action, reduce-only allocation, balance conflict, double click/idempotent outcome |
| Ledger UI | Original/concession/adjustment/paid/late/outstanding remain distinct |
| Correction | Approved requests cannot edit/delete/cancel; reversal requires reason and permission |
| E2E | Type -> policy draft -> publish -> attach -> assign -> request -> approve -> collect -> receipt -> report |

## Product decisions that must not remain ambiguous

The canonical backend specification recommends defaults for these questions:

| Question | Recommended answer |
|---|---|
| Does assignment automatically apply a default concession? | No; default means request preselection only |
| Can a fee structure have more than one policy? | Yes, zero or more published versions |
| Can requesters choose amount or percentage? | Only Manual Capped policies allow an amount; formula policies are read-only |
| Can concessions apply to late fees? | No; Collection Policy waiver owns late fees |
| Can concessions apply to paid fees? | Only through a later retroactive credit/refund design, not ordinary due allocation |
| Can active policies be edited? | No; create a new draft version |
| Can approved requests be cancelled? | No; use a linked reversal |
| What happens if balances change before approval? | Conflict and refreshed preview |
| What does Entire Fee Structure mean? | Fee-head scope only, not payment state or installment timing |
| What happens when no policy resolves? | No program available; never silently use an unrelated default |

## Frontend completion checklist

- [ ] Route is backed by a dedicated typed API.
- [ ] Exact Concession Policy permissions replace Fee Collection aliases.
- [ ] List, drawer, details, version, and audit fields use one contract.
- [ ] Drawer distinguishes Save Draft, Publish, and Archive.
- [ ] Concession Type, academic scope, effective dates, eligibility, caps, stacking, and approval controls are visible.
- [ ] Fee-head API has loading/error/empty states and no dummy fallback.
- [ ] Simulation and request preview are server authoritative.
- [ ] Fee Structure supports multiple policy attachments.
- [ ] Assignment displays available programs without silently reducing gross fees.
- [ ] Request selects an eligible policy version and captures evidence.
- [ ] Formula policies remove the free amount/percentage toggle.
- [ ] Approval displays policy, eligibility, caps, due lines, and concurrency state.
- [ ] Collection, receipts, audit, and reports link to the applied grant/version.
- [ ] Approved corrections use reversal, not edit/delete/cancel.
- [ ] Focused type, unit, permission, contract, and E2E tests pass.
