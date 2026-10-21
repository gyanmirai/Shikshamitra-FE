---
module: institute-setup
domain: workflows
content_type: How-to
status: canonical
updated_on: 2026-10-21
owner: frontend-team
audience: humans-and-agents
---

# Configure School Identity

## Reports

1. Open Institute Setup > Reports to review the current user's generated files. Search, column filters, export, fullscreen and density use the shared table.
2. Choose Report, select a permitted report and configure scope/format. Hierarchy reports default to the selected permitted academic year; rooms and shifts need no academic context.
3. Preview current matching data with server pagination, then generate the complete filtered report. Return to history while background generation runs and download completed files.
4. Generate report using ShikshaMitra AI accepts a prompt, asks clarifying questions when needed, and displays a plan plus a live preview. Explicit approval queues the file. Errors retain the prompt; Edit request clears the previous approval.
5. View-only users can preview current data and download their completed files. Failed/expired files offer generation again only with Add access.

For shift reports, ask for total hours to add the calculated column beside start/end time. The preview renders the server-provided column and calculation summary without client arithmetic. Prepare a new plan when changing the requested columns; an existing approved plan or saved file retains its original selection. Calculation rules are owned by the [backend product guide](../../../Shikshamitra-BE/docs/modules/institute-setup/product.md#reports).

School Documents adds register and category-count choices with no academic prerequisite. School Identity adds configured-profile register/count choices with optional context filters, plus signature configuration only when authorized. Source-denied datasets disappear from choices and cached history. AI prompts such as "How many school documents are available by category?" and "Count school identity profiles by scope" use the same preview/approval flow. Reports show metadata, configured selections and counts; they do not attach source files or images.

## School Documents

1. Open Institute Setup > School Documents. Search by document name or filter by category; the table groups all attachments under one record.
2. Select Add Document, enter a name and category, optionally add notes, then choose supporting files. Selection and local preview do not upload anything.
3. Submit uploads metadata and files together. The form locks while saving; failures retain the draft for retry. Cancel, Escape and navigation use the shared unsaved-navigation guard with a standard Keep Editing / Discard Changes confirmation.
4. View opens read-only Document Details and Attachments sections. Preview opens the selected PDF/image; Download saves an authenticated copy. A failed saved preview supports Retry Preview.
5. Edit can change metadata and add files. Removing saved attachments requires Delete permission; removing newly selected files only changes the draft. Stale saves preserve the draft and ask the user to reopen the record.
6. Delete requires confirmation and removes the record and its files from the visible library. Backend retention is described in the [product guide](../../../Shikshamitra-BE/docs/modules/institute-setup/product.md#school-documents).

Forms and views reuse CustomDialog, FormSectionCard, CustomUpload and the configured theme. Notes and filenames wrap, file actions stack at phone widths, and closing a nested preview preserves the underlying form. Expiry tracking, renewals, verification and board/medium links are outside this version.

## Academic hierarchy standard and division dialogs

The active stage supplies its existing standard names to `ClassForm`, including onboarding. Submitting an existing name shows a field error before confirmation. Case and surrounding spaces do not create a distinct name; editing excludes the current record. If another user creates the name after the form opens, the server conflict produces a specific toast and returns focus to an editable draft. The parser also recognizes the older shared duplicate code when its entity is explicitly `standard`.

Initial setup Add Division and Edit Division expose name and strength only, send no room field and make no room-option request. Regular Academic Setup includes an optional searchable room selector. Editing displays the saved assignment, preserves it when untouched, and sends an empty value only when the user clears it. Related hierarchy form actions use consistent Cancel, Submit and Confirm icons. See the [backend API contract](../../../Shikshamitra-BE/docs/modules/institute-setup/api.md) for authoritative persistence behavior.

The selected standard supplies its existing division names to `DivisionForm`. Onboarding and management share `useDivisionForm`: duplicate names show an inline error before confirmation, with case and surrounding spaces ignored and the edited record excluded. A server duplicate response closes confirmation, retains name and strength, and shows a specific toast and name-field error so the user can correct and resubmit. The parser supports both the dedicated division conflict code and the legacy shared code when `entityName` is `division`.

## School Identity configuration

The Module Permission dialog retains the compact View/Add/Delete layout for both users and roles. School Identity Delete is unavailable by design, so every choice in that group stays disabled. Add groups the server's existing configuration and signature capabilities; View remains separate. No Delete grant is generated or submitted. See the [backend product rules](../../../Shikshamitra-BE/docs/modules/institute-setup/product.md#school-identity) for supported asset changes and retention.

TL;DR: submit shared assets once, then change only the assets that differ for a board, medium or organization. [Backend product rules](../../../Shikshamitra-BE/docs/modules/institute-setup/product.md) own resolution and document retention.

1. Open School defaults and edit the logo, banner/letterhead and principal signature.
2. Choose inherited, custom or do not display independently for each asset. Custom signatures require the principal's name and designation together.
3. Upload PNG/JPEG files, review image proportions and resolution warnings, and preview the draft PDF.
4. Submit. Uploading alone does not change saved configuration; cancellation leaves the existing settings intact.
5. Open Board, medium & organization overrides, choose the academic year and board, then All mediums or one medium. Choose a specific medium to enable Organization; All organizations shows medium settings. Organization means the academic stage, such as Primary or Secondary.
6. Review each effective asset's source before editing. Reset to inherited requires confirmation and does not change issued documents.
7. In a new year, select the target context and Copy from another year. Review an explicitly selected source of the same override level before copying. Files are reused, not uploaded again.

Editing captures the original profile and stamp. Background refetches cannot silently update an open editor's version. A conflict preserves the draft and asks the administrator to reload and review the latest settings.

Changing the year, board or medium clears child selections, including the organization. The organization name dialog contains no banner upload; all organization image changes use School Identity.

The override tab initially uses the application's selected academic year when it is available. Edit, reset and copy controls require both the action grant and the backend's canManage capability for the whole selected context. Restricted contexts remain readable and show a read-only explanation.

Template controls use the same upload/editor rules. Existing custom values have a Keep existing custom asset choice until deliberately replaced. Signature controls require signature access. On narrow screens, selectors and asset sections stack; every upload has a file-picker action.

## Room configuration

At `/setting/room`, Add Room and Update Room use shared section cards for location, bench layout and features. Enter a column count to show one labelled group per column, with a row-count field, bounded plus/minus controls and a bench/student subtotal. Changing the count preserves the remaining column values. Totals are read-only and update from those rows and students per bench. Legacy partial grids open with their existing bench count distributed in row order.

Preview room opens a separate read-only dialog showing unequal columns, illustrated desks/benches, seated student figures and total capacity. Fit room shows the complete layout; zoom controls allow closer inspection in a keyboard-scrollable canvas. Student figures indicate capacity. Back to form, Close and Escape dismiss only the preview and restore the draft and trigger focus. Extra feature saves a reusable catalogue choice immediately and selects it for this room; cancelling the room does not remove that catalogue choice. Submit waits for success, locks closing while a write is pending, and retains the draft after failure.
