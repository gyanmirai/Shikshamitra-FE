---
module: security
domain: permissions
content_type: Landing
status: canonical
updated_on: 2026-09-16
owner: frontend-team
audience: humans-and-agents
---

# Security frontend documentation

## TL;DR

TL;DR: this release preserves the old Role and User UI, including separate permission and visibility dialogs.
Backend authorization and frontend action guards remain hardened.
The user-approved behavior fixes operate inside the existing three-panel layout and separate dialogs, not a replacement editor.

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
Do not restore fixed CRUD assumptions, implicit action bundles, or target-visibility restrictions on permission administration.
Server catalogue entries, not navigation metadata or a hardcoded action list, define all available grants.
Keep inherited grants and unsaved drafts separate from direct-grant edits.

## Validation

Run the focused commands in [Testing](testing.md).
Earlier restoration or replacement-editor tests do not validate later behavior changes.
Report current checks and historical evidence separately.
