# Form dialogs

Adapted from [form rules](../../shikshamitra-fe-patterns/references/forms.md),
[complex dialog guidance](../../shikshamitra-fe-patterns/references/complex-dialogs.md),
[popup rules](../../shikshamitra-fe-patterns/references/popups.md), and
[DESIGN.md](../../../../DESIGN.md).

## When to use

Use a centered dialog for a short, focused create/edit task. Use a drawer or page for long forms,
repeatable groups, or substantial supporting content. A confirmation is a separate pattern.

## Reference image

Image pending: `assets/form-dialog.png`. See [image references](image-references.md).
Expected callouts: 1 title/help/close, 2 section heading, 3 field grid, 4 validation, 5 stable footer.

## How to build

1. Inspect `CustomDialog`, its current close guard, and `DialogScrollContent`. Use the shared shell
   and scroll content instead of a raw local dialog. Keep one scrollable body and a stable footer.
2. Use a Title Case action/object title, preserving entered record names. Outside Student Onboarding,
   data-entry/review dialogs use the accessible `titleInfo` treatment. Onboarding omits redundant
   generic help while retaining real consequences and errors.
3. Group related fields with `FormSectionCard` when suitable. Use concise section headings and put
   optional section help in an accessible info tooltip, not a repeated static subtitle/banner.
4. Use Formik and Yup with visible labels, consistent required indicators, `size="small"`, and
   `fullWidth` where suitable. Use two columns only when related fields remain readable; give
   names/descriptions adequate width and stack to one column on narrow screens.
5. Let `DialogScrollContent` own outer padding. Follow shared section/field spacing rather than
   adding a second padded shell. Keep warnings and field-specific help beside the relevant input.
6. Keep secondary Cancel before primary Submit in the left-to-right footer. Ordinary create/edit
   submission reads `Submit` and uses neutral theme defaults; do not add primary/success color
   overrides. Reserve `Save draft`, `Publish`, and other outcome labels for distinct workflows.

## Form lifecycle and loading

- Inspect `SubmitButton`/`CancelButton` before reuse. The cancel wrapper currently cannot receive a
  disabled prop; satisfy blocking-state requirements with a supported component or shared extension.
- Wire loading from the actual query/mutation and prevent every duplicate submission path.
- Lock affected controls during dependent loads. During a blocking form request, lock inputs,
  uploads, selectors, Submit, Cancel, Close, Escape, and navigation that could disrupt the operation.
  A dim overlay must also prevent pointer and keyboard interaction; dimming alone is insufficient.
- Preserve form geometry, progress feedback, and entered values during failure/retry. Show specific
  field errors and a form-level error when the server error cannot map to a field.
- After failed submission, expose and focus the first invalid control or required collection action.
- Use existing dirty-state protection at the owning form boundary. Inspect local versus inherited
  dirty-state props; do not clear a parent form's changes from a nested surface.
- After success or confirmed cancellation, reset form values, edit identity, and dialog state.
  Do not reset entered values on failed submission.
- Do not add Ctrl/Cmd+Enter shortcuts or hints. Preserve accessible keyboard submission using the
  current shell's supported API; inspect its native form behavior rather than guessing from examples.

## Responsive and verification rules

- Keep actions reachable while the body scrolls. No nested ordinary-field scroll areas or horizontal
  document overflow. Preserve labels, error associations, focus, and readable tooltip behavior.
- Verify create/edit reopening, validation, dirty close, blocking locks, retry, final reset, field
  stacking, action order, neutral Submit styling, and supported light/dark modes.

## Code reference

Inspect `src/components/customDialog/index.tsx`, `src/components/form-section-card/index.tsx`,
`src/components/submit-button/index.tsx`, and `src/components/cancel-button/index.tsx`.
`src/screens/academic/academic-calendar-management/emergencyClosure/index.tsx` is a useful wiring
reference, not an exemption from current layout, wording, and state rules.
