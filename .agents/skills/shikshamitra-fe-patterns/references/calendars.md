---
title: Calendar UI Rulebook
status: draft
owner: frontend-team
scope: calendar-regions-and-calendar-workspaces
---

# Calendar UI Rulebook

This document defines calendar regions and calendar workspaces used to view,
navigate, filter, and understand dates, working days, holidays, events, exams,
and other scheduled items. It applies to Academic Calendar and similar
calendar-based surfaces. Page title, breadcrumbs, summary metrics, and
page-level actions remain governed by [page-headers.md](page-headers.md).

## 1. Calendar surface choice

- Use a year view when users need to understand the academic year at a glance.
- Use a month view when users need to inspect or manage events on particular
  dates.
- Use a day or agenda view only when individual time slots or a daily schedule
  are the primary decision.
- Do not show multiple calendar views at the same time unless the relationship
  between them is clear.
- Keep the active view obvious through the existing selected-tab treatment.
- Do not turn a calendar into a table by placing every event field inside each
  date cell. Use a detail view or drawer for substantial event information.

## 2. Calendar anatomy

A calendar workspace may contain:

1. View switcher: `Year view`, `Month view`, or another supported view.
2. Date navigation: previous, next, and `Today` controls.
3. Date range or academic-year context.
4. Event category filters or a concise legend.
5. Calendar grid or agenda content.
6. A clear empty, loading, error, or filtered no-result state.

- Keep controls in one predictable toolbar row where the viewport allows it.
- Put navigation near the date range it changes.
- Keep event filters together; do not scatter them across the calendar body.
- The grid must remain the main content, not the surrounding controls.
- Do not repeat page-level metrics inside every month or date cell.

## 3. Date navigation and labels

- Use `Previous month`, `Next month`, `Previous year`, and `Next year` as
  accessible labels. Do not rely on icon-only meaning.
- Use `Today` for returning to the current date. Use `Current academic year`
  when the action returns to the active academic-year range.
- The visible range must identify the month, year, or academic-year period.
- Use one product-wide date format. Prefer `22 September 2026` in explanatory
  text and the established compact format in dense cells.
- Do not mix `22/09/2026`, `09/22/2026`, and `22-09-2026` in the same surface.
- If a date is outside the active academic year, make that fact clear before
  allowing an event to be added.
- Date navigation must update the heading, selected date, event list, and
  accessible status together.

## 4. Calendar grid and spacing

- Use the established spacing tokens; prefer a consistent 8/12/16/24 rhythm
  instead of arbitrary gaps.
- Keep weekday headings aligned with their date columns.
- Give each day cell enough padding for the date number and the most important
  event indicator without crowding.
- Keep month cards or grid sections visually separated with subtle surface
  contrast, not heavy borders around every day.
- Do not create large empty gaps between months when the layout can reflow.
- Use a stable cell height in a view so the calendar does not jump while data
  loads.
- On narrow screens, switch to a supported compact or agenda layout rather
  than shrinking text until dates and events are unreadable.

## 5. Day-cell content

- The date number is the primary cell label.
- Show only the event information needed for scanning: category, short title,
  or a count indicator.
- Truncate long event names with an accessible full-value treatment.
- When a day contains many events, show a concise count such as `3 events` and
  open the full list in a drawer or detail view.
- Do not place repeated descriptions, long notes, or action buttons inside
  every day cell.
- Selected day, today, weekend, holiday, and disabled dates must remain
  distinguishable without relying on color alone.
- Do not use icons without a clear relationship to the event type.

## 6. Event categories and color

- Use only the existing system palette and semantic tokens.
- Neutral calendar surfaces should use the normal page and panel surfaces.
- Use the established accent for selection and active interaction.
- Use success only for a successful or published state.
- Use warning yellow only for an actual warning, pending condition, or
  attention-needed state.
- Use danger red only for conflicts, blocked actions, or destructive errors.
- Category colors must be reused consistently. Do not assign a new bright color
  to every event type merely to make the calendar look varied.
- A category legend must explain any non-obvious color or icon.
- Every color distinction must have a text, icon, pattern, or label equivalent.

## 7. Filters and scope

- Filters must state what they affect: class, event category, academic year, or
  another supported scope.
- Use dropdowns for fixed categories and date controls for dates. Do not use a
  free-text field for a known category list.
- Dependent filters must follow [page-headers.md](page-headers.md) and the
  rules in [forms.md](forms.md): disable unavailable choices and explain why.
- Changing a filter must update the calendar and its result count together.
- Preserve the selected academic year, board, medium, class, and division when
  navigating between views unless the user intentionally changes them.
- Provide `Clear filters` when multiple filters can hide calendar content.

## 8. Calendar content states

### Loading

- Keep the calendar geometry stable while data is loading.
- Use a restrained skeleton or progress indicator in the calendar region.
- Disable actions that would save, publish, delete, or navigate away from
  incomplete data while the operation is active.

### No events

- Use contextual copy such as `No events are scheduled for this month.`
- If the user can create an event, provide one relevant action such as `Add
  event`; do not show a generic create action when the user lacks permission.

### Filtered no-results

- Use `No events match the selected filters.`
- Provide `Clear filters` when it is useful.
- Do not present filtered no-results as an empty academic calendar.

### Error

- Say what could not be loaded and provide a safe retry action.
- Keep the selected date and filters so retrying does not discard context.

## 9. Event details and editing

- Use a detail drawer or focused form for event details; follow
  [sidebars.md](sidebars.md), [detail-views.md](detail-views.md), and
  [forms.md](forms.md).
- Show date, time, category, scope, description, creator, and lifecycle status
  only when they help the user understand the event.
- Use `Edit event`, `Archive event`, or `Delete event` rather than vague
  labels such as `Manage`.
- Warn before destructive or scope-changing actions using [popups.md](popups.md).
- Preserve unsaved event changes and explain the consequence before closing.

## 10. Accessibility and responsive behavior

- Each date cell must have an accessible name containing the date and relevant
  event summary.
- Keyboard users must be able to move through the calendar, change views, and
  open an event without relying on pointer hover.
- Do not make an entire month a single focus target when individual dates are
  interactive.
- Keep focus visible after changing the month, applying a filter, or closing a
  detail surface.
- Provide a readable agenda/list alternative when a grid is too dense for the
  viewport or assistive technology.

## 11. Calendar consistency checklist

- [ ] View choice is appropriate for the task.
- [ ] Date navigation, range, and `Today` wording are consistent.
- [ ] Date format is consistent with the rest of the product.
- [ ] Day cells contain only concise, useful information.
- [ ] Categories use existing semantic colors and have a legend when needed.
- [ ] Loading, empty, filtered, and error states are distinct.
- [ ] Filters preserve the active academic context.
- [ ] Detail and edit actions use the shared drawer, form, and popup rules.
- [ ] Keyboard, focus, responsive, and non-color cues are supported.
