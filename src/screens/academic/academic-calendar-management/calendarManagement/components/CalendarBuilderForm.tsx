'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import { shikshaMitraToast } from 'src/components/toast';
import {
  useCreateCalendarMutation,
  useUpdateCalendarMutation,
} from 'src/redux/academicAPI/AcademicCalendarApi/academic-calendar-api';
import {
  Box,
  Grid,
  Stack,
  Switch,
  TextField,
  FormGroup,
  Typography,
  FormControlLabel,
} from '@mui/material';

import { calendarInitialValues } from '../initialValues';
import { calendarValidationSchema } from '../validationSchema';

interface Props {
  editData?: any;
  onSuccess: () => void;
  onClose: () => void;
}

const CalendarBuilderForm = ({ editData, onSuccess, onClose }: Props) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  const [createCalendar, { isLoading: creating }] = useCreateCalendarMutation();
  const [updateCalendar, { isLoading: updating }] = useUpdateCalendarMutation();

  const isLoading = creating || updating;

  const formik = useFormik({
    initialValues: calendarInitialValues(editData ?? { academicMediumId: currentMedium?.id }),
    enableReinitialize: true,
    validationSchema: calendarValidationSchema,
    onSubmit: async (values) => {
      const payload = {
        ...values,
        startDate: values.startDate ? dayjs(values.startDate).format('YYYY-MM-DDTHH:mm:ssZ') : null,
        endDate: values.endDate ? dayjs(values.endDate).format('YYYY-MM-DDTHH:mm:ssZ') : null,
      };

      try {
        if (editData) {
          await updateCalendar({ id: editData.id, body: payload }).unwrap();
          shikshaMitraToast.success({ message: 'Calendar updated successfully' });
        } else {
          await createCalendar(payload).unwrap();
          shikshaMitraToast.success({ message: 'Calendar created successfully' });
        }
        onSuccess();
        onClose();
      } catch (err: any) {
        shikshaMitraToast.error({ message: err?.data?.detail || 'Failed to save calendar' });
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate>
      <Grid container spacing={1}>
        {/* Calendar Name */}
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            size="small"
            label="Calendar Name *"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            placeholder="e.g. English Medium Academic Calendar"
          />
        </Grid>

        {/* Start Date */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <DatePicker
            label="Start Date *"
            value={formik.values.startDate ? dayjs(formik.values.startDate) : null}
            blockedDayTypes={[]}
            onChange={(val) => formik.setFieldValue('startDate', val ? val.format('YYYY-MM-DDTHH:mm:ssZ') : null)}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                error: formik.touched.startDate && Boolean(formik.errors.startDate),
                helperText: formik.touched.startDate && (formik.errors.startDate as string),
              },
            }}
          />
        </Grid>

        {/* End Date */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <DatePicker
            label="End Date *"
            value={formik.values.endDate ? dayjs(formik.values.endDate) : null}
            minDate={formik.values.startDate ? dayjs(formik.values.startDate) : undefined}
            blockedDayTypes={[]}
            onChange={(val) => formik.setFieldValue('endDate', val ? val.format('YYYY-MM-DDTHH:mm:ssZ') : null)}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                error: formik.touched.endDate && Boolean(formik.errors.endDate),
                helperText: formik.touched.endDate && (formik.errors.endDate as string),
              },
            }}
          />
        </Grid>

        {/* Description */}
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={3}
            label="Description"
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Optional description..."
          />
        </Grid>

        {/* Is Default */}
        <Grid size={{ xs: 12 }}>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.isDefault}
                  onChange={(e) => formik.setFieldValue('isDefault', e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    Set as Default Calendar
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Only one calendar can be default per academic medium
                  </Typography>
                </Box>
              }
            />
          </FormGroup>
        </Grid>
      </Grid>

      <Stack direction="row" justifyContent="flex-end" spacing={1} mt={3}>
        <LoadingButton variant="outlined" onClick={onClose} disabled={isLoading}>
          Cancel
        </LoadingButton>
        <LoadingButton type="submit" variant="contained" loading={isLoading}>
          {editData ? 'Update Calendar' : 'Create Calendar'}
        </LoadingButton>
      </Stack>
    </Box>
  );
};

export default CalendarBuilderForm;
