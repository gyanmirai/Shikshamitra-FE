---
module: library
domain: workflows
content_type: How-to
status: canonical
updated_on: 2026-11-20
owner: frontend-team
audience: humans-and-agents
---

# Trace Library frontend workflows

TL;DR: trace Library workflows from the menu route to the App Router page, then screen folder, client, adapter, and backend contract.
Use this page to pick the first files for common Library changes.

## Trace catalog changes

Catalog changes start at `/library/book-list`.

1. Inspect `src/app/(auth-route)/library/book-list/**`.
2. Inspect `src/screens/library/BookList/**`.
3. Inspect `src/redux/library/bookList/**`.
4. Inspect `src/redux/library/library-adapters.ts`.
5. Confirm backend behavior in `../../../Shikshamitra-BE/docs/modules/library/api.md`.

## Configure and edit the catalogue

1. Open Catalogue Configuration with its dedicated View permission.
   `useCatalogueConfigurationSnapshot.ts` awaits an explicit fulfilled read before opening the form, including when RTK Query already has warm cached data.
2. The settings editor keeps that revision with the draft.
   It uses the server management capability and exact Update permission for write controls; background refresh never replaces entered values or the opened token.
3. Required-field controls, school language choices and material choices share one validated definition.
   Saved codes can be retired; new duplicate-code rows remain editable and removable.
   The form explains the effect of newly required fields before submission.
4. The catalogue header shows the Add control to users with catalogue View and Add grants. List, Cover, and Summary show Edit to users with View and Update grants.
   Cover actions stay visible and reachable by keyboard.
   The editor opens through `BookEditor.tsx` with a forced owning editor-options read.
   Its effective configuration and academic-year context stay with the editor session.
   The existing BookList navigation guard handles dirty context changes.
5. Required markers, Formik validation and the stepper use the same effective definition.
   An unchanged saved retired value remains visible; new selections use active choices.
   A background revision change displays a review action and retains the draft until explicit review.
6. New books keep both steps local until the final create request.
   Existing metadata can save separately; metadata-only completion never replays an unchanged full copy collection.
   Persisted stock above the new-entry editor limit does not block unrelated metadata changes.
7. Completion reloads actual saved copies before label actions.
   Catalogue detail displays the View-owned server labels without a settings or editor-options lookup.

The implementation lives in `src/screens/library/BookManagement/BookFormComponents/**` and `src/screens/library/settings/catalogue-configuration/**`.
See [backend catalogue behavior](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/modules/library/product.md) for the school defaults, persistence rules and validation contract.
Existing-book drafts retain independent metadata and complete-copy revisions from the explicitly fulfilled opening read.
Accepted metadata saves advance only the metadata token and retain pending copies with their original token.
Conflicting writes keep the draft and show an explicit reload action; dirty reloads require the shared discard confirmation.
The editor does not attach a background-refreshed token to old values or automatically retry a conflict.
`src/screens/library/BookManagement/BookFormComponents/useBookSaveCommit.ts` owns these accepted-save baselines.

Catalogue price is optional: a blank field means Unknown, and a saved zero remains known zero.
The editor retains full-precision price text through hydration, validation and submission.
Pasted subcent drafts remain available for correction instead of being rounded into accepted values.
Historic negative prices remain visible with their sign and can stay unchanged during unrelated metadata edits; entering a new or different negative price is rejected.
Catalogue price has no inferred currency and does not populate Stock Receiving acquisition costs.

## Delete an unused title

The catalogue exposes deletion under its exact View and Delete actions, independently of Update.
`src/screens/library/BookList/useBookDeletion.ts` requests fresh detail when the user chooses Delete; warm cached eligibility does not enable confirmation.
The shared confirmation shows the server's title-level capability or blocking reason, and failed checks offer a fresh retry.
The row stays in its subscribed paged list until the actual delete response succeeds and the existing inventory tags refresh that query.
Late server refusals retain the row and error without an early success message or delayed Undo operation.

## Trace stock receiving

The register at `/library/receiving` links to saved receipt details and the separately guarded new-entry route.
`src/screens/library/receiving/**` owns filters, server paging, preview errors, retained command attempts and receipt rendering.
Exact cost strings remain distinct from unknown costs, and date-only inputs do not acquire browser-local defaults.
Saved label actions select only the new copy IDs returned by the persisted receipt.
Current title and location labels are identified as current, while unavailable labels retain honest ID fallbacks.

## Import stock from a spreadsheet

Open Stock Imports from Stock Receiving, then choose Import stock. Select the receipt source, date and destination. Download a template or upload a UTF-8 CSV and map headings from the old register. Use the built-in title lookup for an existing `BookId` and the catalogue field guidance when creating titles.

