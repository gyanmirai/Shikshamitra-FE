---
title: Detail View UI Rulebook
status: draft
owner: frontend-team
scope: all-modules
---

# Detail View UI Rulebook

This document defines the standard for centered read-only detail views opened
from a table's View action. These views may appear as dialogs, drawers, or
focused detail surfaces depending on the amount of information. The attached
screenshots are reference examples, not a perfect final implementation.

Use [the Policy-view consistency guide](../../shikshamitra-ui-consistency/references/detail-pages.md)
for required record-header and section info controls, matching form/view section styling,
and the actual component help props in dialogs, drawers and pages.

## 1. Purpose and surface choice

- A detail view is for understanding a record, its current state, and its
  dependencies without entering edit mode.
- Use a centered dialog for a compact record with a small number of related
  facts.
- Use a wider dialog or drawer when the record contains metrics, dependencies,
  usage lists, restrictions, or multiple grouped sections.
- Use a dedicated page when the record needs deep navigation, long history, or
  a full workflow of its own.
- The View action must open the same detail pattern for equivalent records
  throughout the product.
- Do not turn a read-only view into an unstructured copy of the database
  record. Show information in the order users need to understand it.

## 2. Detail header

The header must identify the record immediately and establish its context.

- Show the record's primary name as the heading.
- Show the record type or category as concise supporting text when useful.
- Show the current lifecycle status beside the name using the system status
  treatment.
- Include one record-header information control, following the Policy-view reference,
  with concise view-purpose/scope help. Every standard detail section also includes
  adjacent info help; these controls are required even when the underlying API props are optional.
- The information icon must have a meaningful accessible label and open a
  concise explanation.
- Use the record's configured icon or color only when it is part of the
  product's data model; do not add decorative icons to every field.
- Keep the close action in one consistent location and give it an accessible
  name that includes the record context where appropriate.
- Do not repeat the same name, status, category, and description in several
  header elements.

## 3. Information hierarchy

Organize the view into a small number of meaningful sections:

1. Identity and current status.
2. Key metrics or dependencies.
3. Related classes, groups, users, or records.
4. Restrictions, warnings, or operational impact.
5. Useful related actions.

- Show the most decision-relevant information first.
- Use section headings that describe the content, such as `Dependencies & usage`,
  `Allocated classes`, or `Impact & system restrictions`.
- Include a section only when it contains useful data.
- Do not show empty sections, zero-value metric rows, or headings with no
  supporting content unless the absence itself is meaningful.
- Use concise labels and values rather than long explanatory paragraphs.
- Keep read-only values visually distinct from editable controls; a detail view
  should not look like an unfinished form.

## 4. Metrics and dependency data

- Metrics must represent real, current values from the selected record.
- Every metric needs a precise label and a clear unit or meaning.
- Group related metrics in a balanced grid that remains readable at smaller
  widths.
- Use zero values only when the metric is relevant to the record and the zero
  helps the user understand its state.
- Do not show internal IDs, technical counters, or tracking metrics that do not
  support a user decision.
- Use the same metric label, ordering, and semantic color for equivalent data
  across modules.
- If a metric links to related records, make the interaction clear and keep the
  destination consistent with the table or module pattern.
- Do not display a metric count in the header and repeat the same count in a
  section title unless the two scopes are different and clearly explained.

## 5. Chips, tags, and related records

- Use chips for short, selected values such as classes, divisions, elective
  groups, categories, or status labels.
- Chip text must be concise and meaningful; do not place sentences inside a
  chip.
- Use one consistent chip treatment for the same entity type across the app.
- Show a count in the section heading when it helps, such as `Allocated classes
  (4)`.
- Do not show both a long count sentence and a count chip for the same data.
- If there are many related records, show the most useful subset and provide a
  clear `View all` or linked destination rather than creating an overcrowded
  panel.
- Chips must wrap safely and remain readable on narrow screens.

## 6. Restrictions, warnings, and system impact

Warnings must explain a real consequence and guide the user toward a safe
action.

- Use a warning or restriction section only when the record's state affects
  another workflow or limits an available action.
- State the condition plainly, such as `This subject is used in 4 classes.`
- Explain the consequence, such as why deletion is restricted.
- Give a safe recommendation when one exists, such as `Archive instead of
  delete`.
- Use the system warning color for caution and the system danger color only for
  destructive or critical conditions.
