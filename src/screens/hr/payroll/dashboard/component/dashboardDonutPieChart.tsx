'use client';

import React from 'react';
import { Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AppCurrentDownload } from 'src/sections/overview/app/app-current-download';
import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';

const DashboardDonutPieChart = () => {
  const theme = useTheme();

  return (
    <Grid container spacing={2} mt={2} mb={2}>
      <Grid size={{ xs: 12, md: 4 }}>
        <AppCurrentDownload
          title="Payroll Analytics"
          subheader=""
          chart={{
            series: [
              { label: 'Employee Payroll Run', value: 1224 },
              { label: 'Employee Payroll Remain', value: 53345 },
            ],
            colors: [theme.vars.palette.primary.light, theme.vars.palette.primary.darker],
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <AnalyticsCurrentVisits
          sx={{ height: '100%' }}
          title="Leave Analysis"
          chart={{
            series: [
              { label: 'Finance', value: 40 },
              { label: 'Teacher', value: 30 },
              { label: 'Admin', value: 20 },
              { label: 'Principal', value: 10 },
            ],
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <AppCurrentDownload
          sx={{ height: '100%' }}
          title="Average Pay Distribution"
          subheader=""
          chart={{
            series: [
              { label: 'Over-Time', value: 98 },
              { label: 'Fixed Allowance', value: 50 },
              { label: 'Bonus', value: 60 },
            ],
            colors: [theme.vars.palette.primary.light, theme.vars.palette.primary.darker],
          }}
        />
      </Grid>
    </Grid>
  );
};

export default DashboardDonutPieChart;
