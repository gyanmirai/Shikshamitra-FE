import * as Yup from 'yup';

import { getAdmissionPhotoError } from './admission-profile-photo';
import { isAdmissionRuleVisible } from './admission-visibility-rules';

type DynamicValues = Record<string, unknown>;
type AdmissionFormValidationField = {
  code: string;
  label: string;
  fieldType: number;
  required: boolean;
  validationJson?: string | null;
  visibilityRuleJson?: string | null;
  requiredRuleJson?: string | null;
};
export type AdmissionFormValidationDefinition = {
  sections: {
    fields: AdmissionFormValidationField[];
    visibilityRuleJson?: string | null;
    isRepeatable?: boolean;
    minEntries?: number;
    maxEntries?: number;
  }[];
};
type ValidationConfiguration = {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  minDate?: string;
  maxDate?: string;
  pattern?: string;
  regex?: string;
  format?: string;
  message?: string;
  messages?: Record<string, string>;
};

const asText = (value: unknown) => (Array.isArray(value) ? value.join(', ') : String(value ?? ''));

function parseConfiguration(value?: string | null): ValidationConfiguration {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as ValidationConfiguration;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function isEmpty(value: unknown) {
  return (
    value === undefined ||
    value === null ||
    (typeof value === 'string' && !value.trim()) ||
    (Array.isArray(value) && value.length === 0)
  );
}

function fieldError(
  field: AdmissionFormValidationField,
  config: ValidationConfiguration,
  key: keyof ValidationConfiguration,
  fallback: string
) {
  return config.messages?.[String(key)] ?? config.message ?? `${field.label} ${fallback}`;
}

function createFieldSchema(field: AdmissionFormValidationField, sectionRule?: string | null) {
  return Yup.mixed().test('admission-field-validation', function validate(value) {
    const parent = (this.parent ?? {}) as DynamicValues;
    const values = Object.fromEntries(
      Object.entries(parent).map(([key, current]) => [key, asText(current)])
    );
    if (
      !isAdmissionRuleVisible(sectionRule, values) ||
      !isAdmissionRuleVisible(field.visibilityRuleJson, values)
    )
      return true;

    const config = parseConfiguration(field.validationJson);
    const requiredByRule = field.requiredRuleJson
      ? isAdmissionRuleVisible(field.requiredRuleJson, values)
      : false;
    if ((field.required || requiredByRule) && isEmpty(value)) {
      return this.createError({ message: fieldError(field, config, 'message', 'is required.') });
    }
    if (isEmpty(value)) return true;

    const text = asText(value);
    if (config.format === 'photo') {
      const photoError = getAdmissionPhotoError(text);
      if (photoError) return this.createError({ message: `${field.label}: ${photoError}` });
    }
    if (config.minLength !== undefined && text.length < config.minLength) {
      return this.createError({
        message: fieldError(
          field,
          config,
          'minLength',
          `must be at least ${config.minLength} characters.`
        ),
      });
    }
    if (config.maxLength !== undefined && text.length > config.maxLength) {
      return this.createError({
        message: fieldError(
          field,
          config,
          'maxLength',
          `must be at most ${config.maxLength} characters.`
        ),
      });
    }

    const number = Number(value);
    if (field.fieldType === 2 && !Number.isFinite(number)) {
      return this.createError({ message: `${field.label} must be a number.` });
    }
    if (config.min !== undefined && Number.isFinite(number) && number < config.min) {
      return this.createError({
        message: fieldError(field, config, 'min', `must be at least ${config.min}.`),
      });
    }
    if (config.max !== undefined && Number.isFinite(number) && number > config.max) {
      return this.createError({
        message: fieldError(field, config, 'max', `must be at most ${config.max}.`),
      });
    }
    if (field.fieldType === 3 && !Yup.string().email().isValidSync(text)) {
      return this.createError({ message: `${field.label} must be a valid email address.` });
    }
    if (field.fieldType === 4 && !/^\+?[0-9 ()-]{7,20}$/.test(text)) {
      return this.createError({ message: `${field.label} must be a valid phone number.` });
    }
    const regex = config.regex ?? config.pattern;
    if (regex) {
      try {
        if (!new RegExp(regex).test(text)) {
          return this.createError({
            message: fieldError(
              field,
              config,
              config.regex ? 'regex' : 'pattern',
              'has an invalid format.'
            ),
          });
        }
      } catch {
        return this.createError({ message: `${field.label} has an invalid validation pattern.` });
      }
    }
    if (['country', 'state', 'city'].includes(config.format ?? '') && !isLocationValue(text))
      return this.createError({ message: `${field.label} must contain a valid location.` });
    if (field.fieldType === 5 || config.minDate || config.maxDate) {
      const date = new Date(text);
      if (Number.isNaN(date.getTime()))
        return this.createError({ message: `${field.label} must be a valid date.` });
      if (config.minDate && date < new Date(config.minDate))
        return this.createError({
          message: fieldError(field, config, 'minDate', `must be on or after ${config.minDate}.`),
        });
      if (config.maxDate && date > new Date(config.maxDate))
        return this.createError({
          message: fieldError(field, config, 'maxDate', `must be on or before ${config.maxDate}.`),
        });
    }
    return true;
  });
}

function createRepeatableFieldSchema(
  field: AdmissionFormValidationField,
  minimumEntries: number,
  maximumEntries: number
) {
  return Yup.mixed().test('admission-repeatable-field-validation', function validate(value) {
    let entries: unknown[] = [];
    try {
      const parsed = typeof value === 'string' ? (JSON.parse(value) as unknown) : value;
      if (Array.isArray(parsed)) entries = parsed;
    } catch {
      return this.createError({ message: `${field.label} has invalid repeated answers.` });
    }
    if (entries.length < minimumEntries)
      return this.createError({ message: `Add at least ${minimumEntries} entries.` });
    if (entries.length > maximumEntries)
      return this.createError({ message: `Add no more than ${maximumEntries} entries.` });
    if (field.required && entries.some(isEmpty))
      return this.createError({ message: `${field.label} is required in every entry.` });
    return true;
  });
}

function isLocationValue(value: string) {
  try {
    const parsed = JSON.parse(value) as { name?: unknown };
    return Boolean(
      parsed && typeof parsed === 'object' && typeof parsed.name === 'string' && parsed.name.trim()
    );
  } catch {
    return false;
  }
}

export function buildDynamicAdmissionYupSchema(form: AdmissionFormValidationDefinition) {
  const shape = form.sections
    .flatMap((section) =>
      section.fields.map((field) => ({
        field,
        section,
      }))
    )
    .reduce<Record<string, Yup.AnySchema>>(
      (result, { field, section }) => ({
        ...result,
        [field.code]: section.isRepeatable
          ? createRepeatableFieldSchema(field, section.minEntries ?? 0, section.maxEntries ?? 1)
          : createFieldSchema(field, section.visibilityRuleJson),
      }),
      {}
    );
  return Yup.object(shape);
}

export function getDynamicAdmissionValidationErrors(
  form: AdmissionFormValidationDefinition,
  values: DynamicValues
) {
  try {
    buildDynamicAdmissionYupSchema(form).validateSync(values, { abortEarly: false });
    return {};
  } catch (error) {
    if (!(error instanceof Yup.ValidationError)) return {};
    return Object.fromEntries(
      error.inner.map((item) => [item.path ?? '', item.message]).filter(([path]) => path)
    );
  }
}
