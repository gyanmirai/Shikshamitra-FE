---
title: Page Header UI Rulebook
status: draft
owner: frontend-team
scope: page-level-context
---

# Page Header UI Rulebook

This document defines the content above a table or other primary page region:
page title, breadcrumbs, context, summary metrics, status navigation, domain
filters, information icons, and page-level actions. Table-specific behavior is
defined separately in [tables.md](tables.md).

## 1. Page-header anatomy

A standard page header may contain:

1. Page title and useful supporting description.
2. Breadcrumb navigation.
3. Context selectors or domain filters.
4. A `View all insights` action when useful summary information supports a decision.
5. Status tabs when users need to move between lifecycle states.
6. One clear primary page action.

- Keep these areas as one hierarchy rather than a collection of unrelated rows.
- Do not show every possible header element on every page.
- Omit any element that does not help the user understand or act on the page.
- The primary table or content region should begin after the page context is
  established.

## 2. Page title and information icon

- Use a clear, user-facing page name and the same naming convention as the
  navigation item and breadcrumb.
- Add a small information icon beside the heading only when the user benefits
  from an explanation, rule, or workflow note.
- The information icon must have a meaningful accessible label and open a
  concise tooltip, popover, or help panel.
- Do not add an information icon to every heading by default.
- Supporting text should explain purpose or consequence, not repeat the title.
- Keep the heading, breadcrumb, description, and primary action aligned in the
  established page-header layout.

## 3. Breadcrumbs and links

- Breadcrumbs must use one consistent visual style across all modules.
- Breadcrumbs must show the user's current location and preserve the same
  hierarchy on related pages.
- The active page should be visually distinct from preceding linked items.
- Breadcrumb links must remain readable, keyboard accessible, and usable at
  smaller widths.
- Do not replace breadcrumbs with unrelated labels, cards, or page-specific
  navigation patterns.
- Links that represent the same destination must use the same label and
  placement throughout the product.

## 4. Page-level actions

Primary actions must describe the action the user is about to perform. Use a
verb-first label rather than repeating the name of the page or feature.

| Avoid | Use |
| --- | --- |
| Subject Allocation | Allocate subject |
| Student Creation | Add student |
| Teacher Assignment | Assign teacher |
| Schedule Exam | Schedule exam |

- Use a plus icon only when the action creates or adds something.
- Keep the primary action in the same location on equivalent pages.
- Use sentence case for action labels unless an established product term
  requires otherwise.
- Empty-state actions and page-level actions must use the same verb and noun
  for the same workflow.
- Secondary actions must remain visually secondary and must not compete with
  the primary action.
- Review all visible labels for grammar, capitalization, singular/plural
  agreement, and action meaning before considering a page complete.

## 5. Context filters and selectors

- Place domain filters such as class, date range, division, category, or status
  near the page header and before the table region.
- When page-level filters are present, use the standard compact dropdown/select
  controls shown in the product header pattern.
- Keep page-level dropdown filters grouped on the left side of the context row.
- Keep the page-level action buttons aligned on the right side of that same row.
- The left filter group and right action group must share the same horizontal
  alignment, vertical rhythm, and control height.
- Do not move the primary page action into the filter group or place filters
  after the action buttons without a clear responsive reason.
- Domain filters must be clearly labelled and must not be confused with table
  search.
- Keep related filters grouped and use a predictable order across equivalent
  pages.
- Show the active filter context when it changes the meaning of metrics or
  records.
- Date-range controls must display both the selected range and a clear date
  format.
- Changing a filter must preserve unrelated page and table context.
- Provide a clear way to remove filters when they produce no results.
- Dropdown filters must show the current selected value, support keyboard
  operation, and make the closed/open state clear.
- Use a date picker or date-range control only when the filter is genuinely a
  date selection; it should follow the same header alignment and sizing.
- Use a search input, checkbox group, or other control only when a dropdown
  cannot express the required interaction. Such exceptions must remain aligned
  with the standard filter row.

### Filter and action row

The standard arrangement is:

`[ Filter dropdown ] [ Filter dropdown ] [ Filter dropdown ]                         [ Secondary action ] [ Primary action ]`

- Filters remain left aligned and actions remain right aligned on wide screens.
- Keep the row visually quiet: use the system surface, subtle borders, and no
  extra decorative container.