- Do not surround the entire detail view with bright warning or green borders.
- Do not display generic alerts such as `This may impact the system` without
  naming the actual impact.
- If there is no restriction or warning, omit the warning section entirely.

## 7. Actions

- Keep the detail view primarily read-only and place actions in a stable footer.
- Use one clear primary action only when there is a meaningful next step.
- Use labels that describe the outcome, such as `Edit subject`, `Archive
  subject`, or `View class allocations`.
- Related dependency actions should navigate to the relevant filtered view and
  retain the record context where possible.
- Keep Close as the safe secondary action and place it consistently.
- Destructive actions must follow the confirmation rules in [forms.md](forms.md).
- Hide actions that are not available in the current state rather than showing
  unexplained disabled buttons, unless the disabled reason is important to
  discoverability.
- Do not add a separate icon button for every section when one clear action can
  serve the whole record.
- Do not color an `Archive` action yellow only because the record has a warning
  or restriction. Archive is a lifecycle action; use the neutral secondary
  action style by default and use warning emphasis only when the action itself
  requires attention or confirmation.
- Use the danger style for Delete, Discard, or other destructive actions only.

## 8. Spacing, borders, and visual restraint

- Use the shared spacing scale from the form and table standards.
- Give the header, sections, metrics, and footer enough separation to be
  scannable without creating excessive empty space.
- Use restrained surface changes to group content; avoid stacking many cards
  inside a modal.
- Use subtle borders and dividers only where they clarify grouping.
- Avoid thick outlines, high-contrast frames, unnecessary rounded containers,
  and decorative shapes.
- Keep icon size and placement consistent. An icon must communicate meaning or
  support scanning; otherwise remove it.
- Keep the footer visually distinct without making it heavier than the content.
- The detail view should feel calm and focused, not like a dashboard squeezed
  into a popup.

## 9. Color and status semantics

- Use only the approved system palette and semantic colors.
- Neutral surfaces and text should carry most of the interface.
- Use success for active/ready/confirmed states only when that meaning is real.
- Use warning for restrictions or attention required.
- Use danger for destructive conditions or confirmed critical problems.
- Do not assign a unique color to each metric, section, or icon without a
  semantic reason.
- Do not use green for ordinary labels, selected chips, borders, and actions all
  at the same time; preserve green for meaningful positive states.
- Do not use warning yellow for every Archive button, restriction label, chip,
  or metric. A warning color belongs to the specific caution message or action
  state that needs attention.
- Keep the warning surface, status indicator, and footer actions visually
  separate so one semantic color does not spread across the entire view.
- Ensure text remains readable and meaning does not depend on color alone.

## 10. Loading, error, and empty detail states

- Show a content-shaped loading state that preserves the expected detail-view
  geometry.
- During a blocking fetch or action, prevent conflicting interaction and show a
  clear progress state.
- A failed detail request must show a specific message and a safe retry action.
- Do not render a partially populated view as if it were complete.
- If a section has no related records, explain the absence briefly or omit the
  section when the absence is not useful.
- Keep Close available during an initial read-only load unless the workflow
  explicitly requires the surface to remain open.

## 11. Responsive and accessibility behavior

- The detail surface must fit within the viewport and use internal scrolling
  for long content.
- Keep the header and footer reachable while the body scrolls when the view is
  larger than the viewport.
- Preserve the same section order on mobile; stack metric columns and chip
  groups rather than shrinking text until it is unreadable.
- Use real headings, lists, buttons, and links instead of custom click targets.
- Every icon-only action needs an accessible name.
- Move focus into the detail surface when it opens and return focus to the
  originating View action when it closes.
- Escape and Close must behave consistently unless a blocking operation is in
  progress.

## 12. Detail view consistency checklist

Before approving a detail view, verify:

- The record identity and status are immediately clear.
- The view contains current, meaningful data rather than technical or repeated
  information.
- Sections appear only when they contain useful content.
- Metrics, chips, and related counts use consistent terminology and scope.
- Warnings explain a real impact and provide a safe next action.
- Actions are limited, clearly named, and placed in a stable footer.
- Destructive actions use the confirmation rules from the form standard.
- Archive uses a neutral lifecycle-action treatment unless the action itself
  requires warning emphasis; Delete uses the danger treatment.
- Borders, shapes, icons, and colors are restrained and purposeful.
- Loading, error, empty, and responsive states preserve the same hierarchy.
- Keyboard, focus, Escape, and screen-reader behavior are predictable.
