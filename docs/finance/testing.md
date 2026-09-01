---
module: finance
domain: testing
content_type: Troubleshooting
status: canonical
updated_on: 2026-07-06
owner: frontend-team
audience: humans-and-agents
---

# Validate Finance frontend changes

TL;DR: run docs validation for documentation changes and targeted Finance tests for client, mapper, cache, and audit changes.
Do not claim Finance behavior is validated unless the relevant tests or a stronger suite ran.

## Documentation checks

Run one of these commands after editing Finance docs.

```powershell
node scripts/docs/validate-docs.mjs --module finance
npm run docs:check
```

## Focused frontend checks

Use these commands as the first validation set.

| Risk area | Command |
|---|---|
| Charge client and mapper behavior | `npm run test -- src/redux/finance/ChargeManagement` |
| Finance audit client contract | `npm run test -- src/redux/finance/audit/financeAuditApi.contract.test.ts` |
| Finance audit UI utilities | `npm run test -- src/screens/finance/AuditTrail` |
| Concession document constraints | `npm run test -- src/screens/finance/Concession/Components/concessionDocumentUpload.test.ts` |
| TypeScript impact | `npm run ts` |

## Add coverage when needed

Add or update tests when a change affects these areas.

| Change | Expected coverage |
|---|---|
| Charge request payload | Client or mapper test |
| Optimistic cache update | Client cache test |
| Approval or rejection behavior | Screen or client mutation test |
| Audit Trail mapping | Mapper test |
| Route-level behavior | Playwright test before release sign-off |
