# Attendance register synthetic browser checks

Run from the frontend root:

```powershell
node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vite/bin/vite.js --config e2e/fixtures/attendance-register/vite.config.mts --configLoader native --port 5189
node e2e/fixtures/attendance-register/check.mjs
```

This mounts the actual register and shared controls with 65 synthetic staff across three organization divisions. Only data hooks, export transport and Next navigation are replaced. No authentication, real API, database, record, or report job is used. The fixture's query projection is a test double; backend API tests separately verify server filtering and scope. Export assertions verify captured criteria, not a generated workbook/PDF. Screenshots/results are written to `.artifacts/attendance-register`.
