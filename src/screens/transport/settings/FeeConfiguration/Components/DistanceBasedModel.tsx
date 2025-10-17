import React from 'react';
import { useFormik } from 'formik';
import CustomSelect from 'src/components/custom-select';
import { Box, Grid, Paper, Typography } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import {
  useGetFrequencyOptionsQuery,
  useGetDistanceCalculationOptionsQuery,
} from 'src/redux/transport/vehicle-management/vehicleSettingsApi';

const DistanceBasedModel = () => {
  const { data: distanceCalculation } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetDistanceCalculationOptionsQuery,
  });

  const distanceCalculationOptions = distanceCalculation || [];

  const { data } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFrequencyOptionsQuery,
  });

  const frequencyOptions = data || [];

  const formik = useFormik({
    initialValues: {
      ratePerKm: 10,
      distanceCalculationType: 'Pickup-Drop',
      feeFrequency: 'Daily',
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });

  // Calculate example fee
  const exampleDistance = 8;
  const exampleFee = formik.values.ratePerKm * exampleDistance;

  return (
    <Box p={3}>
      <Typography variant="h6" color="primary" gutterBottom>
        Configure Distance-Based Model
      </Typography>

      <Grid container spacing={2} mt={1}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(formik.touched.ratePerKm && formik.errors.ratePerKm)}>
            <NumericFormatCustom
              size="small"
              fullWidth
              label="Rate per km (₹) *"
              name="ratePerKm"
              value={formik.values.ratePerKm || ''}
              onChange={(e) => {
                let val = e.target.value;
                val = val.replace(/[₹,\s]/g, '');
                formik.setFieldValue('ratePerKm', Number(val));
              }}
              error={!!(formik.touched.ratePerKm && formik.errors.ratePerKm)}
              helperText={formik.touched.ratePerKm && formik.errors.ratePerKm}
              sx={{
                width: '100%',
                padding: '0',
                borderRadius: 1,
              }}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField
            error={
              !!(formik.touched.distanceCalculationType && formik.errors.distanceCalculationType)
            }
          >
            <CustomSelect
              label="Distance Calculation Type *"
              options={distanceCalculationOptions}
              value={formik.values.distanceCalculationType}
              onChange={(val) => {
                formik.setFieldValue('distanceCalculationType', val);
              }}
              error={
                !!(formik.touched.distanceCalculationType && formik.errors.distanceCalculationType)
              }
              helperText={
                (formik.touched.distanceCalculationType &&
                  formik.errors.distanceCalculationType) as string
              }
              formControlProps={{ fullWidth: true }}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(formik.touched.feeFrequency && formik.errors.feeFrequency)}>
            <CustomSelect
              label="Fee Frequency *"
              options={frequencyOptions}
              value={formik.values.feeFrequency}
              onChange={(val) => {
                formik.setFieldValue('feeFrequency', val);
              }}
              error={!!(formik.touched.feeFrequency && formik.errors.feeFrequency)}
              helperText={(formik.touched.feeFrequency && formik.errors.feeFrequency) as string}
              formControlProps={{ fullWidth: true }}
            />
          </ShakingTextField>
        </Grid>
      </Grid>

      <Paper
        elevation={0}
        sx={{
          mt: 3,
          p: 2,
          backgroundColor: 'background.neutral',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Formula Preview:
        </Typography>
        <Typography variant="body2">
          Example: ₹{formik.values.ratePerKm}/km × {exampleDistance}km = ₹{exampleFee}/
          {formik.values.feeFrequency.toLowerCase()}
        </Typography>
      </Paper>
    </Box>
  );
};

export default DistanceBasedModel;
