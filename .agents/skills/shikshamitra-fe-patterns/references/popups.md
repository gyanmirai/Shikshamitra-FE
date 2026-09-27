---
title: Popup UI Rulebook
status: draft
owner: frontend-team
scope: dialogs-confirmations-and-feedback
---

# Popup UI Rulebook

This document defines short popup experiences such as confirmations, warnings,
reason requests, archive/delete decisions, save warnings, and focused feedback.
It is separate from [forms.md](forms.md), which defines data-entry forms, and
from [detail-views.md](detail-views.md), which defines read-only record views.

## 1. When to use a popup

- Use a popup when the user must make one focused decision or provide a small
  amount of information before continuing.
- Use a confirmation popup for actions that may lose data, change lifecycle
  state, or have a meaningful consequence.
- Use a reason popup when the reason is required for audit, compliance, or a
  meaningful business record.
- Use a form, drawer, or page instead when the user must enter several fields,
  review substantial information, or complete a multi-step workflow.
- Do not use a popup for information that can be shown inline without
  interrupting the user's task.
- Do not nest one popup inside another.

## 2. Popup structure

A standard popup should contain only the parts needed for the decision:

1. Clear title.
2. Concise context or consequence message.
3. Required input, only when needed.
4. Optional helper text or warning.
5. Secondary and primary actions.

- Keep the title, content, and actions aligned to one clear visual column.
- Use consistent internal padding and vertical spacing.
- Keep the popup compact; do not add cards, repeated headings, or decorative
  sections inside a short decision dialog.
- Keep the footer visually separate with spacing or a subtle divider, not a
  heavy border.
- Keep the popup wide enough for readable copy but never wider than needed for
  the decision.

## 3. Popup titles and message writing

Popup copy must tell the user what is happening, what will change, and what
action is available.

- Use a short title that names the action and object:
  `Delete subject?`, `Archive exam?`, `Discard unsaved changes?`, or
  `Unlock published marks`.
- Use a message that explains the consequence in plain language.
- Avoid repeating the title in the message.
- Avoid vague copy such as `Are you sure?`, `Please confirm`, or `Something will
  happen` without explaining the result.
- Avoid unnecessary words such as `kindly`, `perform the action`, or `as per
  your request`.
- Use sentence case and direct language.
- Name the affected record when it reduces ambiguity, such as `Delete
  “Mathematics” from the curriculum?`.
- If the action is reversible, say so. If it is not reversible, say so clearly.
- Use one message for one decision; do not combine unrelated warnings.

### Improved example: unlock published marks

Avoid:

`Are you sure you want to unlock published marks? Provide an unlock reason for audit:`

Use:

**Title:** `Unlock published marks`

**Message:** `This will reopen the selected published marks for editing. Enter a
reason for the audit log.`

**Field label:** `Unlock reason`

**Helper text:** `This reason will be recorded in the marks audit log.`

**Primary action:** `Confirm unlock`

This version separates the decision, consequence, required input, and audit
purpose instead of combining them into one long sentence.

## 4. Popup types and action language

| Popup type | Purpose | Primary action |
| --- | --- | --- |
| Save warning | Prevent loss of unsaved work | `Save changes` or `Discard changes` |
| Archive confirmation | Change a record to an archived state | `Archive` |
| Delete confirmation | Permanently remove a record | `Delete` |
| Publish confirmation | Make content visible or final | `Publish` |
| Reason request | Record why a sensitive action is happening | `Confirm unlock`, `Submit reason` |
| Success feedback | Confirm a completed action | Usually no action or `View record` |
| Error feedback | Explain a failed action and recovery | `Retry` |

- The primary button must describe the actual outcome.
- Use `Cancel` or `Keep editing` for the safe secondary action.
- Confirmation popups must stay open when the user clicks the backdrop. Close
  them only through an explicit action such as `Cancel` or the decision button,
  unless the workflow explicitly requires backdrop dismissal.
- Never use `Yes`, `No`, `Okay`, or `Continue` as the only action labels for a
  consequential decision.
