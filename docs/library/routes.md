---
module: library
domain: routes
content_type: Reference
status: canonical
updated_on: 2026-07-06
owner: frontend-team
audience: humans-and-agents
---

# Find Library frontend routes

TL;DR: Library routes are owned by `src/constants/library-menus.ts` and `src/app/(auth-route)/library/**`.
Use the menu source to decide whether a route is active navigation.

## Active menu routes

Use this table for visible Library navigation.

| Menu label | Route | Source |
|---|---|---|
| Dashboard | `/library/dashboard` | `src/constants/library-menus.ts` |
| All Books | `/library/book-list` | `src/constants/library-menus.ts` |
| Issue & Return | `/library/issued-books` | `src/constants/library-menus.ts` |
| Library Members | `/library/member-management` | `src/constants/library-menus.ts` |
| Charges | `/library/charges-management` | `src/constants/library-menus.ts` |
| Reports | `/library/reports` | `src/constants/library-menus.ts` |
| Notification | `/library/notification` | `src/constants/library-menus.ts` |
| Book Categories | `/library/settings/book-category` | `src/constants/library-menus.ts` |
| Charges Categories | `/library/settings/charge-type` | `src/constants/library-menus.ts` |
| Library Hours | `/library/settings/library-timing` | `src/constants/library-menus.ts` |
| Borrowing Rules | `/library/settings/borrowing-and-return-rules` | `src/constants/library-menus.ts` |
| Section Management | `/library/settings/sectionManagement` | `src/constants/library-menus.ts` |

## Known inactive or partial surfaces

These routes or folders exist but should not be treated as active menu navigation without checking source and product status.

| Surface | Status |
|---|---|
| `/library/book-management` | Commented in `library-menus.ts` |
| `/library/reservation-management` | Page exists outside the active menu |
| `/library/circulation/**` | Page folders exist outside the active menu |
| Additional settings pages | Some page folders exist without active menu entries |
