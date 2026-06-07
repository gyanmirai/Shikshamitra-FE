'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { DashboardCard } from 'src/components/dashboard-card';
import { useGetCalendarViewQuery } from 'src/redux/calendar/calendarApi';
import { AppCurrentDownload } from 'src/sections/overview/app/app-current-download';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';
import { AnalyticsConversionRates } from 'src/sections/overview/analytics/analytics-conversion-rates';
import { CommunicationTrendChart } from 'src/screens/communication/dashboard/components/CommunicationTrendChart';
import {
  Box,
  Grid,
  Card,
  Chip,
  Table,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Typography,
  CardContent,
} from '@mui/material';

type CalendarDashboardItem = {
  id: string;
  title: string;
  calendarItemType: number | string;
  typeName?: string;
  startDate?: string;
  endDate?: string;
  audienceCount?: number;
  status?: number;
  startTime?: string;
  endTime?: string;
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
const weekdayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const isEvent = (item: CalendarDashboardItem) =>
  item.calendarItemType === 0 || item.calendarItemType === 'Event';

const isHoliday = (item: CalendarDashboardItem) =>
  item.calendarItemType === 1 || item.calendarItemType === 'Holiday';

const PrincipalDashboard = () => {
  const theme = useTheme();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { data: calendarViewData } = useGetCalendarViewQuery(
    {
      academicYearId: currentYear?.id,
      maxResultCount: 500,
    },
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

  const todaySchedule = useMemo(
    () =>
      items
        .filter((item) => dayjs(item.startDate).isSame(now, 'day'))
        .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
        .slice(0, 5),
    [items, now]
  );

  const upcomingEvents = useMemo(
    () =>
      events
        .filter((item) => dayjs(item.startDate).isAfter(now.subtract(1, 'day')))
        .sort((a, b) => dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf())
        .slice(0, 5),
    [events, now]
  );

  const upcomingHolidays = useMemo(
    () =>
      holidays
        .filter((item) => dayjs(item.startDate).isAfter(now.subtract(1, 'day')))
        .sort((a, b) => dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf())
        .slice(0, 5),
    [holidays, now]
  );

  const importantEventsToday = todaySchedule.filter((item) => isEvent(item)).length;
  const upcomingAcademicEvents = events.filter((item) => {
    const start = dayjs(item.startDate);
    return (
      start.isAfter(now.subtract(1, 'day')) &&
      start.isBefore(now.add(11, 'day')) &&
      (item.typeName || '').toLowerCase().includes('academic')
    );
  }).length;

  const participationData = useMemo(() => {
    const months = [5, 4, 3, 2, 1, 0].map((offset) => now.subtract(offset, 'month'));
    return {
      categories: months.map((month) => month.format('MMM')),
      series: [
        {
          name: 'Audience Groups',
          data: months.map((month) =>
            items
              .filter((item) => dayjs(item.startDate).isSame(month, 'month'))
              .reduce((sum, item) => sum + (item.audienceCount || 0), 0)
          ),
        },
      ],
    };
  }, [items, now]);

  const academicVsNonAcademicData = useMemo(() => {
    const academic = events.filter((item) =>
      (item.typeName || '').toLowerCase().includes('academic')
    ).length;
    return [
      { label: 'Academic', value: academic },
      { label: 'Non-Academic', value: Math.max(events.length - academic, 0) },
    ];
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

  const weeklyEventDensityData = useMemo(() => {
    const counts = Array.from({ length: 5 }, () => 0);
    events.forEach((item) => {
      const day = dayjs(item.startDate).day();
      if (day >= 1 && day <= 5) counts[day - 1] += 1;
    });
    return {
      categories: weekdayLabels,
      series: [{ name: 'Events', data: counts }],
    };
  }, [events]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <DashboardCard
            title="Important Events"
            value={importantEventsToday}
            icon="mdi:star-circle"
            color="primary.main"
            bgColor="primary.lighter"
            description="Today"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <DashboardCard
            title="Academic Events"
            value={upcomingAcademicEvents}
            icon="mdi:school"
            color="info.main"
            bgColor="info.lighter"
            description="Next 10 Days"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <DashboardCard
            title="Total Holidays"
            value={holidays.length}
            icon="mdi:calendar-blank"
            color="success.main"
            bgColor="success.lighter"
            description="Academic Year"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <CommunicationTrendChart
            title="Audience Groups Trend (Monthly)"
            chart={participationData}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <AppCurrentDownload
            title="Academic vs Non-Academic"
            chart={{
              series: academicVsNonAcademicData,
              colors: [theme.palette.primary.main, theme.palette.info.main],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <AnalyticsConversionRates
            title="Holiday Distribution (Monthly)"
            chart={{
              categories: holidayDistributionData.categories,
              series: holidayDistributionData.series,
              colors: [theme.palette.success.main],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <AnalyticsWebsiteVisits
            title="Weekly Event Density"
            chart={{
              categories: weeklyEventDensityData.categories,
              series: weeklyEventDensityData.series,
              colors: [theme.palette.warning.main],
            }}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CalendarTable
            title="Today's Schedule"
            items={todaySchedule}
            emptyText="No calendar items scheduled today."
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CalendarTable
            title="Upcoming Events"
            items={upcomingEvents}
            emptyText="No upcoming events."
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CalendarTable
            title="Upcoming Holidays"
            items={upcomingHolidays}
            emptyText="No upcoming holidays."
          />
        </Grid>
      </Grid>
    </Box>
  );
};

const CalendarTable = ({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: CalendarDashboardItem[];
  emptyText: string;
}) => (
  <Card>
    <CardContent>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Audience</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.length ? (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <strong>{dayjs(item.startDate).format('MMM D, YYYY')}</strong>
                </TableCell>
                <TableCell>{item.title}</TableCell>
                <TableCell>
                  <Chip
                    label={item.typeName || 'General'}
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{item.audienceCount || 0}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4}>
                <Typography variant="body2" color="text.secondary">
                  {emptyText}
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export default PrincipalDashboard;
