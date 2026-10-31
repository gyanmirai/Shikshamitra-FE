---
module: finance
domain: proration-policy-frontend-flow
content_type: Reference
status: implemented
updated_on: 2026-10-29
owner: frontend-team
audience: humans-and-agents
---

# Review the Proration Policy frontend and complete its flow

TL;DR: the Proration Policy screen now uses the typed backend contract and participates in the real Finance flow. It has no fabricated Fee Heads, uses exact action permissions, supports Draft/Active/Archived lifecycle and version history, persists Fee Structure attachment, captures day-level charge periods in single and bulk assignment, offers a server-authoritative calculation preview for saved policies, and exposes stored scheduled-versus-prorated evidence in the collection ledger.

Product rules, calculations, backend architecture, API, persistence, permissions, and rollout are canonical in [Proration Policy backend end-to-end](../../../../Shikshamitra-BE/docs/modules/finance/references/proration-policy-end-to-end.md).

> This page records both the original review findings and their implemented disposition.

The Proration Policy workspace shows Draft, Active and Archived policies in one table, matching Collection and Concession.
Archived shows a server count scoped to the selected academic year; the archive/restore cache tags refresh this count and the list.
The optional Status column filter includes Draft, Active and Archived; creation stays permission-controlled in the page header.
Switching views resets pagination and the status query while retaining search.
Restore returns a policy to Draft, making it visible in Current Policies.
The focused workspace checks are in `src/screens/finance/policies/workspaces/PolicyArchiveWorkspaces.test.tsx`.

## Clone feedback

The row Clone action sends the source ID and target academic year without forcing a copy name.
The backend chooses an available copy name and creates a Draft with the Default flag cleared;
the source policy and its versions remain unchanged. This also applies when the source is the
active default and a previous Copy already exists.

Specific server details and validation messages take precedence over generic business-rule text.
For older generic Proration Policy errors, the shared ProblemDetails parser uses the policy's
error code to explain duplicate names/codes, unavailable fee heads, invalid rules, or invalid
default/status choices with a corrective action. Other policy families keep their own handling.
The synthetic `clone=default` and `clone=blocked` query scenarios in
`e2e/fixtures/proration-policy` exercise the real row action and error toast; persisted clone
integrity is covered by the backend tests linked above.

## Admission and early-withdrawal form

General information hides the policy code field and places description beside the shared default-policy option; both stack on narrow screens. Existing policy codes remain in the form model for API compatibility.
Each recurring fee head has separate Apply on Admission and Apply on Early Withdrawal switches and model selections.
Collapsed rows show the fee category and both event summaries, distinguishing Off from No proration.
Expanded rows place each switch before its model and conditional fields in matching sections; these stack on narrow screens.
Rounding appears once below both events. Admission presets (All daily, All monthly, Reset admission) preserve withdrawal settings and one-time heads.
Both model dropdowns offer No Proration, Daily Proration, and Monthly Proration. Full month charge is available only in the monthly Cut-off behavior dropdown.
Daily exposes Calendar Days; rounding is shared by the head and preserves all four backend modes, including Nearest Rupee.
Admission monthly exposes Charge Next Month and Half Month Rule with a 1–31 cutoff, plus Full month charge.
Withdrawal monthly exposes Waive Exit Month and Half Month Rule with its own cutoff, plus Full month charge; helper text explains on/before versus after the cutoff and exclusion of later months.
Selecting Full month charge keeps Monthly proration selected and displays Full month charge in Cut-off behavior without a cutoff day. It preserves the other event and shared rounding. Save and reopen use the existing FullMonthCharge API rule, displayed as monthly proration in the editor; switching back to another cutoff behavior restores a default cutoff day.
Disabled event settings do not block saving; withdrawal-only rules count toward the required recurring configuration.
Field errors appear after blur or a submit attempt. Invalid submissions expand affected rows and focus the first invalid control; the missing-proration condition has a section-level message.
The checklist uses the same Yup schema as submission and counts Daily/Monthly recurring heads, including withdrawal-only heads. Full Month Charge alone does not satisfy the proration requirement.
The drawer keeps its header/footer fixed, moves the summary into the scrollable content on narrow screens, and locks inputs and dismissal during blocking loading/saving.
Save and reopen persist both configurations, and cloning retains them.
Policy creation does not require student dates.
Fee Structure creation, editing, defaults and review no longer expose Proration Policy. The attachment-impact client was removed.
Assignment and assigned-policy editing show only concession, collection and refund selectors; new assignments do not inherit proration; historical assignment and charge evidence remains readable.
Assignment edits submit three selectable families, and the backend rejects proration overrides.

