import React from 'react';

import { Card, Grid } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';
import { formatCurrency } from 'src/utils/cureencyFormater';

import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const ActivityStudentEnrollment = () => (
  <Grid item xs={12} sx={{ mt: 2 }}>
    <Card sx={{ p: 2 }}>
      <AnalyticsWebsiteVisits
        title="Student Enrollment in Different Activities"
        subheader=""
        chart={{
          categories: ['Cricket', 'Dance', 'Drawing', 'Essay Writing', 'Singing'],
          series: [{ name: 'Payroll', data: [5, 75, 35, 60, 25, 100] }],
          options: {
            yaxis: {
              labels: {
                formatter: (value: number) => `${formatNumber(value)}`,
              },
            },
            tooltip: {
              y: {
                formatter: (value: number) => `${formatCurrency(value)}`,
              },
            },
          },
        }}
        sx={{ height: '100%' }}
      />
    </Card>
  </Grid>
);

export default ActivityStudentEnrollment;
