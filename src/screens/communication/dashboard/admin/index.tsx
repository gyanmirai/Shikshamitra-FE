'use client';

import React, { useMemo } from 'react';
import { Box, Grid } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetCommunicationDashboardQuery } from 'src/redux/communication/communicationApi';
import { AnalyticsCurrentVisits } from 'src/screens/student/enrollment/dashboard/organization-status';
import {
  channelLabel,
  communicationChannelOptions,
} from 'src/redux/communication/communicationMappers';

import AnnouncementCalendar from '../components/AnnouncementCalendar';
import { CommunicationTrendChart } from '../components/CommunicationTrendChart';
import CommunicationDashboardOverview from '../components/CommunicationDashboardOverview';

const getLast7Days = () => {
  const dates = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }));
  }
  return dates;
};

const toUsageDateLabel = (value: string) =>
  new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

const AdminDashboard = () => {
  const { data: dashboard } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCommunicationDashboardQuery,
  });

  const weeklyNotificationsData = useMemo(() => {
    const categories = getLast7Days();
    const usage = dashboard?.recentUsage || [];

    return {
      categories,
      series: [
        {
          name: 'Attempts',
          data: categories.map((date) =>
            usage
              .filter((entry: any) => toUsageDateLabel(entry.usageDate) === date)
              .reduce((sum: number, entry: any) => sum + (entry.attemptCount || 0), 0)
          ),
        },
        {
          name: 'Delivered',
          data: categories.map((date) =>
            usage
              .filter((entry: any) => toUsageDateLabel(entry.usageDate) === date)
              .reduce((sum: number, entry: any) => sum + (entry.deliveredCount || 0), 0)
          ),
        },
        {
          name: 'Failed',
          data: categories.map((date) =>
            usage
              .filter((entry: any) => toUsageDateLabel(entry.usageDate) === date)
              .reduce((sum: number, entry: any) => sum + (entry.failedCount || 0), 0)
          ),
        },
      ],
    };
  }, [dashboard?.recentUsage]);

  const channelUsageData = useMemo(() => {
    const totals = new Map<number, number>();

    (dashboard?.recentUsage || []).forEach((entry: any) => {
      totals.set(entry.channel, (totals.get(entry.channel) || 0) + (entry.attemptCount || 0));
    });

    return communicationChannelOptions.map((option) => ({
      label: channelLabel(option.value),
      value: totals.get(option.value) || 0,
    }));
  }, [dashboard?.recentUsage]);

  return (
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
              categories: weeklyNotificationsData.categories,
              series: weeklyNotificationsData.series,
            }}
          />
        </Grid>

        {/* Delivery Channel Usage */}
        <Grid size={{ xs: 12, md: 4 }}>
          <AnalyticsCurrentVisits
            title="Delivery Channel Usage"
            chart={{
              series: channelUsageData,
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
};

export default AdminDashboard;
