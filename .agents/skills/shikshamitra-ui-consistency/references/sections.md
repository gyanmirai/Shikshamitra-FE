# Sections: ShikshaMitra UI consistency

Use this guide for section cards in every form and corresponding view: page, dialog, or drawer.
Pair it with the [page-form guide](page-forms.md), [dialog guide](form-dialogs.md), or
[drawer guide](drawers.md). Form and view modes use the same section names, order, header typography,
leading icon, help icon, padding, and field terminology. Only the content changes from inputs
to saved label/value details. Keep actual record details; do not add decorative information.
For ordered stages, also read [stepper-forms.md](stepper-forms.md); step changes do not introduce
a separate section style or a new field/form state owner.

## References and naming

The user supplied and we inspected these form/view references on 16 October 2026:

| Mode | Asset | Depicted sections |
| --- | --- | --- |
| Form | [Form drawer](../assets/drawer.png) | General Information, Calculation Rules, Application Scope |
| View | [View drawer](../assets/drawer-view.png) | The same section order, with saved details replacing controls |
| Small dialog | [Add Subject dialog](../assets/form-dialog.png) | One meaningful Subject Details section; do not omit grouping for a short form |
| Page form | [Syllabus page form](../assets/page-form-syllabus.png) | Chapter Details, Additional Chapter Details, Attachments; apply the same shared section styling as drawers/dialogs |
| Stepper form | [Rubric Template](../assets/stepper-form-rubric-template.png) | Template Identity and Guidance in Basic Information; shared section rules continue across steps and Preview |

![Form drawer with section headings, leading icons, help, required fields, and footer](../assets/drawer.png)

![Read-only drawer with corresponding sections and saved values](../assets/drawer-view.png)

Use human-readable Title Case for page, dialog, drawer, and section titles: `General Information`,
`Calculation Rules`, `Application Scope`, `Create Concession Policy`. The user confirmed
Title Case; identifiers such as `policyName` remain code.
Preserve entered record names exactly. Field labels and helper text use sentence case and the
same terminology in both modes, such as `Policy name` and `Value source`; avoid all-caps labels.

“Start icon” means the leading semantic icon in the section heading or button. The asterisk `*`
marks required editable fields; do not add decorative stars to headings, buttons, or read-only values.

## Section anatomy and typography

```text
[Neutral leading icon] Section Title [Info icon]             optional section action

Field label *                         Field label
Input / saved value                   Input / saved value
Useful helper or error                Useful helper or error
```

| Element | Standard |
| --- | --- |
| Container | One semantic section per logical group; shared outlined paper/card, `borderRadius: 2`, `minWidth: 0`; no nested decorative cards |
| Section header | Leading icon, title, then accessible info icon; vertically centered; every standard form/view section supplies concise section help |
| Title | `variant="subtitle1"`, theme semibold (600), semantic heading; same family/size/weight in form and view; no extra `bold`/700 override for view |
| Leading icon | `Iconify` using a meaningful `GlobalIcons` key, neutral `text.secondary`; same glyph and sizing in both modes |
| Help | `GlobalIcons.info`, visible 16 px glyph, theme `info.main`; meaningful focusable control such as `General Information information` |
| Body text / values | `body2`, normal theme weight, `text.primary`; section heading styling must not cascade into values |
| Field labels | Sentence case, consistent name, visually secondary; no forced uppercase, wide tracking, or heavy 800 weight in views |
| Helper / error | Theme caption/helper style, associated with the field; errors use semantic error treatment without changing the whole section |

Do not repeat section help as a subtitle, banner, and tooltip. Use the info tooltip for optional
explanation, visible helper text for a real input instruction, and an inline warning only for a
current restriction. Long user values wrap; descriptions span the grid width when needed.

## Spacing and field layout

Use theme units (currently 8 px), not measurements inferred from the images.

| Boundary | Standard / ownership |
| --- | --- |
| Between sections | Owning body `Stack spacing={2}`: 16 px |
| Inside section | Shared `FormSectionCard` padding `{ xs: 1.5, sm: 2 }`: 12/16 px; do not add another inner padded card |
| Header to content | `contentSpacing={2}`: 16 px |
| Leading icon to title | Shared header spacing `1`: 8 px |
| Title to info control | Shared header spacing `0.5`: 4 px; preserve the help control's accessible target |
| Shared leading icon | Existing header defaults: 20 px glyph in 36 px container; use the same settings in form and view |
| Fields | Grid gap/spacing `2`: 16 px; one column on narrow sections, two only when readable |
| Label/value and helpers | Shared input/helper spacing; read-only labels may use `mb: 0.5`; avoid compensating margins per field |

