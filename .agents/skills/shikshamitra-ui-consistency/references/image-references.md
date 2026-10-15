# Reference images

The user will attach the reference images after the structure and written rules are complete.
There are currently no attached images. Expected filenames below are reserved slots, not existing
files; do not render broken image embeds or claim a visual comparison has been performed.

| Pattern | Expected file relative to skill folder | Status |
| --- | --- | --- |
| Page header and breadcrumbs | `assets/page-header.png` | Pending attachment |
| Full-height table workspace | `assets/table-workspace.png` | Pending attachment |
| Form dialog | `assets/form-dialog.png` | Pending attachment |
| Drawer | `assets/drawer.png` | Pending attachment |
| Confirmation or reason request | `assets/confirmation.png` | Pending attachment |
| Read-only detail surface | `assets/detail-page.png` | Pending attachment |

## Attach and document an image

1. Place the supplied image in `assets/` using its reserved filename. If the image is JPEG/WebP,
   preserve its actual format and update the filename here, the main router, and its pattern guide.
   Do not rename a JPEG file to `.png` without converting it.
2. Open and inspect the image before marking it attached. Identify the depicted pattern and shell;
   ask only if an ambiguous screenshot cannot be matched to a pattern from its content/context.
3. In the matching guide replace its pending-image paragraph with an actual relative Markdown
   image embed, for example `![Form dialog reference](../assets/form-dialog.png)`.
4. Document the source screen/route or component when known, module family, viewport when known,
   light/dark theme, state, and user-specified details to preserve. Mark unknown metadata as unknown.
5. Map numbered markers, if present, to title, section, field, action, and scroll-region rules.
   If the image has no markers, describe those parts in text without claiming it was annotated.
6. Check the image against the written rules. Record any mismatch and its location rather than
   silently copying a stale defect or changing a rule. A user-requested exception is scoped to
   the affected pattern; conflicting security/backend requirements remain governing.
7. Mark the table row Attached only after the file and guide metadata agree. Keep pending rows
   explicit. Remove identifying record values before committing screenshots when necessary.

## Use during implementation

- Inspect attached images with the available image-viewing tool, rather than inferring their
  contents from filenames. Read the written guide alongside the image.
- Compare hierarchy, placement, density, spacing, and semantic treatment using the theme and
  component contract. Do not hardcode pixel guesses, screenshot text, record data, or colors.
- Validate states, themes, and viewports absent from the screenshot independently. Missing images
  do not block rule-based implementation; report visual matching as Unverified until evidence exists.
