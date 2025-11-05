import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetFrequencyOptionsQuery } from 'src/redux/transport/vehicle-management/vehicleSettingsApi';

const StopBasedModel = ({ formik }: { formik: any }) => {
  const { data } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFrequencyOptionsQuery,
  });
  const frequencyOptions = data || [];

  return (
    <Box p={2}>
      <Typography variant="h6" color="primary" gutterBottom>
        Configure Stop-Based Model
      </Typography>
      <Grid container spacing={3} mt={2}>
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
    </Box>
  );
};

export default StopBasedModel;
