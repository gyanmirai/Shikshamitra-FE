import type {
  AdmissionCrmRegistrationFieldDto,
  AdmissionCrmRegistrationSectionDto,
  AdmissionCrmRegistrationTemplateUpsertDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { AdmissionCrmFormFieldType } from 'src/redux/student/admissions-crm/admissions-crm-api';

const optionFieldTypes = new Set([
  AdmissionCrmFormFieldType.Select,
  AdmissionCrmFormFieldType.MultiSelect,
]);

export const registrationSystemFields = [
  'firstName',
  'middleName',
  'lastName',
  'dateOfBirth',
  'parentGuardianName',
  'primaryContactNo',
  'email',
  'desiredClassName',
  'campus',
  'board',
  'medium',
  'admissionRound',
  'applicantCategory',
  'admissionRoute',
] as const;

const registrationSystemFieldByKey = new Map(
  registrationSystemFields.map((systemField) => [systemField.toLowerCase(), systemField])
);

export const normalizeRegistrationSystemField = (systemField?: string | null): string | null => {
  const trimmedSystemField = systemField?.trim();
  if (!trimmedSystemField) return null;
  return registrationSystemFieldByKey.get(trimmedSystemField.toLowerCase()) ?? trimmedSystemField;
};

export const normalizeRegistrationTemplateSystemFields = (
  value: AdmissionCrmRegistrationTemplateUpsertDto
): AdmissionCrmRegistrationTemplateUpsertDto => ({
  ...value,
  sections: value.sections.map((section) => ({
    ...section,
    fields: section.fields.map((field) => ({
      ...field,
      systemField: normalizeRegistrationSystemField(field.systemField),
    })),
  })),
});

const systemFieldTypeRules: Record<string, AdmissionCrmFormFieldType[]> = {
  dateOfBirth: [AdmissionCrmFormFieldType.Date],
  primaryContactNo: [AdmissionCrmFormFieldType.Phone, AdmissionCrmFormFieldType.Text],
  email: [AdmissionCrmFormFieldType.Email, AdmissionCrmFormFieldType.Text],
};

const fieldKeyPattern = /^[a-z][a-zA-Z0-9_]*$/;

export const registrationFieldNeedsOptions = (fieldType: AdmissionCrmFormFieldType) =>
  optionFieldTypes.has(fieldType);

export const normalizeRegistrationFieldForType = (
  field: AdmissionCrmRegistrationFieldDto,
  fieldType: AdmissionCrmFormFieldType
): AdmissionCrmRegistrationFieldDto => {
  const needsOptions = registrationFieldNeedsOptions(fieldType);
  const systemField = normalizeRegistrationSystemField(field.systemField);
  const systemTypes = systemField ? systemFieldTypeRules[systemField] : null;
  return {
    ...field,
    fieldType,
    systemField: systemTypes && !systemTypes.includes(fieldType) ? null : systemField,
    options: needsOptions ? field.options : [],
    minimumLength:
      fieldType === AdmissionCrmFormFieldType.Text ||
      fieldType === AdmissionCrmFormFieldType.TextArea
        ? field.minimumLength
        : null,
    maximumLength:
      fieldType === AdmissionCrmFormFieldType.Text ||
      fieldType === AdmissionCrmFormFieldType.TextArea
        ? field.maximumLength
        : null,
    minimumValue: fieldType === AdmissionCrmFormFieldType.Number ? field.minimumValue : null,
    maximumValue: fieldType === AdmissionCrmFormFieldType.Number ? field.maximumValue : null,
    validationPattern:
      fieldType === AdmissionCrmFormFieldType.Text ||
      fieldType === AdmissionCrmFormFieldType.TextArea ||
      fieldType === AdmissionCrmFormFieldType.Email ||
      fieldType === AdmissionCrmFormFieldType.Phone
        ? field.validationPattern
        : null,
  };
};

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
  localizedLabels: {},
  localizedHelpTexts: {},
  localizedOptions: {},
});