For General Information, let Policy name and Description take the wider column; Status and the
default toggle take the narrower column where space allows. For Calculation Rules, pair related
selectors and put the conditional value below. Application Scope may use a full-width selector.
These are composition examples; preserve the actual module schema and conditional visibility.

## Fields, required markers, labels, and help

- Every editable field has a persistent visible label, stable name/id, and correct error/help
  association. Use `size="small"` and `fullWidth` where supported. Placeholders are examples,
  not a replacement for labels.
- Use the component guides for [CustomSelect](custom-select.md), [searchable dropdowns](searchable-dropdowns.md),
  [single-date pickers](date-pickers.md), and [date ranges](date-range-picker.md). The field's
  labels, shape, help, requiredness, and validation treatment do not vary with its form shell.
- Required editable fields show exactly one `*`, driven by the validation contract. Prefer the
  control's supported `required` API; do not append `*` and also enable an automatic asterisk.
  Optional inputs do not get stars. Required meaning must also be exposed accessibly.
- Every required editable field uses the shared `ShakingTextField` validation wrapper, in every
  form shell, including page forms, drawers, and CustomDialog. This applies to text, selects/autocomplete,
  numeric/date inputs, and required custom choices or collections, not only text boxes. Reuse
  the wrapper already inside a composite field instead of nesting two wrappers.
- Keep one term across form label, helper/error copy, and view label: `Policy name`, not a mix
  of `Name`, `Policy title`, and `POLICY NAME`. Helpers explain a real format, constraint, or
  consequence; they need not repeat the label verbatim. Preserve valid character counts/ranges.
- Give fields with non-obvious choices an accessible info control, as illustrated by Value source,
  Calculation method, and Apply concession on. Use `GlobalIcons.info`; preserve selector arrows,
  suffixes, keyboard access, and label association. Plain self-explanatory fields need no extra icon.
- Show touched/submission validation and current errors visibly near the input; never hide them
  in a tooltip. Do not invent required flags, numeric limits, or backend behavior from a screenshot.
- For Finance numeric fields use the shared numeric input and formatter contracts in the
  [NumericFormatCustom guide](numeric-format-custom.md) and
  [FE pattern skill](../../shikshamitra-fe-patterns/SKILL.md); presentation does not change amounts.
  The numeric guide also covers counts/percentages and formatNumber's display precision limits.

### Shared required-field wrapper

Import `ShakingTextField` from `src/components/shaking-text-field`. Wrap one field and its
associated label/helper/error group, not an entire section or form. Keep the existing shared
control inside it; the wrapper supplies shake feedback and is not a replacement input or a new
field style. Preserve small size, full width where appropriate, theme shape, and section spacing.

Use the same visible-error condition for the wrapper and input: an actual validation error after
touch or a submission attempt. Do not shake untouched empty fields on initial opening, or shake
every required field merely because Submit was clicked. Clear feedback when that error is fixed.
Optional fields with validation may also reuse this wrapper; do not mark them required to do so.

```tsx
import ShakingTextField from 'src/components/shaking-text-field';

const showNameError = Boolean(
  (formik.touched.policyName || formik.submitCount > 0) && formik.errors.policyName
);

<ShakingTextField error={showNameError}>
  <TextField
    required
    name="policyName"
    label="Policy name"
    size="small"
    fullWidth
    value={formik.values.policyName}
    onChange={formik.handleChange}
    onBlur={formik.handleBlur}
    error={showNameError}
    helperText={showNameError ? formik.errors.policyName : undefined}
  />
</ShakingTextField>
```

The wrapper accepts `error`, children, and Box props; it does not forward `required`, `label`,
`value`, or `helperText` to its child. Wire these on the actual field. For nested/collection fields,
use the owning form's path-aware error/touched handling. For required non-input controls, preserve
their accessible required/invalid state and explicit error text. Animation never replaces a
visible error or focusing/revealing the first invalid field. Read-only values and table filters
are not required form inputs and do not receive a shake wrapper solely because of this rule.

## Form-to-view parity

