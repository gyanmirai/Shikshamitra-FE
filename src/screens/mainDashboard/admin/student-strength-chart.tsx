'use client';

import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';
import type { BoardMediumOption } from 'src/components/boardMediumDropdown';

import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import React, { useState, useCallback } from 'react';
import { Chart, useChart, ChartLegends } from 'src/components/chart';
import BoardMediumDropdown from 'src/components/boardMediumDropdown';

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
