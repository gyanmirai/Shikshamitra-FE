import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import type { FieldSettingsProps } from '../types/field-settings';

export function FieldGuidanceSettings({ formik, sectionIndex, fieldIndex }: FieldSettingsProps) {
  const field = formik.values.sections[sectionIndex].fields[fieldIndex];
  const path = `sections[${sectionIndex}].fields[${fieldIndex}]`;
  return (
    <Stack spacing={1.5}>
      <TextField
        fullWidth
        size="small"
        label="Placeholder"
        value={field.placeholder ?? ''}
        helperText="An example shown inside an empty field."
        onChange={(event) =>
          formik.setFieldValue(`${path}.placeholder`, event.target.value || undefined)
        }
      />
      <TextField
        fullWidth
        size="small"
        label="Default value"
        value={field.defaultValue ?? ''}
        helperText="A starting value shown when the form opens."
        onChange={(event) =>
          formik.setFieldValue(`${path}.defaultValue`, event.target.value || undefined)
        }
      />
      <FormControlLabel
        sx={{ m: 0, justifyContent: 'space-between', gap: 1 }}
        labelPlacement="start"
        control={
          <Switch
            size="small"
            checked={field.readOnly}
            disabled={field.fieldType === 12}
            onChange={(event) => formik.setFieldValue(`${path}.readOnly`, event.target.checked)}
          />
        }
        label={
          <Stack>
            <Typography variant="body2" fontWeight={600}>
              Read-only
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Applicants can view this answer, but cannot edit it.
            </Typography>
          </Stack>
        }
      />
    </Stack>
  );
}
