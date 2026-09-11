import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Alert, Stack, MenuItem, TextField, Typography } from '@mui/material';

import { parseFieldConfiguration, writeFieldConfiguration } from './form-field-presets';

type Props = {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  sectionIndex: number;
  fieldIndex: number;
};

export function FormFieldLocationSettings({ formik, sectionIndex, fieldIndex }: Props) {
  const field = formik.values.sections[sectionIndex].fields[fieldIndex];
  const path = `sections[${sectionIndex}].fields[${fieldIndex}].validationJson`;
  const configuration = parseFieldConfiguration(field.validationJson);
  const fields = formik.values.sections.flatMap((section) => section.fields);
  const countryFields = fields.filter(
    (item) => parseFieldConfiguration(item.validationJson).format === 'country'
  );
  const stateFields = fields.filter(
    (item) => parseFieldConfiguration(item.validationJson).format === 'state'
  );
  const update = (patch: Partial<typeof configuration>) =>
    formik.setFieldValue(path, writeFieldConfiguration({ ...configuration, ...patch }));

  if (configuration.format !== 'state' && configuration.format !== 'city') return null;

  return (
    <Stack spacing={1.25}>
      <Typography variant="subtitle2">Location dependency</Typography>
      <Alert severity="info">
        The child field is cleared automatically when its parent selection changes.
      </Alert>
      <TextField
        select
        fullWidth
        required
        size="small"
        label="Country field"
        value={configuration.countryField ?? ''}
        onChange={(event) =>
          update({
            countryField: event.target.value,
            ...(configuration.format === 'state' ? {} : { stateField: configuration.stateField }),
          })
        }
        helperText={
          countryFields.length
            ? 'Select the country field that controls the available locations.'
            : 'Add a Country common field first.'
        }
      >
        {countryFields.map((item) => (
          <MenuItem key={item.code} value={item.code}>
            {item.label}
          </MenuItem>
        ))}
      </TextField>
      {configuration.format === 'city' && (
        <TextField
          select
          fullWidth
          required
          size="small"
          label="State field"
          value={configuration.stateField ?? ''}
          onChange={(event) => update({ stateField: event.target.value })}
          helperText={
            stateFields.length
              ? 'Select the state field that controls the available cities.'
              : 'Add a State common field first.'
          }
        >
          {stateFields.map((item) => (
            <MenuItem key={item.code} value={item.code}>
              {item.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    </Stack>
  );
}
