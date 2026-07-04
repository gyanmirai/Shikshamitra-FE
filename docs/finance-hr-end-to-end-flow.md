# Finance & HR — Complete End-to-End Flow, Sub-Modules, Policies & Automation

> **Audience:** Product Managers · Finance Leads · HR Leads · Business Analysts · Engineering Leads
>
> **Scope:** This document covers the **complete flow** from every money event (income or expense) through every sub-module (Fee Collection, Charges, Income Tracking, Expense Tracking, Concession, Proration, Refund, Budget, Reconciliation) and every Finance Policy (Collection / Late-Fee / Concession / Proration / Refund) into the shared **Accounts Hub**, plus the full **HR → Payroll → Finance** integration, including payroll lock, statutory deductions (PF / TDS / PT), disbursement, and reconciliation.
>
> **Companion docs:**
>
> - [Accounts & Finance — Master Product Flow](./accounts-master-product-flow.md)
> - [Collection Policy — End-to-End Flow](./collection-policy-flow.md)
> - [Concession Policy — Product-Level Flow](./concession-policy-product-flow.md)
> - [Concession Policy — End-to-End Flow](./concession-policy-flow.md)
> - [Refund Policy — Product-Level Flow](./refund-policy-flow.md)
> - [HR Module PRD](./hr/prd.md)
> - [HR Workflows & Scenarios](./hr/workflows-and-scenarios.md)
>
> **Last Updated:** 2026-07-03

---

## Table of Contents

