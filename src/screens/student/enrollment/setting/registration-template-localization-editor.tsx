'use client';

import type { AdmissionCrmRegistrationTemplateUpsertDto } from 'src/redux/student/admissions-crm/registration-documents-contracts';

import { useState } from 'react';
import { Box, Tab, Tabs, Stack, Paper, TextField, Typography } from '@mui/material';

type Props = {
  value: AdmissionCrmRegistrationTemplateUpsertDto;
  readOnly?: boolean;
  onChange: (value: AdmissionCrmRegistrationTemplateUpsertDto) => void;
};

const languages = {
  gu: 'Gujarati',
  hi: 'Hindi',
} as const;

type RegistrationTranslationLanguage = keyof typeof languages;

export function RegistrationTemplateLocalizationEditor({
  value,
  readOnly = false,
  onChange,
}: Props) {
  const [language, setLanguage] = useState<RegistrationTranslationLanguage>('gu');

  const updateSection = (
    sectionIndex: number,
    property: 'localizedTitles' | 'localizedDescriptions',
    translatedValue: string
  ) => {
    onChange({
      ...value,
      sections: value.sections.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              [property]: {
                ...(section[property] || {}),
                [language]: translatedValue,
              },
            }
          : section
      ),
    });
  };

  const updateField = (
    sectionIndex: number,
    fieldIndex: number,
    property: 'localizedLabels' | 'localizedHelpTexts',
    translatedValue: string
  ) => {
    onChange({
      ...value,
      sections: value.sections.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              fields: section.fields.map((field, itemIndex) =>
                itemIndex === fieldIndex
                  ? {
                      ...field,
                      [property]: {
                        ...(field[property] || {}),
                        [language]: translatedValue,
                      },
                    }
                  : field
              ),
            }
          : section
      ),
    });
  };

  const updateOptions = (sectionIndex: number, fieldIndex: number, translatedValue: string) => {
    onChange({
      ...value,
      sections: value.sections.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              fields: section.fields.map((field, itemIndex) =>
                itemIndex === fieldIndex
                  ? {
                      ...field,
                      localizedOptions: {
                        ...(field.localizedOptions || {}),
                        [language]: translatedValue.split(/\r?\n/),
                      },
                    }
                  : field
              ),
            }
          : section
      ),
    });
  };

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="subtitle2">Parent Language Content</Typography>
        <Typography variant="body2" color="text.secondary">
          Add translations for the section and field text that parents see. English remains the
          fallback when a translation is blank.
        </Typography>
      </Box>
      <Tabs
        value={language}
        onChange={(_event, nextLanguage: RegistrationTranslationLanguage) =>
          setLanguage(nextLanguage)
        }
        aria-label="Registration translation language"
      >
        {Object.entries(languages).map(([code, label]) => (
          <Tab key={code} value={code} label={label} />
        ))}
      </Tabs>
      {value.sections.map((section, sectionIndex) => (
        <Paper key={`${section.key}-${sectionIndex}`} variant="outlined" sx={{ p: 1.5 }}>
          <Stack spacing={1.25}>
            <Typography variant="subtitle2">{section.title || 'Untitled Section'}</Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                gap: 1,
              }}
            >
              <TextField
                size="small"
                label={`${languages[language]} Section Title`}
                name={`${section.key}-${language}-title`}
                value={section.localizedTitles?.[language] || ''}
                disabled={readOnly}
                onChange={(event) =>
                  updateSection(sectionIndex, 'localizedTitles', event.target.value)
                }
              />
              <TextField
                size="small"
                label={`${languages[language]} Section Description`}
                name={`${section.key}-${language}-description`}
                value={section.localizedDescriptions?.[language] || ''}
                disabled={readOnly}
                onChange={(event) =>
                  updateSection(sectionIndex, 'localizedDescriptions', event.target.value)
                }
              />
            </Box>
            {section.fields.map((field, fieldIndex) => (
              <Box
                key={`${field.key}-${fieldIndex}`}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                  gap: 1,
                  pl: { xs: 0, md: 2 },
                }}
              >
                <TextField
                  size="small"
                  label={`${field.label || field.key} - ${languages[language]} Label`}
                  name={`${field.key}-${language}-label`}
                  value={field.localizedLabels?.[language] || ''}
                  disabled={readOnly}
                  onChange={(event) =>
                    updateField(sectionIndex, fieldIndex, 'localizedLabels', event.target.value)
                  }
                />
                <TextField
                  size="small"
                  label={`${field.label || field.key} - ${languages[language]} Help`}
                  name={`${field.key}-${language}-help`}
                  value={field.localizedHelpTexts?.[language] || ''}
                  disabled={readOnly}
                  onChange={(event) =>
                    updateField(sectionIndex, fieldIndex, 'localizedHelpTexts', event.target.value)
                  }
                />
                {field.options.length > 0 ? (
                  <TextField
                    size="small"
                    fullWidth
                    multiline
                    minRows={Math.min(4, Math.max(2, field.options.length))}
                    label={`${field.label || field.key} - ${languages[language]} Options`}
                    name={`${field.key}-${language}-options`}
                    value={(field.localizedOptions?.[language] || []).join('\n')}
                    disabled={readOnly}
                    helperText={`Enter ${field.options.length} translated options, one per line, in the same order as the English values.`}
                    onChange={(event) =>
                      updateOptions(sectionIndex, fieldIndex, event.target.value)
                    }
                    sx={{ gridColumn: '1 / -1' }}
                  />
                ) : null}
              </Box>
            ))}
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}
