---
module: security
domain: permissions
content_type: How-to
status: canonical
updated_on: 2026-09-16
owner: frontend-team
audience: humans-and-agents
---

# Edit role and user permissions

1. Open Role Management or User Management as an authorized permission administrator.
2. Select the existing Module Permission or Set Module Visibility menu item.
3. In Module Permission, use the original module and sub-module panels.
   All server-defined actions are individually available, including unfamiliar actions and additional catalogue sections.
4. In Set Module Visibility, use the original separate module visibility controls.
   Nested settings and previously unmapped server flags are included there, not in action permissions.
5. Search within the selected sub-module if needed.
   Grant All and Revoke All operate on its complete eligible subtree, including rows hidden by search or collapsed branches.
6. Review the pending change count and delta, then Submit.
   Saving succeeds only after the persisted direct grants have been refetched and verified.
   Cancel or navigation away requires confirmation when changes are unsaved.

The original Role/User screens, separate dialogs, three-panel organization, cards, switches, and Submit/Cancel footer are retained.
Search, pending changes, grant sources, accessible controls, and save safeguards fix behavior within that layout.

## Grant meaning and conflicts

A switch changes exactly one direct grant, not a bundle or an implicit View prerequisite.
Set Module Visibility is separate from action permissions.
The selected role or user need not already have visibility to be configured.
User bulk removal is labelled Remove direct grants because inherited role access remains.
Provider-ineligible entries are read-only.
Reload after a conflict requires explicit confirmation before discarding a dirty draft.

Backend validation cannot infer an administrator's intention from a batch of otherwise valid permission names.
Do not use a successful API response alone as evidence of effective access removal.
Verify exact effective access and grant sources using authorized API reads.
Access repairs still require the exact approval and audit process in the [backend standard](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/common/security/permission-consistency.md).
