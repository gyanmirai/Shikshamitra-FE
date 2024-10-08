import type { CardProps } from '@mui/material';
import type { ChartOptions } from 'src/components/chart';

import React from 'react';

import Grid2 from '@mui/material/Unstable_Grid2';
import { Box, Card, alpha, useTheme, CardHeader, Typography } from '@mui/material';

import { Chart, useChart } from 'src/components/chart';

const TotalInquiries = () => (
  <Grid2 xs={6}>
    <Card sx={{ boxShadow: 'var(--shadows-2)', height: '100%', p: 2 }}>
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h6">Total Inquiries</Typography>
      </Box>
      <AnalyticsWebsiteVisits
        title=""
        //   subheader="(+43%) than last year"
        chart={{
          categories: ['Inquiry', 'Registration', 'Admission'],

          series: [
            {
              name: '',
              data: [1380, 1100, 990],
            },
          ],
          options: {
            plotOptions: {
              bar: {
                horizontal: true,
                isFunnel: true,
              },
            },
            dataLabels: {
              enabled: true,
              formatter(val, opt) {
                return `${opt.w.globals.labels[opt.dataPointIndex]}:  ${val}`;
              },
              dropShadow: {
                enabled: true,
              },
            },
          },
        }}
        sx={{ boxShadow: 'none', height: '100%' }}
      />
    </Card>
  </Grid2>
);

export default TotalInquiries;

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
        height="100%"
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
}
