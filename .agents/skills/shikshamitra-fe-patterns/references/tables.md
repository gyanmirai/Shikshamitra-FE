---
title: Table UI Rulebook
status: draft
owner: frontend-team
scope: table-region-only
---

# Table UI Rulebook

This document defines only the table region used to display, search, compare,
filter, and act on records. It does not define the page title, breadcrumbs,
summary metrics, domain filters, status tabs, or page-level actions above the
table. Those rules are maintained separately in
[page-headers.md](page-headers.md).

The screenshots used while defining these rules are reference material only.
They show the current direction and areas for improvement; they are not
considered a perfect final implementation.

## 1. Table region anatomy

A standard table region should contain:

1. Table search and table utilities.
2. Column headings.
3. Record rows.
4. Loading, empty, error, and no-results states.
5. Pagination and density controls when required.

- The table must remain the primary content area below the page-level context.
- The table region must not repeat the page title, breadcrumb, insights metrics,
  domain filters, or page-level primary action.
- Keep the table content focused on records and the actions available for each
  record.
- Use one consistent table pattern across modules unless a documented workflow
  requires an exception.

## 2. Table toolbar, search, and utilities

- Use one clearly identifiable search field in the table toolbar.
- Use a consistent placeholder such as `Search...` unless the searchable
  fields need to be named explicitly.
- Keep table search fields visually consistent with the shared table toolbar;
  when the table scope is clear, avoid a redundant floating label and use a
  placeholder that names the searchable fields, such as
  `Search students by name, roll no. or GR no.`.
- Search must apply to the visible table dataset and preserve the surrounding
  page context.
- Clearing the search must restore the unfiltered table.
- Search results, no-results messaging, and pagination must agree with the
  active search term.
- Do not add a second search field for the same table unless the workflow has
  two genuinely different search scopes.
- Table utilities such as Columns, Export, density, and full-screen controls
  belong in the table toolbar.
- Keep utilities grouped and use the same order wherever they appear.
- Do not place page-level actions such as `Add subject` or `Schedule exam` in
  the table toolbar when they belong in the page header.

## 3. Table columns and content

- Column headings must use consistent wording, capitalization, and order for
  equivalent data across modules.
- Headings should describe the data in the cells below them, not the internal
  name of a database field.
- Keep the most important identifying information toward the left.
- Keep status and row actions toward the right.
- Use consistent formats for dates, counts, percentages, codes, and names.
- Long values must remain readable through wrapping, truncation with an
  accessible full-value treatment, or an appropriate detail interaction.
- Avoid columns that show no useful decision-making information.
- Badges, labels, progress indicators, and status colors must have the same
  meaning wherever the same concept appears.
- Do not repeat summary metrics from the insights drawer as unnecessary table
  columns unless the row-level value is different and useful.
- Keep column content aligned consistently by type: text left, numbers and
  dates aligned predictably, and actions aligned to the right.

## 4. Row actions and the overflow menu

The rightmost table column is reserved for row actions and must behave
consistently in every module.

### Action-count rule

- If a row has one, two, or three actions, show the actions directly as compact
  icon buttons in the Actions column.
- If a row has more than three actions, show the overflow menu represented by
  the three-dots icon.
- This threshold applies consistently to every table; individual modules must
  not invent a different threshold.
- The three-dots menu must contain the complete set of actions available for
  that row, in a logical and predictable order.
- The overflow menu must not hide an action that is expected to be immediately
  available when the row has three or fewer actions.

### Action presentation

- Keep the Actions column aligned to the right and visually separate from
  record data.
- Use familiar icons consistently for equivalent actions, such as View, Edit,
  and Delete.
- Every icon-only action must have a clear accessible name and row context.
- Disabled actions must explain their unavailable state when the reason is not
  obvious.
- An action that cannot be performed must be disabled and shown in a neutral
  grey state, including its icon and label. Do not retain its normal semantic
  color, such as red for Delete, while it is disabled.
