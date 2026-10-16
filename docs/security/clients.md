---
module: security
domain: permissions
content_type: Reference
status: canonical
updated_on: 2026-10-16
owner: frontend-team
audience: humans-and-agents
---

# Security API clients

## Session initialization and request ownership

`src/redux/auth/load-session.tsx` initializes private account context and effective permissions only outside the `(public-route)` route group. Public inquiry and employee-application pages do not trigger private bootstrap requests or automatic sign-out. Authenticated route guards still require a usable session and verified matching user/tenant context before rendering protected content.

Account-context and permission reads fail closed. Network errors, ordinary 403 responses, server errors, and malformed context show the shared account-access retry state without destroying the Auth.js session. Explicit retry reloads verification, including after a later setup-completion refresh fails. Current 401 responses, invalid private sessions, and 403 `TENANT_INACTIVE` still invalidate authentication; the latter retains the inactive-school login reason. Token-refresh policy in `src/auth-token.ts` is unchanged.

Bootstrap and employee requests are cancelled on token, identity or public-route transitions. Request IDs and tenant checks prevent late completions from restoring old state. The shared RTK Query service captures the session-cache revision and access token: invalidated lookups stop before dispatch, and obsolete 401/inactive-school responses cannot sign out a replacement session. Requests are not automatically replayed.

## Permission clients

`src/redux/permission/permissionApi.ts` retains the existing RTK Query contracts.

| Operation | Contract |
| --- | --- |
| Read catalogue and grant sources | `GET /api/permission-management/permissions?providerName=R|U&providerKey=...` |
| Change direct grants | `PUT /api/permission-management/permissions?providerName=R|U&providerKey=...` |
| Read user override states and catalogue | `GET /api/shikshamitra-permissions/users/{userId}/permissions` |
| Save user override states | `PUT /api/shikshamitra-permissions/users/{userId}/permissions` |
| Nested catalogue | Existing backend `/api/shikshamitra-permissions/permissions` route remains compatible |

Provider keys are URL-encoded.
Cache invalidation is specific to the selected provider.
The approved editor uses navigation groups and a compact permission matrix with inline action choices.
The dialog wrapper clips only its own scroll container. Navigation and matrix scroll containers remain independently scrollable.
`account-settings-permissions.ts` maps those controls to existing server permission IDs, retaining staging's Student bundles and Accounts Settings exceptions.
Institute Setup's Shift Management and Academic Setup entries use explicit `permissionChildren` in `src/constants/institute-setup.ts` to map their matrices to `InstituteSetup.ShiftManagement.View` and `InstituteSetup.AcademicSetup.View`. The matrix discovers each namespace's existing server actions. Their parent `ShikshaMitra.Module.InstituteSetup.*` names remain navigation visibility flags and are never submitted as action grants.
Statutory Schemes Edit maps to the existing `Edit`, `Activate`, `ManageEnrollment`, and `ApproveOverride` grants under `HR.PayrollManagement.Settings.StatutorySchemes`.
The matrix edits only explicitly mapped actions. Undisplayed and unfamiliar server actions remain unchanged.
Delete remains disabled while no matching server permission exists.
The full server catalogue is retained in the draft, including permissions outside the displayed navigation groups.
Unrelated permissions are preserved rather than rewritten by a grouped save.
Presentation-only feature groups are never sent as permission names.
Role saves submit only changed direct `{ name, isGranted }` entries under `permissions`.
User reads and writes use `/shikshamitra-permissions/users/{userId}/permissions`.
User saves submit only changed `{ name, state }` entries, where `state` is `inherit`, `allow`, or `deny`.
The typed user response includes an `overrides` dictionary; absent entries follow the role.

The form derives role grants from exact `grantedProviders` identities and user states from the override response.
Both dialogs offer compact segmented Role, Allow, and Deny choices for eligible user permissions. Role means Follow role and retains that accessible label. The segments use native radio semantics, support single-click selection, and allow keyboard users to move through a choice group with arrow keys. The reference layout uses slim module navigation, a role-default summary, an override-action count, and inherited/override source icons. All colors come from theme tokens, including the soft primary selection fill.
Matrix cells show direct action choices, effective access, and its role-default or user-override source. The access label's tooltip shows the contributing role names and current role default. Desktop controls are 32px tall; narrow-screen controls retain 44px touch targets. Selected choices and the review/save buttons use the primary theme palette.
Provider-ineligible actions remain disabled.
Follow role removes explicit user allow/deny and resumes the current combined role defaults.
Allow and Deny remain unchanged when role grants change. Deny suppresses inherited access in the displayed effective state.
Role forms use binary Allow/Revoke choices and their existing grouped mappings.
Expanding or collapsing navigation groups does not edit grants.
The review dialog lists every changed server permission and its resulting access before saving.
Discard restores the loaded snapshot without a network write.
Before saving, the form refetches and checks the changed entries for server drift and provider eligibility.
After saving, it refetches and verifies persisted role grants or user override states before showing success.
Role-default changes do not conflict with an explicit user override draft; changes to that user's override do.
The APIs have no compare-and-swap token; the pre-save check does not guarantee conflict-free concurrent writes.
Background refetches and errors preserve dirty drafts.
Changing provider while dirty blocks saving until the original draft is discarded explicitly.

Backend validation, transaction semantics, tenancy, and authorization are defined in the [canonical standard](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/common/security/permission-consistency.md).
No response contract or permission identifier is renamed.
