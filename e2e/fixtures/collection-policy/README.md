# Collection policy regression fixture

Run from the frontend root:

```powershell
node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vite/bin/vite.js --config e2e/fixtures/collection-policy/vite.config.mts
```

Open http://127.0.0.1:4195 in the Codex in-app browser. This mounts the actual collection drawer, numeric fields and hook with synthetic API lookups and no backend writes. Verify Create/Edit/Duplicate discard sessions, all calculation types, rejected long numbers/exponents/paste, decimal precision, slab continuity/cutoff errors and submission blocking. Toggle the simulation fixture to inspect the retained summary component independently; the current production drawer omits that sidebar.
