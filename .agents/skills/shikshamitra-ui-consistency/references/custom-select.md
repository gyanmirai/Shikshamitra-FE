# CustomSelect: consistent form dropdowns

Use the existing `CustomSelect` for a bounded list of known options. This guide applies in
[drawers](drawers.md), [dialogs](form-dialogs.md), and [page forms](page-forms.md). All forms and
corresponding [view details](detail-pages.md) use the same [section standard](sections.md).

| Interaction | Read / use |
| --- | --- |
| Known local choices | This guide: `CustomSelect` |
| Search within local options | [Searchable dropdowns](searchable-dropdowns.md): `CustomSelect isSearch` |
| Search remote/paged options | [Searchable dropdowns](searchable-dropdowns.md): `PaginatedSearchSelect` |
| One date / timestamp | [Date pickers](date-pickers.md); do not simulate dates with a dropdown |
| Start/end dates | [Range picker](date-range-picker.md) |

## Reference and common appearance

The inspected [Concession form reference](../assets/drawer.png) shows Value source, Calculation
method, and Apply concession on dropdowns. It establishes placement, labels, helper/help treatment,
and compact sizing, not the appearance of an open option menu. The new Syllabus screenshots show
date-range/page composition, not a searchable-dropdown menu; see the linked guides.
The open [Staff member reference](searchable-dropdowns.md#open-searchable-dropdown-reference)
now establishes searchable-list appearance without changing this component's API.

![Form sections containing labeled compact dropdowns and contextual information controls](../assets/drawer.png)

- Put the control inside its logical section with the same title/icon/help/spacing used in view
  mode. Use Title Case section titles and sentence-case field labels, such as `Value source`.
- Use persistent label, `name`, `size="small"`, and `fullWidth`. Keep the established outlined
  control, theme radius, dropdown arrow, selected-value typography, and disabled treatment.
  Do not add a local field shape, fixed height, colored border, or duplicate outer container.
- Required fields use one `*` through supported `required`; do not append a second literal star.
  Optional fields have no star. The actual schema, not a screenshot, defines requiredness.
- Every required dropdown uses [ShakingTextField](sections.md#shared-required-field-wrapper).
  The same touch/submission-gated validation error drives wrapper, control, and helper. A wrapper
  does not forward required/value/label/error props to its child. Avoid double wrappers.
- Helper text explains a real constraint, dependency, or current error. Validation errors are
  visible and associated through the field; optional explanations go in accessible info help.
  Keep consistent terminology in labels, helper/error text, and read-only labels.
- Use `optionDescriptionKey` for an option's explanation: the component renders info beside
  each described option and the selected single value, as in Value source. An info click must
  not change selection. Use `GlobalIcons.info` for new help composition; existing internals
  still use MUI InfoOutlined. No public `infoText` or `labelInfo` prop exists.
- Keep field/row grid spacing `2` (16 px); help remains adjacent to the relevant label/value
  without obscuring the arrow. Helpers wrap below, not over the next field. Narrow sections
  stack controls; multiple selections wrap chips without breaking the section width.

## Current API and validation

Inspect [source and exported props](../../../../src/components/custom-select/index.tsx).

| Need | Current contract |
| --- | --- |
| Options | `options`, string key `labelKey` / `valueKey` (defaults label/value); store the real stable string/number value, not the label |
| Single / multiple | `multiple` false by default; `value` scalar for single and array for multiple; initialize a deliberate empty value, not the first option silently |
| Change | `onChange(value)` receives the selected value directly, not a DOM event; use `formik.setFieldValue` |
| Label/required | `label` is a string; inherited `required` is forwarded to FormControl; `formControlProps` is supported; do not cast ReactNode labels to strings |
| Feedback | `error`, string `helperText`, `helperTextProps`; `onBlur` can mark the owning field touched |
| Availability | `disabled`, `isLoading` skeleton, `disabledValues`, `disabledLabel`, `noOptionsMessage` |
| Search | `isSearch` filters the supplied options locally; not a server-search callback |
| Contextual info | `optionDescriptionKey` names the description field in each option; no extra network lookup is implied |

The schema validates an allowed option ID, and an array's permitted membership/minimum count for
multi-select. Do not let an obsolete/disabled selection silently become another value. Changing
a parent choice resets only invalid dependent selections and their request scope. Distinguish
loading, failed load, genuinely no choices, and no search matches. Disable a dependent field until
its prerequisite is available; display the real reason without fabricating an option.

```tsx
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

const showError = Boolean(
  (formik.touched.valueSource || formik.submitCount > 0) && formik.errors.valueSource
);

<ShakingTextField error={showError}>
  <CustomSelect
    name="valueSource" label="Value source" required size="small" fullWidth
    options={valueSourceOptions} // Objects with label, value, and caption strings.
    labelKey="label" valueKey="value" optionDescriptionKey="caption"
    value={formik.values.valueSource}
    onChange={(value) => formik.setFieldValue('valueSource', value)}
    onBlur={() => formik.setFieldTouched('valueSource', true)}
    error={showError}
    helperText={showError ? formik.errors.valueSource : undefined}
  />
</ShakingTextField>
```

The excerpt assumes a typed owning form and actual feature options/schema; it does not prescribe
Finance values. For generic field help beyond an option description, compose a reachable info
control through the supported layout, or extend the shared API centrally. Keep label association.

## Related components and checks

Use [GlobalIcons](../../../../src/utils/icons.ts), [Iconify](../../../../src/components/iconify/iconify.tsx),
[CustomTooltip](../../../../src/components/custom-tooltip/index.tsx), and
[ShakingTextField](../../../../src/components/shaking-text-field/index.tsx). View mode displays
the corresponding option label/value within the same section, not a disabled select.

Verify label/required/help, numeric ID versus string ID, empty/false-like values, dependent resets,
loading/empty/error, keyboard selection/Escape, long labels/chips, touch/submit error gating,
both themes, and menu position in each shell. Open-menu visual matching remains Unverified without
a supplied dropdown reference and live check; this documentation changes no runtime behavior.
