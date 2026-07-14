---
module: dashboard
domain: testing
content_type: Troubleshooting
status: canonical
updated_on: 2026-07-06
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
| Dashboard lint | `npm run lint:dashboard` |
| Browser smoke | `npx playwright test e2e/dashboard/dashboard-smoke.spec.ts` |
| TypeScript impact | `npm run ts` |

## Add coverage when needed

Add or update tests when a change affects these areas.

| Change | Expected coverage |
|---|---|
| Template resolution | Template resolver unit test |
| Widget metadata | Metadata or registry unit test |
| Permission filtering | Permission unit test |
| API payload mapping | Dashboard API or adapter test |
| Route-level behavior | Playwright smoke test |
