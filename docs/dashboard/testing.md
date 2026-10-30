---
module: dashboard
domain: testing
content_type: Troubleshooting
status: canonical
updated_on: 2026-10-29
owner: frontend-team
audience: humans-and-agents
---

# Validate Dashboard frontend changes

TL;DR: run docs validation for documentation changes and the Dashboard unit, lint, or browser checks for behavior changes.
Do not claim Dashboard behavior is validated unless the relevant tests or a stronger suite ran.

## Documentation checks

Run one of these commands after editing Dashboard docs.

```powershell
node scripts/docs/validate-docs.mjs --module dashboard
npm run docs:check
```

## Focused frontend checks

Use these commands as the first validation set.

| Risk area | Command |
|---|---|
| Dashboard unit and contract tests | `npm run test:dashboard` |
| Main dashboard and client only | `node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run src/screens/mainDashboard src/redux/dashboard --pool=threads --testTimeout=15000` |
| Dashboard lint | `npm run lint:dashboard` |
| Browser smoke | `npx playwright test e2e/dashboard/dashboard-smoke.spec.ts` |
| TypeScript impact | `npm run ts` |

## Add coverage when needed

Add or update tests when a change affects these areas.

| Change | Expected coverage |
|---|---|
| Template resolution | Template resolver unit test |
| Widget metadata | Metadata or registry unit test |
| Production widget identifiers | Registry contract scans summary, slice, and focus references against both registries, including admissions anchors |
| Permission filtering | Permission unit test |
| API payload mapping | Dashboard API or adapter test |
| Route-level behavior | Playwright smoke test |
| Responsive role composition | Codex in-app browser at 390 by 844, 768 by 1024, and 1440 by 900 |
| Live API failure | Verify the retryable error and absence of mock operational widgets |
| Dashboard navigation | Verify widgets expose normal link semantics and keyboard-visible focus |
| Personal scope | Verify linked-child requests, context reset, unknown-widget rejection, and absence of staff links |
| Cached access revocation | Refetch with HTTP 403 and verify previous child values disappear |
| Focus charts | Verify sparse-series alignment, zero/null, real units, escaped tooltips, and keyboard-accessible values |
| Combined permission requirements | Verify every source grant and destination leaf guard, including `.View` grants |

An isolated synthetic HTTP fixture may mount actual production dashboard components for browser evidence.
Clearly label fixture records and distinguish that evidence from real database, full authenticated shell, or deployment acceptance.
Run automated checks first and perform the final visual smoke in the Codex in-app browser.
