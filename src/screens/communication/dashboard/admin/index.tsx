'use client';

import React from 'react';
import { Box, Grid } from '@mui/material';
import { AnalyticsCurrentVisits } from 'src/screens/student/enrollment/dashboard/organization-status';

import AnnouncementCalendar from '../components/AnnouncementCalendar';
import { CommunicationTrendChart } from '../components/CommunicationTrendChart';
import CommunicationDashboardOverview from '../components/CommunicationDashboardOverview';

// Placeholder data for charts
const CHANNEL_USAGE_DATA = [
  { label: 'In-App', value: 45 },
  { label: 'Email', value: 25 },
  { label: 'SMS', value: 20 },
  { label: 'WhatsApp', value: 10 },
];

const getLast7Days = () => {
  const dates = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }));
  }
  return dates;
};

const WEEKLY_NOTIFICATIONS_DATA = {
  categories: getLast7Days(),
  series: [
    { name: 'Sent', data: [120, 150, 80, 200, 180, 90, 60] },
    { name: 'Pending', data: [80, 100, 40, 120, 100, 50, 30] },
    { name: 'Failed', data: [20, 30, 10, 40, 30, 10, 5] },
  ],
};

const AdminDashboard = () => (
  <Box sx={{ flexGrow: 1 }}>
    <Grid container spacing={1} sx={{ mb: 2 }}>
      {/* Overview Section */}
      <Grid size={{ xs: 12 }}>
        <CommunicationDashboardOverview />
      </Grid>
      {/* Calendar View */}
      <Grid size={{ xs: 12 }}>
        <AnnouncementCalendar />
      </Grid>

      {/* Weekly Notifications Trend */}
      <Grid size={{ xs: 12, md: 8 }}>
        <CommunicationTrendChart
          title="Weekly Notifications Trend"
          chart={{
            categories: WEEKLY_NOTIFICATIONS_DATA.categories,
            series: WEEKLY_NOTIFICATIONS_DATA.series,
          }}
        />
      </Grid>

      {/* Delivery Channel Usage */}
      <Grid size={{ xs: 12, md: 4 }}>
        <AnalyticsCurrentVisits
          title="Delivery Channel Usage"
          chart={{
            series: CHANNEL_USAGE_DATA,
          }}
        />
      </Grid>

      {/* Importance Level Breakdown */}
      {/* <Grid size={{ xs: 12, md: 8 }}>
          <AnalyticsConversionRates
            title="Importance Level Breakdown"
            chart={{
              categories: IMPORTANCE_LEVEL_DATA.categories,
              series: IMPORTANCE_LEVEL_DATA.series,
              colors: [
                theme.palette.error.main,
                theme.palette.warning.main,
                theme.palette.success.main,
              ],
            }}
          />
        </Grid> */}

      {/* Announcement Type Distribution */}
      {/* <Grid size={{ xs: 12, md: 4 }}>
          <AnalyticsCurrentVisits
            title="Announcement Type Distribution"
            chart={{
              series: ANNOUNCEMENT_TYPE_DATA,
              colors: [
                theme.palette.primary.main,
                theme.palette.info.main,
                theme.palette.warning.main,
                theme.palette.error.main,
              ],
            }}
          />
        </Grid> */}
    </Grid>
  </Box>
);

export default AdminDashboard;
