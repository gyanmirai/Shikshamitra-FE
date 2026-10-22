# Status labels, chips, and identity colors

Use this guide wherever a table, record header, card, or attachment shows a state or selected item.
Use the same domain label and semantic treatment across its list, detail, and form views.

## Component choice and current API

| Need | Existing reference / contract |
| --- | --- |
| Compact non-interactive status | [Label](../../../../src/components/label/label.tsx), [types](../../../../src/components/label/types.ts). `color`, `variant`, `startIcon`, `endIcon`, and Box props; defaults `color="default"`, `variant="soft"` |
| Selected filter/value, removable tag, or interactive chip | MUI Chip with the existing theme. Preserve actual `onClick`/`onDelete`, disabled state, and accessible name; do not make a plain Label behave like a button |
| Saved subject identity | [SubjectColorIndicator](../../../../src/components/subject-color/SubejctColor.tsx). Saved identity color is distinct from success/warning/error status |
| Domain-specific scheduling state | [Timetable status chip](../../../../src/components/timetable-status-chip/TimetableStatusChip.tsx); inspect its exports before reuse |

The Label theme owns its 24 px height, compact typography, padding, and radius. Supported variants
are soft, filled, outlined, and inverted; colors are default and the existing semantic palette.
Do not create another badge primitive or add severity colors to every descriptive value.

## Rules

- Derive status text from the real enum/domain mapping. Keep the same mapping in each owning module;
  do not impose a universal color for unrelated states merely because they share a word.
- Use success for an established successful/ready state, warning for attention, error for a real
  failure/restriction, and neutral/info for non-error context as defined by the workflow.
  A score, status label, color, and icon must agree; zero or missing data is not proof of health.
- Include readable text. Color or an unexplained dot alone does not communicate status.
- Keep status compact and secondary to record identity. Explain restrictions visibly when they
  affect the next action; a badge is not a replacement for that explanation.
- Preserve entered names and acronyms. Label only uppercases the first character of string children;
  do not rely on it to normalize domain copy or truncate long content accessibly.
- Selected chips have stable IDs, specific removal names, contained overflow, and reachable hidden
  values. Follow [multi-selects](multi-selects.md) for field tags and [tables](tables.md) for filters.

## Image and checks

![Local Subject Creation workspace showing compact Active labels](../assets/local-subject-workspace.jpg)

See [capture metadata](image-references.md#local-app-captures-22-october-2026). This establishes the
Subject list's normal Active treatment, not every status mapping or an authorization result.
Check long/translated labels, dark theme, icon/text meaning, and chip removal with a keyboard.
