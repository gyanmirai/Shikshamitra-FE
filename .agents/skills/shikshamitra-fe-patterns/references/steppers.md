---
title: Stepper UI Rulebook
status: draft
owner: frontend-team
scope: all-modules
---

# Stepper UI Rulebook

This document defines the standard for multi-step workflows such as exam
setup, timetable creation, onboarding, configuration, and publishing flows.
The attached screens are reference examples for the intended structure. They
are not treated as a perfect final visual implementation.

## 1. When to use a stepper

- Use a stepper when a workflow has multiple meaningful stages with a clear
  order, such as setup, scheduling, allocation, and review.
- Each step must represent a real user decision, data group, or validation
  boundary.
- Do not create a step for a single field, a loading screen, or an internal
  technical operation.
- Keep the number of steps as small as the workflow allows. Combine closely
  related fields instead of creating unnecessary navigation stops.
- Step names must describe the user's task, such as `Basic details`,
  `Schedule`, `Room details`, and `Review`.

## 2. Stepper structure and layout

- Place the stepper below the page header and breadcrumb, before the active
  step's content.
- Use one consistent horizontal stepper on wide screens.
- Connect step indicators with a continuous line so the workflow reads as one
  progression rather than unrelated circles.
- Align every step indicator and label to the same horizontal system.
- Keep equal spacing between steps; do not compress one step because its label
  is shorter or longer.
- On narrow screens, use a compact alternative such as a current-step label,
  progress count, or vertically stacked stepper. Do not create horizontal
  document overflow.
- The active step content must begin close enough to the stepper to preserve
  the relationship, while still receiving enough spacing to breathe.
- Keep the stepper position and geometry stable as the active content changes.

## 3. Step states

Every step must have an understandable visual state:

| State | Meaning | Required treatment |
| --- | --- | --- |
| Not started | The user has not entered or completed the step | Muted indicator and label |
| Active | The step currently being edited | System primary/accent emphasis and clear label |
| Completed | Required work for the step is valid and saved | Green completion indicator, usually a check mark |
| Has warnings | The step can be revisited but needs attention | System warning treatment and readable explanation |
| Has errors | Required information is missing or invalid | System error treatment and actionable message |
| Saving | A save operation is in progress | Progress indicator and interaction lock where required |

- Completed steps must remain visibly completed when the user moves forward.
- A completed check mark must not disappear merely because another step becomes
  active.
- A step must not appear completed if its required data has not been saved or
  validated.
- The active step and completed steps must be distinguishable without relying
  only on color.
- Use the system green only for genuine completion or success; do not outline
  every completed section with bright green borders.

## 4. Navigation and clickable steps

- Completed steps must be clickable so users can review or edit earlier work.
- The current step may be selected again without losing entered data.
- Future steps should remain disabled until the workflow rules allow access,
  unless the product explicitly supports free navigation.
- If a future step is accessible, show its state clearly as not started rather
  than implying that it is complete.
- Clicking a completed step must take the user to that step without resetting
  later saved progress.
- Back and next controls must use consistent placement and clear labels.
- `Back` returns to the previous step without discarding valid data.
- `Save` saves the current progress and keeps the user on the current step.
- `Save & next` saves the current step and moves to the next available step.
- The final action must describe the outcome, such as `Finish setup`, `Publish`,
  or `Create exam`, rather than using a generic `Submit` when the result is
  known.

## 5. Save progress and resume behavior

Saving progress is a core part of every multi-step workflow.

- Every step must support saving independently when it has enough information
  to create a valid draft.
- Saving step 1 and leaving the workflow must preserve all saved values.
- Saving step 2 and leaving the workflow must preserve step 1 and step 2,
  including selections, chips, dates, times, and entered text.
- Reopening an unfinished workflow must return the user to the last meaningful
  saved step or provide a clear `Continue setup` action.
- Previously saved data must be rendered exactly as saved, not silently reset
  to defaults.
- A save operation must provide a visible success confirmation and a saved
  state in the stepper.
- Saving must be idempotent: clicking Save again without changes must not
  create duplicate records or alter valid values.
- If saving fails, preserve the user's input, unlock the form, and show a clear
  retry path.
- Unsaved changes must be distinguishable from saved progress.
- If the user attempts to leave with unsaved changes, warn only when data could
  be lost; do not interrupt every ordinary navigation.

## 6. Step content and information hierarchy

- Each step must have a clear heading that matches the stepper label.
- Add one concise description when the user needs context to complete the
  step. Do not repeat instructions that are already obvious from field labels.
- Group related information into sections with restrained surfaces and clear
  headings.
- Put the most important decision or required fields first.
- Use the same form grid, label, error, spacing, border, and color rules as
  [forms.md](forms.md).
- Use the same table rules as [tables.md](tables.md) when a step contains a
  table or repeated records.
- Keep optional configuration visually secondary to required setup.
- Do not fill unused space with decorative panels, duplicate summaries, or
  unnecessary explanatory copy.

## 7. Chips, tags, and compact information

Chips and tags should help users understand selected context at a glance.

- Use chips for selected entities, such as a class, division, subject, or
  selected count.
- Use one consistent chip style for the same type of entity throughout the
  workflow.
- Keep chip text short and meaningful. Prefer `Class 12`, `Div A`, or
  `Mathematics` over sentences inside chips.
- Use a count chip when it communicates quantity, such as `1 subject` or
  `3 divisions`.
- Use status chips only for status; do not use them as decorative labels.
- Do not repeat the same information in a heading, chip, helper text, and
  alert unless each instance serves a different purpose.
