# Multi-selects and grouped choices

Read [CustomSelect](custom-select.md) and [searchable dropdowns](searchable-dropdowns.md) first.
Choose an existing wrapper by interaction and data contract, not by copying a nearby import.

| Need | Component / actual contract |
| --- | --- |
| Bounded known choices, optionally locally searchable | [CustomSelect](../../../../src/components/custom-select/index.tsx) with `multiple`, ID array, `onChange(value)`; the CustomSelect guide owns its supported props |
| Searchable local list with checkbox options and compact chip overflow | [ResponsiveMultiSelect](../../../../src/components/responsiveMultiSelect/index.tsx): `options`, ID-array `value`, `onChange(string[])`, `getOptionLabel`, `getOptionValue`, `label`, `disabled`, `error`, `helperText`, `isLoading` |
| Grouped local multiple choices | [GroupCustomSelect](../../../../src/components/group-custom-select/index.tsx): groups `{ label, group: true, items }`, `value`, `onChange`, `labelKey`, `valueKey`, feedback/loading props, `formControlProps` |
| Remote/paged selection | Inspect [PaginatedSearchSelect](searchable-dropdowns.md). Do not infer multi-select support from its autocomplete origin; verify the actual props before adoption |

## Rules and wrapper limitations

- Store stable IDs with one owning field and deliberate empty array. Duplicate labels are allowed;
  duplicate identity is not. Keep selection independent of option ordering and filtered visibility.
- ResponsiveMultiSelect's type mentions object arrays, but its implementation checks membership
  against `getOptionValue` IDs and emits string IDs. Use that actual contract, not object arrays.
- A compact `+N` overflow must expose all hidden values and permitted removals. Opening the list,
  viewing overflow, or dismissing help must not clear the selection or submit the form.
- Group headings are descriptive, not selectable values. Do not invent group-select-all behavior;
  if required, define its eligible options, mixed state, scope, and API support explicitly.
- Preserve missing-page/temporarily unavailable selections through the owning option adapter.
  A wrapper that renders only matching loaded options is not proof that saved IDs were removed.
- Apply one required marker and one touch/submission-gated error through the real rendered input.
  ResponsiveMultiSelect does not expose arbitrary TextField props, `required`, `name`, or `onBlur`;
  GroupCustomSelect has a different forwarding contract. Do not pass unsupported props or claim
  a literal `*` alone provides required-field semantics. Report/resolve shared API gaps when implementing.
- Disable both option changes and chip deletion while locked. GroupCustomSelect has no direct
  `disabled` prop; inspect `formControlProps` and the actual Select behavior before claiming a lock.
- Use the owning field's size and theme. Keep option text readable, menu height bounded, helpers
  associated, and chips/overflow contained on narrow screens; do not widen the entire page.

## Reference and checks

![Local elective subject multi-select with English selected and its option list open](../assets/local-multiselect-open.jpg)

[ElectiveGroupSubjectSelection](../../../../src/screens/academic/curriculum-management/setting/electiveSubjectSetting/components/ElectiveGroupSubjectSelection.tsx)
is the inspected caller. Its literal required-star label and legacy Save Group footer are recorded
implementation details, not new shared requirements. See [capture metadata](image-references.md#local-app-captures-22-october-2026).
Check keyboard search/selection/Escape, removal and overflow, disabled controls, duplicate labels,
empty/loading/error options, parent-scope changes, and retained values after failure.
