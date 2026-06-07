'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { Box, Grid, Card, CardHeader } from '@mui/material';
import { DashboardCard } from 'src/components/dashboard-card';
import { Chart, useChart, ChartLegends } from 'src/components/chart';
import { useGetCalendarViewQuery } from 'src/redux/calendar/calendarApi';
import { useGetGroupsQuery } from 'src/redux/calendar/GroupManagement/groupManagementApi';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

type CalendarDashboardItem = {
  id: string;
  title: string;
  calendarItemType: number | string;
  typeName?: string;
  startDate?: string;
  endDate?: string;
  audienceCount?: number;
  status?: number;
};

const monthLabels = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const isEvent = (item: CalendarDashboardItem) =>
  item.calendarItemType === 0 || item.calendarItemType === 'Event';

const isHoliday = (item: CalendarDashboardItem) =>
  item.calendarItemType === 1 || item.calendarItemType === 'Holiday';

const AdminDashboard = () => {
  const theme = useTheme();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { data: calendarViewData } = useGetCalendarViewQuery(
    {
      academicYearId: currentYear?.id,
      maxResultCount: 500,
    },
    { skip: !currentYear?.id }
  );
  const { data: groupData } = useGetGroupsQuery(
    { academicYearId: currentYear?.id, includeDetails: true, maxResultCount: 500 },
    { skip: !currentYear?.id }
  );

  const items = useMemo<CalendarDashboardItem[]>(
    () => calendarViewData?.items || [],
    [calendarViewData?.items]
  );
  const events = useMemo(() => items.filter(isEvent), [items]);
  const holidays = useMemo(() => items.filter(isHoliday), [items]);

  const todayKey = dayjs().format('YYYY-MM-DD');
  const now = useMemo(() => dayjs(todayKey), [todayKey]);
  const totalEventsThisMonth = events.filter((item) =>
    dayjs(item.startDate).isSame(now, 'month')
  ).length;
  const upcomingHolidays = holidays.filter((item) => {
    const start = dayjs(item.startDate);
    return start.isAfter(now.subtract(1, 'day')) && start.isBefore(now.add(8, 'day'));
  }).length;
  const activeGroups =
    groupData?.items?.filter((group: any) => (group.memberCount || 0) > 0).length || 0;

  const eventTypeData = useMemo(() => {
    const counts = new Map<string, number>();
    events.forEach((item) => {
      const label = item.typeName || 'General';
      counts.set(label, (counts.get(label) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([label, value]) => ({ label, value }));
  }, [events]);

  const holidayDistributionData = useMemo(() => {
    const counts = Array.from({ length: 12 }, () => 0);
    holidays.forEach((item) => {
      const monthIndex = dayjs(item.startDate).month();
      if (monthIndex >= 0) counts[monthIndex] += 1;
    });
    return {
      categories: monthLabels,
      series: [{ name: 'Holidays', data: counts }],
    };
  }, [holidays]);

  const eventLoadData = useMemo(() => {
    const weekStarts = [3, 2, 1, 0].map((offset) => now.subtract(offset, 'week').startOf('week'));
    return {
      categories: weekStarts.map((week) => week.format('MMM D')),
      series: [
        {
          name: 'Events Scheduled',
          data: weekStarts.map(
            (week) => events.filter((item) => dayjs(item.startDate).isSame(week, 'week')).length
          ),
        },
        {
          name: 'Events Completed',
          data: weekStarts.map(
            (week) =>
              events.filter(
                (item) => item.status === 2 && dayjs(item.startDate).isSame(week, 'week')
              ).length
          ),
        },
      ],
    };
  }, [events, now]);

  const audienceData = useMemo(
    () => ({
      categories: ['Events', 'Holidays'],
      series: [
        {
          name: 'Audience Groups',
          data: [
            events.reduce((sum, item) => sum + (item.audienceCount || 0), 0),
            holidays.reduce((sum, item) => sum + (item.audienceCount || 0), 0),
          ],
        },
      ],
    }),
    [events, holidays]
  );

  const eventLoadTrendOptions = useChart({
    colors: [theme.palette.success.main, theme.palette.warning.main],
    stroke: { width: 3, curve: 'smooth' },
    xaxis: { categories: eventLoadData.categories },
    yaxis: { labels: { formatter: (value: number) => `${value}` } },
    grid: { borderColor: theme.palette.divider, strokeDashArray: 3 },
    tooltip: { y: { formatter: (value: number) => `${value} Events` } },
    legend: { show: true, position: 'top', horizontalAlign: 'right' },
  });

  const holidayDistributionOptions = useChart({
    colors: [theme.palette.info.main],
    stroke: { width: 0 },
    xaxis: { categories: holidayDistributionData.categories },
    plotOptions: { bar: { columnWidth: '40%', borderRadius: 4 } },
    tooltip: { y: { formatter: (value: number) => `${value} Holidays` } },
  });

  const eventTypeChartSeries = eventTypeData.length ? eventTypeData.map((item) => item.value) : [0];
  const eventTypeChartLabels = eventTypeData.length
    ? eventTypeData.map((item) => item.label)
    : ['No Events'];
  const eventTypeChartColors = [
    theme.palette.primary.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.error.main,
    theme.palette.success.main,
  ];

  const eventTypeOptions = useChart({
    chart: { sparkline: { enabled: true } },
    colors: eventTypeChartColors,
    labels: eventTypeChartLabels,
    stroke: { colors: [theme.palette.background.paper] },
    legend: { floating: true, position: 'bottom', horizontalAlign: 'center' },
    dataLabels: { enabled: true, dropShadow: { enabled: false } },
    tooltip: { fillSeriesColor: false },
    plotOptions: { pie: { donut: { labels: { show: false } } } },
  });

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <DashboardCard
            title="Total Events"
            value={totalEventsThisMonth}
            icon="mdi:calendar-multiple"
            color="primary.main"
            bgColor="primary.lighter"
            description="This Month"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <DashboardCard
            title="Upcoming Holidays"
            value={upcomingHolidays}
            icon="mdi:beach"
            color="info.main"
            bgColor="info.lighter"
            description="Next 7 Days"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <DashboardCard
            title="Active Groups"
            value={activeGroups}
            icon="mdi:account-group"
            color="success.main"
            bgColor="success.lighter"
            description="With Audience"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Holiday Distribution (Monthly)" />
            <Box sx={{ p: 3, pb: 1 }}>
              <Chart
                dir="ltr"
                type="bar"
                series={holidayDistributionData.series}
                options={holidayDistributionOptions}
                width="100%"
                height={364}
              />
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <AnalyticsWebsiteVisits
              title="Audience Groups"
              chart={{
                categories: audienceData.categories,
                series: audienceData.series,
                colors: [theme.palette.primary.main, theme.palette.success.main],
                options: {
                  plotOptions: { bar: { distributed: true, borderRadius: 4 } },
                  legend: { show: false },
                },
              }}
            />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Weekly Event Load" />
            <Box sx={{ p: 3, pb: 1 }}>
              <Chart
                dir="ltr"
                type="area"
                series={eventLoadData.series}
                options={eventLoadTrendOptions}
                width="100%"
                height={364}
              />
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardHeader title="Event Type Breakdown" />
            <Box sx={{ my: 6, '& .apexcharts-canvas': { margin: '0 auto' } }}>
              <Chart
                dir="ltr"
                type="donut"
                series={eventTypeChartSeries}
                options={eventTypeOptions}
                width="100%"
                height={280}
              />
            </Box>
            <ChartLegends
              labels={eventTypeOptions?.labels}
              colors={eventTypeOptions?.colors}
              sx={{ p: 3, justifyContent: 'center' }}
            />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
