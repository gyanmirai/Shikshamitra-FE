---
module: hr
domain: overview
content_type: Landing
status: canonical
updated_on: 2026-10-19
owner: frontend-team
audience: humans-and-agents
---

# Understand HR frontend integration

TL;DR: use this page as the entrypoint for HR routes, screens, clients, workflows, and frontend validation.
Backend HR docs own product and API truth at `../../../Shikshamitra-BE/docs/modules/hr/README.md`.

## Read order

Follow this order when changing HR frontend behavior:

| Step | File | Use it to |
|---|---|---|
| 1 | [routes.md](./routes.md) | Confirm visible routes, menu status, and permission gates |
| 2 | [clients.md](./clients.md) | Find RTK Query clients and backend contract ownership |
| 3 | [workflows.md](./workflows.md) | Trace screen-level user flows and partial surfaces |
| 4 | [testing.md](./testing.md) | Pick frontend docs, unit, contract, and browser checks |

## Ownership boundary

Frontend HR docs own visible navigation, App Router pages, screen folders, client integration, cache behavior, and browser workflows.
Backend HR docs own product rules, endpoint contracts, permissions, errors, domain invariants, and data integrity.
Do not duplicate backend behavior here when a link to the backend canonical doc is enough.

## Source of truth

Use these paths before searching broadly:

| Need | Source |
|---|---|
| Visible navigation | `src/constants/hr-menus.ts` |
| App Router pages | `src/app/(auth-route)/hr/**/page.tsx` |
| Screens and components | `src/screens/hr/**` |
| HR API clients | `src/redux/hr/**`, `src/redux/runPayroll/runPayrollApi.ts` |
| HR tests | `e2e/hr/**`, `src/redux/hr/*.test.ts`, `src/screens/hr/**/*.test.*` |
| Backend docs | `../../../Shikshamitra-BE/docs/modules/hr/README.md` |
| Backend contracts | `../../../Shikshamitra-BE/src/ShikshaMitra.Application.Contracts/HR/**` |

## For agents

Use this table before code search:

| Question | First file |
|---|---|
| Which HR route or menu item is active? | [routes.md](./routes.md) |
| Which API client owns a call? | [clients.md](./clients.md) |
| Which workflow should I test? | [workflows.md](./workflows.md) |
| How do I demo HR end to end? | [references/end-to-end-demo-guide.md](./references/end-to-end-demo-guide.md) |
| Which command should I run? | [testing.md](./testing.md) |
| Which backend API behavior is canonical? | `../../../Shikshamitra-BE/docs/modules/hr/api.md` |

## Validation

Run these commands from the `Shikshamitra-FE` repo root:

```bash
npm run docs:hr:check
npm run docs:check
git diff --check
```

## Source inspection rule

Use the files listed above and current source paths for HR frontend behavior.
Do not restore old PRDs, technical specs, or acceptance docs under `docs/`.

## Consistent HR tables

Use [the route-to-table checklist](./references/hr-table-coverage.md) when changing primary or embedded HR surfaces.
Minimals is the design foundation and attendance register is the table reference.
