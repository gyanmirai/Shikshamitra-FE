import type { CardProps } from '@mui/material';
import type { ChartOptions } from 'src/components/chart';

import React from 'react';

import Grid2 from '@mui/material/Unstable_Grid2';
import { FiberManualRecord } from '@mui/icons-material';
import {
  Box,
  Card,
  List,
  alpha,
  useTheme,
  ListItem,
  CardHeader,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

import { fNumber } from 'src/utils/format-number';

import { Chart, useChart } from 'src/components/chart';

const BoardEnrollmentStatus = () => (
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
);

export default BoardEnrollmentStatus;

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
        barHeight: '30%',
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
