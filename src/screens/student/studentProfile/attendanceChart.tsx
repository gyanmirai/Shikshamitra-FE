import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { Iconify } from 'src/components/iconify';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import { fNumber } from 'src/utils/format-number';
import { Chart, useChart } from 'src/components/chart';
import { useTheme, alpha as hexAlpha } from '@mui/material/styles';

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
    theme.palette.primary.main,
    theme.palette.warning.light,
    theme.palette.error.main,
  ];

  const total = chartSeries.reduce((a, b) => a + b, 0);
  const presentVal = chart.series.find((s) => s.label === 'Present')?.value || 0;
  const percentage = total > 0 ? (presentVal / total) * 100 : 0;

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    colors: chartColors,
    labels: chart.series.map((item: any) => item.label),
    stroke: { width: 0 },
    legend: { show: false },
    tooltip: {
      y: {
        formatter: (value: number) => fNumber(value),
        title: { formatter: (seriesName: string) => `${seriesName}` },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: false,
          },
        },
      },
    },
    ...chart.options,
  });

  return (
    <Card {...other} sx={{ height: '100%', display: 'flex', flexDirection: 'column', ...other.sx }}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 2 }} />

      {/* Mini Insight Card */}
      <Stack
        direction="row"
        spacing={2}
        sx={{
          mx: 3,
          p: 2,
          borderRadius: 2,
          bgcolor: hexAlpha(theme.palette.info.lighter, 0.4),
          border: `1px dashed ${hexAlpha(theme.palette.info.main, 0.3)}`,
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Iconify icon="solar:graph-up-bold" width={16} sx={{ color: 'success.main' }} />
            +2% from last month
          </Typography>
        </Box>
      </Stack>

      <Box
        sx={{
          position: 'relative',
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 260,
        }}
      >
        <Chart type="donut" series={chartSeries} options={chartOptions} width={240} height={240} />

        {/* Center Text */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 800 }}>
            {Math.round(percentage)}%
          </Typography>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
            Present
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderStyle: 'dashed' }} />

      {/* Metric Breakdown */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 2,
          p: 3,
          textAlign: 'center',
        }}
      >
        {chart.series.map((item, index) => (
          <Stack key={item.label} spacing={0.5}>
            <Typography variant="h6" sx={{ color: chartColors[index] || 'text.primary' }}>
              {item.value}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {item.label}
            </Typography>
          </Stack>
        ))}
      </Box>
    </Card>
  );
}

export function YearlyAttendance({ title, subheader, chart, ...other }: any) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [
    hexAlpha(theme.palette.primary.dark, 0.8),
    hexAlpha(theme.palette.warning.main, 0.8),
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
