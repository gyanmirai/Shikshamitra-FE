---
module: finance
domain: concession-policy-frontend-review
content_type: Reference
status: proposed
updated_on: 2026-09-01
owner: frontend-team
audience: humans-and-agents
---

# Review the Concession Policy frontend and target integration

TL;DR: the current drawer is a useful visual prototype, but it is too complex for staff and is not connected to a real backend policy flow. Keep the clear section layout and Status field, use the same Draft/Active/Archived flow as HR Attendance Policy, remove paid-fee/refund and duplicate configuration, attach one Active policy version to the fee structure, snapshot it during student assignment, and resolve it automatically in the Concession Request. Concession Type remains request-only.

Product and backend rules are canonical in the [Concession Policy flow](../../../../Shikshamitra-BE/docs/modules/finance/references/concession-policy-flow.md).

## Reviewed surfaces

| Surface | Source |
|---|---|
| Route and workspace | `src/app/(auth-route)/finance/(Policies)/concession-policy/**`, `src/screens/finance/policies/workspaces/ConcessionPolicyWorkspace.tsx` |
| Table and drawer | `src/screens/finance/policies/components/FinancePolicyTable.tsx`, `ConcessionPolicyDrawer.tsx` |
| Form state/simulation | `src/screens/finance/policies/hooks/useConcessionPolicyForm.ts` |
| Form sections | `src/screens/finance/policies/components/concession/**` |
| Policy types/client | `src/screens/finance/policies/types/finance-policy.types.ts`, `src/redux/finance/financePolicy.ts` |
| Fee Structure | `src/screens/finance/settings/FeeStructure/Components/FeePoliciesTab.tsx` |
| Student assignment | `src/screens/finance/FeeStructureAssign/**` |
| Concession Type | `src/screens/finance/settings/ConcessionTypeSetting/**` |
| Request and documents | `src/screens/finance/Concession/**` |
| Approval | `src/screens/finance/ConcessionAdmin/**` |
| Request API | `src/redux/finance/ConcessionManagement/**` |

## Final UI decisions

| Question | Decision |
|---|---|
| Is policy scoped by class or medium? | No. Show only the active Academic Year, read-only |
| Is Concession Type configured in policy? | No. Select Type only in the request |
| How many policies attach to a fee structure version? | One Active policy version |
| Should Status remain in the form? | Yes. Draft and Active are selectable; Archived uses a separate action |
| Does staff choose policy in a request? | No. Display the policy resolved from the student's assignment |
| Does assignment apply a discount automatically? | No. It snapshots the version and creates gross dues |
| Who calculates money? | Backend preview and approval endpoints |
| What happens to paid fees? | They remain outside normal concession; refund/credit is a separate workflow |
| Are Effective From/To needed? | No. Academic Year + Active Status + assignment snapshot provide the boundary |

## Current end-to-end reality

```text
Current working chain

Concession Type -> Student Request -> DueFee approval allocation
                        ^
                        |
                manual fee-head values

Disconnected prototype

Concession Policy drawer -> generic /finance-policies -> no dedicated backend contract
```

The current policy route does not feed Fee Structure, assignment, request, approval, collections, receipts, audit, or reports.

## What is good and should be retained

- Drawer grouping into General, Calculation, Fee Heads, and Application behavior.
- Searchable fee-head selection.
- A concise live summary.
- Conditional fields based on calculation choice.
- Unsaved-change confirmation.
- List actions anticipated for view, clone/new version, archive, audit, and dependency checks.
- Approval at individual `DueFee` row level.
- Current Concession Type support for mandatory and optional documents, accepted formats, and size limits.

## Critical findings

| Priority | Finding | Impact |
|---|---|---|
| P0 | No dedicated backend Concession Policy API/aggregate | The drawer cannot create a financial rule that the server can apply |
| P0 | Generic list/detail/form contracts disagree | Table uses older discount/eligibility fields while the drawer uses calculation/application fields |
| P0 | Fee Structure has no Concession Policy attachment | Policy cannot be resolved for a student's fees |
| P0 | Assignment has no policy snapshot | Later policy edits could not be handled deterministically |
| P0 | Request never resolves a policy | Staff can enter values outside centrally configured limits |
| P0 | Browser simulation is financially incorrect | It uses JavaScript numbers, dummy inputs, unconditional rounding, and no live due-row balances |
| P0 | Permission alias is wrong | Concession Policy is mapped to Fee Collections instead of `Finance.Policies.ConcessionPolicy.*` |
| P1 | Current Status values are incomplete | The form should offer Draft/Active; Archived must use the separate Archive action and Restore must return it to Draft |
| P1 | Paid-fee options cross into refund/accounting | Refund, wallet, credit note, and future adjustment require separate controlled records |
| P1 | Dummy fee heads appear when API data is empty | Fake IDs can enter a real form and hide setup/integration failures |
| P1 | Dependent fields and validation disagree | Yup accepts values that the readiness summary rejects; conditional fields are not reliably required |
| P1 | Policy code uses browser time | It is unstable and not server-unique |
| P1 | Error handling is generic | Staff cannot tell whether setup, cap, permission, document, or concurrency failed |

