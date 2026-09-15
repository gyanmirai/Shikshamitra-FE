---
module: library
domain: testing
content_type: Troubleshooting
status: canonical
updated_on: 2026-09-15
owner: frontend-team
audience: humans-and-agents
---

# Validate Library frontend changes

TL;DR: run docs validation for documentation changes and targeted Library tests for client, adapter, release-surface, and browser changes.
Do not claim Library behavior is validated unless the relevant tests or a stronger suite ran.

## Documentation checks

Run one of these commands after editing Library docs.

```powershell
node scripts/docs/validate-docs.mjs --module library
npm run docs:check
```

## Focused frontend checks

Use these commands as the first validation set.

| Risk area | Command |
|---|---|
| Library adapters | `npm run test -- src/redux/library/library-adapters.test.ts` |
| Library endpoint contracts | `npm run test -- src/redux/library/library-endpoints.contract.test.ts` |
| Release surface | `npm run test -- src/screens/library/library-release-surface.test.ts` |
| Browser release gate | `npx playwright test e2e/library/library-release-gate.spec.ts` |
| TypeScript impact | `npm run ts` |

## Add coverage when needed

Add or update tests when a change affects these areas.

| Change | Expected coverage |
|---|---|
| Active route or menu status | Release-surface test |
| Client endpoint shape | Endpoint contract test |
| DTO mapping | Adapter test |
| Report screen behavior | Release-surface or browser gate test |
| End-to-end release behavior | Playwright release gate |
