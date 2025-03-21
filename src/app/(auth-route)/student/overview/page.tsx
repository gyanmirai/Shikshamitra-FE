'use client';

import type { CardProps } from '@mui/material';
import type { ChartOptions } from 'src/components/chart';

import React, { useState } from 'react';

import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { Box, Card, Divider, useTheme, CardHeader } from '@mui/material';

import { fNumber } from 'src/utils/format-number';

import { Chart, useChart, ChartLegends } from 'src/components/chart';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import DashBoardQuickAction from 'src/components/dashboard-quick-action';

import OverviewCard from './overview';
import StudentBirthDate from './student-birthdate';
import EnrollmentsTrends from './enrollments-trends';
import StudentStrengthClassWise from './student-strength-class-wise';
import RecentActivitiesNotification from './recent-activities-notification';

const dashBoardSections = [
  <OverviewCard />,
  <RecentActivitiesNotification />,
  <StudentBirthDate />,
  <EnrollmentsTrends />,
  <StudentStrengthClassWise />,
];

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
      <CustomBreadcrumbs
        heading="Dashboard"
        links={[{ name: 'Student Record' }, { name: 'Dashboard' }]}
        sx={{ px: 1, mb: 2 }}
        action={
          <DashBoardQuickAction
            actions={[
              {
                icon: 'mdi:user-add',
                label: 'Add New Inquiry',
                href: '/student/enrollment/inquiry',
                color: 'primary',
              },
              {
                icon: 'mingcute:search-line',
                label: 'Track Enrollment',
                href: '/student/enrollment/enrollment-status-tracking',
                color: 'warning',
              },
              {
                icon: 'simple-icons:googledocs',
                label: 'General Reports',
                href: '/student/reports',
                color: 'secondary',
              },
            ]}
          />
        }
      />
      {/* <CustomizableView sections={sections} setSections={setSections} /> */}
      {/* <Grid2 container spacing={3}>
        <Grid2 xs={12}>
          <OverviewCard />
        </Grid2>
        <Grid2 xs={12} md={6}>
          <RecentActivitiesNotification />
        </Grid2>
        <Grid2 xs={12} md={6} lg={4}>
          <StudentBirthDate />
        </Grid2>
        <Grid2 xs={12} md={6} lg={4}>
          <EnrollmentsTrends />
        </Grid2>
        <Grid2 xs={12} md={6} lg={4}>
          <StudentStrengthClassWise />
        </Grid2>
      </Grid2> */}
      <Grid2 container spacing={3}>
        {sections.map((section: any) => dashBoardSections[section.id])}
      </Grid2>
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
