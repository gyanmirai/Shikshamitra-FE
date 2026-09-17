---
module: security
domain: permissions
content_type: Landing
status: canonical
updated_on: 2026-09-17
owner: frontend-team
audience: humans-and-agents
---

# Security frontend documentation

## TL;DR

TL;DR: this release preserves the old Role and User UI, including separate permission and visibility dialogs.
Backend authorization and frontend action guards remain hardened.
The September 17 staging reference includes the three-panel layout, expandable groups, compact grouped action switches, and separate dialogs.

## Read order

1. [Routes](routes.md).
2. [Clients](clients.md).
3. [Workflows](workflows.md).
4. [Testing](testing.md).
5. [Canonical backend security standard](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/common/security/permission-consistency.md).

## Source of truth

- Screens: `src/screens/security/role/index.tsx` and `src/screens/security/user/index.tsx`.
- Retained panels: `src/screens/security/role/permission.tsx`, `permission-node.tsx`, and `visibility.tsx`.
- Catalogue organization and verified drafts: `src/screens/security/role/permission-catalogue.ts`, `use-permission-draft.ts`, and `permission-access-form.tsx`.
- API client: `src/redux/permission/permissionApi.ts`.
- Action helper: `src/utils/permissions.ts`.
- Behavior tests: `src/screens/security/role/permission-node.test.tsx`, `permission-catalogue.test.ts`, `use-permission-draft.test.tsx`, and `visibility.test.tsx`.

## For agents

Read the backend standard before changing actions, route gates, identity, scope, or security seeders.
Do not reintroduce the withdrawn catalogue-editor redesign without explicit approval.
Preserve staging's grouped controls and existing action mappings, including Student bundles and Accounts Settings exceptions.
The approved Statutory Schemes exception uses View/Edit/Delete controls and complete direct-feature revocation as described in [Workflows](workflows.md).
Server catalogue entries remain authoritative for valid API names and provider eligibility.
Do not add granular action tiles or let expanding a group edit grants.
Keep inherited grants and unsaved drafts separate from direct-grant edits.

## Validation

Run the focused commands in [Testing](testing.md).
Earlier restoration or replacement-editor tests do not validate later behavior changes.
Report current checks and historical evidence separately.
