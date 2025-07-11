import type { CardProps } from '@mui/material';
import type { ChartOptions } from 'src/components/chart';

import React from 'react';

import { Card, alpha, useTheme, CardHeader } from '@mui/material';

import { fNumber } from 'src/utils/format-number';

import { Chart, useChart } from 'src/components/chart';

import { AnalyticsCurrentVisits } from './organization-status';

const BoardEnrollmentStatus = () => {
  const theme = useTheme();
  return (
    <Card sx={{ height: '100%' }}>
      <AnalyticsCurrentVisits
        title="Entrance Exam Status"
        chart={{
          series: [
            { label: 'Passed (35%)', value: 35 },
            { label: 'Failed (25%)', value: 25 },
            { label: 'Awaiting Result (15%)', value: 15 },
          ],
          colors: [
            theme.palette.success.main,
            theme.palette.warning.main,
            theme.palette.error.main,
          ],
        }}
        sx={{ boxShadow: 'none' }}
      />
    </Card>
  );
};

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
