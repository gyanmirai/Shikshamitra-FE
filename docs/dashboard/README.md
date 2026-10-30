---
module: dashboard
domain: overview
content_type: Landing
status: canonical
updated_on: 2026-10-29
owner: frontend-team
audience: humans-and-agents
---

# Understand Dashboard frontend integration

TL;DR: use this page as the entrypoint for the main `/dashboard` command center.
Dashboard frontend docs own template selection, widget rendering, client integration, and browser validation.
The shared renderer composes eight presentations for leadership, principal, admissions, teacher, finance, HR, student, and parent, while retaining the five backend templates.
Each presentation uses the shared breadcrumb header, equal KPI cards, a role-specific focus, priority actions, module summaries, agenda, exceptions, and updates.

## Read order

Follow this order when changing Dashboard frontend behavior:

| Step | File | Use it to |
|---|---|---|
| 1 | [routes.md](./routes.md) | Confirm the main route, navigation entry, and role template boundary |
| 2 | [clients.md](./clients.md) | Find the dashboard data client, adapters, metadata, and backend contract |
| 3 | [workflows.md](./workflows.md) | Trace template resolution, widget loading, filtering, and error handling |
| 4 | [testing.md](./testing.md) | Pick docs, unit, lint, and browser validation commands |

## Ownership boundary

Frontend Dashboard docs own route wiring, role composition, semantic widget renderers, the defense-in-depth widget registry, data adapters, safe drilldown handling, and browser behavior.
Backend Dashboard docs own summary API behavior, widget metadata contracts, slice execution, permissions, and tenant-scoped data.
Do not duplicate backend behavior here when a link to the backend architecture decision is enough.

## Source of truth

Use these paths before searching broadly:

| Need | Source |
|---|---|
| App Router page | `src/app/(auth-route)/dashboard/page.tsx` |
| Root navigation entry | `src/layouts/config-nav-dashboard.tsx` |
| Dashboard screens | `src/screens/mainDashboard/**` |
| Dashboard API client | `src/redux/dashboard/dashboardApi.ts` |
| Dashboard tests | `src/screens/mainDashboard/*.test.*`, `src/redux/dashboard/dashboardApi.test.ts`, `e2e/dashboard/**` |
| Backend contract decision | [004-dashboard-command-center-contract.md](../../../Shikshamitra-BE/docs/architecture/decisions/004-dashboard-command-center-contract.md) |

## For agents

Use this table before code search:

| Question | First file |
|---|---|
| Which route renders the command center? | [routes.md](./routes.md) |
| Which client owns the summary call? | [clients.md](./clients.md) |
| Which flow controls widgets and permissions? | [workflows.md](./workflows.md) |
| Which command should I run? | [testing.md](./testing.md) |

## Validation

Run these commands from the `Shikshamitra-FE` repo root:

```bash
npm run docs:check
git diff --check
```

## Source inspection rule

Use the files listed above and current source paths for Dashboard behavior.
Do not restore old PRDs, phase plans, or release notes under `docs/`.
