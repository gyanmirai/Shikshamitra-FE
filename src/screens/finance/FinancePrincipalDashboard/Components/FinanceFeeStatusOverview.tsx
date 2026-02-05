import type { CardProps } from '@mui/material';
import type { ChartOptions } from 'src/components/chart';
import type { BoardMediumOption } from 'src/components/boardMediumDropdown';

import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';
import BoardMediumDropdown from 'src/components/boardMediumDropdown';

type Props = CardProps & {
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
};

export default function FinanceFeeStatusOverview({ title, subheader, chart, ...other }: Props) {
  const theme = useTheme();
  const [selectedBoardMedium, setSelectedBoardMedium] = React.useState<BoardMediumOption>();
  const chartColors = chart.colors ?? [
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  const chartOptions = useChart({
    colors: chartColors,
    chart: {
      stacked: true,
    },
    plotOptions: {
      bar: {
        columnWidth: '40%',
      },
    },
    xaxis: {
      categories: chart.labels,
    },
    yaxis: {
      labels: {
        formatter: (value: number) => value.toFixed(0),
      },
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value} Students`,
      },
    },
    ...chart.options,
  });

  return (
    <Card {...other} sx={{ height: '100%' }}>
      <CardHeader
        title={title}
        subheader={subheader}
        sx={{ p: 2 }}
        action={
          <BoardMediumDropdown
            value={selectedBoardMedium}
            onChange={(val) => {
              setSelectedBoardMedium(val);
            }}
          />
        }
      />

      <Box>
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