| Section | Form content | Corresponding saved details |
| --- | --- | --- |
| General Information | Policy name, Status, Description, default toggle | Same identity, status, description, default state; retain real read-only metadata such as policy code/year where useful |
| Calculation Rules | Value source, Calculation method, applicable value/limit | Same source/method and meaningful saved value with its unit; do not rename the concept simply because it is read-only |
| Application Scope | Apply concession on and applicable options | Same saved scope, eligible entities, and relevant boolean choices, including meaningful false/zero values |

Use the same section wrapper in both modes; render read-only content as labels and values, not
disabled form controls. Reuse consistent enum labels and date/number formatters. Preserve extra
saved details already shown in the view, in the appropriate section; do not make server-owned
metadata editable merely to mirror a view. Required markers apply to input, not read-only values.
Unavailable data has an honest neutral representation; do not substitute plausible defaults.
This parity applies to dedicated view pages and contextual views as well as form/view drawers.
Use the same meaningful section names/order for equivalent content rather than introducing a
new all-caps/heavier section system when a view becomes a page.

## Shared components and current API

| Component | Source / relationship |
| --- | --- |
| `FormSectionCard`, `FormSectionHeader` | [Card](../../../../src/components/form-section-card/index.tsx), [header](../../../../src/components/form-section-card/section-header.tsx); presentation only, no separate form state |
| `DetailSection`, `DetailGrid`, `DetailField` | [Read-only primitives](../../../../src/components/detail-view/index.tsx); `DetailSection` already wraps `FormSectionCard` but currently changes header style |
| `ConcessionSectionCard` | [Current form reference](../../../../src/screens/finance/policies/components/concession/ConcessionCommon.tsx); inspect before aligning shared presentation |
| `CustomSelect`, numeric input | [Select guide](custom-select.md), [source](../../../../src/components/custom-select/index.tsx), [numeric input](../../../../src/components/custom-numeric-format/index.tsx); inspect supported help/required props |
| Search/date inputs | [Searchable dropdowns](searchable-dropdowns.md), [date pickers](date-pickers.md), [range picker](date-range-picker.md) |
| `ShakingTextField` | [Required-field validation wrapper](../../../../src/components/shaking-text-field/index.tsx); contains the actual shared field/control, not its own form state |
| Icons / help | [GlobalIcons](../../../../src/utils/icons.ts), [Iconify](../../../../src/components/iconify/iconify.tsx), [CustomTooltip](../../../../src/components/custom-tooltip/index.tsx) |

`FormSectionCard` accepts `icon`, `title`, `descriptionTooltip`, `titleTypographyProps`,
`iconSize`, `iconContainerSize`, `contentSpacing`, `action`, `sx`, and children. It has no
`required`, field-help, or validation prop. Keep Formik/Yup state in the owning form.

```tsx
// Same wrapper/settings for form controls or read-only content.
<FormSectionCard
  title="General Information"
  icon={GlobalIcons.notebook}
  descriptionTooltip="Record identity, status, and description."
  titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
  contentSpacing={2}
>
  {children}
</FormSectionCard>
```

Use existing semantic icon keys; add a missing concept to `GlobalIcons` in an implementation
task rather than hardcoding an icon identifier in each screen. There is currently no dedicated
calculator/layers key. Do not invent one in usage examples. Shared help components still contain
literal icon identifiers internally; note that implementation debt rather than claiming compliance.

## Verification and inconsistencies

Check identical heading typography/icons/spacing in form and view; left-aligned labels; correct
required markers; a shared shake wrapper on each required editable field with matching input/error
state; no initial false errors or duplicate wrappers; keyboard-reachable info controls; visible errors; grid wrapping; retained saved
details; and absence of duplicate explanations. Documentation changes validate links/assets and
whitespace; implementation changes also need focused checks and in-app browser validation.

Confirmed source differences: `DetailSection` forces `subtitle1`/700 with 16 px icons in 28 px
containers; the shared form header defaults to `subtitle2`, while the reference form uses
`subtitle1`/600. `DetailField` forces uppercase/800-weight labels. Normalize these through shared
presentation in a future implementation change. The form's Calculation Rules and Application
Scope icons and some internal help icons are literal identifiers rather than `GlobalIcons` keys.
Live font matching, narrow-screen behavior, help accessibility, and full below-fold contents remain
Unverified; the screenshots show only the visible portion of each drawer.
