# Fee collection late-fee browser contract fixture

Run from the frontend root:

```powershell
node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vite/bin/vite.js --config e2e/fixtures/fee-collection-late-fees/vite.config.mts
```

Open `http://127.0.0.1:5177/` in the Codex in-app browser.

For receipt grouping, choose **Separate receipt grouping** or **Combined receipt grouping**
before opening Collect Fee. Select the principal fee (20,000) and the late-fee charge
(60,600), then collect the synthetic cash payment (80,600). Separate shows fee and charge
PDFs for 20,000 and 60,600; Combined shows one PDF for 80,600. These deliberately simple
PDFs verify the frontend receipt workflow and are not server-generated receipt evidence.
The response keeps `paidLateFees` independent from ordinary `paidCharges`.

Choose **Settled balances**, then open Collect Fee. With all fees and charges settled,
the dialog shows “No outstanding fees or charges to collect. Items with no outstanding
balance cannot be selected.” as informational feedback. Fee/charge checkboxes and Collect
remain disabled, without the selection validation error. Switching back to the default
scenario retains normal selection of pending fees and late fees.

If the Windows dev dependency optimizer stalls, build and preview the same fixture instead
(run these commands sequentially from the frontend root):

```powershell
node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vite/bin/vite.js build --config e2e/fixtures/fee-collection-late-fees/vite.config.mts --outDir ../../../.artifacts/fee-collection-late-fees-browser
node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vite/bin/vite.js preview --config e2e/fixtures/fee-collection-late-fees/vite.config.mts --outDir ../../../.artifacts/fee-collection-late-fees-browser --host 127.0.0.1 --port 5177 --strictPort
```

Rebuild after source edits when using static preview. Built output stays in the local `.artifacts`
directory and is not part of this fixture's source changes.

## Collection UI browser regression suite

After building the fixture above, run:

```powershell
node node_modules/@playwright/test/cli.js test --config e2e/finance/fee-collection-ui.config.ts
```

The configuration starts the static preview on port 5177 and uses installed Microsoft Edge
with one worker. It covers all twelve months, both fee heads, all six statuses, combined and
empty filters, both grouping modes, all selection presets, overlapping selections, refreshed
balances, Clear All, keyboard controls, pointer/keyboard selected-item dragging, trailing row
removal, dropdown method switching, all seven payment methods,
required details, cash tender validation, both review stages, canonical outgoing allocations,
receipts, and the UPI reconciliation decision. Sticky summary/actions and independent payment
scrolling are checked at 390×844, 768×1024 and 1440×900 in both themes.

The HTML report, JSON results, and failure traces/screenshots are saved under
`.artifacts/fee-collection-ui/e2e-20261018`. These are local QA outputs, not source assets.
Finish with a smoke test in the Codex in-app browser. This suite verifies frontend behavior
and outgoing requests; the mock settlement response does not validate backend reconciliation,
bank settlement, production permissions or PDF generation.

Cheque, DD, and explicitly unconfirmed electronic payments return a pending response with
no receipt. That branch leaves fixture balances unchanged; it exercises frontend pending
handling without simulating bank clearing or reserved-balance accounting.

This isolated fixture renders the actual `FeeCollectionTable` and `FeeCollectComponentForm`,
including their actual RTK Query endpoint definitions and cache invalidation. Only the shared
base service is replaced. Its synthetic state supplies already-assessed obligations and never
calls the backend. This verifies frontend handling of the corrected server contract; backend
assessment, preservation, scope, and summary calculation require independent regression tests.
The unrelated assignment workflow is aliased to a labeled placeholder: this scenario always
supplies an already-assigned student, so that workflow is never rendered.

1. Confirm Diya Sweta Badgujar (10092) has Total Charges and Pending Charges of ₹400.
2. Open Collect Fee. Confirm four system-generated Additional Charges of ₹100 remain pending.
3. Select only June–October tuition and Quarter 1 transport. Their original due amounts sum to
   ₹12,396. The current whole-rupee collection contract rounds each tuition installment to ₹2,000,
   so full collection is ₹12,400. Tender ₹12,400 to pay all six principal items, or ₹12,396 to
   reproduce the reported tender while retaining ₹4 transport principal. Collect through the
   payment review dialogs.
4. Confirm the receipt number and total in the payment summary. This original scenario
   intentionally returns a PDF 404: confirm the receipt-specific payment-success warning and
   retry action. Inspect request evidence to verify tuition/transport allocations and no late fees.
5. Finish the receipt and reopen collection. Confirm selected principal items reflect the payment,
   while all four charges remain pending and selectable through All Charges.
6. Use Request evidence on the grid to inspect captured POST requests. A fee-only payment must
   send an empty `lateFeePayments` array.
7. Collect charges alone or waive one with a reason, then confirm Pending Charges refreshes while
   Total Charges retains the assessed amount. Reset synthetic scenario restores all balances.

The full synthetic ledger contains ₹24,000 tuition and ₹9,600 transport; its six selected
installments reproduce the reported ₹12,396 payment. Reloading or resetting discards all
synthetic payments and waivers. No production student data is changed.

## Charge receipt preview regression

Choose **Charge receipt regression** to supply paid fee installments and one unpaid ₹1,000
manual charge. Open collection, expand Filters, select All Charges, and complete the cash
review. The collection returns only `chargeReceiptId`; its PDF is served through the canonical
`/v1/fee-receipts/{id}/pdf` contract. The embedded PDF is a minimal synthetic one-page document
created by the fixture, so this proves browser preview/download and client routing rather than
backend PDF generation. The original late-fee scenarios retain their unavailable-PDF behavior.

Choose **Charge receipt retry regression** for the same charge with the first canonical PDF
request returning 404. Verify the receipt-specific payment-success warning and **Retry receipt**.
The retry succeeds without submitting another collection. **Request evidence** shows collection
POSTs and receipt PDF GETs, including the canonical URL and number of retries.

After building the fixture, run the focused browser regression suite:

```powershell
node node_modules/@playwright/test/cli.js test --config e2e/finance/charge-receipt-preview.config.ts
```

Its local report is saved in `.artifacts/charge-receipt-preview`. It covers the charge-only
preview, valid PDF download bytes, refreshed paid charge state, cleared collection amount,
absence of stale allocation/generic errors, and retry with exactly one collection POST.

## Selection and bank-label regression

Choose **Selection regression**, then open Diya's collection dialog. This scenario
marks June–October tuition and Quarter 1 transport paid and adds paid Sports and
unpaid ART charges. Across the June–May academic year, All Pending selects 10
installments, All Charges selects five unpaid charges, First 6 Month selects two
installments, and Last 6 Month selects eight. Verify a single click, overlap,
unticking, manual edits, grouping changes, and counts/totals before any collection.

The routing lookup also supplies malformed legacy labels (`SBI - null`,
`AXIS - undefined`) alongside a masked SBI account and a named HDFC account.
Select Cheque to verify the dropdown and its selected label omit missing-value text
and preserve valid account identifiers. These IDs and labels are synthetic.
Bank-only responses with redacted numbers also include masked or named metadata:
verify `SBI - XXXX6789` and `AXIS - School Fees` appear in the options and selected value.

With **All Pending** and **All Charges** selected, click **Refresh selection balances**
inside the collection dialog. This synthetic refetch pays November tuition and ART Charge,
and reduces December tuition to ₹500. Selection drops from 15 items / ₹22,720 to
13 items / ₹18,109. Both presets remain checked; the newly paid rows are disabled and
absent from checkout. Unticking All Pending leaves four unpaid charges / ₹400;
unticking All Charges then clears checkout. No backend balances are changed.
