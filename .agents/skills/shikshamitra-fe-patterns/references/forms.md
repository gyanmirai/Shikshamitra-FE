---
title: Form UI Rulebook
status: draft
owner: frontend-team
scope: all-modules
---

# Form UI Rulebook

This document defines the standard for create, edit, configure, and update
forms shown in centered dialogs, drawers, or dedicated form surfaces. The
provided screenshots are reference examples, not a final visual target.

## 1. Form surface and placement

- Use a centered dialog for short, focused forms that can be completed without
  navigating away from the current task.
- Use a drawer or full-page form when the workflow is long, contains several
  grouped sections, or needs substantial supporting content.
- The form surface must have a clear title, a close action, a predictable body
  region, and a stable action footer.
- The title must describe the action and object, such as `Add subject`,
  `Update weekly lectures`, or `Add homework`.
- Avoid titles that only repeat a menu or page name, such as `Subject
  Creation`, when the user is actually adding a subject.
- Keep the form visually separated from the background with subtle elevation or
  surface contrast, not a harsh border.
- The form must remain usable at smaller viewport sizes, with a scrollable body
  and actions that remain reachable.

## 2. Form layout and grid

Forms must use a predictable grid so fields are easy to scan and complete.

- Group related fields under a concise section heading.
- Use a two-column grid for related fields when the available width supports
  it. Examples include Class and Division, or Category and Icon.
- Use a single full-width field for names, titles, descriptions, rich text,
  uploads, and other content that benefits from horizontal space.
- Do not force narrow or unrelated fields into the same row merely to reduce
  vertical height.
- Keep equal-width fields aligned within the same row unless one field has a
  clearly greater content requirement.
- Collapse the grid to one column on narrow screens.
- Keep labels aligned consistently above their controls; do not mix floating,
  inline, and placeholder-only labels without a clear reason.
- Keep section headings, helper text, fields, and validation messages in a
  consistent vertical rhythm.

## 3. Labels, naming, and helper text

- Every field must have a visible, meaningful label.
- Required fields must use one consistent required indicator, normally an
  asterisk, and the form should explain the indicator when needed.
- Use product language that describes what the user knows, not internal field
  names or API terminology.
- Use sentence case for labels and actions.
- Use singular nouns for a single value and plural nouns for collections.
- Helper text should explain format, consequence, or selection context. Do not
  repeat the label or add decorative copy.
- Use concise section descriptions when they help the user understand why the
  fields are grouped together.
- Avoid making placeholder text the only label; placeholders disappear when a
  user enters a value.

## 4. Validation and error messages

Validation must be specific, timely, and placed where the user can fix the
problem.

- Validate required fields with a clear message such as `Subject is required`
  or `At least one division is required`.
- Error messages must name the field or condition; avoid generic messages such
  as `Invalid input` when a more useful explanation is possible.
- Show field-level errors directly below or beside the affected control, using
  the same layout space consistently.
- Preserve the user's entered values when validation fails.
- Do not show errors before the user has had a reasonable opportunity to
  interact with the form, unless submission is attempted or the invalid state
  is returned from the server.
- When a server error cannot be tied to one field, show a clear form-level
  message near the form actions and explain what the user can do next.
- Error styling must use the system error color and must not rely on color
  alone; include text and an accessible association with the field.
- Do not show contradictory success and error states at the same time.

## 5. Loading and interaction lock

Saving, loading dependent options, and other blocking form operations must
prevent accidental interaction without making the interface feel broken.

- During a blocking operation, disable every control that could change or
  resubmit the form, including close, cancel, navigation, selectors, editors,
  uploads, and footer buttons.
- Display a semi-transparent system overlay over the form content so the user
  can see the current form while understanding that it is temporarily locked.
- The overlay must intercept pointer and keyboard interaction; visual dimming
  alone is not sufficient.
- Show a clear progress indicator, such as a spinner or progress state, with a
  concise status label when the operation may take noticeable time.
- Keep the form title and overall geometry stable while loading; do not replace
  the entire form with an unrelated blank loader.
- The primary action must show its loading state and must not be clickable a
  second time.
- If the operation fails, remove the lock, restore the form values, and show a
  useful error message with a safe retry path.
- If only one field is loading dependent data, lock only the affected control
  group unless the entire form must wait.

## 6. Spacing and visual hierarchy

- Use the established spacing scale consistently between sections, fields,
  labels, helper text, and actions.
- Give section groups enough breathing room to make the form scannable without
  creating large empty gaps.
- Keep the action footer visually distinct with spacing and a subtle divider or
  surface change, not a heavy border.
- Align footer actions consistently: the secondary action first and the primary
  action last in left-to-right layouts.
- Keep the primary action visually prominent without making the entire footer
  high contrast.
- Use one consistent control height within the same form unless a text editor,
  upload area, or special control needs a different size.
- Avoid nesting too many bordered containers. Grouping should come from
  spacing, headings, and restrained surface changes.

## 7. Borders, contrast, and color

- Use only the application's approved theme and semantic colors.
- Do not introduce feature-specific colors for ordinary fields, headings,
  borders, or buttons.
