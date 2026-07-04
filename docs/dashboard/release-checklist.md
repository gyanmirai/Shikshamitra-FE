# Dashboard Release Checklist

Use this checklist before calling `/dashboard` implementation-complete. It is intentionally scoped to the dashboard surface and does not require HR, Student, Finance, or Academic workflow changes.

## Required Scope

- `/dashboard` renders through the shared template shell for `leadership`, `principalAdmin`, `teacher`, `financeHr`, and `studentParent`.
- Production data source is `GET /api/dashboard/summary`; widget metadata comes from `GET /api/dashboard/widgets` with frontend registry fallback.
- HR, Student, Finance, and Academic widgets surface existing scoped module data only.
- Backend permission filtering is authoritative; frontend permission filtering remains defense in depth.
- Every returned widget is registered, permission-gated, scoped, and actionable through a safe relative drilldown or accountable owner.
- Unsupported areas stay readiness/drilldown-only instead of showing invented live values.

## Dashboard-Only Verification

Clean-environment CI gates:

- FE: `.github/workflows/dashboard-validation.yml`
- BE: `../Shikshamitra-BE/.github/workflows/dashboard-api-tests.yml`

Run from `Shikshamitra-BE`:

```powershell
dotnet test test\ShikshaMitra.HttpApi.Tests\ShikshaMitra.HttpApi.Tests.csproj --filter Dashboard
```

Run from `Shikshamitra-FE`:

```powershell
npm run test:dashboard
npm run lint:dashboard
npm run test:e2e:dashboard -- --list
$env:NODE_OPTIONS='--max-old-space-size=8192'; npm run ts
npm run build
```

Run with local BE and FE available:

```powershell
$env:E2E_API_URL='https://localhost:44332'
$env:NEXT_PUBLIC_API_URL='https://localhost:44332'
$env:E2E_BASE_URL='http://localhost:3000'
$env:E2E_TENANT='DDVS'
$env:E2E_HR_EMAIL='hr-manager@ddvs.com'
$env:E2E_HR_PASSWORD='Temp@123'
npm run test:e2e:dashboard
```

If browser E2E is blocked by local runtime restrictions, run the API smoke and record the browser blocker separately. Prefer the normal HTTPS backend URL; use the local HTTP validation URL only when HTTPS is blocked by the local certificate/transport setup:

```powershell
$env:E2E_API_URL='https://localhost:44332'
$env:E2E_TENANT='DDVS'
.\e2e\dashboard\dashboard-api-smoke.ps1

# Local HTTP fallback when the backend was started with
# AuthServer__Authority=http://localhost:44334
# AuthServer__DisableTransportSecurityRequirement=true
$env:E2E_API_URL='http://localhost:44334'
$env:E2E_TENANT='DDVS'
.\e2e\dashboard\dashboard-api-smoke.ps1
```

## Sign-Off Rules

- Do not sign off if backend dashboard tests fail.
- Do not sign off if dashboard unit tests, targeted lint, TypeScript, or production build fail in a clean environment.
- Do not sign off if dashboard E2E discovery does not list the expected browser specs.
- Do not sign off browser behavior until dashboard E2E passes against DDVS or the same coverage passes in CI.
- Do not count API smoke as a replacement for browser E2E; it is only a backend contract fallback when browser tooling is locally blocked.
- If local browser execution fails with `spawn EPERM`, run the browser E2E in CI or another shell that allows Node and Chromium child processes.
- Restore `next-env.d.ts` if build tooling changes it.
- Keep unrelated nav, layout, logo, HR, Student, Finance, Academic, and legacy module workflow changes out of dashboard release scope.

## Current Known Deferred Product Sources

- Communication announcements need a module-owned scoped announcement feed.
- Transport/Security exception counts need module-owned scoped operational aggregate sources.
- Student/Parent transport, safety, and richer risk/performance summaries need trusted personal identity mapping.
- Official government portal status for UDISE+, APAAR, CBSE, and safety certificates is not part of the current local-readiness dashboard.
