---
title: Complex Dialog and Drawer UI Guidance
status: draft
owner: frontend-team
scope: data-entry-dialogs-and-drawers
---

# Complex dialog and drawer guidance

Use this with [forms.md](forms.md) when a form contains repeating groups, several sections, or enough content to scroll. Use [popups.md](popups.md) for short decisions and confirmations.

## Choose the surface

- Keep a centered dialog for a short form whose fields and actions remain easy to review together.
- Use a full-height drawer when the user should retain the list context while editing a long or repeatable form. Use a page when the workflow needs substantial navigation or comparison.
- Match nearby screens' drawer width, header, scroll container, and footer. On small screens, use the available viewport width without horizontal page scrolling.

## Organize the form

- Give distinct field groups concise headings. Keep repeated items compact, with their entered names as headings once available.
- Give primary names and long selectors enough width. Move toggles and optional fields to their own row when a third column would compress the main inputs.
- Keep frequently used descriptions visible beside their related fields. Use disclosure only for genuinely secondary fields, while always showing existing values and validation errors.
- Keep internal identifiers secondary to readable labels. Preserve the full value in the selector and its accessible name when truncation is necessary.
- Disable unavailable row actions in place and explain why; do not make an enabled action lead only to an error message.

## Scrolling, actions, and focus

- Keep the header and action footer fixed within the drawer or dialog. Let one body region scroll; avoid nested scroll areas for ordinary fields.
- Keep the save action reachable at supported viewports. During saving, show progress and prevent duplicate submission and accidental closing.
- After a failed submission, expose the relevant errors and move focus to the first invalid control or the action needed to complete an empty required collection. Preserve entered values.
- Confirm closing only when unsaved work would be lost. Return focus to the launching action after the surface closes.
