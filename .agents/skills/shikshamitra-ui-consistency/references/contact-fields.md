# Phone, postal address, and copy-address controls

Reuse the existing phone/address components. Keep labels, requiredness, help, and validation
consistent with [sections](sections.md); the backend contract defines stored values and validity.

## Inspected components

| Field | Source / contract |
| --- | --- |
| Phone | [PhoneInput](../../../../src/components/phone-input/index.tsx): TextField-like props, `value?: string \| null`, `onChange(value \| undefined, info?)` |
| Country | [CountryComponent](../../../../src/components/stardard-address/country-component.tsx): autocomplete value/callback, feedback, `textFieldProps`; current options contain India only |
| State | [StateComponent](../../../../src/components/stardard-address/state-component.tsx): `countryValue`, selected state object, autocomplete callback, `textFieldProps` |
| City | [CityComponent](../../../../src/components/stardard-address/city-component.tsx): `stateValue`, `countryValue`, selected city object, autocomplete callback, `textFieldProps` |

## Rules and limitations

- PhoneInput currently forces +91, offers India only, strips a leading national zero for length
  checks, and treats a bare +91 as empty. Preserve that scope unless a product/API change expands
  it. Keep phone numbers as strings; do not parse them as arithmetic or imply international support.
- Its typing cap is not complete validation. Apply the owning schema, required marker, associated
  error/help, and touch/submission gating. Preserve the backend's actual normalized payload format.
- Address wrappers use autocomplete objects, unlike CustomSelect's scalar-ID callback. Adapt the
  payload at the owner; do not save a whole library object or an option label accidentally.
- Pass label/name/required/help through the actual rendered input's `textFieldProps` where needed.
  CountryComponent already wraps ShakingTextField; avoid double wrapping it. State/city need their
  own verified required-field composition. A broad TypeScript intersection does not prove forwarding.
- Country changes invalidate incompatible state/city; state changes invalidate incompatible city.
  Disabled descendants explain the prerequisite. Do not clear a valid saved name while resolving
  a legacy state code; CityComponent supports resolving state names within the selected country.
- Keep address line and postal-code labels explicit. Preserve leading zeros and the owning
  country's format. The HR six-digit postal contract is a feature reference, not a global-country rule.
- “Same as” controls must state which address is copied and whether later source edits propagate.
  Copy/reset only the intended fields, run dependent validation, and preserve unrelated family data.
- Saved detail views show readable phone/address values and meaningful missing states, not disabled
  editing widgets. Do not put real phone numbers, home addresses, or identity data in skill images.

## References and checks

![Blank local staff form showing phone fields and radio choices](../assets/local-contact-fields.jpg)

![Same blank staff form scrolled to country, state, city, and postal fields](../assets/local-address-fields.jpg)

[HR family fields](../../../../src/screens/hr/employee/employee-form-fields/FamilyFields.tsx) demonstrate
phone/address composition and copy-address controls. The captured blank new-staff form uses
[InformationFields](../../../../src/screens/hr/employee/employee-form-fields/InformationFields.tsx).
Use [the blank contact fields](../assets/local-contact-fields.jpg) and
[blank address fields](../assets/local-address-fields.jpg) only for inspected placement, with
limits in [capture metadata](image-references.md#local-app-captures-22-october-2026).
Check empty/pasted phone values, leading zeros, parent resets, legacy saved names, copy/unlink
behavior, required/disabled errors, keyboard selection, and narrow layouts.
