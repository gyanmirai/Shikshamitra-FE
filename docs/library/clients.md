---
module: library
domain: clients
content_type: Reference
status: canonical
updated_on: 2026-11-20
owner: frontend-team
audience: humans-and-agents
---

# Find Library frontend clients

TL;DR: Library clients live under `src/redux/library/**`.
Adapters in `library-adapters.ts` normalize backend DTOs for screen models.

## Client map

Use this table to find the first integration file.

| Surface                                                        | Client source                                                                                               |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Shared Library API base                                        | `src/redux/library/libraryModuleApi.ts`                                                                     |
| DTO adapters                                                   | `src/redux/library/library-adapters.ts`                                                                     |
| Books and copies                                               | `src/redux/library/bookList/**`                                                                             |
| Editor-owned categories, locations and catalogue configuration | `src/redux/library/book-editor-api.ts`                                                                      |
| Dedicated catalogue configuration settings                     | `src/redux/library/catalogue-configuration-api.ts` and `src/redux/library/catalogue-configuration-types.ts` |
| Catalogue code/label compatibility                             | `src/redux/library/catalogue-metadata.ts`                                                                   |
| Catalogue price hydration and display                          | `src/redux/library/catalogue-price.ts`                                                                      |
| Book command revision types and validation                     | `src/redux/library/catalogue-revisions.ts`                                                                  |
| Stock receiving, register and saved receipts                   | `src/redux/library/receiving-api.ts` and `src/redux/library/receiving-types.ts`                             |
| Stock import options, preview, commit and history | `src/redux/library/stock-import-api.ts` |
| Canonical circulation commands and owning lookups              | `src/redux/library/circulation-api.ts` and `src/redux/library/circulation-members-api.ts`                   |
| Canonical circulation list                                     | `src/redux/library/circulation-read-api.ts` and `src/redux/library/circulation-read-adapter.ts`             |
| Exact-loan reads, renewal previews and date review             | `src/redux/library/loans-api.ts` and `src/redux/library/circulation-commands.ts`                            |
| Copy loan history and inventory actions                        | `src/redux/library/copy-history-api.ts` and `src/redux/library/copy-lifecycle-api.ts`                       |
| Reservations and review                                        | `src/redux/library/reservations-api.ts` and `src/redux/library/reservation-review-api.ts`                   |
| Legacy issue/return compatibility clients                      | `src/redux/library/issueAndReturnApi/**`                                                                    |
| Members                                                        | `src/redux/library/libraryMembers/**`                                                                       |
| Charges                                                        | `src/redux/library/charges-management/**`                                                                   |
| Dashboard                                                      | `src/redux/library/dashboard-api.ts`                                                                        |
| Reports                                                        | `src/redux/library/reports-api.ts`                                                                          |
| Copy labels                                                    | `src/redux/library/copy-labels-api.ts`                                                                      |
| Notifications                                                  | `src/redux/library/notifications-api.ts`                                                                    |
| Settings                                                       | `src/redux/library/settingApi.tsx` and `src/redux/library/setting/**`                                       |

## My Library and pickup clients

`src/redux/library/library-portal-api.ts` uses the authenticated mobile Library endpoints. It passes the actual linked student ID, uses server paging and keeps private activity caches keyed by student. Renewal sends the exact reviewed school date, revision, and operation key.

The same client requests Finance-eligible years and paged Library payment receipts using the linked student ID. PDF downloads use the official Finance route with that student, receipt and academic year.

`src/redux/library/reservations-api.ts` supplies staff pickup choices for the current academic year. The selected section is sent to reservation preview and creation. The saved request displays the server's original pickup label.

## Campus transfer client

`src/redux/library/campus-transfer-api.ts` uses the server's campus routes and per-source copy search. Dispatch form changes invalidate the reviewed copy and route selections. The receipt records the selected outstanding accessions and conditions. Both use the shared reviewed stock action to retain the exact command after an uncertain response. Confirmed writes refresh transfers, inventory, circulation, reservations and Dashboard reads.

`src/redux/library/settingApi.tsx` supplies campus choices and the confirmed section binding. Its mutation also invalidates saved move options.

## Classroom custody client

`src/redux/library/custody-api.ts` owns saved handoffs, eligible copy search and handoff choices, and the two preview and commit pairs. A changed form clears the reviewed revision. After an uncertain command response, the screen can retry the same reviewed data with the same key. Successful writes refresh the register and detail along with inventory, circulation, and reservation data.

