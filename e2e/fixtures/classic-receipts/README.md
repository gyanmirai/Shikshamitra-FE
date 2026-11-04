# Classic receipts browser validation

Run Vite with `--config e2e/fixtures/classic-receipts/vite.config.mts` (port 5197).
Generate PDFs using backend `ReceiptDocumentModel_Tests` with `RECEIPT_E2E_PDF_DIRECTORY`
set to the wrapper's `output/pdf/classic-receipts-qa` folder; `RECEIPT_QA_DIRECTORY` overrides the served folder.

This fixture uses production receipt-history and refund PDF dialogs with synthetic API data and no financial writes.
In the in-app browser, check Fee, Provisional fee, Charge, Combined, Refund and Provisional refund, canvas rendering,
download filenames, retry, close/reopen, fit width and narrow screens. Backend tests own persisted evidence,
school identity, scope and payout state correctness. `RECEIPT_VITE_CACHE` overrides the temporary Vite cache location.

Run automated desktop and phone checks with:

```bash
node node_modules/@playwright/test/cli.js test --config e2e/finance/classic-receipts.config.ts
```

The seven cases cover all six document choices, pagination controls, zoom/fit, download filenames, close and phone overflow.
