import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import type { FieldSettingsProps } from '../types/field-settings';

const JSON_SETTINGS = [
  {
    key: 'requiredRuleJson',
    label: 'Required rule JSON',
    placeholder: '{"field":"HAS_PREVIOUS_SCHOOL","operator":"Equals","value":true}',
    help: 'Make an answer required when this condition is met.',
  },
  {
    key: 'validationJson',
    label: 'Validation JSON',
    placeholder: '{"minLength":2,"messages":{"minLength":"Enter at least 2 characters."}}',
    help: 'Set additional checks and applicant-facing error messages.',
  },
] as const;

export function FieldJsonSettings({ formik, sectionIndex, fieldIndex }: FieldSettingsProps) {
  const field = formik.values.sections[sectionIndex].fields[fieldIndex];
  const path = `sections[${sectionIndex}].fields[${fieldIndex}]`;
  return (
    <Stack spacing={1.5}>
      {JSON_SETTINGS.map((setting) => (
        <TextField
          key={setting.key}
          fullWidth
          size="small"
          multiline
          minRows={2}
          label={setting.label}
          value={field[setting.key] ?? ''}
          placeholder={setting.placeholder}
          helperText={setting.help}
          onChange={(event) =>
            formik.setFieldValue(`${path}.${setting.key}`, event.target.value || undefined)
          }
        />
      ))}
    </Stack>
  );
}
