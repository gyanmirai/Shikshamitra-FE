'use client';

import type { CardProps } from '@mui/material';
import type { ChartOptions } from 'src/components/chart';

import React from 'react';

import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { Box, Card, Divider, useTheme, CardHeader } from '@mui/material';

import { fNumber } from 'src/utils/format-number';

import activities from 'src/json/student/enrollementDashboard/recentActivities.json';

import { Chart, useChart, ChartLegends } from 'src/components/chart';

import OverviewCard from './overview';
import BirthdaySection from './student-birthdate';
import RecentActivities from './recent-activities';
import HouseDistribution from './house-distribution';
import StudentStrengthClassWise from './student-strength-class-wise';

const todayBirthdays = [
  { name: 'Arjun Sharma', age: 15, className: '5A' },
  { name: 'Priya Patel', age: 14, className: '5A' },
];

const upcomingBirthdays = [
  { name: 'Arjun Sharma', age: 15, className: '5A', dateLabel: 'Tomorrow' },
  { name: 'Priya Patel', age: 14, className: '5A', dateLabel: 'Dec 28' },
  { name: 'Raj Kumar', age: 13, className: '4B', dateLabel: 'Dec 29' },
  { name: 'Meera Singh', age: 12, className: '3C', dateLabel: 'Dec 30' },
];

const Overview = () => (
  <Box>
    <Grid2 container spacing={2} sx={{ mb: 2 }}>
      <Grid2 xs={12}>
        <OverviewCard />
      </Grid2>

      <Grid2 xs={12} md={6}>
        <HouseDistribution />
      </Grid2>
      <Grid2 xs={12} md={6}>
        <BirthdaySection
          todaysBirthdays={todayBirthdays}
          upcomingBirthdays={upcomingBirthdays}
          title="Birthdays"
        />
      </Grid2>
      <Grid2 xs={12}>
        <StudentStrengthClassWise />
      </Grid2>

      <Grid2 xs={12}>
        <RecentActivities activities={activities} />
      </Grid2>
    </Grid2>
  </Box>
);

export default Overview;

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
