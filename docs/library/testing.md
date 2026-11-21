---
module: library
domain: testing
content_type: Troubleshooting
status: canonical
updated_on: 2026-11-20
owner: frontend-team
audience: humans-and-agents
---

# Validate Library frontend changes

TL;DR: run docs validation for documentation changes and targeted Library tests for client, adapter, release-surface, and browser changes.
Do not claim Library behavior is validated unless the relevant tests or a stronger suite ran.

## Documentation checks

Run one of these commands after editing Library docs.

```powershell
node scripts/docs/validate-docs.mjs --module library
npm run docs:check
```

## Focused frontend checks

Use these commands as the first validation set.

| Risk area                  | Command                                                                |
| -------------------------- | ---------------------------------------------------------------------- |
| Library adapters           | `npm run test -- src/redux/library/library-adapters.test.ts`           |
| Library endpoint contracts | `npm run test -- src/redux/library/library-endpoints.contract.test.ts` |
| Release surface            | `npm run test -- src/screens/library/library-release-surface.test.ts`  |
| Browser release gate       | Codex in-app browser with the signed-in school and role scenarios below |
| TypeScript impact          | `npm run ts`                                                           |

On Windows, focused Vitest runs can use the existing network-use patch and a serial worker:

```powershell
node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vitest/vitest.mjs run src/redux/library/catalogue-configuration-api.test.ts src/screens/library/BookManagement/BookFormComponents/catalogue-book-schema.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism
```

## Report regressions

Run `src/screens/library/reports/components/report-export-action.test.tsx` for exact export grants in manual and AI report generation, grant revocation, and preview invalidation when the academic year changes. Run `src/screens/library/reports/components/report-date-evidence.test.tsx` for school-date evidence in report previews.

## Stock import regressions

Run `npm run test -- src/screens/library/receiving/stock-import/useStockImportDraft.test.tsx` and the Receiving route and history tests. Verify stable CSV text values, stale preview invalidation and exact retry after an uncertain response.

Use the in-app browser to exercise CSV upload, header mapping, correcting a rejected file, reviewing and committing an accepted batch, opening its retained receipt, and denying a write with View-only access.

## Stock verification regressions

Run `src/screens/library/stock-verification/stock-verification.test.tsx` to check preview freshness, opening and scan retry identity, deliberate repeat scans, action-specific controls, and the reconciliation view for read-only staff.

The same suite covers the review confirmation, exact retry after an unconfirmed response, and preservation of a cancellation reason across a stale-state conflict.

It also covers refreshing changed evidence while keeping the decision draft, the read-only review view, and reading the retained history.

Run the same suite for stale approval preview recovery and the published result. The stock verification navigation suite checks that the role editor keeps Approve separate from Update.

## Pickup, campus transfer and My Library regressions

Run the reservation, campus-transfer, Section Management and My Library test folders. Verify direct routes, exact role actions, a partial transfer to a chosen destination, a pickup request with stock at another campus, linked student selection, and renewal review before save. Run the policy preset tests for editable examples that preserve a draft's role, scope, dates and identity.

`MyLibraryWorkspace.test.tsx` checks linked-student paths, preview-before-save, and the Receipts tab's Finance grant and verification label. During browser smoke, use a linked account with both grants to download a receipt from its recorded academic year.

## Classroom custody regressions

Run `src/screens/library/custody/useCustodyAction.test.tsx` for preview invalidation and exact retry after an uncertain response. In the browser, review a handoff with two accessions, receive one, and verify the saved receipt and outstanding count. Check a View-only account and a user without school-wide custody access.

## Catalogue configuration regressions

