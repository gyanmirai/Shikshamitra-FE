import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';
import type { SetupDraft } from 'src/redux/initial-setup/types';

import dayjs from 'dayjs';
import { getIn } from 'formik';
import { useSelector } from 'react-redux';
import { useGetYearQuery } from 'src/redux/year/yearApi';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { FormSectionCard } from 'src/components/form-section-card';
import { Grid, Alert, Button, MenuItem, TextField } from '@mui/material';
import DatePickerCalendarHeader from 'src/components/date-picker-calendar-header';

import SetupField from './setup-field';

export default function YearStep({ form }: { form: FormikProps<SetupDraft> }) {
  const canRead = useSelector((state: RootState) =>
    state.auth.permissions.some(
      (permission: { name: string; isGranted: boolean }) =>
        permission.name === 'InstituteSetup.AcademicSetup.View' && permission.isGranted
    )
  );
  const query = useGetYearQuery(undefined, { skip: !canRead });
  const years = (query.data?.items ?? []) as {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  }[];
  return (
    <FormSectionCard
      title="Academic year"
      icon="mdi:calendar-outline"
      descriptionTooltip="Academic records, classes and divisions belong to this year."
    >
      <Grid container spacing={2}>
        {query.isError && (
          <Grid size={12}>
            <Alert severity="error" action={<Button onClick={() => query.refetch()}>Retry</Button>}>
              Unable to load existing academic years. You can retry or create a new year.
            </Alert>
          </Grid>
        )}
        {years.length > 0 && (
          <Grid size={12}>
            <TextField
              select
              fullWidth
              size="small"
              label="Academic year to configure"
              value={form.values.existingYearId ?? ''}
              onChange={(event) => {
                const year = years.find((item) => item.id === event.target.value);
                form.setValues({
                  ...form.values,
                  existingYearId: year?.id ?? null,
                  yearName: year?.name ?? '',
                  startDate: year?.startDate ?? null,
                  endDate: year?.endDate ?? null,
                });
              }}
            >
              <MenuItem value="">Create a new academic year</MenuItem>
              {years.map((year) => (
                <MenuItem key={year.id} value={year.id}>
                  {year.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        )}
        <Grid size={12}>
          <SetupField form={form} name="yearName" label="Academic year name" max={50} />
        </Grid>
        {(['startDate', 'endDate'] as const).map((name) => {
          const error = getIn(form.touched, name) && getIn(form.errors, name);
          return (
            <Grid key={name} size={{ xs: 12, sm: 6 }}>
              <DatePicker
                label={name === 'startDate' ? 'Start date' : 'End date'}
                format="DD/MM/YYYY"
                views={['year', 'month', 'day']}
                openTo="day"
                slots={{ calendarHeader: DatePickerCalendarHeader }}
                value={form.values[name] ? dayjs(form.values[name]?.slice(0, 10)) : null}
                onChange={(date) =>
                  form.setFieldValue(
                    name,
                    date?.isValid() ? `${date.format('YYYY-MM-DD')}T00:00:00Z` : null
                  )
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    required: true,
                    name,
                    id: `setup-${name}`,
                    onBlur: () => form.setFieldTouched(name, true),
                    error: Boolean(error),
                    helperText: error || ' ',
                  },
                }}
              />
            </Grid>
          );
        })}
      </Grid>
    </FormSectionCard>
  );
}
