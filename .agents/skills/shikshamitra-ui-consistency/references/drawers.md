# Drawers and contextual side panels

Adapted from [sidebar rules](../../shikshamitra-fe-patterns/references/sidebars.md),
[form rules](../../shikshamitra-fe-patterns/references/forms.md), and
[complex dialog guidance](../../shikshamitra-fe-patterns/references/complex-dialogs.md).

## When to use

Use for a long form or contextual record panel that should retain the parent list context. Use a
dedicated page when deep navigation or comparison is the main task. Also read form-dialogs.md
for form validation, neutral Submit actions, loading locks, and unsaved work.

## Reference image

Image pending: `assets/drawer.png`. See [image references](image-references.md).
Expected callouts: 1 title/status/help/close, 2 sections, 3 repeated groups, 4 scrolling body, 5 footer.

## How to build

1. Inspect the owning module's current drawer composition and shared primitives. Match equivalent
   drawer widths and header/footer treatment. Use MUI Drawer if no suitable project shell exists.
2. Keep the panel at its established viewport edge. Bound desktop width to useful content; use full
   width on narrow screens while preserving internal padding and a reachable close action.
3. Use Title Case for the task/record title, preserving entered record names. Align meaningful record
   icon, title, status, and close control consistently. Avoid repeated identity information.
4. Put optional drawer-level context in an accessible info tooltip immediately after status, or after
   the title when status is absent. Put section help beside the relevant section heading.
5. Keep the header and footer stationary within the panel and let one body region scroll. Avoid
   nested scroll areas for ordinary fields. Use a consistent inset across header, sections, and footer.
6. Keep ordinary configuration drawers focused on fields. Do not add policy summaries, decorative
   previews, or completion checklists unless requested; retain required transaction-review steps.
7. Give repeated groups concise headings, using entered names when available. Keep primary names
   and long selectors wide enough; place optional/toggle controls where they do not compress them.

## Actions and states

- Keep read-only panels distinct from editable forms. Use Close for information-only dismissal;
  editable panels follow the form's Cancel/Submit behavior.
- Disable unavailable row actions and explain meaningful restrictions. Avoid enabled controls that
  merely display an avoidable error. Scope state-based visibility to the owning workflow.
- Keep long labels, values, chips, and identifiers contained. Preserve full accessible values when
  visual truncation is needed; show user-facing labels before internal identifiers.
- Preserve values and panel geometry across loads, validation, and failures. For form operations,
  prevent closing and conflicting edits during blocking requests and protect actual unsaved work.
- After failed submission, reveal and focus the relevant error or empty required collection action.
  Return focus to the launching action when the panel closes.

## Responsive and verification rules

- Verify desktop width, mobile full-width behavior, title/status/help order, consistent insets,
  body scroll ownership, reachable footer, close protection, row controls, and keyboard focus.
- Check long/repeated content and the mobile keyboard without horizontal page overflow.

## Code reference

Inspect current drawer usages under the owning `src/screens/` module and their MUI/shared APIs.
Use `src/components/form-section-card/index.tsx` where its API fits the section pattern. Do not
copy `src/components/settings/drawer/` as a CRUD shell merely because its folder is named drawer.
