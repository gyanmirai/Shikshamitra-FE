'use client';

import type { CardProps } from '@mui/material';
import type { ChartOptions } from 'src/components/chart';

import React, { useState, useCallback } from 'react';

import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { FiberManualRecord } from '@mui/icons-material';
import {
  Box,
  List,
  Card,
  alpha,
  Button,
  Divider,
  ListItem,
  useTheme,
  CardHeader,
  Typography,
  CardContent,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

import { fNumber } from 'src/utils/format-number';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Chart, useChart, ChartSelect, ChartLegends } from 'src/components/chart';

const EnrollmentDashboardScreen = () => (
  <Box>
    <CustomBreadcrumbs
      heading="Student Enrollment Dashboard"
      links={[{ name: 'Student' }, { name: 'Student Enrollment Dashboard' }]}
      sx={{ px: 1, mb: 2 }}
    />

    <Grid2 container spacing={2}>
      <Grid2 xs={6}>
        <Box
          sx={{
            boxShadow: 'var(--shadows-2)',
            height: '100%',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: 2,
          }}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <Card
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.21),
            }}
          >
            <Iconify
              icon="wpf:inspection"
              sx={{ height: '32px', width: '32px', color: 'primary.main' }}
            />

            <Box>
              <Typography variant="h6" color="primary.main">
                Inquiry
              </Typography>
              <Typography variant="h3" color="primary.main">
                700
              </Typography>
              <Typography variant="h5" color="primary.main">
                200 Female / 500 Male
              </Typography>
            </Box>
          </Card>
          <Card
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: (theme) => varAlpha(theme.palette.secondary.mainChannel, 0.21),
            }}
          >
            <Iconify
              icon="medical-icon:i-registration"
              sx={{ height: '32px', width: '32px', color: 'secondary.main' }}
            />

            <Box>
              <Typography variant="h6" color="secondary.main">
                Registration
              </Typography>
              <Typography variant="h3" color="secondary.main">
                700
              </Typography>
              <Typography variant="h5" color="secondary.main">
                200 Female / 500 Male
              </Typography>
            </Box>
          </Card>
          <Card
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: (theme) => varAlpha(theme.palette.warning.mainChannel, 0.21),
            }}
          >
            <Iconify
              icon="fluent-mdl2:open-enrollment"
              sx={{ height: '32px', width: '32px', color: 'warning.main' }}
            />

            <Box>
              <Typography variant="h6" color="warning.main">
                Admission
              </Typography>
              <Typography variant="h3" color="warning.main">
                700
              </Typography>
              <Typography variant="h5" color="warning.main">
                200 Female / 500 Male
              </Typography>
            </Box>
          </Card>
        </Box>
      </Grid2>
      <Grid2 xs={6} height="100%">
        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          sx={{
            boxShadow: 'var(--shadows-2)',
            height: '100%',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: 2,
          }}
        >
          <AnalyticsConversionRates
            title="Board Enrollment Status"
            //   subheader="(+43%) than last year"
            chart={{
              categories: ['enrolled', 'pending', 'declined'],
              series: [{ name: '', data: [44, 55, 41] }],
            }}
            sx={{ boxShadow: 'none' }}
          />

          <List>
            <ListItem>
              <ListItemIcon>
                <FiberManualRecord sx={{ fontSize: 8 }} />
              </ListItemIcon>
              <ListItemText primary="Total Enrolled Students - 500 Students Enrolled" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <FiberManualRecord sx={{ fontSize: 8 }} />
              </ListItemIcon>
              <ListItemText primary="Pending Enrollments - 50 Pending" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <FiberManualRecord sx={{ fontSize: 8 }} />
              </ListItemIcon>
              <ListItemText primary="Declined Applications - 20 Declined" />
            </ListItem>
          </List>
        </Box>
      </Grid2>
      <Grid2 xs={6}>
        <Box
          sx={{
            boxShadow: 'var(--shadows-2)',
            height: '100%',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: 2,
          }}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <AnalyticsCurrentVisits
            title="Organization Status"
            chart={{
              series: [
                { label: 'active', value: 100 },
                { label: 'inactive', value: 200 },
                { label: 'pending', value: 300 },
              ],
            }}
            sx={{ boxShadow: 'none' }}
          />
          <List>
            <ListItem>
              <ListItemIcon>
                <FiberManualRecord sx={{ fontSize: 8 }} />
              </ListItemIcon>
              <ListItemText primary="Total Active Organizations - 20 Active Organizations" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <FiberManualRecord sx={{ fontSize: 8 }} />
              </ListItemIcon>
              <ListItemText primary="Pending Approvals - 5 Pending Organizations" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <FiberManualRecord sx={{ fontSize: 8 }} />
              </ListItemIcon>
              <ListItemText primary="Inactive Organizations - 2 Inactive Organizations" />
            </ListItem>
          </List>
        </Box>
      </Grid2>
      <Grid2 xs={6}>
        <AnalyticsWebsiteVisits
          title="Total inquiries"
          //   subheader="(+43%) than last year"
          chart={{
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
            series: [
              { name: 'weekly', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
              { name: 'monthly', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
              { name: 'yearly', data: [59, 65, 47, 89, 40, 37, 50, 70, 24] },
            ],
          }}
          sx={{ boxShadow: 'var(--shadows-2)', height: '100%' }}
        />
      </Grid2>
      <Grid2 xs={6}>
        <AnalyticsCurrentVisits
          title="Show The Proportion"
          chart={{
            series: [
              { label: 'Inquiries', value: 100 },
              { label: 'Registration', value: 200 },
              { label: 'Admission', value: 300 },
            ],
          }}
          sx={{ boxShadow: 'var(--shadows-2)' }}
        />
      </Grid2>
      <Grid2 xs={6}>
        <EcommerceYearlySales
          title="Admission over time"
          subheader="(+43%) than last year"
          chart={{
            categories: [
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
            ],
            series: [
              {
                name: '2022',
                data: [
                  {
                    name: 'Admission',
                    data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
                  },
                ],
              },
              {
                name: '2023',
                data: [
                  {
                    name: 'Admission',
                    data: [51, 35, 41, 10, 91, 69, 62, 148, 91, 69, 62, 49],
                  },
                ],
              },
            ],
          }}
        />
      </Grid2>
      <Grid2 xs={6}>
        <Card sx={{}}>
          <CardHeader title="Quick Actions" />
          <CardContent>
            <Grid2 container spacing={2}>
              <Grid2 xs={6}>
                <Button
                  startIcon={<Iconify icon="mdi:user-add" />}
                  variant="contained"
                  sx={{ width: '100%' }}
                  color="primary"
                >
                  Add New Inquiry
                </Button>
              </Grid2>
              <Grid2 xs={6}>
                <Button
                  startIcon={<Iconify icon="mingcute:search-line" />}
                  variant="contained"
                  sx={{ width: '100%' }}
                  color="secondary"
                >
                  Track Enrollment
                </Button>
              </Grid2>
              <Grid2 xs={6}>
                <Button
                  startIcon={<Iconify icon="simple-icons:googledocs" />}
                  variant="contained"
                  sx={{ width: '100%' }}
                  color="warning"
                >
                  General Reports
                </Button>
              </Grid2>
              <Grid2 xs={6}>
                <Button
                  startIcon={<Iconify icon="uis:calender" />}
                  variant="contained"
                  sx={{ width: '100%' }}
                  color="error"
                >
                  Schedule Exam
                </Button>
              </Grid2>
            </Grid2>
          </CardContent>
        </Card>
      </Grid2>
    </Grid2>
  </Box>
);

export default EnrollmentDashboardScreen;

type Props = CardProps & {
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

export function AnalyticsCurrentVisits({ title, subheader, chart, ...other }: Props) {
  const theme = useTheme();

  const chartSeries = chart.series.map((item) => item.value);

  const chartColors = chart.colors ?? [
    theme.palette.primary.main,
    theme.palette.warning.light,
    theme.palette.info.dark,
    theme.palette.error.main,
  ];

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    colors: chartColors,
    labels: chart.series.map((item) => item.label),
    stroke: { width: 0 },
    dataLabels: { enabled: true, dropShadow: { enabled: false } },
    tooltip: {
      y: {
        formatter: (value: number) => fNumber(value),
        title: { formatter: (seriesName: string) => `${seriesName}` },
      },
    },
    plotOptions: { pie: { donut: { labels: { show: false } } } },
    ...chart.options,
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Chart
        type="pie"
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

type Props1 = CardProps & {
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

export function AnalyticsWebsiteVisits({ title, subheader, chart, ...other }: Props1) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [
    alpha(theme.palette.primary.dark, 0.8),
    alpha(theme.palette.warning.main, 0.8),
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
        formatter: (value: number) => `${value} visits`,
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
        height="100%"
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
}

type Props2 = CardProps & {
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

export function AnalyticsConversionRates({ title, subheader, chart, ...other }: Props2) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [
    theme.palette.primary.dark,
    alpha(theme.palette.primary.dark, 0.24),
  ];

  const chartOptions = useChart({
    colors: chartColors,
    stroke: { width: 2, colors: ['transparent'] },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number) => fNumber(value),
        title: { formatter: (seriesName: string) => `${seriesName}: ` },
      },
    },
    xaxis: { categories: chart.categories },
    dataLabels: {
      enabled: true,
      offsetX: -6,
      style: { fontSize: '10px', colors: ['#FFFFFF', theme.palette.text.primary] },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 2,
        barHeight: '48%',
        dataLabels: { position: 'top' },
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
        height={360}
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
}

type Props3 = CardProps & {
  title?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    categories?: string[];
    series: {
      name: string;
      data: {
        name: string;
        data: number[];
      }[];
    }[];
    options?: ChartOptions;
  };
};

export function EcommerceYearlySales({ title, subheader, chart, ...other }: Props3) {
  const theme = useTheme();

  const [selectedSeries, setSelectedSeries] = useState('2023');

  const chartColors = chart.colors ?? [theme.palette.primary.main, theme.palette.warning.main];

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: { categories: chart.categories },
    ...chart.options,
  });

  const handleChangeSeries = useCallback((newValue: string) => {
    setSelectedSeries(newValue);
  }, []);

  const currentSeries = chart.series.find((i) => i.name === selectedSeries);

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <ChartSelect
            options={chart.series.map((item) => item.name)}
            value={selectedSeries}
            onChange={handleChangeSeries}
          />
        }
        sx={{ mb: 3 }}
      />

      <ChartLegends
        colors={chartOptions?.colors}
        labels={chart.series[0].data.map((item) => item.name)}
        // values={[fShortenNumber(1234), fShortenNumber(6789)]}
        sx={{ px: 3, gap: 3 }}
      />

      <Chart
        type="area"
        series={currentSeries?.data}
        options={chartOptions}
        height={320}
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
}
