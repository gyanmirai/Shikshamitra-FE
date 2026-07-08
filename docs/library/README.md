---
module: library
domain: overview
content_type: Landing
status: canonical
updated_on: 2026-07-06
owner: frontend-team
audience: humans-and-agents
---

# Understand Library frontend integration

TL;DR: use this page as the entrypoint for Library routes, screens, clients, workflows, and frontend validation.
Backend Library docs own product and API truth at [Library backend docs](../../../Shikshamitra-BE/docs/modules/library/README.md).

## Read order

Follow this order when changing Library frontend behavior:

| Step | File | Use it to |
|---|---|---|
| 1 | [routes.md](./routes.md) | Confirm visible routes, menu status, and inactive surfaces |
| 2 | [clients.md](./clients.md) | Find Redux Toolkit Query clients, adapters, and backend contract ownership |
| 3 | [workflows.md](./workflows.md) | Trace catalog, issue, return, member, charge, report, and notification flows |
| 4 | [testing.md](./testing.md) | Pick frontend docs, unit, contract, and browser checks |

## Ownership boundary

Frontend Library docs own visible navigation, App Router pages, screen folders, client integration, cache behavior, and browser workflows.
Backend Library docs own product rules, endpoint contracts, permissions, errors, domain invariants, and data integrity.
Do not duplicate backend behavior here when a link to the backend canonical doc is enough.

## Source of truth

Use these paths before searching broadly:

| Need | Source |
|---|---|
| Visible navigation | `src/constants/library-menus.ts` |
| App Router pages | `src/app/(auth-route)/library/**` |
| Screens and components | `src/screens/library/**` |
| Library API clients | `src/redux/library/**` |
| Library tests | `src/redux/library/*.test.ts`, `src/screens/library/*.test.ts`, `e2e/library/**` |
| Backend docs | `../../../Shikshamitra-BE/docs/modules/library/README.md` |
| Backend contracts | `../../../Shikshamitra-BE/src/ShikshaMitra.Application.Contracts/Library/**` |

## For agents

Use this table before code search:

| Question | First file |
|---|---|
| Which Library route or menu item is active? | [routes.md](./routes.md) |
| Which API client owns a call? | [clients.md](./clients.md) |
| Which workflow should I test? | [workflows.md](./workflows.md) |
| Which command should I run? | [testing.md](./testing.md) |
| Which backend API behavior is canonical? | `../../../Shikshamitra-BE/docs/modules/library/api.md` |

## Validation

Run these commands from the `Shikshamitra-FE` repo root:

```bash
npm run docs:check
git diff --check
```

## Source inspection rule

Use the files listed above and current source paths for Library behavior.
Do not restore old handoff notes under `docs/`.