## Current form review

### General Information

| Current field | Decision | Target |
|---|---|---|
| Policy Name | Keep | Server-normalized unique name within academic year |
| Status Active/Archived | Keep and correct | Editable options are Draft and Active; Archived is read-only and reached only through Archive |
| Description | Keep | Optional operational description |
| Default Policy toggle | Remove | Fee Structure attachment is the explicit source; no hidden default resolution |
| Browser-generated policy code | Replace | Server-generated, read-only code |
| Hidden Academic Year | Show | Read-only active Academic Year |
| Hidden effective dates | Remove | Do not add them; Academic Year and Status control availability |
| Hidden Concession Type | Remove | Type is request-only |

Do not add board, medium, class, standard, division, or student selectors.

### Status flow: match HR Attendance Policy

Use the same user experience and transition rules as `AttendancePolicyDrawer.tsx` and the HR policy table:

```text
Draft <-> Active -> Archived -> Draft (Restore)
```

| Current status | Form behavior | Table actions | Operational behavior |
|---|---|---|---|
| Draft | Editable; Status can be Draft or Active | Edit, Clone, Simulate, Archive, Version History, Audit | Not available for new fee-structure attachments |
| Active | Editable; Status can be Active or Draft | Edit, Clone, Simulate, Archive, Version History, Audit | Available for same-year fee-structure attachments |
| Archived | Drawer is view-only; Archived is not a form option | Restore, Version History, Audit | Not available for attachment or new assignments/requests |

- Changing Draft to Active performs complete server validation.
- Editing Active or changing Active to Draft requires impact preview/confirmation and captures a new version.
- Active to Draft is blocked until active fee-structure dependencies are detached or replaced.
- Archive uses the dedicated action, not the Status dropdown.
- Restore changes Archived to Draft; staff must review it and explicitly select Active again.
- Existing student assignment/request snapshots retain the exact version they already use.
- Keep no Default Policy toggle: Fee Structure attachment is the explicit concession-policy selection.

### Calculation Rules

| Current field | Decision | Target |
|---|---|---|
| Calculation Method | Keep with changes | Percentage, Fixed Total, Full Waiver; Manual becomes request-entered within caps |
| Percentage/Fixed Value | Conditional | Read-only in request when policy-fixed |
| Calculation Base | Remove from ordinary UI | Backend uses eligible outstanding principal |
| Round Off | Keep under Advanced | None/Nearest/Down/Up using server decimal calculation |
| Minimum Concession | Remove | Add optional default plus maximum limits instead |
| Client impact simulation | Replace | Debounced server simulation/preview with example inputs |

Add `Who decides the value?`:

- `Fixed by Policy`.
- `Entered in Request within Policy Limits`.

When request-entered is selected, show allowed methods, optional default, maximum percentage, maximum per request, and maximum per student/year. This is necessary because Concession Type does not carry a formula.

### Applicable Fee Heads

Keep:

- All concession-eligible heads in the attached structure.
- Selected fee heads only.

Improve:

- Load only real same-year heads with `IsConcessionApplied = true`.
- Never show hardcoded fallbacks.
- Show which selected heads are absent from a target fee structure before attachment.
- For `All`, explain that the actual eligible set is resolved against the attached structure snapshot.

### Application Behaviour

Replace the current list with one clear `Apply to` field:

- All Outstanding (default).
- Current Installment.
- Future Installments.

Remove:

- Paid Fees Only.
- Paid + Pending.
- Entire Fee Structure from timing because it duplicates fee-head scope.
- Paid Fee Adjustment.
- Refund, Credit Note, Student Wallet, Future Fee Adjustment, and Manual Decision.
- Pending Fee Handling and Recalculate Installments.
- Future strategy dropdown.

Put allocation order under Advanced with `Oldest due first` as the default and `Pro-rata` as the alternative.

### Add Limits and Approval

Add a compact section:

- Approval required: fixed to Yes for the first release.
- Approval threshold amount.
- Allow multiple approved concessions: default No.
- Maximum per student/year.
- Remarks required: default Yes.

Do not add document configuration. Documents continue to come from the Type selected in the request.

## Target screen behavior

### Policy list

Recommended columns:

- Policy name and server code.
- Academic Year.
- Rule summary, such as `Request value up to 25%`.
- Fee-head scope.
- Attached fee-structure count.
- Version and Status.

Remove `Eligibility Type`. Use filters for Academic Year, Status, calculation/value source, and attachment state. Row actions must be state-aware:

