---
module: host-tenants
domain: platform
content_type: Reference
status: canonical
updated_on: 2026-10-08
owner: frontend-team
audience: humans-and-agents
---

# Host workspace routes

TL;DR: host sessions land on Tenant and cannot render school workspace routes.

| Route or shell | Source and behavior |
| --- | --- |
| /host/tenants | `src/app/(auth-route)/host/tenants/page.tsx`; renders `src/screens/host-tenants/index.tsx` |
| Login landing | `src/components/normal-route-layout/index.tsx`; waits for verified account context |
| Protected routes | `src/components/auth-route-layout/index.tsx`; gates initialization, identity and workspace |
| Host shell | `src/components/auth-route-layout/workspace.tsx`; bypasses school onboarding and SubLayout |
| Main navigation | `src/layouts/dashboard/layout.tsx`; host sees one Tenant item |
| Mobile navigation | `src/layouts/dashboard/nav-mobile.tsx`; selecting Tenant closes the host drawer even when already on that route |
| Header | `src/layouts/core/header-base.tsx`; host title and no school context controls |

Host users visiting a school route are redirected to Tenant before its children render.
School users visiting /host/ routes return to their dashboard when setup is complete, or to their saved initial setup when incomplete.
See [initial setup routing](../initial-setup/routes.md).
Host accounts with no View grant retain the Tenant entry and see an access message.
Actions use the backend-confirmed capabilities, while backend checks remain authoritative.
