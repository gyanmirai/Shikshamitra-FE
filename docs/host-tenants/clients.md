---
module: host-tenants
domain: platform
content_type: Reference
status: canonical
updated_on: 2026-10-08
owner: frontend-team
audience: humans-and-agents
---

# Host tenant clients

TL;DR: the module uses the existing shared RTK API and verifies account mode during auth initialization.

| Concern | Source |
| --- | --- |
| Account-context validation | `src/redux/host-tenants/session-context.ts` |
| Context and permission bootstrap | `src/redux/auth/authSlice.ts` |
| Endpoint namespace | `src/redux/host-tenants/host-tenant-module-api.ts` |
| List, detail, create, edit, status | `src/redux/host-tenants/host-tenant-api.ts` |
| DTO types | `src/redux/host-tenants/types.ts` |
| Cache tag | `src/redux/tagTypes.ts`; HostTenants |
| Form serializer | `src/screens/host-tenants/services/tenant-form.ts` |

Successful writes invalidate both list and detail reads through the module tag.
Failed writes preserve form values and do not claim success.
A status/detail concurrency error offers an explicit latest-record reload.
Identity changes clear school selectors and API caches through ReduxProvider.
Host initialization uses the four backend-confirmed tenant capabilities and does not request school module grants.
School sessions retain their effective-permission initialization.
Table pagination converts the shared table's one-based callbacks into the API's zero-based offset.
The shared API interceptor signs out an inactive school session after a TENANT_INACTIVE response.
Host password and refresh requests omit an empty tenant header.

The [backend API page](../../../Shikshamitra-BE/docs/modules/host-tenants/api.md) owns exact contracts and server validation.
