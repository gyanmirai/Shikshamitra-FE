---
title: Sidebar and Drawer UI Rulebook
status: draft
owner: frontend-team
scope: drawers-and-side-panels
---

# Sidebar and Drawer UI Rulebook

This document defines sidebars, drawers, and side panels used to inspect,
configure, or complete a focused task without leaving the current page. It is
separate from [detail-views.md](detail-views.md), which defines record content,
and from [popups.md](popups.md), which defines short decisions and
confirmations.

## 1. When to use a sidebar

- Use a sidebar when the content is related to the current page and the user
  should retain the underlying table or workflow context.
- Use a drawer for a long detail view, schedule, audit trail, configuration
  area, or focused editing task.
- Use a centered popup for one short decision instead of turning a confirmation
  into a large sidebar.
- Use a dedicated page when the content requires deep navigation or a long
  independent workflow.
- Do not use a sidebar to hide content that users need to compare continuously
  with the underlying page.

## 2. Width and placement

- Use a consistent width for equivalent sidebar types across modules.
- The sidebar must be wide enough for labels, values, controls, and actions
  without forcing avoidable truncation.
- Do not make the sidebar wider than the content requires.
- Keep the sidebar attached to the viewport edge with a stable position while
  its body scrolls.
- Use a restrained backdrop to separate the sidebar from the page.
- The sidebar must not create document-level horizontal overflow.
- On narrow screens, the sidebar may become nearly full width, but it must
  preserve internal padding and a reachable close action.

## 3. Header content and alignment

- The header must identify the record or task immediately.
- Use Title Case for visible drawer titles, as defined in `DESIGN.md`. Preserve the spelling of record names included in dynamic titles.
- Use a clear title, concise supporting context, and status only when each
  provides different information.
- Keep the title, meaningful record icon, status chip, and close action
  aligned to a consistent header grid.
- Put optional drawer-level context in an accessible info tooltip immediately after the
  status badge (after the title when there is no badge), instead of a visible subtitle line.
  Give the icon a meaningful accessible label. Keep section-specific guidance in an info
  tooltip beside the relevant section heading.
- Use one record or task icon only when it helps identify the content; remove
  decorative or repeated icons.
- Use the configured record icon or color only when it is meaningful product
  data.
- Keep icons optically aligned with their text and use consistent sizes.
- The close button must remain in the same location across equivalent drawers
  and must have an accessible label.
- Do not place important instructions in the header if they belong with the
  related field or section.

## 4. Text, spacing, and visual hierarchy

- Use one consistent internal padding value for the header, body sections, and
  footer, with deliberate adjustments only for dense tables or compact lists.
- Use clear vertical spacing between the header, tabs, sections, alerts, and
  actions.
- Use section headings that describe the content, such as `Facilities`,
  `Schedule timeline`, `Exam overview`, or `Subjects & schedule`.
- Keep helper text short and useful. Do not repeat the heading or the same
  value in multiple places.
- Use sentence case for body copy and correct singular/plural wording.
- Use a grid for related values so labels and values align across the drawer.
- Do not create large empty areas above the first section or between short
  sections merely to fill the viewport.
- Do not stretch a short detail view to look like a full page; let the content
  determine the body height up to the defined maximum.
- Keep the footer at the bottom when the drawer is tall, while allowing the
  body—not the entire page—to scroll.

## 5. Content grids and compact data

- Use a two-, three-, or four-column grid for compact read-only data when the
  drawer width supports it.
- Stack the grid on narrow screens instead of shrinking values until they are
  unreadable.
- Keep labels visually secondary and values visually primary.
- Align values consistently by type: text left, numbers and dates predictably,
  and status indicators with their related value.
- Use chips for short entities such as classes, divisions, facilities, or
  groups; follow the chip rules in [detail-views.md](detail-views.md).
- Use a compact metric row only when each metric helps the user understand the
  record or make a decision.
- Do not show empty metric cells, internal IDs, or repeated counts without a
  clear purpose.
- When content is repeated, use a compact list or table rather than many
  individually bordered cards.

## 6. Tabs and section navigation

- Use tabs only when the sidebar contains peer content areas, such as `Details
& schedule` and `Audit trail`.
- Keep tab labels short, aligned, and easy to scan.
- The active tab must have a clear system-accent indicator and accessible state.
- Preserve the selected tab while the user scrolls within the same sidebar.
- Do not use tabs for a sequence of steps; use the stepper rules in
  [steppers.md](steppers.md).
