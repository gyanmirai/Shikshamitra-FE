'use client';

import React from 'react';

import { Card, Grid, alpha, useTheme } from '@mui/material';

import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const StudentPerformance = () => {
  const theme = useTheme();
  return (
    <Grid item xs={12} md={12}>
      <Card sx={{ p: 2 }}>
        <AnalyticsWebsiteVisits
          title="Student Performance Levels"
          //   subheader="(+43%) than last year"
          chart={{
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
            series: [
              { name: 'High', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
              { name: 'Medium', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
              { name: 'Low', data: [51, 67, 47, 97, 40, 57, 24, 60, 24] },
            ],
            colors: [
              alpha(theme.palette.primary.dark, 0.8),
              alpha(theme.palette.warning.main, 0.8),
              alpha(theme.palette.error.main, 0.8),
            ],
          }}
          sx={{ height: '100%' }}
        />
      </Card>
    </Grid>
  );
};

export default StudentPerformance;
