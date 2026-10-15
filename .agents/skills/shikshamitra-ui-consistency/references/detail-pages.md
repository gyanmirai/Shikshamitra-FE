# Read-only detail views

Adapted from [detail-view rules](../../shikshamitra-fe-patterns/references/detail-views.md) and
[DESIGN.md](../../../../DESIGN.md). The source rulebook primarily covers contextual record views;
dedicated pages also follow the page-header pattern and owning module navigation.

## When to use

Use for record identity, status, facts, dependencies, restrictions, and meaningful related actions.
Use a centered dialog for compact details, a wider dialog/drawer for grouped contextual data, and
a dedicated page for deep navigation, long history, or a complete record workspace.

## Reference image

Image pending: `assets/detail-page.png`. See [image references](image-references.md).
Expected callouts: 1 identity/status, 2 key facts, 3 dependencies, 4 real restrictions, 5 related actions.
Record whether the supplied image depicts a page, dialog, or drawer; do not copy its shell into
all three surfaces. Read the appropriate shell guide as well.

## How to build

1. Use the approved page/dialog/drawer shell. Identify the record immediately, with its name and
   meaningful current status; add type/category only when it gives different information.
2. Organize useful information in this order: identity/status, key metrics/dependencies, related
   records, real restrictions/impact, and useful actions. Include only sections that have value.
3. Render read-only labels and values, not disabled edit controls that make the view look unfinished.
   Use shared status, chip, formatting, spacing, and section components where appropriate.
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

## Code reference

Inspect the current detail implementation in the owning module and its page/dialog/drawer shell.
Reuse `src/components/custom-breadcrumbs/`, `src/components/customDialog/`, and shared section/status
components where the selected surface needs them; do not invent a universal detail component API.
