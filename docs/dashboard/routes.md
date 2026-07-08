---
module: dashboard
domain: routes
content_type: Reference
status: canonical
updated_on: 2026-07-06
owner: frontend-team
audience: humans-and-agents
---

# Find Dashboard frontend routes

TL;DR: the main Dashboard frontend surface is `/dashboard`.
Module-specific dashboard routes belong to their own modules and should not be documented here as the main command center.

## Active route

Use this table for route and navigation ownership.

| Surface | Route | Source |
|---|---|---|
| Main command center | `/dashboard` | `src/app/(auth-route)/dashboard/page.tsx` |
| Root navigation item | `/dashboard` | `src/layouts/config-nav-dashboard.tsx` |

## Template boundary

The route renders role-shaped templates instead of separate pages per role.
Template selection lives in `src/screens/mainDashboard/**`.

| Template | Typical audience |
|---|---|
| `leadership` | Owner, director, board, and super admin |
| `principalAdmin` | Principal, vice principal, admin manager, and IT staff |
| `teacher` | Teacher, head of department, academic coordinator, and class teacher |
| `financeHr` | Finance officer, HR manager, payroll operator, and attendance operator |
| `studentParent` | Student, parent, and guardian |

## Related routes outside this module

These routes are module dashboards and should stay in their module docs.

| Route family | Owning docs |
|---|---|
| `/finance/dashboard` | [Finance docs](../finance/README.md) |
| `/hr/dashboard` | [HR docs](../hr/README.md) |
| `/library/dashboard` | [Library docs](../library/README.md) |
| `/student/dashboard` | Student frontend docs when added |
| `/academic/dashboard` | Academic frontend docs when added |
