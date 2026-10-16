---
module: security
domain: permissions
content_type: How-to
status: canonical
updated_on: 2026-10-16
owner: frontend-team
audience: humans-and-agents
---

# Edit role and user permissions

TL;DR: edit individual actions or use scoped bulk controls, review the complete draft, and save verified changes for the selected role or user.

1. Open Role Management or User Management as an authorized permission administrator.
2. Select Module Permission or Set Module Visibility. These remain separate dialogs.
3. Choose a module and sub-module from the unified navigation list. Clicking the current selection keeps the editor open.
4. Select Role, Allow, or Deny directly in a permission cell. Role follows the assigned roles and is announced as Follow role to assistive technology. Every action shows its choices immediately; no editor-opening click is required. Role screens show Allow and Revoke. Arrow keys move between choices.
5. Use Grant all or Revoke all for all modules, the selected module or submodule, or an individual feature group. For users, Follow role restores the assigned-role defaults for the same scope.
6. Select Review changes to inspect all changed permissions and resulting access, including grouped action dependencies.
7. Save changes. Success is shown only after a fresh read verifies the stored state.

Back to editing keeps the draft. Discard changes resets it to the last loaded state without a write.
Cancel prompts before discarding an unsaved draft.
Search filters features without changing permissions. Overrides only shows user-specific exceptions.
Collapsing groups only changes presentation.

The user approved the themed permission matrix on October 9, replacing the earlier three-panel switch layout.
The screen uses the existing theme and shared table, dialog, scroll, and confirmation components.
Bulk controls use the existing grouped mappings and include collapsed descendants and features hidden by search.
All modules applies to the mapped navigation tree; it does not grant unrelated catalogue permissions or change the separate visibility flags.
Selecting a module shows its submodules together, and selecting a submodule narrows the editor and its bulk controls.

| Bulk action | Role editor | User editor |
| --- | --- | --- |
| Grant all | Adds direct role grants | Sets explicit Allow overrides |
| Revoke all | Removes direct role grants; inherited access can remain | Sets explicit Deny overrides, including permissions allowed by roles |
| Follow role | Not applicable | Removes user overrides and follows current assigned-role grants |

Bulk changes remain in the draft until reviewed and saved.
Provider-ineligible names are excluded, and duplicate feature mappings are submitted only once.
Hover over a permission selector or focus a choice with the keyboard to inspect effective access, grant sources, and the user role default in its tooltip.
The same details remain available as an accessible description, without status lines below the choices.
Selected Allow, Revoke/Deny, and user Role choices use primary, error, and info tints at the same 0.12 opacity.
Grant all, Revoke all, and user Follow role use compact segmented-style buttons with regular-weight labels and matching primary, error, and info tints; disabled bulk actions remain neutral.
The selected module's bulk controls sit beside search.
Sibling groups align consistently and nested groups and features are indented together.
At widths of 1200px and above, use the separate Bulk actions column pinned to the right for each row; the feature name stays pinned to the left while permission columns scroll horizontally.
Below 1200px, cards keep the same direct bulk controls beneath the feature name with 44px controls.
Expand or collapse a group with its chevron to show or hide its descendants without changing grants.

## Delete a role

Role Management opens the shared `ConfirmDialog` through `role-delete-dialog.tsx`.
The Delete action names the selected role and warns that deletion cannot be undone.
While the request is pending, submission, Cancel, Escape and backdrop dismissal are locked.
A failed deletion keeps the selected role and dialog open, displays the server's recovery message inline and uses the shared error toast.
Cancel and retry become available after the request completes. Success closes the dialog, shows the success toast and invalidates the role list through the existing RTK Query tag.

See the [backend role deletion contract](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/common/multi-tenancy/roles.md#delete-an-unused-role) for dependencies, counts, permissions and tenant rules.

## Role defaults and user overrides

Follow role is the default and combines current assigned-role grants.
Allow and Deny apply only to the selected user and persist through later role-permission updates.
Follow role removes the explicit override. User saves do not change role permissions or assignments.
Role defaults, their contributing role names, the selected rule, and effective access are shown separately.
Provider-ineligible controls remain unavailable.
Opening either dialog does not copy inherited role grants into user grants or make the form dirty.

Student controls preserve grouped operations and View dependencies.
Accounts Settings preserve independent View, Add, Edit, Change Status, and Delete actions.
Statutory Schemes Edit groups edits, activation, enrollment management, override approval, and calculation configuration when those five backend permission IDs are present.
View and Edit remain independent; Delete is disabled when the server has no matching permission.
Statutory Schemes Revoke all and Follow role include eligible undisplayed actions within that exact feature namespace; Grant all includes only the mapped actions.
Unmapped and unrelated action permissions are retained without being rewritten.
Set Module Visibility builds its modules, labels, order, and nested settings only from `src/constants/navigation.tsx` and the module menus under `src/constants/`. API-only flags do not add rows or an Additional visibility section. The API loads and saves grant selections; configured flags absent from its catalogue stay visible with disabled controls.
Visibility edits do not mutate action permissions.

The selected role or user need not already have module visibility to be configured.
Provider-ineligible entries cannot be submitted.
Pre-save reads detect changed-entry drift; post-save reads verify persisted direct grants or user override states.
The API has no compare-and-swap token, so these checks cannot eliminate simultaneous-write races.
Reload after a conflict requires confirmation before discarding a dirty draft.

Backend validation cannot infer administrator intent from otherwise valid permission names.
Verify exact effective access and sources with authorized API reads when diagnosing access.
Access repairs still require the approval and audit process in the [backend standard](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/common/security/permission-consistency.md).
