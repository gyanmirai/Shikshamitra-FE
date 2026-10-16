---
title: Scheduling Workspace UI Rulebook
status: draft
owner: frontend-team
scope: timetable-availability-substitution-and-planning-workspaces
---

# Scheduling Workspace UI Rulebook

This document defines complex scheduling workspaces such as timetable
management, room availability, substitutions, lecture-slot configuration, and
seating-related planning. It covers the planning surface around a table or
grid; ordinary tables remain governed by [tables.md](../../shikshamitra-ui-consistency/references/tables.md), and guided
multi-step flows remain governed by [steppers.md](steppers.md) and
[horizontal-steppers.md](horizontal-steppers.md).

## 1. Workspace purpose and hierarchy

A scheduling workspace must make four things immediately clear:

1. What is being scheduled.
2. Which academic scope is active.
3. What is complete, pending, conflicting, or unavailable.
4. What the next safe action is.

- Keep the page title, breadcrumbs, academic context, filters, and page actions
  in the shared page-header pattern.
- Use one primary planning region below the header. Do not split the main task
  across unrelated cards and tables.
- Use a compact summary strip only for decision-relevant counts such as
  `Pending substitutions`, `Unassigned rooms`, or `Conflicts`.
- Do not repeat the same count in a card, tab, table cell, and banner.
- Use progressive disclosure for advanced planning rules rather than showing
  every setting at once.

## 2. Workspace types

- Use a table for comparing classes, rooms, teachers, status, and coverage.
- Use a time-grid or timetable matrix for placing periods and seeing overlaps.
- Use a room/resource board for availability, reservations, and capacity.
- Use a substitution board for original teacher, substitute teacher, period,
  reason, acknowledgement, and conflict state.
- Use a form or stepper for setup decisions that must be completed in order.
- Use a right context sidebar only when it helps users keep scope and progress
  visible; it must remain dismissible when it is not required.

## 3. Scope selectors and dependency order

- Place Class, Division, Date, Teacher, Room, or Exam selectors before the
  planning region they control.
- Use dropdowns for known lists and date controls for dates.
- Dependent controls must be disabled until their parent selection is ready.
- Explain disabled dependencies with concise helper text such as `Select a
  building first` or `Select an exam to load available rooms.`
- Changing scope must not silently discard unsaved assignments. Warn, save, or
  provide a deliberate reset choice.
- Keep the academic year, board, medium, class, division, and date visible in
  the planning context.

## 4. Status and planning state

Use a small, consistent state vocabulary:

| State | Meaning | Visual treatment |
| --- | --- | --- |
| Draft | Work has started but is not ready | Neutral system treatment |
| In progress | Work is actively being configured | Existing accent or neutral progress treatment |
| Ready | Required setup is complete | Success treatment used sparingly |
| Published | Available to its intended audience | Established published-success treatment |
| Conflict | Rules overlap or a decision is invalid | Danger treatment only when action is blocked |
| Needs attention | A user decision is required | Warning treatment, not a success color |
| Unavailable | A resource cannot be selected | Muted disabled treatment |

- Do not use green borders around every configured row or panel.
- A green success state must communicate completed or valid work, not simply
  selected data.
- Use warning yellow for pending capacity, unresolved setup, or attention
  needed. Do not use yellow for ordinary archive or neutral configuration.
- Use red only for actual conflicts, blocked saves, destructive errors, or
  unavailable capacity.
- Status text must remain present when color is removed.

## 5. Planning grids and rows

- Keep row and column headers aligned with their cells.
- Use consistent time units and time formats throughout a workspace.
- Show the smallest useful unit in a cell: subject, teacher, room, or status.
- Use a detail surface for long notes, full conflict explanations, or history.
- Keep status and actions at the right edge; use the sticky rules in
  [tables.md](../../shikshamitra-ui-consistency/references/tables.md) when horizontal scrolling is necessary.
- Do not add empty columns merely to fill the width.
- If a grid is wider than the viewport, preserve a readable minimum width and
  provide intentional horizontal scrolling.
- Keep action cells wide enough for their actual controls, but do not leave a
  large unused action area.

## 6. Conflicts, capacity, and validation

