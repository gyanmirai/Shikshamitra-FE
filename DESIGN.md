# Frontend interface design contract

This document is the canonical interface contract for ShikshaMitra frontend pages.
It applies to new work and to meaningful changes on existing pages.
Use the strongest current shared patterns instead of copying a legacy screen only because it already exists.

## Design priorities

Apply these priorities in order.

1. Make the user's next action obvious.
2. Preserve accurate data and clear system state.
3. Keep navigation, permissions, and tenant context visible.
4. Reuse shared components and predictable page anatomy.
5. Support keyboard, touch, narrow screens, and assistive technology.
6. Keep rendering and network behavior stable as school data grows.

## Reference implementations

| Concern                                      | Current reference                                                              |
| -------------------------------------------- | ------------------------------------------------------------------------------ |
| Full-height table workspace                  | `src/screens/classManagement/assignElectiveSubject/index.tsx`                  |
| Persistent tab workspace                     | `src/screens/hr/policies/HRPolicyWorkspace.tsx`                                |
| Shared table                                 | `src/components/customizabaleTable/index.tsx`                                  |
| Enrollment page header                       | `src/screens/student/enrollment/admissions-crm/workspace-header.tsx`           |
| Enrollment filters, empty states, and errors | `src/screens/student/enrollment/admissions-crm/workspace-table-patterns.tsx`   |
| Enrollment settings task navigation          | `src/screens/student/enrollment/setting/enrollment-settings-page.tsx`          |
| Guided settings editor drawer                | `src/screens/student/enrollment/setting/enrollment-settings-editor-drawer.tsx` |

These files are reference implementations, not exemptions from this contract.
When a reference conflicts with this document, follow this document and improve the shared primitive.

## Page types

Classify a page before choosing its layout.

| Page type        | Primary behavior                                       | Scrolling owner          |
| ---------------- | ------------------------------------------------------ | ------------------------ |
| Table workspace  | Find, compare, filter, and act on records              | The table region         |
| Dashboard        | Scan cards, trends, exceptions, and next actions       | The page                 |
| Detail workspace | Review or edit one record across sections              | The page or active panel |
| Setup flow       | Complete a genuinely ordered sequence                  | The page                 |
| Dialog or drawer | Finish a short contextual task without losing the page | The dialog or drawer     |

A page must not combine several primary page types without a clear visual hierarchy.
A stepper is reserved for a genuinely ordered setup or completion sequence.
Independent settings belong in tabs or separate routes rather than a decorative stepper.

## Shared page anatomy

Every authenticated page uses the shared application shell.
The page header contains the title, breadcrumb context, concise description, and primary page action when one exists.
Global navigation and the page header stay mounted while page content loads, refreshes, or reports an error.
Page-specific filters and context controls appear between the header and the primary content.
Repeated actions use the same label, icon, order, and placement across related pages.

Do not add a second page title inside the primary card.
Do not place explanatory cards above a primary table when concise helper text or an information action is sufficient.
Use progressive disclosure for advanced guidance and infrequent settings.

## Full-height table workspaces

A table-first page must look and behave like a table workspace.
On desktop, the primary table consumes all height remaining below the page header and context controls.
The page root, content region, table wrapper, table card, and table container must all participate in one unbroken flex-height chain.
Every flex child that contains the table must set `minHeight: 0`.
The page root uses `height: 100%` and prevents document-level overflow.
The table region uses `flex: 1`, `minHeight: 0`, and a column flex layout.
`CustomizableTable` receives a flex-filling `wrapperProps` value and a `tableContainerProps` value with `height: 100%`.
The table container owns vertical and horizontal scrolling.
The browser document must not gain a horizontal scrollbar because a table is wide.

Do not use `calc(100vh - ...)`, fixed desktop `maxHeight` values, or arbitrary desktop minimum heights to imitate the available layout height.
A mobile-only practical minimum height is allowed when the surrounding mobile layout scrolls naturally.
A bounded table is allowed only when it is an embedded preview, import result, comparison, or history inside a larger task.
The component and its tests must make that embedded-table exception explicit.

Use one primary `CustomizableTable` per table workspace.
If two record sets are both primary, separate them with URL-backed tabs or routes.
Keep domain filters outside the table toolbar.
Keep global search, column visibility, density, export, and full-screen controls inside the shared table.
Use a sticky right-side actions column when row actions would otherwise scroll out of view.

## Table behavior