| State | Actions |
|---|---|
| Draft | Edit, Clone, Simulate, Archive, View Versions, View Audit |
| Active | Edit with impact confirmation, Clone, Simulate, Archive, View Attachments, View Versions, View Audit |
| Archived | View, Restore to Draft, View Versions, View Audit |

### Policy drawer

Recommended order:

1. General Information.
2. Request Value Rule.
3. Applicable Fees.
4. Limits and Approval.
5. Advanced Calculation.
6. Server Simulation and validation summary.

Footer actions:

- `Save` for editable Draft or Active policies.
- `Simulate` without changing Status.
- The Status field activates a Draft by selecting Active; complete server validation runs on save.
- `Close` with dirty-state protection.

Archive and Restore belong to table/detail actions, not the editable Status field.

The live summary should report exactly what will happen, for example:

```text
Academic Year: 2026-27
Value: Entered in Request, up to 25% or Rs. 20,000
Fee Heads: Tuition and Laboratory
Apply To: All Outstanding
Student/Year Cap: Rs. 30,000
Approval: Finance Manager; Principal above Rs. 20,000
```

### Fee Structure setup

Add `Concession Policy` to `FeePoliciesTab.tsx` as a single selector:

- List only Active policies from the fee structure's Academic Year.
- Show policy code, version, calculation summary, head compatibility, and attachment usage.
- Persist both policy ID and version ID.
- Validate before locking/publishing the fee structure.
- Show a link to view the policy, but do not allow policy editing inside fee-structure setup.

If no policy is selected, display `Concession requests will be unavailable for students assigned this structure` unless institute configuration makes policy attachment mandatory.

### Student fee assignment

Do not add another selector. Show a read-only card from the selected Fee Structure:

```text
Concession Policy: General Concession Rules (CP-2026-001, v2)
Applies to: Tuition and Laboratory; All Outstanding
This assignment snapshots v2. Future policy versions will not change it automatically.
```

Assignment create/update contracts must return the snapshot IDs and summary. Gross fee rows remain unchanged.

There is no policy selector on this screen. On assignment, the backend automatically validates and snapshots the Active policy already attached to the fee structure. This applies the rule context only; it does not grant or deduct any concession amount.

### Concession Request

Recommended staff journey:

1. Select/search student.
2. Load request context from the backend.
3. Display Fee Structure and resolved Concession Policy read-only.
4. Select active Concession Type.
5. Display Type documents with Mandatory/Optional badges and file constraints.
6. Show only eligible fee heads/due periods from the context.
7. Show amount/percentage input only when the policy allows request-entered values.
8. Call server preview and display eligible base, requested amount, allowed amount, cap remaining, allocation, and new outstanding.
9. Save Draft or Submit.

The request must not include a policy selector. When no policy snapshot exists, disable creation and show the structure name plus a link/permission-aware instruction for Finance Setup.

### Approval

Display:

- Student, Fee Structure, Concession Type, policy code/version, request creator, and time.
- Mandatory/optional document status.
- Requested input and server-calculated amount.
- Per-head and per-due-row balances and proposed allocations.
- Request cap and student/year cap usage.
- A stale-context warning when payment or another concession changed balances.

Approval always calls the server recalculation. The UI may allow reducing the approved amount; increasing it requires an explicit override journey and refreshed preview.

### Collections, receipts, history, and correction

Show separate values for original fee, concession, adjustment, late fee, paid, and outstanding. Link every concession amount to its Request, Type, Policy Version, approval, and allocations.

Approved requests have no Edit or Cancel action. Provide `Reverse Concession` only to authorized users, with impact preview and mandatory reason.

## Frontend contract changes

### Replace the generic policy client

Create a dedicated RTK Query service, for example `concessionPolicyApi`, with typed endpoints for list, detail, create/update, clone, simulate, versions, archive, unarchive, available-for-structure, and attachment.

Use tags such as:

- `ConcessionPolicy`.
- `ConcessionPolicyVersion`.
- `FeeStructurePolicyAttachment`.
- `StudentFeeAssignment`.
- `ConcessionRequestContext`.

Mutations must invalidate only related lists/details and must surface stable backend error codes. Remove generic `/finance-policies` assumptions for this route.

### Recommended shared types

```ts
type ConcessionPolicyStatus = "draft" | "active" | "archived";
type EditableConcessionPolicyStatus = Exclude<ConcessionPolicyStatus, "archived">;

type ConcessionValueSource =
  | "PolicyFixed"
  | "RequestEnteredWithinLimits";

type ConcessionMethod = "Percentage" | "FixedAmount" | "FullWaiver";
type ConcessionDueTiming =
  | "AllOutstanding"
  | "CurrentInstallment"
  | "FutureInstallments";
```

The frontend must consume contract-generated enums or a shared mapping with exhaustive rendering. Do not keep separate older `discountType`/`eligibilityType` and newer `calculationMethod` models.

