---
module: institute-setup
domain: workflows
content_type: How-to
status: canonical
updated_on: 2026-10-15
owner: frontend-team
audience: humans-and-agents
---

# Configure School Identity

## Academic hierarchy standard and division dialogs

The active stage supplies its existing standard names to `ClassForm`, including onboarding. Submitting an existing name shows a field error before confirmation. Case and surrounding spaces do not create a distinct name; editing excludes the current record. If another user creates the name after the form opens, the server conflict produces a specific toast and returns focus to an editable draft. The parser also recognizes the older shared duplicate code when its entity is explicitly `standard`.

Initial setup Add Division and Edit Division expose name and strength only, send no room field and make no room-option request. Regular Academic Setup includes an optional searchable room selector. Editing displays the saved assignment, preserves it when untouched, and sends an empty value only when the user clears it. Related hierarchy form actions use consistent Cancel, Submit and Confirm icons. See the [backend API contract](../../../Shikshamitra-BE/docs/modules/institute-setup/api.md) for authoritative persistence behavior.

The selected standard supplies its existing division names to `DivisionForm`. Onboarding and management share `useDivisionForm`: duplicate names show an inline error before confirmation, with case and surrounding spaces ignored and the edited record excluded. A server duplicate response closes confirmation, retains name and strength, and shows a specific toast and name-field error so the user can correct and resubmit. The parser supports both the dedicated division conflict code and the legacy shared code when `entityName` is `division`.

## School Identity configuration

The Module Permission dialog retains the compact View/Add/Delete layout for both users and roles. School Identity Delete is unavailable by design, so every choice in that group stays disabled. Add groups the server's existing configuration and signature capabilities; View remains separate. No Delete grant is generated or submitted. See the [backend product rules](../../../Shikshamitra-BE/docs/modules/institute-setup/product.md#school-identity) for supported asset changes and retention.

TL;DR: submit shared assets once, then change only the assets that differ for a board or its medium. [Backend product rules](../../../Shikshamitra-BE/docs/modules/institute-setup/product.md) own resolution and document retention.

1. Open School defaults and edit the logo, banner/letterhead and principal signature.
2. Choose inherited, custom or do not display independently for each asset. Custom signatures require the principal's name and designation together.
3. Upload PNG/JPEG files, review image proportions and resolution warnings, and preview the draft PDF.
4. Submit. Uploading alone does not change saved configuration; cancellation leaves the existing settings intact.
5. Open Board & medium overrides, choose the academic year and board, then All mediums or one medium.
6. Review each effective asset's source before editing. Reset to inherited requires confirmation and does not change issued documents.
7. In a new year, select the target context and Copy from another year. Review an explicitly selected source of the same override level before copying. Files are reused, not uploaded again.

Editing captures the original profile and stamp. Background refetches cannot silently update an open editor's version. A conflict preserves the draft and asks the administrator to reload and review the latest settings.

The override tab initially uses the application's selected academic year when it is available. Edit, reset and copy controls require both the action grant and the backend's canManage capability for the whole selected context. Restricted contexts remain readable and show a read-only explanation.

Template controls use the same upload/editor rules. Existing custom values have a Keep existing custom asset choice until deliberately replaced. Signature controls require signature access. On narrow screens, selectors and asset sections stack; every upload has a file-picker action.
