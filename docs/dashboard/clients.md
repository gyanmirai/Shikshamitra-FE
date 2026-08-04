---
module: dashboard
domain: clients
content_type: Reference
status: canonical
updated_on: 2026-08-03
owner: frontend-team
audience: humans-and-agents
---

# Find Dashboard frontend clients

TL;DR: Dashboard renders the backend summary contract through `src/redux/dashboard/dashboardApi.ts`.
The main screen layer adapts that data into template widgets under `src/screens/mainDashboard/**`.
Production rendering does not request the metadata endpoint separately or replace failed live data with mock operational values.

## Client map

Use this table to find the first integration file.

| Need | Source |
|---|---|
| Summary API client | `src/redux/dashboard/dashboardApi.ts` |
| Client contract tests | `src/redux/dashboard/dashboardApi.test.ts` |
| Data source selection | `src/screens/mainDashboard/dashboard-data-source.test.tsx` and nearby source |
| Backend-to-widget adapter | `src/screens/mainDashboard/dashboard-adapter.test.ts` and nearby source |
| Widget metadata fallback behavior | `src/screens/mainDashboard/dashboard-metadata.test.ts` and nearby source |
| Widget registry behavior | `src/screens/mainDashboard/dashboard-widget-registry.test.ts` and nearby source |
| Permission filtering | `src/screens/mainDashboard/dashboard-permissions.test.ts` and nearby source |
| Template resolver | `src/screens/mainDashboard/dashboard-template-resolver.test.ts` and nearby source |

## Backend contract

The frontend contract is anchored by the backend architecture decision.
Use [004-dashboard-command-center-contract.md](../../../Shikshamitra-BE/docs/architecture/decisions/004-dashboard-command-center-contract.md) before changing payload semantics.

## Client rules

Keep these rules when changing Dashboard clients.

| Rule | Reason |
|---|---|
| Prefer backend summary data in production | Mock and preview data are development paths |
| Treat metadata permissions as backend-owned | Frontend filtering is defense in depth |
| Keep drilldown URLs safe and relative | Widgets should not navigate outside the app shell |
| Preserve `zoneErrors` behavior | A failed slice should not blank the whole dashboard |
| Never replace a failed live summary with mock values | Operational dashboards must not display synthetic data as current school truth |
| Preserve semantic fields such as `kind`, `priority`, `actionLabel`, scope, freshness, and data state | Shared renderers need meaning without embedding page layout in the API |
