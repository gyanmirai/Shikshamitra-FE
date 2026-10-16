# Shared permission feedback browser regression

This local fixture uses production API clients from HR, Transport, Library, and Academics,
the shared RTK base query, error parser, query/mutation wrapper, toast API, and Snackbar.
Authentication and every `/api/` response are synthetic. The fixture never calls an external
service or writes school data.

Run from the frontend repository:

```powershell
node node_modules/playwright/cli.js test --config e2e/security/shared-permission-feedback.config.ts
```

For a manual smoke test:

```powershell
node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vite/bin/vite.js --config e2e/fixtures/shared-permission-feedback/vite.config.mts
```

Open `http://127.0.0.1:4198/`. The buttons exercise real GET, POST, PUT, and DELETE clients
through automatic feedback, parsed manual feedback, and a legacy `error.data.message` catch.
The extra synthetic endpoint covers the neutral fallback for an unmapped operation.

Use `?ownership=silent` to verify that an inline error owner can suppress automatic feedback.
Use `?response=validation`, `conflict`, `unavailable`, or `specific-forbidden` to inspect errors
whose status, code, and message must remain unchanged.

Desktop and mobile checks cover operation-specific guidance, identical-message deduplication,
distinct simultaneous messages, owner-controlled notification suppression, preserved business
errors, viewport bounds, a 44-pixel Close target, keyboard dismissal, and the longer permission-warning
lifetime. This fixture exercises the
shared client feedback path; backend authorization and full module workflows have separate coverage.

Generated reports and screenshots are stored under `.artifacts/shared-permission-feedback/`.
