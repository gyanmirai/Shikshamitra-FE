import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { useGetFrequencyOptionsQuery } from 'src/redux/transport/vehicle-management/vehicleSettingsApi';

interface DistanceBasedModelProps {
  formik: any;
}

const DistanceBasedModel: React.FC<DistanceBasedModelProps> = ({ formik }) => {
  const { data } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFrequencyOptionsQuery,
  });

  const frequencyOptions = [
    { value: 'Monthly', label: 'Monthly' },
    { value: 'Quarterly', label: 'Quarterly' },
    { value: 'Half-Yearly', label: 'Half-Yearly' },
    { value: 'Yearly', label: 'Yearly' },
  ];

  // const frequencyOptions = data || [];

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
            <PaginatedSearchSelect
              key={formik.values.feeFrequency || 'fee-frequency-empty'}
              fullWidth
              label="Fee Frequency *"
              noOptionsText="No Frequency Found"
              minChars={0}
              size="small"
              fetchOptions={async (query: string, page: number) => {
                const filtered = frequencyOptions.filter((o: any) =>
                  o.label.toLowerCase().includes(query.toLowerCase())
                );
                const pageSize = 10;
                const start = (page - 1) * pageSize;
                return {
                  data: filtered.slice(start, start + pageSize),
                  hasMore: start + pageSize < filtered.length,
                };
              }}
              getOptionLabel={(option: any) => option?.label || ''}
              value={
                frequencyOptions.find((o: any) => o.value === formik.values.feeFrequency) || null
              }
              onChange={(_, newValue: any) =>
                formik.setFieldValue('feeFrequency', newValue ? newValue.value : '')
              }
              isOptionEqualToValue={(option: any, val: any) => option.value === val.value}
              error={!!(formik.touched.feeFrequency && formik.errors.feeFrequency)}
              helperText={
                formik.touched.feeFrequency ? (formik.errors.feeFrequency as string) : undefined
              }
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