The shared table owns its toolbar, active filter chips, sticky header, body loading state, empty state, pagination, and scroll container.
Every table has a contextual accessible name that identifies its records.
Initial table loading uses table-shaped skeleton rows through `isLoading`.
Server refetches retain the current rows when safe and add a thin labelled progress indicator.
Changing a filter, search term, sort, or page must not reset unrelated user context.
Server-side pagination, sorting, search, and filtering must be used when the result set can grow beyond a bounded client-safe size.
The backend remains the authority for tenant isolation, permission checks, and sensitive filters.

Column labels use short, specific language.
Cells must handle long names and identifiers without breaking the page width.
Dates, times, currency, counts, and statuses use shared formatters.
Missing values use one agreed neutral representation.
Status chips use the same label and color for the same domain state.
Row actions use specific accessible names such as `Edit Spring admission cycle`, not repeated generic names such as `Edit`.
An interactive row must expose a real link or button and an equivalent keyboard action.

## Tabs, views, and navigation state

Tabs represent peer content areas within one stable context.
Use a pure shared tab primitive and preserve the page header and tab row while the active panel changes.
Tabs that change meaningful page content must use normal link semantics and URL-backed state.
Report views, board or list modes, paging, sorting, meaningful filters, the selected admission year, and other shareable state must survive reload and browser navigation.
Local or session storage is appropriate only for personal display preferences such as density or column visibility.
Temporary dialog tabs and unsaved form interaction may remain local state.

A route or tab link must support open-in-new-tab and modifier-click behavior.
The active tab must have a corresponding tab panel relationship.
Back and forward navigation must restore the visible state without a second competing state store.
Dirty-state protection must be implemented once at the owning workspace boundary.
The shared tab primitive must not own global confirmation behavior.

## Settings navigation and decisions

Settings navigation describes user tasks, not implementation buckets.
Use the shared URL-backed task navigator for peer settings areas so each option has a clear name, outcome-focused description, and recognizable icon.
Do not stack a second local tab switcher under a broad top-level option when the nested areas are themselves durable settings destinations.
Flatten those peer areas into the owning task navigator, as with Inquiry Sources and Inquiry Types or Registration Forms and Form Numbering.
Use a stepper only when the user must complete a genuinely ordered creation or publishing flow.

Keep breadcrumbs informational.
Place a context-sensitive action such as Start Setup, Save Draft, Publish, or Close beside the record or academic-year status it affects, not in the breadcrumb row.
Use a concise context surface to show the selected year, lifecycle status, consequence, and next action together.

Use decision cards instead of compact toggle tabs when a setting changes business behavior.
Each decision must explain its consequence, identify a safe recommendation when one exists, and remain usable with a keyboard and screen reader.
Show a workflow preview when the decision affects downstream handoffs or gates.
Show scoring presets and representative outcome previews before exposing individual numeric weights.
Group advanced numeric controls by purpose instead of rendering an unexplained wall of fields.

Long policy and template editors use the shared right-side editor drawer.
The drawer owns a stable title, concise description, ordered stepper, scrollable body, and sticky action footer.
It becomes full width on small screens and keeps the underlying list in context on desktop.

## Loading contract

Choose a loader that matches the scope of work.

| Scope                                                | Required treatment                                                 |
| ---------------------------------------------------- | ------------------------------------------------------------------ |
| Authentication, permission, or application bootstrap | `SplashScreen`                                                     |
| Lazy route or major tab panel                        | Keep the shell visible and render a stable content-shaped skeleton |
| First table request                                  | `CustomizableTable` skeleton rows                                  |
| Table refetch                                        | Retain safe rows and show a thin labelled progress indicator       |
| Dashboard request                                    | Card and chart skeletons that preserve final geometry              |
| Button or row mutation                               | Loading state on the initiating control                            |
| Background refresh                                   | Non-blocking status near the affected content                      |

A loader must not replace breadcrumbs, page actions, tabs, or filters that are already known.
Loading, empty, error, and permission states must occupy stable geometry to prevent layout jumps.
Progress indicators need an accessible name when their context is not already announced.
Avoid overlapping full-screen and panel-level loaders for the same request.

## Empty, error, permission, and integration states

An empty state explains what is empty, why that may be expected, and the next available action.
A stateful region resolves mutually exclusive states in this order: initial loading, blocking error, empty result, then content.
A filtered empty state offers a clear-filters action.
A recoverable error preserves the page context and offers retry.
A permission state identifies the unavailable capability without exposing protected data.
An unavailable external integration distinguishes configuration, temporary outage, and unsupported behavior.
Do not render a blank card, an endless loader, or a disabled control without an explanation.

## Forms, setup flows, dialogs, and drawers

