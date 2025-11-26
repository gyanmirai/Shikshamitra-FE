'use client';

import React from 'react';
import { useTheme } from '@mui/material/styles';
import { CalendarView } from 'src/sections/calendar/view';
import { Box, Grid, Card, Typography, CardContent } from '@mui/material';
import { AnalyticsConversionRates } from 'src/sections/overview/analytics/analytics-conversion-rates';
import { AnalyticsCurrentVisits } from 'src/screens/student/enrollment/dashboard/organization-status';

import { CommunicationDashboardCard } from '../components/DashboardCard';
import { CommunicationTrendChart } from '../components/CommunicationTrendChart';

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

const ANNOUNCEMENT_TYPE_DATA = [
  { label: 'Academic', value: 40 },
  { label: 'Administrative', value: 30 },
  { label: 'Events', value: 20 },
  { label: 'General', value: 10 },
];

const IMPORTANCE_LEVEL_DATA = {
  categories: ['High', 'Medium', 'Low'],
  series: [{ name: 'Count', data: [15, 45, 30] }],
};

const AdminDashboard = () => {
  const theme = useTheme();

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Summary Cards */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <CommunicationDashboardCard
            title="Total Announcements"
            value="1,250"
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
            title="Active Announcements"
            value="45"
            icon="mdi:broadcast"
            color="info.main"
            bgColor="info.lighter"
            labels={[
              { name: 'Academic 20', color: 'success' },
              { name: 'Events 15', color: 'warning' },
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <CommunicationDashboardCard
            title="Notifications Sent Today"
            value="320"
            icon="mdi:send-circle"
            color="success.main"
            bgColor="success.lighter"
            labels={[
              { name: 'sent 200', color: 'success' },
              { name: 'failed 120', color: 'error' },
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
        {/* Delivery Channel Usage */}
        <Grid size={{ xs: 12, md: 4 }}>
          <AnalyticsCurrentVisits
            title="Delivery Channel Usage"
            chart={{
              series: CHANNEL_USAGE_DATA,
            }}
          />
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

        {/* Importance Level Breakdown */}
        <Grid size={{ xs: 12, md: 8 }}>
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
        </Grid>

        {/* Announcement Type Distribution */}
        <Grid size={{ xs: 12, md: 4 }}>
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
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
