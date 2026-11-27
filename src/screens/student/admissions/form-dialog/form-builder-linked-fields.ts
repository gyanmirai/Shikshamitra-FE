import type { AdmissionFormField } from 'src/redux/student/admissions/admission-forms-api';

import { getAddressGroupChoice } from './address-field-group';
import { parseFieldConfiguration } from './form-field-presets';
import { findAcademicFieldGroups } from './academic-class-selector';
import { getAddressLocationField } from './form-address-dependencies';

export const addressFieldLockReason =
  'Country, State and City must stay together so the address choices work.';

function findAddressFieldGroups(fields: AdmissionFormField[]) {
  const byCode = new Map(fields.map((field) => [field.code, field]));
  return fields.flatMap((city) => {
    const location = getAddressLocationField(city);
    if (location?.kind !== 'city') return [];
    const configuration = parseFieldConfiguration(city.validationJson);
    const country = byCode.get(configuration.countryField ?? '');
    const state = byCode.get(configuration.stateField ?? '');
    if (!country || !state) return [];
    const countryLocation = getAddressLocationField(country);
    const stateLocation = getAddressLocationField(state);
    if (
      countryLocation?.kind !== 'country' ||
      stateLocation?.kind !== 'state' ||
      countryLocation.group !== location.group ||
      stateLocation.group !== location.group ||
      parseFieldConfiguration(state.validationJson).countryField !== country.code
    )
      return [];
    return [[country, state, city]];
  });
}

export function getBuilderAddressFieldGroup(
  fields: AdmissionFormField[],
  field: AdmissionFormField
) {
  const choice =
    field.bindingType === 0 &&
    field.fieldType !== 12 &&
    getAddressGroupChoice(field.bindingKey ?? undefined);
  if (choice && choice.group) {
    return {
      fields: ['country', 'state', 'city'].flatMap((kind) => {
        const member = fields.find(
          (item) =>
            item.bindingType === 0 &&
            item.fieldType !== 12 &&
            item.bindingKey?.toLowerCase() === `${choice.group}.${kind}`.toLowerCase()
        );
        return member ? [member] : [];
      }),
    };
  }
  const groups = findAddressFieldGroups(fields);
  const group = groups.find((items) => items.some((member) => member.id === field.id));
  if (!group) return undefined;
  const sharesFields = groups.some(
    (other) => other !== group && other.some((member) => group.includes(member))
  );
  return {
    fields: group,
    blockedReason: sharesFields
      ? 'These fields are shared by more than one address group. Review the location connections first.'
      : undefined,
  };
}

export function getLinkedFieldDeletionReasons(fields: AdmissionFormField[]) {
  const reasons = new Map<string, string>();
  findAddressFieldGroups(fields).forEach((group) => {
    group.forEach((field) => reasons.set(field.id, addressFieldLockReason));
  });
  findAcademicFieldGroups(fields).forEach((group) => {
    group.forEach((field) => {
      reasons.set(
        field.id,
        'Board, Medium and Class must stay together so the class choices work.'
      );
    });
  });
  return reasons;
}
