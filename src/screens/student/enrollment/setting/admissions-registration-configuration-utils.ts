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

export const createBlankRegistrationTemplate = (): AdmissionCrmRegistrationTemplateUpsertDto => ({
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

const starterField = (
  value: Partial<AdmissionCrmRegistrationFieldDto> &
    Pick<AdmissionCrmRegistrationFieldDto, 'key' | 'label'>
): AdmissionCrmRegistrationFieldDto => ({
  ...createRegistrationField(),
  ...value,
});

export const createRegistrationTemplate = (): AdmissionCrmRegistrationTemplateUpsertDto => ({
  ...createBlankRegistrationTemplate(),
  name: 'Standard School Registration',
  sections: [
    {
      key: 'student-details',
      title: 'Student details',
      description: 'Identity and basic information for the student applying for admission.',
      displayOrder: 10,
      parentVisible: true,
      fields: [
        starterField({
          key: 'firstName',
          label: 'First name',
          systemField: 'firstName',
          required: true,
        }),
        starterField({ key: 'middleName', label: 'Middle name', systemField: 'middleName' }),
        starterField({ key: 'lastName', label: 'Last name', systemField: 'lastName' }),
        starterField({
          key: 'dateOfBirth',
          label: 'Date of birth',
          fieldType: AdmissionCrmFormFieldType.Date,
          systemField: 'dateOfBirth',
          required: true,
        }),
      ],
    },
    {
      key: 'family-contact',
      title: 'Parent and contact details',
      description: 'Primary guardian and communication information.',
      displayOrder: 20,
      parentVisible: true,
      fields: [
        starterField({
          key: 'parentGuardianName',
          label: 'Parent or guardian name',
          systemField: 'parentGuardianName',
          required: true,
        }),
        starterField({
          key: 'primaryContactNo',
          label: 'Primary contact number',
          fieldType: AdmissionCrmFormFieldType.Phone,
          systemField: 'primaryContactNo',
          required: true,
        }),
        starterField({
          key: 'email',
          label: 'Email address',
          fieldType: AdmissionCrmFormFieldType.Email,
          systemField: 'email',
        }),
        starterField({
          key: 'residentialAddress',
          label: 'Residential address',
          fieldType: AdmissionCrmFormFieldType.TextArea,
          required: true,
        }),
        starterField({ key: 'city', label: 'City', required: true }),
        starterField({ key: 'postalCode', label: 'Postal code' }),
      ],
    },
    {
      key: 'academic-background',
      title: 'Academic background',
      description: 'Requested placement and prior-school information.',
      displayOrder: 30,
      parentVisible: true,
      fields: [
        starterField({
          key: 'desiredClassName',
          label: 'Target class',
          systemField: 'desiredClassName',
          required: true,
          parentEditable: false,
        }),
        starterField({
          key: 'admissionRoute',
          label: 'Admission pathway',
          systemField: 'admissionRoute',
          required: true,
          parentEditable: false,
        }),
        starterField({ key: 'previousSchoolName', label: 'Previous school' }),
        starterField({ key: 'lastClassCompleted', label: 'Last class completed' }),
        starterField({ key: 'transferCertificateNumber', label: 'Transfer certificate number' }),
      ],
    },
    {
      key: 'declaration',
      title: 'Declaration',
      description: 'Confirmation that the submitted details are complete and accurate.',
      displayOrder: 40,
      parentVisible: true,
      fields: [
        starterField({
          key: 'declarationAccepted',
          label: 'I confirm that the information provided is accurate.',
          fieldType: AdmissionCrmFormFieldType.Checkbox,
          required: true,
        }),
      ],
    },
  ],
  notes: 'Starter template. Review fields, required rules, and applicability before publishing.',
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