- Destructive actions must be visually and behaviorally distinct and require
  the appropriate confirmation.
- The action menu must open in a predictable direction and remain usable near
  the edge of the viewport.

## 5. Table content states

### Loading

- Initial table loading uses table-shaped skeleton rows that preserve the
  expected column and row geometry.
- A refetch should retain safe existing rows and show a thin labelled progress
  indicator where appropriate.
- Loading must not replace the table toolbar or cause the table to jump in
  height.

### Empty and not-found states

The empty state must be a deliberate part of the table design, not a blank
table body.

- The empty-state illustration or icon, message, and primary button must be
  centered within the table content area, both visually and as a group.
- Apply the same horizontal and vertical centering to an empty state shown in a
  tab panel, using the full content area available below the tabs.
- The empty state must remain centered when the table width or viewport
  changes.
- Keep the search and table toolbar visible while the empty state is shown.
- The message must distinguish between no records existing, no records
  matching a search, no records matching filters, and a prerequisite state.
- Do not use generic or technically worded messages such as `Data Not Found`
  when the user can be told what is actually missing.
- Do not reuse a normal empty-dataset message for a failed search. The message
  must describe the active condition.
- When no records exist yet, explain the current state and provide one create
  action only when creating a record is valid and belongs to the current
  workflow.
- A create action must use the same verb-first wording as the page-level
  action. Do not add a generic white button merely because the table is empty.
- When a prerequisite is missing, explain the dependency and provide a
  contextual action only when the user can resolve it from that action. For
  example, `No exams are ready for seating` may link to `Open examination
  schedule` when that is the correct next step.
- Do not leave the empty state attached to one side of the table or visually
  separated from its button.
- The empty-state icon must be visually balanced with the message and must not
  overpower the action.

#### Search no-results state

- Use a clear message such as `No subjects match your search` or `No exams
  match “biology”`.
- Provide a `Clear search` action that removes the search term and restores the
  table.
- Do not show `Create subject`, `Allocate subject`, or another creation action
  when records exist but the current search does not match them.
- Preserve the entered search term until the user clears it or changes it.

#### Filter no-results state

- Use a clear message such as `No exams match the selected filters`.
- Provide a `Clear filters` action when active filters can be removed.
- If a tab and filters are both active, name the relevant scope when it helps
  the user understand why the table is empty.

#### Empty dataset state

- Use a message such as `No subjects have been added yet` when the dataset is
  genuinely empty.
- Show a single relevant creation action only when the user has permission and
  the workflow supports creating the first record.
- Keep the action style consistent with the page-level action and system
  button treatment.

#### Centering and geometry

- Center the complete empty-state group—icon, message, helper text, and action—
  horizontally and vertically within the available table body.
- The center position must not change because the table has many columns,
  sticky columns, or horizontal scrolling.
- Use stable minimum height so switching between populated and empty states does
  not cause the page layout to jump.
- Keep the message concise and place the action close enough to show that it is
  the next step without crowding the message.

### Error

- A table error must explain what failed and provide a safe retry action.
- Preserve the toolbar and table geometry when showing an error.
- Do not show a successful empty state when the data request actually failed.

## 6. Sticky status and actions columns

Wide tables must keep the information users need to understand and act on a
row available while they horizontally scroll through other columns.

### Status column

- When a record has a lifecycle or workflow state, provide a dedicated
  `Status` column with a consistent position near the right side of the table.
- Status must show the current state using a concise label, not only an icon or
  color.
- Use the same status labels and semantic treatments across equivalent modules,
  such as `Draft`, `Published`, `Active`, `Archived`, `Completed`, or `Needs
  attention`.
- Keep status separate from unrelated values such as health, issues, or
  progress unless the product meaning is genuinely the same.
- The status column must remain visible when the table is wider than the
  viewport and the user scrolls horizontally.

### Actions column

- The Actions column must remain the rightmost sticky column.
- Row action buttons must stay visible while the user scrolls through wide
  tables, so the user does not need to scroll back to the far right to act.
