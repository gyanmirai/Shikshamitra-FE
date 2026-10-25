# Synthetic onboarding salary browser test

Run `npx playwright test --config e2e/hr/onboarding-salary.config.ts` from the frontend repository.
Set `E2E_BROWSER_EXECUTABLE_PATH` to an installed Chromium-family desktop browser when the Playwright browser package is unavailable.
The harness binds only to `127.0.0.1:3955` and uses a temporary browser profile.
It renders the production onboarding dialog and salary editor with module-local synthetic hook replacements.
It never calls staff or tenant mutation APIs.
Backend persistence, scope enforcement, rollback, and concurrency are covered separately by `EmployeeApplicationFinalizationPostgres_Tests` against an empty disposable loopback `payroll_tests_*` database.

The browser test covers salary before Finalize, the combined request, preview validation, back/forward preservation, cancel protection, a failed finalization with retry, and duplicate submission.
Screenshots and test output stay under `.artifacts/onboarding-salary-browser`.
For manual desktop inspection, run `npx vite --config e2e/hr/onboarding-salary-harness/vite.config.mjs` and open the loopback URL.