| Risk                                                                                             | Test sources                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authenticated settings transport and subscribed label refresh                                    | `src/redux/library/catalogue-configuration-api.test.ts` and `src/redux/library/catalogue-presentation-cache.test.ts`                                                                        |
| Configured requiredness, limits, legacy numeric meanings and custom codes                        | `src/screens/library/BookManagement/BookFormComponents/catalogue-book-schema.test.ts` and `src/screens/library/BookManagement/BookFormComponents/catalogue-book-metadata.test.ts`           |
| Real settings form, fulfilled cache snapshot and new duplicate-code rows                         | `src/screens/library/settings/catalogue-configuration/*.test.tsx`                                                                                                                           |
| Effective editor rules, warm cache, dirty session and original-year guard                        | `src/screens/library/BookManagement/BookFormComponents/catalogue-editor-*.test.tsx` and `src/screens/library/BookList/catalogue-year-guard.test.tsx`                                        |
| Dedicated route, menu and search authority                                                       | `src/constants/library-catalogue-*.test.ts*` and `src/layouts/components/searchbar/catalogue-configuration-search.test.ts`                                                                  |
| View-only saved labels                                                                           | `src/screens/library/BookList/Components/BookView/catalogue-read-labels.test.tsx`                                                                                                           |
| Large persisted holdings, metadata-only saves and intentional copy writes                        | `src/screens/library/BookManagement/BookFormComponents/catalogue-large-holdings.test.tsx` and `src/screens/library/BookManagement/BookFormComponents/catalogue-copy-write-control.test.tsx` |
| Unknown, zero, full-range exact price, strict validation and actual metadata requests            | `src/screens/library/BookManagement/BookFormComponents/catalogue-price-*.test.ts*`                                                                                                          |
| View-only price display and preserving historic signed prices                                    | `src/screens/library/BookList/Components/BookView/catalogue-price-*.test.tsx`                                                                                                               |
| Two-editor metadata/copy conflicts, accepted-response tokens and dirty background refresh        | `src/screens/library/BookManagement/BookFormComponents/catalogue-*-revision.test.tsx`                                                                                                       |
| Warm detail cannot enable writes before the explicit fresh read fulfills                         | `src/screens/library/BookManagement/BookFormComponents/catalogue-detail-readiness.test.tsx`                                                                                                 |
| Fresh title-deletion checks, Delete-only authority, late refusal and awaited paged-cache refresh | `src/screens/library/BookList/catalogue-delete-*.test.tsx`                                                                                                                                  |

Retain the existing book model, copy validation, retention and create/reload-retry tests when changing the editor.
Run scoped ESLint, `npm run ts`, formatting and `git diff --check` separately from unit tests.
Passing a schema or component suite does not prove the browser workflow.

For browser validation, exercise exact View-only and Update actors, defaults and configured choices, a retired saved value, a dirty editor while configuration changes, original-year navigation and a stale settings save.
Verify metadata-only saves on a title with more than 1000 saved copies and reload actual saved labels.
Exercise a blank new price, a known zero, the supported exact decimal maximum, a pasted subcent value and an unchanged historic negative during a publisher edit.
Verify that the displayed and submitted prices retain their exact values and that acquisition costs remain separate.
Open the same title in two sessions, save one metadata/copy change, and verify that the stale session retains its draft on conflict.
Verify that an unrelated stock change reported with a successful metadata response does not authorize an old copy collection.
Exercise explicit reload/discard and confirm that a background refresh alone cannot enable a retry with a new token.
Verify title deletion with a Delete-only actor, blocked receiving history, a failed eligibility check and a late server refusal.
Keep the row and confirmation locked appropriately while the actual delete is pending, and verify that success follows its response.
Check the settings and editor layouts at narrow widths and distinguish browser results from source and automated test results.

## Loan maintenance regressions

| Concern                                                                                       | Test source                                                         |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Exact action grants and saved row identity                                                    | `src/screens/library/circulation/LoanMaintenance.actions.test.tsx`  |
| Manual staff dates/year, automatic preview and calendar acknowledgment                        | `src/screens/library/circulation/LoanMaintenance.renew.test.tsx`    |
| Eligible historical return evidence and false capability                                      | `src/screens/library/circulation/LoanMaintenance.review.test.tsx`   |
| Fresh warm-cache opening, frozen revisions, retained errors and uncertain replay/context lock | `src/screens/library/circulation/LoanMaintenance.session.test.tsx`  |
| Late preview cannot replace newer input                                                       | `src/screens/library/circulation/LoanMaintenance.preview.test.tsx`  |
| Actual subscribed school context and preview refresh after calendar save                      | `src/redux/library/loan-maintenance-cache.test.ts`                  |
| Latest confirmed-day banner/action with retained dirty dates and opening revision             | `src/screens/library/circulation/LoanMaintenance.clock.test.tsx`    |
| Retained evidence through failed current-record reads and revision-safe retry                 | `src/screens/library/circulation/LoanMaintenance.recovery.test.tsx` |

