---
module: institute-setup
domain: overview
content_type: Landing
status: canonical
updated_on: 2026-10-21
owner: frontend-team
audience: humans-and-agents
---

# Institute Setup

TL;DR: School Identity manages school-wide logos, letterheads and principal signatures with board, medium and organization overrides. The [initial setup module](../initial-setup/README.md) owns the first-login wizard.

School Documents provides a whole-school approval and permission library with grouped attachments, authenticated preview/download and permission-aware editing. See [workflows](./workflows.md#school-documents) and the [backend contract](../../../Shikshamitra-BE/docs/modules/institute-setup/api.md#school-documents).

## Read order

Reports adds a Curriculum-style generation/history workspace at `/setting/reports` for academic hierarchy, class division summaries, division capacity and room mapping, rooms/buildings inventory, shifts, School Documents metadata/counts and scoped School Identity configuration/counts. See [workflows](./workflows.md#reports) and the [backend contract](../../../Shikshamitra-BE/docs/modules/institute-setup/api.md#reports).

| File | Purpose |
| --- | --- |
| [routes.md](./routes.md) | Navigation and route guards |
| [clients.md](./clients.md) | API client, assets and cache behavior |
| [workflows.md](./workflows.md) | Editing, inheritance, copy and previews |
| [testing.md](./testing.md) | Local verification and browser acceptance |

## Source of truth

| Surface | Source |
| --- | --- |
| Route | `src/app/(auth-route)/setting/school-identity/page.tsx` |
| Screen | `src/screens/setting/school-identity/index.tsx` |
| Client | `src/redux/InstituteSetup/schoolIdentityApi.ts` |
| Menu | `src/constants/institute-setup.ts` |
| Document library | `src/screens/setting/school-documents/`, `src/redux/InstituteSetup/schoolDocumentsApi.ts` |
| Backend | [Institute Setup](../../../Shikshamitra-BE/docs/modules/institute-setup/README.md) |

## For agents

Start with routes for navigation, clients for requests, and workflows for forms. Reuse the shared upload, dialog, toast and breadcrumb components. Backend resolution is authoritative; do not calculate inheritance again in the browser.

## Validation

Run the focused commands in [testing.md](./testing.md), `node scripts/docs/validate-docs.mjs --module institute-setup`, and `git diff --check`.
