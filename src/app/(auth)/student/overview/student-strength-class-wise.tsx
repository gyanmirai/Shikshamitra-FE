import React from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import { Card, Typography } from '@mui/material';

import { Chart, useChart } from 'src/components/chart';

const StudentStrengthClassWise = () => {
  const chartOptions = useChart({
    colors: [],
    xaxis: {
      categories: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    },
  });
  return (
    <Grid xs={12} md={6}>
      <Card sx={{ p: 3, boxShadow: 'var(--shadows-4)', height: '100%' }}>
        <Typography variant="h6">Class Wise Strength</Typography>
        <Chart
          type="area"
          series={[
            {
              name: 'Total Students',
              data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
            },
          ]}
          options={chartOptions}
          height={320}
          loadingProps={{ sx: { p: 2.5 } }}
          sx={{ py: 2.5, pl: 1, pr: 2.5 }}
        />
      </Card>
    </Grid>
  );
};

export default StudentStrengthClassWise;
