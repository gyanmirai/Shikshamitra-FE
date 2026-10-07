'use client';

import { useTheme } from '@mui/material/styles';
import { Chart, useChart } from 'src/components/chart';
import { Box, Paper, Stack, Typography } from '@mui/material';

import type { AcademicInsightChart as AcademicInsightChartConfig } from './types';

type Props = {
  config: AcademicInsightChartConfig;
};

export function AcademicInsightChart({ config }: Props) {
  const theme = useTheme();
  const suffix = config.valueSuffix ?? '';
  const chartHeight = Math.min(500, Math.max(300, config.categories.length * 58 + 130));
  const maxValue = config.max ?? Math.max(0, ...config.values);
  const tickAmount = Math.min(5, Math.max(2, Math.ceil(maxValue) + 1));
  const options = useChart({
    chart: { toolbar: { show: false }, height: chartHeight },
    colors: config.monochrome
      ? [theme.palette.primary.main]
      : [
          theme.palette.primary.main,
          theme.palette.info.main,
          theme.palette.warning.main,
          theme.palette.success.main,
        ],
    xaxis: { categories: config.categories },
    yaxis: {
      min: 0,
      max: config.max,
      tickAmount,
      labels: { formatter: (value: number) => `${Math.round(value)}${suffix}` },
    },
    dataLabels: {
      enabled: true,
      formatter: (value: number) => `${Math.round(value)}${suffix}`,
    },
    fill: { opacity: 0.78 },
    legend: { show: false },
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
        columnWidth: '58%',
        borderRadius: 5,
      },
    },
    tooltip: { y: { formatter: (value: number) => `${value}${suffix}` } },
  });

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="subtitle1">{config.title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, mb: 1 }}>
        {config.description}
      </Typography>
      <Box role="img" aria-label={`${config.title}. ${config.description}`}>
        {config.emptyMessage && config.values.every((value) => value === 0) ? (
          <Box sx={{ minHeight: 160, display: 'grid', placeItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {config.emptyMessage}
            </Typography>
          </Box>
        ) : (
          <Chart
            type="bar"
            height={chartHeight}
            series={[{ name: config.seriesName, data: config.values }]}
            options={options}
          />
        )}
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          columnGap: 0.75,
          rowGap: 0.25,
          mt: 1.5,
          pt: 1.25,
          pb: 0.5,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        {(
          config.summary ??
          config.categories.map((label, index) => ({ label, value: config.values[index] }))
        ).map((item, index, items) => (
          <Stack key={`${item.label}-${index}`} direction="row" alignItems="center" spacing={0.75}>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
              {item.label}:{' '}
              <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
                {item.value}
                {suffix}
              </Box>
            </Typography>
            {index < items.length - 1 && (
              <Typography
                component="span"
                variant="caption"
                color="text.disabled"
                aria-hidden="true"
              >
                |
              </Typography>
            )}
          </Stack>
        ))}
      </Box>
    </Paper>
  );
}
