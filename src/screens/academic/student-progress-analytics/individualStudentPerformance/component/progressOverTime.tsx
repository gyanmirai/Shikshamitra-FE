'use client';

import React from 'react';

import { Box, Card, Grid, Typography } from '@mui/material';

import { PerformanceOverTime } from 'src/screens/academic/gradebook-performance-tracking/progress-report';

const ProgressOverTime = () => (
  <Grid item xs={12} md={6}>
    <Card sx={{ height: '400px', p: 2, boxShadow: 'var(--shadows-2)' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle1">Progress Over Time</Typography>
      </Box>
      <PerformanceOverTime
        id="demo__4"
        //   title="Performance Over Time"
        //   subheader="(+43%) than last year"
        chart={{
          categories: [
            'Jan',
            'Feb',
            'March',
            'Apr',
            'May',
            'June',
            'July',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ],
          series: [
            {
              name: '',
              data: [5, 8, 15, 20, 23, 30, 35, 41, 48, 60, 65, 71],
            },
          ],
        }}
        sx={{ height: '100%', boxShadow: 'none' }}
      />
    </Card>
  </Grid>
);

export default ProgressOverTime;