- Use `Close` for dismissing information or feedback when no decision is
  required.
- Do not present two visually equal primary actions unless the user genuinely
  has two distinct outcomes, such as `Save changes` and `Discard changes`.

## 5. Warning and destructive semantics

- Use the system warning treatment for caution, restrictions, and actions that
  need attention but are reversible.
- Use the system danger treatment for Delete, Discard, irreversible reset, and
  other destructive outcomes.
- Use neutral styling for ordinary Save, Close, View, and non-consequential
  actions.
- Do not color the whole popup yellow or red. Emphasize only the warning,
  destructive action, or affected state.
- Do not use green for the primary button unless the system already defines
  green as the semantic action for that exact success-oriented operation.
- Do not add extra colored icons, borders, badges, or backgrounds merely to make
  the popup feel important.
- The copy must explain the risk; color alone must never communicate it.

## 6. Reason-request popups

- Ask for a reason only when the reason is required for audit, compliance,
  traceability, or a meaningful business decision.
- Put the reason request after the consequence message and before the actions.
- Use a visible label such as `Unlock reason`, `Rejection reason`, or `Archive
  reason`.
- Do not use placeholder text as the only label.
- Explain where the reason will be recorded and who may see it.
- Set an appropriate minimum length when a meaningful explanation is required,
  but do not force unnecessary long text.
- Preserve the entered reason if validation or submission fails.
- Show a specific error such as `Unlock reason is required` below the field.
- Do not ask for a reason for ordinary, low-risk actions.

## 7. Loading and interaction lock

Once a popup action starts, no competing action may be triggered until it
finishes.

- Disable the primary action, Cancel, Close, Escape, backdrop dismissal, and
  all popup inputs during a blocking request.
- Show progress inside the primary action while retaining the outcome label,
  such as `Deleting...`, `Archiving...`, or `Confirming unlock...`.
- Prevent duplicate submissions and repeated requests.
- Keep the popup size, title, message, and entered values stable while loading.
- Do not replace the popup with a blank spinner or make the underlying page
  interactive during the request.
- On success, close the popup only after the operation is confirmed and show a
  clear result in the parent page.
- On failure, keep the popup open when retry is safe, restore interaction, and
  show a specific error with a clear retry path.
- Restore focus to the originating control after the popup closes or fails.

## 8. Placement, overlay, and alignment

- Center confirmation and reason popups in the viewport unless the workflow
  specifically requires a drawer.
- Use a restrained backdrop that separates the popup from the page without
  making the entire page visually disappear.
- Keep the popup title and close control aligned consistently across modules.
- Align labels, fields, helper text, and errors to the same content edge.
- Keep actions in a stable footer, with the safe secondary action before the
  outcome action in left-to-right layouts.
- Do not place important instructions in the footer or hidden behind the close
  control.
- On small screens, use the available width safely, preserve internal padding,
  and allow the content body to scroll without hiding the actions.

## 9. Accessibility and keyboard behavior

- Move focus into the popup when it opens.
- Keep focus within the popup while it is active.
- Return focus to the triggering control when it closes.
- Give the popup an accessible name and associate the message with it.
- Associate field errors and helper text with the correct input.
- Make every action keyboard reachable and provide visible focus.
- Do not allow Escape or backdrop click to dismiss a blocking operation.
- Do not use color, icons, or position as the only way to communicate meaning.

## 10. Popup consistency checklist

Before approving a popup, verify:

- A popup is necessary for the decision and is not replacing a larger form.
- The title names the action or decision clearly.
- The message explains the actual consequence without redundant wording.
- The primary action uses the real outcome name.
- Cancel or the safe alternative is visible and easy to understand.
- Warning, danger, neutral, and success colors match system semantics.
- No unnecessary colors, icons, borders, cards, or repeated information are
  present.
- Reason fields have clear labels, helper text, and specific validation.
- Loading disables every competing interaction and prevents duplicate actions.
- Success and failure behavior preserves context and gives the user a clear
  next step.
- Focus, keyboard, responsive, and screen-reader behavior are predictable.
