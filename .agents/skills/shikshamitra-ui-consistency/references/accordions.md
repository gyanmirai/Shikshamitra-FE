# Accordions and expandable secondary content

Follow [DESIGN.md Accordion](../../../../DESIGN.md#17-accordion) and reuse
[CustomAccordion](../../../../src/components/custom-accordian/index.tsx). Do not replace it with a
local styled MUI accordion solely to change appearance.

## Current API

`title` and `content` are required. `expanded`, `onChange(event)`, `isActive`, and `summary` are
optional. The wrapper discards MUI's second `expanded` callback argument; do not write a caller
expecting `onChange(event, expanded)`. Derive the next controlled state at its existing owner.
`summary` replaces the default header, including its expansion control and accessibility wiring.

## Rules

- Use collapsible regions for secondary details or context. Keep primary actions and required
  fields discoverable. If an existing flow contains validation errors inside a collapsed region,
  reveal the region and move focus to the appropriate field through the owning validation flow.
- Keep a stable, specific heading and its associated content. Use the same section typography,
  icons, and hierarchy as the host workspace instead of decorative nested cards.
- Control `expanded` when the selection, URL, validation, or another visible region depends on it.
  Decide whether multiple sections may remain open from the actual workflow, not a universal rule.
- `isActive` describes the current context and is separate from expanded or selected children.
  Expanding must not grant permissions, select rows, save a form, or alter record state.
- Keep independent header actions outside the expansion button and stop unwanted propagation.
  A replacement `summary` needs a named keyboard-operable expansion control, unique content ID,
  `aria-expanded`/content relationship, and an appropriate heading wrapper.
- Keep expansion state after a recoverable request failure. During blocking operations follow
  the owning form lock; the wrapper has no generic busy/loading API.
- Keep nesting shallow, content scrolling within its host, and long headings/actions contained.

## References and checks

[TeacherDiaryPlanContext](../../../../src/screens/academic/course-management/lessonPlan/components/TeacherDiaryPlanContext.tsx)
is an existing contextual caller; [publication warnings](../../../../src/screens/examination/seatingPlan/guided/steps/publication-warnings.tsx)
is a different consequential-workflow caller. Inspect both APIs and the relevant domain rules
before copying behavior. No dedicated expanded/collapsed screenshot has been verified yet;
[the image inventory](image-references.md) records that limit. Check Enter/Space, focus, expansion
announcement, header actions, error reveal, dirty state, and narrow-screen content.
