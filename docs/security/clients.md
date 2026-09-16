---
module: security
domain: permissions
content_type: Reference
status: canonical
updated_on: 2026-09-16
owner: frontend-team
audience: humans-and-agents
---

# Security API clients

`src/redux/permission/permissionApi.ts` retains the existing RTK Query contracts.

| Operation | Contract |
| --- | --- |
| Read catalogue and grant sources | `GET /api/permission-management/permissions?providerName=R|U&providerKey=...` |
| Change direct grants | `PUT /api/permission-management/permissions?providerName=R|U&providerKey=...` |
| Nested catalogue | Existing backend `/api/shikshamitra-permissions/permissions` route remains compatible |

Provider keys are URL-encoded.
Cache invalidation is specific to the selected provider.
The catalogue adapter handles both nested server hierarchies and flat module-level action catalogues.
Navigation supplies familiar feature labels but never limits the set of server entries.
Presentation-only feature groups are never sent as permission names.
The shared role/user form submits only changed direct `{ name, isGranted }` entries under `permissions`.

The form derives direct grants from exact `grantedProviders` identities, not the effective `isGranted` flag.
Inherited role sources are displayed separately and remain effective when a direct user grant is removed.
Before saving, the form refetches and checks the changed entries for server drift and provider eligibility.
After saving, it refetches and verifies persisted direct grants before showing success.
The unchanged API has no compare-and-swap token; the pre-save check does not guarantee conflict-free concurrent writes.
Background refetches and errors preserve dirty drafts.
Changing provider while dirty blocks saving until the original draft is discarded explicitly.

Backend validation, transaction semantics, tenancy, and authorization are defined in the [canonical standard](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/common/security/permission-consistency.md).
No response contract or permission identifier is renamed.
