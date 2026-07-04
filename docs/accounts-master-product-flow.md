# Accounts & Finance End-to-End — Product-Level Flow & Submodule Integration

> **Audience:** Product Managers, Finance leads, BAs, Engineering leads
> **What this document is:** A product-level blueprint for turning the Finance **Accounts** sub-module into the financial hub that every money-in / money-out event flows through — fee collection, charges, refunds, concessions, proration, and **payroll** — with a lightweight ledger-heads model and automatic posting.
> **What this document is NOT:** An engineering spec. It deliberately avoids file paths, type names, and line numbers. It does not redefine the four finance policies (Collection / Concession / Proration / Refund) — those have their own docs. It focuses on **how those modules connect to a shared accounting backbone and how money moves automatically**.
> **Companion docs:**
> - [Collection Policy — End-to-End Flow](./collection-policy-flow.md)
> - [Concession Policy — Product-Level Flow](./concession-policy-product-flow.md)
> - [Concession Policy — End-to-End Flow](./concession-policy-flow.md)
> - [Refund Policy — Product-Level Flow](./refund-policy-flow.md)
> **Last Updated:** 2026-07-03

---

## Table of Contents

1. [Executive Summary — The One Big Thing to Know](#1-executive-summary--the-one-big-thing-to-know)
2. [The Words We Use — Don't Mix Them Up](#2-the-words-we-use--dont-mix-them-up)
3. [Current State vs Intended State](#3-current-state-vs-intended-state)
4. [The Master Connection Map](#4-the-master-connection-map)
5. [The Hybrid Ledger-Heads Model (the Backbone)](#5-the-hybrid-ledger-heads-model-the-backbone)
6. [Connection Detail — Module by Module](#6-connection-detail--module-by-module)
7. [End-to-End Business Flows (Happy Paths)](#7-end-to-end-business-flows-happy-paths)
8. [How the Forms Should Be](#8-how-the-forms-should-be)
9. [Automation Rules — What Happens Automatically](#9-automation-rules--what-happens-automatically)
10. [Scenarios & Edge Cases](#10-scenarios--edge-cases)
11. [What Must Change to Make This Real](#11-what-must-change-to-make-this-real)
12. [Glossary](#12-glossary)

*End of document.*

---

## 1. Executive Summary — The One Big Thing to Know

> **The Accounts module today is a set of disconnected registers, not a financial system.** Income and Expense Tracking are flat category-and-tag lists. Payroll produces payslips but posts **nothing** to finance. Fee collection, refunds, concessions, and proration each do their own job but **never talk to a shared ledger**. Nothing balances, nothing reconciles automatically, and there is no single place that shows "where did the school's money come from and go to".

**The one big change this document proposes:**

> Make **Accounts** the financial hub. Introduce a lightweight layer of **Account Heads** (Income / Expense / Bank-Cash / Liability). Every money event — a fee receipt, a payroll lock, a refund approval, a manual expense — **automatically posts between two heads**, so every head carries a running balance that reconciles to the bank. Payroll stops being a payslip printer and becomes the single biggest driver of expense and statutory liabilities.

This is the **hybrid ledger-heads model**: real enough to reconcile and to post payroll, light enough to build without a full double-entry general ledger.

```
   TODAY                                   INTENDED
   ┌───────────────────────────┐           ┌───────────────────────────────┐
   │ Fee Collection ──?──> ❓  │           │ Fee Collection ──► INCOME head │
   │ Payroll ──────────> payslip│          │ Payroll lock ──► EXPENSE head  │
   │ Refund ───────────> pays out│         │                + LIABILITY heads│
   │ Income Tracking ──> flat row│         │ Refund ──► EXPENSE + BANK out   │
   │ Expense Tracking ─> flat row│         │ Concession/Proration ─► ledger  │
   └───────────────────────────┘           │ Every head = running balance    │
        nothing connects                   │ BANK head = reconciles to bank  │
                                           └───────────────────────────────┘
```

**If only a few things ship, ship these four (the rest follow):**
1. **Account Heads master + posting engine** — the backbone everything else plugs into.
2. **Fee Collection → Income auto-posting** — money-in becomes real income with a balance.
3. **Payroll → Expense + Payables auto-posting** — salary, PF, TDS, Professional Tax flow into finance on lock.
4. **Bank/Cash reconciliation** — the proof that the numbers are right.

---

## 2. The Words We Use — Don't Mix Them Up

Finance is full of overloaded terms. This table fixes the vocabulary used across the rest of the document.

| Term | What it means HERE | What it is NOT |
|---|---|---|
| **Account Head** | A named bucket of money that carries a running balance (e.g. "Tuition Fee Income", "Salary Expense", "HDFC Bank", "PF Payable"). | Not a "category" (categories are tags, they don't balance). Not a full ledger account number. |
| **Head Type** | One of: **Income**, **Expense**, **Bank/Cash**, **Liability**. Determines whether money in increases or decreases the balance. | Not a fee type or payment method. |
| **Category** (existing) | A flat tag on an income/expense record (e.g. "Donations", "Utilities"). Used for grouping and reports. | Not an Account Head. A category **maps to** a head. |
| **Ledger / Posting** | The act of recording a money movement between two Account Heads. "Posting a receipt" = crediting an Income head and debiting a Bank head. | Not a bank statement. Not a journal entry with debit/credit rules. |
| **Running Balance** | The current amount held by a head (income in − reversals; bank in − out; liability raised − settled). | Not a snapshot. It changes with every event. |
| **Receipt** | Proof given to a parent that a fee was collected. Creates a posting. | Not itself income — the **fee head** is the income; the receipt is the evidence. |
| **Income** | Money the school receives (fees, donations, grants). Increases an Income head. | Not the same as a receipt (a receipt may cover multiple income heads). |
| **Expense** | Money the school pays out (salary, vendor, utility). Increases an Expense head. | Not the same as a payment method or a vendor. |
| **Payable** | Money the school **owes but has not yet paid** (PF, TDS, Professional Tax, refund approved-but-not-disbursed). Lives in a Liability head until settled. | Not the same as an expense (expense is incurred; payable is the unpaid portion). |
| **Disbursement** | The actual bank payout that settles a payable (e.g. paying PF to the government). | Not the payroll lock (lock incurs; disbursement pays). |
| **Reconciliation** | Matching a Bank/Cash head's running balance to the real bank statement, transaction by transaction. | Not the existing "Finance Reconciliation" screen (which today is a standalone reconciliation tracker, not head-based). |
| **Cost Centre** (optional, later) | A dimension to slice balances by (e.g. by branch, department, class). | Not required for the MVP in this document. |
| **Contra / Reversal** | A posting that **undoes** an earlier one (e.g. reversing a late fee when a refund is approved). | Not a deletion. The original stays on record. |

---

## 3. Current State vs Intended State

Legend: ✅ works today · 🟡 partial / manual · ❌ missing · 🔴 wrong/disconnected

| Concern | Today | Intended |
|---|---|---|
| Income tracking | 🟡 Flat category+tag register, no balance | ✅ Posts to Income heads with running balances |
| Expense tracking | 🟡 Flat category+tag register, no balance | ✅ Posts to Expense heads with running balances |
| Fee Collection → income | 🔴 Collections recorded, never become accounting income | ✅ Each receipt auto-posts to the fee's Income head + Bank head |
| Charges → income | 🔴 Charges raised, not posted as income | ✅ Charge collection posts to its Income head |
| Refund → expense | 🟡 Policy has a `considerAsExpense` toggle, unused at runtime | ✅ Refund approval posts to Refund Expense / Refund Payable + Bank out |
| Late fee → income | 🔴 Collection policy has `considerAsIncome` toggle, unused | ✅ Applied late fee posts to a Late-Fee Income head |
| Concession → ledger | 🔴 Policy fields inert; concession reduces demand but no accounting trail | ✅ Paid-fee concession raises a contra; pending concession reduces demand cleanly |
| Proration → ledger | 🟡 Reduces demand at admission, no audit on the ledger side | ✅ Proration adjustment recorded against the fee head with a reason |
| **Payroll → finance** | 🔴 **Posts nothing. Payslips only.** | ✅ Payroll lock auto-posts Salary Expense + PF/TDS/PT Payable; disbursement clears them |
| Statutory compliance (PF/TDS/PT) | 🟡 PF configured; Professional Tax & TDS commented out | ✅ All three tracked as Payables until disbursed |
| Bank / cash accounts | 🟡 Bank account master exists, not linked to balances | ✅ Each bank account is a Bank head with a reconciled balance |
| Reconciliation | 🟡 Standalone reconciliation tracker, not head-based | ✅ Bank head ↔ bank statement, transaction-level matching |
| Budget | 🟡 Budget screen exists, no route/menu, not linked to actuals | ✅ Budget vs actuals per head (later phase) |
| Single source of truth | 🔴 Each module keeps its own numbers | ✅ Accounts hub is the source; modules read/write through it |

---

## 4. The Master Connection Map

The Accounts hub sits in the middle. Money flows **in** from fee collection and charges; money flows **out** via refunds, expenses, and payroll; liabilities (PF/TDS/PT, refund-payable, fee-advance) sit on the hub until settled; and the Bank/Cash heads reconcile to the real bank.

```
                          ┌──────────────────────────┐
                          │      FEE COLLECTION       │
                          │ tuition · transport · lab │
                          └─────────────┬─────────────┘
                                        │ receipt
                                        ▼  INCOME +  BANK-in
   ┌───────────────┐    salary     ┌─────────────────────────────┐   refund    ┌───────────────┐
   │    PAYROLL    │──expense──────▶│                             │◀──expense───│    REFUND     │
   │ run + lock    │                │       ACCOUNTS  HUB         │             │   approval    │
   │ (salary, PF,  │──liability────▶│   (Account Heads ledger)    │──liability─▶│ (Refund       │
   │  TDS, PT)     │                │                             │             │  Payable)     │
   └───────────────┘                │  Income │ Expense           │             └───────────────┘
                                    │  Bank/Cash │ Liability      │
   ┌───────────────┐   demand cut   │                             │  contra      ┌───────────────┐
   │  CONCESSION   │◀───────────────│      running balances       │──────────────▶│  LATE-FEE /  │
   │  (approved)   │                │      per head               │               │  CHARGES     │
   └───────────────┘                │                             │               └───────────────┘
   ┌───────────────┐   demand cut   └──────────────┬──────────────┘
   │   PRORATION   │◀───────────────┘               │ reconcile
   │  (admission)  │                                ▼
   └───────────────┘                    ┌──────────────────────────┐
                                        │   BANK / CASH HEADS      │
   ┌───────────────┐   manual post      │   ↔ real bank statement  │
   │ MANUAL INCOME │───────────────────▶│      (reconciliation)    │
   │ / EXPENSE     │                    └──────────────────────────┘
   └───────────────┘
```

**Read the arrows as money movement:** every arrow is one **posting** between two heads. Nothing in this map is a "report" — each line is real money moving and a balance changing.

---

## 5. The Hybrid Ledger-Heads Model (the Backbone)

The model is deliberately small. There are **four head types**, and **one rule**.

### 5.1 The four head types

| Head Type | Nature | Money IN does | Money OUT does | Examples |
|---|---|---|---|---|
| **Income** | credit-nature | increases balance | (reversal decreases) | Tuition Fee, Transport, Hostel, Exam, Lab, Donations, Grants, Late-Fee Income, Other Income |
| **Expense** | debit-nature | (that IS the in) increases balance | reversal decreases | Salary & Wages, Employer PF, Vendor/Procurement, Utilities, Maintenance, Transport Operations, Refund/Reversal, Other Expense |
| **Bank / Cash** | asset-nature | increases balance | decreases balance | each Bank Account → its own head; Cash in hand; Petty Cash |
| **Liability** | credit-nature | increases (owed goes up) | decreases when settled | PF Payable, TDS Payable, Professional-Tax Payable, Refund Payable, Fee Advance/Deposit, Unearned Income |

### 5.2 The one rule — the Two-Head Posting Rule

> **Every money event posts between exactly two Account Heads.** Money never appears from nowhere and never disappears. Where it came from + where it went = one posting.

This single rule is what makes reconciliation possible: the Bank head's movement always has a matching "other side".

| Event | Head A (debit) | Head B (credit) | Net effect |
|---|---|---|---|
| Collect ₹10,000 tuition | Bank (HDFC) +10,000 | Tuition Fee Income +10,000 | money in |
| Apply ₹500 late fee + collect | Bank +500 | Late-Fee Income +500 | money in |
| Payroll lock: ₹5,00,000 salary | Salary Expense +5,00,000 | Salary Payable / Bank (see §6.6) | expense incurred |
| Payroll lock: ₹30,000 PF | Employer PF Expense +30,000 **and** Salary deduction | PF Payable +30,000 | liability raised |
| Disburse PF to government | PF Payable −30,000 | Bank −30,000 | liability settled |
| Approve ₹2,000 refund | Refund Expense +2,000 **or** Refund Payable +2,000 | Bank −2,000 | money out |
| Receive ₹50,000 donation | Bank +50,000 | Donations Income +50,000 | money in |

> ⚠️ **Not double-entry.** There are no account numbers, no trial balance, no balance sheet, no debit/credit rules for the user to learn. The system maintains the two-head invariant internally; the user only ever sees **heads and balances**. If a future phase needs a full GL, the two-head postings upgrade cleanly into journal lines.

### 5.3 How existing entities map to heads

| Existing entity | Becomes / maps to |
|---|---|
| **Fee Category** + **Fee Head** | Each Fee Head maps to **one Income head** (e.g. Fee Head "Tuition" → Income head "Tuition Fee Income") |
| **Charge Category** | Maps to an **Income head** (e.g. "Exam Fee", "Bus Fee") |
| **Income Category** (settings) | Maps to an **Income head** (for non-fee income: donations, grants) |
| **Expense Category** (settings) | Maps to an **Expense head** |
| **Bank Account** master | Each row becomes **one Bank head** |
| **Payroll Earning Component** | Feeds **Salary Expense** (or a dedicated expense head) |
| **Payroll Deduction: PF** | Feeds **PF Payable** (liability) |
| **Payroll Deduction: TDS** | Feeds **TDS Payable** (liability) |
| **Payroll Deduction: Professional Tax** | Feeds **Professional-Tax Payable** (liability) |
| **Refund Policy** `considerAsExpense` | Selects the **Refund Expense head** vs treating it as a contra |

---

## 6. Connection Detail — Module by Module

### 6.1 ➡️ Fee Collection → Income (primary money-in)

**What happens today:** A receipt is generated when a parent pays. The collection is recorded in the Fees module. It never becomes accounting income.

**What should happen:** The moment a receipt is finalised, the system posts to the **fee head's Income head** and the **Bank/Cash head** matching the payment method. The fee's demand is reduced (existing behaviour) **and** the Income head balance goes up — both, atomically.

- One receipt may cover **multiple fee heads** → one posting per fee head (all debiting the same Bank head).
- Partial payments post the collected amount only; the unpaid portion stays as demand, not as income.
- Online collections land in the **settlement bank** (the gateway's payout account), not "cash".
- `considerAsIncome` on late fee (Collection Policy) routes the late-fee portion to a **Late-Fee Income head**, separate from tuition.

> 🚩 Today the Fee Collection module and Income Tracking are two separate worlds. A tuition receipt does not appear in Income Tracking and vice versa. This connection fixes that.

### 6.2 ➡️ Charges → Income

**What should happen:** Charges (exam/lab/bus) follow the same rule as fees. Each Charge Category maps to an Income head. When a charge is collected, it posts to that Income head + Bank head. Refundable charges (where the policy allows refund) carry a flag so a later refund can target the same head.

### 6.3 ➡️ Refund → Expense / Liability (primary money-out)

**What happens today:** The Refund Policy has a `considerAsExpense` toggle and a `governmentComplianceCode`, and rules for `refundDueWithin` and `bankDetailsRequired`. None of these drive any accounting. Refunds are paid out with no financial trail.

**What should happen:** When a refund is **approved**:
1. A **Refund Payable** (liability) is raised for the approved amount — money is owed to the parent until it leaves.
2. When the refund is **disbursed** (bank payout), Refund Payable is cleared and the **Bank head** decreases.
3. If `considerAsExpense` is on, the disbursed amount is **also** posted to a **Refund/Reversal Expense head** (so it shows up in expense reports). If off, it is treated as a **contra reversal** of the original Income head (income goes back down) — the right treatment for "we shouldn't have counted this as income".
4. **Late-fee clawback:** if the refund reverses a fee that had late fee applied, the system **reverses** the Late-Fee Income posting (contra), not just "removes" it.
5. **Concession hand-off:** if the refunded fee had a paid-fee concession, the concession's effect is reversed too (see §6.4).

### 6.4 ➡️ Concession → Ledger Impact

**What happens today:** The Concession Policy's rich fields (`paidFeeAdjustment`, `pendingFeeHandling`, `lateFeeBehaviour`, `receiptBehaviour`) are defined but **never consulted** at runtime. A concession reduces demand but leaves no accounting trail. (Documented in detail in [Concession Policy — Product-Level Flow](./concession-policy-product-flow.md).)

**What should happen, for accounting:**
- **Pending-fee concession** (fee not yet paid): reduces demand. **No posting** — nothing was collected, so nothing to reverse. The Income head is simply never credited with that amount.
- **Paid-fee concession** (fee already paid, money being returned or adjusted):
  - `Refund` → behaves like §6.3 (Refund Payable → Bank out).
  - `CreditNote` / `StudentWallet` / `FutureFeeAdjustment` → raises a **liability** (Fee Advance / Student Wallet head) representing what the school owes the student, settled against future fees.
  - `ManualDecision` → forces a user to pick one of the above; no silent default.
- `lateFeeBehaviour` = `RemoveLateFee` → contra-reverses the Late-Fee Income head.
- `receiptBehaviour` = `ReverseOriginal` → contra-reverses the original receipt's Income posting.

> ⚠️ The accounting layer **depends on the policy fields actually being wired at runtime**. If the Concession Policy stays inert (today's state), the ledger cannot reflect concession correctly. Wiring the policy is a prerequisite — see [Concession Policy — Product-Level Flow §9](./concession-policy-product-flow.md).

### 6.5 ➡️ Proration → Ledger Impact

**What happens today:** Proration Policy reduces a mid-year admission's fee demand (daily/monthly rules per fee head). The demand reduction happens; the accounting side has no record of "this was prorated because X".

**What should happen:** The prorated amount is recorded against the fee head as a **proration adjustment with a reason** (admission date, days charged, rule used). No posting (nothing was collected), but the adjustment is **auditable** on the head's detail view, so finance can explain the gap between "full fee" and "actual demand". This is a reporting/audit concern, not a balance concern.

### 6.6 ➡️ Payroll → Expense + Payables (the big one)

**What happens today:** Run Payroll computes gross, deductions (PF; TDS & PT are commented out), and net pay, then on lock generates **payslips**. It posts **nothing** to finance. The school's biggest expense — staff salaries — is invisible to the Accounts module unless someone manually types it into Expense Tracking.

**What should happen — two postings, two moments:**

**Moment A — Payroll Lock (expense incurred, liabilities raised):**
For each locked payslip, the system posts:
| Component | Debit head | Credit head |
|---|---|---|
| Gross salary | **Salary & Wages Expense** | **Salary Payable** (liability, per employee or batch) |
| Employee PF | (part of gross already expensed) | **PF Payable** (liability) |
| Employer PF | **Employer PF Expense** | **PF Payable** (liability) |
| TDS deducted | (part of gross) | **TDS Payable** (liability) |
| Professional Tax deducted | (part of gross) | **Professional-Tax Payable** (liability) |
| Net pay | **Salary Payable** (cleared) | **Bank** (will go out at disbursement) |

> The net effect at lock: **Salary Expense** (gross + employer PF) is recognised, and **Payables** (PF/TDS/PT) are raised. Net pay sits in Salary Payable until the bank transfer.

**Moment B — Disbursement (money leaves):**
- **Salary disbursement:** Salary Payable → Bank (out). Payslip status moves `Finalized → Paid`.
- **Statutory disbursement** (separate, monthly/quarterly): PF Payable → Bank when PF is deposited with the government; likewise TDS and PT. Each disbursement is its own bank transaction that reconciles.

**Linkage:** every posting references the **payslip** and the **payroll run** (month + academic year), so finance can drill from an expense head line straight to the payslip that caused it. No more "where did this ₹5,00,000 come from?".

> 🚩 **Professional Tax and TDS are currently commented out in the HR menu.** Before payroll posting can be complete, those statutory deduction components must be re-enabled so their payables exist. (PF is already active.)

### 6.7 ➡️ Bank / Cash → Reconciliation

**What should happen:** Each Bank Account master row is a Bank head. Every posting that touches money in/out lands on a Bank head. Reconciliation is the act of matching Bank head transactions to the **real bank statement**, line by line:
- **Matched:** transaction found on statement → marked cleared.
- **Unmatched (in system):** posting exists, no statement line → "in transit" (e.g. cheque issued not yet encashed).
- **Unmatched (on statement):** statement line exists, no posting → bank charges, interest, or a missing entry → user creates a posting or marks as bank-only.

The Bank head's **book balance** (running) and **reconciled balance** (matched only) are both shown. The gap is always "in transit" items.

> ⚠️ The existing **Finance Reconciliation** screen is a standalone tracker today. It should become the head-based reconciliation described here, reading from Bank heads.

---

## 7. End-to-End Business Flows (Happy Paths)

### 7.1 Fee Collection → Income → Bank → Reconcile

```
1. Parent pays ₹10,000 tuition + ₹500 late fee online (UPI)
   └─ receipt generated (existing)
   └─ AUTOMATION: post
        Bank (Gateway Settlement)  +10,500  (debit)
        Tuition Fee Income         +10,000  (credit)
        Late-Fee Income            +   500  (credit)
2. Gateway settles to HDFC account next day
   └─ AUTOMATION: internal transfer
        Bank (HDFC)  +10,500
        Bank (Gateway Settlement)  −10,500
3. Month-end: reconcile HDFC head vs HDFC statement
   └─ the ₹10,500 appears on both → matched ✅
4. Finance dashboard shows:
   └─ Tuition Fee Income head balance = sum of all such receipts
   └─ HDFC Bank head balance = reconciled to statement
```

### 7.2 Payroll Run → Expense + Payables → Disbursement → Reconcile

```
1. HR runs payroll for July (gross ₹5,00,000, PF ₹30,000, net ₹4,70,000)
   └─ readiness checks pass, rows reviewed (existing)
2. HR clicks Lock
   └─ payslips generated (existing)
   └─ AUTOMATION: post at lock
        Salary & Wages Expense   +5,00,000  (debit)
        Employer PF Expense      +   30,000  (debit)
            Salary Payable           +4,70,000  (credit)
            PF Payable               +   60,000  (credit)  [employee + employer]
3. Finance disburses net salary (NEFT)
   └─ AUTOMATION: post
        Salary Payable  −4,70,000
        Bank (HDFC)     −4,70,000
   └─ payslip status → Paid
4. Finance deposits PF with government (next month)
   └─ AUTOMATION: post
        PF Payable  −60,000
        Bank (HDFC) −60,000
5. Reconcile: every line matches a bank statement entry ✅
6. Dashboard: Salary Expense head = ₹5,30,000; PF Payable = 0 (settled)
```

### 7.3 Refund Approval → Payable → Disbursement → Reconcile

```
1. Parent requests ₹2,000 refund on a paid exam fee (which had ₹0 late fee)
   └─ refund request created (existing)
2. Finance approves refund; policy considerAsExpense = ON
   └─ AUTOMATION: post at approval
        Refund Payable  +2,000   (liability raised)
            (no bank movement yet)
3. Finance disburses to parent's bank (NEFT)
   └─ AUTOMATION: post
        Refund Payable  −2,000
        Refund Expense  +2,000   (because considerAsExpense)
        Bank (HDFC)     −2,000
4. If the fee had a late fee component, AUTOMATION also:
   └─ Late-Fee Income  −<that amount>   (contra reversal)
5. Reconcile: the ₹2,000 outflow matches statement ✅
```

### 7.4 Concession Approval (paid-fee, CreditNote) → Liability → Future offset

```
1. Student eligible for ₹5,000 concession on already-paid tuition
   └─ concession request created (existing)
2. Approver approves; paidFeeAdjustment = CreditNote
   └─ AUTOMATION: post
        Tuition Fee Income  −5,000   (contra — income corrected down)
        Student Wallet / Fee Advance  +5,000  (liability — school owes student)
3. Next term, the ₹5,000 is applied against new fees
   └─ AUTOMATION: post
        Student Wallet / Fee Advance  −5,000
        Tuition Fee Income            +0  (demand already reduced; wallet offset only)
4. Wallet head balance returns to 0 ✅
```

---

## 8. How the Forms Should Be

This section specifies the forms that need to exist or change, in product language. Field tables use: **Field | What it is | What it should control | Where it kicks in | Today**.

### 8.1 Account Head Master (NEW)

The single most important new screen. Lives under **Accounts → Settings → Account Heads**.

| Field | What it is | What it should control | Where it kicks in | Today |
|---|---|---|---|---|
| Head Name | e.g. "Tuition Fee Income" | Display + reports | Everywhere | ❌ does not exist |
| Head Code | Short code, e.g. "INC-TUIT" | Sorting, references | Reports, postings | ❌ |
| Head Type | Income / Expense / Bank-Cash / Liability | Direction of money; balance sign | Posting engine | ❌ |
| Nature | Auto from type (credit/ debit) | Whether "in" increases balance | Posting | ❌ |
| Linked Source | Fee Head / Charge Category / Income Category / Expense Category / Bank Account / Payroll Component / Manual | Auto-resolves which head an event uses | Fee collection, payroll, manual entry | ❌ |
| Opening Balance | Starting amount (for migration) | Initial balance | Go-live | ❌ |
| Active / Archived | Status | Whether new postings can target it | All selectors | ❌ |

> One head per Bank Account, one head per Fee Head (optionally one per Fee Category), one head per Expense Category, plus a fixed set of payroll-related heads.

### 8.2 Fee Head / Fee Category — add Income Head mapping

| Field | What it is | What it should control | Where it kicks in | Today |
|---|---|---|---|---|
| Income Head | Which Income head collections map to | Routing of fee receipts | Fee collection receipt | ❌ missing |
| Refundable | Whether this head's collections can be refunded | Refund eligibility | Refund request | 🟡 partial (Charge Category has isRefundable) |

### 8.3 Income Tracking / Expense Tracking entry form (EXISTING — extend)

Keep the current fields; add auto-resolution.

| Field | What it is | What it should control | Today |
|---|---|---|---|
| Category | Existing tag | Resolves the **Account Head** automatically | ✅ exists |
| Tags | Existing | Grouping/reports | ✅ |
| Amount | Existing | Posting amount | ✅ |
| Payment Method | Existing enum (Cash/Cheque/DD/NEFT/Card/UPI) | Resolves the **Bank/Cash head** | ✅ |
| Payment Date | Existing | Posting date | ✅ |
| Notes / Document | Existing | Audit | ✅ |
| **Account Head** (auto) | Derived from category | Target head — shown read-only with override | ❌ |
| **Bank/Cash Head** (auto) | Derived from payment method | Source/destination head | ❌ |

### 8.4 Refund Policy — accounting fields (EXISTING — wire up)

| Field | What it means | Where it must apply | Today |
|---|---|---|---|
| `considerAsExpense` | Treat refund as expense vs contra | Refund disbursement posting | ❌ editable but not enforced |
| `governmentComplianceCode` | Statutory reference on the posting | Posting note / compliance report | ❌ not used |
| `refundDueWithin` | SLA for disbursement | Refund Payable ageing report | ❌ not enforced |
| **Refund Expense Head** (NEW) | Which expense head if considerAsExpense | Refund posting | ❌ |
| **Refund Payable Head** (NEW) | Liability head for approved-not-disbursed | Refund approval posting | ❌ |
| **Late-fee clawback** (NEW toggle) | Reverse late-fee income on refund | Refund posting | ❌ |

### 8.5 Collection Policy — accounting fields (EXISTING — wire up)

| Field | What it means | Where it must apply | Today |
|---|---|---|---|
| `considerAsIncome` (late fee) | Route late fee to a separate income head | Late-fee posting | ❌ not enforced |
| **Late-Fee Income Head** (NEW) | Target head for applied late fee | Late-fee posting | ❌ |

### 8.6 Payroll Posting Configuration (NEW)

A settings screen under **Payroll → Settings → Finance Posting** (or Accounts → Settings).

| Field | What it is | What it should control | Today |
|---|---|---|---|
| Salary Expense Head | Where gross salary lands on lock | Payroll lock posting | ❌ |
| Employer PF Expense Head | Where employer PF lands | Payroll lock posting | ❌ |
| PF Payable Head | Liability for PF | Lock + statutory disbursement | ❌ |
| TDS Payable Head | Liability for TDS | Lock + statutory disbursement | ❌ (TDS off) |
| Professional-Tax Payable Head | Liability for PT | Lock + statutory disbursement | ❌ (PT off) |
| Salary Payable Head | Transient liability for net pay | Lock → salary disbursement | ❌ |
| Default Disbursement Bank Head | Bank head for net salary payout | Salary disbursement | ❌ |
| Auto-post on lock | Toggle: post automatically vs draft | Lock action | ❌ |

### 8.7 Bank Account master (EXISTING — link to head)

Each bank account already has bank name, account number, IFSC, UPI, purpose, active. **Add:** "Linked Bank Head" (auto-created, one per account). No new user-facing complexity — the head is created when the bank account is saved.

### 8.8 Reconciliation screen (EXISTING — repurpose)

| Field / control | What it does | Today |
|---|---|---|
| Bank head selector | Pick which Bank head to reconcile | ❌ (not head-based) |
| Statement import / entry | Bring in bank statement lines | 🟡 partial |
| Match / Unmatch / In-transit | Per-transaction status | ❌ |
| Book balance vs Reconciled balance | Two balances shown | ❌ |

---

## 9. Automation Rules — What Happens Automatically

This is the heart of "robust flow": the user should **never** have to manually record what another module already knows. Each trigger below fires a posting **without human action** (configurable to "draft" where finance wants a checkpoint).

| # | Trigger (in module X) | Automatic action (in Accounts) | Heads touched |
|---|---|---|---|
| A1 | Fee receipt finalised | Post income | Bank (pm) ↑, Fee-head Income ↑ |
| A2 | Late fee applied + collected | Post late-fee income | Bank ↑, Late-Fee Income ↑ |
| A3 | Charge collected | Post income | Bank ↑, Charge Income ↑ |
| A4 | Payroll **lock** | Post salary expense + statutory payables | Salary Expense ↑, Employer PF ↑, PF/TDS/PT Payable ↑, Salary Payable ↑ |
| A5 | Salary **disbursement** (NEFT run) | Clear salary payable, bank out | Salary Payable ↓, Bank ↓; payslip → Paid |
| A6 | Statutory **disbursement** (PF/TDS/PT to govt) | Clear statutory payable, bank out | PF/TDS/PT Payable ↓, Bank ↓ |
| A7 | Refund **approved** | Raise refund payable | Refund Payable ↑ |
| A8 | Refund **disbursed** | Clear payable, post expense or contra, bank out | Refund Payable ↓, Refund Expense ↑ **or** Income ↓, Bank ↓ |
| A9 | Refund of a fee with late fee | Reverse late-fee income | Late-Fee Income ↓ |
| A10 | Paid-fee concession **approved** (CreditNote/Wallet) | Contra income, raise wallet liability | Income ↓, Student Wallet ↑ |
| A11 | Wallet/advance **applied** to new fees | Clear wallet liability | Student Wallet ↓ |
| A12 | Pending-fee concession approved | Reduce demand only (no posting) | — |
| A13 | Proration applied at admission | Record adjustment reason on fee head (no posting) | — |
| A14 | Manual income/expense saved | Post to category head + bank | per head type |
| A15 | Gateway settlement received | Internal bank-to-bank transfer | Gateway Bank ↓, Operating Bank ↑ |

> ⚠️ **All automation is gated behind a per-event "Auto-post / Draft / Off" toggle**, so finance can start in Draft mode (review every posting) and move to Auto as confidence grows. Draft postings appear in a queue for one-click approval.

> 🚩 **Prerequisite:** automation A4–A6, A8–A9 require the policy fields (Concession, Refund, Collection) to actually be **consulted at runtime**, and statutory components (TDS, PT) to be re-enabled. Today they are not — so postings cannot be correct until that wiring exists.

---

## 10. Scenarios & Edge Cases

### 10.1 Partial fee payment
- **Setup:** ₹10,000 due, parent pays ₹4,000.
- **Intended:** Post ₹4,000 to Tuition Income + Bank. ₹6,000 stays as demand. Income head reflects only what was collected.

### 10.2 Online payment gateway in transit
- **Setup:** ₹500 collected via UPI; gateway settles T+1.
- **Intended:** At receipt, post to "Gateway Settlement" bank head. On settlement, internal transfer to HDFC. Reconciliation sees the T+1 gap as in-transit, not unmatched.

### 10.3 Salary disbursement fails (NEFT bounce)
- **Setup:** Payroll locked, net pay disbursed, but NEFT returns.
- **Intended:** Bank out is **reversed** (contra); Salary Payable is **restored**. Payslip stays Paid only after a successful retry. Never silently delete the failed posting.

### 10.4 PF rate changes mid-year
- **Setup:** Employer PF % changes from 12% to 10%.
- **Intended:** PF master updated; from the effective month the posting uses the new rate. Prior postings unchanged. Ageing report shows the liability by month.

### 10.5 Refund of a fee that had a concession
- **Setup:** Parent paid ₹10,000, got ₹2,000 concession as CreditNote (wallet), now wants full refund of the ₹8,000 net.
- **Intended:** Refund the ₹8,000 (Bank out, Refund Expense). Wallet liability of ₹2,000 remains until consumed or reversed separately. Do **not** refund the concession amount automatically.

### 10.6 Late fee refunded then re-applied
- **Setup:** Late fee reversed on refund, but parent later re-pays the original overdue fee.
- **Intended:** Late fee is re-applied per Collection Policy and re-posted as income. The earlier contra and the new posting both appear (audit trail), net effect correct.

### 10.7 Payroll run across the academic-year boundary
- **Setup:** July is in AY 2025–26; August in AY 2026–27 (config-dependent).
- **Intended:** Each run scoped to its academic year; postings tagged accordingly. No cross-year mixing on the dashboard.

### 10.8 Stale payable (PF never deposited)
- **Setup:** PF Payable raised at lock, but finance forgot to deposit for 3 months.
- **Intended:** Payable ageing report flags overdue PF. Liability head balance keeps growing until disbursement. Nothing auto-clears.

### 10.9 Bank charge on statement not in system
- **Setup:** Bank deducts ₹500 charge; no posting exists.
- **Intended:** Reconciliation shows "unmatched on statement". User creates a posting to "Bank Charges Expense" + Bank ↓, then matches.

### 10.10 Concession on an optional fee head
- **Setup:** Transport is optional; student has it; concession applies.
- **Intended:** Same rules apply per head; optionality doesn't change posting logic.

### 10.11 Two bank accounts, wrong one selected
- **Setup:** Cash collected but operator tagged UPI.
- **Intended:** Edit the receipt within the allowed window → system posts a reversal + correct posting (two postings, both visible). Never overwrite.

### 10.12 Migration / opening balances
- **Setup:** Go-live with existing bank balance ₹5,00,000 and outstanding fee demand.
- **Intended:** Opening balance posting to Bank head against an "Opening Balance" equity/head. Prior demand is not retro-posted as income.

### 10.13 Mid-month admission with proration
- **Setup:** Student joins day 20; tuition prorated to 11 days.
- **Intended:** Demand reduced per Proration Policy; adjustment reason recorded on the fee head. When collected, only the prorated amount posts as income.

### 10.14 Refund where `considerAsExpense` is OFF
- **Setup:** Refund of ₹1,000, policy says contra (not expense).
- **Intended:** Tuition Income ↓ ₹1,000 (income corrected), Bank ↓ ₹1,000. No Refund Expense recorded. Reports show net income, not "income then expense".

### 10.15 Payroll with negative net pay
- **Setup:** Deductions exceed gross (over-recovery).
- **Intended:** Run Payroll already flags `NEGATIVE_NET_PAY` as CRITICAL. Posting is **blocked** until resolved; no negative salary payable is created.

### 10.16 Reconciliation with uncleared cheque
- **Setup:** Cheque issued for vendor, not yet encashed.
- **Intended:** Bank head ↓ at issue; reconciled balance differs from book balance by the cheque amount; flagged "in transit" until cleared.

### 10.17 Concession policy still inert at runtime
- **Setup:** Approver approves; rich policy fields ignored (today's state).
- **Intended (interim):** Accounts automation A10/A11 cannot fire correctly. Block auto-posting for concessions until the policy is wired; fall back to manual adjustment with a warning.

---

## 11. What Must Change to Make This Real

### 🔴 Critical

**Change 1 — Build the Account Heads master and the two-head posting engine.**
- **Gap:** There is no ledger backbone; income/expense are flat registers.
- **Desired:** A new Account Heads master (Income/Expense/Bank-Cash/Liability) and a posting engine that enforces the two-head rule and maintains running balances.
- **Lands in:** Accounts → Settings → Account Heads; core posting service.

**Change 2 — Map existing entities to heads.**
- **Gap:** Fee Heads, Charge Categories, Income/Expense Categories, and Bank Accounts do not point at heads.
- **Desired:** Each maps to exactly one head; head auto-created on save for Bank Accounts; selectors on Fee Head and categories.
- **Lands in:** Fee Head / Fee Category / Charge Category / Income Category / Expense Category / Bank Account forms.

**Change 3 — Fee Collection → Income auto-posting (money-in).**
- **Gap:** Receipts never become accounting income.
- **Desired:** On receipt finalisation, post to fee-head Income + Bank (Automation A1–A3).
- **Lands in:** Fee Collection receipt flow + posting engine.

**Change 4 — Payroll → Expense + Payables auto-posting (money-out).**
- **Gap:** Payroll posts nothing; salary is invisible to finance.
- **Desired:** On payroll lock, post Salary Expense + Employer PF + PF/TDS/PT Payable (A4); on disbursement, clear payables and bank out (A5–A6). Link postings to payslip + run.
- **Lands in:** Payroll lock + disbursement flows; Payroll Posting Configuration screen (§8.6).

### 🟠 High

**Change 5 — Re-enable Professional Tax and TDS.**
- **Gap:** PT and TDS are commented out in the HR menu, so their payables cannot exist.
- **Desired:** Re-enable statutory components so A4/A6 cover all three.
- **Lands in:** HR menu + payroll settings.

**Change 6 — Refund → Expense/Liability posting.**
- **Gap:** `considerAsExpense`, `governmentComplianceCode`, `refundDueWithin` exist but are inert.
- **Desired:** On refund approval raise Refund Payable; on disbursement clear it and post expense or contra; reverse late fee (A7–A9).
- **Lands in:** Refund approval + disbursement flows.

**Change 7 — Wire the Concession Policy at runtime.**
- **Gap:** Policy fields are ignored; concessions leave no accounting trail. (See [Concession doc §9](./concession-policy-product-flow.md).)
- **Desired:** Pending vs paid concession handled; paid-fee concession raises wallet liability or refund; late-fee/receipt behaviour enforced (A10–A11).
- **Lands in:** Concession request/approval flow.

**Change 8 — Late-fee income head + Collection Policy wiring.**
- **Gap:** `considerAsIncome` toggle is inert.
- **Desired:** Applied late fee posts to a dedicated Late-Fee Income head (A2).
- **Lands in:** Collection Policy + late-fee engine.

**Change 9 — Head-based Bank Reconciliation.**
- **Gap:** Reconciliation screen is standalone, not tied to Bank heads.
- **Desired:** Match Bank head transactions to statement; show book vs reconciled balance (§6.7, §8.8).
- **Lands in:** Finance Reconciliation screen.

### 🟡 Medium

**Change 10 — Auto-post / Draft / Off toggle per event type.**
- **Gap:** Automation is all-or-nothing in this design.
- **Desired:** Finance chooses confidence level per event; draft queue for review.
- **Lands in:** Posting engine settings.

**Change 11 — Gateway settlement bank head + internal transfer.**
- **Gap:** Online collections settle T+1 with no modelling.
- **Desired:** Dedicated gateway settlement head; auto internal transfer on settlement (A15).
- **Lands in:** Fee Collection + bank settings.

**Change 12 — Proration adjustment audit on fee head.**
- **Gap:** Proration reduces demand with no ledger-side reason.
- **Desired:** Adjustment reason recorded against the head (A13), visible in head detail.
- **Lands in:** Proration engine + head detail view.

**Change 13 — Payable ageing report.**
- **Gap:** No view of overdue PF/TDS/PT or refund payables.
- **Desired:** Ageing report by liability head (30/60/90 days).
- **Lands in:** Accounts → Reports.

**Change 14 — Income/Expense entry form: auto head resolution.**
- **Gap:** Manual entries don't resolve to heads.
- **Desired:** Category → head, payment method → bank head, auto (§8.3).
- **Lands in:** Income Tracking + Expense Tracking forms.

**Change 15 — Finance dashboard: balances per head.**
- **Gap:** Dashboard shows flat sums.
- **Desired:** Income/Expense/Bank/Liability head balances, month and AY scoped, with drill-down to the posting/payslip/receipt.
- **Lands in:** Finance dashboard.

### 🟢 Low

**Change 16 — Budget vs actuals per head.**
- **Gap:** Budget screen exists but is unrouted and unlinked.
- **Desired:** Route it; compare budgeted vs actual per head.
- **Lands in:** Budget Management.

**Change 17 — Cost centres (branch/department).**
- **Gap:** Balances are school-wide only.
- **Desired:** Optional cost-centre dimension on heads.
- **Lands in:** Later phase.

**Change 18 — Policy-level RBAC for heads/postings.**
- **Gap:** Policy permissions alias to one value today.
- **Desired:** Distinct permissions for creating heads, approving draft postings, reconciling.
- **Lands in:** Permissions model.

### Priority summary

| Change | Headline outcome | Unlocks / unblocks |
|---|---|---|
| 1 | Ledger backbone exists | Everything else |
| 2 | Entities map to heads | Postings can resolve |
| 3 | Fees become income | Money-in accounting |
| 4 | Payroll becomes expense + payables | Money-out accounting, statutory tracking |
| 5 | All three statutory components active | Complete payroll posting |
| 6 | Refunds become expense/liability | Honest money-out |
| 7 | Concession leaves an audit trail | Correct concession accounting |
| 8 | Late fee becomes income | Complete money-in |
| 9 | Bank reconciliation works | Trust in the numbers |
| 10–15 | Polish, reports, dashboard | Usability |
| 16–18 | Budget, cost centres, RBAC | Scale |

> **If only four things ship, ship Changes 1–4.** With those, the Accounts module is a real hub: fees flow in as income, payroll flows out as expense and liabilities, and balances exist. Refunds, concessions, reconciliation, and reports build on that foundation.

---

## 12. Glossary

- **Account Head** — A named money bucket with a running balance; one of Income, Expense, Bank/Cash, or Liability.
- **Accounts Hub** — The Accounts sub-module as the financial center every module posts through.
- **Bank Head** — A Bank/Cash-type head, one per bank account; reconciles to the bank statement.
- **Book Balance vs Reconciled Balance** — All postings vs only statement-matched postings on a Bank head.
- **Category** — Existing flat tag on income/expense records; maps to (is not the same as) an Account Head.
- **Contra / Reversal** — A posting that undoes an earlier one while keeping the audit trail.
- **Disbursement** — The actual bank payout that settles a payable (salary NEFT, PF deposit).
- **Expense** — Money out; increases an Expense head.
- **Head Type** — Income / Expense / Bank-Cash / Liability; decides balance direction.
- **Hybrid Ledger-Heads Model** — Lightweight head-based ledger with the two-head posting rule; not a full double-entry GL.
- **Income** — Money in; increases an Income head.
- **In Transit** — A posting that exists in the system but not yet on the bank statement (e.g. uncleared cheque).
- **Linked Source** — The entity a head represents (Fee Head, Category, Bank Account, Payroll Component).
- **Payable** — Money owed but unpaid; lives in a Liability head (PF/TDS/PT Payable, Refund Payable, Salary Payable).
- **Posting** — Recording a money movement between two heads.
- **Proration Adjustment** — A recorded reason for reducing demand on mid-year admission; no money movement.
- **Reconciliation** — Matching Bank head transactions to the real bank statement.
- **Running Balance** — The current amount held by a head.
- **Statutory Components** — PF, TDS, Professional Tax — deductions the school must remit to the government.
- **Student Wallet / Fee Advance** — A liability head for paid-fee concessions held as credit against future fees.
- **Two-Head Posting Rule** — Every event posts between exactly two heads; money never appears or disappears.

*End of document.*