### Form and money handling

- Use one schema derived from the selected value source/method; the form readiness summary must read the same schema errors.
- Use decimal strings for request/response money and percentage input; format only for display.
- Debounce simulation, cancel stale calls, and identify the latest response.
- Never calculate or submit authoritative `netAmount` in the browser.
- Include concurrency stamp/version on Draft updates and workflow actions.
- Map stable error codes to fields, banners, or conflict dialogs; preserve trace ID for support.

### Permission parity

Replace the current Fee Collections alias with exact permissions from the backend canonical flow. Apply them at route, table action, drawer footer, Fee Structure attachment, request actions, approval, and reversal. Hidden buttons do not replace server authorization.

## Backend changes required for frontend completion

Frontend implementation is blocked until the backend provides:

- Typed Concession Policy aggregate, version, DTOs, validators, app service, controller, persistence configuration, migration, audit, and outbox events.
- Singular Fee Structure policy attachment and available-policy query.
- Policy snapshot fields in Student Fee Assignment.
- Request-context and preview endpoints.
- Policy/version snapshot fields and calculation snapshot/hash in requests.
- Policy enforcement during submit and approve.
- Decimal, separated DueFee monetary facts.
- Immutable grant/allocation and reversal flow.
- Exact status/edit/archive/unarchive/request/approval permissions and stable errors.

## Recommended implementation order

| Phase | Backend | Frontend | Exit condition |
|---|---|---|---|
| 1. Contract | Aggregate, versions, DTOs, permissions, errors, simulation | Dedicated types/client, corrected route permissions | Draft can be saved and simulated |
| 2. Policy UI | Draft/Active status, archive/unarchive, clone and version endpoints | Simplified drawer and Attendance-style Status actions | Draft can become Active; Archive/Restore follows HR behavior |
| 3. Attachment | Fee Structure relationship and validation | Single selector in Fee Policies tab | Locked structure retains exact version |
| 4. Assignment | Snapshot and response fields | Read-only assignment policy card | New assignment is deterministic |
| 5. Request | Context, preview, Draft/Submit enforcement | Resolved policy card, Type/documents, conditional input | Staff cannot create an out-of-policy request |
| 6. Approval | Recalculation, cap, concurrency, grant/allocation | Complete approval context and conflict handling | Approved result is atomic and auditable |
| 7. Downstream | Receipt/report/reversal integration | Separated display and reversal journey | End-to-end reconciliation passes |

## Frontend validation plan

### Unit and component

- Conditional fields for policy-fixed and request-entered values.
- Schema/readiness agreement at boundaries and zero/blank values.
- No dummy fee-head fallback.
- Status-specific actions and permission gates.
- Money display from decimal strings.
- Error-code mapping.
- Type document Mandatory/Optional labels and constraints.

### Contract

- List/detail/form use one typed model.
- Enum mapping is exhaustive.
- Draft concurrency token is sent.
- Attachment sends policy and version IDs.
- Assignment and request context preserve the exact version.
- Preview request does not send an authoritative net amount.

### Browser journeys

1. Create Draft, simulate, change Status to Active, edit with impact confirmation, Archive, and Restore to Draft.
2. Attach it to a same-year Fee Structure and reject cross-year/incompatible heads.
3. Assign the structure and verify the snapshotted version.
4. Create a request by selecting Type only; upload mandatory and optional evidence.
5. Exercise policy-fixed and request-entered values, limits, and missing-policy states.
6. Approve while balances are unchanged.
7. Produce a stale-preview conflict by recording payment before approval.
8. Verify receipts/history/reporting and authorized reversal.

## Acceptance checklist

- [ ] Policy form has no class/medium/division/student scope and no Concession Type.
- [ ] Form contains only staff-useful rules; advanced allocation/rounding is collapsed.
- [ ] Paid-fee/refund/wallet/credit-note choices are removed.
- [ ] Status field remains with Draft/Active; Archived uses Archive and Restore returns it to Draft.
- [ ] Active edits require impact confirmation and version history is preserved.
- [ ] Fee Structure attaches one Active same-year policy version.
- [ ] Assignment snapshots and displays that exact version without granting a discount.
- [ ] Request resolves policy automatically and staff choose only Concession Type.
- [ ] Type documents retain mandatory/optional behavior.
- [ ] Backend preview drives every financial total.
- [ ] Approval recalculates against live due rows and handles concurrency.
- [ ] Frontend and backend use exact permissions and stable errors.
- [ ] Collection, receipt, report, audit, and reversal integrations are complete.

## Related documentation

- [Backend Concession Policy flow](../../../../Shikshamitra-BE/docs/modules/finance/references/concession-policy-flow.md)
- [Finance frontend workflows](../workflows.md)
- [Finance frontend clients](../clients.md)
- [Finance frontend testing](../testing.md)
