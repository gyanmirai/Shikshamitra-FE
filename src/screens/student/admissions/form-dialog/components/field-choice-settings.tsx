import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CustomSelect from 'src/components/custom-select';
import { useGetAdmissionFormDataSourcesQuery } from 'src/redux/student/admissions/admission-forms-api';

import type { FieldSettingsProps } from '../types/field-settings';

type OptionsSource = { source: string; parentField?: string };

function parseOptionsSource(value?: string | null): OptionsSource | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as OptionsSource;
    return parsed && typeof parsed === 'object' && typeof parsed.source === 'string'
      ? parsed
      : null;
  } catch {
    return null;
  }
}

export function FieldChoiceSettings({ formik, sectionIndex, fieldIndex }: FieldSettingsProps) {
  const field = formik.values.sections[sectionIndex].fields[fieldIndex];
  const path = `sections[${sectionIndex}].fields[${fieldIndex}]`;
  const { data: dataSources = [] } = useGetAdmissionFormDataSourcesQuery();
  const sourceConfig = parseOptionsSource(field.optionsJson);
  const otherFields = formik.values.sections
    .flatMap((section) => section.fields)
    .filter((item) => item.code !== field.code);
  const selectedSource = dataSources.find((source) => source.key === sourceConfig?.source);
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Answer options</Typography>
      <CustomSelect
        size="small"
        label="Options source"
        value={sourceConfig?.source ?? ''}
        options={[
          { value: '', label: 'Enter my own options' },
          ...dataSources.map((item) => ({ value: item.key, label: item.displayName })),
        ]}
        onChange={(value) =>
          formik.setFieldValue(
            `${path}.optionsJson`,
            value ? JSON.stringify({ source: value }) : undefined
          )
        }
      />
      {selectedSource?.supportsParent && (
        <CustomSelect
          size="small"
          label="Depends on field"
          value={sourceConfig?.parentField ?? ''}
          options={[
            { value: '', label: 'Select parent field' },
            ...otherFields.map((item) => ({ value: item.code, label: item.label })),
          ]}
          helperText="Available options depend on the answer to this field."
          onChange={(value) =>
            formik.setFieldValue(
              `${path}.optionsJson`,
              JSON.stringify({
                source: sourceConfig?.source,
                parentField: value || undefined,
              })
            )
          }
        />
      )}
      {!sourceConfig?.source && (
        <TextField
          fullWidth
          size="small"
          multiline
          minRows={2}
          label="Options JSON"
          value={field.optionsJson ?? ''}
          placeholder='["Option one", "Option two"]'
          helperText="Enter an array of choices, or objects with value and label."
          onChange={(event) =>
            formik.setFieldValue(`${path}.optionsJson`, event.target.value || undefined)
          }
        />
      )}
    </Stack>
  );
}
