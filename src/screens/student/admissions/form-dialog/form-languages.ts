type Translation = {
  label?: string | null;
  placeholder?: string | null;
  helpText?: string | null;
  validationMessage?: string | null;
  choices?: Record<string, string>;
};

type LocalizableField = {
  label: string;
  placeholder?: string | null;
  helpText?: string | null;
  optionsJson?: string | null;
  translations?: Record<string, Translation>;
};

type LocalizableSection<TField extends LocalizableField> = {
  name: string;
  entryLabel?: string | null;
  translations?: Record<string, Translation>;
  fields: TField[];
};

export const ADMISSION_FORM_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'gu', label: 'Gujarati' },
  { value: 'hi', label: 'Hindi' },
  { value: 'mr', label: 'Marathi' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
  { value: 'bn', label: 'Bengali' },
  { value: 'kn', label: 'Kannada' },
  { value: 'ml', label: 'Malayalam' },
  { value: 'ur', label: 'Urdu' },
] as const;

// Retain labels for saved languages while restricting new Step 1 selections.
export const AVAILABLE_ADMISSION_FORM_LANGUAGES = ADMISSION_FORM_LANGUAGES.filter(
  ({ value }) => value === 'en' || value === 'gu' || value === 'hi'
);

export function getAdmissionLanguageLabel(code: string) {
  return ADMISSION_FORM_LANGUAGES.find((language) => language.value === code)?.label ?? code;
}

export function localizeAdmissionSection<
  TField extends LocalizableField,
  TSection extends LocalizableSection<TField>,
>(section: TSection, language: string): TSection {
  const translation = section.translations?.[language];
  return {
    ...section,
    name: translation?.label || section.name,
    entryLabel: translation?.helpText || section.entryLabel,
    fields: section.fields.map((field) => localizeAdmissionField(field, language)),
  } as TSection;
}

export function localizeAdmissionField<TField extends LocalizableField>(
  field: TField,
  language: string
): TField {
  const translation = field.translations?.[language];
  if (!translation) return field;
  return {
    ...field,
    label: translation.label || field.label,
    placeholder: translation.placeholder || field.placeholder,
    helpText: translation.helpText || field.helpText,
    optionsJson: localizeOptions(field.optionsJson, translation),
  } as TField;
}

function localizeOptions(optionsJson: string | null | undefined, translation: Translation) {
  if (!optionsJson || !translation.choices) return optionsJson;
  try {
    const options = JSON.parse(optionsJson) as { value?: string; label?: string }[];
    if (!Array.isArray(options)) return optionsJson;
    return JSON.stringify(
      options.map((option) => ({
        ...option,
        label:
          (option.value && translation.choices?.[option.value]) || option.label || option.value,
      }))
    );
  } catch {
    return optionsJson;
  }
}