Run these alongside the existing canonical issue/return, selected-loan identity and command-attempt regressions.
Maintenance entry tests hoist the auth transport mock before runtime-backed data or Redux imports while retaining the real shared session cache and RTK requests.
Reason-entry fixtures exercise keyboard and paste events with the full command text asserted under the default test timeout.
Browser acceptance must exercise Renew-only and ReviewDates-only actors without unrelated Return, Calendar or Academic grants, a blank manual school date, independent staff year selection and a changed-calendar explanation.
Verify a warm cached opening, stale preview, retained conflict, explicit discard/reload and unchanged uncertain replay through the actual shared dialog.
Inspect narrow layouts and confirm that a guarded context change cannot discard an unresolved command.
Automated tests do not prove browser acceptance or persistence after a reload.

## Library assessment and Finance regressions

| Risk                                                                                       | Test sources                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Explicit civil dates, selected assessment year and decimal validation                      | `src/redux/library/library-charge-civil-money.test.ts`, `src/screens/library/ChargesManagement/Components/AssignChargesCivilValidation.test.ts` and `AssignChargesForm.civil-submit.test.tsx` in the same folder                                                                               |
| Owning lookups, exact loan ID and opaque source version                                    | `src/redux/library/charges-management/charge-editor-api.test.ts`, `src/redux/library/library-charge-source-version.test.ts`, `src/redux/library/library-charge-editor-source-payload.test.ts` and `src/screens/library/ChargesManagement/Components/AssignChargesForm.editor-lookups.test.tsx` |
| Actual Post/Bind/Approve/Collect UI and permissions                                        | `src/screens/library/ChargesManagement/Components/AssignChargeProcessForm.finance.test.tsx`                                                                                                                                                                                                    |
| Pending verification and retrying the same unresolved collection                           | `src/screens/library/ChargesManagement/Components/AssignChargeProcessForm.collection-safety.test.tsx`                                                                                                                                                                                          |
| Actual Student/Employee receipt, saved school date and immutable financial labels          | `src/screens/finance/InvoiceAndReceipt/Components/ReceiptManagement/Components/ReceiptPreviewDialog.settlement.test.tsx`                                                                                                                                                                       |
| Exact-action waiver/refund clients and success-only cache invalidation                     | `src/redux/library/charges-management/finance-next-actions-api.test.ts`                                                                                                                                                                                                                        |
| Partial waiver, independent review, maker refusal and partial reversal                     | `src/screens/library/ChargesManagement/Components/AssignChargeProcessForm.waiver.test.tsx`                                                                                                                                                                                                     |
| Employee refund preview/request, cash approval, noncash payout and original-payment return | `src/screens/library/ChargesManagement/Components/AssignChargeProcessForm.refund.test.tsx`                                                                                                                                                                                                     |

Run the earlier charge, receipt, collection, formatter and editor suites alongside correction tests when changing the shared cashier or API injection.
Keep command-body assertions for the exact source, ledger revision, policy-version ID and stable idempotency key.
Test requested paise separately from the server-calculated whole-rupee refund payout, and preserve original settled receipt amounts.
Confirm that action-only reviewers make no unrelated collection, settings or fee-assignment requests.

For browser validation, exercise a real Student and Employee, a historical recorded source with a different current year, independent approval, partial payment and pending bank verification.
Open both actual payment and refund receipts, repeat an unresolved command with the same key, reverse part of an applied waiver and return an original noncash payout.
Verify dirty close/action-switch guards, narrow-screen reachability and current permission revocation.
Mounted MSW tests and source checks do not replace that browser acceptance.