Focused validation: run `useProrationPolicyForm.test.ts`, `ProrationFeeHeadsSection.test.tsx`, and the policy default lifecycle tests; AssignmentWorkflow tests cover policy selection; backend regression tests cover removal of template inheritance.
Use the local component fixture at `e2e/fixtures/proration-policy` to inspect both event forms in the in-app browser without backend writes.

## Implementation status

Completed on 2026-09-08:

- dedicated `prorationPolicy.ts` RTK Query client for lifecycle, history, usage impact and simulation operations;
- typed proration response/form models and explicit legacy-editor-to-server enum mapping;
- real active Fee Head lookup with loading/error/empty states and no dummy fallback IDs;
- Draft-by-default create/edit, Save Draft, separately permission-gated Save & Activate, concurrency stamp, default selection, and active-policy change reason;
- exact menu, list action, activation, simulation, version, and Fee Structure attachment permissions;
- typed policy list/detail/clone/archive/restore/version integration in the shared policy table;
- Active policy selection and default preselection in Fee Structure, with policy ID persisted by create/update requests and version rehydrated from the server;
- day-level start/end inputs for single and bulk assignment, constrained to the selected academic year;
- server calculation preview for saved policies and read-only proration evidence tooltips in the collection ledger;
- focused mapping tests for Daily/MonthlyCutoff and rounding payloads.

Operational boundary: existing paid or posted dues are deliberately not recalculated from the browser. Withdrawal, hostel, and transport event automation and any post-demand correction UI belong to a future auditable reversal/adjustment workflow.

## Reviewed frontend surfaces

| Surface                  | Current source                                                                                                                                            |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route/workspace          | `src/app/(auth-route)/finance/(Policies)/proration-policy/**`, `src/screens/finance/policies/workspaces/ProrationPolicyWorkspace.tsx`                     |
| Table/drawer             | `src/screens/finance/policies/components/FinancePolicyTable.tsx`, `ProrationPolicyDrawer.tsx`                                                             |
| Form state/types         | `src/screens/finance/policies/hooks/useProrationPolicyForm.ts`, `src/screens/finance/policies/types/finance-policy.types.ts`                              |
| Rule sections            | `src/screens/finance/policies/components/proration/**`                                                                                                    |
| API client               | `src/redux/finance/financePolicy.ts`                                                                                                                      |
| Permissions/menu         | `src/constants/finance-menu.ts`, proration route layout                                                                                                   |
| Fee Structure attachment | `src/screens/finance/settings/FeeStructure/Components/FeePoliciesTab.tsx`, `IndependentFeeStructureCard.tsx`, `src/redux/finance/financeFeeStructure.tsx` |
| Student assignment       | `src/screens/finance/FeeStructureAssign/**`                                                                                                               |

## Original flow and breakpoints (resolved)

```text
Open Proration Policy route
  -> generic FinancePolicyTable requests /finance-policies
  -> create/edit drawer loads Fee Heads or fabricated fallback rows
  -> user configures rules
  -> Save Policy forces status Active
  -> generic /finance-policies create/update is attempted

Fee Structure
  -> proration selector also uses generic /finance-policies
  -> form state can contain prorationPolicyId
  -> real create request does not send that field
  -> backend cannot persist or return it

Student assignment
  -> no policy/version or day-level charge period is captured
  -> backend generates full DueFee amounts
```

