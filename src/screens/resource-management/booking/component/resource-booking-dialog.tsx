import { useFormik } from 'formik';
import React, { useMemo } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import { Grid, TextField, DialogActions } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { DatePicker, TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';

import { getInitialBookingValues } from '../initialValue';
import { bookingValidationSchema } from '../validationSchema';

import type {
  IResourceBookingFormValues,
  IResourceBookingDialogProps,
} from '../resource-booking-interface';

const ResourceBookingDialog: React.FC<IResourceBookingDialogProps> = ({ data, isEdit }) => {
  // Generate initial form values based on `isEdit` mode and incoming `data`.
  // This uses a utility function for reusability across the app.
  const initialValues = useMemo<IResourceBookingFormValues>(
    () => getInitialBookingValues(data, isEdit),
    [data, isEdit]
  );

  // Initialize Formik for managing form state, validation, and submission
  const formik = useFormik<IResourceBookingFormValues>({
    // Set initial form field values
    initialValues,

    // Attach Yup validation schema for field validation
    validationSchema: bookingValidationSchema,

    // Handle form submission
    onSubmit: (values) => {
      // Add logic here to handle form submission (e.g., API call or state update)
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '100%' }}>
        <Grid container spacing={2}>
          <Grid size={12} pb="10px">
            <ShakingTextField
              error={formik.touched.resourceCategory && Boolean(formik.errors.resourceCategory)}
            >
              <CustomSelect
                label="Select Category *"
                options={[]}
                value={formik.values.resourceCategory}
                onChange={(value) => formik.setFieldValue('resourceCategory', value)}
                disabled={isEdit}
                error={formik.touched.resourceCategory && Boolean(formik.errors.resourceCategory)}
                helperText={
                  formik.touched.resourceCategory && formik.errors.resourceCategory
                    ? String(formik.errors.resourceCategory)
                    : ''
                }
              />
            </ShakingTextField>
          </Grid>
          <Grid size={12} pb="10px">
            <ShakingTextField
              error={formik.touched.resourceName && Boolean(formik.errors.resourceName)}
            >
              <CustomSelect
                label="Select Item *"
                options={[]}
                value={formik.values.resourceName}
                onChange={(value) => formik.setFieldValue('resourceName', value)}
                disabled={isEdit}
                error={formik.touched.resourceName && Boolean(formik.errors.resourceName)}
                helperText={
                  formik.touched.resourceName && formik.errors.resourceName
                    ? String(formik.errors.resourceName)
                    : ''
                }
              />
            </ShakingTextField>
          </Grid>

          <Grid size={6} pb="10px">
            <ShakingTextField error={formik.touched.date && Boolean(formik.errors.date)}>
              <DatePicker
                label="Select Date *"
                format="DD-MM-YYYY"
                slotProps={{
                  textField: {
                    size: 'small',
                    error: formik.touched.date && Boolean(formik.errors.date),
                    helperText:
                      formik.touched.date && formik.errors.date ? String(formik.errors.date) : '',
                  },
                }}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={6}>
            <TimePicker
              label="Select Time *"
              value={formik.values.time}
              viewRenderers={{
                hours: renderTimeViewClock,
                minutes: renderTimeViewClock,
                seconds: renderTimeViewClock,
              }}
              onChange={(newTime) => formik.setFieldValue('time', newTime)}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  error: formik.touched.time && Boolean(formik.errors.time),
                  helperText:
                    formik.touched.time && formik.errors.time ? String(formik.errors.time) : '',
                },
              }}
            />{' '}
          </Grid>
          <Grid size={12} pb="10px">
            <ShakingTextField error={formik.touched.purpose && Boolean(formik.errors.purpose)}>
              <TextField
                multiline
                rows={4}
                name="purpose"
                label="Purpose *"
                value=""
                onChange={() => {}}
                size="small"
                fullWidth
                error={formik.touched.purpose && Boolean(formik.errors.purpose)}
                helperText={formik.touched.purpose && formik.errors.purpose}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </Scrollbar>
      <DialogActions>
        <SubmitButton onClick={() => {}} />
      </DialogActions>
    </form>
  );
};

export default ResourceBookingDialog;
