import type { CardProps } from '@mui/material';
import type { ChartOptions } from 'src/components/chart';

import React from 'react';
import { useTheme } from '@mui/material/styles';
import { fCurrency } from 'src/utils/format-number';
import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';

type Props = CardProps & {
  title?: string;
  subheader?: string;
  chart: {
    labels: string[];
    colors?: string[];
    series: {
      name: string;
      type: string;
      fill?: string;
      data: number[];
      color?: string;
    }[];
    options?: ChartOptions;
  };
};

export default function FinanceAnnualSummaryChart({ title, subheader, chart, ...other }: Props) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [theme.palette.primary.main, theme.palette.warning.main];

  const chartOptions = useChart({
    colors: chartColors,
    stroke: {
      width: [2, 2],
      curve: 'smooth',
    },
    fill: {
      type: ['solid', 'solid'],
    },
    labels: chart.labels,
    xaxis: {
      type: 'category',
    },
    yaxis: {
      labels: {
        formatter: (value: number) => fCurrency(value),
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number) => {
          if (typeof value !== 'undefined') {
            return fCurrency(value);
          }
          return value;
        },
      },
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
    },
    ...chart.options,
  });

  return (
    <Card {...other} sx={{ height: '100%' }}>
      <CardHeader
        title={title}
        subheader={subheader}
        sx={{
          p: 2,
        }}
      />

      <Box>
        <Chart
          dir="ltr"
          type="line"
          series={chart.series}
          options={chartOptions}
          width="100%"
          // height={364}
        />
      </Box>
    </Card>
  );
}
