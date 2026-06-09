import type { HrReportChartPreview as HrReportChartPreviewData } from 'src/redux/hr/hrReportsApi';

import { useMemo } from 'react';
import { Chart, useChart } from 'src/components/chart';
import { Box, Stack, Typography } from '@mui/material';

type HrReportChartPreviewProps = {
  chart?: HrReportChartPreviewData;
};

export function HrReportChartPreview({ chart }: HrReportChartPreviewProps) {
  const labels = useMemo(() => chart?.points.map((point) => point.label) ?? [], [chart?.points]);
  const values = useMemo(() => chart?.points.map((point) => point.value) ?? [], [chart?.points]);

  const options = useChart({
    labels,
    xaxis: { categories: labels },
    legend: { position: 'bottom' },
    tooltip: { y: { formatter: (value: number) => `${value}` } },
  });

  if (!chart || chart.type === 'none') {
    return null;
  }

  if (chart.type === 'kpi') {
    return (
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {chart.title}
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
          {chart.points.map((point) => (
            <Box key={point.label} sx={{ minWidth: 160 }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {point.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {point.label}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    );
  }

  const chartType = chart.type === 'donut' ? 'donut' : chart.type === 'line' ? 'line' : 'bar';
  const series =
    chartType === 'donut'
      ? values
      : [
          {
            name: chart.title || 'Rows',
            data: values,
          },
        ];

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        {chart.title}
      </Typography>
      <Chart type={chartType} series={series} options={options} height={280} />
    </Box>
  );
}
