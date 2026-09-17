---
module: security
domain: permissions
content_type: Reference
status: canonical
updated_on: 2026-09-17
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
The editor uses staging's navigation groups and compact action switches.
`account-settings-permissions.ts` maps those controls to existing server permission IDs, retaining staging's Student bundles and Accounts Settings exceptions.
Statutory Schemes Edit maps to the existing `Edit`, `Activate`, `ManageEnrollment`, and `ApproveOverride` grants under `HR.PayrollManagement.Settings.StatutorySchemes`.
Its Revoke All also includes eligible catalogue entries at that exact feature root or beneath its dot-delimited prefix, even when they are not mapped to a displayed action.
Grant All uses only explicitly mapped actions, so an unfamiliar server action cannot be granted implicitly.
Delete remains disabled while no matching server permission exists.
The full server catalogue is retained in the draft, including permissions outside the displayed navigation groups.
Unrelated permissions are preserved rather than rewritten by a grouped save.
Presentation-only feature groups are never sent as permission names.
The shared role/user form submits only changed direct `{ name, isGranted }` entries under `permissions`.

The form derives direct grants from exact `grantedProviders` identities, not the effective `isGranted` flag.
Inherited role grants remain effective when a direct user grant is removed.
Module Permission switches edit direct grants; they do not revoke another role's grants.
Expanding or collapsing navigation groups does not edit grants.
Before saving, the form refetches and checks the changed entries for server drift and provider eligibility.
After saving, it refetches and verifies persisted direct grants before showing success.
The unchanged API has no compare-and-swap token; the pre-save check does not guarantee conflict-free concurrent writes.
Background refetches and errors preserve dirty drafts.
Changing provider while dirty blocks saving until the original draft is discarded explicitly.

Backend validation, transaction semantics, tenancy, and authorization are defined in the [canonical standard](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/common/security/permission-consistency.md).
No response contract or permission identifier is renamed.