## Academic-year rollover client

`src/redux/library/rollover-api.ts` reads year options and submits the read-only preview for the exact years and school date selected in Borrowing Rules. `src/screens/library/settings/policies/rollover/**` owns form validation and clears the visible preview after a selection changes. The existing policies client owns draft and publish actions.

## Stock import client

`src/screens/library/receiving/stock-import/**` owns UTF-8 file decoding, column mapping, destination and date controls, preview display, correction download, and saved outcomes. The client preserves text values in the uploaded CSV. Form changes invalidate the displayed review. After an uncertain response it retries the exact command including its idempotency key. A successful commit invalidates catalogue, copy, receiving, reservation, notification and dashboard data.

## Stock verification client

`src/redux/library/stock-verification-api.ts` supplies count options, preview, opening, baseline, scan history and capture, and live reconciliation. Counts and evidence tables use server paging. Successful opening refreshes the register. Scan capture refreshes the count, scan history, reconciliation, and register through stock verification tags. Reconciliation also follows copy and circulation tag invalidation and supports an explicit refresh.

The stock count transition mutation posts review or cancellation to the same count detail. Successful transitions refresh the detail and register. A conflict refreshes the detail and scan history and opens the path to explicitly confirm the current count.

The finding decision mutation posts the reviewed evidence revision and latest decision version. Success and conflict refresh reconciliation and decision history. The decision dialog keeps the reviewed snapshot and draft until staff confirm a refreshed finding.

The approval dialog reads its preview when opened and refreshes it explicitly after a conflict. A successful approval refreshes the detail and list. The published result has a separate cache entry and reads the saved findings and location labels.

## Backend contract source

Backend Library behavior is canonical in [Library backend APIs](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/modules/library/api.md).
Confirm request and response behavior there before changing a client shape.

## Loan maintenance integration

`loans-api.ts` uses the existing authenticated Library API for exact-loan GET, renewal preview, renewal and date-review commands.
Optional `schoolContext` and `canReviewDates` are GET-only read fields; command and replay responses do not supply a replacement editor context.
The exact-loan GET and renewal-preview queries provide the shared calendar read tag, so successful calendar saves refresh active subscriptions.
Accepted loan mutations invalidate the existing circulation tags; rejected commands retain the opened draft.

`useExactLoanSession.ts` waits for an explicitly fulfilled fresh GET, even with warm cached data, and freezes its exact loan/copy identity and opening revision.
`useRenewalSnapshot.ts` binds an accepted preview to that loan and the serialized date/year inputs, discards late prior-input responses and verifies the same preview revision before a new submission.
Background reads may disable a stale draft but never replace its frozen token or entered values.
The school-day banner and its deliberate Use school date action follow the matched latest GET context without changing the entered date automatically.
`useLoanMaintenanceCommand.ts` retains the complete command and idempotency key for an uncertain response, allowing only unchanged replay until its result is recovered.

## Catalogue configuration integration

The settings client reads and writes `/library/catalogue/configuration` through the existing authenticated Library API base.
Its PUT sends `expectedRevision` and a nested `definition`; it does not flatten school choices into the request root.
Successful configuration saves invalidate Library settings and book tags so subscribed catalogue labels refresh.
The editor obtains effective configuration through its owning editor-options request without calling the settings endpoint.

`catalogue-metadata.ts` preserves the legacy numeric language meanings and uses server-provided labels for configured codes.
Custom language codes retain a nullable legacy language value rather than becoming Gujarati zero.
Material values remain unspecified when absent.

The book command mapper sends the opened `expectedCatalogueConfigurationRevision`, canonical codes and legacy-compatible language value.
The configuration token is separate from book or copy-set concurrency.
Metadata-only saves omit the copy collection, and unchanged copies skip the full-collection copy PUT.

## Catalogue price transport

Book reads prefer the nullable exact `priceText` field; the legacy numeric field is a fallback only when that text field is absent.
The editor keeps price as an unformatted string and submits `{price: null, priceText: exactStringOrNull}` through the existing book client.
An empty draft sends Unknown explicitly, while a saved zero remains a known value.
No acquisition-cost or currency fields are added to the catalogue command.
Read-only display uses the shared formatter's two-decimal option without a currency argument.
The editor's validation keeps the exact opened historic negative price with its saved book identity, while changed or new negative values remain invalid.

## Book command revisions

