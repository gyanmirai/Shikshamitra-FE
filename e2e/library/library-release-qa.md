# Library Release Gate QA Sign-Off

## Scope
- Active Library menu: dashboard, all books, issue & return, members, charges, reports, notification, and settings.
- Local API is the release gate. Staging smoke is intentionally out of scope until deployment.
- Finance settlement, acquisitions, RFID, ISBN enrichment, SMS/WhatsApp, and report scheduling are out of scope.

## Automated Evidence
- Backend build: `dotnet build --no-restore -m:1`
- Backend app tests: `dotnet test .\test\ShikshaMitra.Application.Tests\ShikshaMitra.Application.Tests.csproj --no-restore --filter FullyQualifiedName~Library -m:1`
- Backend API release-gate tests: `dotnet test .\test\ShikshaMitra.HttpApi.Tests\ShikshaMitra.HttpApi.Tests.csproj --no-restore --filter FullyQualifiedName~LibraryReleaseGateApi_Tests -m:1`
- Frontend unit/contract tests: `npm test -- library`
- Frontend typecheck: `npm run ts -- --pretty false --incremental false`
- Browser E2E: `$env:E2E_LIBRARY='1'; npm run test:e2e -- e2e/library --project=chromium`

## Browser Coverage
- Route smoke checks every active Library route and settings page.
- API-backed workflows cover reservation cancel, issue/return with damaged-charge flow, member tabs, charge create/update/delete, report preview/export, notification send/history, and settings write paths.
- Prototype circulation/settings routes are guarded by unit tests as redirects away from the release surface.

## Latest Status
- Passed on 2026-06-17: backend build, focused Library application tests, Library release-gate API tests, frontend Library unit/contract tests, and frontend TypeScript.
- Browser E2E specs and API fixtures are implemented, but the browser run was blocked because the local API was not listening on `localhost:44332` during this pass.
- A broader HttpApi `FullyQualifiedName~Library` filter run exceeded the local timeout; the targeted release-gate API suite passed and the timed-out testhost was stopped.

## Artifact Hygiene
- Generated Playwright auth, report, and test result artifacts must stay ignored:
  - `playwright/.auth/`
  - `playwright-report/`
  - `test-results/`
