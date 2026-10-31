# Finance table search and filter fixture

This read-only local fixture mounts the production Receipts, six active Reconciliation tables and direct-access Adjustments table with 70 synthetic receipts and 76 entries per payment method.
It uses the real generated RTK Query clients with a synthetic transport and rejects writes.
It verifies frontend query wiring, rendered results and shared table behavior; it does not verify backend persistence, authorization, SQL filtering or tenant data.

From the frontend repository root, run:

```powershell
node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vite/bin/vite.js build --config e2e/fixtures/finance-table-search/vite.config.mts --outDir ../../../.artifacts/finance-table-search-browser
node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vite/bin/vite.js preview --config e2e/fixtures/finance-table-search/vite.config.mts --outDir ../../../.artifacts/finance-table-search-browser --host 127.0.0.1 --port 5195 --strictPort
```

In the Codex in-app browser, verify receipt page two, name/GR/receipt-number search, no matches, Clear search, and combined October/receipt-type criteria.
For each reconciliation tab, search Zoya or GR 2075 beyond the old default page, clear it, and move to page two.
Apply Amount Greater Than 7500 and verify P-076 is the only match even though it originally sat beyond the first page; Clear restores 76. Apply an impossible Amount criterion and verify an empty table without an empty-month warning.
For Receipts, apply Paid Amount Greater Than 6900 and Receipt Type Contains Provisional; R-070 is the only match. Clear restores 70. Try the Receipt Date criterion together with amount/name criteria.
Column criteria are evaluated across the full synthetic dataset before paging, using display labels, GR suffixes and masked card values. This transport is browser-test data only; independent backend HTTP tests own persistence and scope proof.
Choose Approved and check that 2075 has no matches while 2001 returns one approved entry.
Verify status changes reset the page; check Columns, current-page Export and fullscreen remain available, keyboard controls and narrow/light/dark layouts.

The Adjustments preview uses the direct-access table with synthetic Pending and Rejected records.
Verify GR 3001 in Pending and GR 3002 in Rejected, name/GR search and the column filter menus.
This preview does not remove the legacy first-100 cap in that screen.
