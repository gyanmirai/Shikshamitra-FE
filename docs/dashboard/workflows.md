---
module: dashboard
domain: workflows
content_type: How-to
status: canonical
updated_on: 2026-10-29
owner: frontend-team
audience: humans-and-agents
---

# Trace Dashboard frontend workflows

TL;DR: start at the route, initialize authenticated context, load the current-context summary, adapt widgets and focus, then apply frontend permission filtering.
Use this page to pick the first files for common Dashboard changes.

## Trace initial render

The command center starts at `/dashboard`.

1. Inspect `src/app/(auth-route)/dashboard/page.tsx`.
2. Inspect the main screen entry under `src/screens/mainDashboard/**`.
3. Inspect the template resolver under `src/screens/mainDashboard/**`.
4. Inspect the active template view under `src/screens/mainDashboard/**`.

## Trace data loading

Production rendering requests the summary API; the metadata endpoint remains available to clients but is not queried separately for each render.

1. Inspect `src/redux/dashboard/dashboardApi.ts`.
2. Inspect the data source layer under `src/screens/mainDashboard/**`.
3. Inspect the adapter layer under `src/screens/mainDashboard/**`.
4. Compare payload semantics with the backend contract decision.

`use-main-dashboard.ts` waits for an authenticated identity, initialized permissions, dashboard access, tenant, and academic year before enabling the query.
Production presentation follows backend role policy; template overrides require both a development build and explicit `dashboardPreview=true`.
The global academic-year control remains in the authenticated shell.

## Trace personal dashboards

Student and parent views consume verified student options returned by the summary API.
The linked-student selector requests the chosen `studentId` and resets on identity, tenant, year, template, or permission-context changes.
Personal rendering requires matching returned selection, an allowed child option, and `accessMode: personal`.
The personal widget whitelist and absent staff drilldowns provide defense in depth; backend validation remains authoritative.

## Trace focus presentation

`dashboard-focus-view.tsx` selects the matching chart, list, or saved-evidence metrics.
Charts use the shared Chart/useChart components and provide a keyboard-accessible data disclosure.
Payroll shows its saved period and evidence timestamp, or an unavailable message when saved evidence is absent.
Loading, empty, unavailable, zero, and failed data have distinct presentations.

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
| Account, year, or selected-child change | Hide previous-context values while the new request loads |
| HTTP 401 or 403 after a successful load | Remove retained values and show access failure |
| Other refresh failure in the same context | Keep previous values with an explicit refresh-failure notice |
