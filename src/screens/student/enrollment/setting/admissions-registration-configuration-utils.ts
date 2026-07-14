import type {
  AdmissionCrmRegistrationFieldDto,
  AdmissionCrmRegistrationSectionDto,
  AdmissionCrmRegistrationTemplateUpsertDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { AdmissionCrmFormFieldType } from 'src/redux/student/admissions-crm/admissions-crm-api';

export const createRegistrationField = (): AdmissionCrmRegistrationFieldDto => ({
  key: '',
  label: '',
  fieldType: AdmissionCrmFormFieldType.Text,
  systemField: null,
  helpText: null,
  required: false,
  parentEditable: true,
  displayOrder: 10,
  visibleWhenFieldKey: null,
  visibleWhenValue: null,
  requiredWhenFieldKey: null,
  requiredWhenValue: null,
  validationPattern: null,
  minimumLength: null,
  maximumLength: null,
  minimumValue: null,
  maximumValue: null,
  options: [],
});

export const createRegistrationSection = (): AdmissionCrmRegistrationSectionDto => ({
  key: '',
  title: '',
  description: null,
  displayOrder: 10,
  parentVisible: true,
  fields: [createRegistrationField()],
});

export const createRegistrationTemplate = (): AdmissionCrmRegistrationTemplateUpsertDto => ({
  name: '',
  isFallback: false,
  applicability: {},
  sections: [createRegistrationSection()],
  linkExpiryDays: 14,
  allowPartialSave: true,
  feeRequired: false,
  feeAmount: 0,
  autoIssueAtStage: null,
  notes: null,
});

export type RegistrationTemplateEditorStep = 0 | 1;

export const validateRegistrationTemplateStep = (
  value: AdmissionCrmRegistrationTemplateUpsertDto,
  step: RegistrationTemplateEditorStep
): string[] => {
  const errors: string[] = [];
  if (step === 0) {
    if (!value.name.trim()) errors.push('Template name is required.');
    if (value.linkExpiryDays < 1 || value.linkExpiryDays > 365) {
      errors.push('Link expiry must be between 1 and 365 days.');
    }
    return errors;
  }

  if (!value.sections.length) errors.push('At least one section is required.');
  const sectionKeys = new Set<string>();
  const fieldKeys = new Set<string>();
  value.sections.forEach((section) => {
    const sectionKey = section.key.trim().toLowerCase();
    if (!sectionKey || !section.title.trim()) errors.push('Every section needs a key and title.');
    if (sectionKeys.has(sectionKey)) errors.push(`Section key "${section.key}" is duplicated.`);
    sectionKeys.add(sectionKey);
    if (!section.fields.length)
      errors.push(`Section "${section.title || section.key}" needs a field.`);
    section.fields.forEach((field) => {
      const fieldKey = field.key.trim().toLowerCase();
      if (!fieldKey || !field.label.trim()) errors.push('Every field needs a key and label.');
      if (fieldKeys.has(fieldKey)) errors.push(`Field key "${field.key}" is duplicated.`);
      fieldKeys.add(fieldKey);
      if (
        field.minimumLength != null &&
        field.maximumLength != null &&
        field.minimumLength > field.maximumLength
      ) {
        errors.push(`Field "${field.label || field.key}" has an invalid length range.`);
      }
    });
  });
  value.sections
    .flatMap((section) => section.fields)
    .forEach((field) => {
      if (field.visibleWhenFieldKey && !fieldKeys.has(field.visibleWhenFieldKey.toLowerCase())) {
        errors.push(`Visibility field "${field.visibleWhenFieldKey}" does not exist.`);
      }
      if (field.requiredWhenFieldKey && !fieldKeys.has(field.requiredWhenFieldKey.toLowerCase())) {
        errors.push(`Required-condition field "${field.requiredWhenFieldKey}" does not exist.`);
      }
    });
  return errors;
};

export const validateRegistrationTemplate = (
  value: AdmissionCrmRegistrationTemplateUpsertDto
): string[] => {
  const ruleErrors = validateRegistrationTemplateStep(value, 0);
  const structureErrors = validateRegistrationTemplateStep(value, 1);
  return [...ruleErrors, ...structureErrors];
};

export const findRegistrationTemplateValidationIssue = (
  value: AdmissionCrmRegistrationTemplateUpsertDto
) => {
  const steps: RegistrationTemplateEditorStep[] = [0, 1];
  return steps
    .map((step) => ({ step, message: validateRegistrationTemplateStep(value, step)[0] }))
    .find((issue): issue is { step: RegistrationTemplateEditorStep; message: string } =>
      Boolean(issue.message)
    );
};

export const normalizeRegistrationTemplate = (
  value: AdmissionCrmRegistrationTemplateUpsertDto
): AdmissionCrmRegistrationTemplateUpsertDto => ({
  ...value,
  name: value.name.trim(),
  feeAmount: value.feeRequired ? value.feeAmount : 0,
  notes: value.notes?.trim() || null,
  applicability: Object.fromEntries(
    Object.entries(value.applicability).map(([key, item]) => [key, item?.trim() || null])
  ),
  sections: value.sections.map((section, sectionIndex) => ({
    ...section,
    key: section.key.trim(),
    title: section.title.trim(),
    description: section.description?.trim() || null,
    displayOrder: (sectionIndex + 1) * 10,
    fields: section.fields.map((field, fieldIndex) => ({
      ...field,
      key: field.key.trim(),
      label: field.label.trim(),
      systemField: field.systemField?.trim() || null,
      helpText: field.helpText?.trim() || null,
      visibleWhenFieldKey: field.visibleWhenFieldKey?.trim() || null,
      visibleWhenValue: field.visibleWhenValue?.trim() || null,
      requiredWhenFieldKey: field.requiredWhenFieldKey?.trim() || null,
      requiredWhenValue: field.requiredWhenValue?.trim() || null,
      validationPattern: field.validationPattern?.trim() || null,
      displayOrder: (fieldIndex + 1) * 10,
      options: field.options.map((option) => option.trim()).filter(Boolean),
    })),
  })),
});