### Findings

| Priority | Finding                              | Evidence/impact                                                                                                             | Target correction                                                                                             |
| -------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| P0       | Nonexistent generic backend contract | Proration list/create/edit/clone/archive use `/finance-policies`; typed policy backends use dedicated clients               | Add `prorationPolicy.ts` and remove proration from generic client paths                                       |
| P0       | False attachment state               | `prorationPolicyId` appears in form/type but is omitted by `createClassWiseFeeStructure` and absent from backend DTO/entity | Send only after backend accepts/returns ID + version; clear optimistic fallback                               |
| P0       | No runtime use                       | Assignment sends no policy/date data and demand generator does no proration                                                 | Add preview/commit integration before success                                                                 |
| P0       | Wrong permission                     | Menu/route map Proration Policy to Fee Collections                                                                          | Use exact Proration Policy View; gate each action separately                                                  |
| P1       | Fake Fee Heads                       | Hook supplies hard-coded tuition/hostel/transport/etc. when API returns nothing                                             | Show loading, empty, or error state; never submit fabricated IDs                                              |
| P1       | Wrong fee classification source      | Missing API `feeType` defaults every head to Recurring                                                                      | Use Fee Structure detail `isOneTime` in attachment impact; policy editor selects heads without inventing type |
| P1       | Lifecycle mismatch                   | Initial status is Active; footer always calls `handleCustomSubmit('Active')`; form uses Active/Inactive                     | Use Save Draft and explicit Activate; Archived is command-only                                                |
| P1       | Ambiguous/redundant rules            | `prorationApplicable` plus `NoProration` and `FullMonthCharge` overlap; cutoff equality is not explicit                     | Use normalized server enums and help text from canonical semantics                                            |
| P1       | Validation is presentation-only      | Readiness checks name + enabled head + rule, not references, schedule, dates, attachment, or runtime inputs                 | Server validation/simulation is authoritative                                                                 |
| P1       | No explanation                       | Summary counts rules but does not calculate financial impact                                                                | Show server line preview and stored demand explanation                                                        |
| P2       | Product copy overclaims              | Workspace says admissions, exits, and service changes without source/date controls                                          | Implement those sources or narrow copy to supported v1                                                        |
| P2       | No focused proration tests           | No proration policy unit/contract/browser tests were found                                                                  | Add tests listed below                                                                                        |

## Implemented staff journey

```text
Policy list for selected academic year
  -> Create Draft
  -> choose recurring Fee Heads and unambiguous rules
  -> run server simulation
  -> Activate
  -> attach to Fee Structure and review impact
  -> assign structure to student
  -> confirm admission/service charge dates and source
  -> preview scheduled versus prorated installments
  -> commit assignment once
  -> inspect the same policy version and explanation on demand/ledger
```

## Screen design

### Policy list

The list is always scoped to the selected academic year and uses the typed backend list endpoint.

| UI element        | Behavior                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------ |
| Columns           | Name, code, status, default, configured heads, used by structures, current version, updated by/on            |
| Filters           | Search and Draft/Active status; Archived uses the archived view                                              |
| Primary action    | Create Draft when Add permission is granted                                                                  |
| Row actions       | View, Edit, Simulate, Clone, Activate, Archive, Restore to Draft, Versions; each separately permission-gated |
| In-use indicator  | Opens the affected Fee Structures/assignments summary; never inferred only from list data                    |
| Empty/error state | No fake records; explain missing year, no results, or retryable API error separately                         |

### Create/edit drawer

Use progressive disclosure rather than one dense rule table.

1. **Identity:** academic year (read-only after create), name, code, description, default.
2. **Rules:** select Fee Heads and configure Full Charge, Daily, or Monthly Cutoff.
3. **Simulation:** enter installment amount, coverage, charge dates, and run the server calculator.
4. **Review:** show blocking errors, warnings, normalized rules, and version impact.

