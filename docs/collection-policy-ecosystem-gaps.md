# Fee Collection Policy Ecosystem — Additional Gaps

> **Purpose:** This document captures gaps that sit *around* Collection Policy — in the wider fee-collection policy ecosystem — that are needed for a genuinely complete, robust collection workflow across different kinds of schools.
>
> **Scope discipline:** This is a delta document. It deliberately does **not** repeat anything already covered by:
> - [`collection-policy-flow.md`](./collection-policy-flow.md) — technical flow/data model of Collection Policy itself
> - [`collection-policy-review-and-gaps.md`](./collection-policy-review-and-gaps.md) — Collection Policy's own runtime/cross-module/data-integrity gaps and school-workflow requirements (per-fee-head override, caps, bulk waiver, role-scoped waiver approval, parent transparency, reporting, versioning, multi-year continuity, simulation)
> - [`collection-policy-implementation-plan.md`](./collection-policy-implementation-plan.md) — how those gaps get built, phases 0–5
> - [`Collection_Policy_Design_Recommendations.md`](./Collection_Policy_Design_Recommendations.md) — the proposal that prompted this review
>
> Where this document's findings overlap with something already proposed in `Collection_Policy_Design_Recommendations.md`, it's included here only because codebase research surfaced a materially different picture than the proposal assumed (usually: "this already exists, broken, in two places" rather than "this doesn't exist yet"). Read this alongside the design recommendations doc, not instead of it.
>
> **Method:** Every claim below was verified against the actual codebase (file/line citations included) as of this writing, not inferred from the design doc alone.

---

## 1. The policy ecosystem has three overlapping owners of "payment behaviour," not one

This is the most consequential finding, because it changes how everything else in this document should be built.

The team already made one call correctly: `ILateFeePolicy` duplicates Collection Policy's late-fee fields and is being retired (`collection-policy-implementation-plan.md` §0, decision 1). The same disease exists — undiagnosed — one layer over, in *payment* behaviour, split across **three** places:

| Owner | File | Fields | Wired to runtime? |
|---|---|---|---|
| `IPaymentPolicy` | `finance-policy.types.ts:88-125` | `allowPartialPayment`, `minimumPaymentType/Value`, `allocationMethod` (incl. FIFO), `advancePaymentAllowed`, `advancePaymentMaxAmount`, `paymentModes` (cash/cheque/upi/card/neft/gateway + `cashLimit`), reminder rules, receipt rules | **No.** `PaymentPolicyDrawer.tsx:952` — the Formik `onSubmit` is a no-op (comment: "Handled manually by footer buttons"); persistence goes through `useCreateFinancePolicyMutation`/`useUpdateFinancePolicyMutation` (`redux/finance/financePolicy.ts:33,52`) to `/finance-policies`, an endpoint with no backend (verified: no matching entity/controller anywhere in `Shikshamitra-BE`). `FeeCollectionForm.tsx` has zero references to any of these fields. |
| `IPaymentTerm` / `IInstallment` | `PaymentTerm/type.ts:8-68` | `allowAdvancePayment`, `minAdvanceDays`, `maxAdvanceMonths`, `allowFullYearPayment`, `allowPartialInstallment`, `minPartialAmount/Percentage`, `holidayShiftingMethod`, per-installment `gracePeriod` and `lateFeePolicyId` | Partially — `PaymentTerm` has its own working redux slice (`redux/finance/paymentTerm.tsx`, distinct from the generic `financePolicy.ts`), but no backend entity for `PaymentTerm` was found either, so "working redux slice" doesn't mean "persists to a real record." |
| Collection Policy's allocation/FIFO reference | `collection-policy-flow.md` §3.1 | Fee Collection's `allocatePayment()` already does priority/FIFO allocation at collection time, independent of any of the above policy objects | Yes — this is the one part of "payment behaviour" that's actually live, and it isn't policy-driven at all; it's hardcoded allocation logic the policies above were presumably meant to configure. |

