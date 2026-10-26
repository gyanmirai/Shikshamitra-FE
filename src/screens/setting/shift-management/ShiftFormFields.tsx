import { Grid, TextField } from '@mui/material';
import { MobileTimePicker } from '@mui/x-date-pickers';
import ShakingTextField from 'src/components/shaking-text-field';
import { useInstituteFieldPreview } from 'src/components/institute-field-formatting/use-institute-field-preview';

import type { useShiftForm } from './use-shift-form';

type Props = {
  formik: ReturnType<typeof useShiftForm>['formik'];
  busy: boolean;
  isEditing?: boolean;
};

export function ShiftFormFields({ formik, busy, isEditing = false }: Props) {
  const namePreview = useInstituteFieldPreview(
    'shifts',
    'shiftName',
    formik.values.name,
    isEditing
  );
  const nameError = Boolean(formik.touched.name && formik.errors.name);
  const startError = Boolean(formik.touched.startTime && formik.errors.startTime);
  const endError = Boolean(formik.touched.endTime && formik.errors.endTime);
  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <ShakingTextField error={nameError}>
          <TextField
            fullWidth
            required
            disabled={busy}
            label="Shift name"
            name="name"
            size="small"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={nameError}
            helperText={(formik.touched.name && formik.errors.name) || namePreview}
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <ShakingTextField error={startError}>
          <MobileTimePicker
            name="startTime"
            label="Start time"
            disabled={busy}
            value={formik.values.startTime}
            format="hh:mm A"
            onChange={(date) => formik.setFieldValue('startTime', date)}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
                required: true,
                inputProps: { 'aria-required': true },
                onBlur: () => formik.setFieldTouched('startTime', true),
                error: startError,
                helperText: formik.touched.startTime && formik.errors.startTime,
              },
            }}
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <ShakingTextField error={endError}>
          <MobileTimePicker
            name="endTime"
            label="End time"
            disabled={busy}
            format="hh:mm A"
            value={formik.values.endTime}
            onChange={(date) => formik.setFieldValue('endTime', date)}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
                required: true,
                inputProps: { 'aria-required': true },
                onBlur: () => formik.setFieldTouched('endTime', true),
                error: endError,
                helperText: formik.touched.endTime && formik.errors.endTime,
              },
            }}
          />
        </ShakingTextField>
      </Grid>
    </Grid>
  );
}
