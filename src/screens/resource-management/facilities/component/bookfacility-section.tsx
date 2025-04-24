import { useFormik } from 'formik';
import React, { useMemo } from 'react';

import { Box, Grid, Card, Button, TextField, Typography } from '@mui/material';
import { DatePicker, TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { getInitialFacilityBookingValues } from '../initialValue';
import { facilityBookingValidationSchema } from '../validationSchema';

import type {
  IBookFacilitySectionProps,
  IFacilityBookingFormValues,
} from '../facilities-interface';

const BookFacilitySection: React.FC<IBookFacilitySectionProps> = ({ data, isEdit }) => {
  // Generate initial form values based on `isEdit` mode and incoming `data`.
  // This uses a utility function for reusability across the app.
  const initialValues = useMemo<IFacilityBookingFormValues>(
    () => getInitialFacilityBookingValues(data, isEdit),
    [data, isEdit]
  );

  // Initialize Formik for managing form state, validation, and submission
  const formik = useFormik<IFacilityBookingFormValues>({
    // Set initial form field values
    initialValues,

    // Attach Yup validation schema for field validation
    validationSchema: facilityBookingValidationSchema,

    // Handle form submission
    onSubmit: (values) => {
      // Add logic here to handle form submission (e.g., API call or state update)
    },
  });
  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" pb="20px">
        Book a Facility
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          {/* Facility Type */}
          <Grid item xs={6}>
            <ShakingTextField
              error={formik.touched.facilityType && Boolean(formik.errors.facilityType)}
            >
              <CustomSelect
                label="Select Facility"
                autoFocus
                options={[]} // <-- Add your facility options
                value={formik.values.facilityType}
                onChange={(value) => formik.setFieldValue('facilityType', value)}
                disabled={isEdit}
                error={formik.touched.facilityType && Boolean(formik.errors.facilityType)}
                helperText={
                  formik.touched.facilityType && formik.errors.facilityType
                    ? String(formik.errors.facilityType)
                    : ''
                }
              />
            </ShakingTextField>
          </Grid>

          {/* Number of Attendees */}
          <Grid item xs={6}>
            <ShakingTextField error={formik.touched.attendees && Boolean(formik.errors.attendees)}>
              <TextField
                name="attendees"
                label="Number of Attendees"
                value={formik.values.attendees}
                onChange={formik.handleChange}
                size="small"
                fullWidth
                disabled={isEdit}
                error={formik.touched.attendees && Boolean(formik.errors.attendees)}
                helperText={formik.touched.attendees && formik.errors.attendees}
              />
            </ShakingTextField>
          </Grid>

          {/* Purpose Of Booking */}
          <Grid item xs={6}>
            <ShakingTextField
              error={formik.touched.bookingPurpose && Boolean(formik.errors.bookingPurpose)}
            >
              <TextField
                name="bookingPurpose"
                label="Purpose Of Booking"
                value={formik.values.bookingPurpose}
                onChange={formik.handleChange}
                size="small"
                fullWidth
                error={formik.touched.bookingPurpose && Boolean(formik.errors.bookingPurpose)}
                helperText={formik.touched.bookingPurpose && formik.errors.bookingPurpose}
              />
            </ShakingTextField>
          </Grid>

          {/* Date */}
          <Grid item xs={6}>
            <ShakingTextField error={formik.touched.date && Boolean(formik.errors.date)}>
              <DatePicker
                label="Date"
                value={formik.values.date}
                onChange={(newValue) => formik.setFieldValue('date', newValue)}
                format="DD-MM-YYYY"
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                disabled={isEdit}
              />
            </ShakingTextField>
          </Grid>

          {/* Start Time */}
          <Grid item xs={6}>
            <TimePicker
              label="Start Time"
              value={formik.values.startTime}
              viewRenderers={{
                hours: renderTimeViewClock,
                minutes: renderTimeViewClock,
                seconds: renderTimeViewClock,
              }}
              onChange={(newTime) => formik.setFieldValue('startTime', newTime)}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>

          {/* End Time */}
          <Grid item xs={6}>
            <TimePicker
              label="End Time"
              value={formik.values.endTime}
              viewRenderers={{
                hours: renderTimeViewClock,
                minutes: renderTimeViewClock,
                seconds: renderTimeViewClock,
              }}
              onChange={(newTime) => formik.setFieldValue('endTime', newTime)}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>

          {/* Contact Person */}
          <Grid item xs={12}>
            <ShakingTextField
              error={formik.touched.contactPerson && Boolean(formik.errors.contactPerson)}
            >
              <TextField
                rows={2}
                multiline
                name="contactPerson"
                label="Contact Person"
                value={formik.values.contactPerson}
                onChange={formik.handleChange}
                size="small"
                fullWidth
                error={formik.touched.contactPerson && Boolean(formik.errors.contactPerson)}
                helperText={formik.touched.contactPerson && formik.errors.contactPerson}
              />
            </ShakingTextField>
          </Grid>

          {/* Justification */}
          <Grid item xs={12}>
            <ShakingTextField
              error={formik.touched.justification && Boolean(formik.errors.justification)}
            >
              <TextField
                rows={4}
                multiline
                name="justification"
                label="Justification"
                value={formik.values.justification}
                onChange={formik.handleChange}
                size="small"
                fullWidth
                error={formik.touched.justification && Boolean(formik.errors.justification)}
                helperText={formik.touched.justification && formik.errors.justification}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </form>
      <Box pt="55px" />
      <Button
        startIcon={<Iconify icon={GlobalIcons.calenderIcon} />}
        fullWidth
        onClick={() => {}}
        variant="contained"
        sx={{ my: 1 }}
      >
        Submit Booking Request
      </Button>
    </Card>
  );
};

export default BookFacilitySection;
