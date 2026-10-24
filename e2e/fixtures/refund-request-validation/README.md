# Refund Request Validation Harness

This local harness mounts the production `RefundForm`, `FeeHeadRefundTable`, fee-head controls,
installment inputs, form validation, summary and confirmation dialog. The surrounding student selector,
authentication and API hooks use synthetic data. No backend requests or financial writes occur.

Run the desktop and mobile regression suite from the frontend repository:

```powershell
node node_modules/@playwright/test/cli.js test --config e2e/finance/refund-request-validation.config.ts
```

To inspect manually, run the Vite command configured in that file and open `http://127.0.0.1:4225/`.
Click **Load test student**, select FH1, apply an amount twice, then select FH2 without entering
amounts. Submission stays disabled with inline Required messages and an incomplete-selection count.
Complete FH2 to open the production approval confirmation. Repeat at a 390px viewport to check
the wrapping header, contained installment scrolling and accessible actions.

This validates client behavior with deterministic data; it does not claim live policy, payment,
backend authorization or payout integration coverage.

**View synthetic refund request** opens the production read-only drawer. Its synthetic completed
refund includes a ₹10,829 fee-head amount and every policy payment method, covering informational
refund chips, metadata grid alignment, full-width payment-method wrapping and contained table scrolling.
