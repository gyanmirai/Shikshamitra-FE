'use client';

import React from 'react';
import { Card, Grid } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { AppCurrentDownload } from 'src/screens/hr/dashboard/app-current-download';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const AttendaceOverview = () => {
  const theme = useTheme();
  return (
    <Grid container spacing={2} mt={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <AppCurrentDownload
          title="Attendance Overview"
          chart={{
            series: [
              { label: 'Present', value: 50 },
              { label: 'Absent', value: 30 },
            ],
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <Card sx={{ p: 2, height: '100%' }}>
          <AnalyticsWebsiteVisits
            title="Student Performance Levels"
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
              series: [
                { name: 'Exam', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
                { name: 'Quiz', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
              ],
              colors: [
                alpha(theme.palette.primary.dark, 0.8),
                alpha(theme.palette.warning.main, 0.8),
              ],
            }}
            sx={{ height: '100%' }}
          />
        </Card>
      </Grid>
    </Grid>
  );
};

export default AttendaceOverview;
