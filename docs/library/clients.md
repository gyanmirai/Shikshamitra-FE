---
module: library
domain: clients
content_type: Reference
status: canonical
updated_on: 2026-07-06
owner: frontend-team
audience: humans-and-agents
---

# Find Library frontend clients

TL;DR: Library clients live under `src/redux/library/**`.
Adapters in `library-adapters.ts` normalize backend DTOs for screen models.

## Client map

Use this table to find the first integration file.

| Surface | Client source |
|---|---|
| Shared Library API base | `src/redux/library/libraryModuleApi.ts` |
| DTO adapters | `src/redux/library/library-adapters.ts` |
| Books, copies, reservations, and member lookup | `src/redux/library/bookList/**` |
| Issue and return | `src/redux/library/issueAndReturnApi/**` |
| Members | `src/redux/library/libraryMembers/**` |
| Charges | `src/redux/library/charges-management/**` |
| Dashboard | `src/redux/library/dashboard-api.ts` |
| Reports | `src/redux/library/reports-api.ts` |
| Copy labels | `src/redux/library/copy-labels-api.ts` |
| Notifications | `src/redux/library/notifications-api.ts` |
| Settings | `src/redux/library/settingApi.tsx` and `src/redux/library/setting/**` |

## Backend contract source

Backend Library behavior is canonical in [Library backend APIs](../../../Shikshamitra-BE/docs/modules/library/api.md).
Confirm request and response behavior there before changing a client shape.

## Client rules

Keep these rules when changing Library clients.

| Rule | Reason |
|---|---|
| Use adapters for DTO-to-screen mapping | Screens should not duplicate backend field mapping |
| Keep release-surface tests aligned with active routes | Prototype pages must not look shipped |
| Keep report screens on backend-backed panels | Release gate checks this behavior |
| Refresh affected lists after mutations | Catalog, issue, return, charge, and member state must stay consistent |
