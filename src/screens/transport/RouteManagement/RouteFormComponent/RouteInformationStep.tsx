import type { FormikProps } from 'formik';

import { Grid, TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import ShakingTextField from 'src/components/shaking-text-field';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import type { IRoutePayload } from '../Components/type';

interface RouteInformationStepProps {
  formik: FormikProps<IRoutePayload>;
}

const RouteInformationStep = ({ formik }: RouteInformationStepProps) => {
  // Mock data - replace with actual API calls
  const routeTypeOptions = [
    { value: 'pickup', label: 'Pickup' },
    { value: 'drop', label: 'Drop' },
    { value: 'both', label: 'Both' },
  ];

  const locationOptions = [
    { value: 'deep-darshan', label: 'Deep Darshan' },
    { value: 'parvat-patiya', label: 'Parvat Patiya' },
    { value: 'kamrej', label: 'Kamrej' },
    { value: 'kapodara', label: 'Kapodara' },
    { value: 'simadi', label: 'Simadi' },
    { value: 'adajan', label: 'Adajan' },
    { value: 'godadara', label: 'Godadara' },
  ];

  return (
    <SectionCard title="General Information">
      <Grid container spacing={2}>
        {/* Route Name */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ mb: 1 }}>
          <ShakingTextField error={!!(formik.touched.routeName && formik.errors.routeName)}>
            <TextField
              fullWidth
              name="routeName"
              label="Route Name *"
              value={formik.values.routeName}
              onChange={(e) => {
                let value = e.target.value.replace(/[^a-zA-Z0-9\s-]/g, '');
                // Capitalize first letter of each word
                value = value.replace(/\b\w/g, (char) => char.toUpperCase());
                formik.setFieldValue('routeName', value);
              }}
              error={!!(formik.touched.routeName && formik.errors.routeName)}
              helperText={formik.touched.routeName && formik.errors.routeName}
              size="small"
            />
          </ShakingTextField>
        </Grid>

        {/* Route Code */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ mb: 1 }}>
          <ShakingTextField error={!!(formik.touched.routeCode && formik.errors.routeCode)}>
            <TextField
              fullWidth
              name="routeCode"
              label="Route Code *"
              value={formik.values.routeCode}
              onChange={(e) => {
                let value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                value = value.toUpperCase();
                formik.setFieldValue('routeCode', value);
              }}
              error={!!(formik.touched.routeCode && formik.errors.routeCode)}
              helperText={formik.touched.routeCode && formik.errors.routeCode}
              size="small"
            />
          </ShakingTextField>
        </Grid>

        {/* Route Type */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ mb: 1 }}>
          <ShakingTextField error={!!(formik.touched.routeType && formik.errors.routeType)}>
            <CustomSelect
              label="Route Type *"
              name="routeType"
              options={routeTypeOptions}
              value={formik.values.routeType}
              onChange={(value) => formik.setFieldValue('routeType', value)}
              error={!!(formik.touched.routeType && formik.errors.routeType)}
              helperText={formik.touched.routeType ? formik.errors.routeType : undefined}
              formControlProps={{ fullWidth: true }}
              size="small"
            />
          </ShakingTextField>
        </Grid>

        {/* Start Point */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ mb: 1 }}>
          <ShakingTextField error={!!(formik.touched.startPoint && formik.errors.startPoint)}>
            <CustomSelect
              label="Start Point *"
              name="startPoint"
              options={locationOptions}
              value={formik.values.startPoint}
              onChange={(value) => formik.setFieldValue('startPoint', value)}
              error={!!(formik.touched.startPoint && formik.errors.startPoint)}
              helperText={formik.touched.startPoint ? formik.errors.startPoint : undefined}
              formControlProps={{ fullWidth: true }}
              size="small"
            />
          </ShakingTextField>
        </Grid>

        {/* End Point */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ mb: 1 }}>
          <ShakingTextField error={!!(formik.touched.endPoint && formik.errors.endPoint)}>
            <CustomSelect
              label="End Point *"
              name="endPoint"
              options={locationOptions}
              value={formik.values.endPoint}
              onChange={(value) => formik.setFieldValue('endPoint', value)}
              error={!!(formik.touched.endPoint && formik.errors.endPoint)}
              helperText={formik.touched.endPoint ? formik.errors.endPoint : undefined}
              formControlProps={{ fullWidth: true }}
              size="small"
            />
          </ShakingTextField>
        </Grid>

        {/* Distance */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ mb: 1 }}>
          <ShakingTextField error={!!(formik.touched.distance && formik.errors.distance)}>
            <TextField
              fullWidth
              name="distance"
              label="Distance *"
              value={formik.values.distance}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.\s]/g, '');
                formik.setFieldValue('distance', value);
              }}
              error={!!(formik.touched.distance && formik.errors.distance)}
              helperText={formik.touched.distance && formik.errors.distance}
              size="small"
            />
          </ShakingTextField>
        </Grid>

        {/* Start Time TimePicker */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ mb: 1 }}>
          <ShakingTextField
            error={!!(formik.touched.startTime && formik.errors.startTime) || false}
          >
            <TimePicker
              label="Start Time *"
              format="hh:mm A"
              value={formik.values.startTime}
              onChange={(newValue) => {
                formik.setFieldValue('startTime', newValue);
              }}
              sx={{ minWidth: 180, width: '100%' }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  error: !!(formik.touched.startTime && formik.errors.startTime) || false,
                  helperText: formik.touched.startTime && formik.errors.startTime,
                },
              }}
            />
          </ShakingTextField>
        </Grid>

        {/* End Time TimePicker */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ mb: 1 }}>
          <ShakingTextField error={!!(formik.touched.endTime && formik.errors.endTime) || false}>
            <TimePicker
              label="End Time *"
              format="hh:mm A"
              value={formik.values.endTime}
              onChange={(newValue) => {
                formik.setFieldValue('endTime', newValue);
              }}
              sx={{ minWidth: 180, width: '100%' }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  error: !!(formik.touched.endTime && formik.errors.endTime) || false,
                  helperText: formik.touched.endTime && formik.errors.endTime,
                },
              }}
            />
          </ShakingTextField>
        </Grid>

        {/* Duration */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ mb: 1 }}>
          <ShakingTextField error={!!(formik.touched.duration && formik.errors.duration)}>
            <TextField
              fullWidth
              name="duration"
              label="Duration *"
              value={formik.values.duration}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.\s]/g, '');

                formik.setFieldValue('duration', value);
              }}
              error={!!(formik.touched.duration && formik.errors.duration)}
              helperText={formik.touched.duration && formik.errors.duration}
              size="small"
            />
          </ShakingTextField>
        </Grid>

        {/* Description */}
        <Grid size={{ xs: 12 }}>
          <ShakingTextField error={!!(formik.touched.description && formik.errors.description)}>
            <TextField
              fullWidth
              name="description"
              label="Description"
              value={formik.values.description}
              onChange={formik.handleChange}
              error={!!(formik.touched.description && formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
              size="small"
              multiline
              minRows={3}
              maxRows={5}
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </SectionCard>
  );
};

export default RouteInformationStep;
