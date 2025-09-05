import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import { Box, CardHeader } from '@mui/material';
import { fNumber } from 'src/utils/format-number';
import { Chart, useChart, ChartLegends } from 'src/components/chart';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title?: string;
  icon?: string;
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
  // Get theme from MUI
  const theme = useTheme();

  // Extract values from chart series data
  const chartSeries = chart.series.map((item) => item.value);

  // Define chart colors - use provided colors or fallback to default theme colors
  const chartColors = chart.colors ?? [
    theme.palette.primary.main,
    theme.palette.warning.light,
    theme.palette.info.dark,
    theme.palette.error.main,
  ];

  // Configure chart options using the useChart hook
  const chartOptions = useChart({
    // Hide chart background elements
    chart: { sparkline: { enabled: true } },
    // Apply color scheme
    colors: chartColors,
    // Set labels from series data
    labels: chart.series.map((item) => item.label),
    // Remove stroke outline
    stroke: { width: 0 },
    // Configure data labels
    dataLabels: { enabled: true, dropShadow: { enabled: false } },
    // Customize tooltip formatting
    tooltip: {
      y: {
        formatter: (value: number) => fNumber(value),
        title: { formatter: (seriesName: string) => `${seriesName}` },
      },
    },
    // Configure pie chart specific options
    plotOptions: { pie: { donut: { labels: { show: false } } } },
    // Merge with any additional chart options provided
    ...chart.options,
  });
  return (
    <Card {...other}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, ml: 3 }}>
        {/* <Iconify icon="pepicons-pop:leave" width={32} height={32} sx={{ color: 'primary.main' }} /> */}
        <CardHeader title={title} subheader={subheader} mb={3} />
      </Box>

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
