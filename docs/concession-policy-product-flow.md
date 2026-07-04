# Concession Policy — Product-Level Flow & Submodule Integration

> **Audience:** Product managers, business analysts, finance-domain leads, and engineers who need the *intent* before the code.
>
> **What this document is:** A product-level, business-language explanation of how the **Concession Policy** is *meant* to connect with every finance submodule — Fee Collection, Late Fee, Refund, Charges, Adjustment, and the Concession request/approval workflow — including the end-to-end flow, field-by-field behaviour, scenarios, edge cases, and the **changes required** to make the policy actually drive behaviour everywhere.
>
> **What this document is NOT:** It deliberately avoids file paths, type names, and line numbers. For that engineering-level detail, read the companion doc [`concession-policy-flow.md`](./concession-policy-flow.md).
>
> **Companion docs:** [`concession-policy-flow.md`](./concession-policy-flow.md) (code-level), [`collection-policy-flow.md`](./collection-policy-flow.md) (the Late-Fee policy).
>
> **Last Updated:** 2026-07-02

---

## Table of Contents

1. [Executive Summary — The One Big Thing to Know](#1-executive-summary--the-one-big-thing-to-know)
2. [Three Things Called "Concession" — Don't Mix Them Up](#2-three-things-called-concession--dont-mix-them-up)
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

The **Concession Policy** is designed to be the *rulebook* that governs how a fee discount is calculated, where it applies, how it interacts with late fees, what happens to money already paid, and how receipts are handled.

**The single most important fact in this whole document:**

> Today the Concession Policy is a **design-time template only**. The policy editor lets an admin configure a rich set of rules, but **none of those rules flow into the actual concession request, the approval, or the fee-collection process.** The request form does not read the policy; the approval does not send the policy's behavioural fields; and the collection screen only sees the *final reduced number* that the backend wrote to the ledger.

In other words: **the policy currently decides nothing at runtime.** Every behavioural field on it — *how to calculate, which fee heads, paid vs pending, what to do with excess paid money, late-fee override, receipt treatment* — is **inert** until it is wired in.

This document describes both:
- **How it is *supposed* to work** (the intended product design), and
- **What must change** to get there (Section 9).

Everything else — the flow, the field behaviour, the edge cases — is written from the *intended* product perspective, with the current reality called out wherever the two diverge.

---

## 2. Three Things Called "Concession" — Don't Mix Them Up

The product uses the word "concession" for **three separate things**. Confusing them is the root cause of most misunderstandings.

| Concept | In plain language | Who sets it | Who uses it at runtime |
|---|---|---|---|
| **Concession Type** | A *named category* of discount. E.g. "Sibling Discount", "Staff Ward", "Merit Scholarship". Each category says what documents are required and whether it's active. | Admin, in the master list | The **request form** picks from this list. |
| **Concession Policy** | The *rulebook*: **how** a concession is calculated and applied — method, base, rounding, which fee heads, paid vs pending handling, late-fee override, receipt treatment. | Admin, in the policy editor | **Nothing today.** (Intended: the backend should honour it when applying an approved concession.) |
| **Concession Request** | The actual lifecycle: a staff member raises a request → documents are uploaded → an approver approves/rejects → the discount lands on the student's ledger. | Staff (raise) + Approver (approve) | The whole runtime flow. |

**Analogy:**
- The **Type** is the *menu item* ("Sibling Discount").
- The **Policy** is the *house rules* ("sibling discounts are 10%, apply only to tuition, never wipe late fees").
- The **Request** is the *order* a customer places, which is supposed to follow the house rules.

> 🚩 **The gap in one line:** The "order" (Request) is taken without ever consulting the "house rules" (Policy). The kitchen (backend) is *expected* to follow the rules, but the order slip it receives contains no reference to them.

---

## 3. Current State vs Intended State

A side-by-side framing of where we are versus where the product should be.

| Aspect | 🟡 Current Reality | 🟢 Intended Product State |
|---|---|---|
| **Is the policy attached to anything?** | No. There is no link from a fee structure (or anything else) to a concession policy. | The policy should be attached at a defined point so the system knows *which* policy governs *which* concession. |
| **Does the request form follow the policy?** | No. Staff enter any amount/percentage per fee head freely; the policy's method, base, minimum, and scope are ignored. | The form should load the governing policy and constrain/enforce its rules. |
| **Does the approval send the policy's decisions?** | No. The approval only sends the per-fee-head amounts to apply. | The approval should carry the resolved policy decisions so the backend acts deterministically. |
| **Does the collection screen react to concession?** | Partially. It *displays* the concession already applied (read-only), but does not recompute, reverse, or interact with late fees. | It should reflect the policy's late-fee override, receipt behaviour, and paid-fee disposal. |
| **Does concession interact with late fees?** | Undefined. The late-fee policy and the concession policy both exist but don't talk to each other in the UI. | The concession policy's late-fee override should have the final say on concessioned fee heads. |
| **Does concession trigger refunds?** | Not driven by policy. | When a concession touches already-paid fees, the policy's "paid-fee disposal" setting should decide refund vs wallet vs carry-forward. |
| **Does concession apply to charges (exam/lab fees)?** | No — concession is fee-heads only. | Stays fee-heads only (a deliberate boundary); charges are discounted via other means. |

The rest of this document describes the **intended** behaviour, and Section 9 lists the concrete changes to close each gap.

---

## 4. The Submodule Connection Map

This is the heart of the document. Below is how the Concession Policy is *meant* to connect with each finance submodule. (Read top-to-bottom; arrows show the intended flow of influence.)

```
                       ┌──────────────────────────────┐
                       │      CONCESSION POLICY        │
                       │  (the rulebook)               │
                       │  • calculation method & base  │
                       │  • which fee heads            │
                       │  • paid vs pending handling   │
                       │  • late-fee override          │
                       │  • receipt treatment          │
                       └───────────────┬──────────────┘
                                       │ governs
                  ┌────────────────────┼────────────────────┐
                  ▼                    ▼                    ▼
          ┌──────────────┐    ┌────────────────┐   ┌──────────────────┐
          │ Concession   │    │ Concession     │   │ Fee Collection   │
          │ Type (menu)  │    │ Request/Approve│   │ Ledger (ledger   │
          │              │    │ (the lifecycle)│   │  line shows       │
          └──────┬───────┘    └───────┬────────┘   │  concessionAmount)│
                 │                    │            └────────┬─────────┘
                 │                    │                     │
                 └──────► chosen in ──┘                     │
                                      │                     │
                          writes discount onto ledger ──────┘
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            ▼                         ▼                         ▼
   ┌─────────────────┐      ┌──────────────────┐     ┌──────────────────┐
   │ LATE-FEE POLICY │      │     REFUND       │     │   ADJUSTMENT     │
   │ (Collection     │      │   (money back    │     │  (manual ledger  │
   │  Policy)        │      │    to parent)    │     │   edits)         │
   │                 │      │                  │     │                  │
   │ Concession's    │      │ Triggered when   │     │ Coexists on same │
   │ lateFeeOverride │      │ concession hits  │     │ ledger line;     │
   │ wins on overlap │      │ already-paid fee │     │ independent      │
   └─────────────────┘      └──────────────────┘     └──────────────────┘

   ┌─────────────────┐
   │    CHARGES      │  Out of scope: concession applies to fee heads only,
   │ (exam/lab/etc.) │  never to charges. Charges are discounted elsewhere.
   └─────────────────┘
```

**The five intended touch-points** (detailed in Section 5):

1. **Concession Type** — the policy *governs* what's allowed for a category (intended, not wired).
2. **Concession Request & Approval** — the policy *constrains* what staff can request and what approvers confirm (intended, not wired).
3. **Fee Collection ledger** — the final `concessionAmount` shows up here (works, read-only).
4. **Late-Fee Policy** — the concession policy's late-fee *override* resolves conflicts (intended, not wired).
5. **Refund** — concession on paid fees can *trigger* a refund/wallet/carry-forward (intended, not wired).

**Two boundaries (by design):**
- **Charges** — concession never touches charges.
- **Adjustment** — concession and adjustment coexist on the same ledger line as separate fields; they don't consume each other.

---

## 5. Connection Detail — Submodule by Submodule

### 5.1 ➡️ Concession Type (the menu)

**Intended relationship:** Each Concession Type (e.g. "Sibling Discount") should be linked to a Concession Policy, so that when a staff member picks a category, the system knows *which rulebook* applies.

**What should happen:**
- Picking a type automatically loads its governing policy's constraints into the request form.
- If the type requires specific documents, the form enforces that (this part **already works** — it's driven by the Type's document config).

**Current state:** 🟡 The request form reads the Type's *documents* but **not** any policy. The link between a Type and a Policy does not exist in the running system.

---

### 5.2 ➡️ Concession Request & Approval (the lifecycle)

**Intended relationship:** This is where the policy should have the most influence — it should shape both what is *requested* and what is *confirmed at approval*.

**At request time, the policy should:**
- Lock or default the **calculation method** (percentage / fixed / full-waiver / manual).
- Enforce the **fee-head scope** (only allow heads the policy whitelists).
- Enforce the **apply-on** rule (pending-only vs paid-and-pending, etc.).
- Apply the **minimum concession** floor (and, ideally, a maximum cap — see Section 8).
- Compute the concession on the correct **base** (gross vs outstanding).

**At approval time, the policy should:**
- Send the resolved **paid-fee disposal** (refund / wallet / carry-forward) so the backend knows what to do with any excess already-paid money.
- Send the **late-fee override** so the backend knows whether to wipe, keep, or recompute late fees on the concessioned heads.
- Send the **receipt behaviour** so the backend knows whether to reverse the original receipt, issue an adjustment receipt, or leave it alone.

**Current state:** 🟡 The request form ignores the policy entirely (staff enter amounts freely). The approval sends **only** the per-fee-head amounts — none of the behavioural decisions are transmitted. The backend is left to guess or apply defaults.

---

### 5.3 ➡️ Fee Collection Ledger (the destination)

**Intended relationship:** This is where every other submodule finally *sees* concession — as a single number per ledger line, already net of concession.

**What happens here:**
- When the cashier opens the collect screen, each fee line shows: **Total · Paid · Concession · Pending**.
- The cashier collects the **reduced** amount (pending is already net of concession).
- A concession is a **server-owned** fact by the time it reaches collection: the collect screen **reads** it but never recomputes or reverses it from here.

**Current state:** 🟢 This part **works** — the concession column is displayed and the pending amount is correct, provided the backend wrote the right `concessionAmount` in the first place. The collection screen's only blind spot is that it doesn't reflect the late-fee override or receipt behaviour (it can't — those decisions never reach it).

---

### 5.4 ➡️ Late-Fee Policy (the override)

**Intended relationship:** This is the **tightest coupling** in the whole system. The Late-Fee Policy computes penalties on overdue fee heads; when a concession lands on those same heads, the Concession Policy's **late-fee override** is meant to have the **final say**.

**The three override options:**

| Override | Effect on an already-charged late fee |
|---|---|
| **Remove late fee** | The late fee is wiped entirely on the concessioned heads. |
| **Keep existing** | The late fee is still owed. (Typical default.) |
| **Recalculate** | The late fee is recomputed on the reduced outstanding. |

**The interaction is two-way and depends on the Late-Fee Policy's calculation base:**
- If late fee is computed on **outstanding / remaining balance**, a concession that reduces the outstanding will naturally shrink the late fee.
- If late fee is computed on the **original fee**, the concession does not change it — only the override can.

**Decision rule (intended):**
1. Compute the late fee per the Late-Fee Policy.
2. If a concession applies to that fee head, apply the Concession Policy's override.
3. The override wins.

**Current state:** 🔴 Not wired. The override lives only in the policy object; the collection/late-fee process never consults it. Resolving concession-vs-late-fee conflicts is entirely a backend responsibility today, and unverified end-to-end.

---

### 5.5 ➡️ Refund (money back to parent)

**Intended relationship:** A concession that touches **already-paid** fees creates "excess paid money." The Concession Policy's **paid-fee disposal** setting decides where that money goes — and one of the options is a genuine refund, which then falls under the **Refund Policy's** rules.

**The paid-fee disposal options:**

| Option | What happens to the excess already-paid money |
|---|---|
| **Refund** | Money returned to the parent → flows into the **Refund** module (bank details needed; deductions governed by the Refund Policy). |
| **Credit note** | Held as internal accounting credit; no money out. |
| **Student wallet** | Parked in the student's wallet for future fees; no money out. |
| **Future-fee adjustment** | Carried forward to reduce future demand. |
| **Manual decision** | Handled case-by-case by staff. |

**The chain (intended):**
```
Concession on a PAID fee head
        ↓
Policy says "paid-fee disposal = Refund"
        ↓
Refund module processes it (Refund Policy governs deductions, max %)
        ↓
+ receipt behaviour decides accounting: reverse original receipt OR issue adjustment receipt
        ↓
+ late-fee override decides whether any late fee (booked as income) is clawed back
```

**Key boundary:** A refund triggered here is governed by the **Refund Policy** (its deduction rules and maximum-percentage cap), **not** by the concession policy. The concession policy only *initiates* the refund intent.

**Current state:** 🔴 Not wired. The paid-fee disposal decision is never sent in the approval, so the backend cannot know whether to refund, wallet, or carry forward. This is the canonical "everything-coupled" scenario and the riskiest gap (see scenario 8.7).

---

### 5.6 ➡️ Charges (exam/lab/bus fees)

**Relationship: Out of scope by design.**

- Concession applies to **fee heads only** — never to charges.
- Charges appear in the collect screen as a separate list and produce a separate receipt.
- If a school wants to discount an exam or lab charge, the concession policy **cannot** do it. It must be modelled as a charge waiver, a negative charge, or a separate mechanism.

This is a deliberate product boundary, not a gap. (Listed for completeness and to prevent future confusion.)

---

### 5.7 ➡️ Adjustment (manual ledger edits)

**Relationship: Coexist, don't consume.**

- Both concession and adjustment modify the **same ledger line**, but via **separate fields** that coexist independently.
- Concession writes to the *concession* field; adjustment writes to the *reconciliation* field. Both can be non-zero on the same line.
- The effective collectable is `total − paid − concession − adjustment` (derived by the backend; the UI does not compute this combination explicitly).

**Ordering problem (intended resolution needed):**
- If a **percentage** concession was computed on the *outstanding*, and an *adjustment* later changes that outstanding, the concession should ideally be re-derived. Today neither side re-derives, which can create small audit discrepancies.
- **Direction:** Adjustment → modifies the ledger → may affect any *future* late-fee recalculation, but does not touch the already-written concession.

**Current state:** 🟡 The two coexist correctly as separate fields. The interaction/re-derivation between them is undefined.

---

## 6. End-to-End Business Flow (Happy Path)

This is the **intended** end-to-end journey, in plain language. (Steps marked 🟡 are where today's reality diverges.)

```
1.  Admin configures the CONCESSION POLICY (the rulebook)
    └─ calculation method, base, fee-head scope, paid/pending handling,
       late-fee override, receipt treatment.

2.  Admin creates CONCESSION TYPES (the menu)                🟡 not linked to policy yet
    └─ e.g. "Sibling 10%", "Staff Ward", each with required documents.

3.  The policy is ATTACHED somewhere so the system knows it governs.   🟡 no attachment today
    └─ (Section 9 proposes where: fee structure, or per-type.)

4.  Staff opens the REQUEST form for a student
    └─ selects the student (board → medium → class → division → student)
    └─ the student's fee heads load
    └─ picks a Concession TYPE                                          🟢 works
    └─ the form LOADS THE GOVERNING POLICY and applies its constraints. 🟡 not done today
       (Today: staff enter any amount/percentage per head freely.)

5.  Staff enters the concession value per fee head
    └─ the policy's method/base/minimum should shape this.              🟡 not enforced
    └─ guard: discount cannot exceed the fee head's amount.            🟢 enforced
    └─ guard: total discount cannot exceed total fees.                 🟢 enforced

6.  Staff submits the request + uploads required documents.             🟢 works

7.  Approver reviews the request
    └─ approval is blocked until all required documents are uploaded.  🟢 works

8.  Fee-head approval view
    └─ approver selects which months/lines receive the concession.
    └─ the approved amount is split across selected lines exactly
       (integer split — the sum is always exact).                      🟢 works
    └─ guard: a single line's concession cannot exceed its payable.    🟢 works

9.  Approver approves
    └─ TODAY: only per-fee-head amounts are sent.                      🟡
    └─ INTENDED: the approval ALSO carries the policy decisions
       (paid-fee disposal, late-fee override, receipt behaviour).      🟡 not sent today

10. Backend applies the concession to the ledger
    └─ writes the concession amount onto each selected ledger line.    🟢 works
    └─ INTENDED: honours the policy's behavioural decisions.           🟡 unverified

11. Next time the cashier opens FEE COLLECTION
    └─ each fee line shows Total · Paid · Concession · Pending.        🟢 works
    └─ cashier collects the reduced (net) amount.                      🟢 works

12. (If the concession touched PAID fees)                              🟡 not driven by policy
    └─ INTENDED: the policy's paid-fee disposal triggers a refund /
       wallet / carry-forward, governed by the Refund Policy.
    └─ INTENDED: receipt behaviour reverses or adjusts the receipt;
       late-fee override claws back any late fee booked as income.

13. (Optional) Reject or Cancel
    └─ Reject requires a reason; Cancel only works on already-approved. 🟢 works
```

---

## 7. How Each Field Works & Where It Must Apply

This section is the field-by-field product reference. For each field: what it means in plain language, what it's supposed to control, and which submodule/step it must influence.

### 7.1 General / identity fields

| Field | What it is | What it should control | Where it kicks in |
|---|---|---|---|
| **Policy name** | Human-readable label. | Display only. | Lists, dropdowns. |
| **Policy code** | Short unique code (auto-generated if blank). | Identification / reporting. | Backend, exports. |
| **Status** (Active / Archived) | Whether the policy is usable. | Only Active policies should be selectable for new concessions. Archived ones keep governing already-attached concessions (versioning). | Every selection point. |
| **Academic year** | Scopes the policy to a year. | A policy should only govern concessions in its academic year. | Request form, selection. |
| **Effective from / to** | Validity window. | The policy should only be active within its window; outside it, fall back to a default. | Selection logic. |
| **Is default** | Pre-selected on new requests. | When a student/concession has no explicit policy, the default is used. | Request form defaulting. |
| **Concession type** *(link)* | Which Concession Type this policy governs. | Picking that type should load this policy. | Request form (currently **not wired**). |

### 7.2 Calculation fields

| Field | What it is | What it should control | Where it kicks in |
|---|---|---|---|
| **Calculation method** (Percentage / Fixed / Full waiver / Manual) | The formula used to derive the concession. | Should drive how the request form computes the discount (or default the backend when a request is Manual). | Request form + backend apply step. (Currently **ignored** by the request form.) |
| **Percentage value** | The % applied to the base. | The discount amount when method = Percentage. | Calculation. |
| **Fixed amount** | Flat rupee amount. | The discount amount when method = Fixed. | Calculation. |
| **Calculation base** (Original fee / Outstanding / Fee-head amount) | What the percentage is taken of. | Determines the discount size for percentage-based concessions, and **couples** to late fee (if late fee uses outstanding, the concession shrinks it). | Calculation + late-fee interaction. |
| **Rounding** (None / Up / Down / Nearest) | Final rounding of the computed concession. | The exact rupee amount written to the ledger; backend must mirror the frontend or the preview won't match reality. | Backend apply step. |
| **Minimum concession** | A floor — if the computed concession is below this, bump it up. | Prevents trivially small concessions. (⚠️ There is **no maximum cap** today — see Section 8.) | Calculation. |

### 7.3 Applicable fee-head fields

| Field | What it is | What it should control | Where it kicks in |
|---|---|---|---|
| **Fee-head scope** (Entire structure / Selected heads) | Whether the concession can touch any head or only a whitelist. | Limits which heads the request form even offers for concession. | Request form (currently **not enforced**). |
| **Applicable fee heads** | The whitelist (required when scope = Selected). | The selectable heads in the request form. | Request form. |

### 7.4 Application-behaviour fields

| Field | What it is | What it should control | Where it kicks in |
|---|---|---|---|
| **Apply on** (Pending only / Paid only / Paid + pending / Future only / Current only / Entire) | Which part of the demand the concession touches. | **The gateway to the Refund path** — only when paid fees are included can a refund be triggered. Also gates which dependent fields are visible. | Request form + approval + ledger. |
| **Paid-fee disposal** (Refund / Credit note / Wallet / Future adjust / Manual) | What to do with excess already-paid money. | **Directly drives the Refund module** (when = Refund). Currently **never sent in approval.** | Approval → backend → Refund module. |
| **Pending-fee handling** (Reduce outstanding / Recalculate installments / Future only) | What to do with the pending portion. | "Reduce outstanding" directly lowers the pending on the ledger line; "Recalculate" re-spreads future demand. Currently **never sent in approval.** | Approval → backend → ledger. |
| **Future-installment strategy** (Equal / Remaining / Current) | How to spread the concession across future installments. | Affects how future ledger lines are generated. Currently **not wired.** | Backend ledger generation. |

### 7.5 Demand-behaviour fields

| Field | What it is | What it should control | Where it kicks in |
|---|---|---|---|
| **Existing demand** (Auto-recalc / Future-only / Manual / Keep) | Whether/how previously-generated demand is recalculated. | "Keep existing" means old dues are untouched and the concession applies forward only. | Backend ledger generation. |
| **Receipt behaviour** (Keep original / Adjustment receipt / Reverse original) | Accounting treatment when paid fees are concessioned. | "Reverse original" ties into refund/reversal and **must claw back late fee** if the Late-Fee Policy booked it as income. | Approval → backend → accounting. |
| **Late-fee override** (Recalculate / Keep / Remove) | **Override** on the Late-Fee Policy. | **The most tightly-coupled field to late fees** — directly governs the late-fee outcome on concessioned heads. Currently **the least wired.** | Late-fee resolution at apply time. |
| **Demand status** (Update immediately / After approval) | When the ledger reflects the concession. | Gates whether the concession is visible in the collect screen *before* approval. | Ledger timing. |

---

## 8. Scenarios & Edge Cases

Each scenario is stated as a business situation, then the intended behaviour, then the current reality.

### 8.1 Concession bigger than a single fee head
- **Situation:** Tuition head is ₹5,000; staff enters a ₹6,000 discount on it.
- **Intended & current:** The entry is hard-capped at the head's amount (₹5,000). ✅ Works.
- **Edge:** If the head's amount changes server-side after the form loaded, a stale cap could briefly allow over-entry. Backend must re-validate.

### 8.2 Total concession exceeds total fees
- **Situation:** Combined discount across heads is more than the student's total fees.
- **Intended & current:** Submission is blocked; the button is disabled. ✅ Works.
- **Edge:** If total fees are zero (no fee structure yet), the guard is skipped — a request could be created against a student with no fees. Low risk, unguarded.

### 8.3 No fee structure assigned
- **Situation:** Student has no fee structure.
- **Intended & current:** The form shows a warning and disables the fee-head section. ✅ Correct — concession needs a demand to reduce.

### 8.4 Approved concession split across months (remainder skew)
- **Situation:** ₹20,000 concession on a head across 6 monthly lines.
- **Intended & current:** Split is exact: two months get ₹3,334, four get ₹3,333. ✅ Sum is always exact.
- **Edge:** Which months get the extra ₹1 depends on the order of the selected lines. Not a correctness bug, but can surprise auditors. Consider making the split follow calendar order.

### 8.5 Split exceeds a line's payable
- **Situation:** A month has ₹2,000 payable but the even split assigns ₹3,333 to it.
- **Intended & current:** Approval is blocked with a per-line message. ✅ Works.
- **Edge:** If several lines are over-cap, only the first failing one is reported; the approver must adjust manually. No auto-trimming.

### 8.6 Concession on a fully-paid line
- **Situation:** A month is fully paid (payable = 0).
- **Intended & current:** The line is marked unselectable and greyed out. ✅ Correct (unless paid-fee disposal is in play, which the current UI doesn't model).

### 8.7 ⚠️ Retrospective concession on a paid + overdue + late-fee head (the riskiest case)
- **Situation:** April tuition is paid, was overdue, ₹500 late fee charged and booked as income. Admin grants 100% concession on tuition, with paid-fee disposal = Refund, late-fee override = Remove, receipt behaviour = Reverse original.
- **Intended chain:** refund of the paid portion (Refund module), reversal of the original receipt, **removal of the ₹500 late fee** (and clawback of the income booking).
- **Current reality:** 🔴 None of those three decisions is sent in the approval. The frontend cannot drive this; it is entirely a backend responsibility and **unverified end-to-end**. This is the canonical "everything-coupled" scenario.

### 8.8 Concession + adjustment on the same line
- **Situation:** A line has ₹1,000 concession and ₹500 negative adjustment.
- **Intended & current:** Both coexist as separate fields; the payable is net of both. ✅ Coexistence works.
- **Edge:** If a *percentage* concession was computed on outstanding and an adjustment later changes that outstanding, the concession is **not** recomputed client-side. Potential audit discrepancy if the backend doesn't re-derive either.

### 8.9 Policy edited after concessions are granted (versioning)
- **Situation:** The late-fee override is changed from "Keep" to "Remove" after some concessions are already approved.
- **Intended:** Already-approved concessions keep their ledger amount; a snapshot of the *policy version at approval time* prevents retroactive conflicts.
- **Current reality:** 🟡 No policy-version snapshot is captured for concessions. Retroactive re-derivation could conflict with the edited policy. Needs backend confirmation. (The Late-Fee Policy has versioning; concession does not.)

### 8.10 Policy archived
- **Situation:** An admin archives a concession policy.
- **Current:** Because the policy is not attached to anything, archiving has **no runtime effect** today. (Contrast with the Late-Fee Policy, where archiving can strand a reference.)

### 8.11 "Manual" calculation method
- **Situation:** Method = Manual (no percentage or fixed amount).
- **Intended & current:** No value entry is needed; the amount is set per request at runtime. ✅ This actually matches today's runtime reality (the form sets amounts per head regardless), so Manual is the policy value most consistent with current behaviour.

### 8.12 "Full waiver" on a partially-paid head
- **Situation:** Method = Full waiver; the head is 40% paid.
- **Intended:** The concession covers the entire original fee (paid + unpaid), which implies a refund of the paid portion — only sensible if paid-fee disposal handles it.
- **Current:** 🟡 The simulator computes the refund portion, but this is design-time only; nothing drives it at runtime.

### 8.13 Multiple concessions / stacking
- **Situation:** A student applies for both "Sibling" and "Merit" concessions on the same head.
- **Intended:** Whether they stack is a backend decision; combined concessions must be capped at 100% of the head.
- **Current:** 🟡 Each request is independent; the per-request guard doesn't know about other concessions. Backend must cap the combination.

### 8.14 Tiny concession split across many lines
- **Situation:** ₹10 concession across 25 monthly lines.
- **Intended & current:** First 10 lines get ₹1, the rest ₹0. ✅ Sum is exact.
- **Edge:** 15 lines "consume" the selection but have zero effect. Consider hiding auto-selecting zero-effect lines to avoid confusing the approver.

### 8.15 Competing status values
- **Situation:** The product carries three different concession-status vocabularies (UI statuses, request statuses, and a "under review" variant).
- **Risk:** Implicit mapping between them is a source of off-by-one bugs. Should be consolidated to one vocabulary.

### 8.16 Approve before documents uploaded
- **Situation:** An approver tries to approve before required documents are uploaded.
- **Intended & current:** Approval is blocked until all documents are uploaded. ✅ Works — driven by the Concession **Type's** document config (not the policy).

---

## 9. What Must Change to Make the Policy Work Everywhere

This is the actionable heart of the document. It lists, in priority order, the product/engineering changes required for the Concession Policy to actually drive behaviour across all submodules. Each item states the **gap**, the **desired product behaviour**, and the **where it must land**.

### 🔴 Critical (without these, the policy decides nothing)

**Change 1 — Decide and build the attachment point.**
- **Gap:** The policy is attached to nothing; no link exists from anything to a concession policy.
- **Desired:** Pick one attachment model and implement it. Two viable options:
  - *(a)* **Attach to the Concession Type** (recommended for simplicity): each type links to one policy; picking the type loads the policy. This matches how the request form already works.
  - *(b)* **Attach to the Fee Structure** (like the other policies): a `concessionPolicyId` on the structure, parallel to the late-fee/refund/proration policies.
- **Lands in:** the master/structure config + the request form's data loading.

**Change 2 — Make the request form read and enforce the governing policy.**
- **Gap:** Staff can enter any amount/percentage per head; the policy's method, base, minimum, and fee-head scope are ignored.
- **Desired:** When a policy governs, the form should:
  - default/lock the **calculation method**,
  - restrict selectable heads to the **fee-head scope**,
  - enforce the **apply-on** rule (pending vs paid),
  - apply the **minimum** floor (and a new **maximum** cap — see Change 8).
- **Lands in:** the request form's value-entry step.

**Change 3 — Carry the policy's behavioural decisions through the approval into the ledger.**
- **Gap:** The approval sends only per-fee-head amounts — none of the decisions reach the backend.
- **Desired:** When the approval affects **paid** fees, send the resolved **paid-fee disposal**, **late-fee override**, and **receipt behaviour** (or the policy id + version) so the backend acts deterministically.
- **Lands in:** the approval payload + backend apply step.

### 🟠 High (closes the biggest risk scenarios)

**Change 4 — Wire the late-fee override into the collection/late-fee resolution.**
- **Gap:** The override (Remove / Keep / Recalculate) is never consulted; concession-vs-late-fee conflicts are unresolved.
- **Desired:** When a concession lands on a fee head that has a late fee, the override decides the outcome, and it wins over the Late-Fee Policy's default.
- **Lands in:** the late-fee calculation at apply time (cross-references the Late-Fee Policy — see `collection-policy-flow.md`).

**Change 5 — Wire the paid-fee disposal into the Refund module.**
- **Gap:** A concession on paid fees does not reliably trigger a refund/wallet/carry-forward.
- **Desired:** When disposal = Refund, the approval should initiate a refund that is then governed by the **Refund Policy** (deductions, max %). Wallet/credit-note/carry-forward paths must also be handled.
- **Lands in:** the approval → backend → Refund module. (Scenario 8.7.)

**Change 6 — Capture a policy-version snapshot at approval.**
- **Gap:** No versioning; editing the policy later can retroactively conflict with already-approved concessions.
- **Desired:** Snapshot the policy version (or its resolved values) onto each approved concession, so edits don't rewrite history. (Mirror what the Late-Fee Policy already does.)
- **Lands in:** the approval/ledger record.

### 🟡 Medium (correctness, safety, clarity)

**Change 7 — Make the collection screen reflect policy-driven outcomes.**
- **Gap:** The collect screen shows the concession amount but can't reflect the late-fee override or receipt behaviour (the decisions never reach it).
- **Desired:** Once Change 4 is in, the collect screen's late-fee display should respect the override; once Change 5 is in, any refund/wallet outcome should be visible.
- **Lands in:** the fee-collection ledger display.

**Change 8 — Add a maximum-concession cap.**
- **Gap:** Only a **minimum** floor exists; no maximum. A 100% concession could wipe a head the admin didn't intend.
- **Desired:** Add an optional maximum (% and/or rupee amount), enforced at request and approval time.

**Change 9 — Reconcile concession ↔ adjustment interaction.**
- **Gap:** A percentage concession computed on outstanding isn't re-derived when an adjustment later changes that outstanding.
- **Desired:** Define and enforce an ordering/recalculation rule between concession and adjustment on the same line.

**Change 10 — Consolidate the three status vocabularies.**
- **Gap:** Three competing concession-status enums cause mapping/off-by-one bugs.
- **Desired:** Collapse to one canonical status vocabulary used everywhere.

**Change 11 — Define the "Manual" baseline clearly.**
- **Gap:** The policy's method is ignored at runtime; the form is effectively always "Manual."
- **Desired:** Either wire the method (Change 2) or explicitly document that the runtime is Manual-only and remove the non-Manual UI affordances from the policy editor to avoid implying capability that doesn't exist.

### 🟢 Low (housekeeping)

**Change 12 — Remove or surface dead policy fields.** The approval-workflow fields (require approval, approval levels, stacking, eligibility, document requirements) exist on the policy type but have no UI and no runtime effect. Either build them or remove them to avoid implying capability that isn't there.

**Change 13 — Make month-split deterministic.** Ensure the remainder-skew in the monthly split follows calendar order, not array order, so auditors aren't surprised.

**Change 14 — Clean up dormant/duplicate concession APIs.** Several concession API slices are stubs or duplicates; using the wrong one silently does nothing.

**Change 15 — Clarify the policy-status lifecycle.** Decide whether Draft/Published states are needed, or narrow the type to just Active/Archived.

---

### Priority summary

| Priority | Changes | Outcome |
|---|---|---|
| 🔴 Critical | 1, 2, 3 | The policy starts *governing* — it attaches, the form enforces it, and the backend receives its decisions. |
| 🟠 High | 4, 5, 6 | The riskiest coupled scenarios (concession + late fee + refund + receipt) work end-to-end. |
| 🟡 Medium | 7, 8, 9, 10, 11 | Correctness and safety caps; UI reflects reality; no silent drift. |
| 🟢 Low | 12–15 | Housekeeping; remove dead/confusing surface area. |

---

## 10. Glossary

- **Concession Policy** — the rulebook (method, base, scope, paid/pending handling, late-fee override, receipt treatment).
- **Concession Type** — a named category of discount (e.g. "Sibling Discount"), with required documents.
- **Concession Request** — the lifecycle: raised by staff → documents uploaded → approved/rejected → applied to the ledger.
- **Fee head** — a line item of fees (e.g. Tuition, Bus, Library). Concession applies to fee heads only.
- **Charge** — a one-off levy (e.g. exam fee, lab fee). Concession does **not** apply to charges.
- **Ledger line** — a single month's record for a fee head on a student, showing total, paid, concession, adjustment, refund, and pending.
- **Late-Fee Policy** (a.k.a. Collection Policy) — computes penalties on overdue fee heads; the Concession Policy's override resolves conflicts on overlap.
- **Late-fee override** — the Concession Policy's setting (Remove / Keep / Recalculate) that wins over the Late-Fee Policy on concessioned heads.
- **Paid-fee disposal** — what happens to excess already-paid money when a concession touches paid fees (Refund / Credit note / Wallet / Future adjust / Manual).
- **Receipt behaviour** — accounting treatment when paid fees are concessioned (Keep / Adjustment receipt / Reverse original).
- **Adjustment** — a manual ledger edit; coexists with concession on the same line as a separate field.
- **Versioning snapshot** — capturing the policy version at the moment of approval, so later edits don't rewrite history.

---

*End of document. For engineering-level detail (types, files, line numbers, API contracts), see the companion doc [`concession-policy-flow.md`](./concession-policy-flow.md).*
