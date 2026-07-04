# Refund Policy — Product-Level Flow & Submodule Integration

> **Scope:** This document explains how the **Refund Policy** is *meant* to connect with Fee Collection, Concession, Charges, Adjustment, and the Collection / Late-Fee policy. It covers the complete end-to-end flow, how every policy field is intended to work, all scenarios and edge cases, and — most importantly — what must change for the policy to actually drive behaviour everywhere.
>
> **Companion docs:**
> - [`concession-policy-flow.md`](./concession-policy-flow.md) — §4.2 there is the reverse angle (how a paid-fee concession's `paidFeeAdjustment = 'Refund'` is meant to loop into this module).
> - [`concession-policy-product-flow.md`](./concession-policy-product-flow.md) — §5.5 (Refund) and §9 (Change 5) describe the same paid-fee-disposal boundary from the concession side.
> - [`collection-policy-flow.md`](./collection-policy-flow.md) — §3.3 / §7.5 for the refund-vs-late-fee clawback question and the refund-vs-waiver boundary.
>
> **Last Updated:** 2026-07-02

---

## Table of Contents

1. [Executive Summary — The One Big Thing to Know](#1-executive-summary--the-one-big-thing-to-know)
2. [Four Things Called "Refund" — Don't Mix Them Up](#2-four-things-called-refund--dont-mix-them-up)
3. [Current State vs Intended State](#3-current-state-vs-intended-state)
4. [The Submodule Connection Map](#4-the-submodule-connection-map)
5. [Connection Detail — Submodule by Submodule](#5-connection-detail--submodule-by-submodule)
6. [End-to-End Business Flow (Happy Path)](#6-end-to-end-business-flow-happy-path)
7. [How Each Field Works & Where It Must Apply](#7-how-each-field-works--where-it-must-apply)
8. [Scenarios & Edge Cases](#8-scenarios--edge-cases)
9. [What Must Change to Make the Policy Work Everywhere](#9-what-must-change-to-make-the-policy-work-everywhere)
10. [Glossary](#10-glossary)

---

## 1. Executive Summary — The One Big Thing to Know

> **The Refund Policy is the most over-promised, under-wired module in the finance suite.** Its editor collects a rich set of rules — which fee heads are refundable, whether partial refunds are allowed, deduction tiers (e.g. "10% deducted after 30 days"), maximum refund caps, bank-detail requirements, an SLA for how fast a refund must be paid, and flags for refund-on-withdrawal/transfer and treating the payout as an expense. **Almost none of these rules are enforced anywhere at runtime.**

Here is the single most important fact to internalise:

> 🚩 **The Refund Policy is attached to the Fee Structure and saved correctly — but nothing on the operational side ever reads it back.** The actual "raise a refund" form does not load the student's refund policy, does not enforce its fee-head scope, does not apply its deduction tiers, does not respect its maximum caps, does not require bank details even when the policy says they are mandatory, and does not track the refund SLA. The approval step does not send the policy either.

This makes the Refund Policy **worse than the Concession Policy**. The Concession Policy at least has the honesty of *not being attached to anything* — it is openly a design-time template. The Refund Policy, by contrast, is **fully plumbed into the Fee Structure, persisted to the server, and round-tripped on save — then silently ignored.** Administrators configuring deduction tiers and maximum caps are doing work that changes nothing in the system.

What the Refund module *does* actually do at runtime is narrow and correct: it lets a staff member raise a refund against a student's **already-paid** due-fee lines, sends those lines + a method + a reason to the server, and (after the server processes it) the resulting `refundAmount` shows up later in the fee-collection screen as a small info badge. That is the entire live surface.

Everything else — the policy-driven enforcement, the coupling to concession, the coupling to charges, the late-fee clawback, the accounting-as-expense treatment — is either a stored-but-unused flag, dead UI, or an intended-but-unbuilt backend contract.

---

## 2. Four Things Called "Refund" — Don't Mix Them Up

The word "refund" is used for four distinct things in this codebase. Confusing them is the #1 source of misunderstanding.

| Concept | What it is | Where it lives |
|---|---|---|
| **Refund Policy** | A *rule template* — defines **how** refunds are governed: refundable fee heads, partial-vs-full, deduction tiers, max caps, bank requirements, SLA, withdrawal/transfer triggers. **Editor-only today.** | The Policies & Rules workspace (the "Refund Policy" screen). |
| **Refund Request / Voucher** | The actual *operational* refund — a staff member selects a student's paid due-fee lines, enters amounts, picks a pay-out method, and submits. Goes through approval, then money is returned. | The Fee Refund module (the live "raise refund" form). |
| **Concession-driven refund** | When a **concession is granted on already-paid fees**, the Concession Policy's `paidFeeAdjustment = 'Refund'` is *supposed* to trigger a refund voucher automatically. **This loop does not exist today** — it is an intended contract only. | Owned conceptually by the Concession module, never handed off. |
| **Late-fee clawback on refund** | When a refund reverses a collection that had a **late fee booked as income**, the system should claw back that late fee. **No such logic exists.** | Should be a joint Refund × Collection responsibility; unmodelled. |

> 🚩 **Central architectural finding:** At runtime, only **Refund Request/Voucher** is real. The **Refund Policy** that is *supposed* to govern it is never consulted. The **concession-driven refund** and **late-fee clawback** are documented intents with zero implementation. Treat the policy's rules as **aspirational** until §9 is delivered.

---

## 3. Current State vs Intended State

| Policy rule | Intended behaviour | Current state |
|---|---|---|
| **Refundable fee heads** (`applicableFeeHeads`) | Only selected heads can be refunded; others are blocked/hidden in the refund form. | ✅ Editable in policy. ❌ **Never enforced** — the refund form shows all paid heads from the eligibility endpoint, regardless of policy. |
| **Refund on full vs partial** (`refundOn`) | Eligibility gate by payment type — `FullPayment` = only fully-paid fees are refundable; `PartialAndFullPayment` = partially-paid fees are refundable too. (Not a "partial refund" toggle.) | ✅ Editable. ❌ **Never enforced** — the form refunds any paid line regardless of how fully it was paid. |
| **Deduction tiers** (`deductionRules`) | "After 30 days, deduct 10%; after 60 days, 20%" — reduces the amount returned to the parent. | ❌ **No editor exists at all** — the tier builder was never built; the field always saves empty. Even if populated, nothing applies it. |
| **Max refund % / amount** (`maxRefundPercentage`, `maxRefundAmount`) | Hard ceiling on what can be refunded per request or per head. | ❌ **No editor, no enforcement.** |
| **Bank details required** (`bankDetailsRequired`) | Force the parent's bank info before a bank-transfer refund can be submitted. | ✅ Editable. ⚠️ Partial — the form does validate payment-detail fields per *method*, but the policy flag itself is not what drives it. |
| **Refund due within (SLA)** (`refundDueWithin`) | "Refund must be paid within 7 days" — tracked, surfaced on a dashboard, breached-flagged. | ✅ Editable & required. ❌ **Never surfaced or tracked** after save. |
| **Refund for charges** (`enableRefundForCharge`) | Allow refunding structural charges (late fee, fines), not just fee heads. | ✅ Editable. ❌ **Charge refund does not exist** — the data contract has no refund field on charges; the only charge-refund UI ever written is dead/unreachable code. |
| **Refund on withdrawal / transfer** (`refundOnWithdrawal`, `refundOnTransfer`) | Auto-trigger a refund workflow when a student is withdrawn or transferred. | ✅ Editable. ❌ **No auto-trigger** — these are stored flags; no student-lifecycle hook raises a refund. |
| **Consider as expense** (`considerAsExpense`) | Book the refund pay-out as an operational expense in accounting. | ✅ Editable. ❌ **No accounting integration.** |
| **Processing days** (`processingDays`), **method** (`refundMethod`), **partial allowed** (`allowPartialRefund`), **approval required** (`requireApproval`) | Legacy governance fields. | ⚠️ Shown as **columns in the policy list**, but **not editable** — newly created rows display defaults the admin never chose. |
| **Compliance code** (`governmentComplianceCode`), **notice days** (`cancellationNoticeDays`), **validity window** (`effectiveFrom/To`) | Compliance / lifecycle fields. | ❌ **No editor** (except window defaults that aren't rendered). |

**The pattern is stark:** the policy is richly *typed* and *editable* on a subset of fields, but **runtime enforcement is essentially zero.** Every "✅ Editable / ❌ Not enforced" row in the table above is a gap.

---

## 4. The Submodule Connection Map

```
                         ┌─────────────────────────────┐
                         │      REFUND POLICY          │
                         │  (rules: refundable heads,  │
                         │   deduction tiers, max %,   │
                         │   bank required, SLA, ...)  │
                         └──────────────┬──────────────┘
                                        │
              ✅ ATTACHED to Fee Structure (refundPolicyId
                 is saved & round-tripped) …
                                        │
                         ⚠️ … but NEVER READ BACK by the
                            refund form or collection form.
                                        │
                                        ▼
          ┌──────────────────────────────────────────────┐
          │   REFUND REQUEST / VOUCHER (the live module)  │
          │   staff → student → pick paid due-fee lines   │
          │   → enter amounts → method → reason → submit  │
          └──────────────┬──────────────────────────────┬┘
                        │                                │
          (NO auto-handoff                            (reads its own
           from concession)                           eligibility endpoint)
                        │                                │
                        ▼                                ▼
   ┌────────────────────────────┐         ┌──────────────────────────┐
   │  Fee-Head Approval View    │         │  Refund Eligibility      │
   │  (per-month refund amounts)│         │  (per head/month: paid,  │
   └──────────────┬─────────────┘         │   refunded, refundable)  │
                  │ PATCH …/status         └──────────────────────────┘
                  ▼  (Pending→UnderReview→Approved→Rejected/Cancelled)
          ┌──────────────────────────────────────┐
          │  SERVER writes refundAmount +         │
          │  refundDescription onto FeeLedgerLine │
          └──────────────────┬───────────────────┘
                             │ read back (display only)
                             ▼
                ┌────────────────────────────┐
                │   FEE COLLECTION screen    │
                │  refund shown as a small    │
                │  "?" info badge, NOT a      │
                │  financial column; does not │
                │  reduce collectable amount  │
                └────────────────────────────┘
```

**What is NOT on this map (because it doesn't exist yet):**

- No arrow from **Concession → Refund** (paid-fee-disposal = Refund never auto-creates a voucher).
- No arrow from **Refund → Charges** (charges carry no refund field; charge refund is dead code).
- No arrow from **Refund → Late-Fee clawback** (no field models it, no logic reverses a booked late fee).
- No arrow from **Refund → Accounting** (`considerAsExpense` has no effect).
- No version snapshot of the policy onto the refund request.

---

## 5. Connection Detail — Submodule by Submodule

### 5.1 ➡️ Fee Collection (the only real consumer — and it's read-only)

The fee-collection screen is where a processed refund becomes visible. After the server applies a refund, the next time someone opens the student's collect form:

- The ledger line for the refunded due-fee carries two fields: `refundAmount` (how much was refunded) and `refundDescription` (a note).
- These render as a **small "?" info badge** next to the fee-head name — *not* as a financial column. The collection ledger deliberately has columns only for TOTAL, PAID, PENDING, CONCESSION, and RECONCILIATION. **There is no REFUND column.**
- The refund **does not reduce** the collectable amount. Selectability of a line is driven purely by "is there outstanding dues", and the amount to collect is the dues. A refund is informational here, not arithmetic.

**Boundary:** Collection only *reads* refund data. It never creates, edits, reverses, or recomputes a refund. Refund is a server-owned mutation surfaced as a badge at collection time. This is correct *for display* — but it means the cashier gets almost no visibility into refunds (no column, no totals).

> 🚩 **Gap:** Because there is no REFUND column and no totals, a cashier looking at a student who has had ₹15,000 refunded will see nothing more than a per-line "?" badge they must hover. There is no at-a-glance refund visibility in the collection screen.

### 5.2 ➡️ Concession (the missing hand-off)

This is the **most important missing connection.** When a concession is granted on **already-paid** fees (i.e. the Concession Policy's "apply on" includes paid fees), the money that was overpaid must go somewhere. The Concession Policy's `paidFeeAdjustment` field offers the disposal options: **Refund**, Credit Note, Student Wallet, Future Fee Adjustment, or Manual Decision.

- When `Refund` is selected, the concession policy UI shows a warning: *"Selecting 'Refund' will trigger a refund voucher and require bank details. Ensure your Refund Policy is configured."*
- The concession simulator also computes a notional "refund required" figure for preview.

**What should happen (intended):** Approving such a concession should automatically raise a refund request that then flows through the **Refund Policy** (its deductions, its caps, its bank requirements) — exactly as if a staff member had raised it manually.

**What actually happens:** 🚩 **Nothing.** The approve-concession payload never sends `paidFeeAdjustment`, and nothing in the concession approval flow calls the refund API. The refund is purely an intended backend contract that the frontend cannot drive. The "Refund Policy must be configured" warning is therefore **aspirational** — configuring it changes nothing about a paid-fee concession today.

**Boundary (important for design):** Even when this is wired, the **Refund Policy governs the deductions and caps**, not the concession policy. The concession policy only *initiates* the refund intent; the Refund Policy decides how much actually leaves the school's account and on what timeline.

### 5.3 ➡️ Adjustment (shared scaffolding, no financial logic)

Refund and Adjustment both move money on the **same ledger line** but through **different fields**:

- Refund → `refundAmount` (money returned to the parent).
- Adjustment → `reconciliationAmount` (an internal ledger correction; no money leaves).

The two share a **UI component** (the per-fee-head / per-month entry table is reused, with a `refund` vs `adjustment` mode flag) and a similar form shape. But they hit **different endpoints** and write **different ledger fields.**

> 🚩 **Gap:** There is **no logic** that reconciles a refund against an existing adjustment on the same due-fee line (or vice versa). If an adjustment has already moved `reconciliationAmount` on a line, and then a refund is raised against the same line, the two operate independently — the net effect is whatever the backend makes of two uncoordinated writes. The frontend never checks "is there already an adjustment here?" when raising a refund.

**Effective collectable** on a line (server-derived, never computed explicitly in the frontend): `total − paid − concessionAmount − reconciliationAmount` … with refund handled separately as a reversal of `paid`. The frontend does not assemble this combination; it trusts the server's `due`.

### 5.4 ➡️ Charges (disconnected)

Charges (exam fees, lab fees, fines, late-fee-as-charge) are a **separate receipt stream** from fee heads. The data contract reflects this: a charge line has a `reconciliationAmount` field but **no `refundAmount` / `refundDescription`**. So at the type level, **charges are not refund-aware.**

- The policy has an `enableRefundForCharge` flag, edited and shown in the policy summary — but it is **inert**. The refund form only ever works against fee-head/month due-fee lines; there is no charge surface in the eligibility endpoint or the create-refund payload (a refund line is `{ dueFeeId, amount }` — no `chargeId` is possible).
- The one piece of charge-refund UI that was ever written is **dead/unreachable code** — it exists in files nothing imports.

> 🚩 **Gap:** A school that wants to refund an exam or lab charge **cannot do it** through the refund module today. The `enableRefundForCharge` flag promises something the system cannot deliver. Either build charge refund (add a charge surface to eligibility + payload + a `refundAmount` on charges) or remove the flag to stop over-promising.

### 5.5 ➡️ Collection / Late-Fee Policy (clawback is unmodelled)

When the Collection Policy charges a **late fee** on an overdue head and books it as income, a subsequent refund on that head creates an accounting problem: the late-fee income has already been recognised, but the refund is reversing the collection. The system should **claw back** the late fee.

- The Collection Policy models this question (`considerAsIncome` flag), but the **Refund Policy has no corresponding field** — there is no `lateFeeClawback` or `lateFeeBehaviour` on the refund policy (compare the Concession Policy, which *does* have a `lateFeeBehaviour` override).
- The **only** mechanism today is **manual exclusion**: the admin is expected to *omit* late-fee heads from the Refund Policy's `applicableFeeHeads`, making late fees non-refundable by convention. This exclusion is **not enforced** — nothing stops a staff member raising a refund that happens to include a late-fee-charged head.

> 🚩 **Gap:** There is no frontend clawback of late fees on refund. The intended pattern (exclude late-fee heads from `applicableFeeHeads`) is a human convention with no system guard. This is the refund-side mirror of the same open edge case noted in `collection-policy-flow.md §7.5`.

### 5.6 ➡️ Fee Structure (attached but inert)

Unlike the Concession Policy (which has no attach-point at all), the Refund Policy **does** attach to the Fee Structure: each class-wise fee structure carries a `refundPolicyId`, it is selectable from a dropdown of Active refund policies, and it is saved and round-tripped correctly.

> 🚩 **The cruel irony:** the attachment is *perfectly wired for persistence and completely unused for behaviour.* The refund form never reads the student's fee structure to find its refund policy. So `refundPolicyId` is a saved string that drives nothing. This is the single highest-leverage fix (see §9, Change 1): once the refund form reads the attached policy, most other enforcement becomes a matter of honouring fields that already exist.

### 5.7 ➡️ Accounting / Expense (`considerAsExpense`)

The policy lets an admin mark refunds as "treated as an operational expense." This has **no accounting integration** in the frontend — it is a stored boolean. When a real accounting/general-ledger integration is built, this flag should route the refund pay-out to the expense ledger rather than netting it against fee income.

---

## 6. End-to-End Business Flow (Happy Path)

```
1. Admin creates a Refund Policy
   └─ picks refundable fee heads, refund-on (full/partial), bank-required,
      SLA days, withdrawal/transfer flags, expense flag
   └─ ⚠️ deduction tiers + max caps have NO editor (saved empty)
   └─ ⚠️ simulation panel echoes the input amount (no deduction math)

2. Admin attaches the policy to a Fee Structure
   └─ refundPolicyId selected from Active policies, saved, round-tripped
   └─ ✅ this works … but nothing later reads it (see step 5)

3. Student pays fees normally (Fee Collection)
   └─ due-fee lines become "paid"

4. Trigger event occurs
   ├─ (a) Staff manually raises a refund, OR
   ├─ (b) Student is withdrawn/transferred  ← ⚠️ auto-trigger does NOT exist
   └─ (c) A paid-fee concession is approved with disposal=Refund  ← ⚠️ NOT wired

5. Staff opens the Refund form
   └─ picks Board → Medium → Class → Division → Student
   └─ eligibility query returns per-fee-head, per-month:
        total, paid, refunded-so-far, refundable (paid − refunded)
   └─ ⚠️ the form does NOT load the student's refund policy, so:
        - no fee-head scope enforced (all paid heads shown)
        - no full-vs-partial enforcement
        - no deduction tiers applied
        - no max %/amount cap applied

6. Staff enters refund amounts per paid month
   └─ guard: amount must be > 0 for at least one month
   └─ picks a pay-out method (Bank Transfer / Cash / Cheque / Online)
   └─ method-specific payment details captured + validated
   └─ enters a reason / notes

7. Submit
   └─ POST /fee-refunds  { studentId, academicYearId,
        lines:[{ dueFeeId, amount }], refundMethod, reason, paymentDetails }
   └─ ⚠️ NO refundPolicyId is sent — server must infer the governing policy
   └─ request status → Pending (0)

8. Approver processes the refund
   └─ PATCH /fee-refunds/{id}/status  { status, notes }
   └─ status flow: Pending(0) → UnderReview(1) → Approved(2)
                   or → Rejected(3) / Cancelled(4)
   └─ ⚠️ the approve/process workflow currently lives only in legacy UI;
        the live form's status transitions are under-built

9. Server applies the refund to the ledger
   └─ writes refundAmount + refundDescription onto each selected FeeLedgerLine
   └─ (expected, backend-side) honours policy: deduction tiers reduce payout,
        max cap applied, bank details validated, SLA clock started,
        late-fee clawback if applicable
   └─ ⚠️ none of these are verified end-to-end today

10. Next Fee Collection open
    └─ collect-form GET returns lines with refundAmount populated
    └─ cashier sees a "?" info badge (no column, no totals)
    └─ refund does NOT reduce the collectable amount (display only)

11. (Optional) Reject / Cancel
    └─ Rejected(3) / Cancelled(4) — refund not applied; ledger untouched
```

---

## 7. How Each Field Works & Where It Must Apply

This section is the field-by-field product spec — what each policy field **means**, where it **should** take effect, and (critically) **whether it does today.**

### 7.1 General / base fields

| Field | What it means | Where it must apply | Today |
|---|---|---|---|
| **Policy name** | Human label. | List, attachments dropdown. | ✅ |
| **Policy code** | Short identifier, auto-generated. | References, audit. | ✅ |
| **Status** (Active / Archived) | Only Active policies are selectable for attachment. | Attachment dropdown filters to Active. | ⚠️ UI offers only Active/Archived though the type allows Draft/Published/Inactive; new rows default to Draft and Submit force-flips to Active. |
| **Default policy** | Pre-selected when a fee structure doesn't name one. | Fee-structure attachment default. | ✅ editable. |
| **Academic year** | Scopes the policy to a year. | Attachment dropdown filters by year. | ✅ |
| **Validity window** (effective from/to) | Policy only governs refunds raised in the window. | Gate refund raising by date. | ❌ No editor; not enforced. |
| **Description** | Free text. | — | ✅ |

### 7.2 Eligibility fields

| Field | What it means | Where it must apply | Today |
|---|---|---|---|
| **Refundable fee heads** (`applicableFeeHeads`) | Whitelist of heads that can ever be refunded. | **Refund form**: only these heads appear as refundable; others hidden/blocked. | ✅ editable. ❌ **Not enforced.** |
| **Refund on** (`FullPayment` / `PartialAndFullPayment`) | **Eligibility gate by payment type** — decides *on which payment states* a refund is allowed. `FullPayment` = only fully-paid fees qualify; `PartialAndFullPayment` = partially-paid fees qualify too. This is **not** a "partial refund" switch (the form always accepts any amount up to the refundable balance); it only decides whether a partially-paid fee is refundable *at all*. | **Refund form**: when `FullPayment`, hide/block partially-paid months in the eligibility table. | ✅ editable. ❌ **Not enforced.** |
| **Refund for charges** (`enableRefundForCharge`) | Allow refunding structural charges, not just heads. | **Refund form**: add a charge surface. | ✅ editable. ❌ **Charge refund doesn't exist.** |
| **Refund on withdrawal** | Auto-raise a refund when a student withdraws. | **Student lifecycle**: withdrawal triggers a refund workflow. | ✅ editable. ❌ **No auto-trigger.** |
| **Refund on transfer** | Auto-raise a refund on student transfer. | **Student lifecycle**: transfer triggers a refund workflow. | ✅ editable. ❌ **No auto-trigger.** |

### 7.3 Processing fields

| Field | What it means | Where it must apply | Today |
|---|---|---|---|
| **Refund due within (days)** (`refundDueWithin`) | SLA — refund must be paid within N days of approval. | **Approve** sets a due date; **dashboard** tracks breaches; overdue refunds flagged. | ✅ editable & required. ❌ **Not surfaced/tracked after save.** |
| **Bank details required** (`bankDetailsRequired`) | Force parent bank info for transfer refunds. | **Refund form**: block submit until bank details present when method needs them. | ⚠️ Method-level field validation exists, but the policy flag itself isn't the driver. |
| **Deduction tiers** (`deductionRules`) | Time-based deductions: "after N days, deduct X% (or ₹X)". Reduces the amount returned. | **Refund calc**: net refund = gross − tier deduction, tier chosen by days-since-payment (or policy-trigger date). | ❌ **No editor at all** (field always empty). ❌ Not applied. |
| **Max refund %** (`maxRefundPercentage`) | Ceiling on refund as % of paid. | **Refund calc**: cap the line/request amount. | ❌ No editor; not enforced. |
| **Max refund amount** (`maxRefundAmount`) | Ceiling on refund as a flat amount. | **Refund calc**: cap the line/request amount. | ❌ No editor; not enforced. |

### 7.4 Accounting & compliance fields

| Field | What it means | Where it must apply | Today |
|---|---|---|---|
| **Consider as expense** (`considerAsExpense`) | Book the pay-out as an operational expense (vs netting fee income). | **Accounting/GL integration** on payout. | ✅ editable. ❌ **No accounting integration.** |
| **Government compliance code** | e.g. RTE / state-board refund code. | Printed on refund voucher; compliance reports. | ❌ No editor. |
| **Cancellation notice days** | Minimum notice before a refund can be cancelled/reversed. | Cancel-refund guard. | ❌ No editor; not enforced. |

### 7.5 Legacy fields (shown in list, not editable)

| Field | Note |
|---|---|
| **Refund method** (`refundMethod`), **Processing days** (`processingDays`), **Partial refund allowed** (`allowPartialRefund`), **Approval required** (`requireApproval`) | Displayed as **columns in the policy list table** with default values the admin never chose (e.g. method = "Bank Transfer", processing days = 7). Either build editors for them or remove the columns to avoid implying they're configured. |

---

## 8. Scenarios & Edge Cases

### 8.1 Full refund of a fully-paid fee head
- **Setup:** Tuition April = ₹5,000, fully paid. Staff refunds the whole ₹5,000.
- **Intended:** `refundOn: FullPayment` permits it; net payout depends on deduction tiers + caps.
- **Today:** ✅ Works mechanically (the form allows it), but ❌ no deductions/caps applied — the parent gets the full ₹5,000 regardless of policy.

### 8.2 Refund of a partially-paid fee when policy allows full payments only
- **First, what the field means:** `refundOn` is an **eligibility gate by payment type** — it decides *on which payment states a refund is allowed*. `FullPayment` = only **fully-paid** fees are refundable; `PartialAndFullPayment` = **partially-paid** fees are refundable too. It is **not** a "partial refund" toggle (refunding part of a paid amount is just normal refund entry — the form takes any amount up to the refundable balance).
- **Setup:** Policy = `refundOn: FullPayment`. A fee head is only half-paid (₹2,500 of ₹5,000). Staff tries to refund that ₹2,500.
- **Intended:** Blocked — under `FullPayment`, a partially-paid fee is not eligible for refund at all (the head must be fully paid first before it becomes refundable).
- **Today:** ❌ **Allowed.** The form honours only the eligibility endpoint's `refundable` figure, not the policy's payment-type gate.

### 8.3 Refund after a late fee was collected (clawback)
- **Setup:** ₹10,000 fee + ₹500 late fee collected; late fee booked as income. Parent withdraws; full refund requested.
- **Intended:** Refund returns the fee principal; the ₹500 late-fee income is clawed back (or the late-fee head is excluded from `applicableFeeHeads` so it's non-refundable).
- **Today:** ❌ **No clawback logic.** The only protection is the *human convention* of excluding the late-fee head from `applicableFeeHeads` — and that exclusion isn't enforced. This is the canonical "everything-coupled" refund scenario and the riskiest gap.

### 8.4 Deduction tier should reduce the payout
- **Setup:** Policy says "after 30 days, deduct 10%." A fee paid 45 days ago is refunded.
- **Intended:** Gross ₹5,000 → 10% deduction ₹500 → parent receives ₹4,500.
- **Today:** ❌ **Cannot happen** — there is no deduction-tier editor, so the policy can't even express the rule, and even if it could, nothing applies it. Parent receives ₹5,000.

### 8.5 Maximum refund cap exceeded
- **Setup:** Policy caps refunds at 80%. Staff tries to refund 100% of a paid head.
- **Intended:** Capped at 80%; the form warns/blocks.
- **Today:** ❌ **No cap exists.** 100% (and beyond, if a head is somehow over-refundable) is unguarded client-side.

### 8.6 Concession on a paid fee triggers a refund
- **Setup:** A 100% concession is granted on an already-paid head; Concession Policy `paidFeeAdjustment = 'Refund'`.
- **Intended:** Approving the concession auto-raises a refund governed by the Refund Policy (deductions, caps, bank details).
- **Today:** ❌ **Nothing happens.** The approve-concession payload omits `paidFeeAdjustment`; no refund voucher is created. The "Refund Policy must be configured" warning is hollow.

### 8.7 Refund + adjustment on the same line
- **Setup:** A line has `reconciliationAmount: 500` (adjustment) and is then refunded ₹1,000.
- **Intended:** The two are reconciled so the net effect is unambiguous (e.g. refund computed on the post-adjustment figure, or the adjustment reversed first).
- **Today:** ❌ **No coexistence logic.** Refund and adjustment write different fields independently; the net is whatever the backend makes of two uncoordinated writes. The frontend never checks for an existing adjustment when raising a refund.

### 8.8 Refund of a charge (exam/lab/fine)
- **Setup:** School wants to refund a ₹500 exam charge.
- **Today:** ❌ **Impossible.** Charges carry no refund field; the create-refund payload can't carry a `chargeId`. The `enableRefundForCharge` flag promises this but delivers nothing.

### 8.9 Bank details required but missing
- **Setup:** Policy = `bankDetailsRequired: true`; staff submits a bank-transfer refund without entering bank details.
- **Intended:** Submit blocked until bank details present.
- **Today:** ⚠️ **Partially** — method-specific payment-detail validation runs, but it is keyed to the *refund method's* field config, not to the policy's `bankDetailsRequired` flag. If the method config is loose, the policy flag won't save you.

### 8.10 SLA breach (refund not paid within N days)
- **Setup:** Policy `refundDueWithin: 7`. An approved refund is still unpaid after 10 days.
- **Intended:** Flagged as breached on a dashboard/report; escalates.
- **Today:** ❌ **Not tracked.** The SLA number is saved and forgotten. There is no "overdue refunds" view.

### 8.11 Withdrawal / transfer does not auto-refund
- **Setup:** Student withdraws mid-term; policy `refundOnWithdrawal: true`.
- **Intended:** Withdrawal triggers a refund workflow (possibly pre-filled with pro-rated refundable amounts).
- **Today:** ❌ **No trigger.** A staff member must manually raise the refund. The flag is inert.

### 8.12 Policy edited after refunds granted (versioning)
- **Setup:** Deduction tiers changed after some refunds are already approved.
- **Intended:** Each refund request freezes the policy version that governed it, so retroactive edits don't rewrite history.
- **Today:** ❌ **No snapshot.** A generic audit-trail viewer exists (you can see *what changed* in the policy), but no policy version is frozen onto a refund request. Retroactive re-derivation could conflict with edits. (Same gap as the Concession Policy.)

### 8.13 Refundable-heads gate ignored
- **Setup:** Policy lists only "Tuition" as refundable. Staff tries to refund "Lab Fee."
- **Intended:** Lab Fee is hidden/blocked in the refund form.
- **Today:** ❌ **All paid heads are shown.** The scope is not enforced.

### 8.14 Multiple refunds stacking on one head
- **Setup:** A head paid ₹5,000. Refund ₹2,000, then later another ₹4,000.
- **Intended:** Second refund capped at remaining refundable (₹3,000). The eligibility endpoint's `refunded`-so-far should make this safe.
- **Today:** ⚠️ The eligibility endpoint does track `refunded` per line, so over-refund is *partially* guarded by the backend. But because deduction tiers and caps aren't applied, the "remaining refundable" figure may itself be wrong.

### 8.15 Approve / process workflow only in legacy UI
- **Setup:** An approver wants to move a refund Pending → Approved.
- **Today:** ⚠️ The status-transition endpoints exist, but the approve/reject/process **screen lives only in the legacy refund UI**, not in the live "New Refund Form" flow. The operational lifecycle is split across an old and a new surface.

### 8.16 Status lifecycle collapse
- The policy type allows five statuses (Active/Inactive/Draft/Published/Archived), but the editor and the list filter expose only **Active/Archived**, new rows default to **Draft**, and Submit force-sets **Active**. Draft/Published/Inactive are unreachable through the UI, which can confuse anyone reading the type definition.

### 8.17 Dead / duplicate code paths
- An **abandoned refund rewrite** (a whole folder) and several **unreachable charge-refund / terms-to-refund components** still ship in the codebase. A maintainer could accidentally wire the dead path and silently get no behaviour. These should be deleted or clearly marked deprecated.

---

## 9. What Must Change to Make the Policy Work Everywhere

This is the actionable heart of the document. Changes are grouped by severity. Each is framed as **what to build** so the Refund Policy actually governs refunds end-to-end.

### 🔴 Critical (the policy currently does almost nothing)

**Change 1 — Make the refund form read and obey the attached Refund Policy.**
Today the live refund form never loads the student's fee structure or its `refundPolicyId`. Fix this once and most downstream enforcement becomes "honour fields that already exist":
- On student selection, resolve the student's fee structure → its `refundPolicyId` → the Refund Policy.
- **Enforce `applicableFeeHeads`:** only refundable heads appear in the eligibility table; others hidden.
- **Enforce `refundOn`:** when `FullPayment`, lock partially-paid months.
- **Enforce `bankDetailsRequired`:** block submit when bank details are absent and the method/policy demands them.
- **Send `refundPolicyId`** (or the resolved policy) in the create-refund payload so the server acts deterministically.
- This single change converts the policy from "saved string" to "live governor."

**Change 2 — Build the deduction-tier editor (it is the heart of the policy and has no UI).**
`deductionRules` (afterDays / deductionType: Percentage|FlatAmount / deductionValue / description) is fully specified in the type but has **no editor and always saves empty.** Without it, the most important refund rule — "how much does the parent actually get back based on how long ago they paid" — cannot even be expressed. Build the tier builder in the policy drawer, and apply it in the refund calculation (Change 3) and the simulation.

**Change 3 — Make the Refund Simulation actually compute, and apply the same engine at runtime.**
Today the simulation literally echoes the input amount (`calculatedRefund = inputAmount`). Replace it with a real engine: `netRefund = min(gross, maxCapAmount, gross × maxCap%)` then `− tierDeduction(afterDays)` then floor at 0. Use the **same** engine in the live refund form's preview so admins and cashiers see identical math.

**Change 4 — Add maximum-refund caps to the editor and enforce them.**
`maxRefundPercentage` and `maxRefundAmount` have no editor and no enforcement. Add the inputs and apply them as a ceiling in the engine from Change 3, both per-line and per-request.

### 🟠 High (the cross-module promises are unfulfilled)

**Change 5 — Wire the concession paid-fee-disposal = Refund into this module.**
When a concession on paid fees is approved with disposal = Refund, the approval should auto-raise a refund request that then flows through the Refund Policy (deductions, caps, bank details). This closes the loop promised by the concession UI's "Refund Policy must be configured" warning. Send `paidFeeAdjustment` in the approve-concession payload and have it spawn a refund. *(Mirror of `concession-policy-product-flow.md §9` Change 5.)*

**Change 6 — Give refunds real visibility in Fee Collection.**
Replace the "?" info badge with a proper **REFUND column** (and a total), consistent with the existing CONCESSION and RECONCILIATION columns. Decide and document the arithmetic relationship: does a processed refund reduce the collectable, or is it purely informational? Today it is informational-only with no totals, which hides material money movements from the cashier.

**Change 7 — Model and enforce late-fee clawback on refund.**
Add a `lateFeeBehaviour` / `lateFeeClawback` field to the Refund Policy (mirroring the Concession Policy's `lateFeeBehaviour`): options like "Claw back late fee", "Keep late fee", "Exclude late-fee heads entirely." Enforce it when a refund touches a head that had a late fee booked as income. *(Closes `collection-policy-flow.md §7.5` from the refund side.)*

**Change 8 — Snapshot the policy version onto each refund request.**
Add a `refundPolicyVersionId` (or snapshot) to the refund request at creation time, so editing the policy later doesn't rewrite history. Reuse the existing generic policy-version infrastructure — it already works for refund as an audit viewer; extend it to a creation-time freeze.

**Change 9 — Bring the approve / reject / process workflow into the live refund UI.**
Today the status-transition endpoints exist but the operational screen lives only in legacy code. Build approve/reject/process into the live "New Refund Form" flow (Pending → UnderReview → Approved/Rejected/Cancelled) so the whole lifecycle is in one place.

### 🟡 Medium (over-promised features and hygiene)

**Change 10 — Decide charge refund: build it or remove the flag.**
`enableRefundForCharge` promises charge refunds that don't exist. Either (a) add a charge surface to the eligibility endpoint, the create-refund payload, and a `refundAmount` field to charges, and build the (currently dead) charge-refund UI; or (b) remove the flag and its summary chip to stop over-promising.

**Change 11 — Build the withdrawal/transfer auto-trigger.**
Wire `refundOnWithdrawal` / `refundOnTransfer` into the student lifecycle so withdrawal/transfer pre-raises a refund workflow (optionally pre-filled with pro-rated refundable amounts).

**Change 12 — Track the refund SLA.**
Use `refundDueWithin` to set a due-date on approval and surface an "overdue refunds" view/dashboard. Today the SLA is saved and forgotten.

**Change 13 — Wire `considerAsExpense` into accounting.**
When the accounting/GL integration lands, route refund payouts to the expense ledger when this flag is true, rather than netting fee income.

**Change 14 — Consolidate the status lifecycle.**
Either expose Draft/Published/Inactive in the UI or narrow the type to Active/Archived. Stop defaulting to Draft then force-flipping to Active on Submit.

**Change 15 — Delete or deprecate the dead code.**
Remove the abandoned refund rewrite folder, the unreachable charge-refund / terms-to-refund components, and consolidate the legacy `Components/` approve-process flow into the live UI (per Change 9). This removes the maintenance hazard of accidentally wiring a no-op path.

### 🟢 Low (polish & completeness)

**Change 16 — Add editors for the remaining declared-but-uneditable fields:** `governmentComplianceCode`, `cancellationNoticeDays`, `effectiveFrom`/`effectiveTo`. Either surface them or remove them from the type.

**Change 17 — Resolve the legacy list columns.** `refundMethod`, `processingDays`, `allowPartialRefund` show as columns with phantom defaults. Either build their editors or drop the columns.

**Change 18 — Compute `isUsedInDownstream` properly or document it as backend-supplied.** The delete guard trusts a backend flag for "is this policy attached anywhere"; make that contract explicit.

### Priority summary

| # | Change | Severity | Unlocks / unblocks |
|---|---|---|---|
| 1 | Refund form reads & obeys attached policy | 🔴 Critical | Heads scope, full/partial, bank-required, sends policy id |
| 2 | Build deduction-tier editor | 🔴 Critical | The core "how much comes back" rule |
| 3 | Real refund calculation engine (sim + runtime) | 🔴 Critical | Deductions + caps everywhere |
| 4 | Max-refund caps editor + enforcement | 🔴 Critical | Ceiling on payouts |
| 5 | Concession disposal=Refund → auto refund | 🟠 High | Closes concession loop |
| 6 | REFUND column + totals in collection | 🟠 High | Visibility of money returned |
| 7 | Late-fee clawback field + logic | 🟠 High | Closes late-fee edge case |
| 8 | Policy version snapshot on requests | 🟠 High | History integrity |
| 9 | Approve/reject/process in live UI | 🟠 High | One operational lifecycle |
| 10 | Charge refund: build or remove | 🟡 Medium | Stops over-promising |
| 11 | Withdrawal/transfer auto-trigger | 🟡 Medium | Lifecycle automation |
| 12 | SLA tracking / overdue dashboard | 🟡 Medium | Operational control |
| 13 | `considerAsExpense` → accounting | 🟡 Medium | Correct GL treatment |
| 14 | Consolidate status lifecycle | 🟡 Medium | Type/UI honesty |
| 15 | Delete/deprecate dead code | 🟡 Medium | Maintenance safety |
| 16–18 | Remaining field editors & column hygiene | 🟢 Low | Completeness |

> **If only four things ship, ship Changes 1–4.** Together they turn the Refund Policy from a saved-but-ignored template into the actual governor of every refund — and they make the deduction tiers, caps, and simulation that admins *think* they're configuring finally take effect.

---

## 10. Glossary

- **Refund Policy** — the design-time rule template (refundable heads, full/partial, deduction tiers, caps, bank-required, SLA, withdrawal/transfer, expense flag). Lives in Policies & Rules. Editor-only today.
- **Refund Request / Voucher** — the operational refund: a staff member refunds a student's paid due-fee lines, via method + reason, through approval.
- **Due-fee line** — a single month/installment of a single fee head on the student's ledger; the atomic unit a refund is raised against (`{ dueFeeId, amount }`).
- **Refund eligibility** — the per-head/per-month breakdown of `total / paid / refunded-so-far / refundable` that the refund form queries before letting staff enter amounts.
- **Deduction tier** — a time-based rule: "after N days, deduct X% (or ₹X)." Reduces the amount returned to the parent. *Has no editor today.*
- **Paid-fee disposal** — what happens to excess already-paid money when a concession touches paid fees (Refund / Credit note / Wallet / Future adjust / Manual). The `Refund` option is meant to hand off to this module.
- **Late-fee clawback** — reversing a late fee that was booked as income when the underlying collection is refunded. *Unmodelled on the refund side.*
- **`refundPolicyId`** — the attach-point on a class-wise fee structure. Correctly saved today; never read back by the refund form (the root cause of most gaps).
- **SLA (`refundDueWithin`)** — the number of days within which an approved refund must be paid. Saved today; not tracked.
- **Reconciliation amount** — the Adjustment module's ledger field; coexists with `refundAmount` on the same line but with no coexistence logic.

---

*End of document.*
