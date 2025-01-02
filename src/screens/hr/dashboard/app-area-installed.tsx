import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import { useState, useCallback } from 'react';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { useTheme, alpha as hexAlpha } from '@mui/material/styles';

import { fNumber, fShortenNumber } from 'src/utils/format-number';

import { Chart, useChart, ChartSelect, ChartLegends } from 'src/components/chart';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    categories: string[];
    series: {
      name: string;
      data: {
        name: string;
        data: number[];
      }[];
    }[];
    options?: ChartOptions;
  };
  selectSeries?: string;
  height?: number;
  isShowChartLegendValue?: boolean;
  sendToParent?: (data: any) => void;
};

export function AppAreaInstalled({
  sendToParent,
  title,
  subheader,
  chart,
  selectSeries,
  height = 320,
  isShowChartLegendValue = true,
  ...other
}: Props) {
  const theme = useTheme();

  const [selectedSeries, setSelectedSeries] = useState(selectSeries || '2023');

  const chartColors = chart.colors ?? [
    theme.palette.primary.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    hexAlpha(theme.palette.grey[500], 0.48),
  ];

  const chartOptions = useChart({
    chart: { stacked: true },
    colors: chartColors,
    stroke: { width: 0 },
    xaxis: { categories: chart.categories },
    tooltip: { y: { formatter: (value: number) => fNumber(value) } },
    plotOptions: { bar: { columnWidth: '40%' } },
    ...chart.options,
  });

  const handleChangeSeries = useCallback(
    (newValue: string) => {
      setSelectedSeries(newValue);
      if (sendToParent) {
        sendToParent(newValue);
      }
    },
    [sendToParent]
  );

  const currentSeries = chart.series.find((i) => i.name === selectedSeries);

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          selectSeries ? (
            <ChartSelect
              options={chart.series.map((item) => item.name)}
              value={selectedSeries}
              onChange={handleChangeSeries}
            />
          ) : undefined
        }
        sx={{ mb: 3 }}
      />
      {isShowChartLegendValue ? (
        <ChartLegends
          colors={chartOptions?.colors}
          labels={chart.series[0].data.map((item) => item.name)}
          values={[fShortenNumber(1234), fShortenNumber(6789), fShortenNumber(1012)]}
          sx={{
            px: 3,
            gap: 3,
          }}
        />
      ) : (
        <ChartLegends
          colors={chartOptions?.colors}
          labels={chart.series[0].data.map((item) => item.name)}
          sx={{
            px: 3,
            gap: 3,
          }}
        />
      )}

      <Chart
        key={selectedSeries}
        type="bar"
        series={currentSeries?.data}
        options={chartOptions}
        height={height}
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
}