1. [The Big Picture — One Money Hub](#1-the-big-picture--one-money-hub)
2. [Module Map — Who Produces Money Events](#2-module-map--who-produces-money-events)
3. [The Four Account Head Types](#3-the-four-account-head-types)
4. [Complete Income Flow — Every Source](#4-complete-income-flow--every-source)
5. [Complete Expense & Liability Flow — Every Source](#5-complete-expense--liability-flow--every-source)
6. [Finance Policies — How Each Policy Drives Postings](#6-finance-policies--how-each-policy-drives-postings)
7. [HR → Payroll → Finance — Full Integration](#7-hr--payroll--finance--full-integration)
8. [Form-Level Specifications — Every Screen That Matters](#8-form-level-specifications--every-screen-that-matters)
9. [Automation Rules — Complete Trigger Table](#9-automation-rules--complete-trigger-table)
10. [Role-Based Flows — Who Does What](#10-role-based-flows--who-does-what)
11. [End-to-End Scenarios (Happy Paths + Edge Cases)](#11-end-to-end-scenarios-happy-paths--edge-cases)
12. [What Must Be Built — Prioritised Change List](#12-what-must-be-built--prioritised-change-list)
13. [Glossary](#13-glossary)

---

## 1. The Big Picture — One Money Hub

### 1.1 The Core Problem Today

```
TODAY — Everything is disconnected
═══════════════════════════════════════════════════════════
Fee Collection ─────────► receipt only — never becomes income
Income Tracking ────────► flat row — no balance, no head
Expense Tracking ───────► flat row — no balance, no head
Payroll (HR) ───────────► payslip only — posts NOTHING to finance
Refunds ────────────────► policy fields exist but drive nothing
Concessions ────────────► reduces demand, no accounting trail
Charges ────────────────► collected but not posted as income
Budget ─────────────────► screen exists, unrouted, unlinked
Reconciliation ─────────► standalone — not tied to bank balances
═══════════════════════════════════════════════════════════
Result: No single truth. Balances do not reconcile. Finance
        cannot answer "where did the school's money go?"
```

### 1.2 The Intended State — Accounts as the Hub

```
                        ┌────────────────────────────────────────┐
                        │           ACCOUNTS HUB                 │
                        │   ┌────────┬──────────┬──────────────┐ │
  Fee Collection ───────►  │INCOME  │ EXPENSE  │ BANK/CASH    │ │
  Charges ─────────────►  │ Heads  │  Heads   │   Heads      │ │
  Manual Income ────────►  └────────┴──────────┴──────────────┘ │
                        │   ┌──────────────────────────────────┐ │
  Payroll Lock ─────────►  │        LIABILITY Heads           │ │
  Refund Approved ──────►  │  PF · TDS · PT · Salary Payable  │ │
  Concession (paid) ────►  │  Refund Payable · Student Wallet  │ │
                        │   └──────────────────────────────────┘ │
                        │                                        │
  Disbursement ─────────►  clears liabilities → Bank out        │
  Reconciliation ────────►  Bank Head ↔ Statement               │
  Budget ─────────────── ►  vs Actuals per Head                 │
                        └────────────────────────────────────────┘
```

**Every money event — income or expense — posts between exactly two Account Heads. No money appears from nowhere. No money disappears. The Bank Head's running balance reconciles to the real bank statement.**

---

## 2. Module Map — Who Produces Money Events

| Module      | Sub-Module             | Money-In Events       | Money-Out Events                    | Liability Events                 |
| ----------- | ---------------------- | --------------------- | ----------------------------------- | -------------------------------- |
| **Finance** | Fee Collection         | Fee receipt finalised | —                                   | —                                |
| **Finance** | Charges                | Charge collected      | —                                   | —                                |
| **Finance** | Income Tracking        | Manual income entry   | —                                   | —                                |
| **Finance** | Expense Tracking       | —                     | Manual expense entry                | —                                |
| **Finance** | Refund                 | —                     | Refund disbursed                    | Refund approved (payable)        |
| **Finance** | Concession             | —                     | Paid-fee concession (contra income) | CreditNote/Wallet raised         |
| **Finance** | Proration              | —                     | —                                   | — (demand reduction, no posting) |
| **Finance** | Budget                 | —                     | —                                   | Budget targets per head          |
| **Finance** | Reconciliation         | —                     | —                                   | Clears in-transit items          |
| **HR**      | Payroll Lock           | —                     | Salary + Employer PF expense        | PF/TDS/PT/Salary Payable         |
| **HR**      | Salary Disbursement    | —                     | Net pay to employees (Bank out)     | Clears Salary Payable            |
| **HR**      | Statutory Disbursement | —                     | PF/TDS/PT to govt (Bank out)        | Clears statutory Payables        |

---

## 3. The Four Account Head Types

### 3.1 Head Type Reference

| Head Type     | Nature        | Money IN does      | Reversal does          | Live Examples                                                                                                    |
| ------------- | ------------- | ------------------ | ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Income**    | Credit-nature | Balance ↑          | Balance ↓              | Tuition Fee Income, Transport Fee, Lab Fee, Hostel Fee, Exam Fee, Late-Fee Income, Donation Income, Grant Income |
| **Expense**   | Debit-nature  | Balance ↑          | Balance ↓              | Salary & Wages, Employer PF Expense, Refund Expense, Vendor Expense, Utility Expense, Maintenance, Bank Charges  |
| **Bank/Cash** | Asset-nature  | Balance ↑          | Balance ↓              | HDFC Operating A/c, SBI Salary A/c, Petty Cash, Gateway Settlement A/c, Cash in Hand                             |
| **Liability** | Credit-nature | Balance ↑ (owed ↑) | Balance ↓ when settled | PF Payable, TDS Payable, PT Payable, Salary Payable, Refund Payable, Student Wallet/Fee Advance, Unearned Income |

### 3.2 The Two-Head Posting Rule

> **Every money event posts between exactly two Account Heads.** One head gains, one head gives. This single rule is what makes balances trustworthy and reconciliation possible.

| Event Example                  | Head A                                  | Head B                                         | Net Effect        |
| ------------------------------ | --------------------------------------- | ---------------------------------------------- | ----------------- |
| Tuition collected ₹10,000      | Bank (HDFC) ↑10,000                     | Tuition Fee Income ↑10,000                     | money in          |
| Late fee collected ₹500        | Bank ↑500                               | Late-Fee Income ↑500                           | money in          |
| Payroll lock: gross ₹5L        | Salary Expense ↑5L                      | Salary Payable ↑4.7L + PF/TDS/PT Payable ↑0.3L | expense incurred  |
| Payroll lock: employer PF ₹30k | Employer PF Expense ↑30k                | PF Payable ↑30k (employer portion)             | liability raised  |
| Salary disbursed               | Salary Payable ↓4.7L                    | Bank ↓4.7L                                     | money out         |
| PF deposited govt              | PF Payable ↓60k                         | Bank ↓60k                                      | liability settled |
| Refund approved ₹2k            | Refund Payable ↑2k                      | — (no bank yet)                                | liability raised  |
| Refund disbursed               | Refund Payable ↓2k + Refund Expense ↑2k | Bank ↓2k                                       | money out         |
| Concession (paid, CreditNote)  | Tuition Income ↓5k                      | Student Wallet ↑5k                             | income corrected  |

### 3.3 How Existing Entities Map to Heads

| Existing Entity                     | Maps To                          | How                                             |
| ----------------------------------- | -------------------------------- | ----------------------------------------------- |
| Fee Head (e.g. Tuition)             | 1 Income Head per Fee Head       | Configured in Fee Head settings; selector added |
| Charge Category (Exam, Lab, Bus)    | 1 Income Head per Category       | Configured in Charge Category settings          |
| Income Category (Donations, Grants) | 1 Income Head per Category       | Configured in Income Category settings          |
| Expense Category (Vendor, Utility)  | 1 Expense Head per Category      | Configured in Expense Category settings         |
| Bank Account (HDFC, SBI)            | 1 Bank Head per Account          | Auto-created when Bank Account is saved         |
| Payroll Earning Components          | Feed Salary & Wages Expense Head | Configured in Payroll Posting Configuration     |
| PF Deduction                        | PF Payable (Liability)           | Auto-resolved from payroll lock                 |
| TDS Deduction                       | TDS Payable (Liability)          | Auto-resolved from payroll lock                 |
| Professional Tax Deduction          | PT Payable (Liability)           | Auto-resolved from payroll lock                 |
| Student Wallet / Credit Note        | Student Wallet Head (Liability)  | Created on paid-fee concession approval         |

---

## 4. Complete Income Flow — Every Source

### 4.1 Fee Collection → Income

```
STEP 1 — Parent / Staff initiates payment
  Parent selects fees due → Fee Collection screen
  Chooses payment method: Cash · Cheque · DD · NEFT · UPI · Card
  Enters amount (full or partial)

STEP 2 — Receipt generated (EXISTING behaviour)
  System validates amount ≤ demand outstanding
  Receipt number assigned
  Demand reduced by collected amount

STEP 3 — AUTO-POSTING (NEW)
  For each fee head in the receipt:
    Bank Head (matching payment method) ↑ amount
    Fee Head's Income Head ↑ amount
  If late fee collected (policy considerAsIncome = ON):
    Bank Head ↑ late fee amount
    Late-Fee Income Head ↑ late fee amount  ← separate posting

STEP 4 — Gateway settlement (if online payment)
  At receipt:   Gateway Settlement Bank Head ↑ amount
  On T+1 payout: HDFC Bank Head ↑, Gateway Settlement Bank Head ↓

RESULT
  Income Head balance increases in real time
  Bank Head balance increases in real time
  Receipt references the posting(s) — drill-through enabled
```

**What each field controls at posting:**

| Receipt Field                    | Effect on Posting                                                     |
| -------------------------------- | --------------------------------------------------------------------- |
| Fee Head (e.g. Tuition)          | Resolves the target Income Head                                       |
| Payment Method (Cash/UPI/NEFT/…) | Resolves the Bank/Cash Head                                           |
| Amount                           | Posting amount                                                        |
| Late Fee applied                 | Additional posting to Late-Fee Income Head (if `considerAsIncome` ON) |
| Academic Year                    | Scopes the Income Head balance to AY                                  |

### 4.2 Charges → Income

Same rule as Fee Collection. Each Charge Category (Exam, Lab, Bus) maps to one Income Head. Charge collection triggers the same auto-posting. Refundable charges carry a flag that enables the refund path later.

### 4.3 Manual Income Entry → Income

Used for donations, grants, other non-fee income.

```
Finance staff opens Income Tracking → Add Entry
  Category selected (e.g. "Donations")  → auto-resolves Income Head
  Payment Method selected               → auto-resolves Bank Head
  Amount entered
  Date entered
  Notes / document attached
  → SAVE → auto-post: Bank ↑, Income Head ↑
```

### 4.4 Income Head Dashboard (live)

Every income head shows:

- Running Balance (all postings)
- Month-to-date and Year-to-date
- Drill-down: each posting → source receipt / charge / manual entry
- Comparison vs Budget (if budget entered)

---

## 5. Complete Expense & Liability Flow — Every Source

### 5.1 Manual Expense Entry → Expense

```
Finance staff opens Expense Tracking → Add Entry
  Category selected (e.g. "Utilities") → auto-resolves Expense Head
  Payment Method selected               → auto-resolves Bank Head
  Amount entered
  Date entered
  Vendor / payee
  Notes / document
  → SAVE → auto-post: Expense Head ↑, Bank ↓
```

### 5.2 Refund → Expense / Liability

Detailed in §6.5. Short form:

- **Approval** → Refund Payable ↑ (liability raised, no bank movement)
- **Disbursement** → Refund Payable ↓ + (Refund Expense ↑ OR Income Head ↓) + Bank ↓

### 5.3 Payroll → Expense + Payables

Full detail in §7. Short form:

- **Lock** → Salary Expense ↑ + Employer PF Expense ↑ + PF/TDS/PT Payable ↑ + Salary Payable ↑
- **Salary Disbursement** → Salary Payable ↓ + Bank ↓
- **Statutory Disbursement** → PF/TDS/PT Payable ↓ + Bank ↓

### 5.4 Liability Ageing Report

All Liability heads show an ageing report:

| Payable        | 0–30 days | 31–60 days | 61–90 days | 90+ days |
| -------------- | --------- | ---------- | ---------- | -------- |
| PF Payable     | ₹X        | ₹Y         | ₹Z         | ₹W       |
| TDS Payable    | …         | …          | …          | …        |
| PT Payable     | …         | …          | …          | …        |
| Refund Payable | …         | …          | …          | …        |
| Salary Payable | …         | …          | …          | …        |
| Student Wallet | …         | …          | …          | …        |

> Overdue PF/TDS/PT triggers a compliance alert visible on the Finance Dashboard and HR Dashboard.

---

## 6. Finance Policies — How Each Policy Drives Postings

### 6.1 Collection Policy → Income & Late-Fee Routing

The Collection Policy controls **how and when fees are collected**. Its key accounting-facing fields:

| Policy Field                     | What It Is                                                             | What It Must Do at Runtime                                                          | Current Status                  |
| -------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------- |
| `considerAsIncome` (on late fee) | Whether the late fee collected should appear as a separate income line | Routes late fee to **Late-Fee Income Head** instead of merging with main fee income | ❌ Field exists, never enforced |
| `lateFeeIncomeHead` (NEW)        | Which Income Head to post late fee to                                  | Target for late-fee posting                                                         | ❌ Does not exist               |
| Payment methods allowed          | Restricts payment options on the collection form                       | Restricts Bank Head options on posting                                              | 🟡 Partial                      |
| Instalment schedule              | Splits demand into due-date tranches                                   | Each instalment collected = one posting                                             | ✅ Demand exists                |

**Flow when late fee applied and collected:**

```
Policy: considerAsIncome = ON
Parent pays: principal ₹10,000 + late fee ₹200

AUTO-POST:
  Bank ↑10,200
  Tuition Fee Income ↑10,000    ← fee portion
  Late-Fee Income ↑200          ← late-fee on separate head

Policy: considerAsIncome = OFF
  Bank ↑10,200
  Tuition Fee Income ↑10,200    ← late fee merged, no separate tracking
```

### 6.2 Late-Fee Policy → Income Head

The Late-Fee Policy defines the fine structure. Its accounting integration:

| Policy Field                   | What It Controls       | Posting Impact                                        |
| ------------------------------ | ---------------------- | ----------------------------------------------------- |
| Fine type (flat/percent/daily) | Calculates fine amount | The amount that posts to Late-Fee Income              |
| Grace period (days)            | When fine starts       | No posting before grace expires                       |
| Escalation rules               | Tiered fines over time | Each escalation tier posts separately with tier label |
| `lateFeeIncomeHead`            | Target Income Head     | Where fine income lands                               |
| Maximum cap                    | Upper limit on fine    | Posting amount capped                                 |

### 6.3 Proration Policy → Demand Reduction (no direct posting)

The Proration Policy reduces demand for mid-year admissions. It does **not create income postings** — it reduces the **demand** so that when the prorated fee is collected, only the prorated amount posts as income.

| Policy Field                      | What It Controls             | Accounting Impact                                     |
| --------------------------------- | ---------------------------- | ----------------------------------------------------- |
| Proration method (daily/monthly)  | How demand is calculated     | Sets the amount that will become income on collection |
| Fee Heads excluded from proration | Which heads get full fee     | Those heads post full income on collection            |
| Admission date                    | Calculation start point      | Determines prorated fraction                          |
| Academic Year boundary            | Whether partial months count | Affects calculation                                   |

**Accounting audit requirement:** When proration is applied, a **proration adjustment record** is saved against the fee head:

```
Fee Head: Tuition
Full Amount: ₹12,000
Prorated To: ₹4,400  (11 days in July + remaining months)
Reason: Mid-year admission, joined 2026-07-20, monthly rule applied
Rule Used: Monthly (Proration Policy ID: xyz)
```

This record appears in the Income Head's detail view as an annotation — it explains the gap between "full fee" and "actual demand collected."

### 6.4 Concession Policy → Contra Income / Liability

The Concession Policy's fields **must be wired at runtime** to drive postings. Today they are inert. The intended behaviour:

#### 6.4.1 Pending-Fee Concession (fee not yet collected)

```
Student owes ₹10,000 tuition. Concession approved for ₹2,000.
→ Demand reduced to ₹8,000.
→ NO POSTING. Nothing was collected; nothing to reverse.
→ When ₹8,000 is later collected: Income Head ↑8,000 (correct amount). ✅
```

#### 6.4.2 Paid-Fee Concession — CreditNote / StudentWallet

```
Student already paid ₹10,000. Concession approved ₹2,000 as CreditNote.
→ AUTO-POST:
    Tuition Fee Income     ↓2,000  (contra — income corrected)
    Student Wallet/Advance ↑2,000  (liability — school owes student)
→ Next term: wallet applied to new fees:
    Student Wallet/Advance ↓2,000
    (demand already reduced; no double-posting)
Net: Income correctly reflects ₹8,000 tuition. ✅
```

#### 6.4.3 Paid-Fee Concession — Refund

```
Student already paid. Concession → Refund mode.
→ Behaves exactly like a Refund (see §6.5).
→ Refund Payable raised, then cleared on disbursement.
```

#### 6.4.4 Paid-Fee Concession — ManualDecision

Finance must explicitly choose one of the above paths. No silent default. A modal appears requiring selection before the concession is approved.

#### 6.4.5 Late-Fee Behaviour on Concession

| Policy Setting  | Accounting Effect                      |
| --------------- | -------------------------------------- |
| `RemoveLateFee` | Late-Fee Income Head ↓ (contra posted) |
| `KeepLateFee`   | No change to Late-Fee Income Head      |
| `WaiveLateFee`  | Same as Remove — contra posted         |

#### 6.4.6 Concession Policy Field → Accounting Wire

| Policy Field                                                                             | Must Drive                           | Runtime State |
| ---------------------------------------------------------------------------------------- | ------------------------------------ | ------------- |
| `paidFeeAdjustment` (Refund/CreditNote/StudentWallet/ManualDecision/FutureFeeAdjustment) | Which posting path executes          | ❌ Inert      |
| `pendingFeeHandling` (ReduceDemand/WriteOff)                                             | Whether demand is cut or written off | ❌ Inert      |
| `lateFeeBehaviour` (RemoveLateFee/KeepLateFee)                                           | Whether late-fee income is contra'd  | ❌ Inert      |
| `receiptBehaviour` (ReverseOriginal/KeepOriginal)                                        | Whether original receipt is contra'd | ❌ Inert      |
| `approvalWorkflow`                                                                       | Who approves before posting fires    | 🟡 Partial    |

### 6.5 Refund Policy → Expense / Liability

The Refund Policy defines SLAs, compliance codes, and expense treatment. All fields must drive actual postings:

#### 6.5.1 Complete Refund Flow

```
STEP 1 — Refund Request Created
  Parent submits refund request
  Refund Policy evaluated: eligible fee heads, refundable flag
  Request enters approval queue

STEP 2 — Finance Reviews
  bankDetailsRequired = true → verify parent bank details
  Policy refundDueWithin → SLA clock starts on Refund Payable ageing

STEP 3 — Approval
  Approver approves
  AUTO-POST: Refund Payable ↑ approved amount
  No bank movement yet
  Refund Payable appears in ageing report

STEP 4 — Disbursement (NEFT/bank transfer)
  Finance triggers payout
  AUTO-POST (depends on considerAsExpense):

    considerAsExpense = ON:
      Refund Payable ↓ amount
      Refund Expense  ↑ amount
      Bank            ↓ amount

    considerAsExpense = OFF (contra):
      Refund Payable ↓ amount
      Income Head     ↓ amount  ← income corrected, not expensed
      Bank            ↓ amount

STEP 5 — Late-Fee Clawback (if applicable)
  If refunded fee had late fee collected:
  AUTO-POST: Late-Fee Income ↓ late fee amount

STEP 6 — governmentComplianceCode
  Posted as reference note on the disbursement posting
```

#### 6.5.2 Refund Policy Field → Accounting Wire

| Policy Field                   | What It Must Drive                                               | Current State               |
| ------------------------------ | ---------------------------------------------------------------- | --------------------------- |
| `considerAsExpense` (bool)     | Whether disbursement posts to Expense Head or contra Income Head | ❌ Editable, never enforced |
| `governmentComplianceCode`     | Reference on disbursement posting                                | ❌ Not used                 |
| `refundDueWithin` (days)       | SLA clock on Refund Payable ageing                               | ❌ Not enforced             |
| `bankDetailsRequired` (bool)   | Gate on disbursement — blocks if bank details missing            | ❌ Not enforced             |
| `refundExpenseHead` (NEW)      | Target Expense Head when considerAsExpense=true                  | ❌ Does not exist           |
| `refundPayableHead` (NEW)      | Liability Head for approved-not-disbursed refunds                | ❌ Does not exist           |
| `lateFeeClawback` toggle (NEW) | Whether late-fee income is reversed on refund                    | ❌ Does not exist           |

---

## 7. HR → Payroll → Finance — Full Integration

### 7.1 Payroll Cycle Overview

```
HR Admin              Payroll Operator           Finance Team
    │                       │                         │
[1] Employee            [3] Salary               [7] Payroll
    Onboarded               Structure                 Posting Config
    & Profiled              Assigned                  (heads mapped)
    │                       │                         │
[2] Attendance          [4] Run Payroll               │
    Locked                  Preview & Adjust           │
    (pay basis)             │                          │
                        [5] Payroll LOCK              │
                            │  ──────────────────────►│
                            │   AUTO-POST:            │
                            │   Salary Expense ↑      │
                            │   Employer PF Exp ↑     │
                            │   Salary Payable ↑      │
                            │   PF/TDS/PT Payable ↑   │
                            │                         │
                        [6] Payslips            [8] Finance
                            Generated                 Disburses Salary
                                                       AUTO-POST:
                                                       Salary Payable ↓
                                                       Bank ↓
                                                       │
                                                  [9] Statutory
                                                      Disbursement
                                                      AUTO-POST:
                                                      PF/TDS/PT ↓
                                                      Bank ↓
                                                       │
                                                  [10] Reconcile
                                                       Bank Head ✅
```

### 7.2 Payroll Lock — Detailed Postings

When the Payroll Operator clicks **Lock** for a payroll run:

```
Payroll Run: July 2026 | Employee: Ravi Kumar
Gross Salary:     ₹50,000
Employee PF:      ₹ 1,800  (deducted from gross)
Employee TDS:     ₹ 2,000  (deducted from gross)
Employee PT:      ₹   200  (deducted from gross)
Net Pay:          ₹46,000
Employer PF:      ₹ 1,800  (school's contribution, on top of gross)

POSTING A: Salary Expense Recognised
  Salary & Wages Expense       ↑50,000   (debit)
  Employer PF Expense          ↑ 1,800   (debit)
  Salary Payable               ↑46,000   (credit — net to pay employee)
  PF Payable (emp + employer)  ↑ 3,600   (credit — ₹1,800 × 2)
  TDS Payable                  ↑ 2,000   (credit)
  PT Payable                   ↑   200   (credit)

Net:
  Total expense recognised = ₹51,800 (gross + employer PF)
  Salary Payable = ₹46,000 (cleared on salary disbursement)
  Statutory Payables = ₹5,800 (cleared on statutory disbursement)
```

**Month-level consolidation:** All individual payslip postings are aggregated into one batch posting per run — but each line references the individual payslip for drill-through.

### 7.3 Salary Disbursement

Finance initiates the NEFT payout run for the month:

```
Finance: Payroll → Disbursements → Run NEFT
  Select bank account (e.g. SBI Salary A/c)
  System shows: ₹46,000 × N employees = total net pay

  On Confirm:
    AUTO-POST:
      Salary Payable   ↓ total net pay
      Bank (SBI)       ↓ total net pay
  Payslip status: Finalized → Paid
```

**NEFT Bounce handling:**

```
Bank returns bounce for one employee:
  AUTO-POST REVERSAL:
    Bank (SBI)       ↑ bounced amount   ← money back
    Salary Payable   ↑ bounced amount   ← liability restored
  Payslip status: reverts to Finalized (not Paid)
  Alert raised for HR + Finance
  Retry triggers a fresh disbursement posting
```

### 7.4 Statutory Disbursements (PF / TDS / PT)

These are separate, scheduled transactions to the government — not part of the salary run.

```
PROVIDENT FUND (monthly, by 15th of following month)
  Finance: Accounts → Statutory → Deposit PF for July 2026
  Amount: PF Payable balance for July
  On Confirm:
    PF Payable  ↓ total
    Bank        ↓ total
  EPFO challan reference saved on posting

TDS (quarterly / monthly per applicable rule)
  Finance: Accounts → Statutory → Deposit TDS for Q1
  On Confirm:
    TDS Payable ↓ total
    Bank        ↓ total
  Challan number saved on posting

PROFESSIONAL TAX (monthly/yearly per state rule)
  Finance: Accounts → Statutory → Deposit PT for July 2026
  On Confirm:
    PT Payable  ↓ total
    Bank        ↓ total
  State PT challan reference saved
```

> **Current gap:** TDS and Professional Tax settings are **commented out** in the HR menu (`/hr/payroll/setting/tds` and `/hr/payroll/setting/professional-tax` exist in code but are menu-hidden). These **must be re-enabled** for their payables to exist and be tracked.

### 7.5 Payroll → Finance: The Data Chain

Every finance posting from payroll carries these references for full drill-through:

| Reference         | Value             | Enables                                       |
| ----------------- | ----------------- | --------------------------------------------- |
| Payroll Run ID    | July-2026-AY2526  | Group all postings for the month              |
| Academic Year     | 2025–26           | Scope to correct year                         |
| Payslip ID        | UUID per employee | Drill from expense line to individual payslip |
| Employee ID       | UUID              | Filter by employee                            |
| Component Type    | Salary/PF/TDS/PT  | Filter by component in reports                |
| Posting Date      | Lock date         | Timeline on expense head                      |
| Disbursement Date | NEFT date         | Timeline on Bank head                         |

### 7.6 Payroll Posting Configuration Screen (NEW)

A required new settings screen: **Payroll → Settings → Finance Posting** (or **Accounts → Settings → Payroll Posting**).

| Field                             | Purpose                                       | Example                    |
| --------------------------------- | --------------------------------------------- | -------------------------- |
| Salary Expense Head               | Where gross salary posts on lock              | "Salary & Wages Expense"   |
| Employer PF Expense Head          | Where employer PF posts                       | "Employer PF Expense"      |
| Salary Payable Head               | Transient liability for net pay               | "Salary Payable"           |
| PF Payable Head                   | All PF until deposited to EPFO                | "PF Payable"               |
| TDS Payable Head                  | TDS until deposited (requires TDS re-enabled) | "TDS Payable"              |
| PT Payable Head                   | PT until deposited (requires PT re-enabled)   | "Professional Tax Payable" |
| Default Disbursement Bank Head    | Bank head for net salary NEFT                 | "SBI Salary A/c Head"      |
| Auto-post on lock                 | Immediate auto-post vs draft queue            | ON / OFF                   |
| Statutory alert (days before due) | Alert threshold for overdue payables          | 5                          |

**Validation:** All five Head selectors must be filled before Auto-post can be turned ON. If any is missing, payroll lock in Auto mode is blocked with an actionable error linking to this screen.

---

## 8. Form-Level Specifications — Every Screen That Matters

### 8.1 Account Head Master (NEW SCREEN)

**Location:** Finance → Accounts → Settings → Account Heads

**Purpose:** The master registry of all money buckets. Every other module resolves heads from here.

```
Account Heads                                        [+ Add Head]
┌──────────────────────────────────────────────────────────────┐
│ Filter: [All Types ▼]  [All Status ▼]  [Search...]          │
├────────────┬────────────┬────────────┬───────────┬──────────┤
│  Name      │    Code    │    Type    │  Balance  │  Status  │
├────────────┼────────────┼────────────┼───────────┼──────────┤
│ Tuition    │ INC-TUIT   │ Income     │ ₹4,20,000 │ Active   │
│ Salary     │ EXP-SAL    │ Expense    │₹15,00,000 │ Active   │
│ HDFC       │ BNK-HDFC   │ Bank/Cash  │ ₹8,50,000 │ Active   │
│ PF Payable │ LIA-PFPY   │ Liability  │ ₹60,000   │ Active   │
└────────────┴────────────┴────────────┴───────────┴──────────┘
```

**Add / Edit Head Drawer Fields:**

| Field           | Type                                                                                                                      | Required | Notes                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------ |
| Head Name       | Text                                                                                                                      | ✅       | e.g. "Tuition Fee Income"                  |
| Head Code       | Text (auto-suggest)                                                                                                       | ✅       | e.g. "INC-TUIT" — must be unique           |
| Head Type       | Select: Income / Expense / Bank-Cash / Liability                                                                          | ✅       | Determines balance direction               |
| Nature          | Read-only (derived from Type)                                                                                             | —        | Credit / Debit / Asset                     |
| Linked Source   | Multi-select: Fee Head / Charge Category / Income Category / Expense Category / Bank Account / Payroll Component / Manual | ✅       | What entity(ies) post to this head         |
| Opening Balance | Number                                                                                                                    | —        | For migration only                         |
| Notes           | Text                                                                                                                      | —        | Internal notes                             |
| Active          | Toggle                                                                                                                    | ✅       | Archived heads cannot receive new postings |

**Validation rules:**

- Head Code must be unique system-wide
- Bank/Cash type can only link to Bank Account entities
- One Income Head per Fee Head (uniqueness enforced)
- Liability heads for statutory items (PF/TDS/PT) cannot be linked to non-payroll sources

### 8.2 Fee Head — Add Income Head Mapping (MODIFY)

**Location:** Finance → Settings → Fee Head

**New Fields to Add:**

| Field       | Type                                  | Required | Notes                                         |
| ----------- | ------------------------------------- | -------- | --------------------------------------------- |
| Income Head | Select from Income-type Account Heads | ✅       | The head this fee's collection posts to       |
| Refundable  | Toggle                                | ✅       | If off, refund requests blocked for this head |

### 8.3 Charge Category — Add Income Head Mapping (MODIFY)

**Location:** Finance → Settings → Charge Category

| New Field     | Type                          | Required | Notes                     |
| ------------- | ----------------------------- | -------- | ------------------------- |
| Income Head   | Select from Income-type heads | ✅       | Same as Fee Head mapping  |
| Is Refundable | Toggle                        | ✅       | Already exists — preserve |

### 8.4 Income Category — Add Head Mapping (MODIFY)

**Location:** Finance → Settings → Income Categories

| New Field   | Type                          | Required | Notes                                |
| ----------- | ----------------------------- | -------- | ------------------------------------ |
| Income Head | Select from Income-type heads | ✅       | Auto-resolves on manual income entry |

### 8.5 Expense Category — Add Head Mapping (MODIFY)

**Location:** Finance → Settings → Expense Categories

| New Field    | Type                           | Required | Notes                                 |
| ------------ | ------------------------------ | -------- | ------------------------------------- |
| Expense Head | Select from Expense-type heads | ✅       | Auto-resolves on manual expense entry |

### 8.6 Income Tracking — Entry Form (MODIFY)

**Location:** Finance → Income Tracking → Add Entry

Keep all existing fields; add auto-resolution:

| Field                                    | Status      | Notes                                            |
| ---------------------------------------- | ----------- | ------------------------------------------------ |
| Category                                 | ✅ Existing | Now auto-resolves Income Head                    |
| Tags                                     | ✅ Existing | For grouping                                     |
| Amount                                   | ✅ Existing | Posting amount                                   |
| Payment Method                           | ✅ Existing | Now auto-resolves Bank/Cash Head                 |
| Payment Date                             | ✅ Existing | Posting date                                     |
| Notes / Document                         | ✅ Existing | Audit                                            |
| **Account Head** (resolved, read-only)   | ❌ NEW      | Shown: "Donation Income" — derived from category |
| **Bank/Cash Head** (resolved, read-only) | ❌ NEW      | Shown: "HDFC A/c" — derived from payment method  |
| Posting Status                           | ❌ NEW      | Auto / Draft / Manual — per automation settings  |

**On Save:** system posts Bank Head ↑, Income Head ↑ atomically. If automation is set to Draft, posting enters the draft queue instead.

### 8.7 Expense Tracking — Entry Form (MODIFY)

**Location:** Finance → Expense Tracking → Add Entry

| Field                                    | Status      | Notes                            |
| ---------------------------------------- | ----------- | -------------------------------- |
| Category                                 | ✅ Existing | Now auto-resolves Expense Head   |
| Tags                                     | ✅ Existing |                                  |
| Amount                                   | ✅ Existing | Posting amount                   |
| Payment Method                           | ✅ Existing | Now auto-resolves Bank/Cash Head |
| Payment Date                             | ✅ Existing | Posting date                     |
| Vendor / Payee                           | ✅ Existing | Audit                            |
| Notes / Document                         | ✅ Existing | Audit                            |
| **Expense Head** (resolved, read-only)   | ❌ NEW      | Derived from category            |
| **Bank/Cash Head** (resolved, read-only) | ❌ NEW      | Derived from payment method      |

### 8.8 Collection Policy Form — Accounting Fields (MODIFY)

**Location:** Finance → Policies → Collection Policy

| New / Modified Field           | Type                          | What It Drives                               |
| ------------------------------ | ----------------------------- | -------------------------------------------- |
| `considerAsIncome` (late fee)  | Toggle — already exists       | If ON: separate Late-Fee Income Head posting |
| **Late-Fee Income Head** (NEW) | Select Income Head            | Target head when `considerAsIncome = ON`     |
| Payment Method Restriction     | Multi-select — already exists | Restricts Bank Head options at collection    |

### 8.9 Late-Fee Policy Form — Accounting Fields (MODIFY)

**Location:** Finance → Policies → Late Fee Policy

| New Field                             | Type               | What It Drives                                            |
| ------------------------------------- | ------------------ | --------------------------------------------------------- |
| **Late-Fee Income Head**              | Select Income Head | Overrides Collection Policy head for this specific policy |
| **Maximum Fine Cap**                  | Number             | Caps posting amount                                       |
| Fine computation (flat/percent/daily) | Already exists     | Determines posting amount                                 |

### 8.10 Concession Policy Form — Accounting Fields (MODIFY)

**Location:** Finance → Policies → Concession

| Field                 | Status                | What It Must Drive at Runtime                                                                                    |
| --------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `paidFeeAdjustment`   | ❌ Inert              | Path selector: Refund → refund flow; CreditNote/StudentWallet → wallet liability; ManualDecision → user prompted |
| `pendingFeeHandling`  | ❌ Inert              | ReduceDemand = no posting; WriteOff = expense posting                                                            |
| `lateFeeBehaviour`    | ❌ Inert              | RemoveLateFee = contra Late-Fee Income Head                                                                      |
| `receiptBehaviour`    | ❌ Inert              | ReverseOriginal = contra original receipt income posting                                                         |
| **Wallet Head** (NEW) | Select Liability Head | Target head when paidFeeAdjustment = StudentWallet/CreditNote                                                    |

### 8.11 Refund Policy Form — Accounting Fields (MODIFY)

**Location:** Finance → Policies → Refund Policy

| Field                              | Status                | What It Must Drive                                             |
| ---------------------------------- | --------------------- | -------------------------------------------------------------- |
| `considerAsExpense`                | ❌ Inert              | If ON: Refund Expense Head posting; If OFF: Income Head contra |
| `governmentComplianceCode`         | ❌ Not used           | Saved as posting reference/note                                |
| `refundDueWithin` (days)           | ❌ Not enforced       | Sets ageing SLA on Refund Payable                              |
| `bankDetailsRequired`              | ❌ Not enforced       | Blocks disbursement if bank details absent                     |
| **Refund Expense Head** (NEW)      | Select Expense Head   | Required when `considerAsExpense = ON`                         |
| **Refund Payable Head** (NEW)      | Select Liability Head | Where approved-not-disbursed refunds sit                       |
| **Late-Fee Clawback** toggle (NEW) | Toggle                | Reverse Late-Fee Income on refund?                             |

### 8.12 Payroll Posting Configuration (NEW SCREEN)

**Location:** Payroll → Settings → Finance Posting

| Field                             | Type                  | Required | Notes                                         |
| --------------------------------- | --------------------- | -------- | --------------------------------------------- |
| Salary Expense Head               | Select Expense Head   | ✅       | Where gross salary posts on lock              |
| Employer PF Expense Head          | Select Expense Head   | ✅       | Where employer PF posts                       |
| Salary Payable Head               | Select Liability Head | ✅       | Transient liability for net pay               |
| PF Payable Head                   | Select Liability Head | ✅       | All PF until deposited to EPFO                |
| TDS Payable Head                  | Select Liability Head | ✅       | TDS until deposited (requires TDS re-enabled) |
| PT Payable Head                   | Select Liability Head | ✅       | PT until deposited (requires PT re-enabled)   |
| Default Disbursement Bank Head    | Select Bank Head      | ✅       | For net salary NEFT                           |
| Auto-post on lock                 | Toggle                | ✅       | ON = immediate; OFF = draft queue             |
| Statutory alert (days before due) | Number                | —        | Alert threshold for overdue payables          |

### 8.13 Bank Account Master — Link to Head (MODIFY)

**Location:** Finance → Settings → Bank Account Management

**New behaviour:** When a Bank Account is saved, the system **auto-creates** a Bank/Cash Account Head for it:

- Head Name: `[Bank Name] - A/c ****[last 4 digits]`
- Head Code: `BNK-[auto]`
- Head Type: Bank/Cash
- Linked Source: This Bank Account

The "Linked Head" field appears on the Bank Account row as read-only after first save.

### 8.14 Reconciliation Screen (REPURPOSE)

**Location:** Finance → Reconciliation

Transform from standalone tracker to **head-based reconciliation**:

| Control                            | Purpose                                   | Current State     |
| ---------------------------------- | ----------------------------------------- | ----------------- |
| Bank Head selector                 | Choose which bank account to reconcile    | ❌ Not head-based |
| Date range                         | Statement period                          | ✅ Exists         |
| Statement import                   | Upload CSV or enter lines manually        | 🟡 Partial        |
| Book Balance                       | All postings on this head in period       | ❌ New            |
| Reconciled Balance                 | Only statement-matched postings           | ❌ New            |
| Difference                         | In-transit items                          | ❌ New            |
| Match / Unmatch                    | Per-transaction status                    | ❌ New            |
| Create posting from statement line | For bank charges / interest not in system | ❌ New            |
| In-Transit list                    | Postings not yet on statement             | ❌ New            |

### 8.15 Finance Dashboard — Head Balances (MODIFY)

**Location:** Finance → Dashboard

Add a **Heads Overview** section:

| Widget                | Shows                                                   |
| --------------------- | ------------------------------------------------------- |
| Income Summary        | Top 5 Income Heads by balance, month and YTD, vs budget |
| Expense Summary       | Top 5 Expense Heads, month and YTD, vs budget           |
| Bank Balances         | All Bank Heads with book balance and reconciled balance |
| Liability Alerts      | Overdue PF/TDS/PT Payable, Refund Payable aging         |
| Pending Disbursements | Salary Payable + Refund Payable outstanding             |
| Draft Postings Queue  | Count of postings awaiting finance review               |

---

## 9. Automation Rules — Complete Trigger Table

Every automation rule is **gated behind a per-event toggle**: Auto-post / Draft / Off.

| #       | Module             | Trigger Event                                        | Auto-Action                                          | Heads Touched                                                                  | Prerequisite                                              |
| ------- | ------------------ | ---------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------- |
| **A1**  | Fee Collection     | Receipt finalised                                    | Post fee income                                      | Bank Head ↑, Fee Income Head ↑                                                 | Fee Head → Income Head mapping                            |
| **A2**  | Fee Collection     | Late fee applied & collected                         | Post late-fee income (if `considerAsIncome` ON)      | Bank ↑, Late-Fee Income Head ↑                                                 | Collection Policy wired, Late-Fee Head configured         |
| **A3**  | Charges            | Charge collected                                     | Post charge income                                   | Bank ↑, Charge Income Head ↑                                                   | Charge Category → Income Head mapping                     |
| **A4**  | HR Payroll         | Payroll **locked**                                   | Post salary expense + statutory payables             | Salary Expense ↑, Employer PF Expense ↑, Salary Payable ↑, PF/TDS/PT Payable ↑ | Payroll Posting Config filled                             |
| **A5**  | HR Payroll         | Salary **disbursed** (NEFT run)                      | Clear salary payable, bank out, payslip → Paid       | Salary Payable ↓, Bank ↓                                                       | Disbursement Bank Head set                                |
| **A6**  | HR Payroll         | Statutory **disbursement** (PF/TDS/PT to govt)       | Clear statutory payable, bank out                    | PF/TDS/PT Payable ↓, Bank ↓                                                    | TDS + PT re-enabled in HR menu                            |
| **A7**  | Finance Refund     | Refund **approved**                                  | Raise refund payable                                 | Refund Payable ↑                                                               | Refund Payable Head configured                            |
| **A8**  | Finance Refund     | Refund **disbursed**                                 | Clear payable, post expense or contra, bank out      | Refund Payable ↓, (Expense ↑ or Income ↓), Bank ↓                              | Refund Expense Head configured, `considerAsExpense` wired |
| **A9**  | Finance Refund     | Refund of fee with late fee                          | Reverse late-fee income                              | Late-Fee Income ↓                                                              | `lateFeeClawback` toggle wired                            |
| **A10** | Finance Concession | Paid-fee concession **approved** (CreditNote/Wallet) | Contra income, raise wallet liability                | Income Head ↓, Student Wallet ↑                                                | Concession Policy wired, Wallet Head configured           |
| **A11** | Finance Concession | Wallet/advance **applied** to new fee                | Clear wallet liability                               | Student Wallet ↓                                                               | A10 prerequisite met                                      |
| **A12** | Finance Concession | Pending-fee concession approved                      | Reduce demand only — no posting                      | —                                                                              | None                                                      |
| **A13** | Admission          | Proration applied at admission                       | Record adjustment reason on fee head — no posting    | —                                                                              | None                                                      |
| **A14** | Income/Expense     | Manual income/expense entry saved                    | Post to category head + bank                         | Income/Expense Head ↑, Bank ↑/↓                                                | Category → Head mapping                                   |
| **A15** | Fee Collection     | Gateway settlement received                          | Internal bank-to-bank transfer                       | Gateway Settlement Bank ↓, Operating Bank ↑                                    | Gateway Bank Head configured                              |
| **A16** | HR Payroll         | NEFT bounce received                                 | Reverse disbursement posting, restore Salary Payable | Bank ↑, Salary Payable ↑                                                       | Disbursement reversal flow                                |
| **A17** | Finance            | Cheque issued, not yet encashed                      | Mark Bank Head posting as in-transit                 | Bank ↓ (in-transit flag)                                                       | Reconciliation in-transit logic                           |

### 9.1 Draft Posting Queue

When any automation rule fires in Draft mode:

```
Draft Postings Queue (Finance → Accounts → Draft Postings)
┌─────────┬────────────┬──────────────────────┬──────────┬───────────┐
│  Rule   │  Date      │  Description         │  Amount  │  Action   │
├─────────┼────────────┼──────────────────────┼──────────┼───────────┤
│  A1     │ 2026-07-03 │ Receipt #R0124        │ ₹10,000  │ [Approve] │
│  A4     │ 2026-07-01 │ July Payroll Lock     │ ₹5,30,000│ [Approve] │
│  A7     │ 2026-07-02 │ Refund Request #456   │ ₹2,000   │ [Approve] │
└─────────┴────────────┴──────────────────────┴──────────┴───────────┘
Finance can Approve All, Approve individually, or Reject with reason.
```

---

## 10. Role-Based Flows — Who Does What

### 10.1 Finance Admin

| Task                          | Screen                               | What Fires              |
| ----------------------------- | ------------------------------------ | ----------------------- |
| Configure Account Heads       | Accounts → Settings → Account Heads  | Master registry updated |
| Map categories to heads       | Finance → Settings (each category)   | Head resolution ready   |
| Configure payroll posting     | Payroll → Settings → Finance Posting | A4–A6 enabled           |
| Approve draft postings        | Accounts → Draft Postings            | Postings finalised      |
| Disburse salary               | Payroll → Disbursements              | A5 fires                |
| Deposit statutory (PF/TDS/PT) | Accounts → Statutory                 | A6 fires                |
| Reconcile bank                | Finance → Reconciliation             | In-transit cleared      |
| Approve refund + disburse     | Finance → Refunds                    | A7 + A8 fire            |
| Review liability ageing       | Accounts → Reports → Payables Ageing | Alert review            |

### 10.2 HR Admin / Payroll Operator

| Task                     | Screen                             | What Fires in Finance           |
| ------------------------ | ---------------------------------- | ------------------------------- |
| Run Payroll (preview)    | HR → Payroll → Run Payroll         | Nothing yet                     |
| Lock Payroll             | HR → Payroll → Lock                | A4 fires automatically          |
| Generate Payslips        | HR → Payroll → Payslip Generation  | Nothing additional              |
| View disbursement status | HR → Payroll → Payslips            | Shows Paid status from A5       |
| Configure TDS / PT       | HR → Payroll → Settings → TDS / PT | Enables A4 for these components |

### 10.3 Principal / Finance Manager

| Task                     | Screen                               | Value                     |
| ------------------------ | ------------------------------------ | ------------------------- |
| View income vs expense   | Finance Dashboard → Heads Overview   | Real-time head balances   |
| View payroll expense     | Finance Dashboard → Expense Summary  | Salary expense from A4    |
| View compliance payables | Finance Dashboard → Liability Alerts | PF/TDS/PT Payable ageing  |
| View bank position       | Finance Dashboard → Bank Balances    | Reconciled + book balance |
| Budget vs actuals        | Finance → Budget Management          | Per head comparison       |

### 10.4 School Accountant / Finance Operator

| Task                   | Screen                     | What Fires           |
| ---------------------- | -------------------------- | -------------------- |
| Enter manual income    | Finance → Income Tracking  | A14 fires            |
| Enter manual expense   | Finance → Expense Tracking | A14 fires            |
| Collect fees           | Finance → Fee Collection   | A1 + A2 fire         |
| Process refund request | Finance → Refund           | A7 fires on approval |
| Upload bank statement  | Finance → Reconciliation   | Matching begins      |

---

## 11. End-to-End Scenarios (Happy Paths + Edge Cases)

### 11.1 [Happy Path] Full Monthly Cycle

```
SETUP (one-time)
  Finance Admin configures Account Heads.
  Maps all fee heads, charge categories, income/expense categories, bank accounts to heads.
  HR configures payroll posting config with all five payable heads.

FEE COLLECTION (daily)
  Parents pay → receipts generated →
  A1: Tuition Income ↑, Bank ↑
  A2: Late-Fee Income ↑ (if applicable)

PAYROLL CYCLE (monthly)
  HR locks attendance → HR previews payroll → HR locks payroll
  A4: Salary Expense ↑, PF/TDS/PT Payable ↑, Salary Payable ↑
  Finance reviews draft postings → Approves
  Finance runs NEFT →
  A5: Salary Payable ↓, Bank ↓
  Finance deposits PF by 15th →
  A6: PF Payable ↓, Bank ↓
  Finance deposits TDS by 7th →
  A6: TDS Payable ↓, Bank ↓

RECONCILIATION (monthly)
  Finance uploads HDFC statement
  System auto-matches postings to statement lines
  In-transit items (cheques) flagged
  Bank charges → user creates posting → matched
  Reconciled balance = statement balance ✅

REPORTS (monthly/yearly)
  Income by head vs budget
  Salary expense by month
  Payables ageing
  Cash flow (bank heads over time)
```

### 11.2 Partial Fee Payment

```
Parent pays ₹6,000 of ₹10,000 due.
Demand: reduced by ₹6,000 → ₹4,000 still outstanding
Posting: Bank ↑6,000 | Tuition Income ↑6,000
Later: Parent pays remaining ₹4,000
Posting: Bank ↑4,000 | Tuition Income ↑4,000
Total income posted = ₹10,000 ✅
```

### 11.3 Refund with Late Fee Clawback

```
Parent paid ₹10,200 (₹10,000 tuition + ₹200 late fee)
Refund request for full amount. considerAsExpense = ON, lateFeeClawback = ON

On Approval: Refund Payable ↑10,200
On Disbursement:
  Refund Payable ↓10,200
  Refund Expense ↑10,000   (tuition portion)
  Late-Fee Income ↓200     (clawback — income reversed)
  Bank ↓10,200
Net: Late-Fee Income correctly ₹0 for this student ✅
```

### 11.4 Concession on Paid Fee (Credit Note) → Future Apply

```
July: Student paid ₹10,000 tuition. Concession approved ₹2,000 as CreditNote.
  → Tuition Income ↓2,000 | Student Wallet ↑2,000

August: ₹2,000 wallet applied to transport fee demand
  → Student Wallet ↓2,000
  → Transport demand net ₹0 for this component
Net: Income correctly ₹8,000 tuition + wallet cleared ✅
```

### 11.5 Payroll with NEFT Bounce

```
July payroll locked. Salary Payable = ₹4,70,000.
Finance runs NEFT. A5: Bank ↓4,70,000 | Salary Payable ↓4,70,000.
NEFT returns bounce for one employee: ₹46,000.
Reversal: Bank ↑46,000 | Salary Payable ↑46,000.
HR alerted. Employee payslip reverts to Finalized.
Retry NEFT for ₹46,000 after bank details corrected. A5 fires again. ✅
```

### 11.6 PF Never Deposited (Compliance Breach)

```
August: PF Payable = ₹60,000.
September 15 passes with no statutory disbursement.
September 16: Alert fires → PF Payable ageing shows 1 day overdue.
Finance Dashboard: Red alert badge on "PF Payable — OVERDUE 1 day".
HR Dashboard: Same alert visible to HR Admin.
Finance deposits on Sep 20: A6 fires, PF Payable ↓60,000, Bank ↓60,000.
Ageing record: 5-day breach recorded for compliance audit. ✅
```

### 11.7 Mid-Year Admission with Proration

```
Student joins July 20. Proration Policy: monthly rule.
Tuition July demand: ₹1,000 (prorated from ₹1,000/month).
Proration record: saved — "Joined July 20, monthly rule, ₹11,000 not demanded."
When ₹1,000 collected: Bank ↑1,000 | Tuition Income ↑1,000 (only prorated amount). ✅
Income Head detail annotation explains the gap.
```

### 11.8 Bank Charge Not in System

```
HDFC Statement shows ₹500 "Bank Charges" deducted.
No posting in system for this.
Reconciliation: flagged as "Unmatched — Statement only."
Finance clicks "Create Posting":
  Bank Charges Expense ↑500
  HDFC Bank Head ↓500
Posting created → item matched. Reconciled balance = statement balance. ✅
```

### 11.9 TDS / Professional Tax Currently Disabled

```
Today: TDS and PT menu items commented out in HR.
Impact: A4 cannot post TDS Payable or PT Payable on payroll lock.
Finance sees only PF Payable; TDS/PT invisible.

Fix needed:
1. HR re-enables /hr/payroll/setting/tds and /hr/payroll/setting/professional-tax in menu.
2. Finance configures TDS Payable Head and PT Payable Head in Payroll Posting Config.
3. From next payroll lock: A4 includes all three statutory payables.
```

### 11.10 Two Bank Accounts, Wrong One Selected

```
Cash collected but operator tagged UPI (wrong bank head).
Finance realises error within allowed edit window.
Finance: Edit Receipt → Change Payment Method to Cash.
System posts:
  REVERSAL: UPI Bank Head ↑ amount
  NEW POST: Cash Head ↑ amount
  Income Head: unchanged (same amount)
Both postings visible in audit trail. Receipt updated. ✅
```

---

## 12. What Must Be Built — Prioritised Change List

### 🔴 Critical (nothing else works without these)

| #   | Change                                                     | Why Critical                                                                                 | Modules Affected                                               |
| --- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| C1  | **Account Head Master + two-head posting engine**          | The backbone. Without it, no head, no balance, no posting.                                   | Accounts → Settings → Account Heads + posting service          |
| C2  | **Map all entities to heads**                              | Fee Heads, Charge Categories, Income/Expense Categories, Bank Accounts each point to a head. | Finance Settings across all category screens                   |
| C3  | **Fee Collection → Income auto-posting (A1, A2, A3)**      | Money-in becomes real accounting income.                                                     | Fee Collection receipt flow                                    |
| C4  | **Payroll → Expense + Payables auto-posting (A4, A5, A6)** | Salary visible in finance. Statutory payables tracked.                                       | HR Payroll lock + disbursement + Payroll Posting Config screen |

### 🟠 High (needed for completeness)

| #   | Change                                                   | Modules Affected                           |
| --- | -------------------------------------------------------- | ------------------------------------------ |
| H1  | **Re-enable TDS and Professional Tax in HR menu**        | HR menu (`hr-menus.ts`) + payroll settings |
| H2  | **Refund → Expense / Liability posting (A7, A8, A9)**    | Refund approval + disbursement flows       |
| H3  | **Wire Concession Policy at runtime (A10, A11)**         | Concession request/approval flow           |
| H4  | **Late-fee Income Head + Collection Policy wiring (A2)** | Collection Policy + late-fee engine        |
| H5  | **Head-based Bank Reconciliation**                       | Finance Reconciliation screen              |
| H6  | **Payroll NEFT bounce reversal (A16)**                   | Disbursement flow                          |

### 🟡 Medium (usability and reporting)

| #   | Change                                                     | Modules Affected                    |
| --- | ---------------------------------------------------------- | ----------------------------------- |
| M1  | **Auto-post / Draft / Off toggle per event type**          | Posting engine settings             |
| M2  | **Gateway Settlement Bank Head + internal transfer (A15)** | Fee Collection + Bank settings      |
| M3  | **Payable ageing report**                                  | Accounts → Reports                  |
| M4  | **Income/Expense entry form: auto head resolution (A14)**  | Income Tracking + Expense Tracking  |
| M5  | **Finance Dashboard: head balances + liability alerts**    | Finance Dashboard                   |
| M6  | **Proration adjustment audit on fee head (A13)**           | Proration engine + head detail view |
| M7  | **Drill-through: Expense Head line → Payslip**             | Finance Reports                     |

### 🟢 Low (scale and polish)

| #   | Change                                                     | Modules Affected                  |
| --- | ---------------------------------------------------------- | --------------------------------- |
| L1  | **Budget vs actuals per head** (route Budget screen first) | Budget Management                 |
| L2  | **Cost centres (branch/department)**                       | Later phase                       |
| L3  | **Policy-level RBAC for postings/heads**                   | Permissions model                 |
| L4  | **Statutory compliance calendar**                          | Finance → Statutory calendar view |

### Priority Decision Rule

> **If only four things ship, ship C1–C4.** With those four:
>
> - Fees flow in as income ✅
> - Payroll flows out as expense + payables ✅
> - Bank balances exist ✅
> - Statutory compliance is tracked ✅
>
> Every other change (H, M, L) builds on this foundation.

---

## 13. Glossary

| Term                             | Definition                                                                                                           |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Account Head**                 | A named money bucket with a running balance; one of Income, Expense, Bank/Cash, or Liability.                        |
| **Accounts Hub**                 | The Accounts sub-module as the financial center every module posts through.                                          |
| **Auto-posting**                 | An automatic accounting posting triggered by a business event without human action.                                  |
| **Bank Head**                    | A Bank/Cash-type Account Head; one per bank account; reconciles to the statement.                                    |
| **Book Balance**                 | The running balance on a Bank Head including all postings (matched and unmatched).                                   |
| **Category**                     | Existing flat tag on income/expense records; maps to (is not the same as) an Account Head.                           |
| **Contra / Reversal**            | A posting that undoes an earlier one while preserving the audit trail.                                               |
| **Disbursement**                 | The actual bank payout that settles a payable (salary NEFT, PF/TDS/PT deposit to govt).                              |
| **Draft Posting**                | A posting generated by automation but held for finance review before finalising.                                     |
| **Expense**                      | Money out; increases an Expense Head.                                                                                |
| **Head Type**                    | Income / Expense / Bank-Cash / Liability; determines balance direction.                                              |
| **Income**                       | Money in; increases an Income Head.                                                                                  |
| **In Transit**                   | A posting in the system not yet on the bank statement (e.g. uncleared cheque).                                       |
| **Late-Fee Clawback**            | The reversal of Late-Fee Income when the fee that incurred it is refunded.                                           |
| **Liability Head**               | A Credit-nature head for money owed but unpaid (PF/TDS/PT Payable, Refund Payable, Salary Payable, Student Wallet).  |
| **Linked Source**                | The entity a head represents (Fee Head, Category, Bank Account, Payroll Component).                                  |
| **Payable**                      | Money owed but unpaid; lives in a Liability Head until disbursed.                                                    |
| **Payroll Lock**                 | The HR action that finalises payroll for a month, creating stable payslip snapshots and triggering finance postings. |
| **Posting**                      | Recording a money movement between two Account Heads.                                                                |
| **Proration Adjustment**         | A recorded reason for reducing demand on mid-year admission; audit record only, no money posting.                    |
| **Reconciled Balance**           | The Bank Head balance counting only statement-matched postings.                                                      |
| **Reconciliation**               | Matching Bank Head transactions to the real bank statement.                                                          |
| **Running Balance**              | The current amount held by a head; updates with every posting.                                                       |
| **Statutory Components**         | PF, TDS, Professional Tax — deductions the school must remit to the government.                                      |
| **Student Wallet / Fee Advance** | A Liability Head for paid-fee concessions held as credit against future fees.                                        |
| **Two-Head Posting Rule**        | Every money event posts between exactly two Account Heads; money never appears or disappears.                        |

---

_End of Document | Last Updated: 2026-07-03_
_Companion: [accounts-master-product-flow.md](./accounts-master-product-flow.md)_