The editor waits for an explicit fulfilled whole-detail read before enabling an existing book draft, including with warm cached detail.
`useBookDetailSnapshot.ts` captures the opened data and its independent metadata/copy revisions.
The command helpers send `expectedMetadataRevision` for metadata updates and `expectedCopiesRevision` for complete copy writes without trimming or generating tokens.

`useBookSaveCommit.ts` advances only the submitted concern's revision from its own successful command response.
A metadata-only response cannot refresh an old copy draft's token, even when that response reports a newer copy revision.
Creation captures both initial revisions, and completed saves reload actual persisted copies for labels.
Semantic draft comparisons exclude expected tokens and derived stock counts.
Conflict errors retain values and opened tokens; a background refresh never retries or rebinds the old draft.
Explicit reload uses the shared discard confirmation before replacing dirty values.

## Title deletion intent

The existing book detail client returns the server's `canDelete` and `deletionBlockedReason` fields.
`useBookDeletion.ts` awaits a forced detail read for the selected ID before exposing the destructive action; copy-removal capability does not authorize title deletion.
The existing delete mutation runs directly with `.unwrap()`, retains request errors and invalidates inventory tags only after success.
The catalogue uses that normal invalidation to refresh each subscribed page with its own existing arguments, without an optimistic cache edit or shared Undo timer.

## Opening hours and policy drafts

`src/redux/library/settingApi.tsx` owns the existing year-scoped opening-hours read and save requests.
`src/screens/library/settings/LibraryTiming/useLibraryHoursRead.ts` captures an explicitly fulfilled opening read instead of initializing an editor from warm cached data.
The live query remains subscribed for refresh feedback; a background response never replaces the opened draft.
`library-hours-model.ts` preserves the server status values and sends wall-clock strings without constructing timestamp payloads.
Unsupported saved time strings stay visible for review rather than being guessed or silently converted.
Write controls require the current owning action and `canManageHours === true` in both the opened response and the latest subscribed response.
An absent capability keeps the page read-only; calendar-management capability is not substituted.
The actual global academic selector consults explicitly registered draft/write guards before applying a selection and rechecks them after its ordinary confirmation.

`src/screens/library/settings/SectionManagement/Components/useSectionDraft.ts` owns the section form, opened context and actual save result.
Initialization reads the canonical `shelfDetails` names first and preserves Unicode text; missing saved names remain blank for correction.
The command keeps the existing section-name, shelf-count and shelf-name-array shape without inventing saved shelf identities.
Header close, Escape, footer Cancel and supported navigation use one local unsaved-change owner.

`src/screens/library/settings/policies/policy-form.ts` keeps the selected manual or automatic date mode in policy commands.
The editor requires automated durations only for automatic policies, and the publish action applies calendar readiness only to that mode.
Policy quotas, family identity, version revisions and action permissions remain separate from the date-mode choice.
See [backend settings behavior](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/modules/library/product.md) for policy and opening-hours rules.

## Member roster reads

`src/screens/library/MemberManagement/Components/useMemberRosterPage.ts` keeps roster page, page size and first/last-name or contact search in the URL.
It calls the existing member client with ABP `skipCount` and `maxResultCount`, preserves the returned total and uses `currentData` for the selected query.
No ignored academic-year argument, unsupported sort or column predicate is sent.
The roster retains server errors and retries the same query; pending page changes do not expose old rows as the new page.

`member-roster-columns.tsx` displays the actual printed `memberIdentifier` and complete server class/division label.
The existing canonical ID remains the View target and is not replaced by that printed identifier.
`MemberOverdueValue` renders classification availability, confirmed subsets, unknown due dates and the supplied school as-of date.
Current roster/contact access and recorded-year statistics remain separate backend boundaries.
Columns and fullscreen remain available; a loaded-page export is not offered without a full server export source.

The Charges tab uses the same year-free `useMemberRecordPage` hook and the existing `getMemberCharges` endpoint with only memberId/page/pageSize.
`src/redux/library/libraryMembers/member-charge-types.ts` types the additive assessment, recorded currency/year/copy and nullable Finance position fields without replacing the augmented pagination adapter.
The owning Members View is sufficient for this read; no per-row Finance call or financial action is added.
`MemberChargeTable.tsx` in `src/screens/library/MemberManagement/Components/ViewDetailsComponent/` uses actual totals/currentData, owning skip, inline error and exact-page Retry.
Search, sorting, filtering and export are unavailable because this endpoint supplies only paging.
Existing memberCharges/libraryCharge/member-ID tags remain the cache boundary.