- Chips must remain readable when several are displayed together and must wrap
  or scroll safely on narrow screens.

## 8. Informational messages and progress summaries

- Show a compact information message when it helps the user make a decision,
  such as available teaching slots versus assigned lectures.
- The message must state the condition and its meaning, for example: `All
  weekly lectures are balanced with available teaching slots.`
- Keep informational messages close to the fields or records they describe.
- Use success styling only when the condition is genuinely successful or
  complete.
- Use warning styling when the user can continue but should review something.
- Use error styling when the workflow cannot proceed until a problem is fixed.
- Do not turn every normal status into a colored alert.
- Avoid large full-width green banners when a compact inline message is enough.

## 9. Spacing, padding, and density

- Use the shared application spacing scale for the stepper, cards, forms,
  tables, and action footer.
- Give the stepper enough vertical padding to distinguish it from the page
  header and active content.
- Keep consistent spacing between the stepper, context chips, information
  messages, content sections, and footer actions.
- Use larger spacing between unrelated groups and smaller spacing between a
  label and its control.
- Keep content density purposeful: dense repeated data may use compact rows,
  while decisions and warnings need more breathing room.
- Do not add padding solely to make an empty page appear fuller.
- The Back and primary next/save controls must remain visible and easy to reach.

## 10. Color and visual emphasis

- Use only the application's approved theme and semantic colors.
- Use the system accent for the active step and interactive focus.
- Use the system green for completed steps and confirmed success only.
- Use neutral surfaces and muted text for not-started steps and supporting
  information.
- Avoid extra green borders around every completed card, section, or step.
- Avoid introducing colors that do not already have a product meaning.
- Border contrast should remain restrained; stronger contrast is reserved for
  focus, error, warning, selected, and completed states.
- Never use color as the only indication of a step state.

## 11. Loading and blocked interaction

- During a step save, disable Save, Save & next, Back, step navigation, and any
  controls involved in the blocking operation.
- Show progress without replacing the entire page or losing the user's place.
- If a step is loading dependent data, show the step content structure and a
  localized loader near the affected area.
- If the whole workflow is locked, use the same semi-transparent interaction-
  blocking overlay defined in [forms.md](forms.md).
- Restore the saved or entered values after a failed request and provide a
  clear retry action.

## 12. Review step

- The review step must summarize the saved data in clear, grouped sections.
- Show the step name or an Edit action for every summary group so users can
  navigate directly to corrections.
- Use compact values and chips instead of repeating the entire input form.
- Clearly distinguish missing, invalid, optional, and confirmed information.
- Show a concise final readiness message only when all required validation has
  passed.
- The final action must state the real outcome and require confirmation only
  when the result is consequential or irreversible.
- Completing the workflow must preserve a visible completed state for every
  finished step and provide a clear success result.

## 13. Accessibility and keyboard behavior

- Step indicators must be keyboard reachable when they are clickable.
- The active step must be announced to assistive technology.
- Use text labels and state announcements in addition to color and icons.
- Focus must move predictably after changing steps, validation, save success,
  and save failure.
- Do not trap keyboard focus in a stepper unless it is inside a modal dialog.
- Error messages must be associated with the fields that need correction.
- The stepper must remain understandable at zoomed and narrow viewport sizes.

## 14. Stepper consistency checklist

Before approving a stepper workflow, verify:

- Each step represents a meaningful user task.
- Step labels use clear, consistent naming conventions.
- The stepper line connects all indicators and aligns with their labels.
- Active, completed, warning, error, and not-started states are distinct.
- Completed steps stay green and remain clickable.
- Users can save progress on each valid step.
- Reopening the workflow restores saved values and the last meaningful step.
- Back, Save, Save & next, and final actions have clear behavior.
- Chips and info messages contain only useful, non-duplicated content.
- Spacing and padding follow the shared form and table standards.
- Extra colors and unnecessary green borders are not used.
- Loading prevents conflicting interaction and communicates progress.
- Review content is concise, grouped, editable, and ready for final action.
- The workflow works with keyboard, narrow screens, and assistive technology.

## 15. Stepper confirmations and consequential actions

Steppers must use the confirmation-dialog rules from [forms.md](forms.md) when
navigation or a final action could lose progress or change important data.

- Confirm before leaving a stepper only when there are unsaved changes that
  would be lost.
- Use a clear title such as `Discard unsaved changes?` and explain which
  progress will be removed.
- Provide an explicit safe action such as `Keep editing` and an outcome action
  such as `Discard changes`.
- Confirm reset, clear-all, archive, delete, cancel-workflow, and other
  irreversible or high-impact actions before performing them.
- The final action must describe its real result, such as `Publish exam`,
  `Finish setup`, or `Create schedule`.
- Do not use vague confirmation labels such as `Yes`, `Okay`, or `Continue`.
- Use the system warning color for reversible reset or archive actions and the
  system danger color for destructive delete or discard actions.
- Do not add extra colors, heavy borders, or decorative confirmation content.

### Confirmation loading

- Once a confirmation action begins, lock the stepper, step navigation, Back,
  Save, Save & next, Close, Escape, and backdrop dismissal until it completes.
- Show the outcome in the loading button, such as `Publishing...` or
  `Discarding...`, and prevent duplicate requests.
- Keep the current step, entered values, and confirmation message stable while
  loading.
- On failure, restore interaction, preserve all saved and unsaved values, and
  provide a specific retry path.
- On success, show the completed state and a clear result before navigating away
  or closing the workflow.