- Keep input borders subtle in the resting state and use the system focus,
  error, disabled, and success treatments consistently.
- Avoid bright or thick borders that compete with the content.
- Use stronger contrast only for focus, validation errors, important status
  messages, or the selected state.
- Success, warning, error, and informational surfaces must remain readable and
  must not depend on color alone.
- Color-selection controls may show the available product palette, but the
  surrounding form must still follow the system color rules.

## 8. Form actions and submission

- Use one clear primary submit action for the main form outcome.
- Use action labels that describe the outcome: `Add`, `Update`, `Save draft`,
  or `Publish now`.
- Use `Cancel` for abandoning the current form without saving, and confirm only
  when unsaved work could reasonably be lost.
- Do not present multiple competing primary buttons unless the workflow truly
  has distinct outcomes, such as `Save draft` and `Publish now`.
- Keep actions in a stable footer so they do not move unexpectedly as fields
  validate or dependent content loads.
- Prevent duplicate submission and clearly communicate the result after a
  successful save.

## 9. Recommended UX improvements

- Show a short description only when it helps the user understand the task or
  a consequence of the selected value.
- Use progressive disclosure for advanced or optional settings instead of
  presenting every field at once.
- Provide sensible defaults only when they are safe and easy to change.
- Preserve entered data when a dependent selector refreshes or a submission
  fails.
- For long forms, provide a clear section structure and keep the current
  section visible while scrolling.
- Use a confirmation only for meaningful risk; do not add confirmation steps
  to ordinary reversible edits.
- Keep keyboard navigation, focus movement, and screen-reader announcements
  predictable for dialogs, validation errors, and loading states.

## 10. Form consistency checklist

Before approving a form, verify:

- The title uses a verb-first action and a clear object name.
- The form surface is appropriate for the workflow length and complexity.
- Fields use a consistent responsive grid and spacing rhythm.
- Every field has a visible label and correct required indicator.
- Validation messages are specific, correctly placed, and actionable.
- Submit, cancel, close, and navigation controls are locked during blocking
  loading.
- A semi-transparent interaction-blocking loader communicates progress without
  hiding the form completely.
- Loading, error, success, and disabled treatments use system colors only.
- Borders are restrained and do not create unnecessary visual noise.
- The action footer is stable, clear, and consistent with other forms.
- The form works with keyboard and at supported narrow viewport sizes.

## 11. Confirmation dialogs and form-related decisions

Confirmation dialogs are part of the form experience when a user is about to
leave with unsaved work or perform a consequential action such as archive or
delete.

- Use a confirmation dialog only when the action can cause data loss, change
  lifecycle state, or cannot be easily reversed.
- Do not show confirmation for ordinary navigation, harmless focus changes, or
  reversible edits that have already been saved.
- The dialog title must clearly state the decision, such as `Discard unsaved
  changes?`, `Archive subject?`, or `Delete exam?`.
- The message must identify what will happen and, when relevant, whether the
  action can be undone.
- Use a clear primary action that states the outcome: `Discard changes`,
  `Archive`, or `Delete`.
- Use `Cancel` as the safe secondary action and keep it easy to find.
- Never use vague actions such as `Yes`, `Okay`, or `Continue` when the user is
  confirming a consequential action.
- Destructive actions must use the system error/danger color. Archive or other
  reversible lifecycle actions should use the system warning treatment when
  appropriate, not the destructive treatment by default.
- The dialog must not introduce custom colors, heavy borders, or decorative
  styling that is not part of the application system.
- For high-risk deletion, require the appropriate additional confirmation,
  such as typing the record name, only when the risk justifies the extra step.

## 12. Confirmation loading and interaction lock

Once a confirmation action starts, the user must not be able to trigger a
second action or change the decision while the request is running.

- Disable every dialog action while the request is in progress, including
  Confirm, Cancel, Close, and any secondary controls.
- Show a loading indicator inside the primary action and retain its outcome
  label, such as `Deleting...` or `Archiving...`.
- Prevent the dialog from closing through the close icon, Escape key, backdrop
  click, or navigation while the operation is in progress.
- Prevent duplicate submissions and repeated API requests.
- Keep the dialog position and message stable while loading; do not replace it
  with a blank spinner or cause the surrounding page to jump.
- If the action affects the underlying form, keep the form locked until the
  operation has completed successfully or failed.
- On success, close the dialog only after the operation is confirmed and show a
  clear success result in the parent page.
- On failure, keep the dialog open when retry is safe, restore the actions, and
  show a specific error with a clear next step.
- Restore focus to a sensible control after the dialog closes or fails.

## 13. Confirmation dialog consistency checklist

Before approving a form-related confirmation dialog, verify:

- The title and message clearly describe the action and affected record.
- The primary button uses the real outcome rather than a vague confirmation.
- Cancel is visible and remains the safe default action.
- Error/danger, warning, success, and neutral colors match system semantics.
- No extra colors, decorative borders, or unnecessary content are introduced.
- Loading disables all actions and prevents close, Escape, backdrop, and
  duplicate interaction until completion.
- Success and failure states provide clear feedback without losing form data.
- Keyboard focus and screen-reader behavior remain predictable.
