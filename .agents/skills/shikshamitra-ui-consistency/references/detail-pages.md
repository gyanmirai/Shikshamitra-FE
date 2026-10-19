# Read-only detail views

Adapted from [detail-view rules](../../shikshamitra-fe-patterns/references/detail-views.md) and
[DESIGN.md](../../../../DESIGN.md). The source rulebook primarily covers contextual record views;
dedicated pages also follow the page-header pattern and owning module navigation.

## When to use

Use for record identity, status, facts, dependencies, restrictions, and meaningful related actions.
Use a centered dialog for genuinely compact details, the established Policy-style right drawer
for substantial grouped contextual record information, and a dedicated page for deep navigation,
long history, or a complete record workspace. The Policy view's header, section/help controls,
and saved-detail treatment apply in every shell; using a dialog does not make them optional.

## Reference image

The [view drawer reference](../assets/drawer-view.png) depicts saved Concession Policy details.
For that surface read [sections.md](sections.md) and [drawers.md](drawers.md): preserve its useful
saved details while matching the form's section structure, Title Case headings, typography,
icons, and sentence-case field labels. Do not copy its current heavy/all-caps label overrides.
A dedicated-page reference remains pending at `assets/detail-page.png`; a drawer image does
not establish a page shell. See [image references](image-references.md).

## Required Policy-view anatomy and info controls

```text
Record Name [real status/version when useful] [Info]                  [Close X]
Scrollable body:
  [Leading semantic icon] Section Title [Info]
    Saved labels and values in the corresponding section/grid
  Other meaningful sections with the same heading and info treatment
Stationary footer:                                          [X Close]
```

- The record header must include one visible, accessible information control after the title
  and any useful badges, matching the Policy reference. Keep Close separate at the far right.
  Give the info control a concise explanation of the view's purpose/scope, rather than repeating
  the record name or adding a permanent paragraph beneath it.
- Every standard detail section must include its semantic leading icon, Title Case title, and
  adjacent info control. A leading calendar/receipt icon is not a substitute for the info icon.
  This applies to Fee Details and Amount Breakdown as well as policy sections.
- Use `GlobalIcons.info` through Iconify for new composition: section help uses a 16 px visible
  glyph, theme info color, the existing 4 px title/help gap, and a keyboard-accessible target.
  Give controls names such as `Amount Breakdown information`; show useful help on focus/hover
  and preserve the supported touch behavior. Never use a decorative, noninteractive info glyph.
- Help explains the actual section's content or units. For example, Fee Details can explain
  due period/installment/status; Amount Breakdown can identify the recorded monetary components.
  Do not invent financial equations, policy rules, extra record values, or generic advice.
- Preserve the [section standard](sections.md): subtitle1/600 headings, sentence-case left-aligned
  labels, normal body2 values, shared padding and spacing. A compact read-only dialog must not
  fall back to smaller/differently weighted section headings simply because it is not a form.
