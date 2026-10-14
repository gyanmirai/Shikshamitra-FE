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

| Concern                                      | Current reference                                                                   |
| -------------------------------------------- | ----------------------------------------------------------------------------------- |
| Full-height table workspace                  | `src/screens/classManagement/assignElectiveSubject/index.tsx`                       |
| Persistent tab workspace                     | `src/screens/hr/policies/HRPolicyWorkspace.tsx`                                     |
| Compact icon tab workspace                   | `src/screens/academic/course-management/lessonPlan/LessonPlanScreen.tsx`            |
| Shared table                                 | `src/components/customizabaleTable/index.tsx`                                       |

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
Contained page-header rows, including filter/action and status-tab rows, use one spacing unit of horizontal padding (`px: 1`); keep vertical padding aligned to the controls.
Repeated actions use the same label, icon, order, and placement across related pages.

Do not add a second page title inside the primary card.
Do not place explanatory cards above a primary table when concise helper text or an information action is sufficient.
Use progressive disclosure for advanced guidance and infrequent settings.

### Module-family header consistency

Every page in the same module family must use the same `CustomBreadcrumbs` layout, module-root label, route hierarchy, description treatment, and action placement.
A dashboard is not an exception to its module family header pattern.
Do not switch between `inline` and `stacked`, reverse the breadcrumb hierarchy, or replace the shared description treatment only because the page content changes from a table to dashboard cards.

The HR module uses the inline `CustomBreadcrumbs` pattern demonstrated by `src/screens/hr/employee/employee.tsx` and `src/screens/hr/employee-onboarding/index.tsx`.
Use `HR/Staff` as the first breadcrumb item and link it to `hrPaths.dashboard` on HR descendant pages.
End with the current page as a non-link item, such as `HR Dashboard`, `Employee List`, or `Employee Onboarding`.
Keep the page action in the breadcrumb header and place dashboard freshness or operational status immediately after the header.
Use `hrPaths` constants instead of literal HR routes.

## Strict screen ordering and table height

- Always render `CustomBreadcrumbs` as the first visible content in the screen body, at the top of the page, before filters, tabs, cards, tables, charts, forms, or dialogs.
- The breadcrumb must provide the page heading, meaningful `description`, real route links, and the appropriate page action or back behavior according to the Breadcrumb rules below.
- Do not place a filter panel, alert, summary card, tab row, loading state, or table above the breadcrumb.
- On a table-first screen, the layout must use a vertical flex chain: the breadcrumb/header remains at its natural height, optional context controls follow it, and the table wrapper fills all remaining available screen space.
- The table wrapper and every flex parent between the screen root and `CustomizableTable` must use `minHeight: 0`; the table region must use `flex: 1` and `overflow: hidden` so the table owns scrolling.
- `CustomizableTable` must fill the remaining height instead of using a fixed arbitrary height, leaving unused blank space, or pushing the page into document-level scrolling.
- Do not use `calc(100vh - ...)`, fixed desktop `maxHeight`, or arbitrary minimum heights to imitate the available space. Use the shared shell’s available height and the documented flex-height pattern.
- Mobile layouts may scroll naturally, but they must preserve the breadcrumb at the top of the content order and must not create horizontal document overflow.

**Required table-screen shape**

```tsx
<Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0 }}>
  <CustomBreadcrumbs
    heading="Records"
    description="Review and manage records for this module."
    links={[{ name: 'Module', href: modulePaths.dashboard }, { name: 'Records' }]}
  />
  <FilterPanel />
  <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
    <CustomizableTable
      wrapperProps={{ sx: { height: 1 } }}
      tableContainerProps={{ sx: { height: 1 } }}
      {...tableProps}
    />
  </Box>
</Box>
```

## Common implementation rules

These rules apply to every new screen, component, route, form, table, dialog, drawer, and API workflow.

### Use MUI and shared components first

- Use the existing shared ShikshaMitra component when one exists; follow its numbered component rule in this document.
- When no project-specific component exists, use the appropriate MUI component from the installed MUI package instead of building an equivalent component from raw HTML, ad-hoc CSS, or a new local primitive.
- Prefer MUI layout and interaction primitives such as `Box`, `Stack`, `Grid`, `Container`, `Paper`, `Typography`, `Button`, `Dialog`, `Drawer`, `Tabs`, `Table`, `TextField`, `Select`, and `Tooltip` according to the use case.
- Preserve the theme defaults and accessibility behavior of MUI components. Extend with `sx`, `slotProps`, or a documented shared wrapper only when necessary.
- Do not introduce another dependency or copy a large third-party component when MUI or an existing shared component already solves the requirement.

### Use theme colors and tokens

- Always use the configured theme colors and semantic palette tokens such as `primary`, `secondary`, `success`, `warning`, `error`, `info`, `text`, `background`, `divider`, and `action`.
- Prefer MUI token values such as `color: 'primary.main'`, `bgcolor: 'background.paper'`, `borderColor: 'divider'`, or `theme.vars.palette.*` when a CSS value must be computed.
- Do not hardcode hex, RGB, named colors, or one-off status colors in feature screens or shared components.
- Do not use color as the only status signal; pair it with a `Label`, text, icon, or accessible state.
- For transparency, use the theme channel helpers such as `varAlpha` with the theme palette instead of hardcoded rgba values.
- Keep status-to-color mappings consistent across tables, charts, cards, forms, and dialogs.
- If a new semantic color is genuinely required, add it to the theme contract first and document its meaning before using it in a feature.

### Send date-time payloads as `DateTimeOffset`

- Whenever an API payload contains a date and time, send a `DateTimeOffset`-compatible ISO 8601 string with an explicit offset or UTC marker, for example `2026-08-12T10:30:00+05:30` or `2026-08-12T05:00:00.000Z`.
- Do not send JavaScript `Date` objects, localized strings, display-formatted values such as `12/08/2026`, or timezone-less date-time strings in API payloads.
- Convert picker values at the payload boundary, not while rendering the field, so the form value and displayed value remain predictable.
- Preserve the user’s intended timezone for school operations; use UTC only when the API contract explicitly expects UTC or the value represents an absolute instant.
- Use the existing date utilities or established module serializer, such as the project’s `toDateTimeOffset` pattern, rather than duplicating timezone conversion logic.
- Keep date-only fields date-only when the API contract requires a calendar date; do not add a time or offset to a date-only contract.
- Test the serialized value, offset/UTC behavior, null handling, and round-trip display for every new date-time payload.

**Preferred payload boundary**

```ts
const toDateTimeOffset = (value: Dayjs | null) =>
  value && value.isValid() ? value.toISOString() : null;

const payload = {
  startDateTime: toDateTimeOffset(formik.values.startDateTime),
};
```

### Use Minimal UI as the fallback component reference