Use Preview rows to check new titles, acquisition costs, accessions and validation errors. Download corrections if the source file needs changes. Import reviewed rows when the entire batch is valid. An uncertain response retains the command for safe retry. Use the saved batch to trace each source row to its accession and receiving receipt.

## Compare academic years

Open Year rollover within Borrowing Rules. Select a source year and a later target year, then preview the target opening calendar, effective borrowing policies, target drafts and any permitted carried-forward loan counts. Editing the years or date clears the displayed preview. Choose a later date within the target year or use its first day.

Use the Policies tab to review and publish versions through the existing editor. The rollover panel displays the loan scope and identifies totals available only to school-wide operators.

## Open a stock count and record scans

Choose the physical scope and school date, request a preview, then open the count with the returned revision. Editing the request requires a fresh preview. The saved count keeps separate tabs for expected copies and scans. The scan form accepts a keyboard entry or a scanner that enters the barcode as text.

After an unconfirmed response, retry from the same form. It retains the original command key and fields. A new deliberate scan creates a new attempt.

Use Reconciliation while the count is active to compare expected copies against the latest scan and copy register. Choose Scans outside baseline or Unknown scans from Records to review those entries. Use the Scans tab for the complete sequence of sightings and Refresh to check the current comparison.

Choose Start review and confirm the recorded scan count to close scanning. Choose Cancel count and enter a reason when abandoning an active count. A conflict prompts you to review the updated count before confirming again. The confirmation keeps the reason while you refresh the count.

During review, select Record decision on a flagged reconciliation row, choose an outcome, and record a reason. Decisions with outdated evidence are marked Evidence changed. Use Decision history to read saved versions while reviewing or after closing a count.

With approval access, select Approve count and review the decision totals. If the preview changes, refresh and confirm the current summary. Approval opens Published result, where staff can review the recorded findings by source.

In Reconciliation and Published result, Receipt recorded after opening identifies linked receiving evidence for a scan outside the baseline.

## Browse My Library as a student or guardian

Open **My Library** in the account menu and select a linked student. Browse titles, review reservations and confirmed loan dates, or request a book when the school enables it. Choose a pickup desk when one is available. Use **Review renewal** to see the proposed due date before confirming an extension.

If **Receipts** is available for your account, choose the assessment's academic year and download the official Finance PDF for a recorded Library payment.

## Dispatch and receive campus transfers

Open a saved section in **Section Management** and choose the campus that physically owns its shelves. In **Campus Transfers**, choose **Dispatch copies**, select a source section and another campus's destination shelf, then review the individual accessions and date. Open the saved transfer to receive each actual parcel. Choose the received accessions and their condition. The saved details show the source, destination, remaining accessions and receipt history.

## Hand off and receive classroom books

Open **Classroom Custody** from Library. Choose **Hand off copies**, enter the staff custodian and dates, select individual accessions, and review the handoff. Open the saved record to see the outstanding copies alongside prior receipts. Choose **Receive copies** to review a partial return, for example 19 of 20 readers, and record the condition of each received copy.

## Trace issue and return changes

Issue and return changes start at `/library/issued-books`.

1. Inspect `src/app/(auth-route)/library/issued-books/**`.
2. Inspect `src/screens/library/IssuedBook/**`.
3. Inspect `src/screens/library/circulation/**`, `src/redux/library/circulation-api.ts` and `src/redux/library/circulation-read-api.ts`.
4. Confirm copy status, issue state, return state, and member side effects.

### Renew a saved loan or review school dates

The Issue & Return table exposes row actions through `LoanActions.tsx` and opens the shared `CirculationDialogs.tsx` workspace with the exact saved loan and copy IDs.
Each action keeps its own current permission and freshly read server capability; Return access is not used as a substitute.

1. Open Renew or Review School Dates and wait for the fresh exact-loan read before entering a draft.
   The dialog displays saved school-date evidence separately from verbatim unconfirmed historical timestamps.
2. For renewal, use the confirmed server school day or enter an explicit school date.
   Staff select an actual authorized renewal year independently of the saved loan year; the dialog does not default from global context.
   Manual terms require an explicit new due date, while automatic terms show the server preview and any required calendar-change explanation.
3. For date review, only offered fields are editable; explicit transaction dates and an already saved original due date remain read-only.
   Enter a review reason and reliable school-date evidence without converting raw timestamps into confirmed dates.
4. Submit against the frozen opening record and reviewed preview.
   Validation and server refusals retain the values; a changed record requires explicit reload/review through the shared dirty-close guard.
   A failed background loan read offers Retry current record without discarding evidence or adopting a different revision.
5. If the response is uncertain, dismissal, editing and guarded context changes remain blocked while Retry same submission replays the retained complete command and key.
   A confirmed result closes the dialog and refreshes subscribed circulation data.

`LoanMaintenanceDialog.tsx`, `useRenewalDraft.ts` and `useDateReviewDraft.ts` own these sessions.
Drafts and retry intents are held in the mounted workspace; reload or unmount persistence is not provided.

