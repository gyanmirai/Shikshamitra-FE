---
module: library
domain: routes
content_type: Reference
status: canonical
updated_on: 2026-11-20
owner: frontend-team
audience: humans-and-agents
---

# Find Library frontend routes

TL;DR: Library routes are owned by `src/constants/library-menus.ts` and `src/app/(auth-route)/library/**`.
Use the menu source to decide whether a route is active navigation.

## Active menu routes

Use this table for visible Library navigation.

| Menu label              | Route                                          | Source                           |
| ----------------------- | ---------------------------------------------- | -------------------------------- |
| Dashboard               | `/library/dashboard`                           | `src/constants/library-menus.ts` |
| All Books               | `/library/book-list`                           | `src/constants/library-menus.ts` |
| Stock Receiving         | `/library/receiving`                           | `src/constants/library-menus.ts` |
| Stock Verification      | `/library/stock-verification`                  | `src/constants/library-menus.ts` |
| Classroom Custody       | `/library/custody`                             | `src/constants/library-menus.ts` |
| Campus Transfers        | `/library/campus-transfers`                    | `src/constants/library-menus.ts` |
| My Library              | `/dashboard/my-library`                       | `src/layouts/components/account-drawer.tsx` |
| Issue & Return          | `/library/issued-books`                        | `src/constants/library-menus.ts` |
| Library Members         | `/library/member-management`                   | `src/constants/library-menus.ts` |
| Charges                 | `/library/charges-management`                  | `src/constants/library-menus.ts` |
| Reports                 | `/library/reports`                             | `src/constants/library-menus.ts` |
| Notification            | `/library/notification`                        | `src/constants/library-menus.ts` |
| Catalogue Configuration | `/library/settings/catalogue-configuration`    | `src/constants/library-menus.ts` |
| Book Categories         | `/library/settings/book-category`              | `src/constants/library-menus.ts` |
| Charges Categories      | `/library/settings/charge-type`                | `src/constants/library-menus.ts` |
| Library Hours           | `/library/settings/library-timing`             | `src/constants/library-menus.ts` |
| Borrowing Rules         | `/library/settings/borrowing-and-return-rules` | `src/constants/library-menus.ts` |
| Library Calendar        | `/library/settings/calendar`                   | `src/constants/library-menus.ts` |
| Section Management      | `/library/settings/sectionManagement`          | `src/constants/library-menus.ts` |

## Catalogue and receiving route boundaries

The authenticated Library layout delegates authorization to each destination's exact guard.
Module visibility controls navigation exposure; it does not add an aggregate permission requirement to direct URLs.

| Surface                             | Guard and physical source                                                                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Catalogue configuration             | Dedicated `Library.Settings.CatalogueConfiguration.View`; `src/app/(auth-route)/library/(catalogue-settings)/settings/catalogue-configuration/**` |
| Configuration update controls       | Dedicated Update plus the server's `canManageConfiguration`; `src/screens/library/settings/catalogue-configuration/**`                            |
| Receiving register and saved detail | Both `Library.Receiving.View` and `Library.AllBooks.View`; `src/app/(auth-route)/library/receiving/**`                                            |
| New receiving entry                 | The read pair plus `Library.Receiving.Add`; `src/app/(auth-route)/library/receiving/new/**`                                                       |
| Stock import history and batch detail | The same read pair in `src/app/(auth-route)/library/receiving/imports/**` |
| New stock import | The read pair plus `Library.Receiving.Add` in `src/app/(auth-route)/library/receiving/imports/new/**` |

The catalogue configuration route group preserves its public URL and dedicated View boundary.
Its standalone Library navigation entry and search entry require its own View permission.

## Stock verification route boundaries

The register and saved count use the View pair, `Library.InventoryVerification.View` and `Library.AllBooks.View`. The `/library/stock-verification/new` route also requires `Library.InventoryVerification.Add`. The saved count at `/library/stock-verification/[sessionId]` shows scan controls with `Library.InventoryVerification.Update` while the count is open for scanning.

## My Library route boundary

The account entry and route require exact `Library.Portal.View`. The page fetches the linked student list from the server. The catalogue, loans, reservations and receipts tabs use the `tab` query parameter and the currently chosen linked student. Reserve and Renew have independent portal grants. Receipts appears with exact `Finance.Fees.InvoiceReceipt.View` and uses the selected student's Finance-eligible academic years.

## Campus transfer route boundaries

The register and record use exact `Library.CampusTransfers.View` and `Library.AllBooks.View`. `/library/campus-transfers/new` also requires `Library.CampusTransfers.Dispatch`. The detail's receipt controls require `Library.CampusTransfers.Receive`. The server requires school-wide scope. Campus assignment is in a saved section's **View Shelves** dialog in Section Management.

## Classroom custody route boundaries

`/library/custody` and `/library/custody/[id]` require both `Library.Custody.View` and `Library.AllBooks.View`. `/library/custody/new` also requires `Library.Custody.Add`. The saved handoff shows receipt controls with `Library.Custody.Return` while copies are outstanding. The server requires school-wide scope and the register displays a scope denial when access is restricted.

## Settings route and navigation ownership

The shared `settings/layout.tsx` passes through to each backed child's existing exact View guard.
Book Categories, Charges Categories, Library Hours, Borrowing Rules, Library Calendar and Section Management do not additionally require `Library.Settings.View`.
The Settings navigation group is available when one of these child Views is granted; search exposes only the authorized children.
Calendar retains its existing Borrowing Rules View alias.
Authentication and the module's navigation visibility remain separate from destination action access.

## Compatibility redirects and inactive surfaces

These routes or folders exist but should not be treated as active menu navigation without checking source and product status.

| Surface                                       | Status                                                                                      |
| --------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `/library/book-management`                    | Commented in `library-menus.ts`                                                             |
| `/library/reservation-management`             | Redirects to the guarded catalogue reservation workflow at `/library/book-list`             |
| `/library/circulation/reservation-management` | Redirects to `/library/book-list`                                                           |
| `/library/circulation/fine-management`        | Redirects to the guarded `/library/charges-management` destination                          |
| Other `/library/circulation/**` prototypes    | Outside active menu navigation; inspect each route before treating it as an active workflow |
| `/library/settings/book-condition`            | Redirects to the guarded catalogue; copy conditions use its saved-copy workflows            |
| `/library/settings/membership-management`     | Redirects to guarded `/library/member-management`                                           |
| `/library/settings/report-configuration`      | Redirects to guarded `/library/reports`                                                     |
| `/library/settings/permission`                | Redirects to `/security/role`; its existing Security permission guard remains required      |
| `/library/settings/curriculumn-templates`     | Uses the normal not-found boundary; no Library curriculum-template workflow is implemented  |
| `/library/settings/general-setting`           | Redirects to the guarded Borrowing Rules destination                                        |
| `/library/settings/notification-setting`      | Redirects to the guarded notification settings destination                                  |

Retired prototype screen folders are not active workflows merely because their source remains present.
Compatibility redirects do not transfer grants or bind unsupported query parameters to another screen.