**Concrete duplication:** `allowAdvancePayment`/`advancePaymentAllowed`, `allowPartialInstallment`/`allowPartialPayment`, `minPartialAmount`/`minimumPaymentValue`, and reminder fields (`reminderDaysBefore`, `reminderFrequencyDays`, `reminderMaxCount`) are defined **twice**, once in `IPaymentPolicy` and once in `IPaymentTerm`, with no cross-reference or single source of truth between them. If both were ever wired up as currently shaped, a school could set `IPaymentPolicy.allowPartialPayment = false` and `IPaymentTerm.allowPartialInstallment = true` for the same installment and there is no defined rule for which wins.

**Additional dangling reference:** `IInstallment.lateFeePolicyId` (`PaymentTerm/type.ts:18`) points at `ILateFeePolicy` — the exact type the implementation plan already decided to retire in Phase 0. If Phase 0 executes as planned and `ILateFeePolicy` disappears, every `IInstallment` referencing it breaks silently (dangling ID, no compile-time or runtime signal) unless `PaymentTerm` is migrated to reference Collection Policy instead. **This is a direct blocking dependency the current implementation plan's Phase 0 does not account for.**

**Grace period is configured in three places for the same due date:** Collection Policy's `gracePeriodDays` (structure-level), `ILateFeePolicy.gracePeriodDays` (being retired), and `IInstallment.gracePeriod` (per-installment, in `PaymentTerm`). Even after `ILateFeePolicy` retirement, two definitions remain with no documented precedence.

### Why this matters more than any single new feature

Every feature this document and the design-recommendations doc propose for "Payment Rules" (partial payment, advance payment, allocation method, payment modes) has somewhere to land *already* — the problem isn't a missing field, it's a missing decision about which entity owns it. Building new payment-behaviour features before this is resolved guarantees a fourth duplicate.

### Recommendation

Before any payment-behaviour feature work: run the same exercise Collection Policy went through for `ILateFeePolicy` —
1. Decide which entity is canonical: `IPaymentPolicy` (school/policy-scoped) as the behaviour rulebook, `IPaymentTerm` narrowed to *only* the installment schedule shape (dates, sequence, per-installment demand/reminder toggles) with all payment-behaviour fields (`allowAdvancePayment`, `allowPartialInstallment`, `minPartialAmount/Percentage`, `holidayShiftingMethod`) removed and delegated to the attached `IPaymentPolicy`.
2. Re-point `IInstallment.lateFeePolicyId` at Collection Policy (or remove it and resolve via the Fee Structure attachment, matching how Collection Policy is already resolved) before or in the same change as the `ILateFeePolicy` retirement — not after.
3. Document one precedence rule for grace period once only two sources remain (Collection Policy vs. per-installment override, if the per-installment override is kept intentionally for schools that stagger installment leniency).
4. Only then build the backend + runtime enforcement for `IPaymentPolicy` fields (partial/advance/allocation/payment-modes), following the same aggregate + versioning + runtime-consumer pattern used for Collection Policy — this is a same-shape, same-size effort to Collection Policy's own backend build, not a small add-on.

---

## 2. All six finance policy kinds share the same "form with no backend" problem, not just Collection Policy

`collection-policy-review-and-gaps.md` correctly identifies this for Collection Policy specifically. Codebase verification shows it's actually true of **all** `FinancePolicyKind` values (`finance-policy.types.ts:3-9`: `payment`, `late-fee`, `concession`, `refund`, `collection`, `proration`) — a `grep` for `PaymentPolicy`, `ConcessionPolicy`, `RefundPolicy`, `ProrationPolicy` as backend entities/controllers across `Shikshamitra-BE` returns nothing but an unrelated static helper (`FeeReceiptPaymentPolicy.cs`, which decides receipt kind — not a policy config) and permission-constant stubs.

