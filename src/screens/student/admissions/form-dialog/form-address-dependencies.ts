import type {
  AdmissionFormField,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import { parseFieldConfiguration } from './form-field-presets';
import { getAdmissionFormStepGroups } from './form-step-groups';

type AddressKind = 'country' | 'state' | 'city';
type AddressGroup = 'Address' | 'PermanentAddress';
type AddressForm = Pick<CreateUpdateAdmissionForm, 'layoutType' | 'sections'>;

export const addressOrderMessage = 'Country must come before State, and State before City.';

export const addressDependencyErrorCodes = {
  state: 'Admissions.FormAddressMissingCountry',
  city: 'Admissions.FormAddressMissingCityDependencies',
  order: 'Admissions.FormAddressOrder',
} as const;

export function addressMissingMessage(kind: 'state' | 'city', label: string) {
  return kind === 'state'
    ? `${label} needs a Country field. Add Country or remove ${label} to publish.`
    : `${label} needs Country and State fields. Add them or remove ${label} to publish.`;
}

export function getAddressLocationField(
  field: Pick<AdmissionFormField, 'bindingType' | 'bindingKey' | 'fieldType' | 'validationJson'>
): { kind: AddressKind; group?: AddressGroup } | undefined {
  if (field.fieldType === 12) return undefined;
  const { format } = parseFieldConfiguration(field.validationJson);
  if (format !== 'country' && format !== 'state' && format !== 'city') return undefined;
  const binding = field.bindingType === 0 ? field.bindingKey?.trim().toLowerCase() : undefined;
  const group =
    binding === `address.${format}`
      ? 'Address'
      : binding === `permanentaddress.${format}`
        ? 'PermanentAddress'
        : undefined;
  return { kind: format, group };
}

export function getAddressDependencyChecks(form: AddressForm) {
  const orderedSections =
    form.layoutType === 1
      ? getAdmissionFormStepGroups(form.sections).flatMap((step) =>
          step.sections.map(({ section }) => section)
        )
      : [...form.sections].sort((a, b) => a.displayOrder - b.displayOrder);
  const fields = orderedSections.flatMap((section) =>
    [...section.fields].sort((a, b) => a.displayOrder - b.displayOrder)
  );
  const locations = fields.flatMap((field, index) => {
    const location = getAddressLocationField(field);
    return location
      ? [
          {
            ...location,
            field,
            index,
            configuration: parseFieldConfiguration(field.validationJson),
          },
        ]
      : [];
  });
  const byCode = new Map(locations.map((location) => [location.field.code, location]));
  const missing: { field: AdmissionFormField; kind: 'state' | 'city' }[] = [];
  const order: { fieldId: string; dependencyId: string }[] = [];

  locations.forEach((location) => {
    const { field, kind, group, configuration, index } = location;
    if (kind === 'country') return;
    const country = byCode.get(configuration.countryField ?? '');
    const state = kind === 'city' ? byCode.get(configuration.stateField ?? '') : undefined;
    const countryValid = country?.kind === 'country' && (!group || country.group === group);
    const stateValid =
      state?.kind === 'state' &&
      (!group || state.group === group) &&
      (!state.group || state.group === country?.group) &&
      state.configuration.countryField === configuration.countryField;
    if (!countryValid || (kind === 'city' && !stateValid)) missing.push({ field, kind });

    [countryValid ? country : undefined, stateValid ? state : undefined].forEach((dependency) => {
      if (dependency && dependency.index >= index)
        order.push({ fieldId: field.id, dependencyId: dependency.field.id });
    });
  });
  return { missing, order };
}

export function getAddressOrderViolations(form: AddressForm) {
  return getAddressDependencyChecks(form).order;
}
