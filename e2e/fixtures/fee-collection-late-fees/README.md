# Fee collection late-fee browser contract fixture

Run from the frontend root:

```powershell
node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vite/bin/vite.js --config e2e/fixtures/fee-collection-late-fees/vite.config.mts
```

Open `http://127.0.0.1:5177/` in the Codex in-app browser.

If the Windows dev dependency optimizer stalls, build and preview the same fixture instead
(run these commands sequentially from the frontend root):

```powershell
node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vite/bin/vite.js build --config e2e/fixtures/fee-collection-late-fees/vite.config.mts --outDir ../../../.artifacts/fee-collection-late-fees-browser
node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vite/bin/vite.js preview --config e2e/fixtures/fee-collection-late-fees/vite.config.mts --outDir ../../../.artifacts/fee-collection-late-fees-browser --host 127.0.0.1 --port 5177 --strictPort
```

Rebuild after source edits when using static preview. Built output stays in the local `.artifacts`
directory and is not part of this fixture's source changes.

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
4. Confirm the HTML receipt contains tuition and transport, with no late fees. PDF generation
   intentionally returns unavailable in this fixture.
5. Finish the receipt and reopen collection. Confirm selected principal items reflect the payment,
   while all four charges remain pending and selectable through All Charges.
6. Use Request evidence on the grid to inspect captured POST requests. A fee-only payment must
   send an empty `lateFeePayments` array.
7. Collect charges alone or waive one with a reason, then confirm Pending Charges refreshes while
   Total Charges retains the assessed amount. Reset synthetic scenario restores all balances.

The full synthetic ledger contains ₹24,000 tuition and ₹9,600 transport; its six selected
installments reproduce the reported ₹12,396 payment. Reloading or resetting discards all
synthetic payments and waivers. No production student data is changed.
