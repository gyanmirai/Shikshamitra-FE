import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import ShakingTextField from 'src/components/shaking-text-field';
import {
  Grid,
  Paper,
  Stack,
  Divider,
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';
import {
  useGetAdmissionFormDataSourcesQuery,
  useGetAdmissionFormSystemFieldsQuery,
} from 'src/redux/student/admissions/admission-forms-api';

import { FIELD_TYPES } from './form-dialog-model';

type Props = {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  sectionIndex: number;
  fieldIndex: number;
};

export function FormFieldCoreFields({ formik, sectionIndex, fieldIndex }: Props) {
  const field = formik.values.sections[sectionIndex].fields[fieldIndex];
  const path = `sections[${sectionIndex}].fields[${fieldIndex}]`;
  const { data: systemFields = [] } = useGetAdmissionFormSystemFieldsQuery();
  const { data: dataSources = [] } = useGetAdmissionFormDataSourcesQuery();
  const isChoice = field.fieldType === 6 || field.fieldType === 7 || field.fieldType === 8;
  const isStatic = field.fieldType === 12;
  const sourceConfig = parseOptionsSource(field.optionsJson);
  const otherFields = formik.values.sections
    .flatMap((section) => section.fields)
    .filter((item) => item.code !== field.code);
  const selectedSource = dataSources.find((source) => source.key === sourceConfig?.source);
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Basic information</Typography>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12 }}>
          <ShakingTextField error={!field.label.trim()}>
            <TextField
              fullWidth
              size="small"
              label="Field label *"
              value={field.label}
              onChange={(event) => formik.setFieldValue(`${path}.label`, event.target.value)}
              helperText="This is the label applicants will see."
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ShakingTextField error={!field.code.trim()}>
            <TextField
              fullWidth
              size="small"
              label="Field code *"
              value={field.code}
              onChange={(event) => {
                const nextCode = event.target.value.toUpperCase();
                formik.setFieldValue(`${path}.code`, nextCode);
                if (field.bindingType === 1) formik.setFieldValue(`${path}.bindingKey`, nextCode);
              }}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Field type *"
            value={field.fieldType}
            onChange={(event) =>
              formik.setFieldValue(`${path}.fieldType`, Number(event.target.value))
            }
          >
            {FIELD_TYPES.map(([label, value]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
      <Divider />
      <Typography variant="subtitle2">Data connection</Typography>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Binding"
            disabled={isStatic}
            value={field.bindingType}
            onChange={(event) => {
              const nextBindingType = Number(event.target.value);
              formik.setFieldValue(`${path}.bindingType`, nextBindingType);
              formik.setFieldValue(
                `${path}.bindingKey`,
                nextBindingType === 1 ? field.code : undefined
              );
            }}
          >
            <MenuItem value={0}>Student record field</MenuItem>
            <MenuItem value={1}>Custom response</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Binding key"
            disabled={isStatic || field.bindingType !== 0}
            value={field.bindingType === 0 ? (field.bindingKey ?? '') : ''}
            onChange={(event) => {
              const selected = systemFields.find((item) => item.key === event.target.value);
              formik.setFieldValue(`${path}.bindingKey`, event.target.value || undefined);
              if (selected?.optionsJson)
                formik.setFieldValue(`${path}.optionsJson`, selected.optionsJson);
            }}
          >
            {systemFields.map((item) => (
              <MenuItem key={item.key} value={item.key}>
                {item.displayName}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
      <Paper variant="outlined" sx={{ px: 1.25, py: 0.5, borderRadius: 1 }}>
        <Stack direction="row" flexWrap="wrap" columnGap={1.5}>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                disabled={isStatic}
                checked={field.required}
                onChange={(event) => formik.setFieldValue(`${path}.required`, event.target.checked)}
              />
            }
            label="Required"
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                disabled={isStatic}
                checked={field.readOnly}
                onChange={(event) => formik.setFieldValue(`${path}.readOnly`, event.target.checked)}
              />
            }
            label="Read-only"
          />
        </Stack>
      </Paper>
      <Divider />
      <Typography variant="subtitle2">Applicant guidance</Typography>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            size="small"
            label="Placeholder"
            value={field.placeholder ?? ''}
            onChange={(event) =>
              formik.setFieldValue(`${path}.placeholder`, event.target.value || undefined)
            }
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            size="small"
            label="Default value"
            value={field.defaultValue ?? ''}
            onChange={(event) =>
              formik.setFieldValue(`${path}.defaultValue`, event.target.value || undefined)
            }
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            size="small"
            label="Help text"
            value={field.helpText ?? ''}
            helperText="Shown below the field to help applicants enter the right information."
            onChange={(event) =>
              formik.setFieldValue(`${path}.helpText`, event.target.value || undefined)
            }
          />
        </Grid>
        {isChoice && (
          <>
            <Grid size={{ xs: 12 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Options source *"
                value={sourceConfig?.source ?? ''}
                onChange={(event) => {
                  const source = event.target.value;
                  formik.setFieldValue(
                    `${path}.optionsJson`,
                    source ? JSON.stringify({ source }) : undefined
                  );
                }}
              >
                <MenuItem value="">Static options</MenuItem>
                {dataSources.map((item) => (
                  <MenuItem key={item.key} value={item.key}>
                    {item.displayName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            {selectedSource?.supportsParent && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Depends on field"
                  value={sourceConfig?.parentField ?? ''}
                  onChange={(event) =>
                    formik.setFieldValue(
                      `${path}.optionsJson`,
                      JSON.stringify({
                        source: sourceConfig?.source,
                        parentField: event.target.value || undefined,
                      })
                    )
                  }
                >
                  <MenuItem value="">Select parent field</MenuItem>
                  {otherFields.map((item) => (
                    <MenuItem key={item.code} value={item.code}>
                      {item.label} ({item.code})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
            {!sourceConfig?.source && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  minRows={2}
                  label="Static options JSON *"
                  value={field.optionsJson ?? ''}
                  placeholder='[{"value":"CBSE","label":"CBSE"}]'
                  helperText="Use an array of strings or objects with value and label."
                  onChange={(event) =>
                    formik.setFieldValue(`${path}.optionsJson`, event.target.value || undefined)
                  }
                />
              </Grid>
            )}
          </>
        )}
      </Grid>
    </Stack>
  );
}

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