## Configure Library hours and borrowing policies

1. Open Library Hours with an explicitly selected academic year.
   The page retains its header during the current opening read and shows failed reads with a real retry action.
2. Enter the Library schedule manually; no linked school-hours schedule is available to import.
   Each day keeps its saved Open, Closed or Holiday status, and missing weekdays are identified as new draft rows.
3. Open days require valid opening and closing wall-clock times.
   Unsupported historical time strings remain visible as Needs review until the operator explicitly corrects them.
4. Save the draft through the confirmation and await the actual request result.
   Failed saves retain values and errors; accepted saves reset the baseline to the submitted schedule.
   Background refreshes retain unsaved changes, and explicit reload or navigation uses the shared discard guard.
   Management controls remain read-only unless the current owning action and server capability both allow editing.
   Changing the global academic year consults the actual draft guard before remounting annual hours; Keep editing preserves the opened year and draft.
5. In a borrowing policy draft, choose Manual dates or Automatic dates before entering its terms.
   Manual policies retain explicit-date behavior without requiring automatic durations or configured-calendar readiness at publish.
   The selected mode does not change the policy's quotas, family role or lifecycle permissions.

`src/screens/library/settings/LibraryTiming/**` and `src/screens/library/settings/policies/**` own these workspaces.
Section Management reads actual configured shelf names and IDs; occupancy is shown as unavailable when the read contract does not supply it.
Its form awaits the actual save result before closing and retains a rejected draft.
The section dialog initializes actual saved shelf names, accepts Unicode names unchanged, and validates required unique shelf names before sending the existing command.
Its local form owns header close, Escape, Cancel and discard confirmation; pending writes lock these paths.
Section and shelf ownership remains school-wide rather than being recreated when annual Hours context changes.

## Trace member and charge changes

Member and charge flows cross screens and client folders.

| Workflow               | Inspect first                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| Member list and detail | `src/screens/library/MemberManagement/**` and `src/redux/library/libraryMembers/**`      |
| Charges                | `src/screens/library/ChargesManagement/**` and `src/redux/library/charges-management/**` |
| Dashboard              | `src/screens/library/dashboard/**` and `src/redux/library/dashboard-api.ts`              |

## Browse Library members

1. Open Library Members with its owning View access.
   The roster loads an actual server page and total; page, page size and search remain in the URL.
2. Search by first or last name, or contact information, across the authorized current roster.
   Search changes reset to the first page, and clearing search restores the unfiltered query.
   No unsupported identifier search, global column sort or loaded-page export is implied.
3. Read the printed member ID and complete class/division label, then use View to open that person's canonical record.
   Overdue values retain their school as-of date and distinguish unclassified or incomplete counts from a known zero.
4. Use Retry after a failed roster read.
   Changing the global current year does not insert a fictitious roster-year filter or hide borrowing totals from earlier authorized recorded years.

## Review and settle a Library assessment

`src/screens/library/ChargesManagement/Components/finance/FinanceCashier.tsx` owns the contextual Finance workflow inside the existing charge dialog.

1. Open the actual saved assessment with Library Charges View.
   Existing editors wait for a fulfilled current read before opening values and keep the exact source version with the draft.
   Creation uses an explicitly selected assessment year and school dates; editing retains the saved member, category and loan source.
2. Post, bind recorded policy versions, independently approve and collect through each action's Finance context.
   A local Library status is not payment evidence, and historical local Paid/Waived records without Finance linkage remain review-only.
3. Collection keeps accepted payment, pending bank verification, financial outstanding and collectible amounts distinct.
   Cash completion and provisional bank receipts show the actual saved Finance result; a receipt opens through its own viewing permission.
4. Use Request waiver, Review waivers, Reject waivers or Reverse waiver under the exact corresponding action.
   The selected context supplies current capability, policy, limits and eligible requests before a decision.
   A pending request is shown separately from an applied waiver, and partial reversal retains the original application.
5. Open Refunds with Refund View.
   History uses the authorized saved source-link ID and assessment year, independently of the application's currently selected year.
   Refund Add opens actual settled receipt allocations and the recorded allowed payout methods; preview shows the entered request separately from the server-calculated payable amount.
6. Independent review uses the saved request and actual saved-year expense and school-bank options.
   Approval of a cash refund records its payment atomically, so the screen does not offer a second payment for that response.
   A noncash payout uses the approved server amount, an explicit payment instant and a stable command key.
7. Return a supported original noncash payout with its exact settlement ID, reason and evidence reference.
   The original refund, receipt and paid/returned amounts remain in history.
   Recovery states without an actual supported producer are shown for review rather than creating a fictional processing step.

