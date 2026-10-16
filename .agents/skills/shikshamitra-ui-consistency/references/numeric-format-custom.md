# NumericFormatCustom: amounts, percentages, and counts

Use the existing [NumericFormatCustom](../../../../src/components/custom-numeric-format/index.tsx)
for numeric entry in [drawers](drawers.md), [dialogs](form-dialogs.md), and [page forms](page-forms.md).
Keep the same [sections](sections.md), field labels, units, help, validation, and corresponding
read-only details in every shell. Use [formatNumber](../../../../src/utils/formate_number.ts)
for displayed numbers; input formatting, display formatting, and payload values have separate jobs.
For money, preserve the owning backend contract and the
[Finance constitution](../../../../../Shikshamitra-BE/docs/modules/finance/references/constitution.md).

## Reference and field appearance

The supplied Concession Policy image, inspected on 16 October 2026, shows a required Maximum
percentage field in Calculation Rules, a percent unit, helper text, and contextual info controls.
It is a light-theme drawer reference; CSS viewport/scale are unknown. It establishes field
composition, not all numeric modes, validation states, or a universal 0.01–100 limit.

![Concession Policy sections with required numeric field, percentage unit, helpers, and field information](../assets/drawer.png)

- Use a persistent sentence-case label identifying the actual value: `Amount`, `Maximum
  percentage`, `Student count`. Keep that term in helper/error copy and the corresponding view.
  Placeholders may give an example, but never replace the label.
- Use `required` for exactly one automatic `*` when the schema requires the field. Do not also
  append a literal star. Optional values have no star; zero is not the same as an empty value.
- Keep `size="small"`, `fullWidth`, stable `id`/`name`, outlined theme shape, and normal input
  typography. Field labels remain left aligned. Retain the shared field's input alignment;
  numeric read-only/table values may follow the host's numeric alignment convention.
- Use section grid spacing `2` (16 px), stacking fields on narrow screens. Keep the helper below
  the field using its normal helper spacing; no local height, border, or compensating margins.
- Put non-obvious value meaning, calculation basis, or cap explanation in a keyboard-reachable
  info control using `CustomTooltip`, `Iconify`, and `GlobalIcons.info`. A 16 px info glyph uses
  the theme's info color and an accessible target/name. Self-explanatory counts need no filler help.
- NumericFormatCustom has no `infoText`/`labelInfo` prop. Compose help through supported TextField
  adornments or adjacent field layout. Preserve the label association and unit; do not overwrite
  a currency/percentage suffix or duplicate the same unit in an adornment and formatted text.
- Helper text states useful units, precision, range, or dependency. Show the current error in
  that field's helper region when invalid. Never hide errors or mandatory instructions in a tooltip.

## Current API and defaults

The default export combines NumericFormat props with MUI TextField props and the custom
`roundToWholeRupees` flag. Inspect the source before binding it; it is not an ordinary number input.

| Concern | Actual behavior / integration |
| --- | --- |
| Defaults | Outlined TextField, rupee prefix `₹ `, lakh grouping, thousand separators, no negatives |
| Rounding | `roundToWholeRupees` defaults true and applies `Math.ceil(Number(value))` to a nonempty controlled value; false preserves the supplied draft |
| Default cap | `isAllowed` accepts empty or `floatValue <= 9999999`; this is a seven-digit cap, despite the stale five-digit source comment |
| Overrides | Remaining props are spread last, so `prefix`, `suffix`, `decimalScale`, `valueIsNumericString`, `allowNegative`, and `isAllowed` can override defaults |
| Value updates | `onValueChange(values, sourceInfo)` exposes raw `values.value`, display `formattedValue`, and optional `floatValue`; `onChange` receives the input event |
| Labels and feedback | TextField `label`, `required`, `name`, `id`, `error`, `helperText`, `onBlur`, `disabled`, `size`, `fullWidth`, and supported `slotProps` |

