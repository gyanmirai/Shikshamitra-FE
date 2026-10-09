---
module: initial-setup
domain: overview
content_type: Landing
status: canonical
updated_on: 2026-10-09
owner: frontend-team
audience: humans-and-agents
---

# Institute initial setup frontend

## TL;DR

TL;DR: institute administrators complete a guided first-login setup that resumes backend-saved progress.
Completed institutes open the dashboard normally.

## Read order

1. [Routes](routes.md)
2. [Clients](clients.md)
3. [Workflows](workflows.md)
4. [Testing](testing.md)

## Source of truth

| Concern | Source |
| --- | --- |
| Route | `src/app/initial-setup/page.tsx` |
| Wizard | `src/screens/initial-setup-screen/` |
| API client | `src/redux/initial-setup/` |
| Workspace routing | `src/redux/host-tenants/workspace-landing.ts` |
| Browser checks | `e2e/host-tenants/initial-setup.spec.ts` |
| Academic workspace | `src/components/academic-setup/year-setup.tsx` |

[Backend documentation](../../../Shikshamitra-BE/docs/modules/institute-setup/README.md) owns progress persistence, validation, permissions, migration and completion rules.

## For agents

Read DESIGN.md and the frontend-patterns skill before editing the wizard.
Preserve drafts during errors and background requests; only explicit reload may replace local edits.
Older standalone setup components remain in the folder but are not mounted by the current wizard.

## Validation

Run [focused checks](testing.md), `node scripts/docs/validate-docs.mjs --module initial-setup` and `git diff --check`.