- The sticky order from left to right must be: table content, Status, Actions.
- If a table has no status concept, Actions may be the only sticky right-side
  column.
- The existing three-action threshold still applies inside the sticky Actions
  column.
- Sticky actions must retain their row alignment and must never appear to
  belong to the adjacent data column.

### Sticky visual treatment

- Sticky columns must use a stable surface background so scrolling content does
  not show through them.
- Add a subtle divider or shadow on the left edge of the sticky group to show
  where the scrolling region ends.
- Do not use bright borders, large shadows, or extra colors to emphasize the
  sticky behavior.
- The Status and Actions headers must remain aligned with their body cells.
- Sticky columns must not overlap each other, clip labels, or cover row data.
- The sticky group should be wide enough for its labels and controls without
  consuming unnecessary table space.

### Scrolling and responsive behavior

- The table container, not the browser document, owns horizontal scrolling.
- Horizontal scrolling must preserve the sticky Status and Actions columns at
  the right edge of the table viewport.
- The sticky behavior must work with dense and comfortable table density.
- On narrow screens, preserve the actions first. Status may use a compact label
  or move into the row's accessible detail treatment only when the table
  pattern explicitly documents that responsive exception.
- Do not create a second horizontal scrollbar for the sticky column group.
- Keyboard users must be able to reach status information and every row action
  in logical order, even when the table is horizontally scrolled.

## 7. Pagination and density

- Pagination controls must show the current range and total when the total is
  available.
- Changing page size must preserve the current search, filters, and sort state.
- Do not reset the user's table context when moving between pages.
- Density controls must change row spacing consistently without changing the
  meaning or order of table content.
- Empty pages caused by a changed dataset must explain the state and offer a
  safe way to return to a valid page.

## 8. Table width and column quality

- The table must use the available width of its container without leaving a
  large unexplained empty area after the last meaningful column.
- Allocate flexible width to the primary identifying column and other content
  that benefits from readable space.
- Keep Status and Actions columns sized to their actual content; do not stretch
  the Actions column beyond the width needed for its controls.
- Keep the Actions column compact while still providing comfortable click and
  keyboard targets.
- Use horizontal scrolling only when the total column content genuinely cannot
  fit. Do not create horizontal overflow because of arbitrary fixed widths.
- Column widths must remain stable while rows load, filter, or change state.
- Review every column before approval: remove fields that are duplicated,
  internal-only, empty in normal use, or not useful for a user decision.
- Keep a column when it supports an important comparison, status decision,
  workflow action, audit need, or navigation path.
- If a value is already clear from the record name, status, or detail view,
  do not repeat it as another column without a specific user benefit.
- When a table needs many fields, prefer column visibility controls or a detail
  view rather than shrinking every column until the content becomes unreadable.

## 9. Tabs, filters, and table scope

Status tabs and domain filters are defined in [page-headers.md](page-headers.md),
but the table must respond to them consistently.

- The active tab or filter must clearly determine which rows are displayed.
- Changing a tab or filter must refresh the table data, row count, pagination,
  empty state, and related status information together.
- Do not leave rows from a previous tab visible while the new scope is loading
  unless the loading state clearly indicates that the data is being refreshed.
- The table heading, search result count, and pagination range must agree with
  the active tab and filters.
- If a tab has no records, show a useful empty state instead of a blank table.
- Preserve the active tab and filter context when opening a row detail view and
  when returning to the table.

## 10. Overflow-menu behavior

The three-dots menu is part of the table interaction and must feel attached to
the row action that opened it.

- Anchor the menu to the row's three-dots control in the Actions column.
- Keep the menu within the viewport and prevent it from being clipped by the
  table container or sticky columns.
- Use concise, verb-first menu labels such as `Preview`, `View timetable`, and
  `Print timetable`.
- Order actions from most common and safe to less common or consequential.
- Use icons only when they improve scanning and use the same icon for the same
  action throughout the product.
- Do not repeat the row name in every menu item when the row context is already
  clear.
