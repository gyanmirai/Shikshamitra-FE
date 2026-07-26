import {
  AdmissionCrmFormFieldType,
  type AdmissionCrmFormFieldDto,
  type AdmissionCrmFormTemplateDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

export type InquiryFormPreviewLanguage = 'en' | 'gu' | 'hi';
export type InquiryFormPreviewFieldValue = string | string[] | boolean;
export type InquiryFormTemplateWriteDto = Omit<
  AdmissionCrmFormTemplateDto,
  'id' | 'academicYearId'
>;

export const inquiryFormPreviewLanguages: Array<{
  code: InquiryFormPreviewLanguage;
  label: string;
}> = [
  { code: 'en', label: 'English' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'hi', label: 'Hindi' },
];

const copyStringRecord = (record?: Record<string, string>) => (record ? { ...record } : undefined);

const copyStringArrayRecord = (record?: Record<string, string[]>) =>
  record
    ? Object.fromEntries(
        Object.entries(record).map(([language, values]) => [language, [...values]])
      )
    : undefined;

const copyInquiryFormField = (field: AdmissionCrmFormFieldDto): AdmissionCrmFormFieldDto => ({
  ...field,
  options: field.options ? [...field.options] : undefined,
  optionLabels: field.optionLabels ? [...field.optionLabels] : undefined,
  localizedLabels: copyStringRecord(field.localizedLabels),
  localizedHelperTexts: copyStringRecord(field.localizedHelperTexts),
  localizedPlaceholders: copyStringRecord(field.localizedPlaceholders),
  localizedOptions: copyStringArrayRecord(field.localizedOptions),
});

export const getDuplicateInquiryFormName = (sourceName: string, existingNames: string[]) => {
  const baseName = sourceName.trim() || 'Inquiry Form';
  const normalizedNames = new Set(existingNames.map((name) => name.trim().toLocaleLowerCase()));

  let copyNumber = 1;
  let candidate = `${baseName} Copy`;
  while (normalizedNames.has(candidate.toLocaleLowerCase())) {
    copyNumber += 1;
    candidate = `${baseName} Copy ${copyNumber}`;
  }

  return candidate;
};

export const buildDuplicateInquiryFormTemplate = (
  template: AdmissionCrmFormTemplateDto,
  existingNames: string[]
): InquiryFormTemplateWriteDto => ({
  templateName: getDuplicateInquiryFormName(template.templateName, existingNames),
  description: template.description,
  channel: template.channel,
  isPublic: template.isPublic,
  isActive: false,
  consentText: template.consentText,
  privacyNoticeUrl: template.privacyNoticeUrl,
  fields: template.fields.map(copyInquiryFormField),
  localizations: template.localizations
    ? Object.fromEntries(
        Object.entries(template.localizations).map(([language, localization]) => [
          language,
          { ...localization },
        ])
      )
    : undefined,
});

const localizedValue = (
  translations: Record<string, string> | undefined,
  language: InquiryFormPreviewLanguage,
  fallback: string | null | undefined
) => translations?.[language]?.trim() || fallback || '';

export const resolveInquiryFormPreviewTemplate = (
  template: AdmissionCrmFormTemplateDto,
  language: InquiryFormPreviewLanguage
) => {
  if (language === 'en') {
    return {
      template,
      usesEnglishFallback: false,
    };
  }

  const localization = template.localizations?.[language];
  let usesEnglishFallback =
    !localization?.templateName?.trim() ||
    Boolean(template.description && !localization?.description?.trim()) ||
    Boolean(template.consentText && !localization?.consentText?.trim());

  const fields = template.fields.map((field) => {
    const localizedLabel = localizedValue(field.localizedLabels, language, field.label);
    const localizedHelperText = localizedValue(
      field.localizedHelperTexts,
      language,
      field.helperText
    );
    const localizedPlaceholder = localizedValue(
      field.localizedPlaceholders,
      language,
      field.placeholder
    );
    const localizedOptions = field.localizedOptions?.[language];

    usesEnglishFallback =
      usesEnglishFallback ||
      !field.localizedLabels?.[language]?.trim() ||
      Boolean(field.helperText && !field.localizedHelperTexts?.[language]?.trim()) ||
      Boolean(field.placeholder && !field.localizedPlaceholders?.[language]?.trim()) ||
      Boolean(field.options?.length && !localizedOptions?.length);

    return {
      ...copyInquiryFormField(field),
      label: localizedLabel,
      helperText: localizedHelperText || null,
      placeholder: localizedPlaceholder || null,
      optionLabels:
        localizedOptions && localizedOptions.length === field.options?.length
          ? [...localizedOptions]
          : field.optionLabels
            ? [...field.optionLabels]
            : field.options
              ? [...field.options]
              : undefined,
    };
  });

  return {
    template: {
      ...template,
      templateName: localization?.templateName?.trim() || template.templateName,
      description: localization?.description?.trim() || template.description,
      consentText: localization?.consentText?.trim() || template.consentText,
      fields,
    },
    usesEnglishFallback,
  };
};

export const getInquiryFormPreviewDefaultValue = (
  field: AdmissionCrmFormFieldDto
): InquiryFormPreviewFieldValue => {
  const defaultValue = field.defaultValue?.trim() || '';

  if (field.fieldType === AdmissionCrmFormFieldType.MultiSelect) {
    return defaultValue
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }

  if (field.fieldType === AdmissionCrmFormFieldType.Checkbox) {
    return ['true', 'yes', '1', 'on'].includes(defaultValue.toLocaleLowerCase());
  }

  return defaultValue;
};

const previewFieldStringValue = (value?: InquiryFormPreviewFieldValue) => {
  if (Array.isArray(value)) return value.join(',');
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value || '').trim();
};

export const isInquiryFormPreviewFieldVisible = (
  field: AdmissionCrmFormFieldDto,
  values: Record<string, InquiryFormPreviewFieldValue>
) => {
  const controllingKey = field.visibleWhenFieldKey?.trim();
  if (!controllingKey) return true;

  const actualValue = previewFieldStringValue(values[controllingKey]);
  const expectedValue = field.visibleWhenValue?.trim();
  return expectedValue
    ? actualValue.toLocaleLowerCase() === expectedValue.toLocaleLowerCase()
    : Boolean(actualValue);
};
