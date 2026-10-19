# Date and date-time pickers: form UI consistency

Use for one date or timestamp; for two endpoints read [date-range-picker.md](date-range-picker.md).
Use the same [field/section rules](sections.md) in drawers, dialogs, [page forms](page-forms.md),
and views. Date fields are picker controls, not CustomSelect option lists or native date inputs.

## Components, labels, and appearance

- Use the existing MUI X DatePicker/TimePicker/DateTimePicker with Dayjs and the application's
  existing LocalizationProvider/AdapterDayjs. Do not introduce a second adapter/library.
- In Academic workflows needing calendar rules, use `AcademicDatePicker` or
  `AcademicDateTimePicker` from `src/components/academic-date-picker`. Do not import Academic
  calendar behavior into unrelated modules solely to get a date field's appearance.
- Use a persistent sentence-case label, exactly one `*` for required input, small size, and full
  width where suitable. MUI X field props belong in `slotProps.textField` as supported by the
  current wrapper; do not assume top-level `required`, `error`, or `size` reaches the input.
- Every required date field uses [ShakingTextField](sections.md#shared-required-field-wrapper),
  with the same visible validation error on the wrapper and actual input. Keep helper text and
  accessible invalid/required state; animation alone is not validation.
- Use `DD/MM/YYYY` consistently for dates. The Academic wrapper already fixes that format.
  Date-time fields include an unambiguous time format consistent with the owning feature.
  Display formats are not API payloads.
- Keep the calendar icon/adornments and accessible open-calendar action. Use `GlobalIcons.calendar`
  / `GlobalIcons.info` for new shared customization. Put info help beside a non-obvious field
  without removing its label or hiding required instructions/errors in a tooltip.
- Preserve existing small outlined shape, section grid spacing `2`, helpers under the field,
  and responsive popup behavior; no per-feature radius/heights or overlapping error bubbles.

## Validation contract

Validate selection, typed input, and final submit against the same rules, not just disabled days.

| Condition | Required behavior |
| --- | --- |
| Empty required date | Clear field-specific required error after touch/submit; optional date may remain `null` |
| Invalid or incomplete typing | Show a format/valid-date error; do not silently substitute today or retain an earlier valid value for submission |
| Minimum / maximum | Compare at the field's intended date/time precision; bounds are inclusive unless the contract says otherwise |
| Past / future | Apply `disablePast`/`disableFuture` only when the feature requires it; do not globally ban historical dates |
| Academic scope | Use actual selected calendar/medium/class/division and year bounds; blocked-day types follow the real workflow |
| Related date | Validate any dependent ordering/availability again when the parent date or context changes |
| Submit / serialization | Reject invalid Dayjs values; serialize only at the API boundary; preserve date-only strings versus timestamp/timezone contracts |

Keep Dayjs/null while editing; retain partial input as needed for correction. Use Formik/Yup and
the picker's supported validation/error callbacks, with visible errors after touch/submission.
Calendar restrictions are a usability aid; server validation remains authoritative. Re-check
dates loaded for editing and dates invalidated by a changed scope; never silently coerce them.

## Current AcademicDatePicker API

| Concern | Inspected behavior |
| --- | --- |
| Picker values | `value`, `onChange(value, context)`, `onError`, `minDate`, `maxDate`, etc. inherit the installed MUI X API |
| Input props | `slotProps.textField` for required/name/size/fullWidth/error; preserve existing picker handlers |
| Help/error text | Top-level `helperText` is supported and has precedence over slot helper text in this wrapper; pass the intended visible error there |
| Scope | `calendarId`, `academicMediumId`, `standardId`, `divisionId`, `blockedDayTypes`, `showCalendarMarkers`, `onBlockedDateClick` |
| Restrictions | Combines academic blocked days with supplied `shouldDisableDate`; calendar fetches drive loading |
| Declared hints | `academicYearId` and `validationType` are currently destructured without enforcing policy; pass real year bounds and actual rules explicitly |

```tsx
// Integration excerpt: dateValue/showError/dateHelper and callbacks belong to the form.
<ShakingTextField error={showError}>
  <AcademicDatePicker
    label="Teaching date"
    value={dateValue}
    onChange={handleDateChange}
    minDate={yearStart}
    maxDate={yearEnd}
    helperText={dateHelper}
    slotProps={{ textField: {
      name: 'teachingDate', required: true, size: 'small', fullWidth: true,
      error: showError, onBlur: markDateTouched,
    } }}
  />
</ShakingTextField>
```

## Sources, references, and checks

Inspect [Academic picker](../../../../src/components/academic-date-picker/AcademicDatePicker.tsx),
[types](../../../../src/components/academic-date-picker/types.ts),
[calendar rules](../../../../src/components/academic-date-picker/useAcademicDatePickerRules.ts),
and [date-time wrapper](../../../../src/components/academic-date-picker/AcademicDateTimePicker.tsx).
The supplied [range reference](../assets/date-range-picker-open.png) illustrates date selection
composition, not a verified single-date popup; a dedicated single-date screenshot is still absent.

Current source formats academic helper text as an absolutely positioned error-styled bubble,
even for some guidance; it can conflict with the shared below-field helper standard. Correct
shared presentation when implementing rather than duplicating local overrides. Validate empty,
invalid typed dates/leap days, inclusive boundaries, past/future rules, blocked days, changed
context, keyboard entry/selection, error spacing, both themes, and all shells. Runtime behavior
and single-date visual matching remain Unverified; this guide changes no application code.
