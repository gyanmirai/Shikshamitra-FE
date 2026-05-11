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

export default function FinanceConcessionCategoryChart({
  title,
  subheader,
  chart,
  ...other
}: Props) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [theme.palette.info.main];

  const chartOptions = useChart({
    colors: chartColors,
    plotOptions: {
      bar: {
        columnWidth: '40%',
        borderRadius: 2,
      },
    },
    xaxis: {
      categories: chart.labels,
    },
    yaxis: {
      labels: {
        formatter: (value: number) => `₹${value.toLocaleString('en-IN')}`,
      },
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
      <CardHeader title={title} subheader={subheader} sx={{ p: 2 }} />

      <Box>
        <Chart dir="ltr" type="bar" series={chart.series} options={chartOptions} width="100%" />
      </Box>
    </Card>
  );
}