## Member charge history regressions

| Concern                                                                         | Test source in `src/screens/library/MemberManagement/Components/ViewDetailsComponent/` |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Real totals/page requests and unchanged global-year history                     | `member-charge-position-paging.test.tsx`                                               |
| Exact original assessment, local declarations and civil/raw date evidence       | `member-charge-assessment.test.tsx`                                                    |
| Cash/waiver versus reserved-bank fields, default actionability and More amounts | `member-charge-canonical-position.test.tsx`                                            |
| Missing/null old position, Unposted and NeedsReview without invented money      | `member-charge-legacy-evidence.test.tsx`                                               |
| Missing member, error/Retry, delayed member switch and live action revocation   | `member-charge-position-state.test.tsx`                                                |

Keep the adjacent member-record tab, context and state tests when changing this owning query.
The historical subcent wire fixture tests presentation and does not establish PostgreSQL subcent storage.
Browser acceptance must inspect long history paging, narrow-table scrolling, keyboard disclosure, read failure/recovery and live permission/member changes.
Confirm that the tab exposes only its supported read controls and never treats a local Paid/Waived declaration as settlement.

## Dashboard Finance regressions

| Concern                                                                                       | Test source                                                                                                                   |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Existing owning overview request, selected year, exact text and absent-summary mapping        | `src/redux/library/dashboard-finance-api.test.ts`                                                                             |
| Both role panels, bank-versus-settled values and retained local declarations                  | `src/screens/library/dashboard/dashboard-finance-panels.test.tsx`                                                             |
| Currency groups, exact aggregate paise, known zero and review-only currency absence           | `src/screens/library/dashboard/dashboard-finance-currencies.test.tsx`                                                         |
| Financial record-count KPIs without invented rates or financial sparklines                    | `src/screens/library/dashboard/dashboard-finance-kpis.test.tsx`                                                               |
| Actual Charges View Quick Action boundary and keyboard KPI link/revocation                    | `src/screens/library/dashboard/dashboard-finance-links.test.tsx` and `dashboard-finance-kpi-link.test.tsx` in the same folder |
| Server financial notice copy/counts, safe destination links and missing-summary compatibility | `src/screens/library/dashboard/dashboard-financial-alerts.test.tsx`                                                           |
| Principal read-only financial notices and live destination permission revocation              | `src/screens/library/dashboard/principal-financial-alerts.test.tsx`                                                           |

Retain `src/screens/library/dashboard/dashboard-date-evidence.test.tsx` when changing these cards.
The multi-currency display fixture does not establish additional backend currency-processing support.
For browser acceptance, compare actual partial settlement and pending bank evidence, inspect missing and empty summaries, verify exact paise and separate currency groups, and confirm that local declarations never become settled amounts.
Exercise both role layouts at narrow widths and activate the review card with the keyboard before and after Charges View changes.
Keep the existing selected-year/currentData/error/retry behavior.
Check that server collectible/overdue notices, unposted/review notices and local declarations retain their distinct meanings.
With an absent or null Finance summary, confirm that legacy pending/overdue demands are suppressed while review and nonfinancial notices remain readable.
Exercise the exact charge-register links before and after Charges View changes in both layouts.
Automated component and request tests do not replace final in-app browser acceptance.

## Settings truth and manual date mode

