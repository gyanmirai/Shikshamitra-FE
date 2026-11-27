import Stack from '@mui/material/Stack';
import { GlobalIcons } from 'src/utils/icons';
import CustomSelect from 'src/components/custom-select';
import { FormSectionCard } from 'src/components/form-section-card';

import { parseFieldConfiguration, writeFieldConfiguration } from './form-field-presets';

import type { FieldSettingsProps } from './types/field-settings';

export function FormFieldLocationSettings({
  formik,
  sectionIndex,
  fieldIndex,
  linkedFieldReason,
}: FieldSettingsProps) {
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
    <FormSectionCard
      title="Location Dependency"
      icon={GlobalIcons.assignedRoute}
      descriptionTooltip="Choose which fields filter the available locations."
      sx={{ minWidth: 0 }}
    >
      <Stack spacing={1.5}>
        <CustomSelect
          required
          disabled={Boolean(linkedFieldReason)}
          size="small"
          label="Country Field"
          value={configuration.countryField ?? ''}
          options={[
            ...countryFields.map((item) => ({ value: item.code, label: item.label })),
            ...(countryFieldMissing
              ? [{ value: configuration.countryField!, label: 'Unavailable Country Field' }]
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
          error={countryFieldMissing && !linkedFieldReason}
          helperText={
            linkedFieldReason ||
            (countryFieldMissing
              ? 'Select an available country field.'
              : countryFields.length
                ? undefined
                : 'Add a Country common field first.')
          }
        />
        {configuration.format === 'city' && (
          <CustomSelect
            required
            disabled={Boolean(linkedFieldReason)}
            size="small"
            label="State Field"
            value={configuration.stateField ?? ''}
            options={[
              ...stateFields.map((item) => ({ value: item.code, label: item.label })),
              ...(stateFieldMissing
                ? [{ value: configuration.stateField!, label: 'Unavailable State Field' }]
                : []),
            ]}
            onChange={(value) => update({ stateField: String(value) })}
            error={stateFieldMissing && !linkedFieldReason}
            helperText={
              linkedFieldReason ||
              (stateFieldMissing
                ? 'Select an available state field.'
                : stateFields.length
                  ? undefined
                  : 'Add a State common field first.')
            }
          />
        )}
      </Stack>
    </FormSectionCard>
  );
}