- Do not create a tab when the content would fit naturally in one section.
- Each tab must have meaningful content; never add a placeholder tab only to
  make the header look complete.

## 7. Lists, schedules, and long content

- Long schedules, audit trails, timelines, and repeated records must scroll
  inside the sidebar body.
- Keep the header and footer stable while the body scrolls.
- Use compact repeated rows with a consistent grid for time, label, detail, and
  status.
- Preserve important text through wrapping, truncation with an accessible full
  value, or a detail interaction.
- Do not force the user to scroll the entire underlying page to read a long
  sidebar.
- Avoid a second unnecessary scrollbar inside a section. Use one body scroll
  container unless a nested table genuinely requires its own bounded scroll.
- Keep the scroll position when switching between related sections only when
  doing so is predictable and useful.

## 8. Alerts, usage, and restrictions

- Show an alert only when it communicates a real current condition, impact, or
  required action.
- Place the alert close to the content it explains.
- Use concise text that states the condition, consequence, and next step.
- Use the system danger color for critical or destructive conditions, warning
  for restrictions and attention, and neutral or informational treatment for
  ordinary context.
- Do not use a full red or yellow section when a compact message is enough.
- Do not repeat the same restriction in the header, a badge, a section, and
  the footer.
- Keep alert icons aligned with the alert heading and message.

## 9. Backdrop, close, and unsaved-work behavior

- Clicking the backdrop should close the sidebar when there is no loading,
  saving, blocking request, or unsaved work that would be lost.
- Escape and the close button should follow the same safe-close rules.
- If a close would discard unsaved changes, show the confirmation rules from
  [popups.md](popups.md).
- While loading or saving, ignore backdrop click, Escape, and close attempts
  until the operation completes or fails.
- Do not close the sidebar silently after a failed save.
- Return focus to the control that opened the sidebar after it closes.

## 10. Loading and interaction lock

- During a blocking load or save, prevent conflicting interaction with the
  sidebar content and footer actions.
- Show a localized or semi-transparent loading treatment that preserves the
  sidebar's structure and current context.
- Disable close, backdrop dismissal, tabs, inputs, and action buttons when the
  operation requires the entire sidebar to remain locked.
- If only one section is loading, lock only that section when safe to do so.
- Prevent duplicate save, publish, archive, or delete actions.
- On failure, preserve entered data and show a specific retry path.
- On success, show the result before closing or navigating away.

## 11. Footer actions

- Keep actions in a stable footer when the sidebar contains an edit or
  consequential workflow.
- Use one clear primary action and a safe secondary action such as `Close` or
  `Cancel`.
- Standard create/edit drawer forms follow the `Submit` label, neutral button defaults,
  and no-shortcut rules in [forms.md](forms.md).
- Use verb-first labels such as `Save changes`, `View timetable`, `Archive`, or
  `Publish exam`.
- Keep destructive actions visually distinct and follow [popups.md](popups.md)
  for confirmation.
- Do not add an action for every section when one contextual action is enough.
- Do not leave large unused footer space or place actions far from the content
  they affect.

## 12. Color, borders, and icons

- Use only the approved system palette and semantic colors.
- Keep neutral surfaces and text as the dominant visual treatment.
- Use green only for meaningful active, available, ready, or completed states.
- Use cyan/blue or the approved accent for informational and interactive
  elements where the system defines that meaning.
- Use warning yellow and danger red only for their semantic conditions; do not
  color every chip, icon, border, and action.
- Use subtle borders and surfaces to group content; avoid thick outlines,
  repeated cards, and decorative shapes.
- Remove icons that do not add meaning or improve scanning.
- Keep icon style, size, alignment, and spacing consistent across sections.

## 13. Sidebar consistency checklist

Before approving a sidebar, verify:

- The sidebar is the correct surface for the content and does not duplicate a
  popup or dedicated page.
- The header title, context, icon, status, and close control are aligned.
- Text, spacing, labels, and singular/plural wording are correct.
- Related data uses an appropriate grid with no unexplained empty space.
- Long content scrolls inside the sidebar body, not the underlying page.
- Header and footer remain reachable while the body scrolls.
- Tabs are used only for peer content areas and have meaningful content.
- Backdrop click, Escape, and close are enabled only when safe.
- Loading and saving lock the required interactions and prevent duplicate work.
- Alerts use the correct semantic color and contain useful context.
- Extra icons, borders, colors, and repeated information have been removed.
- Keyboard focus, narrow-screen layout, and screen-reader behavior are usable.