Actions are **Save Draft**, **Activate**, and **Cancel**. Status is not a free dropdown. Editing an Active policy warns that a new version affects only future Fee Structure saves/assignments.

Conditional validation mirrors the backend for usability, but the server remains authoritative. `NoRoundOff` should be labelled **Currency (2 decimals)** because financial values still require currency precision.

### Fee Structure removal

The full-screen Fee Structure workspace offers Collection and Refund policy selectors. It sends no proration ID/version, queries no proration catalog, and shows no proration coverage column or setup warning. Existing historical assignment/charge evidence is retained by the backend; the independent policy form and simulation remain available.

### Student assignment

The assignment form must add a **Charge period** section before submit.

| Field                | Behavior                                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| Start date           | Pre-filled from verified admission/assignment date when available                                  |
| End date             | Defaults to academic-year end; may be sourced from exit/service end                                |
| Source               | Read-only when supplied by Student/Admission/Hostel/Transport; Manual Override requires permission |
| Per-service interval | Shown only for selected optional/service Fee Structure details                                     |
| Override reason      | Required for a permitted manual change                                                             |

After inputs are valid, call the server preview. Show one row per installment: scheduled amount, coverage, eligible dates/days, rule, factor, rounded final amount, reduction, policy version, and explanation. Submit uses the preview token/version and an idempotency key. Disable double submit and surface per-student errors clearly for bulk assignment.

Month-only optional-fee controls can remain for schedule selection where needed, but they cannot serve as daily proration dates.

### Demand, ledger, and collection surfaces

For a prorated line, show:

```text
Scheduled fee       ₹10,000.00
Proration reduction -₹5,000.00
Amount due           ₹5,000.00
Policy               Standard Mid-Session v3
Reason               15 of 30 eligible calendar days
```

Concession is shown after proration, late fee is calculated from the remaining/prorated obligation, and payment/refund/adjustment rows retain their existing ownership. A details action opens the stored explanation; it must not rerun the current policy.

## Frontend client implementation

The typed Proration Policy client is implemented under `src/redux/finance/prorationPolicy.ts`, patterned after the typed Concession/Collection clients.

| Operation                                    | Cache behavior                                                                    |
| -------------------------------------------- | --------------------------------------------------------------------------------- |
| List/detail                                  | Tag policy list by academic year and detail by ID                                 |
| Create/update/activate/archive/restore/clone | Invalidate affected year list and policy detail/versions                          |
| Versions                                     | Tag by policy ID                                                                  |
| Simulate                                     | Mutation or uncached request; never mutates policy cache                          |
| Attachment impact                            | Uncached request keyed by policy/version + structure detail fingerprint           |
| Assignment preview                           | Uncached; short-lived preview token/version                                       |
| Assignment commit                            | Invalidate assignment, due, student ledger, outstanding, and structure usage tags |

Delete proration use of the generic `financePolicy.ts` client once the typed endpoint ships. Do not make the generic table dynamically guess response shapes; use a proration adapter or dedicated list component with typed rows.

## Permission mapping

Mirror the backend's exact names:

- `Finance.Policies.ProrationPolicy.View` for menu, route, list, detail;
- Add, Edit, Activate, Clone, Simulate, Archive, Unarchive, and ViewVersions for their actions;
- ManageAttachment on Fee Structure controls;
- OverrideChargePeriod for manual date/source edits;
- Recalculate for unpaid-demand corrections.

Hiding a button is not enforcement. Render structured 403 errors cleanly because the backend must reject direct calls too.

## Cross-module frontend connections

