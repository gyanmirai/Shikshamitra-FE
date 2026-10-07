import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CustomSelect from 'src/components/custom-select';
import FormControlLabel from '@mui/material/FormControlLabel';
import ShakingTextField from 'src/components/shaking-text-field';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import { getConfigurableFieldTypes } from './form-dialog-model';
import { FieldChoiceSettings } from './components/field-choice-settings';
import { FieldTranslationSettings } from './components/field-translation-settings';

import type { FieldSettingsProps } from './types/field-settings';

export function FormFieldCoreFields({ formik, sectionIndex, fieldIndex }: FieldSettingsProps) {
  const field = formik.values.sections[sectionIndex].fields[fieldIndex];
  const path = `sections[${sectionIndex}].fields[${fieldIndex}]`;
  const isChoice = field.fieldType === 6 || field.fieldType === 7 || field.fieldType === 8;
  const isStatic = field.fieldType === 12;
  const labelMeta = formik.getFieldMeta<string>(`${path}.label`);
  const labelError = Boolean(labelMeta.touched && labelMeta.error);
  return (
    <Stack spacing={1.5}>
      <SectionCard
        title="Basic settings"
        paperProps={{ sx: { mb: 0, minWidth: 0 } }}
        gridProps={{ sx: { display: 'block' } }}
      >
        <Stack spacing={1.5}>
          <ShakingTextField error={labelError}>
            <TextField
              fullWidth
              required
              size="small"
              label="Field label"
              value={field.label}
              name={`${path}.label`}
              onBlur={formik.handleBlur}
              error={labelError}
              onChange={(event) => formik.setFieldValue(`${path}.label`, event.target.value)}
              helperText={labelError ? labelMeta.error : ''}
            />
          </ShakingTextField>
          <CustomSelect
            size="small"
            label="Field type"
            value={field.fieldType}
            options={getConfigurableFieldTypes(field.fieldType).map(([label, value]) => ({
              label,
              value,
            }))}
            disabled={field.fieldType === 10}
            helperText={
              field.fieldType === 10
                ? 'File upload is not available yet. Replace this field before publishing.'
                : undefined
            }
            onChange={(value) => formik.setFieldValue(`${path}.fieldType`, Number(value))}
          />
          {!isStatic && (
            <FormControlLabel
              labelPlacement="start"
              sx={{
                m: 0,
                justifyContent: 'space-between',
                gap: 1,
              }}
              control={
                <Switch
                  size="small"
                  checked={field.required}
                  onChange={(event) =>
                    formik.setFieldValue(`${path}.required`, event.target.checked)
                  }
                />
              }
              label={
                <Stack>
                  <Typography variant="body2" fontWeight={600}>
                    Required field
                  </Typography>
                </Stack>
              }
            />
          )}
          <TextField
            fullWidth
            size="small"
            label="Help text (optional)"
            value={field.helpText ?? ''}
            multiline
            minRows={2}
            onChange={(event) =>
              formik.setFieldValue(`${path}.helpText`, event.target.value || undefined)
            }
          />
        </Stack>
      </SectionCard>
      {isChoice && (
        <FieldChoiceSettings formik={formik} sectionIndex={sectionIndex} fieldIndex={fieldIndex} />
      )}
      <FieldTranslationSettings
        formik={formik}
        sectionIndex={sectionIndex}
        fieldIndex={fieldIndex}
      />
    </Stack>
  );
}
