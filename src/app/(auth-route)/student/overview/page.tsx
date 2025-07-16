'use client';

import type { CardProps } from '@mui/material';
import type { ChartOptions } from 'src/components/chart';

import React, { useState } from 'react';

import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { Box, Card, Divider, useTheme, CardHeader } from '@mui/material';

import { fNumber } from 'src/utils/format-number';

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
];

const activities = [
  {
    color: 'success',
    title: 'Roll No. assigned to Yuvraj Singh',
    subtitle: 'Class 5-B · Roll No.-12',
    timeAgo: '2 hours ago',
    date: '06-07-2025',
  },
  {
    color: 'info',
    title: 'Division Changed for Meera Patel',
    subtitle: 'Class 4-B ➝ 4-C',
    timeAgo: '4 hours ago',
    date: '06-07-2025',
  },
  {
    color: 'success',
    title: 'New Student added to Blue House',
    subtitle: 'Anjali Sharma · Class 3-A',
    timeAgo: '6 hours ago',
    date: '06-07-2025',
  },
  {
    color: 'success',
    title: 'GR No. generated for Kiran Kumar',
    subtitle: 'GR2025001847',
    timeAgo: '1 day ago',
    date: '05-07-2025',
  },
  {
    color: 'warning',
    title: 'House change request pending',
    subtitle: 'Anjali Sharma · Green to Red House',
    timeAgo: '2 days ago',
    date: '04-07-2025',
  },
  {
    color: 'error',
    title: 'Attendance marked absent',
    subtitle: 'Rahul Verma · Class 6-A',
    timeAgo: '3 days ago',
    date: '03-07-2025',
  },
  {
    color: 'info',
    title: 'Fee payment received',
    subtitle: 'Priya Shah · Term 2 Fees',
    timeAgo: '4 days ago',
    date: '02-07-2025',
  },
  {
    color: 'success',
    title: 'Sports team selection',
    subtitle: 'Arjun Kumar · Football Team',
    timeAgo: '5 days ago',
    date: '01-07-2025',
  },
  {
    color: 'warning',
    title: 'Parent meeting scheduled',
    subtitle: 'Neha Gupta · Class 7-B',
    timeAgo: '1 week ago',
    date: '29-06-2025',
  },
  {
    color: 'info',
    title: 'Academic achievement',
    subtitle: 'Sanya Malhotra · Science Quiz Winner',
    timeAgo: '1 week ago',
    date: '29-06-2025',
  },
] as const;
const Overview = () => {
  const [sections, setSections] = useState([
    {
      id: '0',
      title: 'Over View',
    },
    {
      id: '1',
      title: 'Recent Activities Notification',
    },
    {
      id: '2',
      title: 'Student Birth Date',
    },
    {
      id: '3',
      title: 'Enrollment Trends',
    },
    {
      id: '4',
      title: 'Class Wise Student Strength ',
    },
  ]);
  return (
    <Box>
      {/* <CustomizableView sections={sections} setSections={setSections} /> */}
      <Grid2 container spacing={2} sx={{ mb: 2 }}>
        <Grid2 xs={12}>
          <OverviewCard />
        </Grid2>

        <Grid2 xs={12} md={6}>
          <HouseDistribution />
        </Grid2>
        <Grid2 xs={12} md={6}>
          <StudentStrengthClassWise />
        </Grid2>
        <Grid2 xs={12} md={6}>
          <BirthdaySection
            todaysBirthdays={todayBirthdays}
            upcomingBirthdays={upcomingBirthdays}
            title="Student's Birthdays"
          />
        </Grid2>
        <Grid2 xs={12} md={6}>
          <RecentActivities activities={activities} />
        </Grid2>
      </Grid2>
      {/* <Grid2 container spacing={2} sx={{ mb: 2 }}>
        <Grid2 xs={12}>{sections.map((section: any) => dashBoardSections[section.id])}</Grid2>
      </Grid2> */}
    </Box>
  );
};

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
