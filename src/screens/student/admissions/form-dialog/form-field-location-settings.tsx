import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Grid, Stack } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

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
  const countryFieldMissing = Boolean(
    configuration.countryField &&
    !countryFields.some((item) => item.code === configuration.countryField)
  );
  const stateFieldMissing = Boolean(
    configuration.stateField && !stateFields.some((item) => item.code === configuration.stateField)
  );
  const update = (patch: Partial<typeof configuration>) =>
    formik.setFieldValue(path, writeFieldConfiguration({ ...configuration, ...patch }));

  if (configuration.format !== 'state' && configuration.format !== 'city') return null;

  return (
    <SectionCard
      title="Location dependency"
      paperProps={{ sx: { mb: 0, minWidth: 0 } }}
      gridProps={{ spacing: 1.5 }}
    >
      <Grid size={12}>
        <Stack spacing={1.5}>
          <CustomSelect
            required
            size="small"
            label="Country field"
            value={configuration.countryField ?? ''}
            options={[
              ...countryFields.map((item) => ({ value: item.code, label: item.label })),
              ...(countryFieldMissing
                ? [{ value: configuration.countryField!, label: 'Unavailable country field' }]
                : []),
            ]}
            onChange={(value) =>
              update({
                countryField: String(value),
                ...(configuration.format === 'state'
                  ? {}
                  : { stateField: configuration.stateField }),
              })
            }
            error={countryFieldMissing}
            helperText={
              countryFieldMissing
                ? 'Select an available country field.'
                : countryFields.length
                  ? undefined
                  : 'Add a Country common field first.'
            }
          />
          {configuration.format === 'city' && (
            <CustomSelect
              required
              size="small"
              label="State field"
              value={configuration.stateField ?? ''}
              options={[
                ...stateFields.map((item) => ({ value: item.code, label: item.label })),
                ...(stateFieldMissing
                  ? [{ value: configuration.stateField!, label: 'Unavailable state field' }]
                  : []),
              ]}
              onChange={(value) => update({ stateField: String(value) })}
              error={stateFieldMissing}
              helperText={
                stateFieldMissing
                  ? 'Select an available state field.'
                  : stateFields.length
                    ? undefined
                    : 'Add a State common field first.'
              }
            />
          )}
        </Stack>
      </Grid>
    </SectionCard>
  );
}
