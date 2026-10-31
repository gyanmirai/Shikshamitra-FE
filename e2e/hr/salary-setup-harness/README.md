# Salary setup browser validation

Run `npx playwright test --config e2e/hr/salary-setup.config.ts` from the frontend repository.
For manual inspection, start `node node_modules/vite/bin/vite.js --config e2e/hr/salary-setup-harness/vite.config.mjs` and open `http://127.0.0.1:3956/`.
Use `?view=template` for the production template editor and `?view=settings` for the settings landing page.
The harness uses production screens with loopback-only synthetic hooks and never writes staff or tenant records.
Amounts and save results are synthetic and do not certify backend financial calculations, authorization, or deployed persistence.
Generated output stays under `.artifacts/salary-setup-browser`.
