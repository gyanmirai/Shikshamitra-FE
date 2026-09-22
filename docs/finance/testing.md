---
module: finance
domain: testing
content_type: Troubleshooting
status: canonical
updated_on: 2026-09-21
owner: frontend-team
audience: humans-and-agents
---

# Validate Finance frontend changes

TL;DR: run docs validation for documentation changes and targeted Finance tests for client, mapper, cache, and audit changes.
Do not claim Finance behavior is validated unless the relevant tests or a stronger suite ran.

Active Fee Structure editor, typed client and browser checks: [workspace implementation](./references/fee-structure-workspace.md).

## Documentation checks

Run one of these commands after editing Finance docs.

```powershell
node scripts/docs/validate-docs.mjs --module finance
npm run docs:check
```

## Focused frontend checks

Use these commands as the first validation set.

| Risk area                         | Command                                                                                                                                                   |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Charge client and mapper behavior | No focused Charge Management tests currently exist; add the cases in [Charge Management frontend flow](./references/charge-management-frontend-flow.md), then run their exact test paths |
| Finance audit client contract     | `npm run test -- src/redux/finance/audit/financeAuditApi.contract.test.ts`                                                                                |
| Finance audit UI utilities        | `npm run test -- src/screens/finance/AuditTrail`                                                                                                          |
| Concession document constraints   | `npm run test -- src/screens/finance/Concession/Components/concessionDocumentUpload.test.ts`                                                              |
| Concession request types and UI   | `npm run ts` plus focused ESLint on `src/screens/finance/Concession`, `src/screens/finance/ConcessionAdmin`, and `src/redux/finance/ConcessionManagement` |
| TypeScript impact                 | `npm run ts`                                                                                                                                              |

## Add coverage when needed

Add or update tests when a change affects these areas.

| Change                                    | Expected coverage                              |
| ----------------------------------------- | ---------------------------------------------- |
| Charge request payload                    | Client or mapper test                          |
| Optimistic cache update                   | Client cache test                              |
| Approval, rejection, or reversal behavior | Preview/confirm screen or client mutation test |
| Audit Trail mapping                       | Mapper test                                    |
| Route-level behavior                      | Playwright test before release sign-off        |

Charge release evidence must cover the selected academic year in every query/cache key, exact action permissions plus server `availableActions`, explicit AllInScope versus selected-student audience, preview/stale/idempotent command behavior, server paging, collection refresh, and absence of placeholder correction actions. The complete matrix is in [Charge Management frontend flow](./references/charge-management-frontend-flow.md).

## Student fee assignment

The active assignment drawer, typed client, permissions, retries and verification fixture are documented in [Student fee assignment](./references/student-fee-assignment.md).
