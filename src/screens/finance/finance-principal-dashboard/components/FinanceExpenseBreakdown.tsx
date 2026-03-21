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
    series: number[];
    options?: ChartOptions;
  };
};

export default function FinanceExpenseBreakdown({ title, subheader, chart, ...other }: Props) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [
    theme.palette.primary.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.error.main,
  ];

  const chartOptions = useChart({
    colors: chartColors,
    labels: chart.labels,

    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
      style: {
        fontSize: '13px',
        fontWeight: 600,
      },
    },

    stroke: {
      colors: [theme.palette.background.paper],
    },

    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
    },

    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (value: number) => fCurrency(value),
        title: {
          formatter: (seriesName: string) => seriesName,
        },
      },
    },

    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: false, // keep false since % is on slices
          },
        },
      },
    },

    ...chart.options,
  });

  return (
    <Card {...other} sx={{ height: '100%' }}>
      <CardHeader title={title} subheader={subheader} sx={{ p: 2 }} />

      <Box>
        <Chart
          dir="ltr"
          type="pie"
          series={chart.series}
          options={chartOptions}
          width="100%"
          height={364}
        />
      </Box>
    </Card>
  );
}
