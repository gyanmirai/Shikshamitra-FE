---
module: finance
domain: overview
content_type: Landing
status: canonical
updated_on: 2026-07-06
owner: frontend-team
audience: humans-and-agents
---

# Understand Finance frontend integration

TL;DR: use this page as the entrypoint for Finance routes, screens, clients, workflows, and frontend validation.
Backend Finance docs own product and API truth at [Finance backend docs](../../../Shikshamitra-BE/docs/modules/finance/README.md).

Active Fee Structure editor, typed client and browser checks: [workspace implementation](./references/fee-structure-workspace.md).

## Read order

Follow this order when changing Finance frontend behavior:

| Step | File | Use it to |
|---|---|---|
| 1 | [Finance Engineering Constitution](../../../Shikshamitra-BE/docs/modules/finance/references/constitution.md) | Apply the mandatory cross-stack rules, permission parity, workflow gates, and definition of done |
| 2 | [routes.md](./routes.md) | Confirm visible routes, menu status, and partial surfaces |
| 3 | [clients.md](./clients.md) | Find Redux Toolkit Query clients and backend contract ownership |
| 4 | [workflows.md](./workflows.md) | Trace charge, collection, concession, adjustment, receipt, audit, and report flows |
| 5 | [testing.md](./testing.md) | Pick frontend docs, unit, contract, type, and browser checks |
| 6 | [Concession Policy frontend review](./references/concession-policy-frontend-review.md) | Compare the current partial UI with the target fee-structure, assignment, request, approval, and ledger flow |
| 7 | [Refund Policy frontend flow](./references/refund-policy-frontend-flow.md) | Follow the target staff journey, screen behavior, client wiring, permission gates, settlement actions, and browser acceptance flow |
| 8 | [Proration Policy frontend flow](./references/proration-policy-frontend-flow.md) | Review the current prototype and implement the typed policy, attachment, assignment preview, demand explanation, and cross-module UI flow |

## Ownership boundary

Frontend Finance docs own visible navigation, App Router pages, screen folders, client integration, cache behavior, and browser workflows.
Backend Finance docs own product rules, endpoint contracts, permissions, errors, domain invariants, and data integrity.
Do not duplicate backend behavior here when a link to the backend canonical doc is enough.

## Source of truth

Use these paths before searching broadly:

| Need | Source |
|---|---|
| Visible navigation | `src/constants/finance-menu.ts` |
| App Router pages | `src/app/(auth-route)/finance/**` |
| Screens and components | `src/screens/finance/**` |
| Finance API clients | `src/redux/finance/**`, `src/redux/feeCollection/**`, `src/redux/invoiceAndReceipt/**` |
| Finance tests | `src/redux/finance/**/*.test.ts`, `src/screens/finance/**/*.test.*` |
| Backend docs | `../../../Shikshamitra-BE/docs/modules/finance/README.md` |
| Backend contracts | `../../../Shikshamitra-BE/src/ShikshaMitra.Application.Contracts/Finance/**` |

## For agents

Use this table before code search:

| Question | First file |
|---|---|
| What rules must every Finance change satisfy? | [Finance Engineering Constitution](../../../Shikshamitra-BE/docs/modules/finance/references/constitution.md) |
| Which Finance route or menu item is active? | [routes.md](./routes.md) |
| Which API client owns a call? | [clients.md](./clients.md) |
| Which workflow should I test? | [workflows.md](./workflows.md) |
| Which command should I run? | [testing.md](./testing.md) |
| Which backend API behavior is canonical? | `../../../Shikshamitra-BE/docs/modules/finance/api.md` |
| What is missing from the current Concession Policy UI and how should it integrate? | [Concession Policy frontend review](./references/concession-policy-frontend-review.md) |
| How should the Refund Policy and Fee Refund UI become an end-to-end staff workflow? | [Refund Policy frontend flow](./references/refund-policy-frontend-flow.md) |
| How should Proration Policy become an end-to-end frontend workflow? | [Proration Policy frontend flow](./references/proration-policy-frontend-flow.md) |

## Validation

Run these commands from the `Shikshamitra-FE` repo root:

```bash
npm run docs:check
git diff --check
```

## Source inspection rule

Use the files listed above and current source paths for Finance behavior.
Do not restore old integration plans under `docs/`.