## Dashboard Finance summary

The existing `dashboard-api.ts` overview query supplies the selected year and keeps the dashboard cache tag.
`dashboard-finance-types.ts` maps the additive `financePosition` evidence counts and exact currency totals; a missing summary stays null rather than becoming zero.
The shared Admin/Principal panel displays the server's separate amount strings through `formatNumber` with explicit currency and two fraction digits.
Mapping and display do not impose a command amount limit, convert money to browser numbers, combine currencies or derive a collection percentage.
Currency grouping is presentation of supplied data, not a new currency-processing capability.

Retained `charges` status/principal fields and `chargeCollectionRate` remain compatibility data; the financial panel uses local declaration counts separately from Finance balances.
Successful typed financial mutations already invalidate the dashboard through `libraryChargeMutationTags` and `finance-external-tags.ts`.
No new Finance lookup, API base or permission is required to read this owning dashboard summary.

`src/screens/library/dashboard/alerts/DashboardAlerts.tsx` renders the same overview's notices in Admin and Principal layouts; the Principal surface contains financial notices only.
The client preserves supplied titles, messages and counts for collectible, overdue collectible, unposted and financial-evidence review notices.
It performs no balance or school-date classification.
The charge-register link requires current Charges View and the exact supported Library destination; unavailable or unsupported links leave the notice readable.
When `financePosition` is absent or null, pending/overdue financial demands are replaced by an unavailable notice while review and nonfinancial notices remain visible.

## Client rules

Keep these rules when changing Library clients.

| Rule                                                  | Reason                                                                                                  |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Use adapters for DTO-to-screen mapping                | Screens should not duplicate backend field mapping                                                      |
| Keep release-surface tests aligned with active routes | Prototype pages must not look shipped                                                                   |
| Keep report screens on backend-backed panels          | Release gate checks this behavior                                                                       |
| Refresh affected lists after mutations                | Catalog, issue, return, charge, and member state must stay consistent                                   |
| Keep AI output typed                                  | The planner response must become `LibraryReportRequest`; screens must not execute model-created queries |

## AI report client

`reports-api.ts` owns plan, preview, export-queue, status, and download calls.
`library-adapters.ts` keeps calendar-only filter dates as `YYYY-MM-DD` so local dates do not shift when serialized.
The AI plan mutation returns either clarification questions or a typed request consumed by the same preview and export endpoints as manual reports.

## Charge editor and Finance handoff

The charge editor uses `src/redux/library/charges-management/charges-get-api.ts` for its own categories, member selection, exact loan selection and saved update context.
It does not require unrelated settings, member-management or issue/return permissions to populate the editor.
`library-adapters.ts` sends explicit school dates and assessment year for creation, and the exact opened `expectedSourceVersion` for amendment.
Updates do not send local Paid, Waived or paid-date declarations.

| Concern                                                                  | Owning source                                                                                                       |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Source reference, saved revision and canonical Post/Bind/Approve/Collect | `src/redux/library/charges-management/finance-source-reference.ts` and `finance-external-api.ts` in the same folder |
| Exact-action waiver context and typed refund form/preview/request        | `src/redux/library/charges-management/finance-corrections-api.ts` and `finance-corrections.types.ts`                |
| Successful financial mutation invalidation                               | `src/redux/library/charges-management/finance-external-tags.ts`                                                     |
| Saved refund history, independent review, payout and return              | `src/redux/finance/RefundManagement/feeRefundManage.ts`                                                             |
| Saved-year expense and school-bank options                               | `src/redux/finance/financeRoutingApi.ts`                                                                            |
| Actual payment receipt detail and PDF                                    | `src/redux/invoiceAndReceipt/feeReceiptApi.ts`                                                                      |

The cashier passes the exact source reference; source versions, ledger revisions and policy-version IDs remain separate values.
Waiver reads use the selected Apply, Approve, Reject or Reverse context rather than an unrelated collection read.
Refund history obtains its source-link ID from a fresh authorized charge detail and sends that exact ID with the saved assessment year before server paging.
The owning refund form is requested only for Refund Add; a reviewer can read history and the selected request with Refund View and the relevant decision action.
Refund requests and payouts retain the original command key and payload when an outcome is uncertain.
Accepted mutations refresh subscribed Finance and Library queries; failed external commands do not announce success or invalidate balances as if they had completed.

Canonical money, state, policy, tenant and recorded-source authority remain defined by [Finance backend contracts](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/modules/finance/api.md).
