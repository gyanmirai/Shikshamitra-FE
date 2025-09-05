'use client';

import React from 'react';
import { Grid, Card } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const AssignmentAnalytics = () => {
  const theme = useTheme();
  return (
    <Grid size={12}>
      <Card sx={{ p: 2 }}>
        <AnalyticsWebsiteVisits
          title="Assignment Analytics"
          //   subheader="(+43%) than last year"
          chart={{
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
            series: [
              { name: 'Submission rates', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
              { name: 'Average grades', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
              { name: 'Overdue assignments', data: [51, 67, 47, 97, 40, 57, 24, 60, 24] },
            ],
            colors: [
              alpha(theme.palette.primary.dark, 0.8),
              alpha(theme.palette.warning.main, 0.8),
              alpha(theme.palette.error.main, 0.8),
            ],
          }}
          sx={{ height: 360 }}
        />
      </Card>
    </Grid>
  );
};

export default AssignmentAnalytics;