- Validate conflicts close to the affected period, room, teacher, or row.
- State the problem in terms the user can act on: `Room B105 is already
  reserved for Class 8 from 08:00–09:00.`
- Include the affected scope, time, and suggested next action when known.
- Do not rely on a red border without an explanation.
- Capacity summaries must distinguish total capacity, assigned count, and
  remaining capacity.
- Do not allow a save or publish action to appear successful while unresolved
  blocking conflicts remain.
- Non-blocking warnings may allow saving, but they must be visible in review.

## 7. Room availability and reservations

- Show the selected date before room availability results.
- When Building controls Floor, disable Floor until Building is selected.
- Display room name, building, floor, type, facilities, capacity, and status
  only when those fields help the reservation decision.
- Use `Available`, `Occupied`, `Reserved`, and `Unavailable` consistently.
- A reservation flow must show the time range, purpose, scope, requester, and
  conflict result before confirmation.
- Approval states must be distinct from availability states.
- Use `Reserve room`, `Release reservation`, and `View room details`; avoid
  vague actions such as `Process`.

## 8. Substitution management

- Show date navigation, period, time, class/division, subject, original
  teacher, substitute teacher, room, reason, priority, acknowledgement,
  conflict, and status only when relevant to the decision.
- Keep `Create substitution` and `Mark unavailable` as separate actions.
- Make the source of a request clear, such as absence, timetable change, or
  manual request.
- Acknowledgement must not be represented as the same state as assignment.
- Provide a focused detail surface for the full reason and change history.
- Use contextual empty copy such as `No substitutions are scheduled for this
  date.` rather than `No data available`.

## 9. Saving, draft behavior, and publish

- Save actions must state the scope being saved when it is not obvious.
- Use `Save draft` for incomplete planning and `Publish timetable` only when
  the result is validated and ready for use.
- After saving, show a confirmation and refreshed state; a button click alone
  is not success.
- Preserve draft changes when the user leaves and returns to the workspace.
- Warn before changing scope, leaving with unsaved changes, resetting a plan,
  or publishing a plan with warnings.
- While saving, publishing, generating, or recalculating, lock conflicting
  actions and show progress. Do not allow duplicate submissions.
- Failed saves must leave user-entered values available for correction or retry.

## 10. Stepper and sidebar relationship

- Use a vertical stepper when the workflow has a persistent sequence and the
  content is tall or operational.
- Use a horizontal stepper when the workspace is wide and the step names fit
  across the available area.
- Completed steps must remain clickable when revisiting is safe.
- A context sidebar may show plan scope, students, rooms, seats, or readiness,
  but it must not duplicate the entire form.
- Let users close an optional sidebar; preserve the content when it reopens.
- Follow [sidebars.md](sidebars.md) for internal scrolling, backdrop, and
  loading behavior.

## 11. Loading, empty, and error states

- Keep the workspace structure stable while data loads.
- Use a skeleton or progress state that identifies the region being loaded.
- Disable edits, navigation, and destructive actions while a blocking operation
  is in progress.
- Distinguish no configured schedule, no matching results, and failed loading.
- Empty copy must identify the current scope and the next useful action.
- Never use `Data Not Found` or `No data available` when the user can be told
  what is missing.

## 12. Spacing, color, and content restraint

- Use the system spacing scale and consistent section padding.
- Keep important planning controls closer to the content they affect.
- Use subtle surfaces and separators; avoid heavy outlines around every row.
- Use existing icons only when they clarify room, time, status, capacity, or
  an action.
- Avoid decorative icons, extra badges, and duplicate helper text.
- Use sentence case for labels, buttons, statuses, and helper messages.

## 13. Scheduling workspace checklist

- [ ] Scope and academic context are visible and preserved.
- [ ] Dependent filters are ordered, disabled, and explained correctly.
- [ ] The workspace type matches the planning task.
- [ ] Status vocabulary and colors are consistent.
- [ ] Conflicts and capacity issues explain the next action.
- [ ] Grid columns, sticky actions, and widths are intentional.
- [ ] Draft, save, resume, review, and publish behavior is explicit.
- [ ] Loading locks interaction and prevents duplicate actions.
- [ ] Empty, filtered, and error states are contextual.
- [ ] Stepper and sidebar behavior follows the existing rulebooks.
