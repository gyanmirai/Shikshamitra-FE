import type {
  AdmissionCrmRegistrationFieldDto,
  AdmissionCrmRegistrationSectionDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { AdmissionCrmFormFieldType } from 'src/redux/student/admissions-crm/admissions-crm-api';

export type RegistrationFieldErrors = Record<string, string>;

export const getCaseInsensitiveRecordValue = (
  record: Record<string, unknown>,
  key: string
): unknown => {
  if (Object.prototype.hasOwnProperty.call(record, key)) return record[key];
  const matchingKey = Object.keys(record).find(
    (candidate) => candidate.toLowerCase() === key.toLowerCase()
  );
  return matchingKey ? record[matchingKey] : undefined;
};

export const getEffectiveRegistrationValue = (
  field: AdmissionCrmRegistrationFieldDto,
  responses: Record<string, unknown>,
  prefill: Record<string, unknown>
) => {
  if (Object.prototype.hasOwnProperty.call(responses, field.key)) return responses[field.key];
  return field.systemField
    ? getCaseInsensitiveRecordValue(prefill, field.systemField) ?? ''
    : '';
};

const valueText = (value: unknown) => {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return '';
};

const isBlank = (value: unknown) => {
  if (value == null) return true;
  if (typeof value === 'string') return !value.trim();
  if (Array.isArray(value)) return value.length === 0;
  return false;
};

const matchesCondition = (
  fieldKey: string | null | undefined,
  expected: string | null | undefined,
  fields: AdmissionCrmRegistrationFieldDto[],
  responses: Record<string, unknown>,
  prefill: Record<string, unknown>
) => {
  if (!fieldKey) return false;
  const field = fields.find((candidate) => candidate.key === fieldKey);
  if (!field) return false;
  return (
    String(getEffectiveRegistrationValue(field, responses, prefill)).toLowerCase() ===
    String(expected ?? 'true').toLowerCase()
  );
};

export const isRegistrationFieldVisible = (
  field: AdmissionCrmRegistrationFieldDto,
  fields: AdmissionCrmRegistrationFieldDto[],
  responses: Record<string, unknown>,
  prefill: Record<string, unknown>
) =>
  !field.visibleWhenFieldKey ||
  matchesCondition(
    field.visibleWhenFieldKey,
    field.visibleWhenValue,
    fields,
    responses,
    prefill
  );

const getFieldError = (field: AdmissionCrmRegistrationFieldDto, value: unknown) => {
  const text = valueText(value);

  if (field.minimumLength != null && text.length < field.minimumLength) {
    return `Enter at least ${field.minimumLength} characters.`;
  }
  if (field.maximumLength != null && text.length > field.maximumLength) {
    return `Enter no more than ${field.maximumLength} characters.`;
  }
  if (field.validationPattern) {
    try {
      if (!new RegExp(field.validationPattern).test(text)) return `${field.label} has an invalid format.`;
    } catch {
      // A malformed server-configured expression remains protected by backend validation.
    }
  }

  if (field.fieldType === AdmissionCrmFormFieldType.Email && !/^\S+@\S+\.\S+$/.test(text)) {
    return 'Enter a valid email address.';
  }
  if (field.fieldType === AdmissionCrmFormFieldType.Phone && text.replace(/\D/g, '').length < 5) {
    return 'Enter a valid phone number.';
  }
  if (field.fieldType === AdmissionCrmFormFieldType.Date) {
    const parsed = /^\d{4}-\d{2}-\d{2}$/.test(text) ? new Date(`${text}T00:00:00Z`) : null;
    if (!parsed || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== text) {
      return 'Enter a valid date.';
    }
  }
  if (field.fieldType === AdmissionCrmFormFieldType.Number) {
    const number = Number(text);
    if (
      !Number.isFinite(number) ||
      (field.minimumValue != null && number < field.minimumValue) ||
      (field.maximumValue != null && number > field.maximumValue)
    ) {
      return `${field.label} is outside the allowed range.`;
    }
  }
  if (
    field.fieldType === AdmissionCrmFormFieldType.Select &&
    field.options.length > 0 &&
    !field.options.some((option) => option.toLowerCase() === text.toLowerCase())
  ) {
    return `Select a valid ${field.label.toLowerCase()} option.`;
  }
  if (
    field.fieldType === AdmissionCrmFormFieldType.MultiSelect &&
    (!Array.isArray(value) ||
      value.some(
        (selection) =>
          !field.options.some(
            (option) => option.toLowerCase() === String(selection).toLowerCase()
          )
      ))
  ) {
    return `Select valid ${field.label.toLowerCase()} options.`;
  }

  return undefined;
};

const getVisibleFields = (
  sections: AdmissionCrmRegistrationSectionDto[],
  responses: Record<string, unknown>,
  prefill: Record<string, unknown>
) => {
  const fields = sections.filter((section) => section.parentVisible).flatMap((section) => section.fields);
  return fields.filter((field) =>
    isRegistrationFieldVisible(field, fields, responses, prefill)
  );
};

export const validateRegistrationResponses = (
  sections: AdmissionCrmRegistrationSectionDto[],
  responses: Record<string, unknown>,
  prefill: Record<string, unknown>
) => {
  const allFields = sections.filter((section) => section.parentVisible).flatMap((section) => section.fields);

  return getVisibleFields(sections, responses, prefill).reduce<RegistrationFieldErrors>(
    (errors, field) => {
      const value = getEffectiveRegistrationValue(field, responses, prefill);
      const required =
        field.required ||
        matchesCondition(
          field.requiredWhenFieldKey,
          field.requiredWhenValue,
          allFields,
          responses,
          prefill
        );
      if (isBlank(value)) {
        if (required) errors[field.key] = `${field.label} is required.`;
        return errors;
      }
      const error = getFieldError(field, value);
      if (error) errors[field.key] = error;
      return errors;
    },
    {}
  );
};

export const calculateRegistrationCompletion = (
  sections: AdmissionCrmRegistrationSectionDto[],
  responses: Record<string, unknown>,
  prefill: Record<string, unknown>
) => {
  const visibleFields = getVisibleFields(sections, responses, prefill);
  if (visibleFields.length === 0) return 100;
  const completed = visibleFields.filter(
    (field) => !isBlank(getEffectiveRegistrationValue(field, responses, prefill))
  ).length;
  return Math.round((completed * 10000) / visibleFields.length) / 100;
};
