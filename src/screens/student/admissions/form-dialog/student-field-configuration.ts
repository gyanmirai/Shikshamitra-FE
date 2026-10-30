import type {
  AdmissionFormField,
  AdmissionFormSystemFieldMetadata,
} from 'src/redux/student/admissions/admission-forms-api';

import { CUSTOM_FIELD_PRESETS, parseFieldConfiguration } from './form-field-presets';

const addressFormats: Record<string, 'country' | 'state' | 'city' | 'pincode'> = {
  country: 'country',
  state: 'state',
  city: 'city',
  postalcode: 'pincode',
};

// Applied only when adding new fields, never when opening an existing saved form.
export function configureStudentField(
  field: AdmissionFormField,
  metadata: AdmissionFormSystemFieldMetadata
): AdmissionFormField {
  const suffix = metadata.key.split('.').at(-1)?.toLowerCase();
  const format =
    metadata.key === 'Applicant.ProfilePhoto'
      ? 'photo'
      : suffix?.includes('aadhaar')
        ? 'aadhaar'
        : suffix?.includes('pannumber')
          ? 'pan'
          : ['Address', 'PermanentAddress'].includes(metadata.key.split('.')[0])
            ? addressFormats[suffix ?? '']
            : metadata.fieldType === 4
              ? 'phone'
              : undefined;
  const preset = CUSTOM_FIELD_PRESETS.find((item) => item.key === format);
  return {
    ...field,
    fieldType: metadata.fieldType,
    bindingType: 0,
    bindingKey: metadata.key,
    fieldIdentity: undefined,
    readOnly: metadata.readOnly,
    optionsJson: metadata.optionsJson,
    validationJson:
      metadata.validationJson ||
      (format ? JSON.stringify(preset?.validation ?? { format }) : field.validationJson),
  };
}

export function connectStudentAddressFields(fields: AdmissionFormField[]): AdmissionFormField[] {
  return fields.map((field) => {
    if (field.bindingType !== 0) return field;
    const prefix = field.bindingKey?.split('.')[0];
    if (prefix !== 'Address' && prefix !== 'PermanentAddress') return field;
    const configuration = parseFieldConfiguration(field.validationJson);
    if (configuration.format !== 'state' && configuration.format !== 'city') return field;
    const country = fields.find(
      (item) => item.bindingType === 0 && item.bindingKey === `${prefix}.Country`
    );
    const state = fields.find(
      (item) => item.bindingType === 0 && item.bindingKey === `${prefix}.State`
    );
    return {
      ...field,
      validationJson: JSON.stringify({
        ...configuration,
        ...(country ? { countryField: country.code } : {}),
        ...(configuration.format === 'city' && state ? { stateField: state.code } : {}),
      }),
    };
  });
}

export function studentFieldDestination(field?: AdmissionFormSystemFieldMetadata): string {
  return field?.destination === 'studentProfile'
    ? 'Student profile'
    : field?.destination === 'capturedAdmissionDetails'
      ? 'Captured admission details'
      : 'Linked student information';
}

function studentFieldSearchWords(value: string) {
  return value
    .toLowerCase()
    .replace(/['’]s\b/g, '')
    .replace(/aadhar/g, 'aadhaar')
    .replace(/\b(mobile|telephone)\b/g, 'phone')
    .replace(/\bdad\b/g, 'father')
    .replace(/\bmom\b/g, 'mother')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function matchesStudentField(
  field: AdmissionFormSystemFieldMetadata,
  search: string,
  groupName = ''
) {
  const haystack = studentFieldSearchWords(`${field.displayName} ${field.key} ${groupName}`).join(
    ' '
  );
  return studentFieldSearchWords(search).every((word) => haystack.includes(word));
}