- Keep menu width, padding, row height, and icon alignment consistent across
  tables.
- Close the menu after an action is selected, when the user clicks outside it,
  or when Escape is pressed.
- The menu must be keyboard navigable and each item must have an accessible
  name that includes row context where needed.
- Do not show unavailable actions as unexplained menu items. Disable them only
  when discoverability is important and the reason can be communicated.

## 11. Table text and label quality

- Review every visible heading, cell label, badge, action, tooltip, and empty
  state for spelling, grammar, capitalization, and meaning.
- Use sentence case consistently unless a proper name or established product
  term requires another form.
- Keep singular and plural forms correct: `1 subject`, `2 subjects`, not
  `1 subjects`.
- Use precise names that describe the record, such as `Oral exam for September`
  instead of ambiguous or incomplete labels.
- Use one date format consistently within a table and make date ranges easy to
  distinguish from single dates.
- Do not show internal abbreviations when users need the full meaning.
- Use `—` or the approved empty-value treatment consistently when a value does
  not exist; do not mix `-`, blank cells, and `0` without meaning.
- Button labels must describe the result, such as `Schedule exam`, not a noun
  phrase that only names the feature.

## 12. Table consistency checklist

Before approving a table region, verify:

- The table does not repeat page-header content that belongs in
  [page-headers.md](page-headers.md).
- Search and table utilities are grouped consistently.
- The table fills its available width without unnecessary action-column space.
- Every visible column has a documented user benefit and useful data.
- Column labels, formats, badges, and statuses follow shared terminology.
- Row actions follow the three-action threshold.
- More than three row actions use a three-dots overflow menu.
- Overflow menus are anchored, readable, keyboard accessible, and not clipped.
- Active tabs and filters stay synchronized with rows, counts, pagination, and
  empty states.
- Text, dates, singular/plural wording, and button labels have been reviewed.
- Status and Actions remain visible during horizontal table scrolling.
- Actions are the rightmost sticky column and status sits immediately before it.
- Sticky cells have an opaque, consistent surface and subtle separation.
- Headers and body cells remain aligned while scrolling.
- Loading, error, empty, and populated states preserve the same table geometry.
- Empty dataset, search no-results, filter no-results, and prerequisite states
  use different accurate messages.
- The complete empty-state group is centered and has only an appropriate
  contextual action.
- Search no-results offers `Clear search`; filter no-results offers `Clear
  filters` when applicable.
- Pagination and density controls preserve the user's table context.
- The table container owns scrolling and the page does not gain document-level
  horizontal overflow.
- Keyboard and responsive behavior remain usable.

## 13. Relationship to implementation guidance

This rulebook defines the user-facing table-region standard. Technical
implementation constraints remain in the repository's `DESIGN.md`, including
shared table components, table height and scrolling, accessibility, loading
behavior, responsive behavior, and validation requirements.

When a new table pattern is needed, first determine whether it can follow this
rulebook. If it cannot, document the reason for the exception before adding a
module-specific variation.

## 14. Using this rulebook for implementation and verification

Use this file as an implementation and test checklist whenever a table or its
empty state is created, changed, or reviewed.

- Check each applicable rule against the rendered screen and the relevant
  interactions. Include loading, populated, genuinely empty, search no-results,
  filter no-results, error, and prerequisite states when they apply.
- Verify the table toolbar, row data, counts, pagination, and active tab or
  filters remain consistent as the table state changes.
- Check responsive layout, horizontal scrolling, sticky columns, keyboard
  access, and accessible names for controls relevant to the change.
- Record findings as `Consistent`, `Inconsistent`, or `Unverified`. Include the
  page or component, the observed behavior, and the evidence for each finding.
  Do not report an unverified rule as passing.
- End every review report with an `Inconsistencies` section. List each confirmed
  mismatch there with its location, observed behavior, and the applicable rule.
  If none were found, state `No inconsistencies observed`. Keep unverified
  checks and blockers in their own sections so they are not mistaken for
  confirmed inconsistencies.
