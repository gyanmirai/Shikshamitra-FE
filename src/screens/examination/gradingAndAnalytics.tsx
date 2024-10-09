import React from 'react';

import { Box, Grid } from '@mui/material';

import CustomSelect from 'src/components/custom-select';

const GradingAndAnalytics = () => (
  <Box sx={{ display: 'flex' }}>
    <Grid container item spacing={1}>
      <Grid item xs={12} md={3}>
        <CustomSelect
          label="Class"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 340 } }}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <CustomSelect
          label="Division"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 340 } }}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <CustomSelect
          label="To Date"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 340 } }}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <CustomSelect
          label="End Date"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 340 } }}
        />
      </Grid>
    </Grid>
  </Box>
);

export default GradingAndAnalytics;
