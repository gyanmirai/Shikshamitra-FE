'use client';

import React from 'react';
import CustomSelect from 'src/components/custom-select';
import { Box, Card, Grid, Typography } from '@mui/material';
import { PerformanceOverTime } from 'src/screens/academic/gradebook-performance-tracking/progress-report';

const PerformanceTrends = () => (
  <Grid size={12}>
    <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle1">Performance Trends</Typography>
        <CustomSelect
          label="Yearly"
          options={[
            { value: '2024', label: '2024' },
            { value: '2023', label: '2023' },
            { value: '2022', label: '2022' },
          ]}
          onChange={() => {}}
          value=""
          formControlProps={{
            sx: { width: '100%', maxWidth: '200px' },
          }}
        />
      </Box>
      <PerformanceOverTime
        id="demo__4"
        //   title="Performance Over Time"
        //   subheader="(+43%) than last year"
        chart={{
          categories: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ],
          series: [
            {
              name: 'Positive Metrics',
              data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
            },
          ],
          options: {
            legend: {
              show: true,
              position: 'top',
            },
          },
        }}
        sx={{ height: '100%', boxShadow: 'none' }}
      />
    </Card>
  </Grid>
);

export default PerformanceTrends;