Do not treat the wrapper cap as a product rule. Supply a field-specific `isAllowed` when needed;
overriding it replaces the default check. Always keep authoritative bounds/precision validation
in the owning form and backend. Identifier strings, phone numbers, codes, and numbers requiring
preserved leading zeros are text fields, not numeric amounts/counts.

## Configure the numeric meaning explicitly

For raw string drafts use `valueIsNumericString={true}` and normally
`roundToWholeRupees={false}` so typing does not silently round or erase a decimal draft.
Choose precision and sign from the actual field contract, including for non-Finance counts.

| Mode | Explicit configuration | Validation / helper intent |
| --- | --- | --- |
| Whole-rupee INR amount | `prefix="₹ "`, `suffix=""`, `decimalScale={0}` | Real minimum/cap and zero policy; whole rupees |
| Decimal INR amount when supported | `prefix="₹ "`, `suffix=""`, `decimalScale={2}`, `roundToWholeRupees={false}` | At most two decimals only when the owning contract allows them; actual amount limits |
| Percentage | `prefix=""`, `suffix="%"`, `decimalScale` from the contract, `roundToWholeRupees={false}` | Real rate bounds and precision; 0–100 or 0.01–100 only where the field requires that range |
| Count | `prefix=""`, `suffix=""`, `decimalScale={0}`, `roundToWholeRupees={false}` | Finite integer, real minimum/maximum; whether zero is allowed |

Set `allowNegative` deliberately; normal nonnegative amounts/counts use false, while signed
adjustments follow their actual contract. Do not reinterpret a percentage stored as a fraction
versus percentage points: preserve the model's conversion boundary. Do not silently truncate
fractional server values into a count or ceil decimal money. Existing intentional rounding
policies remain explicit at their defined boundary, not an accidental typing side effect.

## Form state and validation

- Keep the editable draft as an unformatted string, including `''`, `0`, and a trailing decimal
  point while typing. Use `values.value`, not `formattedValue`, and handle only
  `sourceInfo.source === 'event'` to avoid updates caused by prop synchronization.
  Do not parse grouped currency text from `event.target.value` or call formatNumber on each edit.
- Use `value={formik.values.amount ?? ''}`, not `value || ''`, to preserve zero. Do not immediately
  convert to Number/floatValue on every keystroke. Map validated values to the owning API's
  decimal/string/integer contract at submission; formatted text never enters calculations/payloads.
