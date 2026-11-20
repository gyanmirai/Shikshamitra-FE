import type { LibraryNamedOption } from 'src/redux/library/policy-types';

import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { Grid, Alert, Switch, FormControlLabel } from '@mui/material';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import { CalendarDateField } from './CalendarDateField';
import { useCalendarPreview } from './useCalendarPreview';

export function CalendarPreview({
  academicYearId,
  sections,
}: {
  academicYearId: string;
  sections: LibraryNamedOption[];
}) {
  const { formik, error, result } = useCalendarPreview(academicYearId);
  return (
    <FormSectionCard
      title="Date Preview"
      icon={GlobalIcons.calendar}
      descriptionTooltip="Preview a duration using this academic year’s opening weekdays and closures. The start date is day zero. This preview does not issue or renew a book."
    >
      <Grid container spacing={2} component="form" onSubmit={formik.handleSubmit}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CalendarDateField
            label="Start date"
            name="startDate"
            value={formik.values.startDate}
            error={formik.touched.startDate && formik.errors.startDate}
            disabled={formik.isSubmitting}
            onBlur={formik.handleBlur}
            onChange={(value) => formik.setFieldValue('startDate', value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ShakingTextField error={Boolean(formik.touched.days && formik.errors.days)}>
            <NumericFormatCustom
              required
              label="Duration (days)"
              name="days"
              value={formik.values.days}
              decimalScale={0}
              allowNegative={false}
              fullWidth
              size="small"
              disabled={formik.isSubmitting}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.days && formik.errors.days)}
              helperText={(formik.touched.days && formik.errors.days) || '0–3660 days.'}
              onValueChange={(value, source) => {
                if (source.source === 'event') formik.setFieldValue('days', value.value);
              }}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ShakingTextField
            error={Boolean(formik.touched.dayCountingMode && formik.errors.dayCountingMode)}
          >
            <CustomSelect
              label="Day counting"
              required
              value={formik.values.dayCountingMode}
              fullWidth
              size="small"
              disabled={formik.isSubmitting}
              options={[
                { id: 0, name: 'Calendar days' },
                { id: 1, name: 'Library open days' },
              ]}
              labelKey="name"
              valueKey="id"
              onChange={(value) => formik.setFieldValue('dayCountingMode', Number(value))}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomSelect
            label="Library section"
            value={formik.values.sectionId}
            options={[{ id: '', name: 'All' }, ...sections]}
            labelKey="name"
            valueKey="id"
            isSearch
            fullWidth
            size="small"
            disabled={formik.isSubmitting}
            onChange={(value) => formik.setFieldValue('sectionId', value)}
          />
        </Grid>
        <Grid size={12}>
          <FormControlLabel
            label="Move a due date on a closed day to the next open day"
            control={
              <Switch
                disabled={formik.isSubmitting}
                checked={formik.values.moveToNextOpenDay}
                onChange={(_, value) => formik.setFieldValue('moveToNextOpenDay', value)}
              />
            }
          />
        </Grid>
        <Grid size={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <LoadingButton
            type="submit"
            size="small"
            color="inherit"
            variant="contained"
            loading={formik.isSubmitting}
            startIcon={<Iconify icon={GlobalIcons.calendar} />}
          >
            Calculate
          </LoadingButton>
        </Grid>
      </Grid>
      {error && <Alert severity="error">{error}</Alert>}
      {result && (
        <Alert severity="info">
          Calculated date: {result.dueDate} ({result.timeZoneId}).
          {result.needsConfiguration ? ' This uses an unconfirmed fallback timezone.' : ''}
        </Alert>
      )}
    </FormSectionCard>
  );
}