**Why this belongs in this document, not just as "same gap, six times":** it changes the sequencing calculus. The implementation plan currently treats Collection Policy's backend build (Phase 1) as an isolated effort. If Concession, Refund, and Proration policies need the identical aggregate/versioning/permission scaffolding, there's a case for building one **shared finance-policy aggregate framework** (base aggregate root, versioning entity, assignment-tracking entity — generalized from what Phase 1 already specs for Collection Policy) once, and having each of the six kinds plug in, rather than repeating the full HR-Policies-pattern buildout six separate times. This is a sequencing/architecture decision, not a feature gap, but it directly affects how Phase 1 should be scoped.

**Recommendation:** before Phase 1 implementation starts, evaluate whether `CollectionPolicy`'s aggregate root, `CollectionPolicyVersion`, and `CollectionPolicyAssignment` (as specced) should instead be `FinancePolicyBase`-style shared types with a `policyType` discriminator, so Concession/Refund/Payment/Proration policies inherit the same persistence, versioning, and impact-tracking machinery instead of each needing its own copy later.

---

## 3. Fee Clearance Gate (Collection Restrictions) is a new cross-module capability, not a Collection Policy field

`Collection_Policy_Design_Recommendations.md` §4 proposes blocking hall tickets, report cards, promotion, admission renewal, leaving certificates, and ID cards based on outstanding dues. Codebase verification: this concept **does not exist anywhere** — no due/outstanding-based gating logic was found in the certificates screens (e.g. `student/certificates/leaving-certificate.tsx` has no due-check logic at all), promotion flow, or ID card issuance, and no generic "fee clearance" or "due clearance" service exists in FE or BE.