export const createRegistrationSection = (): AdmissionCrmRegistrationSectionDto => ({
  key: '',
  title: '',
  description: null,
  displayOrder: 10,
  parentVisible: true,
  fields: [createRegistrationField()],
  localizedTitles: {},
  localizedDescriptions: {},
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

export type RegistrationTemplateEditorStep = 0 | 1 | 2;

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
  if (step === 2) {
    value.sections.forEach((section) =>
      section.fields.forEach((field) =>
        Object.entries(field.localizedOptions || {}).forEach(([language, options]) => {
          const translatedOptions = options.map((option) => option.trim()).filter(Boolean);
          if (
            translatedOptions.length > 0 &&
            translatedOptions.length !== field.options.filter(Boolean).length
          ) {
            errors.push(
              `Field "${field.label || field.key}" needs ${field.options.filter(Boolean).length} ${language} options.`
            );
          }
        })
      )
    );
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
      if (fieldKey && !fieldKeyPattern.test(field.key.trim())) {
        errors.push(
          `Field key "${field.key}" must start with a letter and use letters, numbers, or underscore.`
        );
      }
      if (fieldKeys.has(fieldKey)) errors.push(`Field key "${field.key}" is duplicated.`);
      fieldKeys.add(fieldKey);
      if (registrationFieldNeedsOptions(field.fieldType) && !field.options.filter(Boolean).length) {
        errors.push(`Field "${field.label || field.key}" needs at least one option.`);
      }
      if (!registrationFieldNeedsOptions(field.fieldType) && field.options.filter(Boolean).length) {
        errors.push(
          `Field "${field.label || field.key}" has options but its type does not use options.`
        );
      }
      const systemField = normalizeRegistrationSystemField(field.systemField);
      const allowedTypes = systemField ? systemFieldTypeRules[systemField] : null;
      if (allowedTypes && !allowedTypes.includes(field.fieldType)) {
        errors.push(`Field "${field.label || field.key}" type does not match its system mapping.`);
      }
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
  const localizationErrors = validateRegistrationTemplateStep(value, 2);
  return [...ruleErrors, ...structureErrors, ...localizationErrors];
};

export const findRegistrationTemplateValidationIssue = (
  value: AdmissionCrmRegistrationTemplateUpsertDto
) => {
  const steps: RegistrationTemplateEditorStep[] = [0, 1, 2];
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
  feeRequired: false,
  feeAmount: 0,
  notes: value.notes?.trim() || null,
  applicability: Object.fromEntries(
    Object.entries(value.applicability).map(([key, item]) => [key, item?.trim() || null])
  ),
  sections: value.sections.map((section, sectionIndex) => ({
    ...section,
    key: section.key.trim(),
    title: section.title.trim(),
    description: section.description?.trim() || null,
    localizedTitles: normalizeLocalizedText(section.localizedTitles),
    localizedDescriptions: normalizeLocalizedText(section.localizedDescriptions),
    displayOrder: (sectionIndex + 1) * 10,
    fields: section.fields.map((field, fieldIndex) => {
      const systemField = normalizeRegistrationSystemField(field.systemField);
      return {
        ...field,
        key: field.key.trim(),
        label: field.label.trim(),
        systemField,
        helpText: field.helpText?.trim() || null,
        visibleWhenFieldKey: field.visibleWhenFieldKey?.trim() || null,
        visibleWhenValue: field.visibleWhenValue?.trim() || null,
        requiredWhenFieldKey: field.requiredWhenFieldKey?.trim() || null,
        requiredWhenValue: field.requiredWhenValue?.trim() || null,
        validationPattern: field.validationPattern?.trim() || null,
        localizedLabels: normalizeLocalizedText(field.localizedLabels),
        localizedHelpTexts: normalizeLocalizedText(field.localizedHelpTexts),
        localizedOptions: Object.fromEntries(
          Object.entries(field.localizedOptions || {})
            .map(([language, options]) => [
              language.trim().toLowerCase(),
              options.map((option) => option.trim()).filter(Boolean),
            ])
            .filter(([language, options]) => Boolean(language) && (options as string[]).length > 0)
        ),
        displayOrder: (fieldIndex + 1) * 10,
        options: field.options.map((option) => option.trim()).filter(Boolean),
      };
    }),
  })),
});

const normalizeLocalizedText = (value?: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(value || {})
      .map(([language, text]) => [language.trim().toLowerCase(), text.trim()])
      .filter(([language, text]) => Boolean(language) && Boolean(text))
  );