- Keep labels above or integrated into the dropdown according to the shared
  control pattern; do not mix unrelated label styles in one row.
- If the row cannot fit, wrap filters before moving or hiding actions. The
  primary action must remain discoverable and reachable.
- On narrow screens, stack the filters first and place actions below them while
  preserving the same order and priority.

## 6. Summary metrics

- On list and table pages, keep the table as the primary content: do not show
  summary cards or metric strips above it. Put useful summary metrics in a
  right-side insights drawer opened by a `View all insights` secondary action
  in the page-level action group.
- Scope the drawer title and metrics to the current page and selected context,
  such as class, exam, academic year, board, medium, and active filters.
- Keep status tabs and their counts visible when they are needed to navigate
  record states; they are not a replacement for the insights drawer.
- Omit the insights action when the page has no meaningful, reliable summary
  data. Do not create decorative metrics to populate a drawer.
- Every metric must show real, current data with a precise label, such as
  `Draft exams`, `Published`, `Needs attention`, or `Completed`.
- Never show placeholder zeroes, stale values, or decorative metrics merely to
  fill the drawer.
- The metric value and label must have a clear relationship to the selected
  page scope and active filters.
- Use the system semantic color that matches the meaning: neutral for counts,
  success for completed/ready, warning for attention, and error only for a
  genuine problem.
- Do not use a different color for every metric without a semantic reason.
- Keep metric labels and values readable in the drawer, including at narrow
  viewport widths.
- Changing a filter must refresh or clearly scope the displayed metrics; never
  leave the user guessing whether the values changed.

### View all insights drawer

When a page offers `View all insights`, the secondary action opens a right-side
drawer without replacing the table or losing the current page context. Follow
the shared drawer behavior in [sidebars.md](sidebars.md) for responsive width,
internal scrolling, focus, and closing.

- Align a concise, page-scoped title, one meaningful icon, an information
  tooltip, and the close action in the drawer header. Put brief explanatory
  context in the tooltip rather than a long subtitle that crowds the header.
- Show a labelled metric comparison chart only when the values are comparable.
  Use current data, readable axes and data labels, and a short wrapping
  `Label: value | Label: value` summary beneath the chart. Do not turn
  non-numeric values into misleading zero bars.
- Follow the chart with a `Key metrics` section when the individual values help
  users understand the current scope. Use compact, balanced cards with the
  value prominent, the label directly below it, meaningful icons, consistent
  padding, and no forced empty space.
- Add a focused attention or next-step note only when it conveys a real
  condition. Do not repeat the same counts in prose or add a generic panel
  merely to fill the drawer.
- Keep chart, metric cards, and any attention note tied to the selected year,
  board, medium, class, filters, and visible records as applicable. Show an
  honest loading or unavailable state rather than placeholder zeroes.
- If a metric card changes the table filter, make it an accessible button with
  a clear selected state; otherwise present it as read-only information.

## 7. Status tabs and counts

- Status tabs are appropriate when users commonly move between meaningful
  record states, such as Pending, Published, Ongoing, and Completed.
- Use short, mutually exclusive status labels and show counts only when they
  are current and useful.
- The active tab must be visually clear through an underline or restrained
  system accent, not a heavy filled panel.
- Selecting a status tab must update the table or primary content, pagination,
  empty state, and related summary values together.
- Do not show a tab for a state that cannot occur in the current workflow.
- If a status count is zero, keep it only when the state is important to the
  workflow; otherwise avoid unnecessary visual noise.

## 8. Header consistency checklist

Before approving a page header, verify:

- The heading, breadcrumb, and navigation label use consistent terminology.
- The information icon appears only when it provides useful context.
- List and table pages expose useful summaries through `View all insights`,
  without a row of summary cards above the table.
- Insights metrics show real data and respond to the selected scope.
- `View all insights` opens a readable, responsive drawer with a useful
  comparison, compact metrics, and an attention note only when warranted.
- Metric labels are specific and not duplicated unnecessarily.
- Status tabs and counts match the content shown below.
- Filters have clear labels, predictable placement, and correct date formats.
- The primary action is obvious and uses a verb-first label.
- The header does not become a wall of cards, colors, alerts, or repeated text.
