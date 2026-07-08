---
module: dashboard
domain: workflows
content_type: How-to
status: canonical
updated_on: 2026-07-06
owner: frontend-team
audience: humans-and-agents
---

# Trace Dashboard frontend workflows

TL;DR: start at the route, follow template resolution, load summary and metadata, adapt widgets, then apply frontend permission filtering.
Use this page to pick the first files for common Dashboard changes.

## Trace initial render

The command center starts at `/dashboard`.

1. Inspect `src/app/(auth-route)/dashboard/page.tsx`.
2. Inspect the main screen entry under `src/screens/mainDashboard/**`.
3. Inspect the template resolver under `src/screens/mainDashboard/**`.
4. Inspect the active template view under `src/screens/mainDashboard/**`.

## Trace data loading

Dashboard data comes from backend summary and metadata APIs by default.

1. Inspect `src/redux/dashboard/dashboardApi.ts`.
2. Inspect the data source layer under `src/screens/mainDashboard/**`.
3. Inspect the adapter layer under `src/screens/mainDashboard/**`.
4. Compare payload semantics with the backend contract decision.

## Trace widget visibility

Widget visibility depends on backend metadata and frontend permission filtering.

| Step | Inspect |
|---|---|
| Navigation visibility | `src/layouts/config-nav-dashboard.tsx` |
| Widget registry | `src/screens/mainDashboard/**` |
| Metadata enrichment | `src/screens/mainDashboard/**` |
| Frontend permission filtering | `src/screens/mainDashboard/**` |

## Trace degraded states

Dashboard should keep usable zones when one slice fails.
Inspect `zoneErrors` handling before changing loading, empty, or error states.

| State | Expected behavior |
|---|---|
| Summary slice failure | Show the affected warning and keep other zones usable |
| Missing metadata | Use the fallback registry only where supported |
| Denied widget | Hide the widget after permissions initialize |
| Unsafe drilldown | Drop or neutralize the URL |
