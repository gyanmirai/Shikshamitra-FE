import { normalizeEmail } from 'src/utils/input-format';

import { parseFieldConfiguration } from './form-dialog/form-field-presets';

type EmailField = {
  code?: string;
  fieldType: number;
  readOnly?: boolean;
  validationJson?: string | null;
};

export function isAdmissionEmailField(field: EmailField) {
  return field.fieldType === 3 || parseFieldConfiguration(field.validationJson).format === 'email';
}

export function normalizeAdmissionEmailValue(
  field: EmailField,
  value: string,
  isRepeatable = false
): string {
  if (field.readOnly || !isAdmissionEmailField(field)) return value;
  if (!isRepeatable) return normalizeEmail(value);
  try {
    const entries: unknown = JSON.parse(value);
    return Array.isArray(entries)
      ? JSON.stringify(
          entries.map((entry) => (typeof entry === 'string' ? normalizeEmail(entry) : entry))
        )
      : value;
  } catch {
    return value;
  }
}

export function normalizeAdmissionFormEmailValues(
  definition: { sections: { fields: (EmailField & { code: string })[]; isRepeatable?: boolean }[] },
  values: Record<string, string>
): Record<string, string> {
  const normalized = { ...values };
  definition.sections.forEach((section) => {
    section.fields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(values, field.code)) {
        normalized[field.code] = normalizeAdmissionEmailValue(
          field,
          values[field.code],
          section.isRepeatable
        );
      }
    });
  });
  return normalized;
}
