import type { FormikProps } from 'formik';

import { getIn } from 'formik';
import { Label } from 'src/components/label';
import CustomSelect from 'src/components/custom-select';
import { Grid, Stack, Typography } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import ShakingTextField from 'src/components/shaking-text-field';
import { DetailGrid, DetailField } from 'src/components/detail-view';

import { clockValue, needsClockReview } from './library-hours-model';

import type { LibraryHour } from './library-hours-model';

export function HoursDayFields({
  formik,
  index,
  canEdit,
}: {
  formik: FormikProps<{ hours: LibraryHour[] }>;
  index: number;
  canEdit: boolean;
}) {
  const row = formik.values.hours[index];
  const status = ['Open', 'Closed', 'Holiday'][row.status] || 'Unavailable';
  const review = needsClockReview(row);
  const busy = formik.isSubmitting || !canEdit;
  const feedback = (name: string) => ({
    error: Boolean(getIn(formik.touched, name) && getIn(formik.errors, name)),
    helperText: getIn(formik.touched, name) ? getIn(formik.errors, name) : undefined,
  });
  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
        <Typography variant="subtitle2">{row.day}</Typography>
        {row.isConfigured === false && <Label color="info">Not configured</Label>}
        {review && <Label color="warning">Needs review</Label>}
      </Stack>
      {canEdit ? (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <ShakingTextField error={feedback(`hours.${index}.status`).error}>
              <CustomSelect
                label={`${row.day} status`}
                required
                fullWidth
                size="small"
                value={row.status}
                disabled={busy}
                options={[
                  { id: 0, name: 'Open' },
                  { id: 1, name: 'Closed' },
                  { id: 2, name: 'Holiday' },
                ]}
                labelKey="name"
                valueKey="id"
                onChange={(value) => formik.setFieldValue(`hours.${index}.status`, Number(value))}
                {...feedback(`hours.${index}.status`)}
              />
            </ShakingTextField>
          </Grid>
          {(['startTime', 'endTime'] as const).map((field) => {
            const name = `hours.${index}.${field}`;
            return (
              <Grid size={{ xs: 12, sm: 4 }} key={field}>
                <ShakingTextField error={feedback(name).error}>
                  <TimePicker
                    label={`${field === 'startTime' ? 'Opening' : 'Closing'} time for ${row.day}`}
                    value={clockValue(row[field])}
                    ampm={false}
                    disabled={busy || row.status !== 0}
                    onChange={(value) =>
                      formik.setFieldValue(name, value?.isValid() ? value.format('HH:mm:ss') : '')
                    }
                    slotProps={{
                      textField: {
                        name,
                        required: row.status === 0,
                        fullWidth: true,
                        size: 'small',
                        onBlur: formik.handleBlur,
                        ...feedback(name),
                      },
                    }}
                  />
                </ShakingTextField>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <DetailGrid>
          <DetailField
            label="Status"
            value={row.isConfigured === false ? 'Not configured' : status}
          />
          {row.status === 0 && (
            <>
              <DetailField label="Opening time" value={row.startTime} />
              <DetailField label="Closing time" value={row.endTime} />
            </>
          )}
        </DetailGrid>
      )}
      {review && (
        <DetailGrid>
          <DetailField label="Original opening time" value={row.startTime} />
          <DetailField label="Original closing time" value={row.endTime} />
        </DetailGrid>
      )}
    </Stack>
  );
}
