import type { Division } from 'src/types/school';

import React from 'react';

import { Box, Grid, TextField } from '@mui/material';

interface DivisionSetupProps {
  values: {
    division: Division;
  };
  errors: any;
  touched: any;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleBlur: (e: React.FocusEvent<any>) => void;
  setFieldValue: (field: string, value: any) => void;
}

const DivisionSetup: React.FC<DivisionSetupProps> = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
}) => (
  <Box sx={{ mt: 2, width: '100%' }}>
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          name="division.name"
          label="Division Name"
          value={values.division.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.division?.name && Boolean(errors.division?.name)}
          helperText={touched.division?.name && errors.division?.name}
        />
      </Grid>
    </Grid>
  </Box>
);

export default DivisionSetup;