When the repository does not contain a suitable shared component or MUI composition, consult the Minimal UI component catalog:
[https://minimals.cc/components](https://minimals.cc/components).

- Search the catalog for the closest established component pattern before designing a new one.
- Reuse the project’s existing MUI/theme implementation and adapt the Minimal UI pattern to this repository; do not paste an entire template or introduce unrelated Minimal UI dependencies.
- Preserve the project’s routing, permissions, Formik/Yup, Redux, spacing, theme color, accessibility, and responsive rules when adapting the reference.
- Check whether the needed component should become a shared component under `src/components/` before implementing it locally in a screen.
- Record the selected Minimal UI reference in the implementation PR or task notes when the design materially follows it.
- After implementation, add the component’s source path and configuration rules to the relevant numbered entry in this document.

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
Use the compact icon-tab treatment for primary workspace tabs: place the tab list in one full-width contained surface, use a short leading icon that reinforces each label, and make the selected state immediately distinguishable through color and contrast.
Keep the control visually compact while preserving a minimum 44 px touch target, visible keyboard focus, readable labels, and contained horizontal scrolling on narrow screens.
Do not use icons without text for primary workspace navigation, and do not choose decorative or ambiguous icons.
Tabs that change meaningful page content must use normal link semantics and URL-backed state.
Report views, board or list modes, paging, sorting, meaningful filters, the selected admission year, and other shareable state must survive reload and browser navigation.
Local or session storage is appropriate only for personal display preferences such as density or column visibility.
Temporary dialog tabs and unsaved form interaction may remain local state.

A route or tab link must support open-in-new-tab and modifier-click behavior.
The active tab must have a corresponding tab panel relationship.
Back and forward navigation must restore the visible state without a second competing state store.
Dirty-state protection must be implemented once at the owning workspace boundary.
The shared tab primitive must not own global confirmation behavior.

An exclusive domain filter may reuse the compact icon-tab visual treatment, but it must retain button or radio semantics rather than claiming `tab` semantics.
Give the group a visible domain label such as Registration Stage or Activation Stage, expose one unmistakable selected state, and keep the selection in the same URL-backed filter contract as the rest of the workspace.

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

Use dedicated pages for complex template configuration that requires comparing interdependent settings.
Salary Template create, edit, and view pages use one continuous form with Basic Information beside compact Statutory Defaults in a two-to-one desktop layout.
Use 24 px field-row spacing, 16 px column spacing, and persistent labels in Basic Information.
Use one salary-basis selector with Monthly cost to school (CTC) as the new-template default and Monthly salary as the alternative.
Derive the compensation target from this selection; do not add a separate protection selector or comparison dialog.
Use the chosen basis as the amount label, without routine helper text.
Show the calculated breakdown in the existing calculation section before saving.
Stretch the desktop top cards to equal content-driven heights, with matching padding and aligned headings and dividers.
Place equal-width, separately enclosed Earnings and Deductions panels below, followed by full-width Sample Calculation.
Desktop component panels are 480 px high with stationary headers and independently scrolling lists.
Stack sections with natural heights on tablet and mobile, retain page scrolling to calculation results, and keep the action footer visible.
Keep essential statutory guidance visible and expose longer explanations through a keyboard-accessible disclosure.
Reveal invalid or newly added rows inside their component list before focusing them.
Use SectionCard headers for section titles and Add actions without component-count badges, and subtle separators between component rows.
Use a subtle success-green header divider for Earnings and warning-amber for Deductions; retain neutral panel surfaces and explicit section labels.
These accents distinguish component categories and do not represent validation status.
The footer shows preview validity, Preview Calculation navigation, and the save action, which requires a current successful server preview.
Use compact component rows with the name and calculation summary beside the value and expand action.
Omit Ordinary from row summaries and use inline text for meaningful purposes instead of purpose chips.
Allow long names and mobile controls to wrap, and keep advanced settings expandable.
Use the shared right-side editor drawer for focused edits and policy workflows that benefit from retaining list context.
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
Standard labeled application buttons use the compact theme convention in [10. Button](#10-button): their visible height remains 30 px.
Do not apply the general touch-target rule as a local 44 px minimum height on these buttons.
Keep adequate spacing around compact controls; icon-only controls retain their accessible touch targets.
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
Buttons begin with a clear verb. On matching settings creation pages, a leading
plus icon may stand for `Add` with an object-only visible label; give that
button an action-specific accessible name.
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

## Route creation and navigation configuration

Use this section whenever adding a new page, feature route, or sidebar entry.
The route configuration is intentionally split between the shared module roots, module constants, the Next.js App Router, and the screen implementation.
Configure the route in the constants layer first, then create the App Router entry and screen.

### Route source map

| Responsibility                | Source path                                                          | What belongs there                                                                                 |
| ----------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Module root path              | `src/routes/paths.ts`                                                | One stable root path per module, such as `transportPath = '/transport'`.                           |
| Feature paths and permissions | `src/constants/<module>-menu.ts`                                     | Feature URLs, nested path objects, permission names, menu labels, icons, and navigation hierarchy. |
| Sidebar registration          | `src/layouts/config-nav-dashboard.tsx`                               | Import the module constant and connect its root path to the main module navigation.                |
| Route entry                   | `src/app/(auth-route)/<module>/<feature>/page.tsx`                   | Thin page adapter that imports and renders the owning screen.                                      |
| Route protection              | `src/app/(auth-route)/<module>/<feature>/layout.tsx`                 | Feature-level permission guard or route-specific layout when required.                             |
| Screen implementation         | `src/screens/<module>/<Feature>/`                                    | Page UI, component composition, hooks, state, tables, forms, and workflow behavior.                |
| Breadcrumb links              | Owning file under `src/screens/<module>/`                            | Use the same configured path constant; never duplicate a literal route when a constant exists.     |
| Route helpers                 | `src/routes/paths.ts`, `src/routes/hooks/`, `src/routes/components/` | Shared route constants, pathname/params/router hooks, and link adapters.                           |

### Numbered route creation workflow

#### 01. Decide the URL and ownership

Choose the owning module, feature name, URL segment, and permission before creating files.
Follow the module’s existing casing and URL convention. For example, Transport currently uses paths such as `/transport/vehicle-management` and `/transport/stopManagement`; do not introduce a second naming convention inside the same module without an explicit migration decision.

Define:

```text
Module:       Transport
Feature:      Vehicle Management
URL:          /transport/vehicle-management
Permission:   ShikshaMitra.Transport.VehicleManagement
Screen:       src/screens/transport/VehicleManagements/
Route entry:  src/app/(auth-route)/transport/vehicle-management/page.tsx
```

#### 02. Add or reuse the module root in `src/routes/paths.ts`

Only add a new root constant when the module itself is new. Reuse the existing root for a new feature inside an existing module.

```ts
// src/routes/paths.ts
export const transportPath = '/transport';
```

Do not place every feature URL in `src/routes/paths.ts` when the module already owns a constants file. Keep feature paths grouped with that module’s menu and permissions.

#### 03. Configure the feature first in `src/constants/<module>-menu.ts`

Add the feature path, permission, and menu item before creating the page route. Use the existing module file as the source of truth.

```ts
// src/constants/transport-menu.ts
import { transportPath } from 'src/routes/paths';
import menuIconView from './icon-view';

export const transportPaths = {
  dashboard: '/transport/dashboard',
  vehicleManagement: '/transport/vehicle-management',
  newFeature: '/transport/new-feature',
};

export const transportPermissions = {
  vehicleManagement: 'ShikshaMitra.Transport.VehicleManagement',
  newFeature: 'ShikshaMitra.Transport.NewFeature',
};

const transportModule = {
  [transportPath]: [
    {
      subheader: '',
      items: [
        {
          title: 'New Feature',
          path: transportPaths.newFeature,
          _action: 'new-feature',
          permissionName: transportPermissions.newFeature,
          icon: menuIconView('mdi:view-dashboard-outline'),
        },
      ],
    },
  ],
};

export default transportModule;
```

Rules for the constants file:

- Keep the feature URL in the module’s `<module>Paths` object and reuse it everywhere else.
- Add the matching permission in `<module>Permissions`; frontend visibility is not a substitute for backend authorization.
- Add the menu item under the correct module hierarchy with the real `title`, `path`, `_action`, `permissionName`, and an `mdi:` icon.
- Preserve the module’s existing shortcut-key and child-menu conventions when the module uses them.
- Do not use `'#'`, empty paths, guessed paths, or a duplicated string literal for a production route.
- Keep the existing file spelling, including legacy names such as `comminication-menu.ts` where applicable.

#### 04. Register a new module in `src/layouts/config-nav-dashboard.tsx`

This step is required only when adding a new top-level module. A new feature inside an already registered module normally needs no new top-level registration.

```tsx
// src/layouts/config-nav-dashboard.tsx
import newModule, {
  newModulePaths,
  newModulePermissions,
} from 'src/constants/new-module-menu';
import { newModulePath } from 'src/routes/paths';

// Inside navData(...), add the module item:
{
  title: 'New Module',
  path: newModulePaths.dashboard,
  icon: ICONS.newModule,
  _action: 'new-module',
  visibility: visibility[12],
  submodule: newModule[newModulePath].flatMap((list) => list.items),
  permissionName: newModulePermissions.root,
}
```

Add the module import, root path import, icon, visibility position, and permission consistently with the surrounding modules. Do not register a feature twice in both the module constant and a separate local navigation array.

#### 05. Create the App Router entry under `src/app/(auth-route)/`

The folder path creates the URL. Route groups such as `(auth-route)` do not appear in the browser URL.
Use a thin `page.tsx` adapter and keep the actual UI in `src/screens/`.

```tsx
// src/app/(auth-route)/transport/new-feature/page.tsx
import NewFeatureScreen from 'src/screens/transport/NewFeature';

const TransportNewFeaturePage = () => <NewFeatureScreen />;

export default TransportNewFeaturePage;
```

For protected features, add or reuse a colocated layout guard:

```tsx
// src/app/(auth-route)/transport/new-feature/layout.tsx
import StudentPermissionGuard from 'src/components/student-permission-guard';
import { transportPermissions } from 'src/constants/transport-menu';

const NewFeatureLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={transportPermissions.newFeature}>
    {children}
  </StudentPermissionGuard>
);

export default NewFeatureLayout;
```

Rules for route files:

- Use `page.tsx` for the route entry and export one page component as default.
- Keep route adapters thin; do not place table, form, API, or business workflow logic in `page.tsx`.
- Use `layout.tsx` for a route-specific permission guard or layout concern, not for feature state.
- Use the authenticated route group for signed-in screens and the existing normal/public groups for their respective flows.
- Use dynamic segments such as `[id]` only when the URL contract requires a path parameter; use the existing `useParams` route hook to read it.
- Add `loading.tsx`, `error.tsx`, or `not-found.tsx` only when the feature needs route-level handling beyond the shared shell.

#### 06. Create the owning screen under `src/screens/`

Create the feature screen in the owning module and compose the documented shared components.
For a list screen, the normal structure is a breadcrumb, optional FilterPanel, table, loading/empty/error states, and dialogs or drawers owned by the screen.

```tsx
// src/screens/transport/NewFeature/index.tsx
'use client';

import { transportPaths } from 'src/constants/transport-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

export default function NewFeatureScreen() {
  return (
    <>
      <CustomBreadcrumbs
        heading="New Feature"
        description="Manage the records and actions for this feature."
        links={[{ name: 'Transport', href: transportPaths.dashboard }, { name: 'New Feature' }]}
      />
      {/* Compose the required table, filters, forms, dialogs, and feedback states here. */}
    </>
  );
}
```

Use the component rules in this document for `CustomBreadcrumbs`, `CustomizableTable`, Formik/Yup, dialogs, hooks, Redux, toast, spacing, and responsive behavior.
Do not add page spacing inside `CustomBreadcrumbs`; apply page-level layout through the established screen shell.

#### 07. Use the configured path everywhere

The path constant is the single source of truth for navigation:

```tsx
import { transportPaths } from 'src/constants/transport-menu';
import { useRouter } from 'src/routes/hooks';

const router = useRouter();
router.push(transportPaths.newFeature);
```

Use the same constant for menu items, `CustomBreadcrumbs`, cards, table actions, redirects, `router.push`, `router.replace`, `Link`, and tests. Do not duplicate `/transport/new-feature` in screens or components.

#### 08. Validate the complete route contract

- Confirm the URL folder and configured constant resolve to exactly the same browser path.
- Confirm the feature appears in the correct module menu and is hidden or shown according to permission and visibility rules.
- Confirm unauthorized users cannot access the route by typing the URL directly.
- Confirm the page renders through the correct authenticated/public layout.
- Confirm breadcrumbs, cards, table actions, redirects, and back actions use the configured path constant.
- Confirm loading, empty, error, responsive, keyboard, and document-level overflow behavior.
- Add or update focused tests for the menu configuration, permission mapping, route screen, and important user workflow.
- Run `git diff --check` and the focused frontend checks appropriate to the changed route.

### Route naming and anti-patterns

| Prefer                                                     | Avoid                                                                        |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `transportPaths.newFeature`                                | Repeating `'/transport/new-feature'` throughout the codebase                 |
| `src/app/(auth-route)/transport/new-feature/page.tsx`      | Putting a feature page only under `src/screens/` without an App Router entry |
| A thin route adapter plus a screen component               | Implementing the whole page inside `page.tsx`                                |
| Module constants first, then route files                   | Creating a route before defining its path and permission                     |
| `StudentPermissionGuard` or the module’s established guard | Relying on hidden menu items as authorization                                |
| `src/routes/hooks` and `RouterLink`/existing route helpers | Calling `window.location` for internal navigation                            |
| Existing module casing and URL conventions                 | Mixing kebab-case, camelCase, and arbitrary spellings in one module          |

## Shared component design system

This section is the canonical contract for reusable components in `src/components/`.
Feature screens should compose these primitives instead of creating near-duplicate local versions.
Each component entry is intentionally structured so its detailed configuration and module-specific rules can be extended without changing the document shape.

### Numbered component index

Use this index to find the rule section and source implementation quickly.
The spelling in the `Source path` column is the repository’s current path and must be preserved in imports.

| No. | Component                        | Rule section                                                   | Source path                                                                                                                                |
| --: | -------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
|  01 | Breadcrumb / `CustomBreadcrumbs` | [01. Breadcrumb](#01-breadcrumb)                               | `src/components/custom-breadcrumbs/`                                                                                                       |
|  02 | FilterPanel pattern              | [02. FilterPanel](#02-filterpanel-pattern)                     | Feature-owned; reference `src/screens/hr/i-card/index.tsx`                                                                                 |
|  03 | Tabs                             | [03. Tabs and CustomTabs](#03-tabs-and-customtabs)             | `src/theme/core/components/tabs.tsx` and `src/hooks/use-tabs.ts`                                                                           |
|  04 | CustomTabs                       | [03. Tabs and CustomTabs](#03-tabs-and-customtabs)             | `src/components/custom-tabs/`                                                                                                              |
|  05 | ThreeDotsActions                 | [04. Table family](#04-table-family)                           | `src/components/three-dots-actions/`                                                                                                       |
|  06 | Label                            | [04. Table family](#04-table-family)                           | `src/components/label/`                                                                                                                    |
|  07 | CustomizableTable                | [04. Table family](#04-table-family)                           | `src/components/customizabaleTable/`                                                                                                       |
|  08 | ConfirmDialog                    | [05. Dialog family](#05-dialog-family)                         | `src/components/confirm-dialog/`                                                                                                           |
|  09 | BackPopUpChecked                 | [05. Dialog family](#05-dialog-family)                         | `src/components/back-popup-check/`                                                                                                         |
|  10 | DeleteConfirmationDialog         | [05. Dialog family](#05-dialog-family)                         | `src/components/delete-confirmation/`                                                                                                      |
|  11 | CustomSelect                     | [06. Forms, Formik, and Yup](#06-forms-formik-and-yup)         | `src/components/custom-select/`                                                                                                            |
|  12 | ShakingTextField                 | [06. Forms, Formik, and Yup](#06-forms-formik-and-yup)         | `src/components/shaking-text-field/`                                                                                                       |
|  13 | NumericFormatCustom              | [06. Forms, Formik, and Yup](#06-forms-formik-and-yup)         | `src/components/custom-numeric-format/`                                                                                                    |
|  14 | OtpInputField                    | [06. Forms, Formik, and Yup](#06-forms-formik-and-yup)         | `src/components/otp-input-field/`                                                                                                          |
|  15 | PaginatedSearchSelect            | [06. Forms, Formik, and Yup](#06-forms-formik-and-yup)         | `src/components/paginated-search-select/`                                                                                                  |
|  16 | StandardAddress                  | [06. Forms, Formik, and Yup](#06-forms-formik-and-yup)         | `src/components/stardard-address/`                                                                                                         |
|  17 | CustomDateRangePicker            | [06. Forms, Formik, and Yup](#06-forms-formik-and-yup)         | `src/components/custom-date-range-picker/`                                                                                                 |
|  18 | AcademicDatePicker               | [06. Forms, Formik, and Yup](#06-forms-formik-and-yup)         | `src/components/academic-date-picker/`                                                                                                     |
|  19 | CustomStepperWithFormik          | [07. Stepper with Formik](#07-stepper-with-formik)             | `src/components/custom-stepper/`                                                                                                           |
|  20 | SectionCard                      | [08. SectionCard](#08-sectioncard)                             | Existing implementations; reference `src/screens/hr/employee/employee-form-fields/InformationFields.tsx`                                   |
|  21 | Drawer                           | [09. Drawer](#09-drawer)                                       | `src/theme/core/components/drawer.tsx`, `src/layouts/components/`, and feature drawers                                                     |
|  22 | Button                           | [10. Button](#10-button)                                       | `src/theme/core/components/button.tsx`, `src/components/loading-button/`, `src/components/submit-button/`, `src/components/cancel-button/` |
|  23 | Types                            | [11. Types](#11-types)                                         | Component-local `types.ts` files and shared domain types                                                                                   |
|  24 | Iconify                          | [12. Icons](#12-icons)                                         | `src/components/iconify/`                                                                                                                  |
|  25 | shikshaMitraToast                | [13. Toast](#13-toast)                                         | `src/components/toast/`                                                                                                                    |
|  26 | CustomUpload                     | [14. Upload](#14-upload)                                       | `src/components/custom-upload/`                                                                                                            |
|  27 | EmptyContent                     | [15. EmptyContent](#15-emptycontent)                           | `src/components/empty-content/`                                                                                                            |
|  28 | CustomTooltip                    | [16. Tooltip](#16-tooltip)                                     | `src/components/custom-tooltip/`                                                                                                           |
|  29 | CustomAccordion                  | [17. Accordion](#17-accordion)                                 | `src/components/custom-accordian/`                                                                                                         |
|  30 | Editor                           | [18. Editor](#18-editor)                                       | `src/components/editor/`                                                                                                                   |
|  31 | Scrollbar                        | [19. Scrollbar](#19-scrollbar)                                 | `src/components/scrollbar/`                                                                                                                |
|  32 | Hooks                            | [20. Hooks](#20-hooks)                                         | `src/hooks/`                                                                                                                               |
|  33 | CommonCalender                   | [21. Calendar](#21-calendar)                                   | `src/components/calender/`                                                                                                                 |
|  34 | Chart                            | [22. Chart](#22-chart)                                         | `src/components/chart/` and `src/components/charts/`                                                                                       |
|  35 | Redux and API integration        | [23. Redux and API integration](#23-redux-and-api-integration) | `src/redux/`                                                                                                                               |
|  36 | Utilities                        | [24. Utilities](#24-utilities)                                 | `src/utils/`                                                                                                                               |

### How to read and extend a component entry

Every component entry must answer the same questions:

| Section             | Required content                                                                         |
| ------------------- | ---------------------------------------------------------------------------------------- |
| Purpose             | What user problem the component solves and when it is appropriate                        |
| Source of truth     | Actual implementation, types, tests, and related theme primitive                         |
| Configuration       | Public props, defaults, controlled state, callbacks, slots, and styling extension points |
| Usage               | Preferred composition, a minimal example, and an anti-pattern example when useful        |
| Rules               | Behavioral, layout, state, data, and ownership constraints                               |
| Accessibility       | Required names, roles, keyboard behavior, focus, announcements, and contrast             |
| Responsive behavior | Narrow-screen, touch, overflow, and desktop behavior                                     |
| Validation          | Required unit, integration, visual, accessibility, and browser checks                    |
| Open decisions      | Rules that are not yet supplied or need product agreement                                |

When adding a rule, place it in the narrowest applicable component entry first.
Promote a rule to the global sections above only when it applies to multiple components or all authenticated pages.
Configuration documents the public interface; it must not become a copy of the implementation.
Backend permissions, tenant isolation, domain invariants, and API contracts remain owned by backend documentation.

### Component inventory and configuration map

The paths below reflect the current shared implementation names, including legacy spellings that must not be silently renamed in documentation or imports.

| Group        | Component                | Source of truth                                                                                                        | Configuration to document                                                                                    |
| ------------ | ------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Navigation   | Breadcrumb               | `src/components/custom-breadcrumbs/`                                                                                   | Links, active item, separator, overflow, responsive display                                                  |
| Navigation   | FilterPanel              | `src/components/filters-result/` and feature filter components                                                         | Filter fields, URL state, reset behavior, result count, layout                                               |
| Navigation   | CustomTabs               | `src/components/custom-tabs/`                                                                                          | Variant, value, change handler, icons, panel composition                                                     |
| Table        | ThreeDotsActions         | `src/components/three-dots-actions/`                                                                                   | Menu items, labels, disabled/hidden state, row context                                                       |
| Table        | Label                    | `src/components/label/`                                                                                                | Text, color/status mapping, size, variant                                                                    |
| Table        | CustomizableTable        | `src/components/customizabaleTable/`                                                                                   | Columns, rows, query state, pagination, sorting, toolbar, sticky columns                                     |
| Dialog       | ConfirmDialog            | `src/components/confirm-dialog/`                                                                                       | Open state, title, content, confirm/cancel actions, loading, severity                                        |
| Dialog       | BackPopUpChecked         | `src/components/back-popup-check/`                                                                                     | Dirty state, navigation interception, confirmation callbacks                                                 |
| Dialog       | DeleteConfirmationDialog | `src/components/delete-confirmation/`                                                                                  | Record identity, destructive copy, confirm loading, close behavior                                           |
| Forms        | CustomSelect             | `src/components/custom-select/`                                                                                        | Options, value shape, multiple mode, labels, errors, disabled state                                          |
| Forms        | ShakingTextField         | `src/components/shaking-text-field/`                                                                                   | Label, value, error, helper text, animation, input props                                                     |
| Forms        | NumericFormatCustom      | `src/components/custom-numeric-format/`                                                                                | Numeric constraints, formatting, precision, empty value, Formik binding                                      |
| Forms        | OtpInputField            | `src/components/otp-input-field/`                                                                                      | Length, value, auto-focus, masking, paste, error state                                                       |
| Forms        | PaginatedSearchSelect    | `src/components/paginated-search-select/`                                                                              | Search, pagination, option mapping, selection mode, loading                                                  |
| Forms        | StandardAddress          | `src/components/stardard-address/`                                                                                     | Address fields, dependent geography, validation, value mapping                                               |
| Forms        | Stepper with Formik      | `src/components/custom-stepper/`                                                                                       | Ordered steps, validation boundary, navigation, submit state                                                 |
| Forms        | SectionCard              | Existing `SectionCard` implementations, primarily `src/screens/hr/employee/employee-form-fields/InformationFields.tsx` | Group related fields, section title, optional header content, loading, and layout                            |
| Overlay      | Drawer                   | `src/theme/core/components/drawer.tsx` and feature drawers                                                             | Anchor, width, full-screen breakpoint, close guard, action footer                                            |
| Actions      | Button                   | `src/theme/core/components/button.tsx` and shared button components                                                    | Variant, intent, loading, icons, disabled state, touch target                                                |
| Contracts    | Types                    | Component-local `types.ts` files and shared domain types                                                               | Naming, required/optional props, generic parameters, value contracts                                         |
| Icons        | Iconify                  | `src/components/iconify/`                                                                                              | Icon name, size, color, accessible label, loading/fallback                                                   |
| Feedback     | shikshaMitraToast        | `src/components/toast/`                                                                                                | Severity, message, duration, action, deduplication, placement                                                |
| Upload       | CustomUpload             | `src/components/custom-upload/` and `src/components/upload/`                                                           | Accepted files, size/count limits, preview, rejection, progress                                              |
| Date         | CustomDateRangePicker    | `src/components/custom-date-range-picker/`                                                                             | Range value, mode, shortcuts, min/max, validation, timezone                                                  |
| Date         | AcademicDatePicker       | `src/components/academic-date-picker/`                                                                                 | Academic calendar rules, blocked days, value serialization                                                   |
| Calendar     | CommonCalender           | `src/components/calender/`                                                                                             | Events, view, date, toolbar, filters, drag/drop, resize, and container layout                                |
| Feedback     | EmptyContent             | `src/components/empty-content/`                                                                                        | Title, explanation, illustration/icon, primary action, density                                               |
| Feedback     | CustomTooltip            | `src/components/custom-tooltip/`                                                                                       | Title, placement, trigger, delay, disabled behavior                                                          |
| Data display | Chart                    | `src/components/chart/` and `src/components/charts/`                                                                   | Type, series, options, theme, loading, empty, resize behavior                                                |
| Disclosure   | CustomAccordion          | `src/components/custom-accordian/`                                                                                     | Expanded state, summary, details, disabled state, nesting                                                    |
| Editing      | Editor                   | `src/components/editor/`                                                                                               | Value, toolbar, extensions, upload behavior, read-only state                                                 |
| Layout       | Scrollbar                | `src/components/scrollbar/`                                                                                            | Scroll owner, axis, height, keyboard access, mobile behavior                                                 |
| State        | Redux                    | `src/redux/`                                                                                                           | Slice ownership, RTK Query service, query args, tags, invalidation                                           |
| Utilities    | Shared utility functions | `src/utils/`                                                                                                           | Formatting, parsing, validation, permissions, serialization, calculations, and reusable data transformations |

### 01. Breadcrumb

**Source of truth**

`CustomBreadcrumbs` is the shared breadcrumb component at `src/components/custom-breadcrumbs/`.
Use this component for page headers, list pages, detail views, create/edit views, and contextual dialog or drawer views that need navigation context.

**Configuration**

| Prop                 | Type                     | Required    | Default     | Rule                                                                                                                            |
| -------------------- | ------------------------ | ----------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `heading`            | `string \| ReactNode`    | Recommended | —           | Use the current page or task name as the visible heading.                                                                       |
| `layout`             | `'inline' \| 'stacked'`  | Optional    | `'inline'`  | Use `stacked` when breadcrumb context must read above a visible title and description; keep existing screens inline by default. |
| `description`        | `ReactNode`              | Yes         | —           | Always provide concise, real information about what the current screen or task does.                                            |
| `links`              | `BreadcrumbsLinkProps[]` | Yes         | —           | Provide the real navigation hierarchy; ancestor items use their actual route path and the current item has no `href`.           |
| `links[].name`       | `string`                 | Recommended | —           | Use the visible product term used by the destination page.                                                                      |
| `links[].href`       | `string`                 | Conditional | —           | Use only for navigable ancestors and use the actual route, such as `/transport/dashboard`.                                      |
| `links[].icon`       | `ReactElement`           | Optional    | —           | Add only when the icon improves recognition and is consistent with the surrounding navigation.                                  |
| `links[].onClick`    | `(event) => void`        | Optional    | —           | Use for an in-page or stateful transition when a normal route link is not the correct behavior.                                 |
| `isBack`             | `boolean`                | Conditional | `false`     | Set to `true` for contextual create, edit, detail, or dialog states that need an explicit return action.                        |
| `onBack`             | `() => void`             | Conditional | no-op       | Pass the real close, cancel, or return handler whenever `isBack` is `true`.                                                     |
| `descriptionDisplay` | `'tooltip' \| 'visible'` | Optional    | `'tooltip'` | Use the default tooltip for short supporting context; use `visible` when the explanation is important to completing the task.   |
| `action`             | `ReactNode`              | Optional    | —           | Place the page-level action here only when it belongs to the header context.                                                    |
| `activeLast`         | `boolean`                | Optional    | —           | Use only when the final breadcrumb must retain link behavior; otherwise keep the current page non-navigable.                    |
| `showDivider`        | `boolean`                | Optional    | `false`     | Use only when the owning design explicitly requires a divider; do not introduce it for spacing.                                 |
| `sx` / `slotProps`   | MUI styling props        | Optional    | —           | Do not use these to add margin, padding, gaps, or page spacing.                                                                 |

**Preferred usage**

Use real route links for the navigable ancestors and leave the current page as the final name-only link.
The following example uses routes already present in the frontend:

```tsx
<CustomBreadcrumbs
  heading="Transport Staff Management"
  description="View and manage registered drivers and conductors for transportation services."
  links={[
    { name: 'Transport', href: '/transport/dashboard' },
    { name: 'Transport Staff Management' },
  ]}
/>
```

For a contextual detail or edit state, keep the hierarchy and add an explicit back action:

```tsx
<CustomBreadcrumbs
  heading="Vehicle Details"
  description="Review the selected vehicle’s specifications, documents, and current status."
  isBack
  onBack={handleViewClose}
  links={[
    { name: 'Transport', href: '/transport/dashboard' },
    { name: 'Vehicle Management', href: '/transport/vehicle-management' },
    { name: 'Vehicle Details' },
  ]}
/>
```

**Rules**

- Always use `CustomBreadcrumbs` from `src/components/custom-breadcrumbs`; do not recreate the breadcrumb header with MUI `Breadcrumbs` in a feature screen.
- Always pass the `description` prop with concise, screen-specific information that explains the page, record, or task.
- Use the opt-in `stacked` layout for dashboards or other pages where a visible description makes the inline title and breadcrumb hierarchy compete.
- Build `links` from the real visible hierarchy and use actual application route paths for navigable ancestors.
- Do not use placeholder routes, guessed paths, `'#'`, or an ancestor label without its route when that ancestor is a real destination.
- Keep the current page, record, or task as the final breadcrumb item without `href` unless there is a deliberate reason to make it navigable.
- Use `isBack` and `onBack` together when the user is inside a create, edit, detail, dialog, drawer, or other contextual state that needs to return to its owner.
- The `onBack` handler must perform the owning workflow’s real close, cancel, navigation, or dirty-state confirmation behavior; the breadcrumb must not invent that state transition.
- Do not set `isBack` on ordinary list or dashboard pages when the normal route hierarchy already provides navigation.
- Do not add margin, padding, gap, or other page spacing through `sx`, `slotProps`, wrapper props, or an extra layout wrapper around `CustomBreadcrumbs`.
- Keep layout spacing in the owning page layout or the shared page shell, not in individual breadcrumb usages.
- Do not use `action` for filters, table controls, or unrelated secondary actions; place those in their owning region.
- Keep the primary page action right-aligned on desktop, tablet, and mobile.
- If a narrow header wraps the action onto another row, align it to the right edge of the header content; never left-align or stretch it to full width.
- Preserve the component’s default responsive breadcrumb overflow and do not create document-level horizontal scrolling.

**Accessibility**

- Use a meaningful `heading` so the page has a clear visible heading hierarchy.
- Keep the back control enabled with `aria-label="Back"` through the shared component when `isBack` is active.
- Use descriptive breadcrumb names; do not rely on icons alone.
- Ensure any custom `onClick` link behavior preserves keyboard activation and does not replace normal route navigation without a valid reason.

**Validation**

- Verify every ancestor link navigates to the intended real route.
- Verify the current breadcrumb is not incorrectly clickable.
- Verify `isBack` invokes the owning close/return behavior and protects unsaved changes where applicable.
- Verify the description is present and meaningful in list, detail, and form states.
- Verify the header remains usable at 390 px, 768 px, and 1440 px without document-level horizontal overflow.
- Measure the primary action at each breakpoint: standard labeled buttons must be 30 px high and aligned to the header content right edge.

### 02. FilterPanel pattern

There is currently no shared `FilterPanel` component.
When a screen needs filters above a table, implement the pattern locally with the existing MUI layout primitives and the appropriate shared field components.
The reference pattern is used in the employee workflow at `src/screens/hr/i-card/index.tsx` immediately before `CustomizableTable`.

**Configuration**

| Concern            | Required configuration                                                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Container          | Use one contained horizontal filter row with the same compact bordered/surface treatment shown in the reference design.                                             |
| Internal spacing   | Use exactly one spacing unit inside the panel: `p: 1` for the panel and `spacing={1}` for the filter row. Do not add nested spacing, ad-hoc margins, or extra gaps. |
| Filter controls    | Use the appropriate existing shared control, such as `CustomSelect`, for each filter. Keep labels visible and specific.                                             |
| Width              | Make controls fill the available row naturally; use a deliberate minimum width only when the control needs one to remain readable.                                  |
| Layout direction   | Use a horizontal row on wider screens and stack controls vertically on narrow screens, for example `direction={{ xs: 'column', sm: 'row' }}`.                       |
| Default option     | Provide an explicit all-records option such as `All Organizations`, `All Groups`, or `All Statuses` when clearing that filter is valid.                             |
| State              | Keep each selected value in the owning screen state, Formik state, URL state, or query state according to the page contract.                                        |
| Table relationship | Render the filter panel directly before the table it controls. Do not place unrelated cards, actions, or explanatory content between the filters and the table.     |

**Preferred usage**

```tsx
<Paper variant="outlined" sx={{ p: 1, borderRadius: 2 }}>
  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
    <CustomSelect
      fullWidth
      label="Organization"
      options={organizationOptions}
      value={organizationFilter}
      onChange={handleOrganizationChange}
    />
    <CustomSelect
      fullWidth
      label="Group"
      options={groupOptions}
      value={groupFilter}
      onChange={handleGroupChange}
    />
    <CustomSelect
      fullWidth
      label="Status"
      options={statusOptions}
      value={statusFilter}
      onChange={handleStatusChange}
    />
  </Stack>
</Paper>

<CustomizableTable {...tableProps} />
```

The option arrays and handlers in the example are screen-owned; use the actual domain options and state names for the feature.

**Rules**

- Do not create a new generic `FilterPanel` component for this pattern unless the project later establishes a shared implementation and contract.
- Match the reference visual pattern: one compact contained surface, outlined controls, visible labels, and a single horizontal filter row on desktop.
- Keep the filter panel immediately before the table that it filters.
- Use exactly one internal spacing unit; do not combine `p: 1` with additional panel padding, child margins, `gap`, or nested `Stack spacing` values.
- Do not add a page title, breadcrumb, toolbar, table search, pagination, or unrelated action inside the filter panel.
- Use the existing shared field components where they fit; do not create one-off select or input styling that diverges from the design system.
- Use explicit `All ...` options when the filter supports showing all records, and map that option to the page’s actual unfiltered query value.
- Reset dependent filters when the selected parent filter invalidates their available options.
- Reset or preserve pagination deliberately when a filter changes; a changed server-side filter normally returns to the first page.
- Keep filter values and table query arguments synchronized so the visible table always represents the selected filters.
- Debounce text search filters and avoid firing duplicate requests for unchanged filter values.
- Use server-side filtering when the result set can grow beyond a safe client-rendered size.
- Do not rely on hiding table rows as a substitute for tenant, permission, or sensitive-data filtering; backend authorization and tenant isolation remain authoritative.
- On mobile, stack the controls in one column and keep the panel and page free from horizontal overflow.

**Validation**

- Verify the filter panel appears directly before the correct table.
- Verify each filter changes the displayed table data and uses the expected query value.
- Verify the all-records option clears the corresponding filter.
- Verify dependent filters reset when their parent selection changes.
- Verify pagination, loading, empty, and error states remain correct after filtering.
- Verify the panel uses one spacing unit and has no nested or ad-hoc spacing.
- Verify the layout at 390 px, 768 px, and 1440 px without document-level horizontal overflow.

### 03. Tabs and CustomTabs

Use `CustomTabs` with the `useTabs` hook for shared tab navigation.
The component source is `src/components/custom-tabs/`, the state hook is `src/hooks/use-tabs.ts`, and the reference implementation is `src/screens/academic/activityManagement/index.tsx`.

**Configuration**

| Concern            | Required configuration                                                                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Tab definitions    | Define tabs as objects with exactly the base shape `{ value, label }`.                                                                          |
| `value`            | Use a stable, unique string identifier such as `'role'` or `'user'`; do not use the visible label as the state contract when labels may change. |
| `label`            | Use the user-facing plural or task label, such as `Roles` or `Users`.                                                                           |
| State              | Initialize `useTabs` with the first valid tab value or the page’s explicit default.                                                             |
| Shared tab control | Render the tab list with `CustomTabs`, passing `value={tabs.value}` and `onChange={tabs.onChange}`.                                             |
| Tab items          | Map the tab definitions to MUI `Tab` elements with `key`, `value`, and `label`.                                                                 |
| Tab content        | Render content from the selected tab value; do not render every panel simultaneously when panels are expensive or stateful.                     |
| Variant            | Use the default variant unless the page layout explicitly requires another supported MUI variant, such as `fullWidth`.                          |
| URL state          | Use URL-backed state when the selected tab is a durable/shareable page view; preserve the same `{ value, label }` definition shape.             |

**Required tab definition**

```tsx
const TABS = [
  { value: 'role', label: 'Roles' },
  { value: 'user', label: 'Users' },
];
```

**Preferred usage**

```tsx
import { Tab } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { useTabs } from 'src/hooks/use-tabs';

const TABS = [
  { value: 'role', label: 'Roles' },
  { value: 'user', label: 'Users' },
];

function AccessManagement() {
  const tabs = useTabs(TABS[0].value);

  return (
    <>
      <CustomTabs value={tabs.value} onChange={tabs.onChange}>
        {TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={tab.label} />
        ))}
      </CustomTabs>

      {tabs.value === 'role' && <RolesPanel />}
      {tabs.value === 'user' && <UsersPanel />}
    </>
  );
}
```

**Rules**

- Always use `CustomTabs` from `src/components/custom-tabs` for this shared tab treatment.
- Always use `useTabs` from `src/hooks/use-tabs` to own local selected-tab state.
- Define tab items in the `{ value: string, label: string }` format; do not use parallel arrays for values and labels.
- Every tab value must be unique, stable, and suitable for state or URL serialization.
- Render each item with `Tab key={tab.value} value={tab.value} label={tab.label}`.
- Keep tab definitions outside the render function when they are static.
- Do not use array indexes as tab keys or tab values.
- The initial value passed to `useTabs` must exist in the tab definitions and must show valid content immediately.
- Keep the selected tab and the visible panel synchronized; a selected tab must never render an unrelated panel.
- Use tabs only for peer content areas within one stable page context; use routes or a stepper for distinct workflows or genuinely ordered tasks.
- Use URL-backed tab state when users need reload, deep-link, browser back/forward, or modifier-click behavior to preserve the selected view.
- If a tab is URL-backed, keep one state owner and synchronize `useTabs` with that route contract; do not maintain competing local and URL values.
- Do not put destructive confirmation logic inside the tab list; the shared `CustomTabs` already coordinates with the existing unsaved-change guard.
- Keep labels visible and understandable; do not use icon-only primary tabs.
- Use `fullWidth` only when all peer tabs should intentionally share the available width, as demonstrated in the Academic activity management reference.
- Use `slotProps` only for deliberate tab styling; do not use it to introduce arbitrary page spacing or change the component’s interaction contract.
- Preserve keyboard navigation, visible focus, selected contrast, and the tab/tab-panel relationship.

**Validation**

- Verify the tab definitions use the exact `{ value, label }` shape.
- Verify the default tab renders valid content on first load.
- Verify selecting each tab changes both the selected state and the visible panel.
- Verify tab values remain correct after reload and browser navigation when the view is URL-backed.
- Verify unsaved-change protection behaves correctly when switching tabs.
- Verify keyboard focus, arrow-key navigation, selected state, and narrow-screen horizontal scrolling.

### 04. Table family

Use `CustomizableTable` from `src/components/customizabaleTable/` for shared data tables.
Use `ThreeDotsActions` from `src/components/three-dots-actions/` for row actions and `Label` from `src/components/label/` for status values.

**Configuration**

| Concern          | Required configuration                                                                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Component        | Use `<CustomizableTable />`; do not create a separate table toolbar, pagination, filter menu, or scroll container when the shared table supports the requirement. |
| `tableId`        | Provide a stable, unique identifier for the table instance.                                                                                                       |
| `tableTitle`     | Provide a meaningful title so the table has a contextual accessible name and export title.                                                                        |
| `columns`        | Define columns with stable `id` values, readable labels, and data shaped for the current view.                                                                    |
| `data`           | Pass view-ready rows; map API records into the exact display shape required by the screen before rendering the table.                                             |
| `filterType`     | Set the default filter type according to the field: `string`, `number`, `date`, `dateTime`, `enum`, or `formattedNumber`.                                         |
| Status column    | Always set `sticky: true`, normally use `stickyPosition: 'right'`, set `filterType: 'enum'` when filterable, and render the value with `Label`.                   |
| Action column    | Always set `sticky: true`, `stickyPosition: 'right'`, `isSort: false`, and `isFilter: false`; always use the shared `ThreeDotsActions` component for its row actions. |
| View destination | Set `ThreeDotsActions.viewHref` for a profile/detail destination with native link semantics; keep `viewLabel` specific to the row. Existing `handleViewClick` consumers remain supported. |
| Direct actions   | Show at most three frequent row actions directly. Use built-in view/edit/delete props first and `directActions` for a feature-specific `mdi:` action; place every remaining action in the three-dot menu. |
| Server-side data | When the API supports server-side pagination, search, sorting, or filtering, enable the corresponding `serverSide*` props and provide the matching callbacks.     |
| Loading          | Pass the API loading state through `isLoading`; retain the table geometry while the request is in progress.                                                       |
| Pagination       | Use server-side pagination for API-backed collections that can grow; pass `totalCount` and handle `onServerPagination`.                                           |

**Field-to-filter mapping**

| Field value                           | `filterType`      | Additional configuration                                                                            |
| ------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------- |
| Name, code, description, free text    | `string`          | Use server-side search/filtering when the dataset is large.                                         |
| Integer, decimal, count, amount       | `number`          | Use `formattedNumber` only when the displayed value contains formatting that needs numeric parsing. |
| Calendar date                         | `date`            | Use the shared date formatter in `render`.                                                          |
| Date and time                         | `dateTime`        | Preserve the relevant timezone and use the shared date/time formatter.                              |
| Status, category, type, finite state  | `enum`            | Provide `enumOptions` with stable values and visible labels.                                        |
| Formatted currency or numeric display | `formattedNumber` | Keep the underlying numeric value available for sorting and filtering.                              |

**Preferred usage**

```tsx
const columns: IColumn[] = [
  { id: 'name', label: 'Name', filterType: 'string', sticky: true, stickyPosition: 'left' },
  { id: 'amount', label: 'Amount', filterType: 'formattedNumber', align: 'right' },
  {
    id: 'status',
    label: 'Status',
    filterType: 'enum',
    enumOptions: statusOptions,
    sticky: true,
    stickyPosition: 'right',
    render: (value, row) => (
      <Label color={statusColors[row.status]}>{statusLabels[row.status]}</Label>
    ),
  },
  {
    id: 'action',
    label: 'Action',
    sticky: true,
    stickyPosition: 'right',
    isSort: false,
    isFilter: false,
    render: (_value, row) => (
      <ThreeDotsActions
        showViewIcon
        showEditIcon
        showDeleteIcon
        viewLabel={`View ${row.name}`}
        editLabel={`Edit ${row.name}`}
        deleteLabel={`Delete ${row.name}`}
        handleViewClick={() => handleView(row)}
        handleEditClick={() => handleEdit(row)}
        handleDeleteClick={() => handleDelete(row)}
      />
    ),
  },
];

<CustomizableTable
  tableId="records-table"
  tableTitle="Records"
  columns={columns}
  data={viewRows}
  isLoading={isLoading}
/>;
```

**Server-side usage**

When the API provides paging, search, sorting, or filtering, connect those capabilities explicitly:

```tsx
<CustomizableTable
  tableId="employee-table"
  tableTitle="Employees"
  columns={columns}
  data={employeeRows}
  isLoading={isFetching}
  serverSide
  serverSidePagination
  serverSideSearch
  serverSideSort
  serverSideFilter
  totalCount={totalCount}
  onServerPagination={handleServerPagination}
  onServerSearch={handleServerSearch}
  onServerSort={handleServerSort}
  onServerFilter={handleServerFilter}
/>
```

**Rules**

- Always use `CustomizableTable` for shared table behavior.
- Always follow the shared table filter and sticky-column rules when configuring `columns`.
- Always set the `filterType` according to the actual field type; do not rely on the component’s inferred default for a field that needs a specific filter.
- Set `filterType: 'enum'` and `enumOptions` for status, type, category, and other finite-value fields.
- Always make the status column sticky and keep it visible while the table scrolls horizontally.
- Always make the action column sticky and keep it visible while the table scrolls horizontally.
- Place status and action sticky columns on the right with `stickyPosition: 'right'` unless the screen has a documented layout reason to use another position.
- Do not allow the status or action column to disappear through default column visibility settings.
- Always render status values with `Label`; do not use plain text, an unstyled `Chip`, or color alone for status presentation.
- Use one consistent label and color mapping for the same domain status across related screens.
- Always use the shared `ThreeDotsActions` component in the action column; do not create ad-hoc icon buttons or menus for standard view, edit, and delete actions.
- Keep at most three direct icons before the three-dot control. Configure feature-specific direct icons through `directActions` with a stable id, specific label, `mdi:` icon, disabled state, and handler; keep less-frequent actions in `actions`.
- Give row actions specific accessible labels that identify the affected record, such as `Edit Spring admission cycle`, rather than repeating generic labels when the row context is available.
- Stop row-action events from triggering row navigation; `ThreeDotsActions` handles event propagation for its built-in actions.
- When View navigates to another workspace, use `viewHref` so modifier-click and opening a new tab retain native link behavior; do not prevent the link's default action. A disabled View renders as a disabled button without a destination.
- Hide or disable actions according to the screen’s permission and record-state rules, but do not treat hidden controls as authorization; backend permission checks remain authoritative.
- Shape API data into view-specific rows before passing it to `CustomizableTable`; do not spread raw API records into cells when the view requires formatted labels, dates, amounts, or derived values.
- Keep raw values available when needed for sorting, filtering, actions, or export, while rendering the user-facing formatted value through the column `render` function.
- Use the shared date, time, number, currency, and status formatters instead of formatting values inconsistently inside cells.
- When the API supports server-side behavior, use server-side pagination, search, sorting, and filtering rather than loading the full collection and filtering it in the browser.
- Connect each enabled server-side capability to its corresponding callback and pass the API `totalCount` for pagination.
- Do not enable server-side flags without implementing the matching API callback and query-state update.
- Reset the server page to the first page when search, filter, or sort changes unless the API contract explicitly preserves the current page.
- Debounce server-side search and ignore stale responses so older requests cannot replace newer table data.
- Retain safe existing rows during refetch and show the table loading treatment; do not replace the entire page with a full-screen loader.
- Use the table’s own toolbar, filter chips, pagination, and scroll container; do not add duplicate controls around it.
- Keep the table as the owner of horizontal and vertical data scrolling; the document must not gain horizontal overflow.

**Validation**

- Verify the table uses `CustomizableTable` with a stable `tableId` and meaningful `tableTitle`.
- Verify every column has the correct field-based `filterType`.
- Verify status and action columns are both sticky and remain visible during horizontal scrolling.
- Verify status cells render through `Label` with the correct label and color mapping.
- Verify action cells render through `ThreeDotsActions` with specific accessible labels and correct handlers.
- Verify the table receives view-shaped data rather than incorrectly displaying raw API values.
- Verify server-side pagination, search, sorting, and filtering callbacks are connected whenever the API supports them.
- Verify loading, empty, error, permission, pagination, filter, and refetch states.
- Verify keyboard access, sticky-column focus visibility, row-action menus, and no document-level horizontal overflow.

### 05. Dialog family

Use `CustomDialog` from `src/components/customDialog/` for application dialogs.
Use `DialogScrollContent` from the same module for scrollable dialog bodies, especially for forms.

**Configuration**

| Prop or region | Required configuration                                                                                                  |
| -------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `CustomDialog` | Always use the shared `CustomDialog` component for feature dialogs.                                                     |
| `title`        | Always provide a clear, task-specific `title`; never leave the title empty or replace it with placeholder text.         |
| Description    | Use brief task context when needed; Student Onboarding shows only record context or a material consequence.           |
| `open`         | Control visibility from the owning screen or workflow state.                                                            |
| `handleClose`  | Pass the owning close handler so the dialog can reset state, clear selected data, and handle unsaved changes correctly. |
| `maxWidth`     | Choose the smallest width that supports the content; use a larger width only when the form or content needs it.         |
| `hasForm`      | Use the form-enabled default for Formik forms; set `hasForm={false}` only for content that is not submitted as a form.  |
| `disableClose` | Use only when closing would be unsafe or unsupported; explain the reason through the owning workflow.                   |
| Body           | Use `DialogScrollContent` for form or long content so the body owns scrolling and the header/footer remain stable.      |
| Footer         | Use MUI `DialogActions` for form actions, keep Cancel before Submit, and include a relevant icon in every footer button. |

**Required form structure**

When a dialog contains a form, use Formik with a Yup validation schema and follow this structure:

```tsx
<CustomDialog open={open} title="Add Employee" handleClose={handleClose} maxWidth="sm">
  <DialogScrollContent>{/* Formik fields and validation messages */}</DialogScrollContent>

  <DialogActions>
    <Button variant="outlined" size="small" onClick={handleClose}>
      Cancel
    </Button>
    <LoadingButton
      loading={isLoading || isUpdateLoading}
      variant="contained"
      size="small"
      type="submit"
      onClick={(e: any) => formik.handleSubmit(e)}
    >
      Submit
    </LoadingButton>
  </DialogActions>
</CustomDialog>
```

The Formik configuration must include a Yup schema:

```tsx
const formik = useFormik({
  initialValues,
  validationSchema: yup.object({
    name: yup.string().trim().required('Name is required'),
  }),
  onSubmit: handleSubmit,
});
```

**Rules**

- Always use `CustomDialog` from `src/components/customDialog` for feature dialogs.
- Always pass the `title` prop with a specific description of the current action, such as `Add Employee`, `Edit Vehicle`, or `Change Status`.
- Write every visible dialog and drawer title in Title Case, capitalizing the main words while preserving record names as entered. For example, use `Review Readiness Rule` and `Add Academic Override`; keep body copy, field labels, and button text in sentence case. Code identifiers may use camelCase, but visible titles must remain readable words.
- Outside Student Onboarding, put one accessible info icon immediately after the title of each data-entry or review dialog with concise task guidance. Pass the guidance through `CustomDialog`'s `titleInfo` prop so the shared header keeps the title, icon, and close action aligned. Make the tooltip useful on hover, keyboard focus, and touch; do not repeat the body description. Simple confirmations may omit the icon when there is no additional guidance.
- Include a meaningful, concise description inside the dialog body when the task or outcome is not clear from the title and controls.
- In Student Onboarding dialogs, keep only essential record context, material consequences, validation, and actionable errors. Omit generic descriptions, title info icons, and instructional helper text when the title, labels, and controls already explain the action.
- Keep the dialog title stable and update it only when the dialog’s task changes, such as add versus edit.
- Always pass the real `handleClose` callback from the owning workflow; do not use an empty inline close handler that leaves selected records, form state, or dirty state behind.
- Use `DialogScrollContent` as the body wrapper whenever the dialog contains a form or content that can exceed the available height.
- Keep the dialog header and action footer outside `DialogScrollContent` so only the body scrolls.
- Use Formik for every dialog form and define validation with Yup; do not manage individual form values and validation with unrelated local state.
- Define `initialValues`, `validationSchema`, and `onSubmit` together in the owning form contract.
- Show field-level Yup errors near the relevant field and validate the complete form before submitting.
- Keep the submit button as `type="submit"` and connect it to `formik.handleSubmit` as required by the shared form-dialog pattern.
- Use `LoadingButton` for submit actions and include all relevant request-loading states, such as `isLoading || isUpdateLoading`.
- Keep `Cancel` before `Submit` in `DialogActions`; Cancel uses `variant="outlined"` and `size="small"`, while Submit uses `variant="contained"` and `size="small"`.
- Always include a relevant `Iconify` icon in every dialog footer button through `startIcon` or `endIcon`; icon-only buttons must have an accessible `aria-label`.
- Disable or prevent duplicate submission while the create or update request is loading.
- Close the dialog only after a successful mutation unless the workflow explicitly supports closing during a recoverable state.
- Reset form values, selected records, validation state, and dirty-change state when the dialog closes or after a successful submit.
- Protect unsaved changes through the owning Formik/confirmation workflow; do not bypass the shared close guard.
- Use `hasForm={false}` only for preview, read-only, confirmation, or other non-form content.
- Do not place long multi-step workflows inside a small dialog; use a page, drawer, or stepper when the task is larger than a focused decision or edit.
- Do not place breadcrumbs, page-level filters, tables, or unrelated actions inside a dialog.
- Keep keyboard focus, Escape behavior, close-button labeling, and mobile sizing provided by the shared dialog implementation.

**Validation**

- Verify every `CustomDialog` has a meaningful `title`.
- Verify the dialog makes its task and consequence clear. For Student Onboarding, essential record context or a material consequence is sufficient without additional helper copy.
- Verify form dialogs use `DialogScrollContent` and keep `DialogActions` outside the scrolling body.
- Verify every dialog form uses Formik and a Yup `validationSchema`.
- Verify required, invalid, and server-error states prevent invalid submission and show actionable messages.
- Verify Cancel closes safely and resets the owning workflow state.
- Verify Submit shows loading state, prevents duplicate submission, and closes only after success.
- Verify every dialog footer button includes a relevant icon and icon-only buttons have an accessible `aria-label`.
- Verify long form content scrolls inside the dialog without moving the header or footer.
- Verify keyboard focus, Escape/close behavior, mobile layout, and unsaved-change protection.

### 06. Forms, Formik, and Yup

Every new form must use Formik for form state and submission, and Yup for schema validation.
Use `ShakingTextField` to provide the shared validation feedback animation around form controls, and choose the field component that matches the value and interaction required by the field.

**Source of truth**

| Concern                   | Path                                                                      |
| ------------------------- | ------------------------------------------------------------------------- |
| Form state and submission | `formik` with `useFormik` or the project’s established Formik composition |
| Validation                | `yup` schema defined with the form contract                               |
| Validation wrapper        | `src/components/shaking-text-field/`                                      |
| Select field              | `src/components/custom-select/`                                           |
| Numeric field             | `src/components/custom-numeric-format/`                                   |
| OTP field                 | `src/components/otp-input-field/`                                         |
| Paginated search field    | `src/components/paginated-search-select/`                                 |
| Standard address fields   | `src/components/stardard-address/`                                        |
| Date range field          | `src/components/custom-date-range-picker/`                                |
| Academic date field       | `src/components/academic-date-picker/`                                    |

**Field selection rules**

| Field requirement                                           | Required component                                                                       |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Text, multiline text, identifier, or free-form value        | MUI text field wrapped in `ShakingTextField`                                             |
| One or multiple values from a bounded option list           | `CustomSelect` wrapped in `ShakingTextField` when validation feedback is needed          |
| Currency, amount, count, or constrained numeric value       | `NumericFormatCustom` wrapped in `ShakingTextField`                                      |
| One-time password or fixed-length verification code         | `OtpInputField` wrapped in `ShakingTextField`                                            |
| Large or remote option list requiring search and pagination | `PaginatedSearchSelect` wrapped in `ShakingTextField`                                    |
| Country, state, and city address data                       | Standard address components from `src/components/stardard-address/`                      |
| General date interval                                       | `CustomDateRangePicker` wrapped in `ShakingTextField` when validation feedback is needed |
| Academic-calendar-aware date or date-time                   | `AcademicDatePicker` or its academic date-time variant, only inside the academic module  |

**Date picker rules**

For bounded selections with optional guidance, `CustomSelect` accepts `optionDescriptionKey`
pointing to the description field in each option. It renders an accessible info tooltip beside
each menu option and the selected single value. Use this in concession policy dropdowns instead
of descriptive helper text; keep validation errors in `helperText`.

- Always use the MUI X date picker components from `@mui/x-date-pickers` for date, time, date-time, and date-range fields; do not use native date inputs or another date-picker library.
- Always use `dayjs` as the date adapter and field value type, including through `LocalizationProvider` with `AdapterDayjs` and shared date-picker wrappers.
- Keep empty picker values as `null`, validate Dayjs values with the established form rules, and convert them to the API contract only at the submit or serialization boundary.
- Reuse the documented shared date-picker wrapper when one exists; do not create a local picker abstraction that changes the MUI or Dayjs value contract.

**Strict size rule**

- Every form field must use the appropriate MUI field component or the documented shared field wrapper; do not use raw HTML inputs for application forms.
- Every form field must use `size="small"`, including `TextField`, `Select`, `Autocomplete`, date pickers, numeric fields, search selects, and custom field wrappers.
- Every form button must use `size="small"`, including `Button`, `LoadingButton`, icon buttons used inside form actions, and custom submit/cancel button wrappers.
- Pass `size="small"` through the shared wrapper to the underlying MUI control. If a wrapper does not expose the size prop, extend the shared wrapper instead of omitting the rule in a feature.
- Keep fields `fullWidth` when they occupy a form grid cell, and use the documented `Grid`/`Stack` layout with `spacing={1}`; do not compensate for the small control size with arbitrary margins.
- Do not override a form field or button to `medium` or `large` for visual emphasis. Use layout, hierarchy, variant, label, or theme color to communicate importance.
- Review every new form and dialog for missing `size="small"` before handoff; a field or form button without the small size is a contract violation.

**Required form pattern**

```tsx
import * as yup from 'yup';
import { useFormik } from 'formik';
import TextField from '@mui/material/TextField';
import ShakingTextField from 'src/components/shaking-text-field';

const validationSchema = yup.object({
  name: yup.string().trim().required('Name is required'),
});

const formik = useFormik({
  initialValues: { name: '' },
  validationSchema,
  onSubmit: handleSubmit,
});

<ShakingTextField error={Boolean(formik.touched.name && formik.errors.name)}>
  <TextField
    fullWidth
    size="small"
    name="name"
    label="Name"
    value={formik.values.name}
    onChange={formik.handleChange}
    onBlur={formik.handleBlur}
    error={Boolean(formik.touched.name && formik.errors.name)}
    helperText={formik.touched.name ? formik.errors.name : ''}
  />
</ShakingTextField>;
```

**Rules**

- Every new form must use Formik; do not manage the form’s primary values and submission with unrelated local `useState` handlers.
- Every new form must use a Yup `validationSchema`; do not rely only on browser validation, field placeholders, or backend errors.
- Define `initialValues`, `validationSchema`, and `onSubmit` together so the value contract and validation contract remain aligned.
- Validate required, format, length, range, cross-field, and conditional rules in Yup with user-actionable error messages.
- Use `ShakingTextField` around validated fields and pass the field’s touched/error state to its `error` prop.
- Show the corresponding Formik error through the field’s `error` and `helperText` or equivalent feedback props.
- Mark a field as touched through `formik.handleBlur` or an equivalent explicit `formik.setFieldTouched` call before relying on its error display.
- On submit, validate the complete form, focus or announce the first invalid field when the form pattern supports it, and do not call the mutation with invalid values.
- Use `CustomSelect` for bounded single- or multi-select values; connect its value through `formik.values` and update it with `formik.setFieldValue`.
- Use `NumericFormatCustom` for numeric and currency inputs; keep the Formik value in the expected numeric contract and validate bounds with Yup.
- Use `OtpInputField` for fixed-length OTP or verification-code input; validate length, allowed characters, and required state with Yup.
- Use `PaginatedSearchSelect` for remote option lists; connect selection and validation to Formik and preserve loading, empty, and error states from the fetch contract.
- Use the Standard address components for country, state, and city fields; keep dependent values synchronized and clear state/city when their parent selection changes.
- Use `CustomDateRangePicker` for general date-range input; map its `[startDate, endDate]` value into Formik and validate the range, required endpoints, and min/max constraints with Yup.
- Single-input `CustomDateRangePicker` consumers may opt into keyboard entry with `allowManualInput`. It strictly parses the configured `dateFormat`, validates date order and picker constraints, and emits `[null, null]` for incomplete or invalid drafts. Keep required-range validation in the owning form. The calendar icon remains a keyboard-accessible button. Use `referenceDate` to choose the initial calendar month when the range is empty; selected ranges take precedence.
- Use `AcademicDatePicker`, `AcademicDateTimePicker`, or `AcademicWeekDatePicker` only in the academic module when academic calendar rules, blocked days, or academic context must be enforced.
- Do not use `AcademicDatePicker` in non-academic modules; use the general date picker appropriate to the workflow.
- Convert picker values to the API contract at submit time using the established date serializer; do not send display-formatted strings accidentally.
- Keep field labels visible, stable, and specific; do not use placeholder-only labels.
- Preserve values on validation failure and show errors near the relevant field.
- Disable duplicate submission while the Formik submission or API mutation is loading.
- Reset Formik state only after a successful submit or an intentional form close/reset action.
- Keep backend validation authoritative for business rules and data integrity; frontend Yup validation provides immediate user feedback and must not replace backend checks.

**Validation**

- Verify the form uses Formik and a Yup schema.
- Verify initial values match the fields and the submitted payload contract.
- Verify each invalid field shows the correct `ShakingTextField` error state and helper text.
- Verify `CustomSelect`, `NumericFormatCustom`, `OtpInputField`, `PaginatedSearchSelect`, address, and date values update Formik correctly where used.
- Verify dependent fields, cross-field rules, date ranges, numeric limits, and conditional Yup rules.
- Verify invalid submission does not call the API and successful submission sends the correctly shaped payload.
- Verify loading, server validation errors, reset, keyboard interaction, and mobile form layout.

### 07. Stepper with Formik

Use `CustomStepperWithFormik` from `src/components/custom-stepper/` for ordered multi-step forms and setup flows.
The component already creates and manages the Formik instance internally, so a standard implementation must not create an additional Formik setup around it.

**Configuration**

| Prop                       | Required configuration                                                                                                       |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `steps`                    | Ordered, user-facing step labels as a string array.                                                                          |
| `activeStep`               | State owned by the parent workflow and kept within the valid step range.                                                     |
| `initialValues`            | One complete value object shared across all steps.                                                                           |
| `formikInstance`           | Compatibility option for an existing owning editor hook; reuse that instance without introducing another form-state owner.   |
| `validationSchema`         | Yup schema passed to the stepper; use step-aware validation when different steps have different requirements.                |
| `renderItem`               | Render the active step and use the `formik` instance supplied in the callback.                                               |
| `handleNext`               | Persist or advance the workflow using the validated values supplied by the stepper.                                          |
| `handleBack`               | Move to the previous step without creating a second form-state owner.                                                        |
| `onStepClick`              | Use only when direct step navigation is appropriate; guard forward navigation with validation where required.                |
| `validateForwardStepClick` | Enable when users may click future steps and those transitions must validate the current step first.                         |
| `showSaveButton`           | Keep enabled when the workflow supports saving a draft/current step; disable only when that action is not valid.             |
| `scrollbarHeight`          | Set when the stepper is inside a bounded dialog or drawer; keep the content area scrollable and the footer stable.           |
| `viewMode`                 | Use `horizontal` by default; use `vertical` for a wide desktop setup workflow when the layout benefits from side navigation. |
| `footerPlacement` | Keep `outside` by default; use `content` only when the step renders the supplied `footer` once in a stable, reachable panel footer. |

**Preferred usage**

```tsx
<CustomStepperWithFormik
  initialValues={initialValues}
  steps={['Basic Details', 'Configuration', 'Review']}
  activeStep={activeStep}
  validationSchema={validationSchema}
  handleBack={() => setActiveStep((step) => Math.max(step - 1, 0))}
  handleNext={(isLastStep, values, formik, setIsLoading) =>
    handleNextStep(isLastStep, values, formik, setIsLoading)
  }
  renderItem={({ formik, activeStep: step }) => (
    <Box sx={{ p: 2 }}>{stepContent[step](formik)}</Box>
  )}
/>
```

The fields inside `renderItem` must use the supplied `formik` object and the form-field rules documented above.

**Rules**

- Always use `CustomStepperWithFormik` for multi-step forms and genuinely ordered setup flows.
- Do not call `useFormik` again in the parent or step content for the standard implementation; `CustomStepperWithFormik` already creates the Formik instance.
- Do not wrap the stepper in a second Formik provider or maintain duplicate values, touched state, errors, or submission state.
- Pass one complete `initialValues` object to the stepper and keep field names consistent across every step.
- Always pass a Yup `validationSchema`; the internal Formik instance uses it for step submission and navigation validation.
- Use the `formik` instance supplied by `renderItem` for values, errors, touched state, `handleChange`, `handleBlur`, and `setFieldValue`.
- Use `ShakingTextField` and the appropriate shared field component inside each step according to the Forms, Formik, and Yup contract.
- Keep `steps` in the same order as the rendered step content; changing labels or content order must update both together.
- Use `handleNext` for the validated current values and let the stepper determine whether the current step is the final step.
- Do not advance to the next step when validation errors exist; the component validates, marks errors as touched, and focuses the first invalid field.
- Use `validateForwardStepClick` when clicking a future step must validate the current step before navigation.
- Use `isStepClickable` to restrict direct navigation based on workflow state, permissions, completion, or edit mode.
- Use `completedSteps` and `errors` only when the parent has an authoritative workflow state to represent; do not show a step as complete merely because it was visited.
- Keep `activeStep` state in the parent workflow so the parent can coordinate dialogs, drawers, routes, dirty-state protection, and successful submission.
- Keep the stepper’s scrollable content region separate from its sticky action footer; long step forms must not push actions out of view.
- Use `handleBack` for backward navigation and preserve entered values unless the workflow explicitly requires a reset.
- Pass `onCancel` when the first step needs an enabled Cancel action; it must invoke the owning workflow's unsaved-navigation guard.
- Use optional `backButtonProps` for a workflow-specific icon or to disable backward navigation after a terminal result. The shared stepper still enforces first-step and busy-state disabling and owns the click handler.
- Keep Save, Save & Next, Back, and Submit semantics clear; do not silently submit the entire workflow when the user selects Save for the current step.
- Respect the component’s loading state and do not trigger duplicate next, save, or submit requests while it is busy.
- Use a stepper only for a genuinely ordered sequence; use `CustomTabs` for peer views that can be visited independently.
- For a dialog or drawer workflow, place the stepper inside the owning `CustomDialog` or drawer and keep the container height bounded so the stepper can own scrolling.

**Validation**

- Verify the implementation uses `CustomStepperWithFormik` and does not create an additional Formik instance.
- Verify the supplied `validationSchema` blocks invalid forward navigation and submission.
- Verify each step renders the correct fields using the supplied `formik` instance.
- Verify errors are marked touched and the first invalid field receives focus when advancing.
- Verify Back preserves values and does not submit the form.
- Verify Save, Save & Next, and final Submit show loading states and prevent duplicate requests.
- Verify direct step clicks follow the configured validation and clickability rules.
- Verify horizontal and vertical modes, mobile behavior, internal scrolling, sticky actions, and keyboard navigation.

### 08. SectionCard

When a form or workflow has multiple field groups spread across multiple files, use `SectionCard` to group each related set of fields into a named section.
The established shared implementation is exported from `src/screens/hr/employee/employee-form-fields/InformationFields.tsx`, and it is reused by multiple form modules.

**Configuration**

| Prop            | Rule                                                                                                              |
| --------------- | ----------------------------------------------------------------------------------------------------------------- |
| `title`         | Use a concise, user-facing section name such as `Basic Information`, `Contact Information`, or `Address Details`. |
| `children`      | Render the related fields or content for that section.                                                            |
| `headerContent` | Use for a section-specific action or supporting control that belongs in the section header.                       |
| `isLoading`     | Use when the section’s data is loading and the section should preserve its geometry.                              |
| `paperProps`    | Use only for intentional section-level presentation changes; do not use it to create arbitrary page spacing.      |
| `gridProps`     | Use to configure the field grid within the section while preserving the shared grouping pattern.                  |

**Preferred usage**

```tsx
<SectionCard title="Basic Information">
  <BasicInformationFields formik={formik} />
</SectionCard>

<SectionCard title="Contact Information">
  <ContactInformationFields formik={formik} />
</SectionCard>
```

**Rules**

- Use `SectionCard` whenever a form contains multiple logical groups of fields, especially when those groups are implemented in separate files or step components.
- Give every section a meaningful title that describes the fields inside it; do not use generic titles such as `Section 1`.
- Use a neutral leading icon for informational section headings, aligned with the title and optional help icon. The help icon may use the theme info color; reserve other semantic icon colors for status.
- Keep one logical field group inside one `SectionCard`; do not combine unrelated domains merely to reduce the number of cards.
- Keep field components and Formik state in the owning form/step files while using `SectionCard` only for visual grouping and section layout.
- Pass the same Formik instance into field components; `SectionCard` must not create or own form state.
- Use the established `SectionCard` implementation or an owning module’s existing implementation; do not create another visually inconsistent local card for the same grouping purpose.
- If a truly reusable cross-module `SectionCard` is needed, add it to the shared component area and document its source before introducing another implementation.
- Do not use `SectionCard` for a single isolated field, a page-level table, a dashboard metric, or unrelated explanatory content.
- Keep section ordering aligned with the user’s task sequence and the stepper order when the form is multi-step.
- Use `headerContent` only for actions or context specific to that section; page-level actions belong in the page header or dialog footer.
- Preserve the form’s loading, validation, and empty states inside the section that owns them.
- Do not add extra nested cards inside a `SectionCard` unless the nested content is an independently meaningful sub-surface.
- Avoid adding custom margins or padding to each usage; rely on the shared section layout and the owning form grid for spacing.
- Ensure sections remain readable and stack naturally on narrow screens.

**Validation**

- Verify multi-file or multi-section forms use `SectionCard` for each logical field group.
- Verify every section has a meaningful title and contains only related fields.
- Verify the supplied Formik instance remains the single form-state owner.
- Verify validation, loading, and server-error states remain visible inside the correct section.
- Verify section ordering, responsive stacking, keyboard access, and no unnecessary nested cards or spacing overrides.

### 09. Drawer

**Source paths**

- Shared theme configuration: `src/theme/core/components/drawer.tsx`
- Feature-owned drawer implementations: search the owning module under `src/screens/` and reuse an existing pattern before adding a new one.

**Rules**

- Use the shared MUI/theme drawer configuration and the existing feature drawer pattern; do not create a second drawer primitive.
- Use Title Case for every visible drawer title, following the dialog title rule above. Preserve user-entered record names inside dynamic titles.
- Keep the drawer width, responsive behavior, close behavior, and paper styling consistent with the theme configuration.
- Keep the drawer body independently scrollable when content can exceed the viewport; keep primary actions visible and keyboard accessible.
- Keep data fetching and form state in the owning screen or hook. The drawer should coordinate presentation and callbacks, not own unrelated business logic.
- Guard close actions when a form is dirty or an upload/request is in progress, using the established confirmation pattern where required.
- Reuse `Iconify`, shared buttons, Formik/Yup, `CustomUpload`, and other documented primitives inside drawers.
- Do not add arbitrary page-level margins or spacing overrides to compensate for drawer layout.

### 10. Button

**Source paths**

- Theme button configuration: `src/theme/core/components/button.tsx`
- Shared button components: search `src/components/` for the existing loading, submit, cancel, and action button wrappers.

**Rules**

- Prefer MUI buttons and the shared button variants already configured by the theme.
- Use `LoadingButton` for async submit or mutation actions and disable duplicate submission while loading.
- Use `variant="outlined"` for secondary or cancel actions and `variant="contained"` for the primary action unless the surrounding component contract says otherwise.
- For a primary submit, save, or publish action that should use the system's neutral black/white treatment, use the theme's `text.primary` background and `background.paper` foreground so it adapts in light and dark mode; avoid feature-specific accent colors for these actions.
- Use `size="small"` for standard page actions, table actions, dialog and drawer footer actions, and dense forms.
- The theme defines small labeled buttons as 30 px high, with its existing typography, icon spacing, and horizontal padding.
- Do not override their `height`, `minHeight`, padding, or font size locally; `size="small"` together with `minHeight: 44` is not compliant.
- Keep standard action buttons content-width on every breakpoint; use `fullWidth` only when an explicitly approved workflow requires it.
- An explicitly approved minimum width may give a header action more room without changing its theme height, typography, or padding; Salary Templates uses `minWidth: 140` for Create Template.
- Keep primary page actions on the right, including when responsive layout moves them onto their own row.
- Use `Iconify` through `startIcon` or `endIcon`; icon-only buttons require an accessible `aria-label`.
- Keep button labels action-oriented and specific, such as `Save`, `Update`, `Delete`, or `Cancel`.
- Use title case for multiword action labels, such as `Create Template` and `Add Employee`; do not force all-uppercase styling.
- Do not add local colors, padding, shadows, or spacing that duplicate the theme.

### 11. Types

**Source paths**

- Component-local types: `src/components/**/types.ts`
- Shared application/domain types: `src/types/`

**Rules**

- Type every component prop, callback, table row, form value, API response, and hook result at the boundary where it is consumed.
- Keep types close to the component when they are private; promote them to `src/types/` only when multiple modules share the same contract.
- Prefer discriminated unions for variant-dependent props and explicit nullable/optional fields that match the API contract.
- Avoid `any`; use a specific type, generic, `unknown` with narrowing, or an existing shared type.
- Keep UI types separate from backend DTOs when the UI transforms, derives, or renames values.
- Update the type contract when a component configuration changes; do not hide incompatible props with casts.

### 12. Icons

Always use the shared `Iconify` component from `src/components/iconify/` for icons in frontend screens and shared components.
All new icon names must use the Material Design Icons (`mdi`) namespace.

**Required format**

```tsx
<Iconify icon="mdi:view-dashboard-outline" width={20} />
```

The icon value must follow the `mdi:<icon-name>` format, for example `mdi:view-dashboard-outline`, `mdi:plus`, or `mdi:delete-outline`.

**Rules**

- Always use `Iconify`; do not import or render a separate icon library directly in feature screens.
- Use only the `mdi` icon set for new icons; every new icon string must begin with `mdi:`.
- Do not use icons from other namespaces such as `eva:`, `solar:`, `lucide:`, `carbon:`, `mingcute:`, `material-symbols:`, or other icon collections.
- Do not use raw SVG markup, image files, Unicode symbols, or text characters as substitutes for a standard UI icon.
- Choose an icon whose meaning matches the action or destination; do not use decorative or ambiguous icons for primary navigation.
- Keep the icon name stable and use the same `mdi` icon for the same action across related screens.
- Use `width` or the component styling API for sizing; do not create one-off SVG dimensions or inconsistent icon proportions.
- Use approximately 16–20 px for compact table and button icons, and approximately 20–24 px for navigation or prominent actions unless the surrounding component defines another size.
- Use `startIcon` or `endIcon` on buttons when the icon accompanies visible text; do not duplicate the same icon unnecessarily inside the label.
- Every icon-only button must have a specific accessible name through `aria-label` or the owning shared action component.
- Do not rely on color or the icon shape alone to communicate a status, warning, or destructive consequence; include visible text or an accessible name.
- Use `Iconify` icons with `flexShrink: 0` behavior preserved so icons do not collapse in dense layouts.
- When adding a shared icon constant, its value must still use the `mdi:` namespace and its name must describe the action rather than the visual shape.
- Existing legacy `GlobalIcons` values from other namespaces are not a pattern for new code; replace or migrate them only as part of a scoped change.

**Validation**

- Verify every new icon is rendered through `Iconify`.
- Verify every new icon name starts with `mdi:`.
- Verify icon-only controls have specific accessible names and visible focus states.
- Verify icons retain readable size and alignment at mobile and desktop breakpoints.

### 13. Toast

Always use `shikshaMitraToast` from `src/components/toast/` for application toast notifications.
Do not call Sonner directly from feature screens.

**Configuration**

| Method                      | Configuration                             | Use for                                                            |
| --------------------------- | ----------------------------------------- | ------------------------------------------------------------------ |
| `shikshaMitraToast.success` | `{ message, alertProps? }`                | Successful create, update, delete, save, or completed user action  |
| `shikshaMitraToast.error`   | `{ message, alertProps? }`                | Failed request, rejected action, or recoverable error              |
| `shikshaMitraToast.warning` | `{ message, alertProps? }`                | Risk, incomplete prerequisite, or action that needs user attention |
| `shikshaMitraToast.info`    | `{ message, alertProps? }`                | Neutral progress, contextual information, or undo action           |
| `shikshaMitraToast.promise` | `promise, { pending?, success?, error? }` | A request with distinct pending, success, and failure states       |

**Preferred usage**

```tsx
try {
  await updateRecord(payload).unwrap();
  shikshaMitraToast.success({ message: 'Record updated successfully.' });
} catch (error: any) {
  shikshaMitraToast.error({
    message: error?.data?.message || 'Unable to update the record. Please try again.',
  });
}
```

For a request whose lifecycle should remain visible to the user:

```tsx
shikshaMitraToast.promise(saveRecord(payload).unwrap(), {
  pending: 'Saving record…',
  success: 'Record saved successfully.',
  error: 'Unable to save the record. Please try again.',
});
```

**Rules**

- Always use `shikshaMitraToast`; do not import `toast` from `sonner` in feature code.
- Select the severity that matches the outcome: success for completion, error for failure, warning for risk or prerequisite, and info for neutral context.
- Always provide a concise, user-facing `message`; do not expose raw exceptions, stack traces, API payloads, internal IDs, or permission names.
- Error messages must explain what failed and what the user can do next when recovery is possible.
- Success messages should confirm the completed outcome and identify the affected record or task when that improves clarity.
- Show a toast after the operation reaches its actual outcome; do not show success before the mutation or request resolves.
- Use `promise` when one request has meaningful pending, success, and error messages; keep those messages short and consistent.
- Do not show duplicate success and promise-success toasts for the same request.
- Do not use toasts for field validation errors, required-field guidance, table empty states, page loading, or content that must remain visible; use the owning field or stateful region instead.
- Do not use a toast as the only feedback for a destructive or irreversible action; confirm the action first and then report the result.
- Keep toast messages free of sensitive tenant, student, employee, financial, or authentication data unless the displayed value is explicitly safe for the user’s context.
- Use `alertProps` only for deliberate Alert customization supported by the shared implementation; do not override the severity, close behavior, or design contract casually.
- Use the callback form of `message` or `alertProps` only when the toast needs its own toast ID for an action such as undo or dismiss.
- Make undo actions idempotent and report the result of the undo operation separately when it can fail.
- Keep toast-triggering mutations in the owning workflow so a component does not report success for an operation it does not own.
- Prefer one actionable toast per user operation and avoid firing multiple notifications from nested components for the same result.

**Validation**

- Verify the feature imports and calls `shikshaMitraToast` rather than Sonner directly.
- Verify success, error, warning, info, and promise notifications use the correct severity and message.
- Verify raw API errors are mapped to safe, actionable user-facing copy.
- Verify success is shown only after the operation succeeds and duplicate notifications are not emitted.
- Verify field, empty, loading, and blocking-error states are not incorrectly implemented as toasts.

### 14. Upload

Use `CustomUpload` from `src/components/custom-upload/` for file selection, drag-and-drop upload input, previews, download, and removal.

**Configuration**

| Prop                            | Rule                                                                                                     |
| ------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `onChange`                      | Required; update the owning form or workflow with the selected file or files.                            |
| `value`                         | Keep controlled by the owning form or workflow so existing files and selected files render consistently. |
| `multiple`                      | Use `true` for multiple documents and `false` for one file; match the API payload contract.              |
| `onPreview`                     | Pass when preview behavior belongs to the owning workflow; otherwise use the component preview behavior. |
| `error`                         | Pass a safe, field-level validation message when the upload is invalid.                                  |
| `primaryText` / `secondaryText` | Explain what the user can upload and any important requirement.                                          |
| `propertyPr`                    | Use for concise file requirements such as accepted type or size.                                         |
| `parentsProps` / `dragProps`    | Use only for intentional layout or drag-area customization; preserve the shared upload interaction.      |

**Rules**

- Always use `CustomUpload` for upload fields; do not create a separate drag-and-drop implementation.
- Keep upload state in Formik when the uploader is part of a form and validate it with Yup.
- Preserve the component’s accepted file types and 5 MB size limit unless a scoped product change updates the shared component and its contract.
- Show clear accepted-format, size, and count guidance before selection.
- Handle rejected files through the component’s error or toast behavior; do not silently discard invalid files.
- Keep existing server files and newly selected files distinguishable in the owning value contract.
- Do not upload files automatically from the field unless the workflow explicitly requires immediate upload; otherwise submit them with the owning form or mutation.
- Provide safe preview and download behavior for authenticated files and do not expose protected file URLs in user-facing copy.
- Give remove, preview, and download controls specific accessible names.

**Validation**

- Verify accepted and rejected file types, the 5 MB limit, single/multiple selection, preview, download, and removal.
- Verify Formik/Yup error display when the upload is required or invalid.
- Verify existing-file rendering and mutation payload mapping.
- Verify keyboard access, focus visibility, mobile layout, and loading/error feedback.

### 15. EmptyContent

Use `EmptyContent` from `src/components/empty-content/` for an explicit empty state inside a page, table, card, chart, or other stateful region.

**Configuration**

| Prop               | Rule                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| `title`            | State what is empty in clear, user-facing language.                                              |
| `description`      | Explain why the state may be empty and what the user can do next.                                |
| `action`           | Provide the next useful action, such as Create, Clear filters, Retry, or Configure.              |
| `filled`           | Use when the empty state should have the shared filled surface treatment.                        |
| `imgUrl`           | Use only when a contextual illustration is needed; otherwise keep the shared empty illustration. |
| `slotProps` / `sx` | Use for deliberate local presentation changes without changing the state contract.               |

**Rules**

- Use `EmptyContent` instead of blank cards, unexplained whitespace, or indefinite loaders.
- Distinguish a first-use empty state from a filtered empty state, permission state, and recoverable error.
- Offer Clear filters for filtered results and a creation/configuration action for a first-use state when the user has permission.
- Do not expose protected data or raw API errors in empty-state copy.
- Keep the empty state inside the region that owns the empty data and preserve the region’s stable geometry.

### 16. Tooltip

Use `CustomTooltip` from `src/components/custom-tooltip/` for concise supplementary information.

**Rules**

- Always use `CustomTooltip` instead of importing MUI `Tooltip` directly for feature UI.
- Pass a concise `title` that explains an icon-only action, abbreviation, or non-obvious control.
- Prefer `placement="right"` for icon-triggered explanatory tooltips so information
  opens beside its trigger; let viewport collision handling flip the tooltip when
  the right side is constrained, and use another placement only when the layout
  requires it.
- Do not put required instructions, validation errors, or essential status information only in a tooltip.
- Icon-only controls must still have an accessible name; a tooltip is not a replacement for `aria-label`.
- Ensure the wrapped child can receive focus and that the information is available through keyboard focus as well as hover.
- Do not use tooltips for long content, interactive forms, or information that should remain visible.

### 17. Accordion

Use `CustomAccordion` from `src/components/custom-accordian/` for collapsible secondary content.

**Configuration**

| Prop       | Rule                                                                      |
| ---------- | ------------------------------------------------------------------------- |
| `title`    | Required concise section label.                                           |
| `content`  | The collapsible content for the section.                                  |
| `expanded` | Control from the owning screen when expansion is meaningful state.        |
| `onChange` | Update the owning expanded state.                                         |
| `isActive` | Use only when the section represents the active context or selected item. |
| `summary` | Optional header element for independent actions; provide its ID and content relationship and a labeled expansion control. |

**Rules**

- Always use `CustomAccordion`; do not recreate the shared accordion styling with raw MUI `Accordion`.
- Use accordions for secondary or optional content, not for required fields that users must discover to complete a task.
- Keep titles specific and preserve the same title/content relationship after expansion.
- Use controlled `expanded` state when expansion affects the workflow, deep links, or another visible region.
- Keep nested accordions shallow and avoid hiding the primary action inside a collapsed section.
- Preserve keyboard expansion, focus visibility, and the expanded state announcement supplied by the native accordion semantics.

### 18. Editor

Use `Editor` from `src/components/editor/` for rich text content.

**Configuration**

| Prop                           | Rule                                                                                               |
| ------------------------------ | -------------------------------------------------------------------------------------------------- |
| `value` / `onChange`           | Keep editor content controlled by the owning form or workflow.                                     |
| `placeholder`                  | Explain the content expected from the user.                                                        |
| `helperText` / `error`         | Connect editor validation to Formik/Yup when the editor is a form field.                           |
| `isToolbarShow`                | Show the toolbar when formatting is supported; hide it only for an intentional constrained editor. |
| `mentionable` / `mentionItems` | Enable only when the workflow supports the corresponding mention contract.                         |
| `fullItem` / `resetValue`      | Use only for the intended editor layout or reset behavior.                                         |

**Rules**

- Always use the shared `Editor`; do not introduce another rich-text editor for the same frontend surface.
- Treat editor output as user input: validate required state, length, and allowed content before submission.
- Use Formik and Yup when the editor is part of a form, and show errors through the editor’s `error` and `helperText` props.
- Preserve the editor value when validation fails and sanitize or normalize content at the owning boundary according to the API contract.
- Do not use rich text when plain text is sufficient; keep the toolbar proportional to the task.
- Ensure placeholder, toolbar controls, links, images, and fullscreen behavior remain keyboard accessible.

### 19. Scrollbar

Use `Scrollbar` from `src/components/scrollbar/` as the shared scroll container; the component name uses a lowercase `b` in the source export.

**Rules**

- Use `Scrollbar` when a bounded region, dialog body, drawer body, table region, or long panel needs controlled scrolling.
- Assign one clear scroll owner to each region; do not create nested scrollbars without a documented interaction need.
- Keep `minHeight: 0` on flex ancestors so the scrollbar can shrink and own the available height.
- Keep table scrolling inside the table container and dialog/drawer body scrolling inside the body region.
- Do not use arbitrary viewport calculations or document-level overflow to imitate available height.
- Preserve keyboard scrolling and visible focus for the scrollable region.
- Use `fillContent`, `naturalScroll`, `slotProps`, and `sx` only when the layout requires them; do not use them to conceal broken flex sizing.
- Verify narrow screens do not create page-level horizontal scrolling.

### 20. Hooks

All reusable hooks under `src/hooks/` must follow this shared contract.
Use the existing hook that matches the state or browser behavior before creating a new hook.

**Current hook inventory**

| Concern                         | Existing hooks                                                                    |
| ------------------------------- | --------------------------------------------------------------------------------- |
| Boolean and object state        | `useBoolean`, `useSetState`                                                       |
| Form and confirmation workflows | `useConfirmDialog`, `useConfirmWithUndo`                                          |
| Persistence                     | `useLocalStorage`, `useCookies`                                                   |
| Timing and interaction          | `useDebounceEffect`, `useDoubleClick`, `useEventListener`, `useKeyboardShortcuts` |
| Clipboard and connectivity      | `useCopyToClipboard`, `useOffLine`                                                |
| Responsive and scroll state     | `useResponsive`, `useWidth`, `useScrollOffSetTop`                                 |
| Navigation state                | `useSearchParam`, `useNewSearchParam`, `useCustomSearchParams`, `useTabs`         |
| Domain options                  | `useAccountHeadOptions`                                                           |

**Rules**

- Reuse a hook from `src/hooks/` when it already provides the required behavior; do not duplicate `useBoolean`, search-parameter, responsive, debounce, event-listener, or persistence logic inside a feature.
- Name new hooks with the `use` prefix and place reusable cross-feature hooks in `src/hooks/`; keep feature-only hooks beside the owning feature when they are not broadly reusable.
- Keep hooks focused on one state, side effect, browser integration, or domain adapter; do not build a hook that silently owns unrelated UI, API, and navigation behavior.
- Follow the Rules of Hooks: call hooks only at the top level of React components or other hooks, never inside conditions, loops, callbacks, or event handlers.
- Keep hook inputs and return values strongly typed; avoid `any` when the hook crosses a feature or module boundary.
- Return a stable, documented shape. Use `useMemo` for returned objects and `useCallback` for returned handlers when referential stability affects consumers.
- Include every reactive value used by an effect, memo, or callback in its dependency list; do not suppress dependency warnings without a documented correctness reason.
- Keep effects for synchronization and external side effects, not for values that can be derived during render.
- Clean up event listeners, timers, subscriptions, observers, media-query listeners, and object URLs when dependencies change or the component unmounts.
- Debounce user typing or high-frequency side effects with `useDebounceEffect` or an equivalent controlled pattern; do not debounce state that must update immediately for visible input.
- Do not let stale async responses overwrite newer state; cancel, ignore, or sequence requests when a hook performs asynchronous work.
- Keep loading, error, empty, and retry behavior explicit for hooks that wrap API or option queries.
- Do not trigger toasts, dialogs, navigation, or mutations from a generic state hook unless that side effect is the hook’s documented ownership boundary.
- Keep server state in RTK Query or the established API client; hooks may compose query results but must not create a second cache or duplicate request layer.
- Use `useSearchParam` or the appropriate search-parameter hook for durable, shareable filters, tabs, views, sorting, and pagination; do not maintain a competing local state store for the same URL value.
- Use `useTabs` for local peer-tab state only when the selected view does not need reload, deep-link, or browser-history persistence; use URL-backed state for durable tabs.
- Use `useResponsive` and `useWidth` for breakpoint behavior instead of reading `window.innerWidth` directly in feature components.
- Use `useLocalStorage` only for personal display preferences such as density or column visibility; do not store tenant-sensitive records, permissions, tokens, or authoritative business state there.
- Use `useCookies` only for the established cookie contract and never store secrets or raw access tokens in a new cookie hook usage.
- Use `useEventListener` for browser/document listeners so handler updates and cleanup follow the shared implementation.
- Use `useConfirmDialog` or `useConfirmWithUndo` for their established confirmation workflows; do not implement competing confirmation behavior in a generic hook.
- Use `useCopyToClipboard` for copy interactions and report success/failure through the owning UI feedback pattern.
- Use `useOffLine` for connectivity-aware presentation; do not treat offline state as proof that an API mutation succeeded or failed.
- Keep domain hooks such as `useAccountHeadOptions` responsible for mapping their API data into options while leaving field rendering and Formik ownership to the form.
- Avoid expensive calculations on every render; memoize derived collections when the computation or downstream rendering is meaningfully expensive.
- Do not use a hook to bypass permission checks, tenant isolation, backend validation, or server-side authorization.
- Document non-obvious hook invariants, cleanup requirements, URL serialization, cache assumptions, and performance decisions near the hook or in its owning design section.

**Validation**

- Verify hooks obey the Rules of Hooks and have typed inputs and outputs.
- Verify effects clean up listeners, timers, subscriptions, observers, and async work.
- Verify dependency changes do not create duplicate requests, stale updates, or infinite render loops.
- Verify URL-backed hooks survive reload, back/forward navigation, and invalid parameter values.
- Verify responsive hooks behave at the project’s standard viewports.
- Verify persistence hooks handle unavailable storage, serialization failures, and reset behavior safely.
- Verify async/domain hooks handle loading, success, empty, error, retry, and unmount states.

### 21. Calendar

Use `CommonCalender` from `src/components/calender/` for calendar views.
The component name and folder use the existing project spelling `Calender`; preserve that import path and export name in new usage.

`CommonCalender` is built on FullCalendar and owns the shared calendar toolbar, view switching, date navigation, event rendering, selection, drag/drop, and resize integration.

**Configuration**

| Prop                                 | Rule                                                                                                                        |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `data`                               | Required event source; pass normalized FullCalendar event data or `undefined` while loading.                                |
| `isLoading`                          | Pass the API or workflow loading state so the shared toolbar can show loading feedback.                                     |
| `initialView`                        | Set the initial FullCalendar view appropriate to the workflow.                                                              |
| `initialDate`                        | Set the initial date when the screen has a selected or URL-backed date context.                                             |
| `showCalendarToolbar`                | Keep enabled for normal calendar navigation; disable only when the owning layout provides an equivalent complete toolbar.   |
| `formate`                            | Use the established date display format when the toolbar needs a specific format.                                           |
| `viewOptions`                        | Pass only supported view choices with stable `value`, visible `label`, and an icon identifier.                              |
| `onDateClick`                        | Handle event selection or click behavior in the owning workflow.                                                            |
| `onEventDrop`                        | Handle drag/drop persistence when the workflow permits moving events.                                                       |
| `onEventResize`                      | Handle resize persistence when the workflow permits changing event duration.                                                |
| `showCalendarFilter` / `onOPenFiler` | Use when the calendar has a filter workflow; preserve the existing prop spelling `onOPenFiler`.                             |
| `renderCompToHeader`                 | Add compact, calendar-specific header content only.                                                                         |
| `canReset`                           | Enable the toolbar’s reset/today behavior only when reset is meaningful for the view.                                       |
| `containerProps`                     | Use for intentional container sizing and flex layout; preserve the calendar’s available height and avoid document overflow. |

**Preferred usage**

```tsx
<CommonCalender
  data={calendarEvents}
  isLoading={isLoading}
  initialView="dayGridMonth"
  showCalendarToolbar
  onDateClick={handleEventClick}
  onEventDrop={handleEventDrop}
  onEventResize={handleEventResize}
  containerProps={{ sx: { flexGrow: 1, minHeight: 0 } }}
/>
```

**Rules**

- Always use `CommonCalender` for shared calendar UI; do not instantiate `@fullcalendar/react` directly in feature screens.
- Import it from `src/components/calender` using the existing name `CommonCalender`.
- Normalize API records into FullCalendar event objects before passing them as `data`; do not pass raw backend records when they do not match the event contract.
- Keep event identifiers stable and include the information required for the visible title, start, end, all-day state, and event styling.
- Use the owning API/RTK Query hook for event data and pass its loading state to `isLoading`.
- When the API supports server-side date ranges or filters, request only the required range and refetch when the calendar view/date/filter changes.
- Do not load an unbounded event collection into the browser when the backend supports range-based or server-side loading.
- Handle `onEventDrop` and `onEventResize` as mutations owned by the workflow; show loading and success/error feedback and refetch or invalidate affected event data after success.
- Do not optimistically move or resize an event unless rollback behavior is defined for mutation failure.
- Keep date and timezone conversion at the API/view-model boundary; do not mix display-local dates with API timestamps accidentally.
- Use the shared toolbar for previous, next, today, date, and view controls; do not create duplicate calendar navigation controls around the component.
- Use `showCalendarFilter` and `onOPenFiler` only for the calendar’s filter workflow; keep unrelated page filters outside the calendar.
- Use `renderCompToHeader` only for concise calendar-specific controls that fit beside the toolbar.
- Preserve the calendar’s full-height flex chain and ensure the calendar region, not the document, owns its scrolling.
- Provide an explicit empty state when there are no events; do not leave a blank calendar without explaining that no events were found when the workflow needs that context.
- Keep event click, date selection, drag/drop, and resize behavior keyboard and pointer accessible according to the FullCalendar interaction contract.
- Use `CommonCalender` for general calendar views; use `AcademicDatePicker` only for academic-calendar-aware form date selection as documented above.

**Validation**

- Verify the feature imports `CommonCalender` from `src/components/calender`.
- Verify API event data is normalized into the expected FullCalendar shape.
- Verify loading, empty, error, filtered, and populated calendar states.
- Verify toolbar navigation, today/reset, view switching, initial date, and initial view.
- Verify event click, date selection, drag/drop, and resize behavior where enabled.
- Verify successful mutations update or invalidate calendar data and failures preserve or restore the correct event position.
- Verify timezone/date formatting and responsive full-height behavior without document-level overflow.

### 22. Chart

Use the shared `<Chart />` component from `src/components/chart/` for dashboard and analytical visualizations.
Use `useChart` from the same module when the chart needs shared theme-aware defaults or chart option composition.

The shared `Chart` API accepts ApexCharts-style `type`, `series`, and `options` values and translates them to the current Highcharts renderer internally.
Feature screens must use the shared API and must not depend directly on the underlying chart engine.

**Configuration**

| Prop           | Required configuration                                                                                                                                                                                    |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`         | Required supported chart type: `line`, `area`, `bar`, `pie`, `donut`, `radialBar`, `scatter`, `bubble`, `heatmap`, `candlestick`, `boxPlot`, `radar`, `polarArea`, `rangeBar`, `rangeArea`, or `treemap`. |
| `series`       | Provide data in the shape expected by the selected chart type; keep series names, categories, and values stable.                                                                                          |
| `options`      | Pass chart-specific labels, colors, axes, legends, tooltips, data labels, and interaction options.                                                                                                        |
| `width`        | Defaults to `100%`; use the default unless the chart is intentionally bounded by its parent.                                                                                                              |
| `height`       | Set a deliberate height or inherit the parent’s stable chart geometry; do not allow layout jumps between loading, empty, and loaded states.                                                               |
| `loadingProps` | Use only for loading-related styling supported by the shared component; coordinate request loading with the owning card/skeleton state.                                                                   |
| `sx`           | Use for chart placement and bounded layout styling; do not use it to replace responsive chart options or create page overflow.                                                                            |

**Preferred usage**

```tsx
import { Chart, useChart } from 'src/components/chart';

const chartOptions = useChart({
  labels: categories,
  colors: ['#1976D2', '#42A5F5'],
  xaxis: { categories },
  legend: { position: 'bottom' },
});

<Chart
  type="bar"
  series={[
    { name: 'Admissions', data: admissionCounts },
    { name: 'Withdrawals', data: withdrawalCounts },
  ]}
  options={chartOptions}
  height={360}
/>;
```

**Rules**

- Always use `<Chart />` from `src/components/chart`; do not import `@highcharts/react`, ApexCharts, or another chart renderer directly in feature screens.
- Use `useChart` for shared theme-aware defaults and compose feature-specific options on top of it.
- Select the chart type based on the relationship users need to understand; do not use a decorative chart when a table or KPI is clearer.
- Keep the data series in a stable, view-ready shape and normalize API responses before passing them to `Chart`.
- Use shared formatters from `src/utils/` for currency, numbers, percentages, dates, and tooltip values.
- Use consistent colors, labels, legends, and status meanings across related charts; do not use color as the only way to communicate a value or state.
- Keep categories and series data aligned; handle missing, null, and zero values deliberately instead of allowing malformed points to distort the chart.
- Do not pass raw API envelopes, unbounded records, or unstable object constructions directly into the chart.
- Memoize expensive series and options projections when they are derived from large datasets or would cause unnecessary chart recreation.
- Preserve a stable chart container height across loading, empty, error, and populated states.
- Render a chart-specific loading treatment while the request is loading and an explicit empty state when there is no usable series data; do not show an empty axis or a blank card without explanation.
- The shared `Chart` component treats empty arrays or series with empty data arrays as empty; ensure the owning screen distinguishes loading from empty before rendering the chart.
- Keep request loading, error, retry, and permission state in the owning card or screen; the chart must not make API requests itself.
- Add a visible title or surrounding accessible context that identifies what the chart represents.
- Provide accessible summaries, legends, table alternatives, or supporting text when the chart alone is insufficient for keyboard and screen-reader users.
- Ensure tooltips and interactive points are not the only way to discover important values.
- Keep chart controls, filters, and exports outside the chart renderer in the owning card header or toolbar.
- Do not introduce page-level horizontal scrolling; allow chart-specific internal behavior only when the visualization genuinely requires it.
- Use responsive option values and parent sizing for narrow screens; verify labels, legends, and tooltips remain usable at mobile widths.

**Validation**

- Verify the screen imports `Chart` from `src/components/chart` and does not import the underlying chart engine.
- Verify the selected `type`, `series`, and `options` are compatible and data/category lengths align.
- Verify loading, empty, error, permission, zero-data, and populated states.
- Verify theme colors, labels, number/date formatting, legends, tooltips, and responsive sizing.
- Verify accessible title/context, supporting data summary or table alternative, keyboard interaction, and no document-level horizontal overflow.

### 23. Redux and API integration

Use Redux Toolkit and RTK Query for shared client state and API access.
The authenticated RTK Query base service is `src/redux/service.ts`, the store is configured in `src/redux/store.ts`, and feature API services are added through `injectEndpoints` under `src/redux/`.

**Architecture**

| Concern                | Source of truth                        | Rule                                                                                                                 |
| ---------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Authenticated API base | `src/redux/service.ts`                 | Reuse the shared `api` base query; do not create a second fetch or Axios base client for a feature.                  |
| Store registration     | `src/redux/store.ts`                   | Register only actual standalone reducers/API services that are not already composed through the shared service.      |
| RTK Query tags         | `src/redux/tagTypes.ts`                | Add a domain tag before using it in `providesTags` or `invalidatesTags`.                                             |
| Feature endpoints      | `src/redux/<module>/...`               | Define the query/mutation contract close to the owning module and inject endpoints into the appropriate API service. |
| Generated hooks        | Feature API file exports               | Export and use the generated `use...Query`, `useLazy...Query`, and `use...Mutation` hooks.                           |
| Screen integration     | `src/screens/...`                      | Call the generated hook from the owning screen/container and map the response into the view model.                   |
| Shared request wrapper | `src/redux/customQueryAndMutation.tsx` | Use when the screen needs standardized refetch behavior and shared toast-based error handling.                       |

**How to add a new API**

1. Confirm the backend endpoint, request parameters, response shape, permissions, tenant scope, and mutation semantics with the owning backend contract.
2. Define typed request, response, and view-boundary contracts in the feature API area; do not pass untyped `any` across a new module boundary.
3. Add a specific tag to `src/redux/tagTypes.ts` if the endpoint’s cache domain is not already represented.
4. Select the correct existing API service, such as the shared `api` or a module API that already owns the domain.
5. Add the endpoint with `builder.query` or `builder.mutation` through `injectEndpoints`.
6. Build query URLs and parameters in one place, including pagination, search, filters, sort, tenant context, and academic context where required.
7. Normalize the response with `transformResponse` when the backend envelope does not match the frontend view contract.
8. Add `providesTags` for queries and precise `invalidatesTags` for mutations so affected lists, details, and option queries refresh correctly.
9. Export the generated hook from the API file.
10. Import the generated hook in the owning screen or feature hook, pass stable arguments, and use `skip` when required context is not available.
11. Connect the hook’s loading, fetching, error, empty, and retry states to the appropriate shared UI components.
12. Add focused API contract tests and screen/component tests for request arguments, response mapping, cache invalidation, and failure behavior.

**Concrete example: vehicle management**

The vehicle-management API at `src/redux/transport/vehicle-management/vehicle-management-api.ts` demonstrates the expected pattern:

```tsx
// API service: inject an endpoint into the transport API.
export const vehicleManagementApi = transportApi.injectEndpoints({
  endpoints: (builder) => ({
    getVehicleManagementData: builder.query<VehicleListResponse, VehicleListQuery | void>({
      query: buildVehicleListRequest,
      transformResponse: normalizeVehicleListResponse,
      providesTags: [transportType.vehicleManagement],
    }),
  }),
  overrideExisting: false,
});

export const { useGetVehicleManagementDataQuery } = vehicleManagementApi;
```

The screen consumes the generated hook through the shared wrapper when it needs standardized refetch and error behavior:

```tsx
const { data, isLoading, isFetching } = useQueryAndMutation({
  type: 'query',
  currentQueryAndMutation: useGetVehicleManagementDataQuery,
  params: {
    academicMediumId: currentMedium?.id,
    pageNumber: page + 1,
    pageSize: rowsPerPage,
    search,
    status,
  },
  options: { skip: !currentMedium?.id },
});
```

For a mutation, use the generated mutation hook and unwrap the result before reporting success or failure:

```tsx
const [updateVehicle, { isLoading: isUpdateLoading }] = useUpdateVehicleMutation();

try {
  await updateVehicle({
    vehicleId,
    academicMediumId: currentMedium.id,
    body: payload,
  }).unwrap();
  shikshaMitraToast.success({ message: 'Vehicle updated successfully.' });
} catch (error: any) {
  shikshaMitraToast.error({
    message: error?.data?.message || 'Unable to update the vehicle. Please try again.',
  });
}
```

**Rules**

- Use RTK Query generated hooks for API calls; do not call `fetch`, Axios, or a new custom HTTP client directly from screens.
- Reuse the authenticated base service and its token, credentials, content-type, and unauthorized-response behavior.
- Keep endpoint definitions in the owning `src/redux/` module, not inside page components.
- Use `builder.query` for reads and `builder.mutation` for creates, updates, deletes, uploads, and other server-side writes.
- Use `injectEndpoints` with `overrideExisting: false` unless an explicit replacement contract is required.
- Add and use precise tag types; do not invalidate the entire API cache for a single record mutation.
- A list query should provide its collection tag, and record mutations should invalidate the affected record and collection tags where appropriate.
- Keep query arguments serializable, stable, and complete; include every API input that changes the result.
- Use `skip` when required tenant, academic-year, academic-medium, route, or record context is missing; do not send incomplete requests.
- Use `isLoading` for the first request, `isFetching` for background refetch, and preserve safe existing data during refetch.
- Normalize backend response envelopes at the API boundary with `transformResponse`; screens should consume a predictable frontend shape.
- Keep backend response contracts and permission/tenant rules owned by backend documentation; frontend adapters must not weaken authorization assumptions.
- Use server-side pagination, search, filtering, and sorting when the endpoint supports them, and pass the table’s query state into the generated hook.
- For server-side tables, pass API `totalCount` to `CustomizableTable` and connect its callbacks to query state updates.
- Use `useQueryAndMutation` when the screen needs its standard refetch-on-mount/focus/reconnect behavior and shared error-toast handling; do not add duplicate effects for the same behavior.
- Do not show a success toast from an endpoint definition; report mutation outcomes in the owning workflow through `shikshaMitraToast`.
- Call `.unwrap()` for mutation promises when the workflow needs normal try/catch control and a reliable success boundary.
- Prevent duplicate mutations while the generated mutation hook reports loading.
- Keep API hooks at the component or custom-hook top level; do not call generated hooks conditionally or inside event handlers.
- Use lazy query hooks for explicit user-triggered fetches such as downloads, previews, or searches that should not run on mount.
- Do not duplicate the same query in a screen and a child component unless each call has a distinct documented argument or ownership boundary.
- Keep selectors and traditional Redux slices for client-owned state such as UI state, active context, confirmation state, and preferences; keep server state in RTK Query.
- Do not persist API cache, access tokens, tenant records, or sensitive server data in a new Redux-persist whitelist entry without an explicit security and lifecycle decision.

**Validation**

- Verify the new endpoint uses the shared authenticated API service and correct module boundary.
- Verify request URL, method, params/body, required context, and response normalization.
- Verify generated hooks are exported and called at the correct component level.
- Verify `skip` prevents incomplete requests and query arguments update when filters, pagination, or context change.
- Verify loading, fetching, empty, error, unauthorized, retry, and stale-data behavior.
- Verify mutation success, failure, duplicate-submit prevention, toast behavior, and cache invalidation.
- Verify server-side table integration when the API supports pagination, search, sort, or filters.
- Add or update focused API contract tests and component/screen tests for the integration.

### 24. Utilities

Use the shared utility functions under `src/utils/` whenever a screen, component, hook, Redux adapter, or form needs behavior that is reusable, deterministic, or already implemented elsewhere.
Do not duplicate formatting, parsing, validation, permission, serialization, or calculation logic inside feature components.

**Utility categories**

| Need                                                | Use the existing utility area                                                                                                      |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Date/time display and comparison                    | `src/utils/format-time.ts`, `src/utils/date-only.ts`, `src/utils/dateConvertor.ts`                                                 |
| Number, currency, percentage, and file-size display | `src/utils/format-number.ts`, `src/utils/cureencyFormater.ts`                                                                      |
| API error normalization                             | `src/utils/api-problem-details.ts`                                                                                                 |
| Permission checks                                   | `src/utils/permissions.ts`                                                                                                         |
| Input normalization                                 | `src/utils/input-format.ts`, `src/utils/validate-phone-number.ts`                                                                  |
| HTML safety                                         | `src/utils/sanitize-html.ts`                                                                                                       |
| File and Base64 conversion                          | `src/utils/file-to-base64.ts`, `src/utils/base64ToFile.ts`, `src/utils/base64Formate.ts`, `src/utils/get-base64-string.ts`         |
| Query and collection helpers                        | `src/utils/sort-query-string.ts`, `src/utils/helper.ts`                                                                            |
| Academic hierarchy and scope                        | `src/utils/academicHierarchyUtils.ts`, `src/utils/academic-year.ts`                                                                |
| Domain calculations and mappings                    | The owning utility file, such as `fee-structure-assignment-calculations.ts`, `distributeConcession.ts`, or `timetable-capacity.ts` |
| Stable IDs and storage                              | `src/utils/uuidv4.ts`, `src/utils/storage-available.ts`                                                                            |
| Shared icon constants                               | `src/utils/icons.ts`, subject to the Iconify/`mdi:` rules above                                                                    |

**Preferred usage**

```tsx
import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';

const displayDate = fDate(row.createdAt);
const displayAmount = fCurrency(row.amount);

try {
  await saveRecord(payload).unwrap();
} catch (error) {
  const problem = parseApiProblemDetail(error);
  shikshaMitraToast.error({
    message: problem.detail || 'Unable to save the record. Please try again.',
  });
}
```

**Rules**

- Before writing a local helper, search `src/utils/` for an existing function with the same responsibility and reuse it when the contract matches.
- Use shared date/time utilities such as `fDate`, `fDateTime`, `fTime`, `fTimestamp`, `fDateRangeShortLabel`, `toDateOnly`, and `formatDateOnly`; do not call `toLocaleString`, `toLocaleDateString`, or ad-hoc date formatting throughout feature components.
- Use shared number and currency utilities such as `fNumber`, `fCurrency`, `fPercent`, `fShortenNumber`, and `formatCurrency`; keep formatting consistent across tables, cards, forms, exports, and charts.
- Use `parseApiProblemDetail` to convert API failures into safe user-facing error copy before calling `shikshaMitraToast`; do not expose raw response objects or server exception text.
- Use `hasGrantedPermission` for frontend visibility and interaction guards; never treat a utility check as a replacement for backend authorization.
- Use shared input-format and phone-validation helpers for field normalization so the same value is accepted and displayed consistently across forms.
- Use `sanitizeHtml` before rendering user-provided rich text as HTML; do not use `dangerouslySetInnerHTML` with unsanitized content.
- Use the Base64/file utilities for file conversion and keep file serialization at the form/API boundary rather than inside presentation components.
- Use shared academic hierarchy, academic-year, and scope utilities for tenant/academic context mapping; do not recreate hierarchy traversal or scope compression locally.
- Use domain calculation utilities for financial, timetable, fee, concession, and capacity calculations; do not duplicate business calculations in render functions.
- Keep utilities deterministic and side-effect free wherever possible; a utility should not trigger navigation, toast notifications, Redux dispatches, API calls, or component state updates unless its file explicitly owns that integration contract.
- Keep browser-only utilities guarded when they access `window`, `document`, local storage, cookies, or URL APIs so server rendering remains safe.
- Keep utility inputs and outputs typed and serializable at module boundaries; avoid adding new `any`-based helpers for shared behavior.
- Place a new utility in the narrowest domain file that owns the rule, and give it a descriptive name based on the outcome rather than the implementation.
- Do not place feature-specific UI rendering in `src/utils/`; return data, labels, flags, or serialized values and let components render them.
- Do not create multiple utilities with different names that perform the same formatting or parsing behavior.
- Add unit tests for non-trivial utilities, edge cases, null/undefined inputs, invalid values, timezone boundaries, rounding, and permission/scope branches.
- When changing a utility used by multiple modules, run focused tests for the utility and affected consumers before handing off the change.

**Validation**

- Verify an existing utility was searched for and reused before adding a new helper.
- Verify dates, numbers, currencies, statuses, API errors, and user input use the shared utility contract.
- Verify null, undefined, malformed, boundary, timezone, rounding, and empty inputs.
- Verify browser-only utilities are safe during server rendering.
- Verify non-trivial utility changes have focused unit tests and do not regress affected screens.

### Component contract template

Use the following subsections for every component above.