- Keep the form/view's meaningful section names, order and saved details. Show relevant money
  with [formatNumber](numeric-format-custom.md#display-numbers-with-formatnumber), useful status
  labels, and real units. Read-only data has no required stars, disabled-input styling or Submit.
  Field-level info is conditional on meaning/complexity; header/section info is required here.

### Wire help through the real component API

| Surface / component | Required integration |
| --- | --- |
| CustomDialog header | Supply a nonempty `titleInfo`; the icon is rendered only when that prop exists. Keep `hasForm={false}` for a pure read-only dialog |
| Policy-style drawer header | Supply actual `helpText` or its supported tooltip-description mode. Inspect the feature-owned header before reuse; it is not a cross-module drawer API |
| FormSectionCard / FormSectionHeader | Supply nonempty `descriptionTooltip` for each section; the shared header renders its info control only when this exists |
| DetailSection | Supply `helpText`, which is forwarded as descriptionTooltip; rendering DetailSection alone does not create help |
| Dedicated detail page | Use the owning page-header help integration and the same shared section controls; retain the module's breadcrumbs/navigation |

Do not assume optional TypeScript props satisfy the visual requirement automatically. Check
that the controls actually render and that opening each one shows the right explanation. Reuse
the shared help components; do not add duplicate title/info rows or unsupported infoText props.
Shared internals still contain literal/MUI info icons; centralizing them is implementation debt,
not permission to omit the control or introduce screen-local icon strings.

## Recorded fee-view mismatch

The supplied [fee-details diagnostic](../assets/detail-view-missing-info.png), inspected on
16 October 2026, shows a light-theme record dialog with Fee Details and Amount Breakdown.
CSS viewport/scale and route are unknown. It lacks header and section info controls; it is
evidence of a consistency gap, not an alternative approved view standard.

The [CollectionLedgerTable view](../../../../src/screens/finance/FeeCollection/FeeCollectionComponent/CollectionLedgerTable.tsx)
now supplies CustomDialog.titleInfo and descriptionTooltip on Fee Details / Charge Details and
Amount Breakdown. Both sections explicitly use subtitle1/600 headings, with secondary
sentence-case labels, the shared responsive grid and spacing, and an outlined Close action.
The diagnostic records the earlier mismatch; preserve the real fee data and use the Policy
reference for presentation, not policy-specific section names or values.

## How to build

1. Use the approved page/dialog/drawer shell. Identify the record immediately, with its name and
   meaningful current status; add type/category only when it gives different information.
2. For every form-backed record view, whether page, dialog, or drawer, preserve the form's meaningful
   section names/order, heading typography, icons, and spacing; place saved details in their
   corresponding sections. Use [sections.md](sections.md) and the appropriate shell guide. For independent
   detail workspaces, organize identity/status, useful dependencies, related records, real
   restrictions/impact, and actions. Include metrics or sections only when they add value.
3. Render read-only labels and values, not disabled edit controls that make the view look unfinished.
   Use shared status, chip, formatting, spacing, and section components where appropriate.
   Dropdowns display their saved option labels; dates/ranges use the same readable format/units
   as the form, following [select](custom-select.md) and [date](date-pickers.md) guidance.
4. Show metrics from real current record data with precise labels and units. Do not repeat the same
   count in header, metric, section title, and chip unless scopes genuinely differ.
5. Keep related chips concise and safely wrapping. For long collections, show a useful subset with
   a real View all destination. Preserve record context when linking to related filtered records.
6. Explain actual restrictions and their consequences. Omit irrelevant warnings, technical counters,
   empty sections, and zero metrics unless the absence/zero itself is meaningful.

## Actions, semantics, and states

- Keep the view primarily read-only. Use Close as the safe action in contextual views and add a
  primary action only when there is a meaningful next step. Preserve state/permission eligibility.
- Explain an unavailable action when discoverability matters; otherwise follow the owning workflow's
  visibility pattern. A screenshot of an action does not establish its permission or availability.
- Archive normally uses neutral secondary styling; danger is for destructive outcomes. Warning
  emphasis belongs to the actual restriction, not every metric, border, chip, and footer action.
- Use the confirmation pattern for consequential actions. Do not add an icon action to every section
  when one record-level action serves the task.
- Use content-shaped loading, accurate error/retry, and relevant empty-state messaging. Never present
  partially loaded details as complete. Keep Close usable during an initial read-only fetch unless
  the workflow specifically requires it blocked; blocking mutations lock conflicting interaction.

## Responsive and verification rules

- Keep related chips, metrics, long names, and values readable without page overflow. Preserve
  keyboard navigation, focus return for contextual views, and the shell's scroll ownership.
- Verify real data, nonduplicated hierarchy, omission of irrelevant sections, restriction semantics,
  available actions, dependency destinations, fetch errors, and narrow-screen behavior.
- Verify the record header and every meaningful section actually render their info controls;
  open each with keyboard and pointer, inspect its content, and compare the layout with the
  Policy reference. A shared wrapper without the required help props is not complete consistency.

## Code reference

Inspect the current detail implementation in the owning module and its page/dialog/drawer shell.
Reuse `src/components/custom-breadcrumbs/`, `src/components/customDialog/`, and shared section/status
components where the selected surface needs them; do not invent a universal detail component API.
