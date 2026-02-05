import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import { Card } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    categories?: string[];
    series: { name: string; data: number[] }[];
    options?: ChartOptions;
  };
};

export function CommunicationTrendChart({ title, subheader, chart, ...other }: Props) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [
    theme.palette.primary.main,
    theme.palette.warning.main,
    theme.palette.info.main,
  ];

  const chartOptions = useChart({
    colors: chartColors,
    stroke: {
      width: 3,
      curve: 'smooth',
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 100],
      },
    },
    xaxis: {
      categories: chart.categories,
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value}`,
      },
    },
    ...chart.options,
  });

  return (
    <Card {...other} sx={{ p: 2, height: '100%' }}>
      <CardHeader title={title} subheader={subheader} sx={{ p: 0 }} />

      <Chart
        type="area"
        series={chart.series}
        options={chartOptions}
        height={320}
        loadingProps={{ sx: { p: 2.5 } }}
      />
    </Card>
  );
}