- Required fields use one [ShakingTextField](sections.md#shared-required-field-wrapper).
  Mirror the same actual error on wrapper/input and show its message after touch or submission:
  `(touched[field] || submitCount > 0) && errors[field]`. Blur marks the field touched.
- Yup validates required versus optional empty values, numeric syntax, finite values, sign,
  integer/decimal precision, range, and relevant cross-field limits. Avoid coercing an empty
  optional field to zero; `Number('')` produces zero. Reject incomplete decimal drafts on submit.
- Input restrictions such as decimalScale/isAllowed help typing; they do not validate loaded
  server values or replace Yup/server checks. Permit clearing the field and intermediate drafts;
  do not enforce a positive minimum in isAllowed in a way that prevents typing `0.5`.
- Make errors specific, such as `Amount exceeds the permitted limit`, `Enter a whole student
  count`, or `Maximum percentage is required`. Preserve values on server failure, focus/reveal
  the first invalid field, and lock numeric inputs during a blocking save.

### Example: required decimal amount with field help

This fragment assumes a typed Formik form with a raw string `amount`, an actual Yup schema,
and a contract that allows two decimal places. `maximumAmount` comes from that contract/context;
it is not a new shared cap. The info action does not submit the form.

```tsx
import { IconButton, InputAdornment } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import ShakingTextField from 'src/components/shaking-text-field';

const showError = Boolean(
  (formik.touched.amount || formik.submitCount > 0) && formik.errors.amount
);

<ShakingTextField error={showError}>
  <NumericFormatCustom
    id="amount" name="amount" label="Amount" required size="small" fullWidth
    value={formik.values.amount ?? ''}
    valueIsNumericString
    roundToWholeRupees={false}
    prefix="₹ " suffix="" decimalScale={2} allowNegative={false}
    onValueChange={({ value }, sourceInfo) => {
      if (sourceInfo.source === 'event') formik.setFieldValue('amount', value);
    }}
    onBlur={formik.handleBlur}
    isAllowed={({ floatValue }) => floatValue === undefined || (
      Number.isFinite(floatValue) && floatValue <= maximumAmount
    )}
    disabled={busy}
    error={showError}
    helperText={showError ? formik.errors.amount : 'Enter an INR amount with up to 2 decimal places.'}
    slotProps={{
      htmlInput: { inputMode: 'decimal' },
      input: {
        endAdornment: (
          <InputAdornment position="end">
            <CustomTooltip title="The permitted limit follows the selected record and policy.">
              <IconButton type="button" size="small" aria-label="Amount information" disabled={busy}>
                <Iconify icon={GlobalIcons.info} width={16} sx={{ color: 'info.main' }} />
              </IconButton>
            </CustomTooltip>
          </InputAdornment>
        ),
      },
    }}
  />
</ShakingTextField>
```

Use the field's real explanation in place of the example tooltip. Percentages/counts reuse this
binding and validation wrapper with the explicit settings above; counts use a numeric keyboard.

## Display numbers with formatNumber

Import `{ formatNumber }` from `src/utils/formate_number` in tables, summaries, and read-only
details. Preserve the section label and unit. Guard null, undefined, blank strings, nonfinite,
and invalid data before calling it; show the host's missing-value placeholder, not a false zero.
For known valid values:

```tsx
formatNumber(amount, 'INR')        // Monetary display; currency symbol comes from the helper.
formatNumber(count)                // Integral count display; no currency argument.
`${formatNumber(wholePercentage)}%` // Already-integral percentage; add one percent unit.
```

Do not prepend another rupee symbol, pass `%` as a currency code, add local toLocaleString/
Intl.NumberFormat formatters, or use display strings in API filters, exports requiring raw
values, or arithmetic. Table numeric filters use raw numeric values, not formatted strings.

**Current precision limitation:** formatNumber accepts only `(number | string, currency?)`.
It uses the runtime locale, zero fraction digits, and
[roundUpAmount](../../../../src/utils/whole-rupee-amount.ts). It rounds upward even without a
currency argument: `formatNumber(12.25)` displays `13`. Invalid numeric strings fall back to
`0`, so callers must distinguish missing/invalid values themselves. Input lakh grouping does
not establish formatNumber's runtime locale.

Use the current helper for the established whole-rupee display convention and integral counts/
percentages. A view that must show exact decimal amounts or fractional percentages needs an
explicit precision-capable extension of this shared formatter before routing those values
through it. Do not silently show 12.25% as 13%, invent a third options argument, change the
saved rate, or create a feature-specific formatter. This documentation does not change the helper.

## Sources and verification

Related sources: [ConcessionCalculationSection](../../../../src/screens/finance/policies/components/concession/ConcessionCalculationSection.tsx),
[GlobalIcons](../../../../src/utils/icons.ts), [CustomTooltip](../../../../src/components/custom-tooltip/index.tsx),
and [required-field wrapper](../../../../src/components/shaking-text-field/index.tsx).
The current concession percentage still uses TextField/type number and its amount handler stores
floatValue; those are existing differences from this guide, not patterns to copy into new forms.

Check required/optional empty, zero, valid limits, excessive/negative/decimal counts, decimal
precision, clearing/retyping, paste, trailing decimal, blur/submit errors, conditional fields,
server errors, busy locks, help keyboard access, and saved-value parity. Verify grouped display
never leaks into the model and formatNumber never obscures required fractional precision.
Documentation checks cover links/assets and whitespace. Runtime changes also need focused tests
and the in-app browser smoke test in each affected shell, narrow layouts, and both themes.
The supplied screenshot does not verify those states; this guide makes no runtime changes.
