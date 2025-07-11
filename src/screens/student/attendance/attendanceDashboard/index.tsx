'use client';

import type { CardProps } from '@mui/material';
import type { ChartOptions } from 'src/components/chart';

import React, { useState } from 'react';

import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { Box, Card, Divider, useTheme, CardHeader } from '@mui/material';

import { fNumber } from 'src/utils/format-number';

import { Chart, useChart, ChartLegends } from 'src/components/chart';

import Overview from './components/overview';
import RecentLeaveRequests from './components/recentLeaveRequests';
import DailyAttendanceTrend from './components/dailyAttendanceTrend';
import AttendanceStatusCard from './components/attendanceMarkingStatus';

const StudentAttendanceDashboard = () => {
  const [sections, setSections] = useState([
    {
      id: '0',
      title: 'Over View',
    },
    {
      id: '1',
      title: 'Daily Attendance Trend',
    },
    {
      id: '2',
      title: 'Attendance Marking Status',
    },
    {
      id: '3',
      title: 'Recent Leave Requests',
    },
  ]);
  return (
    <Box>
      {/* <CustomizableView sections={sections} setSections={setSections} /> */}
      <Grid2 container spacing={2} sx={{ mb: 2 }}>
        <Grid2 xs={12}>
          <Overview />
        </Grid2>
        <Grid2 xs={12} md={6}>
          <DailyAttendanceTrend />
        </Grid2>
        <Grid2 xs={12} md={6}>
          <AttendanceStatusCard />
        </Grid2>
        {/* <Grid2 xs={12} md={6}>
          <StudentBirthDate />
        </Grid2> */}
        <Grid2 xs={12}>
          <RecentLeaveRequests />
        </Grid2>
      </Grid2>
      {/* <Grid2 container spacing={2} sx={{ mb: 2 }}>
        <Grid2 xs={12}>{sections.map((section: any) => dashBoardSections[section.id])}</Grid2>
      </Grid2> */}
    </Box>
  );
};

export default StudentAttendanceDashboard;

type Props1 = CardProps & {
  title?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    series: {
      label: string;
      value: number;
    }[];
    options?: ChartOptions;
  };
};
export function AttendanceOverview({ title, subheader, chart, ...other }: Props1): JSX.Element {
  const theme = useTheme();

  const chartColors = chart.colors ?? [
    theme.palette.primary.dark,
    theme.palette.primary.lighter,
    theme.palette.primary.light,
    theme.palette.primary.darker,
  ];

  const chartSeries = chart.series.map((item) => item.value);

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    colors: chartColors,
    labels: chart.series.map((item) => item.label),
    stroke: { width: 0 },
    tooltip: {
      y: {
        formatter: (value: number) => fNumber(value),
        title: { formatter: (seriesName: string) => `${seriesName}` },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            value: { formatter: (value: number | string) => fNumber(value) },
            total: {
              formatter: (w: {
                globals: {
                  seriesTotals: number[];
                };
              }) => {
                const sum = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return fNumber(sum);
              },
            },
          },
        },
      },
    },
    ...chart.options,
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Chart
        type="donut"
        series={chartSeries}
        options={chartOptions}
        width={{ xs: 240, xl: 260 }}
        height={{ xs: 240, xl: 260 }}
        sx={{ my: 6, mx: 'auto' }}
      />

      <Divider sx={{ borderStyle: 'dashed' }} />

      <ChartLegends
        labels={chartOptions?.labels}
        colors={chartOptions?.colors}
        sx={{ p: 3, justifyContent: 'center' }}
      />
    </Card>
  );
}