Every Finance action retains the current Library read boundary as well as its own Finance permission.
Reviewing a waiver or refund does not require unrelated Fee Collections View or Settings access.
Dirty corrections prevent switching to another action, and uncertain writes retain their original command until retry or a fresh saved-status check resolves the outcome.
Backend authorization remains responsible for current tenant, actor, independent billing-year and recorded-source scope checks.
See [Finance backend workflows](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/modules/finance/workflows.md) for canonical calculation and payment rules.

## Read a member's charge history

Open the Charges tab in the existing member detail view with Members View.
The table requests only the selected canonical member ID and page/pageSize; it does not filter saved history by the global academic year.
Rows retain their recorded year references, charge type, book/copy context and school-date evidence.
Local Pending/Paid/Waived are labelled declarations and do not establish settlement.

Original assessment text is separate from the supplied Finance evidence and approval state.
Verified rows show Collectible and Pending verification immediately; More amounts reveals the other six exact values without another request.
Unposted, review, absent and null positions remain distinct from verified zero money.
Unknown currency stays unconfirmed, and unsupported historical assessment text remains verbatim with a review cue.
The tab offers no collection, waiver, refund, receipt or other financial command.

Changing members clears the previous person's rows while the new read loads.
A failed read remains an inline error with Retry; permission loss or a missing saved member hides rows and skips the request.
Columns and fullscreen remain available, while unsupported search/filter/sort/export controls are omitted.

## Read the dashboard Finance position

Open Library Dashboard with its own View permission and select the academic year through the existing global context.
The overview query keeps currentData, refresh/error/retry and year boundaries; the financial panel reads that same authorized response.

`src/screens/library/dashboard/finance/DashboardFinancePanel.tsx` is shared by the Admin and Principal layouts.
It shows verified, review and unposted record counts separately from the exact totals in each supplied currency.
Pending bank verification stays separate from settled money, and net waiver/refund fields remain the server's values.
Local Paid/Pending/Waived declarations retain explicit declaration labels and do not populate canonical collected-money cards.
An absent Finance summary is unavailable; a supplied empty verified group is a different state.

The financial KPIs show review/verified record counts, without inferred collection percentages, monthly revenue or fabricated trends.
The Finance review card has a keyboard-accessible charge-register link only while the current Charges View is granted; its inner shared card does not perform a second navigation.
The financial Quick Action applies the same owning destination View without requiring a Finance grant or enabling cashier actions.
Read financial notices in either layout without opening a cashier action.
Collectible and overdue collectible notices display the server's authorized classifications, while unposted and financial-evidence notices request review rather than declare debt.
Their titles, messages and counts remain unchanged in the UI.
An exact charge-register link appears only with current Charges View; the notices remain readable without that destination permission.
If the Finance summary is missing, older pending/overdue financial demands are suppressed and verification is shown as unavailable.
Review notices and nonfinancial operational notices remain visible.

## Open Library settings

Open a backed settings task from the Library sidebar or its existing direct URL.
The task's own View guard applies without an additional aggregate Settings grant; the Settings group and search keep unauthorized siblings hidden.
Legacy condition, membership, report and permission settings URLs open their backed destinations, retaining each destination's guard.
The retired curriculum-template placeholder returns the normal not-found page and offers no fictional save action.
See [route boundaries](./routes.md#settings-route-and-navigation-ownership) for the source map.

## Trace report and notification changes

Reports and notifications have release-gate coverage.

| Workflow      | Inspect first                                                                      |
| ------------- | ---------------------------------------------------------------------------------- |
| Reports       | `src/screens/library/reports/**` and `src/redux/library/reports-api.ts`            |
| Notifications | `src/screens/library/Notification/**` and `src/redux/library/notifications-api.ts` |
| Settings      | `src/screens/library/settings/**` and `src/redux/library/settingApi.tsx`           |

## Preview and generate Library reports

Open Reports and choose **Build manually**. Select a report, academic year, and any supported filters, then run **Preview** to see up to 50 matching rows. If you change the request, run **Preview** again to see the new result.

`Library.Reports.View` allows previews and access to your authorized export history. `Library.Reports.Export` is also required to generate a PDF or Excel report. Return to the Reports page to see the queued job and download the file when it is ready.

For Fine Collection, **Recorded charge status** filters the status saved in Library. Finance amounts in the result reflect the verified settlement position.

## Trace AI report generation

1. `LibraryAiReportDrawer` collects the user's wording in English, Gujarati, Hindi, or mixed natural language.
2. `useLibraryAiReport` calls the plan endpoint and renders material clarification questions when needed.
3. A ready typed plan is sent to the normal preview endpoint.
4. `LibraryAiReportPlanReview` shows the interpreted request, selected filters and columns, format, assumptions, permission summary, and live rows.
5. Users with both Reports permissions can approve the plan and queue PDF or Excel generation through the normal Library export endpoint.
6. The reports screen polls export status and refreshes the visible export list.
