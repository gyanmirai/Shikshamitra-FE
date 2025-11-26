'use client';

import React from 'react';
import { useTheme } from '@mui/material/styles';
import { CalendarView } from 'src/sections/calendar/view';
import { Box, Grid, Card, Typography, CardContent } from '@mui/material';
import { AppCurrentDownload } from 'src/sections/overview/app/app-current-download';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

import { CommunicationDashboardCard } from '../components/DashboardCard';
import { CommunicationTrendChart } from '../components/CommunicationTrendChart';

// Placeholder data for charts
const MONTHLY_ACTIVITY_DATA = {
  categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  series: [
    { name: 'Academic', data: [10, 15, 8, 12] },
    { name: 'Admin', data: [5, 8, 3, 6] },
    { name: 'Events', data: [2, 4, 1, 3] },
  ],
};

const IMPORTANCE_TREND_DATA = {
  categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  series: [
    { name: 'High', data: [5, 2, 4, 1] },
    { name: 'Medium', data: [10, 15, 8, 12] },
    { name: 'Low', data: [20, 25, 18, 22] },
  ],
};

const AUDIENCE_COVERAGE_DATA = [
  { label: 'Students', value: 85 },
  { label: 'Parents', value: 70 },
  { label: 'Staff', value: 95 },
];

const PrincipalDashboard = () => {
  const theme = useTheme();

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Summary Cards */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <CommunicationDashboardCard
            title="Total Announcements"
            value="35"
            icon="mdi:bullhorn"
            color="primary.main"
            bgColor="primary.lighter"
            labels={[
              { name: 'School 10', color: 'info' },
              { name: 'Class 25', color: 'secondary' },
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <CommunicationDashboardCard
            title="Communications Today"
            value="150"
            icon="mdi:message-processing"
            color="info.main"
            bgColor="info.lighter"
            labels={[
              { name: 'Sent 140', color: 'success' },
              { name: 'Failed 10', color: 'error' },
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <CommunicationDashboardCard
            title="Audience Reach %"
            value="88%"
            icon="mdi:account-group"
            color="success.main"
            bgColor="success.lighter"
            labels={[
              { name: 'Parents 90%', color: 'success' },
              { name: 'Students 85%', color: 'info' },
            ]}
          />
        </Grid>
      </Grid>

      {/* Calendar View */}
      <Grid container spacing={3} sx={{ mt: 3 }} size={{ xs: 12 }}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Event Calendar
              </Typography>
              <CalendarView />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        {/* Monthly Communication Activity */}
        <Grid size={{ xs: 12, md: 8 }}>
          <AnalyticsWebsiteVisits
            title="Monthly Communication Activity"
            chart={{
              categories: MONTHLY_ACTIVITY_DATA.categories,
              series: MONTHLY_ACTIVITY_DATA.series,
            }}
          />
        </Grid>

        {/* Audience Coverage */}
        <Grid size={{ xs: 12, md: 4 }}>
          <AppCurrentDownload
            title="Audience Coverage"
            chart={{
              series: AUDIENCE_COVERAGE_DATA,
              colors: [
                theme.palette.primary.main,
                theme.palette.secondary.main,
                theme.palette.info.main,
              ],
            }}
          />
        </Grid>

        {/* Importance Level Trend */}
        <Grid size={{ xs: 12, md: 12 }}>
          <CommunicationTrendChart
            title="Importance Level Trend (Monthly)"
            chart={{
              categories: IMPORTANCE_TREND_DATA.categories,
              series: IMPORTANCE_TREND_DATA.series,
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default PrincipalDashboard;
