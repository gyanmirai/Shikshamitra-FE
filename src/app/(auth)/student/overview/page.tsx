'use client';

import type { CardProps } from '@mui/material';
import type { ChartOptions } from 'src/components/chart';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { Add, Report, TrackChanges } from '@mui/icons-material';
import { Box, Card, Button, Divider, useTheme, CardHeader } from '@mui/material';

import { fNumber } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableView from 'src/components/customizable-view';
import { Chart, useChart, ChartLegends } from 'src/components/chart';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import OverviewCard from './overview';
import StudentBirthDate from './student-birthdate';
import EnrollmentsTrends from './enrollments-trends';
import RecentActivitiesNotification from './recent-activities-notification';
import StudentStrengthClassWise from './student-strength-class-wise';

const dashBoardSections = [
  <OverviewCard />,
  <RecentActivitiesNotification />,
  <StudentBirthDate />,
  <EnrollmentsTrends />,
  <StudentStrengthClassWise/>
];

const Overview = () => {
  const router = useRouter();
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
    }
  ]);
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Dashboard"
        links={[{ name: 'Student Record' }, { name: 'Dashboard' }]}
        sx={{ px: 1, mb: 2 }}
        action={
          <CustomTooltip
            placement="bottom"
            arrow
            title={
              <Card
                sx={{
                  display: 'flex',
                  p: 1,
                  boxShadow: 'none',
                }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Box display="flex" flexDirection="column" gap={2} flexWrap="wrap" pt={2}>
                    <Button
                      startIcon={<Add />}
                      variant="contained"
                      color="primary"
                      onClick={() => router.push('/student/enrollment/inquiry')}
                    >
                      Add New Inquiry
                    </Button>
                    <Button
                      startIcon={<TrackChanges />}
                      variant="contained"
                      color="warning"
                      onClick={() => router.push('/student/enrollment/enrollment-status-tracking')}
                    >
                      Track Enrollment Status
                    </Button>
                    <Button
                      startIcon={<Report />}
                      variant="contained"
                      color="error"
                      onClick={() => router.push('/student/reports')}
                    >
                      Generate Report
                    </Button>
                  </Box>
                </Box>
              </Card>
            }
          >
            <Button startIcon={<Iconify icon="mdi:interaction-double-tap" />}>Quick Action</Button>
          </CustomTooltip>
        }
      />
      <CustomizableView sections={sections} setSections={setSections} />
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
