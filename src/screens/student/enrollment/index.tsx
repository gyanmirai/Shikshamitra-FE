'use client';

import type { CardProps } from '@mui/material';
import type { ChartOptions } from 'src/components/chart';

import React from 'react';

import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { Box, Card, alpha, Button, useTheme, CardHeader, CardContent } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const EnrollmentDashboardScreen = () => (
  <Box>
    <CustomBreadcrumbs
      heading="Student Enrollment Dashboard"
      links={[{ name: 'Student' }, { name: 'Student Enrollment Dashboard' }]}
      sx={{ px: 1, mb: 2 }}
    />
    <EnrollmentChart
      title="Enrollment Overview"
      subheader=""
      chart={{
        categories: ['Inquiries', 'Registrations', 'Admissions', 'Enrollments'],
        series: [{ name: 'Overview', data: [43, 33, 22, 37] }],
        options: {
          plotOptions: {
            bar: {
              columnWidth: '20%', // Adjust this value to control column width
            },
          },
        },
      }}
    />
    <Card sx={{ mt: 2, maxWidth: '50%', width: '100%' }}>
      <CardHeader title="Quick Actions" />
      <CardContent>
        <Grid2 container spacing={2}>
          <Grid2 xs={6}>
            <Button
              startIcon={<Iconify icon="mdi:user-add" />}
              variant="contained"
              sx={{ width: '100%' }}
            >
              Add New Inquiry
            </Button>
          </Grid2>
          <Grid2 xs={6}>
            <Button
              startIcon={<Iconify icon="mingcute:search-line" />}
              variant="contained"
              sx={{ width: '100%' }}
            >
              Track Enrollment
            </Button>
          </Grid2>
          <Grid2 xs={6}>
            <Button
              startIcon={<Iconify icon="simple-icons:googledocs" />}
              variant="contained"
              sx={{ width: '100%' }}
            >
              General Reports
            </Button>
          </Grid2>
          <Grid2 xs={6}>
            <Button
              startIcon={<Iconify icon="uis:calender" />}
              variant="contained"
              sx={{ width: '100%' }}
            >
              Schedule Exam
            </Button>
          </Grid2>
        </Grid2>
      </CardContent>
    </Card>
  </Box>
);

export default EnrollmentDashboardScreen;
type Props = CardProps & {
  title?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    categories?: string[];
    series: {
      name: string;
      data: number[];
    }[];
    options?: ChartOptions;
  };
};

const EnrollmentChart = ({ title, subheader, chart, ...other }: Props) => {
  const theme = useTheme();

  const chartColors = chart.colors ?? [
    alpha(theme.palette.warning.main, 0.8),
    alpha(theme.palette.primary.dark, 0.8),
  ];

  const chartOptions = useChart({
    colors: chartColors,
    stroke: {
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: chart.categories,
    },
    legend: {
      show: true,
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value}`,
      },
    },
    ...chart.options,
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Chart
        type="bar"
        series={chart.series}
        options={chartOptions}
        height={364}
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
};