Form labels stay visible and are not replaced by placeholder-only instructions.
Required fields, validation timing, and error copy remain consistent across related forms.
Validation errors appear near the field and the first invalid field is announced or focused after submission.
Critical multi-record writes use a backend transaction or an explicit recovery design.
Unsaved changes are protected at the owning route or workspace boundary.

Dialogs are for short, focused decisions or edits.
Long forms and multi-step tasks use a page or a full-height drawer.
Drawers use full width on small screens and a bounded width on desktop.
Destructive actions name the affected record and require a clear confirmation.
Avoid automatic focus on mobile unless it is necessary for an immediate confirmation task.

## Responsive behavior

Design and validate at 390 by 844, 768 by 1024, and 1440 by 900 pixels.
Primary actions remain reachable without precision tapping.
Touch targets are at least 44 by 44 CSS pixels unless a documented platform convention requires otherwise.
Filter grids collapse to one column on small screens.
Tab rows may scroll horizontally inside their own container.
Dense table columns may scroll horizontally, but the page itself must not.
Drawers become full width on small screens.
Dialogs and forms must not force document-level horizontal scrolling.

## Accessibility and interaction

Use native buttons, links, inputs, table semantics, and headings before adding custom interaction roles.
Every icon-only action has a specific accessible name.
Every focusable control has a visible `:focus-visible` treatment.
Do not remove focus outlines without providing an equally visible replacement.
Sortable headers expose their sort direction with `aria-sort`.
Expandable rows expose a specific label and `aria-expanded`.
Tabs expose tab and tab panel relationships.
Async regions expose an appropriate busy state without repeatedly interrupting screen-reader users.
Animations respect reduced-motion preferences.
Avoid `transition: all`.

Keyboard users must be able to reach every action in logical visual order.
Hover-only information must also be available through focus or persistent text.
Color is never the only way to communicate state.
Text and controls must meet the project's contrast requirements in light and dark themes.

## Copy and formatting

Use school-facing language and the same visible term for the same concept.
Buttons begin with a clear verb.
Headings use sentence case unless a proper noun requires otherwise.
Descriptions are concise and explain outcomes rather than implementation.
Errors state what failed and what the user can do next.
Do not expose raw server exceptions, internal identifiers, or permission names in user-facing copy.

Use shared `Intl`-based formatters for dates, times, currency, and numbers.
Do not call `toLocaleDateString` or `toLocaleString` directly throughout feature components.
Display the relevant time zone when a time could affect a deadline, audit, or school operation.

## Performance and state management

Avoid duplicate API requests for the same page context.
Debounce server search and cancel or ignore stale responses.
Keep query arguments stable and make cache invalidation specific.
Virtualize or paginate data that can grow beyond a safe rendered row count.
Do not compute expensive column or row projections during every render.
Lazy loading must preserve the surrounding layout and must not create a full-screen flash during normal in-module navigation.

## Validation requirements

Meaningful UI changes require behavior-focused component tests and browser validation.
Do not rely only on source-text assertions such as checking whether a file contains a component name.
Component tests cover loading, loaded, empty, error, permissions, keyboard interaction, URL round trips, and retry behavior where applicable.
Table workspace tests verify the flex-height chain and distinguish primary tables from documented embedded tables.
Browser tests verify the three standard viewports, retained headers during slow loading, no document-level horizontal overflow, and usable table scrolling.
Browser tests verify deep links, reloads, back and forward navigation, and modifier-click navigation.
Accessibility checks cover names, roles, focus visibility, sort state, expansion state, tabs, and reduced motion.

Run focused automated checks before the final browser smoke test.
Perform the final visible workflow confirmation in the Codex in-app browser when the local authenticated environment is available.
Record the exact validation command and result.
If authentication, permissions, seed data, or an external service blocks a check, record that boundary without treating it as a confirmed product defect.

## Review checklist

- The page has one clear type and one primary task.
- The page title, breadcrumbs, description, and primary action follow the shared header pattern.
- A table-first page fills the available desktop height through an unbroken flex chain.
- The table, not the document, owns data scrolling.
- Page tabs and durable views are URL-backed and reload safely.
- Loading preserves known navigation and content geometry.
- Empty, error, permission, and integration states are explicit.
- All icon-only and repeated row actions have specific accessible names.
- Focus remains visible and interaction works with keyboard and touch.
- Long content and the three standard viewports do not cause page overflow.
- Shared formatters, components, and state serializers are used.
- Behavior-focused automated checks and final browser evidence match the changed risk.
