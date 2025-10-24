import React from 'react';
import CustomSelect from 'src/components/custom-select';
import { Box, Grid, Paper, Typography } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { useGetFrequencyOptionsQuery } from 'src/redux/transport/vehicle-management/vehicleSettingsApi';

interface DistanceBasedModelProps {
  formik: any;
}

const DistanceBasedModel: React.FC<DistanceBasedModelProps> = ({ formik }) => {
  const { data } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFrequencyOptionsQuery,
  });

  const frequencyOptions = data || [];

  // Example distance and calculated fee preview
  const exampleDistance = 8;
  const exampleFee = (formik.values.ratePerKm || 0) * exampleDistance;

  return (
    <Box p={2}>
      <Typography variant="h6" color="primary" gutterBottom>
        Configure Distance-Based Model
      </Typography>

      <Grid container spacing={3} mt={2}>
        {/* Rate Per Km */}
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
                formik.setFieldValue('ratePerKm', val);
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

        {/* Fee Frequency */}
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

      {/* Formula Preview */}
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
          Example: ₹{formik.values.ratePerKm || 0}/km × {exampleDistance}km = ₹{exampleFee}/
          {formik.values.feeFrequency?.toLowerCase() || 'daily'}
        </Typography>
      </Paper>
    </Box>
  );
};

export default DistanceBasedModel;
