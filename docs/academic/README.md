---
module: academic
domain: overview
content_type: Landing
status: canonical
updated_on: 2026-10-29
owner: frontend-team
audience: humans-and-agents
---

# Use Academic insights and guided setup

TL;DR: these pages describe the role-aware Academic Insights dashboard, the setup guide, existing settings destinations, and frontend validation.
The guide reuses the existing configuration managers and their real save operations.
The client notes also cover validation of the dashboard sections reached when leaving setup.
Operational Academic routes remain mapped in the module constants and test inventory; Examination also has its own maintained documentation.

## Read order

| Need | Read |
| --- | --- |
| Dashboard data, cache ownership and graph states | [Clients](clients.md#insights-dashboard-client) |
| Role ordering, permitted workflows and personal dashboards | [Workflows](workflows.md#use-the-insights-dashboard) |
| Guide route, visible settings, and permissions | [Routes](routes.md) |
| Progress queries, configuration clients, and cache behavior | [Clients](clients.md) |
| First visit, resume, real form saves, and review | [Workflows](workflows.md) |
| Focused checks and browser scenarios | [Testing](testing.md) |
| Operational workspace paging, report downloads and lazy queries | [Clients](clients.md#operational-read-clients) |
| Examination workflows outside this guide | [Examination](../examination/README.md) |

## Source of truth

| Responsibility | Source |
| --- | --- |
| Active approved-image dashboard presentation | `src/screens/academic/dashboard-design/`, `src/screens/academic/academic-image-dashboard.tsx` |
| Preserved Insights screen, shared query hook, role ordering and permission-filtered workflow catalogue | `src/screens/academic/insights/`, `src/screens/academic/academic-dashboard.tsx` |
| Insights response validation and RTK Query client | `src/redux/academicAPI/academicInsightsApi.ts`, `academicInsightsResponse.ts` |
| Academic routes, sidebar labels, and permission identifiers | `src/constants/academic-menu.ts` |
| Permitted module navigation | `src/utils/academic-navigation-access.ts` |
| Guide stages and the nine-setting catalogue | `src/screens/academic/setup/academic-setup-catalog.ts` |
| Guide position and permission-filtered review model | `src/screens/academic/setup/academic-setup-model.ts` |
| Guide state and visit client | `src/redux/academic-setup/api.ts` |
| Embedded managers and actual form state | `src/screens/academic/setup/embedding/` |
| Shared setup workspace | `src/components/setup-flow/` |
| Backend rules and API contract | [Academic guide](../../../Shikshamitra-BE/docs/modules/academic/README.md) and [API reference](../../../Shikshamitra-BE/docs/modules/academic/api.md) |

## For agents

Read the catalogue before changing included settings.
Read the owning manager before changing a form, validator, permission check, or mutation payload.
Keep guide progress distinct from domain records and preserve the existing dirty-close owner.
Use [DESIGN.md](../../DESIGN.md), the frontend patterns skill, and the UI consistency guides before changing the workspace.
Backend contracts own visit semantics, configuration status, concurrency, authorization, and tenant isolation.

## Validation

Run `npm run docs:check`, `npm run ts`, focused tests and lint, and `git diff --check`.
Use [testing.md](testing.md) for exact focused commands and final browser expectations.
