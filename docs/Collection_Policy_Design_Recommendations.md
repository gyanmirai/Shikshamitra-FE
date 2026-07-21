# Collection Policy Design Recommendations

## Vision

Collection Policy should become the **central rule engine** that governs
**how, when, and under what conditions a school can collect fees**,
rather than focusing only on late fee calculation.

------------------------------------------------------------------------

# Proposed Collection Policy Structure

    Collection Policy
    │
    ├── 1. Payment Rules
    ├── 2. Late Payment Rules
    ├── 3. Waiver Rules
    ├── 4. Collection Restrictions
    ├── 5. Online Collection
    └── 6. Exception Rules

------------------------------------------------------------------------

# 1. Payment Rules

These rules define how parents are allowed to pay.

## Recommended Options

-   Allow Partial Payment
-   Minimum Payment Amount
-   Minimum Payment Percentage
-   Allow Advance Payment
-   Allow Future Months Payment
-   Allow Multiple Months Together
-   FIFO Collection (Oldest dues first)
-   Mandatory FIFO
-   Allow Fee Head-wise Payment
-   Allow Charges Separately

------------------------------------------------------------------------

# 2. Late Payment Rules

The existing design is strong. Consider adding:

## Maximum Late Fee

Example:

-   ₹20/day
-   Maximum ₹500

## Stop Charging After X Days

Example:

-   Freeze late fee after 90 days.

## Working-Day Based Grace Period

Support both:

-   Calendar Days
-   Working Days

------------------------------------------------------------------------

# 3. Waiver Rules

Expand the waiver engine.

## Role-based Waiver Permission

-   Accountant
-   Principal
-   Trustee
-   Admin

## Approval Matrix

  Waiver Amount    Approval Required
  ---------------- -------------------
  ₹0 -- ₹500       Accountant
  ₹501 -- ₹5,000   Principal
  Above ₹5,000     Trustee

## Mandatory Reason

Require a reason before applying a waiver.

## Supporting Documents

Optionally require:

-   Medical Certificate
-   Government Letter
-   Death Certificate

------------------------------------------------------------------------

# 4. Collection Restrictions

Schools frequently require operational restrictions based on outstanding
dues.

Recommended rules:

-   Block Hall Ticket
-   Block Report Card
-   Block Promotion
-   Block Admission Renewal
-   Block Leaving Certificate
-   Block ID Card

------------------------------------------------------------------------

# 5. Online Collection

Instead of a single toggle, support:

-   Allow UPI
-   Allow Cards
-   Allow Net Banking
-   Allow Wallets
-   Allow EMI
-   Convenience Fee
-   Gateway Charges
-   Minimum Online Amount
-   Maximum Online Amount
-   Working Hours Only
-   Disable on Holidays

------------------------------------------------------------------------

# 6. Exception Rules

Support temporary exceptions.

Examples:

-   Government Holidays
-   Natural Disaster
-   COVID-like situations
-   School Closure
-   Bank Strike
-   Payment Gateway Failure

------------------------------------------------------------------------

# Recommended Policy Hierarchy

Instead of

    Fee Structure
        ↓
    Collection Policy
        ↓
    Student

consider

    School Default Policy
            ↓
    Fee Structure Policy
            ↓
    Fee Head Override
            ↓
    Student Override

This allows maximum flexibility without duplicating policies.

------------------------------------------------------------------------

# Missing Runtime Events

Generate events for every important financial action.

-   LateFeeCalculated
-   LateFeeWaived
-   WaiverApproved
-   WaiverRejected
-   PaymentBlocked
-   PaymentRejected
-   PolicyApplied
-   PolicyChanged
-   OnlinePaymentBlocked

These simplify auditing, reporting, and notifications.

------------------------------------------------------------------------

# Notification Integration

Integrate Collection Policy with the notification engine.

Examples:

-   Due reminder (5 days before)
-   Grace period ending tomorrow
-   Late fee applied
-   Payment blocked
-   Online payment disabled

Channels:

-   SMS
-   Email
-   WhatsApp
-   Push Notification

------------------------------------------------------------------------

# Policy Precedence

Document a single precedence order for all finance modules.

    Fee Structure
        ↓
    Concession
        ↓
    Adjustment
        ↓
    Collection Policy
        ↓
    Late Fee
        ↓
    Waiver
        ↓
    Payment Allocation
        ↓
    Receipt Generation
        ↓
    Refund

------------------------------------------------------------------------

# Versioning Recommendation

Each Due Fee should store:

-   CollectionPolicyId
-   CollectionPolicyVersion
-   CalculationSnapshot

This guarantees that historical calculations remain reproducible even
after policies change.

------------------------------------------------------------------------

# Final Recommendation

Collection Policy should evolve into the **core financial rule engine**
for fee collection.

Late fee calculation becomes just one capability among many. By
expanding the policy to include payment behavior, restrictions,
approvals, notifications, overrides, and versioning, ShikshaMitra can
support institutions ranging from small private schools to large
multi-campus organizations without requiring future architectural
redesign.
