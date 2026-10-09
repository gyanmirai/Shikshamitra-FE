---
module: host-tenants
domain: platform
content_type: Reference
status: canonical
updated_on: 2026-10-08
owner: frontend-team
audience: humans-and-agents
---

# Host tenant frontend validation

TL;DR: validate contract helpers, account initialization, route isolation and browser create/edit/status flows.

## Commands

```powershell
npm run ts
node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run src/redux/auth/authSlice.test.ts src/redux/host-tenants/session-context.test.ts src/screens/host-tenants/services/tenant-form.test.ts src/auth-token.test.ts src/components/auth-route-layout/index.test.tsx src/components/normal-route-layout/index.test.tsx src/redux/session-cache.test.ts --pool=threads
npx playwright test --config=e2e/host-tenants/playwright.config.mjs
node scripts/docs/validate-docs.mjs --module host-tenants
git diff --check
```

Password regression checks:

```powershell
node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run src/screens/host-tenants/services/tenant-form.test.ts src/screens/host-tenants/services/tenant-password.test.ts --pool=threads
node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run src/utils/api-problem-details.test.ts --pool=threads -t 'ABP identity'
node node_modules/@playwright/test/cli.js test --config e2e/host-tenants/playwright.config.mjs --grep 'password'
```

The password checks cover configurable character/length/uniqueness rules, rejection before POST, actionable server field errors, correction/resubmission and settings retry with draft preservation.

## Local evidence (2026-10-08)

- All seven focused unit files passed: 33 tests, no skipped tests. Coverage includes verified host/school route isolation, trailing slashes, stale account results, session-cache invalidation and typed form serialization.
- All six Playwright checks passed together: host landing without a dashboard detour, single Tenant navigation item, paging/search, create/edit/status, read-only grants, inactive login, mobile retry/draft protection, concurrency reload, local logout and repeat login.
- Final Codex in-app browser smoke passed after automated checks: direct host login, one Tenant menu item, same-route mobile drawer closure, immutable school code, detail editing, deactivation with reason, reactivation and synthetic tenant creation.
- Mobile checks used a 390×844 touch viewport and verified 44px buttons, focused first field, dialog focus containment, visible actions and no document overflow.
- The browser suite exercises the actual Next.js app, NextAuth, Redux, shared components and RTK clients with a loopback synthetic HTTP fixture containing 32 schools. It does not replace application hooks or services.
- Focused module docs, TypeScript source checks and zero-warning lint for touched feature/shell files were run. The global TypeScript command still reports four unchanged errors in concession-type-form, fee-category-readonly and custom-select/descriptions.test fixtures.
- Full docs validation retains 27 existing testing-document issues. Focused host-tenant docs pass.
- Screenshot evidence is retained at `.artifacts/host-tenant-proof/tenant-workspace.png`; it shows the actual application with synthetic school data.

Password follow-up: 17 focused unit checks and three browser regressions pass; the create/edit/status workflow also passes with settings loading enabled.
Full TypeScript retains five unrelated errors, including `src/screens/student/dashboard/dashboard-test-fixture.ts` missing sessionContext.
The full shared error-parser suite retains an existing Admissions.FormMakerCheckerRequired message failure, reproduced using the unchanged HEAD parser.

## Limits

The browser fixture uses synthetic credentials and data; native token, authorization and persistence evidence belongs to backend tests.
Deployment, a combined native API/browser environment and production performance profiling have not been run.
Generated screenshots, traces and preview output remain ignored under `.artifacts/host-tenant-browser/` and `.artifacts/host-tenant-next/`.

[Backend testing](../../../Shikshamitra-BE/docs/modules/host-tenants/testing.md) owns token, persistence and permission checks.