This is correctly identified as missing, but it is **not a Collection Policy concern** — it's a capability that several *other* modules (Certificates, Promotion, ID Card issuance, Admission Renewal) need to consult, keyed off a student's outstanding-dues state, which itself is computed by Fee Collection, not by Collection Policy. Modeling it as a Collection Policy field (as the design doc's structure implies) would make Collection Policy responsible for behaviour it doesn't own and can't enforce alone — the certificate/promotion modules would still need to remember to check it.

### Proposed shape

- **New small aggregate**: `FeeClearanceRule` (could live under a `collection` policy or be its own lightweight policy kind — worth a naming/ownership decision, but functionally distinct from late-fee/waiver math) — `blockedActions: FeeClearanceAction[]` (`HallTicket | ReportCard | Promotion | AdmissionRenewal | LeavingCertificate | IDCard | Custom`), `outstandingThresholdAmount` (block only above X, optional), `gracePeriodDaysBeforeBlock` (don't block immediately on due date), `exemptRoles`/`overrideRoles` (who can force-issue despite a block).
- **One shared query surface**: `GET /students/{studentId}/fee-clearance-status` returning `{ isCleared: boolean, blockedActions: FeeClearanceAction[], outstandingAmount, reasonDetail }` — a single source of truth every dependent module calls, rather than each module re-implementing an outstanding-dues check.
- **Consumers**: Certificates module, Promotion workflow, ID Card issuance, Admission Renewal — each adds a clearance check + an explicit "override with reason" escape hatch (a Principal overriding a block for a scholarship student must be possible and must be logged, or the feature will get disabled school-wide the first time it blocks someone it shouldn't).
- **Acceptance criteria**: a student with an overdue balance above the configured threshold cannot generate a hall ticket through the normal flow, sees a clear reason, and an authorized role can override with a mandatory reason that's logged — verified end-to-end from Fee Collection (create the due) through Certificates (attempt + block + override).

---

## 4. Granular online-collection method configuration has no home yet — including fee/charge economics the design doc didn't mention

`Collection_Policy_Design_Recommendations.md` §5 correctly flags that a single `allowOnlineCollection` boolean is too coarse. Codebase check found:
- `IPaymentPolicy.paymentModes` (`finance-policy.types.ts:78-86`) already has per-method boolean toggles (cash/cheque/upi/card/neft/onlineGateway) plus `cashLimit` — unused, per §1 above.
- `OnlineGatewayTable.tsx` (Finance reconciliation) only *displays* a `paymentGatewayName` column; it is not a configuration surface.
- **Not found anywhere, including in the design doc's proposal**: which payment **gateway provider** (Razorpay/PayU/Stripe/etc. — whatever the platform integrates with) each method routes through, or how convenience fee/gateway charges are actually **applied** — absorbed by the school, passed to the parent, or split. The design doc lists "Convenience Fee" and "Gateway Charges" as fields but doesn't address who pays them, which is the actual decision a school needs to make and the actual thing that needs a schema.

### Proposed shape (additive to what's already unused in `IPaymentPolicy`)

- Extend `paymentModes` (once `IPaymentPolicy` is the confirmed owner per §1) with, per online method: `convenienceFeeType: 'None' | 'FlatAmount' | 'Percentage'`, `convenienceFeeValue`, `convenienceFeeBornBy: 'School' | 'Parent'`, `minAmount`, `maxAmount`.
- School-level (not per-method) `onlineCollectionWindow`: `startTime`/`endTime` for "working hours only," `disableOnHolidays: boolean` (needs an academic-calendar/holiday-list lookup — confirm one exists before building; not verified in this pass).
- Runtime: the collect-form and parent portal payment-method list filters by method-level `allow*` **and** by the window/holiday check at the moment of payment, not just at policy-configuration time (a payment started at 5:59pm and completed at 6:01pm needs a defined behaviour — recommend: gate at initiation, not completion, and let an in-flight payment finish).
- **Acceptance criteria**: a school configuring UPI with a 2% convenience fee borne by the parent sees that fee itemized separately from the fee amount in both the collect form and the receipt (not silently folded into the total — parents dispute silent fee inflation far more than an itemized one).

---

## 5. Exception Rules need a distinct mechanism from Bulk Waiver — they prevent charging, not forgive it after the fact

`collection-policy-implementation-plan.md` Phase 4d (Bulk Waiver, already planned) forgives late fees that have already been calculated and charged, for a cohort, after a request/approval workflow. `Collection_Policy_Design_Recommendations.md` §6 proposes "Exception Rules" for holidays/disasters/bank strikes/gateway failures — these are conceptually different: a bank-strike day should mean the late fee calculation *never runs* for that window, not that it runs and then gets waived after the fact. Confusing the two means every gateway outage requires an admin to notice, then file a bulk waiver, after parents have already seen an inflated due amount — which defeats the purpose.

### Proposed shape

- New lightweight entity `CollectionPolicyExceptionWindow`: `scope` (`SchoolWide | AcademicYear | FeeStructure | ClassSection`), `scopeId`, `startDate`, `endDate`, `effect` (`SuspendLateFeeAccrual | ExtendGracePeriod(days) | DisableOnlineCollection | Custom`), `reasonCode` + free-text reason, `createdByUserId`.
- **Calculation service integration**: `LateFeeCalculationService` (implementation plan Phase 2) checks for an active exception window covering the due date's overdue period *before* running the standard grace/slab pipeline — a day inside a `SuspendLateFeeAccrual` window simply doesn't accrue, rather than accruing-then-being-waived. This means Phase 2's service needs one more lookup (active exception windows for the relevant scope) added to its inputs.
- **Distinction from Bulk Waiver stays visible in the UI**: Bulk Waiver acts on already-charged amounts (retrospective, per-student audit trail); Exception Window acts on the calculation itself going forward (proactive, no per-student audit trail needed since nothing was ever charged — though the window creation itself should be audited).
- **Acceptance criteria**: creating a `SuspendLateFeeAccrual` exception window for "2026-08-01 to 2026-08-05, SchoolWide, reason: Payment gateway outage" results in zero late fee computed for any due date whose overdue period falls in that window, verified via `/simulate`, with no manual waiver action required.

---

## 6. Policy hierarchy needs an active resolution algorithm, not just more attachment levels

The current model (and the implementation plan's Phase 4a per-fee-head override) covers Fee Structure → Fee Head Override. `Collection_Policy_Design_Recommendations.md`'s proposed hierarchy (School Default → Fee Structure → Fee Head Override → Student Override) adds two ends: an active **School Default** fallback and a **Student Override**.

**School Default today is a flag, not a fallback path.** `ICollectionPolicy.isDefault` (`finance-policy.types.ts:69`, inherited via `IFinancePolicyBase`) marks a policy as *a* default but there is no verified resolution algorithm anywhere that says "if a Fee Structure has no `collectionPolicyId`, fall back to the `isDefault` policy for the academic year." This needs to be specified as an actual algorithm, not just a boolean field, and needs a defined behavior for the "two policies both marked `isDefault` for the same year" data-integrity case (reject at save time, most likely).

**Student Override is new and needs a scope boundary before it's built, not after.** A full per-student policy clone (a student gets their own complete `CollectionPolicy` copy) is powerful but creates an audit/consistency nightmare at scale — hundreds of one-off policies with no relationship to the source policy's future edits. A narrower model — a small set of **student-level flags** referencing the resolved policy (e.g. `isLateFeeExempt: boolean`, `customGracePeriodDays: number | null`, `waiverPreApproved: boolean` with a reason) attached to the student-fee-structure link rather than a full policy object — achieves the same real-world need (an individual scholarship student, a documented hardship case) without the blast radius of arbitrary per-student policy configuration.

### Recommendation

- Specify and implement the School Default fallback as an explicit resolution function: `resolveCollectionPolicy(feeStructureId) → policyId`, checked in this order: Fee Structure's direct attachment → academic year's `isDefault` policy → `null` (no policy, treated as "no late fee/waiver," matching the flow doc's existing §7.10 "No Collection Policy Attached" scenario). Enforce "at most one `isDefault` per academic year per policy kind" at save time.
- Scope Student Override to the flag-based model above rather than a full policy clone, unless a specific school requirement is confirmed that needs more (get that confirmation before building — this is exactly the kind of judgment call worth a stakeholder check, not an assumption).
- This resolution function is also where §5's Exception Windows and §3's Fee Clearance status should be composed — i.e. there should be **one** function a cashier's collect-form call and a parent-portal call both go through to get "the fully resolved rules for this student's due today," not several independent lookups that can disagree. This directly extends the "single source of truth for calculation" principle already stated in `collection-policy-implementation-plan.md` §2.

---

## 7. Summary — how this changes the build order

None of the above invalidates `collection-policy-implementation-plan.md`'s phases for Collection Policy itself — Phases 0–5 as written are still correct for late fee, waiver, and the school-workflow features already scoped there. What this document adds is:

1. A **blocking prerequisite** to Phase 0: resolve the `IPaymentPolicy`/`IPaymentTerm` duplication and re-point `IInstallment.lateFeePolicyId` before `ILateFeePolicy` is deleted, or Phase 0 will silently break `PaymentTerm`.
2. A **sequencing question** for Phase 1: whether to generalize the aggregate/versioning pattern across all six finance policy kinds now, rather than building it once for Collection Policy and repeating the effort later for Payment/Concession/Refund/Proration.
3. **Three genuinely new, independently schedulable capabilities** not currently in any phase: Fee Clearance Gate (§3), granular online-collection economics (§4), and Exception Windows (§5) — each sized similarly to one of the existing Phase 4 sub-phases and can slot in alongside 4a–4g.
4. A **design decision to make before building**, not after: the policy resolution algorithm and Student Override scope (§6), which the current plan doesn't address because the current plan doesn't yet have a Student Override concept at all.

These should be reviewed and, where accepted, folded into `collection-policy-implementation-plan.md` as explicit phase additions — this document intentionally stops short of writing the phases itself, since the ownership decisions in §1 and §6 need a stakeholder call first.
