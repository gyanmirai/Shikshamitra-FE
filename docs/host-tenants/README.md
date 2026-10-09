---
module: host-tenants
domain: platform
content_type: Landing
status: canonical
updated_on: 2026-10-08
owner: frontend-team
audience: humans-and-agents
---

# Host tenant frontend

## TL;DR

TL;DR: the host workspace opens Tenant directly and shows one Tenant navigation item.
School sessions continue through their existing workspace.

## Read order

1. [Routes](routes.md)
2. [Clients](clients.md)
3. [Workflows](workflows.md)
4. [Testing](testing.md)

## Source of truth

| Concern | Source |
| --- | --- |
| Route | `src/app/(auth-route)/host/tenants/page.tsx` |
| Screen | `src/screens/host-tenants/` |
| Client | `src/redux/host-tenants/` |
| Navigation constants | `src/constants/host-tenant-menu.ts` |

[Backend documentation](../../../Shikshamitra-BE/docs/modules/host-tenants/README.md) owns provisioning, status, permissions and database behavior.

## For agents

Read DESIGN.md and the frontend-patterns skill before editing this screen.
Keep host account context independent from a client role name.

## Validation

Run [focused checks](testing.md), `npm run docs:check` and `git diff --check`.
