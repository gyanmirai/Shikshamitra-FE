'use client';

import type { CardProps } from '@mui/material';
import type { ChartOptions } from 'src/components/chart';
import type { BoardMediumOption } from 'src/components/board-medium-dropdown';

import React from 'react';
import { useTheme } from '@mui/material/styles';
import { fCurrency } from 'src/utils/format-number';
import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';
import BoardMediumDropdown from 'src/components/board-medium-dropdown';

interface Props extends CardProps {
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
}

export default function FinanceOutstandingByClass({ title, subheader, chart, ...other }: Props) {
  const theme = useTheme();

  const [selectedBoardMedium, setSelectedBoardMedium] = React.useState<BoardMediumOption>();

  const chartColors = chart.colors ?? [theme.palette.error.main];

  const chartOptions = useChart({
    colors: chartColors,
    plotOptions: {
      bar: {
        barHeight: '30%',
        borderRadius: 2,
      },
    },
    xaxis: {
      categories: chart.labels,
    },
    yaxis: {
      labels: {
        formatter: (value: number) => fCurrency(value),
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
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        sx={{ p: 2 }}
        action={
          <BoardMediumDropdown
            value={selectedBoardMedium}
            onChange={(val) => {
              setSelectedBoardMedium(val);

              // 🔥 finance API refetch
              // val.boardId
              // val.mediumId
            }}
          />
        }
      />

      <Box sx={{ p: 3, pb: 1 }}>
        <Chart
          dir="ltr"
          type="bar"
          series={chart.series}
          options={chartOptions}
          width="100%"
          height={364}
        />
      </Box>
    </Card>
  );
}
