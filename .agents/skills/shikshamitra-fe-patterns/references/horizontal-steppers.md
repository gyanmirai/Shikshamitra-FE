---
title: Horizontal Stepper UI Rulebook
status: draft
owner: frontend-team
scope: horizontal-guided-workflows
---

# Horizontal Stepper UI Rulebook

This document defines the horizontal version of the shared stepper pattern.
The general workflow, save, resume, validation, confirmation, and state rules
remain in [steppers.md](steppers.md). This document adds the layout rules for
steps displayed across the top of a workspace.

The provided screenshot shows a vertical step navigator on the left with an
optional context panel on the right. It is useful as a reference for the
workspace behavior, but this document applies when the step indicators run
horizontally across the top.

## 1. Horizontal stepper anatomy

A horizontal guided workflow should contain:

1. Page header and breadcrumb context.
2. Horizontal stepper navigation.
3. Optional context chips or concise workflow summary.
4. Active-step content area.
5. Optional right context sidebar.
6. Stable bottom navigation and save actions.

- Keep the horizontal stepper below the page header and before the active-step
  content.
- The stepper must remain visually connected to the content it controls.
- Do not repeat the page title inside the stepper.
- Keep the active workspace focused on the current step rather than displaying
  every step's content at once.

## 2. Step indicators and connector line

- Distribute step indicators evenly across the available horizontal width.
- Connect all step indicators with one continuous line.
- Keep the line aligned through the center of each indicator.
- Use the system accent for the active step and completed connector segments.
- Keep upcoming steps neutral and clearly distinguishable from completed steps.
- Completed steps must show a stable completion indicator and remain clickable
  when navigation rules allow it.
- Step labels must sit in a consistent relationship to their indicators and
  must not jump when the active state changes.
- Keep labels short enough to fit at the supported desktop width.
- If a step requires a longer explanation, place that explanation in the
  active-step content instead of expanding the stepper label.

## 3. Horizontal layout and workspace grid

- The active content area should use the available width without creating large
  unexplained empty regions.
- Use a primary content column for the step's work and an optional secondary
  context column when the summary helps the user complete the step.
- Keep the primary content wider than the context column.
- Use a responsive grid for forms, tables, room layouts, previews, and other
  step content; follow the relevant form, table, sidebar, or detail-view
  rulebook for the component inside the step.
- Do not let a right sidebar compress the main step content until controls,
  labels, or tables become difficult to use.
- If the context sidebar is closed, allow the main content to use the released
  width without leaving an empty reserved column.
- Keep important content above the fold when possible, but allow the active
  step body to scroll when the workflow is long.

## 4. Optional right context sidebar

- Show a right sidebar when the user needs persistent context such as exam
  progress, selected plan details, capacity, counts, or readiness status.
- Keep the sidebar read-only unless the step explicitly requires editing there.
- Use a compact grid of labels and values rather than a long paragraph.
- Use the sidebar rules in [sidebars.md](sidebars.md) for width, spacing,
  scrolling, close behavior, loading, and responsive handling.
- Allow the user to close the sidebar when it is supplemental rather than
  required for the current decision.
- Provide a clear reopen control when the sidebar is closed.
- Do not allow the sidebar to cover the active step content or obscure the
  bottom navigation.
- If the sidebar contains required information for a safe decision, keep it
  available or provide the same information in the active content before
  allowing it to close.
- On narrow screens, convert the sidebar into a collapsible section or a
  separate drawer rather than forcing a two-column layout.

## 5. Step content and progress context

- The active step must have a clear heading and a concise explanation of the
  task.
- Show progress information only when it helps the user understand readiness,
  capacity, completion, or remaining work.
- Use precise statements such as `40 usable seats selected · 39 spare` or
  `0 of 1 students assigned` rather than vague progress language.
- Keep success, warning, and error messages close to the content they describe.
- Use a warning when the user can continue but attention is required; use an
  error when the user cannot continue until the issue is fixed.
- Do not repeat the same count in the stepper, context sidebar, section title,
  alert, and footer without a clear difference in scope.
- Keep helper text concise and remove instructions that do not change the
  user's next action.

## 6. Navigation, saving, and resume

- Use stable bottom navigation with `Back`, `Save`, `Save & next`, or the final
  outcome action as appropriate.
- Keep the primary forward action on the right in left-to-right layouts.
- Save must preserve the current step and keep the user in place.
- Save & next must save valid current data before moving forward.
- Reopening the workflow must restore saved step data and the last meaningful
  step, as defined in [steppers.md](steppers.md).
- Do not clear or recreate the active step when the right sidebar is opened or
  closed.
- If the active step is invalid, keep the user on the step and place the error
  beside the content that requires correction.
- Keep bottom navigation visible or reachable while the active step body
  scrolls.

## 7. Responsive behavior

- At wide desktop widths, use the horizontal stepper with evenly distributed
  indicators and labels.
- At medium widths, shorten labels only when the meaning remains clear and the
  full accessible name remains available.
- At narrow widths, use a compact progress header or switch to the shared
  vertical stepper pattern rather than allowing labels to overlap.
- Stack the main content and context sidebar on smaller screens.
- Preserve the order: step progress, active content, optional context, actions.
- Do not make the user horizontally scroll the entire workflow to reach a step
  indicator or primary action.

## 8. Loading and interaction lock

- During a blocking save or transition, disable step navigation, Back, Save,
  Save & next, sidebar close, and other conflicting actions.
- Keep the horizontal stepper visible while loading so the user understands
  where the operation is occurring.
- Use a localized or semi-transparent loading treatment that preserves the
  active content geometry.
- Prevent duplicate save and transition requests.
- If only the sidebar is loading, keep unrelated active-step controls usable
  when it is safe to do so.
- On failure, preserve entered data, restore interaction, and provide a clear
  retry path.
- On success, update the step indicator and saved-progress state before moving
  to the next step.

## 9. Color, spacing, and visual restraint

- Use the same spacing scale, typography, surfaces, borders, and semantic colors
  as the shared form, table, sidebar, and stepper rules.
- Use green only for completed or genuinely successful steps and states.
- Avoid green borders around every active section or completed content block.
- Keep the connector line and indicators visually clear without making the
  entire top area high contrast.
- Use neutral surfaces for the workspace and context sidebar.
- Remove decorative icons, repeated badges, and colors that do not communicate
  a state or improve scanning.
- Keep padding consistent around the stepper, active content, sidebar, and
  footer.

## 10. Horizontal stepper consistency checklist

Before approving a horizontal stepper, verify:

- The step indicators run horizontally, connect continuously, and align with
  their labels.
- Active, completed, upcoming, warning, and error states are distinguishable.
- Completed steps remain visible and clickable when allowed.
- The active content uses the available workspace width effectively.
- The optional right sidebar is useful, compact, and closable when safe.
- Closing the sidebar releases its space and does not disturb step data.
- Long content scrolls within the correct workspace or sidebar body.
- Save, Save & next, Back, and final actions preserve progress correctly.
- Loading locks the appropriate controls and prevents duplicate actions.
- Colors, spacing, icons, borders, and warnings follow the shared rulebooks.
- The layout switches safely at narrow widths without horizontal overflow.
