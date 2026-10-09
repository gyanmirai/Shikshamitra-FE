---
module: initial-setup
domain: routes
content_type: Reference
status: canonical
updated_on: 2026-10-09
owner: frontend-team
audience: humans-and-agents
---

# Initial setup routing

TL;DR: the shared authenticated route layouts use verified backend session context to select the school workspace.

| Context | Destination | Behavior |
| --- | --- | --- |
| Incomplete institute | `/initial-setup` | Resume current saved step; direct school links return here |
| Completed institute | `/dashboard` | Normal school navigation; opening setup returns to dashboard |
| Host administrator | `/host/tenants` | Keep host navigation independent of school setup |
| Incomplete institute without setup permission | `/initial-setup` | Setup-pending message, Check again and sign out |
| Unavailable or malformed session context | Account-context error | Retry rather than assume completion |

The route has no normal module sidebar during the guided workflow.
Its desktop progress sidebar and mobile progress indicator belong to the setup screen.

| Source | Responsibility |
| --- | --- |
| `src/components/auth-route-layout/index.tsx` | Initial authenticated routing |
| `src/components/normal-route-layout/index.tsx` | Guard direct navigation |
| `src/redux/host-tenants/session-context.ts` | Validate server context, including required school completion status |
| `src/redux/host-tenants/workspace-landing.ts` | Central workspace destination and route checks |

Frontend visibility never substitutes for [backend authorization](../../../Shikshamitra-BE/docs/modules/institute-setup/api.md).
