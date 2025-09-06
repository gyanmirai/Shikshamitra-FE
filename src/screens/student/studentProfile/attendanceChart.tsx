import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import { fNumber } from 'src/utils/format-number';
import { useTheme, alpha as hexAlpha } from '@mui/material/styles';
import { Chart, useChart, ChartLegends } from 'src/components/chart';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title?: any;
  subheader?: string;
  chart: { colors?: string[]; series: { label: string; value: number }[]; options?: ChartOptions };
};

export function AttendanceChart({ title, subheader, chart, ...other }: Props) {
  const theme = useTheme();

  const chartSeries = chart.series.map((item: any) => item.value);

  const chartColors = chart.colors ?? [
    theme.vars.palette.primary.main,
    theme.vars.palette.warning.light,
    theme.vars.palette.info.dark,
    theme.vars.palette.error.main,
  ];

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    colors: chartColors,
    labels: chart.series.map((item: any) => item.label),
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

export function YearlyAttendance({ title, subheader, chart, ...other }: any) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [
    hexAlpha(theme.vars.palette.primary.dark, 0.8),
    hexAlpha(theme.vars.palette.warning.main, 0.8),
  ];

  const chartOptions = useChart({
    colors: chartColors,
    stroke: { width: 2, colors: ['transparent'] },
    xaxis: { categories: chart.categories },
    legend: { show: true },
    tooltip: { y: { formatter: (value: number) => `${value}` } },
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
        width="100%"
      />
    </Card>
  );
}
