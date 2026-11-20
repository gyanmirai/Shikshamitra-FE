import type { FormikProps } from 'formik';
import type { CustodyCopy, useGetCustodyOptionsQuery } from 'src/redux/library/custody-api';

import { GlobalIcons } from 'src/utils/icons';
import CustomSelect from 'src/components/custom-select';
import { toDateOnly, parseDateOnly } from 'src/utils/date-only';
import { FormSectionCard } from 'src/components/form-section-card';
import { Grid, Alert, Stack, Button, TextField } from '@mui/material';

import { CirculationDateField } from '../circulation/CirculationDateField';

export type CustodyFields = {
  academicYearId: string;
  employeeId: string;
  standardId: string;
  roomId: string;
  purpose: string;
  handedOffOn: string;
  expectedReturnOn: string;
  copies: CustodyCopy[];
};

export function CustodyHandoffFields({
  formik,
  year,
  options,
  disabled,
}: {
  formik: FormikProps<CustodyFields>;
  year: string;
  options: ReturnType<typeof useGetCustodyOptionsQuery>;
  disabled: boolean;
}) {
  const data = options.isError ? undefined : options.currentData;
  const fieldError = (field: Exclude<keyof CustodyFields, 'copies'>) =>
    formik.touched[field] ? formik.errors[field] : undefined;
  return (
    <FormSectionCard title="Custodian and dates" icon={GlobalIcons.calendar}>
      <Stack spacing={1.5}>
        {!year && <Alert severity="info">Choose an academic year in the application header.</Alert>}
        {options.isError && (
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={() => options.refetch()}>
                Retry
              </Button>
            }
          >
            Could not load custody options. Handoffs require school-wide Library access.
          </Alert>
        )}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomSelect
              name="academicYearId"
              label="Academic year"
              size="small"
              fullWidth
              required
              value={year}
              options={options.data?.years || []}
              labelKey="name"
              valueKey="id"
              disabled={disabled || !options.data?.years.length}
              onChange={(value) =>
                formik.setValues({
                  ...formik.values,
                  academicYearId: String(value),
                  standardId: '',
                })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomSelect
              name="employeeId"
              label="Custodian"
              size="small"
              fullWidth
              required
              value={formik.values.employeeId}
              options={data?.employees || []}
              labelKey="name"
              valueKey="id"
              disabled={disabled || !data?.employees.length}
              onChange={(value) => formik.setFieldValue('employeeId', String(value))}
              onBlur={() => formik.setFieldTouched('employeeId', true)}
              error={Boolean(fieldError('employeeId'))}
              helperText={fieldError('employeeId')}
            />
          </Grid>
          {(
            [
              ['standardId', 'Class', data?.classes || []],
              ['roomId', 'Room', data?.rooms || []],
            ] as const
          ).map(([field, label, values]) => (
            <Grid key={field} size={{ xs: 12, sm: 6 }}>
              <CustomSelect
                name={field}
                label={label}
                size="small"
                fullWidth
                value={formik.values[field]}
                options={[{ id: '', name: 'Unassigned' }, ...values]}
                labelKey="name"
                valueKey="id"
                disabled={disabled || !values.length}
                onChange={(value) => formik.setFieldValue(field, String(value))}
              />
            </Grid>
          ))}
          {(
            [
              ['handedOffOn', 'Handed off on'],
              ['expectedReturnOn', 'Expected return'],
            ] as const
          ).map(([field, label]) => (
            <Grid key={field} size={{ xs: 12, sm: 6 }}>
              <CirculationDateField
                name={field}
                label={label}
                value={parseDateOnly(formik.values[field])}
                disabled={disabled}
                required={field === 'handedOffOn'}
                error={fieldError(field)}
                onChange={(date) => formik.setFieldValue(field, toDateOnly(date))}
                onBlur={() => formik.setFieldTouched(field, true)}
              />
            </Grid>
          ))}
          <Grid size={12}>
            <TextField
              {...formik.getFieldProps('purpose')}
              label="Purpose"
              size="small"
              fullWidth
              required
              disabled={disabled}
              error={Boolean(fieldError('purpose'))}
              helperText={fieldError('purpose')}
              slotProps={{ htmlInput: { maxLength: 500 } }}
            />
          </Grid>
        </Grid>
      </Stack>
    </FormSectionCard>
  );
}
