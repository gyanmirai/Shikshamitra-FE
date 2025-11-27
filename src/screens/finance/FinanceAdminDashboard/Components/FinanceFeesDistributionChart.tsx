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
      data: number[];
    }[];
    options?: ChartOptions;
  };
};

export default function FinanceFeesDistributionChart({ title, subheader, chart, ...other }: Props) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  const chartOptions = useChart({
    colors: chartColors,
    chart: {
      stacked: true,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '40%',
        borderRadius: 2,
      },
    },
    xaxis: {
      categories: chart.labels,
    },
    yaxis: {
      labels: {
        formatter: (value: number) => `₹${value.toLocaleString('en-IN')}`, // Full big numbers
      },
      forceNiceScale: true,
    },

    tooltip: {
      y: {
        formatter: (value: number) => fCurrency(value),
      },
    },
    ...chart.options,
  });

  return (
    <Card {...other} sx={{ height: '100%' }}>
      <CardHeader title={title} subheader={subheader} />

      <Box sx={{ p: 3, pb: 1 }}>
        <Chart
          dir="ltr"
          type="bar"
          series={chart.series}
          options={chartOptions}
          width="100%"
          height={364}
        />
      </Box>
    </Card>
  );
}