| Frontend area          | Required connection                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------- |
| Academic-year selector | Drives every list, reference query, create, and clone target                          |
| Fee Head settings      | Supplies real active IDs/names only                                                   |
| Payment Terms          | Shows missing coverage/version blocker and links to fix it                            |
| Fee Structure          | Attachment impact, policy/version display, locked/in-use behavior                     |
| Admission/Student      | Displays authoritative charge dates/source                                            |
| Hostel/Transport       | Supplies per-service dates for matching optional fee details                          |
| Assignment             | Preview + idempotent commit                                                           |
| Concession request     | Displays prorated eligible base; no separate proration selector                       |
| Collection             | Uses final DueFee; calculation details are read-only                                  |
| Refund/Adjustment      | Shows original prorated due and posted allocations                                    |
| Receipt/Ledger/Reports | Displays scheduled, reduced, due, concession, paid, refunded, and outstanding amounts |
| Audit                  | Policy lifecycle, attachment, date override, calculation, and correction history      |

## Error and loading behavior

- No academic year: disable queries and explain how to select a year.
- Fee Head request failed: show retry; do not show hard-coded rows.
- Policy stale while editing/attaching: keep unsaved input, reload diff/version, require review.
- Impact blocker: link to the exact Fee Structure detail or Payment Term needing correction.
- Preview expired/version changed: refresh preview before commit.
- Duplicate commit retry: show the original successful assignment instead of a second success path.
- Unsupported legacy due: label **Legacy — no proration snapshot** rather than guessing.

## Implementation sequence

1. Feature-flag/hide current route and Fee Structure proration selector until the typed backend is deployable.
2. Add exact permission constants and route/action guards.
3. Add typed policy DTOs/client and adapt list/detail/version actions.
4. Replace fake Fee Head fallback and normalize the rule editor/lifecycle.
5. Add server simulation and activation review.
6. Add Fee Structure impact and authoritative attachment persistence.
7. Add assignment charge-period inputs, preview, idempotent commit, and bulk results.
8. Add stored calculation explanation to demand, collection, ledger, refund, adjustment, audit, and reports.
9. Add tests and enable per tenant after an Active policy is attached.

## Frontend acceptance checklist

- [x] Proration never calls generic `/finance-policies`.
- [x] Menu and route use exact View permission; every action has its own guard.
- [x] No fake Fee Heads appear during empty/error states.
- [x] Create defaults to Draft; Activate is explicit and server-validated.
- [x] Rule editor has no redundant applicable/NoProration state.
- [x] Standalone policy rules retain their own eligibility checks; structure attachment impact is retired.
- [x] Fee Structure excludes Proration Policy from selectors, lookups, payloads and review.
- [x] Assignment captures day-level dates/source and audited override reason.
- [x] Preview and commit show the same server-calculated line totals.
- [x] Duplicate submit cannot create duplicate dues.
- [x] Demand details show scheduled amount, reduction, final due, version, and explanation.
- [x] Concession, late fee, payment, refund, and adjustment views use the stored prorated due.
- [ ] Historical/legacy dues are labelled accurately and never recalculated in the browser.
- [ ] Loading, empty, 403, validation, stale-version, and retry states are covered.

Unchecked items are explicit UX/test hardening follow-ups; they do not change the server-authoritative pricing or persisted snapshot behavior.

## Test plan

### Unit/contract

- form initialization for Draft, edit, clone, and academic-year change;
- conditional Daily/MonthlyCutoff fields and server error mapping;
- permission matrix for every action;
- no fallback data after Fee Head errors;
- request/response casing and enum mapping for typed endpoints;
- cache invalidation after each lifecycle and attachment action;
- preview line rendering and exact decimal formatting.

### Browser

- create Draft, simulate, activate, attach, assign, preview, commit, and inspect demand;
- day-on-cutoff versus day-after-cutoff;
- one-time head remains full charge;
- service-specific dates affect only that fee detail;
- active policy edit creates a new version while an old student's explanation remains unchanged;
- forbidden action via hidden button and direct request returns usable 403;
- stale attachment/preview recovery;
- partial failure behavior in bulk assignment;
- responsive keyboard navigation and dirty-close protection.

## Definition of done

Frontend is complete only when a staff member can trace one policy version from policy creation through Fee Structure attachment, student assignment, server preview, generated due, concession/collection, receipt/refund/adjustment, ledger/report, and audit without encountering a local-only value or browser-only calculation.
