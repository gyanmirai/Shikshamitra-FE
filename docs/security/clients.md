---
module: security
domain: permissions
content_type: Reference
status: canonical
updated_on: 2026-10-28
owner: frontend-team
audience: humans-and-agents
---

# Security API clients

## User directory

`getUserDirectory` in `src/redux/user/userApi.ts` reads every page from the [backend directory endpoint](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/common/multi-tenancy/roles.md#read-user-role-assignments). A failed or incomplete page fails the whole read instead of presenting a partial directory as complete. The existing `getUsers` client remains available to other workflows.

`user-table.tsx` uses the complete result for shared-table search, filtering, sorting, pagination, and exports. `user-role-column.tsx` renders exact assigned role names as neutral pills and supplies comma-separated text for filtering, alphabetic sorting, and export.

## Permission-denied feedback

The shared RTK base query normalizes generic HTTP 403 errors before generated hooks, manual handlers, and `useQueryAndMutation` consume them. `normalize-permission-response.ts` decodes failed download bodies as well as ordinary JSON errors; successful responses are unchanged.
`permission-denied.ts` supplies reviewed endpoint-operation labels and an administrator recovery message. Unknown endpoints use an action-neutral fallback; request URLs, record IDs, payload values, and inferred grant names never become feedback labels.
`parseApiProblemDetail` supports RFC problem details, ABP envelopes, legacy message fields, and Axios-style errors. Specific business, tenant, scope, and staff-policy prerequisite explanations retain their existing contract. The legacy fetch client also normalizes permission denials.
`shikshaMitraToast.error` presents shared permission guidance as an Access required warning, keeps it visible for ten seconds, and reuses one notice for an identical message. Existing screen-owned inline errors and `popupConfig.error: false` remain authoritative; the base query does not emit a global 403 toast or modal.
The backend's [permission feedback contract](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/common/security/permission-consistency.md) owns server context and authorization. These presentation changes do not grant access or change 401/inactive-school sign-out handling.

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
Visibility rows come only from `src/constants/navigation.tsx` and its imported module menus. `buildVisibilityPanels` accepts that navigation without an API catalogue; API responses supply grant states and provider eligibility, not additional visibility rows. The layout navigation module re-exports the constants for existing consumers.
Unrelated permissions are preserved rather than rewritten by a grouped save.
Presentation-only feature groups are never sent as permission names.
Role saves submit only changed direct `{ name, isGranted }` entries under `permissions`.
User reads and writes use `/shikshamitra-permissions/users/{userId}/permissions`.
User saves submit only changed `{ name, state }` entries, where `state` is `inherit`, `allow`, or `deny`.
The typed user response includes an `overrides` dictionary; absent entries follow the role.

The form derives role grants from exact `grantedProviders` identities and user states from the override response.
Both dialogs offer compact segmented Role, Allow, and Deny choices for eligible user permissions.
Role means Follow role and retains that accessible label.
The segments use native radio semantics, support single-click selection, and allow keyboard users to move through a choice group with arrow keys.
The layout uses slim module navigation and an override-action count.
Matrix cells show action choices without status lines underneath; effective access, grant provenance, contributing role names, and the current role default remain available through hover and keyboard-focus tooltips and an accessible description.
The permission table starts at the theme's `lg` breakpoint (1200px); narrower viewports use cards so pinned columns cannot obscure the selectors.
Inline selectors and bulk buttons are 32px tall in the table layout and retain 44px touch targets below `lg`.
Selected Allow, Revoke/Deny, and user Role choices use the primary, error, and info palettes respectively, each at 0.12 background opacity; review/save buttons retain their existing theme treatment.
Grant all, Revoke all, and user Follow role use compact grouped buttons with regular-weight labels and matching primary, error, and info tints; disabled bulk actions remain neutral.
Selected-module bulk controls sit beside search.
Sibling groups align consistently, while nested group headers and feature names use depth-based indentation.
Desktop row-level Grant all and Revoke all controls occupy a separate Bulk actions column pinned to the right; Feature stays pinned to the left so the target and direct bulk controls remain visible during horizontal scrolling.
Sticky cells retain opaque row backgrounds and headers stay above scrolling content.
Cards below 1200px keep their bulk controls beneath the feature name within the same indentation level.
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