| Risk                                                                                                   | Test sources                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Actual shelf facts, unavailable occupancy and failed reads                                             | `src/screens/library/settings/SectionManagement/Components/section-facts.test.tsx`                                                                           |
| Rejected section saves retain drafts and pending saves lock dismissal                                  | `src/screens/library/settings/SectionManagement/Components/section-save.test.tsx`                                                                            |
| Manual policy terms, editor selection and mode-aware publishing                                        | `src/screens/library/settings/policies/policy-manual-terms.test.ts`, `policy-manual-editor.test.tsx` and `policy-manual-publish.test.tsx` in the same folder |
| Truthful school-hours availability and retryable opening reads                                         | `src/screens/library/settings/LibraryTiming/hours-truthfulness.test.tsx`                                                                                     |
| Actual Open/Closed/Holiday values and unsupported historical time evidence                             | `src/screens/library/settings/LibraryTiming/hours-status-evidence.test.tsx`                                                                                  |
| Dirty fulfilled-cache refresh and real year/time save payload                                          | `src/screens/library/settings/LibraryTiming/hours-draft-refresh.test.tsx`                                                                                    |
| Canonical shelf response hydration, unchanged names in updates and exact Unicode creation              | `src/screens/library/settings/SectionManagement/Components/section-editor-data.test.tsx`                                                                     |
| Shared header/Cancel discard owner and retaining edits without a native confirmation                   | `src/screens/library/settings/SectionManagement/Components/section-editor-close.test.tsx`                                                                    |
| Required and trim/case-insensitive duplicate shelf validation without a command                        | `src/screens/library/settings/SectionManagement/Components/section-shelf-validation.test.tsx`                                                                |
| Actual Hours management capability, missing-capability fail-closed behavior and current actions        | `src/screens/library/settings/LibraryTiming/hours-authority.test.tsx`                                                                                        |
| Mounted annual Hours through the actual global selector, opened-year submission and clean year changes | `src/screens/library/settings/LibraryTiming/hours-context.test.tsx`                                                                                          |

Run the existing policy draft and immutable-family regressions alongside the manual-mode tests.
For global selector changes, retain `src/layouts/components/global-academic-search/use-academic-confirmation.test.tsx` and `src/hooks/use-unsaved-context.test.tsx` to protect Student, busy-write and no-owner behavior.
For browser acceptance, inspect both reading and editing hours at narrow widths, retain an unsaved change during refresh, correct an unsupported historical time, and preserve Holiday during a real save.
Exercise manual and automatic policy publishing separately, including the automatic calendar prerequisite.
Automated component and request checks do not replace the final in-app browser workflow.

## Settings route and navigation regressions

| Coverage                                                                         | Source                                               |
| -------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Composed Settings parent and exact backed-child View boundaries                  | `src/constants/library-settings-routes.test.tsx`     |
| Child-derived Settings group and exact search destinations                       | `src/constants/library-settings-navigation.test.ts`  |
| Prototype redirects, normal not-found response and canonical destination denials | `src/constants/library-settings-prototypes.test.tsx` |

Browser acceptance must check a reader with one child View and no aggregate Settings grant, a direct URL with only the obsolete aggregate, and the retained Security Role guard after the legacy permission redirect.
No compatibility route may render the retired fake-save form or transfer Library access to Security.

## Member roster regressions

| Concern                                                                                          | Test source                                                                     |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Actual ABP offsets/totals, server search, failed read/retry and no ignored current-year filter   | `src/screens/library/MemberManagement/Components/member-roster-paging.test.tsx` |
| Printed identifier versus canonical View identity, whole class label and honest overdue evidence | `src/screens/library/MemberManagement/Components/member-roster-values.test.tsx` |
| Held page response, stale-row exclusion, URL page restoration and accurate paginator range       | `src/screens/library/MemberManagement/Components/member-roster-state.test.tsx`  |

Retain `src/screens/library/MemberManagement/Components/member-statistics-classification.test.tsx` when changing shared overdue rendering.
For browser acceptance, inspect a roster with more than one page, navigate directly to a saved page URL, search a name outside the first page, retry a failed read and open the actual member detail from its printed ID row.
Check unclassified and partially classified overdue values and confirm that the global current-year control does not imply a filter the roster endpoint lacks.

## Add coverage when needed

Add or update tests when a change affects these areas.

| Change                      | Expected coverage                    |
| --------------------------- | ------------------------------------ |
| Active route or menu status | Release-surface test                 |
| Client endpoint shape       | Endpoint contract test               |
| DTO mapping                 | Adapter test                         |
| Report screen behavior      | Release-surface or browser gate test |
| End-to-end release behavior | Playwright release gate              |
