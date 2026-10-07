import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import { getAdmissionLanguageLabel } from '../form-languages';

import type { FieldSettingsProps } from '../types/field-settings';

export function FieldTranslationSettings({ formik, sectionIndex, fieldIndex }: FieldSettingsProps) {
  const field = formik.values.sections[sectionIndex].fields[fieldIndex];
  const path = `sections[${sectionIndex}].fields[${fieldIndex}]`;
  const languages = formik.values.supportedLanguages.filter(
    (language) => language !== formik.values.defaultLanguage
  );
  if (!languages.length) return null;

  const choices = getChoices(field.optionsJson);
  const updateTranslation = (
    language: string,
    key: 'label' | 'placeholder' | 'helpText' | 'validationMessage',
    value: string
  ) =>
    formik.setFieldValue(`${path}.translations`, {
      ...field.translations,
      [language]: { ...field.translations?.[language], [key]: value },
    });
  const updateChoice = (language: string, value: string, label: string) =>
    formik.setFieldValue(`${path}.translations`, {
      ...field.translations,
      [language]: {
        ...field.translations?.[language],
        choices: { ...field.translations?.[language]?.choices, [value]: label },
      },
    });
  return (
    <SectionCard
      title="Translations"
      paperProps={{ sx: { mb: 0, minWidth: 0 } }}
      gridProps={{ sx: { display: 'block' } }}
    >
      <Stack spacing={2}>
        {languages.map((language) => (
          <Stack key={language} spacing={1}>
            <Typography variant="subtitle2">{getAdmissionLanguageLabel(language)}</Typography>
            <TextField
              fullWidth
              size="small"
              label="Field label"
              value={field.translations?.[language]?.label ?? ''}
              onChange={(event) => updateTranslation(language, 'label', event.target.value)}
            />
            <TextField
              fullWidth
              size="small"
              label="Placeholder"
              value={field.translations?.[language]?.placeholder ?? ''}
              onChange={(event) => updateTranslation(language, 'placeholder', event.target.value)}
            />
            <TextField
              fullWidth
              size="small"
              label="Help text"
              value={field.translations?.[language]?.helpText ?? ''}
              onChange={(event) => updateTranslation(language, 'helpText', event.target.value)}
            />
            <TextField
              fullWidth
              size="small"
              label="Required / validation message"
              value={field.translations?.[language]?.validationMessage ?? ''}
              onChange={(event) =>
                updateTranslation(language, 'validationMessage', event.target.value)
              }
            />
            {choices.map((choice) => (
              <TextField
                key={choice.value}
                fullWidth
                size="small"
                label={`Choice: ${choice.label}`}
                value={field.translations?.[language]?.choices?.[choice.value] ?? ''}
                onChange={(event) => updateChoice(language, choice.value, event.target.value)}
              />
            ))}
          </Stack>
        ))}
      </Stack>
    </SectionCard>
  );
}

function getChoices(optionsJson?: string | null): { value: string; label: string }[] {
  if (!optionsJson) return [];
  try {
    const options = JSON.parse(optionsJson) as ({ value?: string; label?: string } | string)[];
    if (!Array.isArray(options)) return [];
    return options
      .map((option) =>
        typeof option === 'string'
          ? { value: option, label: option }
          : { value: option.value ?? '', label: option.label ?? option.value ?? '' }
      )
      .filter((option) => option.value);
  } catch {
    return [];
  }
}
