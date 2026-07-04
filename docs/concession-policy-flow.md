# Concession Policy — End-to-End Flow & Submodule Integration

> **Scope:** This document explains how the **Concession Policy** connects with Fee Collection, Refund, Charges, Adjustment, and the Collection/Late-Fee policy. It covers the complete runtime flow, field-by-field behaviour, all scenarios, and edge cases.
>
> **Companion doc:** [`collection-policy-flow.md`](./collection-policy-flow.md) — read §3.5 / §7.4 there for the reverse angle (how the Collection Policy's late fee interacts with concession).
>
> **Last Updated:** 2026-07-02

---

## Table of Contents

1. [⚠️ Read First — Three Distinct "Concession" Concepts](#1--read-first--three-distinct-concession-concepts)
2. [Concession Policy Structure](#2-concession-policy-structure)
3. [Attachment Point — How the Policy Actually Connects](#3-attachment-point--how-the-policy-actually-connects)
4. [Submodule Connection Map](#4-submodule-connection-map)
5. [End-to-End Runtime Flow (Happy Path)](#5-end-to-end-runtime-flow-happy-path)
6. [Calculation Engines](#6-calculation-engines)
7. [Field-by-Field Behaviour & Submodule Wiring](#7-field-by-field-behaviour--submodule-wiring)
8. [Scenarios & Edge Cases](#8-scenarios--edge-cases)
9. [Identified Gaps (Frontend)](#9-identified-gaps-frontend)
10. [Data Model Reference](#10-data-model-reference)

---

## 1. ⚠️ Read First — Three Distinct "Concession" Concepts

This codebase uses the word "concession" for **three different things**. Confusing them is the #1 source of bugs and misunderstandings, so they are disambiguated up front:

| Concept | Type | Lives in | What it is |
|---|---|---|---|
| **Concession Type** | `ConcessionTypeSetting` | `src/redux/finance/concessionType.ts` | A named *category* of concession — e.g. "Sibling Discount", "Staff Ward". Has required documents + status. This is the **master list** the request form picks from. |
| **Concession Policy** | `IConcessionPolicy` (`policyType: 'concession'`) | `src/screens/finance/policies/...` | A finance *policy* that defines **how** a concession is calculated and applied — method, base, rounding, paid-fee handling, late-fee behaviour, etc. **Editor-only today.** |
| **Concession Request** | runtime DTOs | `src/redux/finance/ConcessionManagement/concessionManagementApi.ts` | The actual student request → approval → ledger-application flow. |

> 🚩 **Central architectural finding:** The runtime `ConcessionRequestForm` reads **Concession Types**, *not* the Concession **Policy**. The rich policy fields (`calculationMethod`, `minimumConcession`, `applyOn`, `paidFeeAdjustment`, `pendingFeeHandling`, `lateFeeBehaviour`) are defined in the policy editor but are **NOT wired into the request form, the approval payload, or the fee-collection runtime** today. The policy is effectively a **design-time governance template**; the backend is *expected* to honour it when it applies an approved concession to the ledger, but the frontend never sends these fields.

This is the single most important thing to internalise before reading the rest of this document, and it is the root cause of most of the gaps in [§9](#9-identified-gaps-frontend).

---

## 2. Concession Policy Structure

**Type Definition:** `IConcessionPolicy` in
`src/screens/finance/policies/types/finance-policy.types.ts` (lines 224–275)

> Note: There is **no** `IFinancePolicy` discriminated-union type in the codebase. `IConcessionPolicy` extends a shared `IFinancePolicyBase` and carries its own `policyType: 'concession'` literal.

### 2.1 Sections & Fields

The drawer (`ConcessionPolicyDrawer.tsx`) renders **5 cards**. A 6th card (Approval) and a legacy block exist on the type + initial values but have **no UI**.

| Card | Field | Type | Purpose |
|---|---|---|---|
| **General** *(inherited from base)* | `policyName` | `string` | Display name (3–100 chars) |
| | `policyCode` | `string` | Auto-generated `CON-<SLUG>-<last4>` if empty |
| | `status` | `'Active' \| 'Archived'` *(UI-narrowed from `FinancePolicyStatus`)* | Only Active are usable |
| | `description` | `string` (≤500) | Free text |
| | `academicYearId` | `string` | Scoping to academic year |
| | `effectiveFrom` / `effectiveTo` | `string \| null` | Validity window |
| | `isDefault` | `boolean` | Pre-selected on new concession requests |
| | `concessionType` | `string` | *(Declared + seeded, **no UI renders it**)* |
| **Calculation Rules** | `calculationMethod` | `'Percentage' \| 'FixedAmount' \| 'FullWaiver' \| 'Manual'` | How the concession is derived |
| | `percentageValue` | `number \| null` (0–100) | Used when method = `Percentage` |
| | `fixedAmount` | `number \| null` | Used when method = `FixedAmount` |
| | `calculationBase` | `'OriginalFee' \| 'OutstandingAmount' \| 'FeeHeadAmount'` | Base for percentage calc |
| | `roundOff` | `'None' \| 'RoundUp' \| 'RoundDown' \| 'NearestRupee'` | Final rounding |
| | `minimumConcession` | `number \| null` | Floor on the computed concession |
| **Applicable Fee Heads** | `feeHeadScope` | `'EntireFeeStructure' \| 'SelectedFeeHeads'` | Whitelist gate |
| | `applicableFeeHeads` | `string[]` | Required when scope = `SelectedFeeHeads` |
| **Application Behaviour** | `applyOn` | `'PendingFeesOnly' \| 'PaidFeesOnly' \| 'PaidAndPending' \| 'FutureInstallmentsOnly' \| 'CurrentInstallmentOnly' \| 'EntireFeeStructure'` | Which part of the demand is affected |
| | `paidFeeAdjustment` | `'Refund' \| 'CreditNote' \| 'StudentWallet' \| 'FutureFeeAdjustment' \| 'ManualDecision' \| null` | What to do with already-paid portion |
| | `pendingFeeHandling` | `'ReduceOutstanding' \| 'RecalculateInstallments' \| 'FutureInstallmentsOnly' \| null` | What to do with pending portion |
| | `futureInstallmentStrategy` | `'EqualDistribution' \| 'RemainingInstallments' \| 'CurrentInstallment' \| null` | How to spread across future |
| **Demand Behaviour** | `existingDemand` | `'RecalculateAutomatically' \| 'RecalculateFutureOnly' \| 'ManualRecalculation' \| 'KeepExisting'` | Recalc trigger |
| | `receiptBehaviour` | `'KeepOriginalReceipt' \| 'GenerateAdjustmentReceipt' \| 'ReverseOriginalReceipt'` | Receipt handling for paid-fee concessions |
| | `lateFeeBehaviour` | `'Recalculate' \| 'KeepExisting' \| 'RemoveLateFee'` | **Override** on the Collection Policy's late fee |
| | `demandStatus` | `'UpdateImmediately' \| 'UpdateAfterApproval'` | When the demand reflects the concession |
| **Approval** *(no UI)* | `requireApproval` | `boolean` | Reserved |
| | `approvalLevels` / `minimumApprovalCount` | `string[]` / `number \| null` | Reserved |
| | `reasonMandatory` / `supportingDocumentsRequired` | `boolean` | Reserved |
| | `requiredDocumentTypes` | `string[]` | Reserved |
| **Legacy** *(no UI)* | `eligibilityType`, `discountType`, `discountValue`, `discountRules[]`, `approvalRoleIds[]`, `allowStacking`, `maximumStackingCount`, `governmentSchemeCode/Details`, `validFrom/To` | various | Backward-compat, seeded but not surfaced |

### 2.2 Validation Split

Validation is **intentionally split into two layers** (this is easy to miss):

- **Yup schema** (`useConcessionPolicyForm.ts` lines 94–121) — permissive: only `policyName` (3–100), `description` (≤500), conditional `percentageValue` (0–100) / `fixedAmount` (≥0), `feeHeadScope`, `applicableFeeHeads` (≥1 when `SelectedFeeHeads`), `applyOn`. The demand/receipt/late-fee fields are **not** validated by Yup.
- **`checks` memo** (lines 211–239) — the *real* gate for the Submit button (`isReadyToPublish`):
  - `calcValid` requires `percentageValue > 0` (Percentage), `fixedAmount > 0` (FixedAmount), or nothing (Manual/FullWaiver) — **stricter than Yup's ≥0**.
  - `feeHeadsValid`, `applicationValid` required.
  - `demandValid` is computed but **excluded** from `isReadyToPublish` (so demand fields can be empty and the policy still saves).

### 2.3 Conditional Show/Hide (UI)

| Field | Visible when |
|---|---|
| `percentageValue` | `calculationMethod === 'Percentage'` |
| `fixedAmount` | `calculationMethod === 'FixedAmount'` |
| `calculationBase`, `roundOff` | method is `Percentage` or `FixedAmount` |
| `minimumConcession` | method is `Percentage` or `FixedAmount` |
| `applicableFeeHeads` | `feeHeadScope === 'SelectedFeeHeads'` |
| `paidFeeAdjustment` | `applyOn ∈ {PaidFeesOnly, PaidAndPending, EntireFeeStructure}` |
| `pendingFeeHandling` | `applyOn ∈ {PendingFeesOnly, PaidAndPending, EntireFeeStructure, CurrentInstallmentOnly}` |
| `futureInstallmentStrategy` | `applyOn === 'FutureInstallmentsOnly'` **or** `pendingFeeHandling === 'FutureInstallmentsOnly'` |

Changing `applyOn` **resets** `paidFeeAdjustment`, `pendingFeeHandling`, `futureInstallmentStrategy` to `null`. Switching `feeHeadScope` back to `EntireFeeStructure` **clears** `applicableFeeHeads`.

---

## 3. Attachment Point — How the Policy Actually Connects

Unlike the Collection / Refund / Proration policies (which attach **directly to the Fee Structure** via `collectionPolicyId` / `refundPolicyId` / `prorationPolicyId` on `IClassWiseFeeStructureCard`), the **Concession Policy has no `concessionPolicyId` anywhere** — a grep across `src/` returns zero matches. Instead, concession flows through a **four-hop chain**:

```
┌───────────────────────────┐
│  Concession Policy        │  (IConcessionPolicy — rules: method,
│  calculation + demand     │   base, paidFeeAdjustment, lateFeeBehaviour…)
└─────────────┬─────────────┘
              │  ⚠️ NOT ATTACHED to fee structure today
              │  (design-time governance template — see §9 gap #1)
              │
              │  governed by ↓ (expected, backend-side)
              ▼
┌───────────────────────────┐
│  Concession Type          │  (ConcessionTypeSetting master —
│  "Sibling" / "Staff Ward" │   name, documents, status)
└─────────────┬─────────────┘
              │  chosen in
              ▼
┌───────────────────────────┐
│  Concession Request       │  (ConcessionRequestForm → POST /concession-request)
│  student + type + heads   │   feeHeadConcessions[{feeHeadId, basedOn,
│  + values + documents     │   amount, netAmount}]
└─────────────┬─────────────┘
              │  approved in
              ▼
┌───────────────────────────┐
│  Fee-Head Approval View   │  (ConcessionFeeHeadApprovalView)
│  distribute across months │   dueFeeAllocations[{dueFeeId, concessionAmount}]
└─────────────┬─────────────┘
              │  POST .../approve  →  server writes
              ▼
┌───────────────────────────┐
│  FeeLedgerLine            │  concessionAmount populated per due-fee line
│  consumed read-only by    │   (getCollectForm / FeeCollectionForm)
│  Fee Collection runtime   │
└───────────────────────────┘
```

**What this means in practice:**

- The **policy** is consulted (if at all) by the **backend** when it applies an approved concession to the ledger — the frontend never sends `paidFeeAdjustment` / `pendingFeeHandling` / `lateFeeBehaviour` in the approve payload.
- The **type** is what the user-facing request form actually selects (`useGetConcessionTypesQuery`, *not* `useGetFinancePoliciesQuery`).
- The **request** carries per-fee-head `{ basedOn, amount, netAmount }` (the "value entry") computed ad-hoc in the form, not from the policy.
- The **ledger** is where every other submodule (collection, refund, adjustment) finally sees concession — as a `concessionAmount` number on each `FeeLedgerLine`.

---

## 4. Submodule Connection Map

### 4.1 ➡️ Fee Collection (Primary Consumer — read-only)

**Files:** `src/screens/finance/FeeCollection/FeeCollectionComponent/FeeCollectionForm.tsx`,
`src/redux/feeCollection/feeCollection.ts`

| Step | Action | Concession Influence |
|---|---|---|
| 1 | Open collect form → `GET /fee-collections/{studentId}/collect-form` | Ledger returns `concessionAmount` already applied server-side per line |
| 2 | Render ledger | A dedicated **CONCESSION** column (green/success) shown alongside TOTAL / PAID / PENDING / RECONCILIATION (`FeeLedgerShared.tsx`) |
| 3 | Select fee heads, enter payment | `due` is already net of concession; cashier collects the reduced amount |
| 4 | Submit → `POST /fee-collections` | `concessionAmount` is **not** in the collect payload — server already accounts for it |

**Key type** (`FeeLedgerLine` — `feeCollection.ts` lines 93–112):
```ts
export interface FeeLedgerLine {
  dueFeeId: string;
  feeHeadId: string;
  total: number; paid: number; due: number;
  status: number | string;
  reconciliationAmount?: number;   // ← Adjustment module
  concessionAmount?: number;       // ← Concession module
  refundAmount?: number;           // ← Refund module
  refundDescription?: string;
}
```

The `getStudentFeeDetails` endpoint additionally returns a dedicated `concessions: ConcessionDetail[]` block — `{ concessionRequestConcessionTypeId, concessionTypeName, amount }` — for reporting/UI summaries.

> ⚠️ The fee-collection form **only reads** `concessionAmount`; it never recalculates or reverses it. Concession is a server-owned mutation surfaced read-only at collection time.

---

### 4.2 ➡️ Refund (via `paidFeeAdjustment` + `receiptBehaviour`)

**Files:** `src/screens/finance/policies/components/concession/ConcessionApplicationSection.tsx`,
`IRefundPolicy` type

- When a concession is granted on **already-paid** fees (`applyOn ∈ {PaidFeesOnly, PaidAndPending, EntireFeeStructure}`), the policy's `paidFeeAdjustment` decides what happens to the excess money:
  - `Refund` → money returned to parent → loops into the **Refund module** (emits a refund voucher, requires bank details, and the Refund Policy governs deductions). The policy UI shows a warning that "Refund Policy must be configured" when this is selected.
  - `CreditNote` / `StudentWallet` → held as internal credit, no money out.
  - `FutureFeeAdjustment` → carried forward.
  - `ManualDecision` → handled case-by-case.
- `receiptBehaviour` then decides the accounting treatment:
  - `ReverseOriginalReceipt` → the original paid receipt is reversed (heavyweight; must claw back any late fee booked as income).
  - `GenerateAdjustmentReceipt` → a new adjustment receipt is issued, original stays.
  - `KeepOriginalReceipt` → receipt untouched (used with wallet/credit-note paths).
- **Boundary:** A refund triggered here is governed by the **Refund Policy** (`deductionRules`, `maxRefundPercentage`), not the concession policy. The concession policy only *initiates* the refund intent via `paidFeeAdjustment = 'Refund'`.
- 🚩 **Not wired in the frontend runtime** — the approve payload never sends `paidFeeAdjustment`. This is a backend-responsibility gap (see §9).

---

### 4.3 ➡️ Charges

**Files:** `src/screens/finance/ChargesManagement/...`, `ConcessionRequestForm.tsx`

- Concession applies to **fee heads only**. The request form's `feeHeadConcessions[]` and the approval's `feeHeadApprovals[]` are keyed on `feeHeadId`. Charges (`chargeId`) are **never** concessioned.
- Charges surface in the collect form as a separate `charges: ChargeDetail[]` list and produce a separate `chargeReceiptId`.
- **Implication:** If a school wants to discount an exam/lab charge, the concession policy cannot do it — it must be modelled as a charge waiver or a separate negative charge. (Edge case §8.x.)

---

### 4.4 ➡️ Adjustment

**Files:** `src/screens/finance/adjustments/components/AdjustmentForm.tsx`

- Both modules mutate the **same `FeeLedgerLine`**, via different fields:
  - Concession → `concessionAmount`
  - Adjustment → `reconciliationAmount`
- They coexist on a single line (both columns can be non-zero).
- **Ordering matters but is undefined in the frontend:** if an adjustment reduces outstanding *after* a percentage-based concession was computed on `OutstandingAmount`, the two can interact. Neither form consults the other (see collection-policy-flow.md §3.4 for the same gap from the other side).
- **Direction:** A concession reduces `concessionAmount` on the line; an adjustment independently moves `reconciliationAmount`. The effective collectable = `total − paid − concessionAmount − reconciliationAmount` (server-derived; the frontend does not compute this combination explicitly).

---

### 4.5 ➡️ Collection / Late-Fee Policy (`lateFeeBehaviour`)

**Files:** `IConcessionPolicy.lateFeeBehaviour`, `ICollectionPolicy` (see [`collection-policy-flow.md`](./collection-policy-flow.md) §3.5 / §7.4)

- The Collection Policy computes **late fee** on overdue fee heads. When a concession lands on those same heads, the Concession Policy's `lateFeeBehaviour` is meant to have the **final say**:

  | `lateFeeBehaviour` | Effect on an already-charged late fee |
  |---|---|
  | `RemoveLateFee` | Late fee wiped entirely on the concessioned heads |
  | `KeepExisting` | Late fee still owed (default) |
  | `Recalculate` | Late fee recomputed on the reduced outstanding |

- The interaction is two-way and depends on the Collection Policy's `percentageBase`:
  - `OutstandingAmount` / `RemainingBalance` → late fee shrinks as concession reduces outstanding.
  - `OriginalFee` → late fee unchanged by concession.
- 🚩 **Not wired in the frontend** — `lateFeeBehaviour` lives only in the policy object; the collection form does not consult it. Backend must resolve the conflict at apply time. (See §9 gap #5 and collection-policy-flow.md §8 row 7.)

---

## 5. End-to-End Runtime Flow (Happy Path)

```
1. Admin creates Concession Policy
   └─ (editor only — design-time governance template)

2. Admin creates Concession Type(s)            ← what the form actually uses
   └─ e.g. "Sibling 10%", "Staff Ward", with required documents

3. Staff opens ConcessionRequestForm
   └─ picks Board → Medium → Class → Division → Student
   └─ useGetStudentFeeStructureQuery loads the student's fee heads
   └─ picks a Concession Type (NOT the policy)
   └─ selects fee heads + enters values per head
      └─ valueEntries[typeId][feeHeadId] = { basedOn, amount, netAmount }
      └─ basedOn: 0 = amount-based, 1 = percentage  (DiscountBasedOnEnum)

4. computeDiscount() sums (base − netAmount) across selected heads
   └─ guard: concessionAmount must not exceed totalFees (onSubmit)
   └─ per-head guard: netAmount ≤ head base (ValueEntryStep input cap)
   └─ live preview: Total → (−) Discount → Net Payable → savings %

5. Submit
   └─ POST /concession-request?academicYearId=  { studentId, concessionTypeId,
       remarks, feeHeadConcessions[] }
   └─ PUT /concession-request/{id}/documents     { documents[] }
   └─ request status → SUBMITTED (ConcessionRequestStatusEnum=2)

6. Approver opens ConcessionAdmin list
   └─ GET /concession-requests/{studentId}  → per-student applications
   └─ Approve button gated until ALL required documents uploaded

7. Fee-Head Approval View
   └─ GET /concession-request/{id}/approval-context
      └─ feeHeadGroups[].dueFeeLines[]{ originalAmount, paidAmount,
          outstandingAmount, isSelectable }
   └─ approver selects which due-fee lines (months) receive concession
   └─ distributeConcessionAcrossDueFees(selectedDueFeeIds, requestedAmount)
      └─ integer division; sum always exact
   └─ validation: no distributed line > its outstanding
   └─ POST /concession-requests/{id}/approve
      { message, feeHeadApprovals[{ feeHeadId, approvedConcessionAmount,
        dueFeeAllocations[{ dueFeeId, concessionAmount }] }] }

8. Server applies concession to the ledger
   └─ writes concessionAmount onto each selected FeeLedgerLine
   └─ (expected) honours policy: paidFeeAdjustment → refund/wallet,
       pendingFeeHandling → reduce/recalc, lateFeeBehaviour → late fee,
       receiptBehaviour → receipt treatment
   └─ request status → APPROVED (ConcessionRequestStatusEnum=3)

9. Next Fee Collection open
   └─ GET /fee-collections/{studentId}/collect-form returns lines with
      concessionAmount populated
   └─ cashier sees reduced PENDING + green CONCESSION column
   └─ collects the net amount

10. (Optional) Reject / Cancel
    └─ Reject: POST /concession-requests/{id}/reject { message }  (reason required, ≥10 chars)
    └─ Cancel: POST /concession-requests/{id}/cancel              (only on already-approved)
```

---

## 6. Calculation Engines

There are **three** distinct concession calculations in this codebase. They are NOT unified.

### 6.1 Design-Time Policy Simulation (`useConcessionPolicyForm.ts` lines 242–279)

Runs **only in the policy editor's right-hand panel**. Inputs: `simFeeAmount` (default 10000), `simAlreadyPaid` (0), `simLateFee` (0).

```
pending = max(0, simFeeAmount − simAlreadyPaid)

switch calculationMethod:
  Percentage:
    base = (calculationBase == OutstandingAmount) ? pending
         : (calculationBase == FeeHeadAmount)      ? simFeeAmount
         :                                          simFeeAmount   // OriginalFee (same as FeeHeadAmount here)
    concessionAmount = (percentageValue / 100) × base

  FixedAmount:
    concessionAmount = fixedAmount

  FullWaiver:
    concessionAmount = pending + simAlreadyPaid          // entire fee, paid + unpaid

  Manual:
    concessionAmount = 0                                 // set per request at runtime

// minimumConcession is a FLOOR (no ceiling in the simulator)
if minimumConcession && concessionAmount < minimumConcession:
    concessionAmount = minimumConcession

newOutstanding = max(0, pending − concessionAmount)

refundRequired = (simAlreadyPaid > 0 && applyOn ∈ {PaidFeesOnly, PaidAndPending})
                 ? min(simAlreadyPaid, concessionAmount)
                 : 0

outputs: { concessionAmount, refundRequired, newOutstanding, lateFeeImpact }
// all Math.round-ed
```

### 6.2 Runtime Request Calculation (`ConcessionRequestForm.tsx` `computeDiscount`)

Runs **client-side** as the staff fills the request form. Per-fee-head:

```
discountPerHead = base − (entry.netAmount ?? base)     // netAmount is what's left after discount
totalDiscount   = Σ discountPerHead over selected heads
```

- `amount` mode (`basedOn=0`): user types the rupee discount → `netAmount = base − amount`.
- `percentage` mode (`basedOn=1`): user types % → `discountAmount = base × % / 100`, `netAmount = base − discountAmount`.
- Per-head guard (`ValueEntryStep`): `netAmount` cannot exceed `base` (i.e., discount can't exceed the head).
- Total guard (`onSubmit`): `totalDiscount ≤ totalFees`, else a toast blocks submission.

> ⚠️ This engine **ignores the policy** entirely — no `minimumConcession` floor, no `calculationBase`, no `applyOn` scoping. It is the runtime truth for what gets requested.

### 6.3 Distribution Engine (`distributeConcession.ts`)

Runs **at approval** to split an approved amount across N due-fee lines with **integer arithmetic** so the sum is always exact (no rounding drift):

```
if dueFeeIds empty                      → []
if approvedConcessionAmount ≤ 0         → all lines get 0

base     = floor(amount / count)
remainder = amount % count
line[i].concessionAmount = (i < remainder) ? base + 1 : base
```

**Verified edge cases** (from `distributeConcession.test.ts`):

| Input | Output |
|---|---|
| 20000 / 6 | `[3334, 3334, 3333, 3333, 3333, 3333]` |
| 12000 / 4 (perfect) | `[3000, 3000, 3000, 3000]` |
| 10 / 25 (amount < count) | first 10 get `1`, rest get `0` |
| 0 / 5 | `[0, 0, 0, 0, 0]` |
| −1000 / 3 (negative) | `[0, 0, 0]` |
| 5000 / [] (empty) | `[]` |

A dev-only invariant check warns if the sum ever drifts from the input.

---

## 7. Field-by-Field Behaviour & Submodule Wiring

### Calculation card

| Field | How it works | Submodule connection |
|---|---|---|
| `calculationMethod` | Picks the formula in the **design-time** simulator. The **runtime** request form ignores it (uses its own amount/percentage toggle per head). | Backend, when applying an approved concession, is expected to derive the amount via this method if the request was `Manual`. |
| `percentageValue` | % of the base. Validated 0–100 (Yup) and `>0` to enable Submit. | Feeds the Collection Policy interaction only indirectly (the resulting `concessionAmount` reduces the base on which late fee may compute). |
| `fixedAmount` | Flat ₹. `>0` to enable Submit. | Same as above. |
| `calculationBase` | `OriginalFee` = gross fee; `OutstandingAmount` = after payments; `FeeHeadAmount` = per-head gross. | **Late-fee coupling:** if the Collection Policy uses `percentageBase: OutstandingAmount/RemainingBalance`, a concession that computes on the same outstanding creates a compounding reduction. 🚩 In the simulator, `OriginalFee` and `FeeHeadAmount` behave **identically** (both fall through to `simFeeAmount`) — likely a latent bug. |
| `roundOff` | Final rounding of the computed concession. | Backend must mirror; else frontend preview ≠ ledger. |
| `minimumConcession` | Floor. If computed concession < floor, bump to floor. **No maximum cap exists** in the schema or simulator. | Prevents trivially small concessions. Gap: no symmetric cap can let a 100% concession wipe a head the admin didn't intend. |

### Application card

| Field | How it works | Submodule connection |
|---|---|---|
| `applyOn` | Selects which part of the demand the concession touches. Changing it resets the 3 dependents. | Determines whether the **Refund** path is reachable (only when paid fees are included). |
| `paidFeeAdjustment` | Only shown when `applyOn` affects paid fees. Decides disposal of excess already-paid money. | **Refund module** (`Refund`), internal credit (`CreditNote`/`StudentWallet`), forward carry (`FutureFeeAdjustment`), or manual. 🚩 Not sent in the approve payload. |
| `pendingFeeHandling` | Only shown when `applyOn` affects pending fees. | `ReduceOutstanding` → directly lowers `due` on `FeeLedgerLine`. `RecalculateInstallments` → re-spreads future demand. 🚩 Not sent in approve payload. |
| `futureInstallmentStrategy` | How to spread concession across remaining installments. | Affects future `FeeLedgerLine` generation. 🚩 Not wired. |

### Demand card

| Field | How it works | Submodule connection |
|---|---|---|
| `existingDemand` | Whether/how to recalc previously generated demand. | `KeepExisting` → old dues untouched (concession applies forward only). |
| `receiptBehaviour` | Accounting treatment when paid fees are concessioned. | `ReverseOriginalReceipt` ties into Refund/reversal and **must claw back late fee** if the Collection Policy booked it as income. |
| `lateFeeBehaviour` | **Override** on Collection Policy late fee. | `RemoveLateFee`/`Recalculate`/`KeepExisting` directly govern the late-fee outcome on concessioned heads. 🚩 The most tightly-coupled field to the Collection Policy, and the least wired. |
| `demandStatus` | When the ledger reflects the concession. `UpdateAfterApproval` defers until approve; `UpdateImmediately` applies on request. | Gates visibility of `concessionAmount` in the collect form before approval. |

---

## 8. Scenarios & Edge Cases

### 8.1 Concession Exceeds a Single Fee Head
- **Setup:** Tuition head = ₹5,000, staff enters ₹6,000 discount on it.
- **Behaviour:** `ValueEntryStep` input is hard-capped at `baseAmount` (₹5,000) — entry beyond is rejected by `isAllowed`.
- **Edge case:** If the head base changes server-side after the form loaded (rare race), the stale cap could allow over-entry. Backend must re-validate.

### 8.2 Total Concession Exceeds Total Fees
- **Setup:** Multiple heads selected, combined discount > sum of all heads.
- **Behaviour:** `onSubmit` guard (`concessionAmount > totalFees`) blocks with a toast; the Submit button is also disabled (`isAmountExceedingFees`).
- **Edge case:** If `totalFees === 0` (no fee structure yet), the guard is **skipped** (`totalFees > 0 && ...`) — a request could be created against a student with zero fees. Low risk but unguarded.

### 8.3 No Fee Structure Assigned
- **Setup:** Student has no fee structure.
- **Behaviour:** `useGetStudentFeeStructureQuery` errors with `errorCode: 'No fee structure has been assigned to this student.'`; the form shows a warning panel and disables the concession-details/fee-head sections.
- **This is the correct guard** — concession requires a demand to reduce.

### 8.4 Approved Concession Distributed Across Months (Remainder Skew)
- **Setup:** ₹20,000 concession on a fee head across 6 monthly due-fee lines.
- **Behaviour:** `distributeConcessionAcrossDueFees` → `[3334, 3334, 3333, 3333, 3333, 3333]`. The **first two** months get ₹1 extra.
- **Edge case:** If the approver deselects a month mid-set, the remainder is recomputed and the skew shifts to whichever IDs are now first in the array. The `dueFeeIds` array order therefore silently affects which months get the extra rupee. Not a correctness bug (sum is exact), but can surprise auditors.

### 8.5 Distributed Amount Exceeds a Line's Outstanding
- **Setup:** A month has outstanding ₹2,000 but the even-distribution assigns ₹3,333 to it.
- **Behaviour:** The `concession-limit` Yup test in the approval view blocks approval with a per-line message ("For Tuition, ₹3,333 allocated to April-2026 cannot exceed payable ₹2,000").
- **Edge case:** If only *some* lines are over-cap, the test reports the first failing one; the approver must deselect/adjust. No auto-trimming exists.

### 8.6 Concession on a Line with No Outstanding (`isSelectable: false`)
- **Setup:** A month is fully paid (outstanding = 0).
- **Behaviour:** The approval context marks `isSelectable: false`; the row is disabled and greyed; it's excluded from default "select all".
- **Correct** — concession shouldn't apply to a line with nothing owed (unless `paidFeeAdjustment` is in play, which this UI doesn't model).

### 8.7 Retrospective Concession on Paid + Overdue + Late-Fee Head
- **Setup:** April tuition is paid, was overdue, ₹500 late fee charged & booked as income. Admin grants 100% concession on tuition with `applyOn: PaidAndPending`, `paidFeeAdjustment: Refund`, `lateFeeBehaviour: RemoveLateFee`, `receiptBehaviour: ReverseOriginalReceipt`.
- **Expected chain:** refund of the paid portion (Refund module), reversal of the original receipt, **removal of the ₹500 late fee** (and clawback of the income booking).
- **Edge case / 🚩:** None of `paidFeeAdjustment` / `lateFeeBehaviour` / `receiptBehaviour` is sent in the approve payload — the frontend cannot drive this. Entirely backend-responsibility; currently unverified end-to-end. This is the canonical "everything-coupled" scenario and the riskiest gap.

### 8.8 Concession + Adjustment on the Same Line
- **Setup:** A line has `concessionAmount: 1000` (from concession) and `reconciliationAmount: 500` (from a negative adjustment).
- **Behaviour:** Both coexist as separate fields; effective payable = `due` already net of both server-side. The collect form just shows both columns.
- **Edge case:** If a *percentage* concession was computed on `OutstandingAmount` and an adjustment later changes that outstanding, the concession is **not** recomputed client-side. Potential audit discrepancy if the backend doesn't re-derive either.

### 8.9 Policy Edited After Concessions Granted (Versioning)
- **Setup:** `lateFeeBehaviour` changed from `KeepExisting` → `RemoveLateFee` after some concessions are already approved.
- **Edge case:** Unlike the Collection Policy (which has `useFinancePolicyVersion.ts` for snapshotting), **no versioning snapshot is captured for concession policy** in the frontend. Already-approved concessions keep their ledger `concessionAmount`, but a retroactive re-derivation could conflict with the new policy. Needs backend confirmation.

### 8.10 Policy Status = Archived
- **Behaviour:** The workspace list filters by status; archived policies aren't editable via the active UI. But because the policy is **not attached** to anything, archiving has no runtime effect today — unlike collection policy archival (which strands a `collectionPolicyId` reference).

### 8.11 `Manual` Calculation Method
- **Setup:** `calculationMethod: 'Manual'`.
- **Behaviour:** No `percentageValue`/`fixedAmount` needed; `calcValid` passes unconditionally. The policy editor shows a warning that the amount is "set per concession request."
- **This matches the runtime reality** — the request form sets amounts per head regardless. So `Manual` is the policy value most consistent with current runtime behaviour.

### 8.12 `FullWaiver` on a Partially-Paid Head
- **Setup:** `calculationMethod: 'FullWaiver'`, head already 40% paid.
- **Simulator:** `concessionAmount = pending + alreadyPaid` = entire original fee.
- **Edge case:** A full waiver on a paid head implies a refund of the paid portion — which only makes sense if `paidFeeAdjustment` handles it. The simulator computes `refundRequired` accordingly, but again this is design-time only.

### 8.13 Multiple Concession Types / Stacking
- **Setup:** Student applies for both "Sibling" and "Merit" concessions.
- **Behaviour:** `allowStacking` / `maximumStackingCount` exist on the type (legacy, no UI). The request form keys selections by `concessionTypeId` and submits one request per type; whether two approved concessions *stack* on the same fee head is a backend decision.
- **Edge case:** Two concessions on one head could exceed the head's base — the per-request guard (`concession ≤ totalFees`) doesn't know about the other concession. Backend must cap combined concessions at 100% of the head.

### 8.14 Distribution When `amount < count`
- **Setup:** ₹10 concession across 25 monthly lines.
- **Behaviour:** First 10 lines get ₹1, the rest ₹0 (sum = ₹10).
- **Edge case:** Lines with ₹0 concession still "consume" the selection — the approver sees 25 selected lines but only 10 have any effect. Could confuse; consider hiding/auto-deselecting zero-effect lines.

### 8.15 Three Competing Status Enums
- The codebase carries **three** concession status enums: `ConcessionStatusType` (UI: Pending/Approved/Rejected/Cancelled), a second `ConcessionStatusType` in `concession-type.ts` (includes "Under Review"), and `ConcessionRequestStatusEnum` (DRAFT/IN_PROGRESS/SUBMITTED/APPROVED/REJECTED). Mapping between them is implicit and a source of off-by-one bugs.

### 8.16 Approve Before Documents Uploaded
- **Behaviour:** `ConcessionAdminViewForm` disables Approve until `allDocsUploaded` is true (`approveDisabled = isApproved || isRejected || isCancelled || !allDocsUploaded`).
- **Edge case:** This is a **runtime** guard the request form does mirror via its documents section, but the *policy's* `supportingDocumentsRequired` / `requiredDocumentTypes` fields (no UI) are not the source of this rule — it comes from the Concession **Type**'s document config.

### 8.17 Dormant / Duplicate API Slices
- `concessionRequestApi.ts` has approve/reject **commented out**; `concessionApi.ts` is a dummy `GET /concessionData`; `feeConcession.ts` is a legacy `GET /feeConcession`. Only `concessionManagementApi.ts` is the live runtime slice. Using the wrong slice silently does nothing — a maintenance hazard.

---

## 9. Identified Gaps (Frontend)

| # | Gap | Impact | Severity | Recommendation |
|---|---|---|---|---|
| 1 | Concession Policy is **not attached** to anything (no `concessionPolicyId`) | Policy is inert at runtime | **Critical** | Decide the attachment model (fee structure? concession type?) and wire it |
| 2 | Request form reads Concession **Types**, not the Policy | Policy rules bypassed at request time | **Critical** | Have the form load & enforce the governing policy (`calculationMethod`, `minimumConcession`, `applyOn`, `feeHeadScope`) |
| 3 | `paidFeeAdjustment` not sent in approve payload | Paid-fee concession disposal undefined | **High** | Send the resolved policy value (or its id) in the approve body so the backend acts deterministically |
| 4 | `pendingFeeHandling` not sent in approve payload | Outstanding reduction undefined | High | Same as #3 |
| 5 | `lateFeeBehaviour` not wired into collection runtime | Concession ↔ late-fee conflict unresolved | **High** | Wire concession policy into the collection/late-fee resolution (see collection-policy-flow.md §8 row 7) |
| 6 | `receiptBehaviour` not consulted on paid-fee concession | Receipt reversal/adjustment undefined | Medium | Send with approve payload when `applyOn` touches paid fees |
| 7 | Card 6 (Approval Workflow) + legacy block have no UI | `requireApproval`, stacking, eligibility unused | Medium | Either build the UI or remove the dead fields/types |
| 8 | No maximum-concession cap (only a `minimumConcession` floor) | A 100% concession can wipe an unintended head | Medium | Add an optional max-% / max-amount field |
| 9 | Simulator treats `OriginalFee` and `FeeHeadAmount` identically | Preview misleads admins choosing `FeeHeadAmount` | Low–Medium | Distinguish the bases (per-head gross vs aggregate) in the simulator |
| 10 | No concession-policy versioning snapshot (cf. `useFinancePolicyVersion`) | Retroactive re-derivation can conflict with edits | Medium | Snapshot policy version onto the approved concession |
| 11 | Three competing status enums | Off-by-one / mapping bugs | Medium | Consolidate to one enum |
| 12 | Dormant concession API slices (`concessionRequestApi`, `concessionApi`, `feeConcession`) | Maintenance hazard, silent no-ops | Low | Delete or clearly mark as deprecated |
| 13 | `ConcessionExpiry` / `ConcessionRenewal` types declared but unused | Dead schema | Low | Remove or implement expiry/renewal |
| 14 | Distribution skew depends on `dueFeeIds` array order | First-N-months-get-extra is order-sensitive (audit surprise) | Low | Document or make distribution deterministic by month chronology |
| 15 | `status` typed as 5-value union but UI offers only Active/Archived | Type wideness vs UI narrowness | Low | Narrow the type or expose Draft/Published |

---

## 10. Data Model Reference

### 10.1 The Three Concepts

```
Concession Type (master)            src/redux/finance/concessionType.ts
├─ id, name, description
├─ requiredDocuments[]
└─ status

Concession Policy (rules)           src/screens/finance/policies/types/finance-policy.types.ts
├─ policyType: 'concession'
├─ calculationMethod, percentageValue, fixedAmount, calculationBase, roundOff, minimumConcession
├─ feeHeadScope, applicableFeeHeads[]
├─ applyOn, paidFeeAdjustment, pendingFeeHandling, futureInstallmentStrategy
├─ existingDemand, receiptBehaviour, lateFeeBehaviour, demandStatus
└─ (approval + legacy blocks — see §2.1)

Concession Request (runtime)        src/redux/finance/ConcessionManagement/concessionManagementApi.ts
├─ concessionRequestId, studentId, concessionTypeId, remarks
├─ feeHeadConcessions[{ feeHeadId, basedOn(0|1), amount, netAmount }]
├─ status (ConcessionRequestStatusEnum)
└─ approvedConcessionAmount, dueFeeAllocations[{ dueFeeId, concessionAmount }]
```

### 10.2 Runtime Ledger (where every submodule sees concession)

```
FeeLedgerLine                       src/redux/feeCollection/feeCollection.ts (lines 93–112)
├─ dueFeeId, feeHeadId, feeHeadName
├─ total, paid, due
├─ reconciliationAmount?            ← Adjustment module
├─ concessionAmount?                ← Concession module (this doc)
├─ refundAmount?, refundDescription? ← Refund module
└─ status                           ← FeeCollectionStatusType

UI mirrors: MonthWiseFeeItem, FeeHeadWiseFeeItem, IStudentFee
            (src/screens/finance/FeeCollection/Components/type.ts)
```

### 10.3 Concession API Endpoints (active slice)

| Endpoint | Method | URL |
|---|---|---|
| `createConcessionRequest` | POST | `/concession-request` |
| `updateConcessionRequest` | PUT | `/concession-request/{id}` |
| `getConcessionRequestById` | GET | `/concession-request/{id}` |
| `uploadConcessionDocuments` | PUT | `/concession-request/{id}/documents` |
| `getConcessionApprovalContext` | GET | `/concession-request/{id}/approval-context` |
| `approveConcessionRequest` | POST | `/concession-requests/{id}/approve` |
| `rejectConcessionRequest` | POST | `/concession-requests/{id}/reject` |
| `cancelConcessionRequest` | POST | `/concession-requests/{id}/cancel` |
| `getStudentConcessionDetails` | GET | `/concession-requests/{studentId}` |
| `getConcessionApplications` | GET | `/concession-request/concession-applications` |
| `deleteConcessionApplication` | DELETE | `/concession-request/{id}` |

**Approve payload (the bridge into the ledger):**
```ts
{
  message: string;
  feeHeadApprovals: {
    feeHeadId: string;
    approvedConcessionAmount: number;
    dueFeeAllocations: { dueFeeId: string; concessionAmount: number }[];
  }[];
}
```

### 10.4 Status Enums

```
ConcessionStatusType (UI)            src/enums/concession-status-type.ts
  Pending(0), Approved(1), Rejected(2), Cancelled(3)

ConcessionRequestStatusEnum (record) src/redux/finance/ConcessionManagement/types.ts
  DRAFT(0), IN_PROGRESS(1), SUBMITTED(2), APPROVED(3), REJECTED(4)

DiscountBasedOnEnum (value entry)    src/redux/finance/ConcessionManagement/types.ts
  AMOUNT_BASED(0), PERCENTAGE(1)
```

### 10.5 Relevant Files

| Concern | Path |
|---|---|
| Policy types | `src/screens/finance/policies/types/finance-policy.types.ts` |
| Policy form hook (validation + simulation) | `src/screens/finance/policies/hooks/useConcessionPolicyForm.ts` |
| Policy drawer (5 cards) | `src/screens/finance/policies/components/ConcessionPolicyDrawer.tsx` |
| Policy section components | `src/screens/finance/policies/components/concession/*Section.tsx` |
| Policy workspace (list) | `src/screens/finance/policies/workspaces/ConcessionPolicyWorkspace.tsx` |
| Policy API | `src/redux/finance/financePolicy.ts` |
| Concession Type master | `src/redux/finance/concessionType.ts` |
| Runtime request form | `src/screens/finance/Concession/Components/ConcessionRequestForm.tsx` |
| Value entry step | `src/screens/finance/Concession/Components/ConcessionSteps/ValueEntryStep.tsx` |
| Admin approval list | `src/screens/finance/ConcessionAdmin/ConcessionAdminViewForm.tsx` |
| Fee-head approval view | `src/screens/finance/ConcessionAdmin/ConcessionFeeHeadApprovalView.tsx` |
| Quick approve/reject | `src/screens/finance/Concession/Components/ConcessionRequestApprove.tsx` |
| Runtime API (active) | `src/redux/finance/ConcessionManagement/concessionManagementApi.ts` |
| Runtime DTOs | `src/redux/finance/ConcessionManagement/types.ts` |
| Distribution utility + tests | `src/utils/distributeConcession.ts`, `distributeConcession.test.ts` |
| Fee ledger line + collect form | `src/redux/feeCollection/feeCollection.ts` |
| Collection ledger UI (CONCESSION column) | `src/screens/finance/FeeCollection/FeeCollectionComponent/FeeLedgerShared.tsx` |
| Collection form (consumes concession) | `src/screens/finance/FeeCollection/FeeCollectionComponent/FeeCollectionForm.tsx` |
| Companion doc | `docs/collection-policy-flow.md` |

---

*End of document.*
