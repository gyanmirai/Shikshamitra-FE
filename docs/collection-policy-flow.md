# Collection Policy — End-to-End Flow & Submodule Integration

> **Scope:** This document explains how the **Collection Policy** connects with Fee Collection, Charges, Refund, Adjustment, and Concession submodules. It covers the complete runtime flow, all scenarios, and edge cases.
>
> **Late Fee Policy retired:** The separate, unrouted `ILateFeePolicy` type/drawer/hook (`LateFeePolicyDrawer.tsx`, `LateFeePolicyWorkspace.tsx`, `useLateFeePolicyForm.ts`, and the `'late-fee'` `FinancePolicyKind`) has been removed. Collection Policy is the only place a school configures late-fee and waiver behaviour — there is no second, parallel late-fee system to reconcile against.
>
> **Last Updated:** 2026-07-14

---

## Table of Contents

1. [Collection Policy Structure](#1-collection-policy-structure)
2. [Attachment Point — Where Collection Policy Plugs In](#2-attachment-point--where-collection-policy-plugs-in)
3. [Submodule Connection Map](#3-submodule-connection-map)
4. [End-to-End Runtime Flow](#4-end-to-end-runtime-flow-happy-path)
5. [Late Fee Calculation Engine](#5-late-fee-calculation-engine)
6. [Waiver Rules](#6-waiver-rules)
7. [Scenarios & Edge Cases](#7-scenarios--edge-cases)
8. [Identified Gaps](#8-identified-gaps-frontend)
9. [Data Model Reference](#9-data-model-reference)

---

## 1. Collection Policy Structure

**Type Definition:** `ICollectionPolicy` in
`src/screens/finance/policies/types/finance-policy.types.ts`

The Collection Policy (`policyType: 'collection'`) is a finance policy that governs **two runtime behaviours** during fee collection — **Late Fee** and **Waiver** — plus an **Online Collection** gate.

### 1.1 Sections & Fields

| Section | Field | Type | Purpose |
|---|---|---|---|
| **General** | `policyName` | `string` | Display name |
| | `policyCode` | `string` | Unique code (auto-generated `CP-{timestamp}` if empty) |
| | `status` | `'Active' \| 'Archived'` | Only Active policies are selectable |
| | `academicYearId` | `string` | Scoping to academic year |
| | `effectiveFrom` / `effectiveTo` | `string \| null` | Validity window |
| | `isDefault` | `boolean` | Default policy for the year |
| **Late Fee** | `enableLateFee` | `boolean` | Master switch |
| | `gracePeriodDays` | `number` (0–365) | Days after due date before penalty starts |
| | `lateFeeApplyOnFeeHeads` | `string[]` | Fee head IDs that attract late fee |
| | `lateFeeType` | `Flat \| Percentage \| PerDay \| PerWeek \| PerMonth \| Compound \| Slab` | Calculation method |
| | `flatAmount` | `number \| null` | Used when type = `Flat` |
| | `percentage` | `number \| null` (0–100) | Used when type = `Percentage` or `Compound` |
| | `percentageBase` | `OutstandingAmount \| OriginalFee \| RemainingBalance` | Base for percentage calc |
| | `amountPerDay/Week/Month` | `number \| null` | Used for respective types |
| | `compoundFrequency` | `Daily \| Weekly \| Monthly` | Compounding period |
| | `escalationRules` | `ILateFeeEscalationRule[]` | Slab definitions |
| | `roundingMethod` | `None \| RoundUp \| RoundDown \| NearestRupee` | Final rounding |
| | `considerAsIncome` | `boolean` | Book late fee as operational income |
| **Waiver** | `enableWaiver` | `boolean` | Master switch |
| | `waiverApplyOnFeeHeads` | `string[]` | Fee heads eligible for waiver |
| | `maximumWaiverAmount` | `number \| null` | Absolute cap |
| | `maximumWaiverPercentage` | `number \| null` (0–100) | Percentage cap |
| | `waiverExpiry` | `string \| null` (ISO date) | Waiver validity deadline |
| **Online** | `allowOnlineCollection` | `boolean` | Gate for online gateway collection |

### 1.2 Slab Rule Shape (`ILateFeeEscalationRule`)

```ts
{
  startDay: number;          // inclusive
  endDay: number | null;     // inclusive, null = open-ended
  calculationType: 'Flat' | 'Percentage';
  value: number;             // ₹ amount or % depending on type
  maxFee?: number | null;    // optional cap per slab
}
```

---

## 2. Attachment Point — Where Collection Policy Plugs In

The Collection Policy is **never applied directly to a student**. It flows through the **Fee Structure**.

```
┌─────────────────────────┐
│  Collection Policy      │  (created in Policies module)
│  lateFee + waiver rules │
└───────────┬─────────────┘
            │  attached via
            ▼
┌─────────────────────────┐
│  Fee Structure          │  (FeePoliciesTab.tsx)
│  collectionPolicyId     │  IClassWiseFeeStructureCard
└───────────┬─────────────┘
            │  assigned to
            ▼
┌─────────────────────────┐
│  Class / Student        │  (FeeStructureAssignmentForm)
└───────────┬─────────────┘
            │  generates
            ▼
┌─────────────────────────┐
│  DueFee Ledger Lines    │  (carry policy context)
│  month-wise + fee heads │
└───────────┬─────────────┘
            │  consumed by
            ▼
┌─────────────────────────┐
│  Fee Collection Runtime │  (late fee + waiver applied)
└─────────────────────────┘
```

**Key type** (`IClassWiseFeeStructureCard` — `src/screens/finance/settings/FeeStructure/type.tsx`):

```ts
export interface IClassWiseFeeStructureCard {
  // ...
  paymentPolicyId?: string;
  collectionPolicyId?: string;   // ← Collection Policy attaches here
  refundPolicyId?: string;
  prorationPolicyId?: string;
}
```

**Policy selection UI** (`FeePoliciesTab.tsx`) fetches Active policies via
`useGetFinancePoliciesQuery({ policyType: 'collection', academicYearId, status: 'Active' })`
and renders a dropdown per structure card.

---

## 3. Submodule Connection Map

### 3.1 ➡️ Fee Collection (Primary Consumer)

**Files:**
- `src/screens/finance/FeeCollection/FeeCollectionComponent/FeeCollectionForm.tsx`
- `src/redux/feeCollection/feeCollection.ts`

| Step | Action | Policy Influence |
|---|---|---|
| 1 | Open collect form → `GET /fee-collections/{studentId}/collect-form` | Ledger returns concession/refund/adjustment amounts already applied |
| 2 | Select fee heads + charges | `lateFeeApplyOnFeeHeads` determines which heads attract late fee |
| 3 | Enter payment amount | Allocated via `allocatePayment()` (priority/FIFO) |
| 4 | Submit → `POST /fee-collections` with `CollectFeeInput` | **Backend applies collection policy** for late fee + waiver |
| 5 | Receipt generated | `considerAsIncome` flags late fee as income |

**Status transitions** (`FeeCollectionStatusType`):
`Pending(0)` → `Paid(1)` | `Overdue(2)` | `Partial(4)` | `Reversed(3)` | `InReconciliation(5)`

The collection policy's `gracePeriodDays` triggers `Pending → Overdue`.

**API Contract (`CollectFeeInput`):**
```ts
{
  studentId: string;
  academicYearId: string;
  notes?: string;
  paymentConfirmed?: boolean;
  dueFeePayments: { dueFeeId; feeHeadId; amount }[];
  chargePayments: { chargeId; amount }[];
  payments: { paymentMethod; amount; details }[];
}
```

> ⚠️ The `collectionPolicyId` is **not sent** in the collect payload — the backend must resolve it from the student's fee structure.

---

### 3.2 ➡️ Charges Management

**Files:**
- `src/screens/finance/ChargesManagement/Components/UpdateChargeForm/UpdateChargeForm.tsx`
- `ChargeDetail` type in fee collection

- Charges are created independently with `chargeCategoryId`, `amount`, `dueDate`, and audience (board/medium/class/division/students).
- Charges surface in the **same collect form** as fees (`charges: ChargeDetail[]`).
- **Late fee applicability:** `lateFeeApplyOnFeeHeads` targets **fee heads only**. Charges have their own `dueDate` — whether they attract late fee is **not explicitly defined** in the collection policy schema (edge case — see §7.10).
- During collection, `chargePayments[]` are submitted alongside `dueFeePayments[]`, producing a **separate charge receipt** (`chargeReceiptId`).

---

### 3.3 ➡️ Refund

**Files:**
- `src/screens/finance/feeRefund/NewRefundForm/`
- `IRefundPolicy` type

- Refund has its **own policy** (`policyType: 'refund'`) with `deductionRules`, `maxRefundPercentage`, `refundOnWithdrawal/Transfer`, `enableRefundForCharge`, etc.
- **Intersection with Collection Policy:**
  - Collection policy **Waiver** (`enableWaiver`) reduces dues — this is a *write-off*, not a refund (no money returned to parent).
  - When a **refund is processed** on a paid DueFee line, the ledger's `refundAmount` and `refundDescription` are updated (visible in `FeeLedgerLine`).
  - Refund **reverses** a collection; if late fee was booked as income (`considerAsIncome: true`), the reversal must claw it back — governed by the **Refund Policy**, not the collection policy.
- **Key boundary:** Late fee heads are typically **excluded** from `IRefundPolicy.applicableFeeHeads`, making late fees non-refundable.

---

### 3.4 ➡️ Adjustment

**Files:**
- `src/screens/finance/adjustments/components/AdjustmentForm.tsx`
- `AdjustmentPreview.tsx`

- Adjustments modify the **same DueFee ledger** (using `feeHeadRefunds[]` structure with `dueFeeId` + `amount` per month).
- Adjustments can **increase or decrease** a student's payable.
- **Intersection with Collection Policy:**
  - An adjustment that **reduces** outstanding behaves like a manual waiver — it *should* respect `maximumWaiverAmount` / `maximumWaiverPercentage`, but **currently the adjustment form does NOT consult the collection policy** (gap — see §8).
  - After an adjustment, the recalculated outstanding affects **late fee recalculation** if `percentageBase: 'RemainingBalance'`.
- **Direction:** Adjustment → modifies ledger → collection policy's late fee may recompute on next collection.

---

### 3.5 ➡️ Concession

**Files:**
- `src/screens/finance/Concession/Components/ConcessionRequestForm.tsx`
- `IConcessionPolicy` type
- Ledger field `concessionAmount`

- Concession has its **own policy** (`policyType: 'concession'`) with `calculationMethod`, `applyOn`, `paidFeeAdjustment`, `pendingFeeHandling`, and critically `lateFeeBehaviour`.
- **This is the most tightly coupled submodule** with the collection policy.
- **Intersection points:**
  - When a concession is approved, the ledger line's `concessionAmount` is populated.
  - Collection policy's `percentageBase` (`OutstandingAmount` vs `OriginalFee` vs `RemainingBalance`) determines whether late fee is computed **before or after** concession.
  - **Concession policy's `lateFeeBehaviour`** (`Recalculate` / `KeepExisting` / `RemoveLateFee`) **directly overrides** the collection policy's late fee on concession-applied heads.
- **Flow:**
  ```
  Concession reduces dues
       ↓
  Outstanding drops
       ↓
  If collection policy uses RemainingBalance → late fee shrinks
       ↓
  Concession policy.lateFeeBehaviour has final say
  ```
- **Edge case:** Retrospective concession on already-overdue + late-fee-charged heads — concession policy's `receiptBehaviour` (`ReverseOriginalReceipt` / `GenerateAdjustmentReceipt`) triggers, looping back through collection/refund modules.

---

## 4. End-to-End Runtime Flow (Happy Path)

```
1. Admin creates Collection Policy
   └─ late fee type, grace period, waiver rules, online flag

2. Admin attaches it to Fee Structure
   └─ FeePoliciesTab → collectionPolicyId saved on IClassWiseFeeStructureCard

3. Fee Structure assigned to Class/Student
   └─ FeeStructureAssignmentForm / BulkFeeStructureAssignmentForm

4. System generates DueFee ledger lines
   └─ month-wise, per fee head, with due dates

5. Due date passes → gracePeriodDays elapse
   └─ status: Pending → Overdue

6. Late fee computed
   └─ per lateFeeType, on lateFeeApplyOnFeeHeads only
   └─ rounded per roundingMethod

7. Concession (if any) applied
   └─ concessionAmount set on ledger line
   └─ concession policy.lateFeeBehaviour may override

8. Adjustment (if any) modifies ledger
   └─ increases or decreases line amounts

9. User opens Fee Collection form
   └─ GET collect-form returns ledger with due/paid/concession/refund/adjustment
   └─ User selects heads + charges, enters payment

10. Waiver (if enabled) can reduce late fee
    └─ capped at maximumWaiverAmount / maximumWaiverPercentage

11. Submit → POST /fee-collections
    └─ dueFeePayments[] + chargePayments[] + payments[]
    └─ Backend applies collection policy rules

12. Receipt generated
    └─ fee receipt + charge receipt (separate)
    └─ Late fee booked as income if considerAsIncome = true

13. If refund needed later
    └─ Refund module reverses lines (refundAmount populated)
    └─ Refund policy governs deductions
```

---

## 5. Late Fee Calculation Engine

The policy form's **Live Calculator** (`useCollectionPolicyForm.ts`, lines 325–378) implements the full engine. The backend is expected to mirror this logic.

### 5.1 Algorithm

```
effectiveDays = daysLate − gracePeriodDays
if effectiveDays ≤ 0 → lateFee = 0

switch lateFeeType:
  case Flat:
    lateFee = flatAmount

  case Percentage:
    base = (percentageBase == OutstandingAmount) ? outstanding
         : (percentageBase == OriginalFee)        ? originalFee
         :                                          remainingBalance
    lateFee = (percentage / 100) × base

  case PerDay:
    lateFee = amountPerDay × effectiveDays

  case PerWeek:
    lateFee = amountPerWeek × ceil(effectiveDays / 7)

  case PerMonth:
    lateFee = amountPerMonth × ceil(effectiveDays / 30)

  case Compound:
    compounded = base
    periods = (Daily) ? effectiveDays
             : (Weekly) ? floor(effectiveDays / 7)
             :            floor(effectiveDays / 30)
    for i in 1..periods:
      compounded += compounded × (percentage / 100)
    lateFee = compounded − base

  case Slab:
    for each slab in escalationRules:
      if effectiveDays ≥ slab.startDay:
        limitDay = (slab.endDay == null) ? effectiveDays : min(effectiveDays, slab.endDay)
        activeDays = limitDay − slab.startDay + 1
        if activeDays > 0:
          if slab.calculationType == Flat:
            lateFee += slab.value × activeDays
          else:
            lateFee += (slab.value / 100) × base × activeDays

apply roundingMethod:
  RoundUp      → ceil(lateFee)
  RoundDown    → floor(lateFee)
  NearestRupee → round(lateFee)
  None         → lateFee
```

### 5.2 Allocation Math (Live Preview)

```
allocatedPayment = min(paymentEntered, outstanding + lateFee)
remainingBalance = outstanding + lateFee − allocatedPayment
```

---

## 6. Waiver Rules

The waiver subsystem allows a cashier/admin to **reduce or nullify the late fee** (and in some interpretations, a portion of the dues) under controlled limits.

| Parameter | Behaviour |
|---|---|
| `enableWaiver: false` | No waiver possible — full late fee must be collected |
| `waiverApplyOnFeeHeads: []` | Whitelist of heads eligible for waiver |
| `maximumWaiverAmount` | Absolute ₹ cap per transaction |
| `maximumWaiverPercentage` | % cap relative to total late fee |
| `waiverExpiry` | Date after which waiver option disables |

**Effective waiver** = `min(requestedWaiver, maxWaiverAmount, lateFee × maxWaiverPercentage / 100)`

> ⚠️ **Current gap:** Waiver input + cap validation is **not present** in the collection form runtime — it exists only in the policy editor schema. See §8.

---

## 7. Scenarios & Edge Cases

### 7.1 Compound Late Fee with Partial Payment Mid-Cycle

- **Setup:** `lateFeeType: Compound`, `compoundFrequency: Monthly`, `percentage: 2%`, `gracePeriodDays: 7`, `percentageBase: RemainingBalance`
- **Flow:** Each month after grace, 2% compounds on the outstanding.
- **Edge case:** If a partial payment is made mid-cycle, the compounding base should reduce. The Live Calculator does **not** simulate partial payments within compounding accurately — it uses a single `calcAmount`.

### 7.2 Slab-Based Late Fee with Overlaps

- **Setup:** Slabs: `1–10 → ₹10/day`, `11–20 → ₹20/day`, `21–null → ₹30/day`
- **Edge case (overlap):** If admin configures overlapping slabs (e.g., `1–15` and `10–20`), the engine sums both — likely unintended.
- **Edge case (gap):** If a gap exists (e.g., `1–10` and `15–20`), days 11–14 attract **no** late fee.
- **Current state:** `useCollectionPolicyForm.ts` does **not** validate slab continuity or overlap. The `addSlab()` helper auto-sets `startDay = previous.endDay + 1`, but manual edits can break this.

### 7.3 Waiver Exceeds Maximum Cap

- **Setup:** `maximumWaiverPercentage: 50%`, computed late fee = ₹1,000, cashier attempts ₹600 waiver.
- **Expected:** System blocks or caps at ₹500.
- **Current state:** Policy schema validates `maximumWaiverPercentage ≤ 100`, but the **collection form does not enforce the cap at runtime** — gap.

### 7.4 Concession + Late Fee Conflict

- Student has overdue April fees with ₹500 late fee already charged. Admin grants 100% concession on the tuition head.
- **Decision point:** Concession policy's `lateFeeBehaviour`:
  - `RemoveLateFee` → ₹500 wiped.
  - `KeepExisting` → ₹500 still owed.
  - `Recalculate` → late fee recomputed on reduced outstanding.
- **Collection policy** must respect this override. Currently **not explicitly wired** in the frontend collection flow.

### 7.5 Refund After Late Fee Collected

- Fee ₹10,000 + ₹500 late fee collected. Late fee booked as income (`considerAsIncome: true`).
- Parent requests refund due to withdrawal.
- **Refund policy** governs deductions (`deductionRules`, `maxRefundPercentage`).
- **Question:** Is ₹500 late fee refundable?
  - **Typical pattern:** Late fee head is **not** in `IRefundPolicy.applicableFeeHeads` → non-refundable.
  - **Edge case:** If `enableRefundForCharge: true` and late fee was booked as a charge, it may be refundable.

### 7.6 Adjustment on Overdue Head

- Admin gives negative adjustment (reduces) ₹2,000 on an overdue head.
- **Should late fee recompute?**
  - `percentageBase: OutstandingAmount` → yes, reduces.
  - `percentageBase: OriginalFee` → no change.
  - `percentageBase: RemainingBalance` → yes, reduces.
- **Gap:** Adjustment form doesn't read collection policy to trigger recalculation or respect waiver caps.

### 7.7 Positive Adjustment (Increase) on Overdue Head

- Admin increases payable by ₹1,000 via adjustment on an already-overdue head.
- **Question:** Does late fee apply to the increased portion?
- **Expected:** Yes, if the head is in `lateFeeApplyOnFeeHeads` and the adjustment is back-dated.
- **Current state:** Not handled — adjustment form submits raw amounts; backend behaviour unverified.

### 7.8 Policy Mid-Session Change (Versioning)

- Collection policy edited (grace period `7 → 14` days) after some dues are already overdue.
- **Versioning:** `useFinancePolicyVersion.ts` exists — old dues keep the old version snapshot, new dues get the new version.
- **Edge case:** If versioning is not enforced server-side, retroactive recalculation could cause audit discrepancies and parent disputes.

### 7.9 Online Collection Disabled

- `allowOnlineCollection: false` → online gateway payment should be blocked.
- **Edge case:** Does this also block UPI/Card in the fee collection form?
- **Current state:** **Not enforced** — `paymentMethodsConfig` in `paymentConfigMethods` is static and does not consult the policy.

### 7.10 No Collection Policy Attached

- Fee structure has `collectionPolicyId: ''` (the field is **optional** in `FeePoliciesTab`).
- **Result:** No late fee, no waiver — collection proceeds as plain amount collection.
- **This is the default fallback** for all legacy/pre-policy fee structures.

### 7.11 Charge Due Date vs Fee Due Date

- Charge (e.g., exam fee) has `dueDate: 2026-09-15`.
- Fee heads have monthly due dates (e.g., April–March).
- **Question:** Does `gracePeriodDays` apply to charge due dates too?
- **Ambiguity:** `lateFeeApplyOnFeeHeads` lists fee head IDs only — charges are identified by `chargeId`. The schema implies charges are **exempt** from collection-policy late fees. Needs backend confirmation.

### 7.12 Grace Period = 0

- `gracePeriodDays: 0` → late fee starts from **day 1** after due date.
- **Valid configuration** (schema allows `min: 0`).

### 7.13 Multiple Collection Policies on One Structure

- Only **one** `collectionPolicyId` can be attached per fee structure card.
- A student with fee heads from **multiple structures** (rare but possible via assignment overrides) could have **multiple collection policies** applying to different heads.
- **Edge case:** Late fee calculation must be done per-structure, not aggregated. Backend must handle this.

### 7.14 Waiver Expiry Passed

- `waiverExpiry: 2026-06-30`, cashier attempts waiver on 2026-07-15.
- **Expected:** Waiver option disabled / blocked.
- **Current state:** Not enforced at runtime.

### 7.15 Status = Archived

- `status: 'Archived'` policies are **not selectable** in `FeePoliciesTab` (query filters `status: 'Active'`).
- **Edge case:** Existing fee structures referencing an archived policy keep the old `collectionPolicyId` — backend must either block archival of in-use policies or support versioning.

---

## 8. Identified Gaps (Frontend)

| # | Gap | Impact | Severity | Recommendation |
|---|---|---|---|---|
| 1 | Collection form does not display computed late fee | Cashier can't see penalty before collecting | High | Show late-fee column in ledger derived from policy |
| 2 | Waiver not enforceable at collection time | Policy rules bypassed | High | Add waiver input + max-cap validation in collect flow |
| 3 | Adjustment form ignores collection policy | Inconsistent late-fee recalculation | Medium | Pass policy to adjustment form |
| 4 | `allowOnlineCollection` not gating payment methods | Online payment possible even if disabled | Medium | Filter payment methods based on policy flag |
| 5 | ~~Slab overlap/gap validation missing~~ **Resolved** | Ambiguous late fee computation | Medium | Added in `useCollectionPolicyForm.ts` (`computeSlabIssues`, shared with the `SlabTimelinePreview` visual) |
| 6 | Charge late-fee applicability undefined | Unpredictable penalties | Low | Clarify schema: add `applyToCharges` flag |
| 7 | Concession `lateFeeBehaviour` override not wired | Concession-latefee conflict unresolved | High | Wire concession policy into collection runtime |
| 8 | `waiverExpiry` not enforced at runtime | Expired waivers still processed | Medium | Add date check in collect flow |

---

## 9. Data Model Reference

### 9.1 Key Types

```
ICollectionPolicy                     (policy definition)
├─ enableLateFee, gracePeriodDays
├─ lateFeeType, flatAmount, percentage, ...
├─ escalationRules: ILateFeeEscalationRule[]
├─ enableWaiver, maximumWaiverAmount, ...
└─ allowOnlineCollection

IClassWiseFeeStructureCard            (attachment point)
└─ collectionPolicyId?: string

FeeLedgerLine                         (runtime ledger)
├─ dueFeeId, feeHeadId
├─ total, paid, due
├─ concessionAmount?                  ← from Concession module
├─ refundAmount?, refundDescription?  ← from Refund module
├─ reconciliationAmount?              ← from Adjustment module
└─ status                             ← FeeCollectionStatusType

CollectFeeInput                       (collection API payload)
├─ dueFeePayments[]
├─ chargePayments[]
└─ payments[]
```

### 9.2 Status Flow

```
Pending (0)
   ├── payment received ──→ Paid (1)
   ├── partial payment ───→ Partial (4)
   ├── grace exceeded ────→ Overdue (2)
   ├── reconciliation ────→ InReconciliation (5)
   └── refund/reversal ───→ Reversed (3)
```

### 9.3 Relevant Files

| Module | Path |
|---|---|
| Policy Types | `src/screens/finance/policies/types/finance-policy.types.ts` |
| Policy Form Hook | `src/screens/finance/policies/hooks/useCollectionPolicyForm.ts` |
| Policy API | `src/redux/finance/financePolicy.ts` |
| Policy Attachment | `src/screens/finance/settings/FeeStructure/Components/FeePoliciesTab.tsx` |
| Fee Collection Form | `src/screens/finance/FeeCollection/FeeCollectionComponent/FeeCollectionForm.tsx` |
| Fee Collection API | `src/redux/feeCollection/feeCollection.ts` |
| Charges Form | `src/screens/finance/ChargesManagement/Components/UpdateChargeForm/UpdateChargeForm.tsx` |
| Refund Form | `src/screens/finance/feeRefund/NewRefundForm/RefundForm.tsx` |
| Adjustment Form | `src/screens/finance/adjustments/components/AdjustmentForm.tsx` |
| Concession Form | `src/screens/finance/Concession/Components/ConcessionRequestForm.tsx` |
| Fee Structure Types | `src/screens/finance/settings/FeeStructure/type.tsx` |
| Collection Status Enum | `src/enums/fee-collection-type.ts` |

---

*End of document.*