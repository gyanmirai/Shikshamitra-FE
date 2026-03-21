'use client';

import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';
import type { BoardMediumOption } from 'src/components/board-medium-dropdown';

import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import React, { useState, useCallback } from 'react';
import { Chart, useChart, ChartLegends } from 'src/components/chart';
import BoardMediumDropdown from 'src/components/board-medium-dropdown';

// ----------------------------------------------------------------------

type Series = {
  name: string;
  categories: string[];
  data: { name: string; data: number[] }[];
};

type Props = Omit<CardProps, 'title'> & {
  title?: React.ReactNode;
  subheader?: string;
  chart: {
    colors?: string[];
    series: Series[];
    options?: ChartOptions;
  };
};

export default function StudentStrengthChart({ title, subheader, chart, ...other }: Props) {
  const theme = useTheme();

  const [selectedBoardMedium, setSelectedBoardMedium] = useState<BoardMediumOption | undefined>(
    undefined
  );

  // Default to first series; can later be driven by selectedBoardMedium
  const currentSeries = chart.series[0];

  const chartColors = chart.colors ?? [
    theme.palette.primary.dark,
    theme.palette.warning.main,
    theme.palette.info.main,
  ];

  // Build a map from category index → per-series data for custom tooltip
  const categoryTotals: number[] =
    currentSeries?.categories.map((_, idx) =>
      currentSeries.data.reduce((sum, s) => sum + (s.data[idx] ?? 0), 0)
    ) ?? [];

  // Detect abnormal classes: total < 80% of the average class size
  const avgTotal =
    categoryTotals.length > 0
      ? categoryTotals.reduce((a, b) => a + b, 0) / categoryTotals.length
      : 0;
  const abnormalThreshold = avgTotal * 0.8;

  const chartOptions = useChart({
    stroke: { width: 2, colors: ['transparent'] },
    colors: chartColors,
    xaxis: { categories: currentSeries?.categories },
    plotOptions: {
      bar: {
        columnWidth: '40%',
        borderRadius: 2,
      },
    },
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
    },
    tooltip: {
      shared: true,
      intersect: false,
      custom: ({ dataPointIndex }: { dataPointIndex: number }) => {
        const category = currentSeries?.categories[dataPointIndex] ?? '';
        const total = categoryTotals[dataPointIndex] ?? 0;
        const isAbnormal = total < abnormalThreshold;
        const rows = currentSeries?.data
          .map(
            (s) =>
              `<tr>
                <td style="padding: 2px 6px; color: #637381;">${s.name}</td>
                <td style="padding: 2px 6px; font-weight: 600;">${s.data[dataPointIndex] ?? 0}</td>
              </tr>`
          )
          .join('');
        return `
          <div style="padding: 10px 13px; font-size: 13px; line-height: 1.6; min-width: 140px;">
            <div style="font-weight: 700; margin-bottom: 4px;">${category}</div>
            <table style="border-collapse: collapse; width: 100%;">
              ${rows}
              <tr style="border-top: 1px solid #E0E0E0; margin-top: 4px;">
                <td style="padding: 3px 6px; color: #637381; font-weight: 600;">Total</td>
                <td style="padding: 3px 6px; font-weight: 700;">${total}</td>
              </tr>
            </table>
            ${isAbnormal ? `<div style="margin-top: 6px; color: #FF5630; font-size: 11px; font-weight: 600;">⚠ ~${Math.round(((avgTotal - total) / avgTotal) * 100)}% below avg class size</div>` : ''}
          </div>`;
      },
    },
    ...chart.options,
  });

  const handleBoardMediumChange = useCallback((val: BoardMediumOption) => {
    setSelectedBoardMedium(val);
  }, []);

  return (
    <Card {...other} sx={{ height: '100%' }}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <BoardMediumDropdown value={selectedBoardMedium} onChange={handleBoardMediumChange} />
        }
        sx={{ mb: 1, p: 2 }}
      />

      <ChartLegends
        colors={chartOptions?.colors}
        labels={currentSeries?.data.map((item) => item.name)}
        sx={{ px: 3, gap: 3 }}
      />

      <Chart
        type="bar"
        series={currentSeries?.data}
        options={chartOptions}
        height={320}
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ pl: 1, pr: 2.5 }}
      />
    </Card>
  );
}
