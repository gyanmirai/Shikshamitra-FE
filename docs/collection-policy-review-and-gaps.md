# Collection Policy — Understanding, Gaps & School-Management Perspective

> **Purpose:** This document explains what Collection Policy is, what it currently does (and doesn't do), and what it needs to cover to be a genuinely complete, easy-to-use fee collection control for schools.
> It is a companion to [`collection-policy-flow.md`](./collection-policy-flow.md) (technical flow/data model) and [`collection-policy-implementation-plan.md`](./collection-policy-implementation-plan.md) (execution plan).
>
> **Status of this review:** As of this writing, Collection Policy is a frontend-only feature.
> There is no backend entity, endpoint, or database table for it anywhere in `Shikshamitra-BE`.
> Nothing described as "current behaviour" below has ever run against real student data.

---

## 1. What Collection Policy is supposed to be

In plain terms, for a school admin: Collection Policy is the rulebook that says *"if a parent pays late, what happens?"* and *"can we ever forgive that penalty, and by how much?"*

It should answer three questions every time a fee is collected:

1. **Is this payment late, and what's the penalty?** (late fee calculation)
2. **Can the penalty be reduced or waived, and within what limits?** (waiver rules)
3. **Is this payment allowed through this channel?** (online collection gate)

A school typically has one or a handful of these policies (e.g. "Standard Late Fee Policy", "No Late Fee — Scholarship Students") and attaches one to each Fee Structure, so different fee structures (different grades, boards, or fee types) can have different late-payment consequences.

---

## 2. What exists today

### Fully built (form/editor layer)
- A 4-section create/edit form: General Information, Late Fee Configuration, Waiver Rules, Online Collection Settings.
- A live summary sidebar mirroring the form state.
- A sandbox "Live Calculator" that simulates late fee for manually-entered Outstanding/Days Late/Payment values.
- A validation checklist gating a "Ready to Publish" state.
- A shared policy list table (columns: Policy Name, Late Fee, Late Fee Type, Grace Days, Online Pay, Status, etc.) with View / Edit / Clone / Archive / Audit Trail / Version History actions.
- Field-level support for: grace period, 7 late-fee calculation types (Flat, Percentage, PerDay, PerWeek, PerMonth, Compound, Slab), rounding methods, income-booking flag, waiver caps (amount and percentage), waiver expiry, and an online-collection toggle.

### Not built at all
- **Backend.** No entity, no API, no database. The Submit button calls an endpoint that doesn't exist.
- **Runtime enforcement.** Nothing in the actual Fee Collection form reads this policy. A cashier collecting a fee today sees no late fee, no waiver option, and no online-payment gating — regardless of what's configured in the policy.
- **Cross-module arbitration.** Concession, Adjustment, and Refund all touch the same money as Collection Policy but none of them currently consult it.

So: **the rulebook exists, but nobody reads it during an actual collection.** That's the single most important gap to close, because it's the entire point of the feature.

---

## 3. Detailed gap inventory

### 3.1 Runtime / enforcement gaps (highest priority — these make the feature non-functional today)

| Gap | Real-world consequence |
|---|---|
| Fee Collection form doesn't show computed late fee | Cashier has no idea a payment is late or what the penalty is; either under-collects or has to calculate manually on paper |
| Waiver has no UI or enforcement in the collect flow | The "Waiver Rules" section an admin carefully configures is decorative — nobody can actually grant a waiver through the system |
| `allowOnlineCollection` doesn't gate anything | Parents can pay online via the parent portal even when a school has explicitly disabled it for a fee structure (e.g. cash-only policies for certain fee types) |
| No approval workflow for waivers | Any staff member could theoretically waive without oversight once waivers are wired up — needs a role/approval gate, not just a numeric cap |
| No audit trail entry when a waiver is applied | Finance/compliance can't answer "who waived what, when, and why" |

### 3.2 Cross-module consistency gaps

| Gap | Real-world consequence |
|---|---|
| Concession policy's `lateFeeBehaviour` (Recalculate / KeepExisting / RemoveLateFee) isn't wired to Collection Policy | Two different policies claim authority over the same late-fee dollar; today, whichever code path runs "wins" by accident, not by design |
| Adjustment form ignores Collection Policy | A manual fee adjustment can silently exceed the waiver cap the school configured, defeating the point of having caps |
| Refund vs. late-fee income clawback undefined | If a late fee was booked as income and the underlying fee is later refunded, it's unclear whether/how the income entry is reversed |
| Charges (exam fees, transport, etc.) vs. Fee Heads | `lateFeeApplyOnFeeHeads` only lists fee heads; charges have their own due dates and it's undefined whether they ever attract late fee |

### 3.3 Policy correctness / data-integrity gaps

| Gap | Real-world consequence |
|---|---|
| Slab overlap/gap validation missing | Admin can define overlapping day ranges (double-charges) or gaps (fee-free days) with zero warning |
| No versioning / effective-dating | Editing grace period from 7→14 days after some fees are already overdue has undefined effect on already-generated dues — risk of retroactively changing what a parent owes, which is an audit and trust problem |
| Waiver expiry not enforced anywhere | An expired waiver window doesn't actually block anything |
| `PerMonth` late-fee type has no dropdown option | Fully modeled field, unreachable from the UI — a straightforward bug |
| Draft-only delete rule vs. Active/Archived-only status | Collection Policy can never reach `Draft`, so the Delete action is permanently dead for this policy type |
| Two competing "late fee" data models | A separate, unrouted `ILateFeePolicy` type/form duplicates ~80% of Collection Policy's late-fee fields with slightly different shapes — confusing for anyone reading the codebase and a risk of drift (decision made: retire this, see implementation plan) |

### 3.4 Missing school-workflow concepts (not gaps in existing fields — entirely absent capabilities)

These are things a real school finance office needs that the current schema has no place for at all:

- **Per-fee-head or per-class overrides.** Today one policy applies uniformly to everything it's attached to. Schools commonly want, e.g., transport fees to have a different (or no) late fee than tuition, even within the same fee structure. (`FeePoliciesTab.tsx` even has a banner saying "Individual Fee Head overrides (coming soon)" — acknowledged but unbuilt.)
- **Late fee caps.** Percentage/compound/slab late fees have no absolute ceiling field (e.g. "never charge more than ₹2,000 late fee regardless of formula"). Compounding without a cap can produce runaway numbers that look punitive or erroneous to a parent.
- **Communication/notification hooks.** No concept of "notify parent N days before grace period ends" or "notify parent when late fee is applied." Schools live and die by proactive reminders, not just penalty math.
- **Bulk/mass waiver support.** Real schools grant blanket relief (e.g. "waive late fees for all students for March due to a payment gateway outage") — the current model only conceives of per-transaction waivers.
- **Staff-role scoping.** No concept of which roles (Accountant vs. Front Desk vs. Principal) can grant a waiver, approve one above a threshold, or edit the policy itself.
- **Parent-facing transparency.** No field controlling whether the late fee breakdown/reason is shown on the receipt or in the parent portal — parents dispute late fees far less when they can see the calculation themselves.
- **Reporting/analytics hooks.** No linkage from a Collection Policy to a report answering "how much late fee did we actually collect vs. waive this term, and where."
- **Simulation/testing before publish.** The Live Calculator is a good start but it's a detached sandbox — an admin publishing a new policy has no way to see "if I apply this to my current overdue students, what changes for them" before it goes live.
- **Multi-year continuity.** Policies are scoped to `academicYearId`, but there's no "clone forward to next year" or "carry over as default" flow visible in the reviewed code beyond generic Clone.

---

## 4. What "complete" should look like — from a school's perspective

Reframing the gaps above as positive requirements, grouped the way a school administrator would think about them:

### 4.1 "I want to configure penalties without guesswork"
- Slab/overlap validation with a visual timeline preview (not just a table of rows) so a non-technical admin can see gaps/overlaps at a glance.
- A hard cap field so no calculation method can produce an unbounded charge.
- A real preview: pick an actual (or sample) student and due amount and see exactly what they'd be charged under the draft policy, before publishing.

### 4.2 "I want fairness and flexibility, not one-size-fits-all"
- Per-fee-head override capability (e.g. no late fee on transport, full late fee on tuition) within one policy, or a clean multi-policy-per-structure model — not a "coming soon" banner.
- A defined, documented precedence order for Collection Policy vs. Concession Policy vs. Adjustment when they touch the same dollar, surfaced to the admin in plain language ("Concession always overrides late fee on the heads it applies to").

### 4.3 "I want waivers to be controlled, not just theoretical"
- A real waiver action in the collection screen: enter amount/percentage, system enforces the cap and expiry automatically, requires a reason, and (above a configurable threshold) requires a second approver.
- Every waiver logged with who/when/why/how much, visible in Audit Trail — this is what protects the school in a parent dispute or an internal audit.
- A bulk-waiver capability for exceptional circumstances (system outage, natural disaster, admin discretion for a whole class/cohort).

### 4.4 "I don't want angry parent calls I can't explain"
- Late fee shown on the collect form *before* the cashier takes payment, and on the receipt, with a one-line explanation of how it was calculated ("₹20/day × 15 days late").
- Grace-period and upcoming-due-date reminders sent automatically, so late fees are rarely a surprise.
- Parent portal reflects the same numbers the cashier sees — one source of truth, not two calculators that can disagree.

### 4.5 "I want to trust that changing a policy won't retroactively hurt families who already owe money"
- Versioning: policy edits apply to *new* dues going forward; already-generated dues keep the rules in force when they were created, unless an admin explicitly and visibly chooses a retroactive recalculation.
- A warning before editing/archiving a policy that's actively attached to fee structures with real outstanding balances ("This policy affects 340 students with ₹12.4L outstanding — edits will apply to new dues only").

### 4.6 "I want to know it's working"
- Reporting: late fee charged vs. collected vs. waived, by policy, by term, by class — feeding into the school's income vs. write-off picture (`considerAsIncome` should actually connect to a ledger/report, not just sit as an unused flag).

---

## 5. Summary verdict

Collection Policy's **editor is the easy 20%** of this feature — a well-designed form with good UX polish. The **hard 80%** — the backend, the runtime enforcement in Fee Collection, the arbitration with Concession/Adjustment/Refund, and the school-workflow concepts (overrides, caps, notifications, approvals, reporting) that turn "a form that saves JSON" into "a rulebook a school actually trusts with its money" — does not exist yet.

For this to be world-class, the goal shouldn't be "finish the fields." It should be: **a parent never gets an inexplicable charge, a cashier never has to do late-fee math by hand, and a finance admin can always answer "why was this student charged/waived this amount" from the system itself.**

See [`collection-policy-implementation-plan.md`](./collection-policy-implementation-plan.md) for how to get there.
