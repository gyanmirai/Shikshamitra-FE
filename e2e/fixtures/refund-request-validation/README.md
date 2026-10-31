# Refund Request Validation Harness

This local harness mounts the production `RefundForm`, `FeeRefundDetailsForm`, `FeeHeadRefundTable`, fee-head controls,
installment inputs, form validation, summary and confirmation dialog. The surrounding student selector,
authentication and API hooks use synthetic data. No backend requests or financial writes occur.

Run the desktop and mobile regression suite from the frontend repository:

```powershell
node node_modules/@playwright/test/cli.js test --config e2e/finance/refund-request-validation.config.ts
```

To inspect manually, run the Vite command configured in that file and open `http://127.0.0.1:4225/`.
Click **Load test student**, select FH1, apply an amount twice, then select FH2 without entering
amounts. Submission stays disabled with inline Required messages and an incomplete-selection count.
Complete FH2, verify that an empty or whitespace-only Refund reason blocks submission, then enter
a reason to open the production approval confirmation. Repeat at a 390px viewport to check
the wrapping header, contained installment scrolling and accessible actions.

This validates client behavior with deterministic data; it does not claim live policy, payment,
backend authorization or payout integration coverage.

**View synthetic refund request** opens the production read-only drawer. Its synthetic completed
refund includes a ₹10,829 fee-head amount and every policy payment method, covering neutral
refund amounts, metadata grid alignment, full-width payment-method wrapping and contained table scrolling.

Append `?view=approved` to open a synthetic approved ₹3,750 request directly.
Its response deliberately includes old cumulative ₹50,000 fee-head totals, zero-refund installments,
and a stale Reject action hint.
The drawer must show only the December school-fee refund, a ₹3,750 refund amount, and Close without Reject.
The actual backend request projection is verified separately by `RefundRequestDetailProjection_Tests`.

Use `?view=worklist` to inspect all five refund tabs with synthetic rows. Completed, Rejected and Failed omit Actions; Pending and Approved retain it. This fixture performs no backend writes.
