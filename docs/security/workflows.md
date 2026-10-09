---
module: security
domain: permissions
content_type: How-to
status: canonical
updated_on: 2026-10-09
owner: frontend-team
audience: humans-and-agents
---

# Edit role and user permissions

1. Open Role Management or User Management as an authorized permission administrator.
2. Select Module Permission or Set Module Visibility. These remain separate dialogs.
3. Choose a module and sub-module from the unified navigation list. Clicking the current selection keeps the editor open.
4. Select Role, Allow, or Deny directly in a permission cell. Role follows the assigned roles and is announced as Follow role to assistive technology. Every action shows its choices immediately; no editor-opening click is required. Role screens show Allow and Revoke. Arrow keys move between choices.
5. For users, choose Follow role, Allow, or Deny. For roles, choose Allow or Revoke.
6. Select Review changes to inspect all changed permissions and resulting access, including grouped action dependencies.
7. Save changes. Success is shown only after a fresh read verifies the stored state.

Back to editing keeps the draft. Discard changes resets it to the last loaded state without a write.
Cancel prompts before discarding an unsaved draft.
Search filters features without changing permissions. Overrides only shows user-specific exceptions.
Collapsing groups only changes presentation.

The user approved the themed permission matrix on October 9, replacing the earlier three-panel switch layout.
The screen uses the existing theme and shared table, dialog, scroll, and confirmation components.
Prominent bulk grant/revoke controls are omitted; each action applies the existing grouped mapping.

## Role defaults and user overrides

Follow role is the default and combines current assigned-role grants.
Allow and Deny apply only to the selected user and persist through later role-permission updates.
Follow role removes the explicit override. User saves do not change role permissions or assignments.
Role defaults, their contributing role names, the selected rule, and effective access are shown separately.
Provider-ineligible controls remain unavailable.
Opening either dialog does not copy inherited role grants into user grants or make the form dirty.

Student controls preserve grouped operations and View dependencies.
Accounts Settings preserve independent View, Add, Edit, Change Status, and Delete actions.
Statutory Schemes Edit groups edits, activation, enrollment management, and override approval using the four existing backend permission IDs.
View and Edit remain independent; Delete is disabled when the server has no matching permission.
Unmapped and unrelated action permissions are retained without being rewritten.
Set Module Visibility preserves nested settings and unmapped server flags, including Additional visibility.
Visibility edits do not mutate action permissions.

The selected role or user need not already have module visibility to be configured.
Provider-ineligible entries cannot be submitted.
Pre-save reads detect changed-entry drift; post-save reads verify persisted direct grants or user override states.
The API has no compare-and-swap token, so these checks cannot eliminate simultaneous-write races.
Reload after a conflict requires confirmation before discarding a dirty draft.

Backend validation cannot infer administrator intent from otherwise valid permission names.
Verify exact effective access and sources with authorized API reads when diagnosing access.
Access repairs still require the approval and audit process in the [backend standard](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/common/security/permission-consistency.md).
