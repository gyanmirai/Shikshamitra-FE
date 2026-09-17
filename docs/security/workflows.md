---
module: security
domain: permissions
content_type: How-to
status: canonical
updated_on: 2026-09-17
owner: frontend-team
audience: humans-and-agents
---

# Edit role and user permissions

1. Open Role Management or User Management as an authorized permission administrator.
2. Select the existing Module Permission or Set Module Visibility menu item.
3. In Module Permission, use the original module and sub-module panels.
   Expand familiar navigation groups to see staging's compact action controls.
4. In Set Module Visibility, use the original separate module visibility controls.
   Nested settings and previously unmapped server flags are included there, not in action permissions.
5. Use the existing action switches or Grant All and Revoke All controls.
   Sub-module action controls include mapped descendants even when their groups are collapsed.
6. Submit the changes.
   Saving succeeds only after the persisted direct grants have been refetched and verified.
   Cancel or navigation away requires confirmation when changes are unsaved.

The original Role/User screens, separate dialogs, three-panel organization, cards, switches, and Submit/Cancel footer are retained.
Expanding a group only changes presentation state.
The form preserves unsaved drafts and verifies stored changes without adding granular action tiles, search, or a review panel.

## Grant meaning and conflicts

A switch applies the staging mapping to direct grants using exact server permission names.
Student controls retain grouped operations and View dependencies; Accounts Settings retain independent View, Add, Edit, Change Status, and Delete controls.
Set Module Visibility is separate from action permissions.
The selected role or user need not already have visibility to be configured.
Revoke All removes the direct grants represented by the selected control; inherited role access remains effective.
For Statutory Schemes, the user-approved View/Edit/Delete controls retain the same card and switch layout.
Edit groups settings edits, scheme activation, enrollment management, and override approval using the four existing backend permission IDs.
View and Edit are independent controls.
Delete is visible but disabled when the server has no Delete permission; it does not introduce a deletion operation.
Revoke All is available whenever any eligible direct Statutory Schemes grant exists, including a partial or undisplayed grant.
It clears every eligible direct grant at or beneath that exact feature namespace and preserves unrelated grants and role inheritance.
The Payroll Management header includes Edit so grouped write permissions can also be changed while Settings is collapsed.
Control tooltips identify remaining inherited providers.
Provider-ineligible entries cannot be submitted by the editor.
Reload after a conflict requires explicit confirmation before discarding a dirty draft.

Backend validation cannot infer an administrator's intention from a batch of otherwise valid permission names.
Do not use a successful API response alone as evidence of effective access removal.
Verify exact effective access and grant sources using authorized API reads.
Access repairs still require the exact approval and audit process in the [backend standard](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/common/security/permission-consistency.md).
