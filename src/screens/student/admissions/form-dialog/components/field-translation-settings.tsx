
import Stack from '@mui/material/Stack';
import Accordion from '@mui/material/Accordion';
import TextField from '@mui/material/TextField';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';

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
    <Accordion disableGutters elevation={0} variant="outlined" sx={{ borderRadius: 1 }}>
      <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
        <Stack>
          <Typography variant="body2" fontWeight={600}>
            Translations
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Labels, guidance, choices, and validation text for applicants.
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
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
      </AccordionDetails>
    </Accordion>
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
