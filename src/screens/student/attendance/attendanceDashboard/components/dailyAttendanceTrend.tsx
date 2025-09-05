import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import { fCurrency } from 'src/utils/format-number';
import React, { useState, useCallback } from 'react';
import { Chart, useChart, ChartSelect, ChartLegends } from 'src/components/chart';

const DailyAttendanceTrend = () => (
  <BankingBalanceStatistics
    title="Daily Attendance Trend"
    chart={{
      series: [
        {
          name: 'Last Week',
          categories: ['21/06', '22/06', '23/06', '24/06', '25/06', '26/06', '27/06'],
          data: [
            { name: 'Present', data: [60, 30, 40, 60, 50, 60, 40] },
            { name: 'Absent', data: [25, 20, 30, 25, 20, 30, 20] },
          ],
        },
        {
          name: 'Last 15 Days',
          categories: [
            '13/06',
            '14/06',
            '15/06',
            '16/06',
            '17/06',
            '18/06',
            '19/06',
            '20/06',
            '21/06',
            '22/06',
            '23/06',
            '24/06',
            '25/06',
            '26/06',
            '27/06',
          ],
          data: [
            {
              name: 'Present',
              data: [50, 35, 45, 55, 65, 45, 50, 60, 55, 48, 52, 56, 53, 57, 51],
            },
            {
              name: 'Absent',
              data: [30, 25, 28, 22, 18, 25, 22, 20, 23, 30, 27, 26, 24, 22, 28],
            },
          ],
        },
      ],
    }}
    sx={{ height: '100%' }}
  />
);

export default DailyAttendanceTrend;

type Props = CardProps & {
  title?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    series: {
      name: string;
      categories: string[];
      data: {
        name: string;
        data: number[];
      }[];
    }[];
    options?: ChartOptions;
  };
};

export function BankingBalanceStatistics({ title, subheader, chart, ...other }: Props) {
  const theme = useTheme();

  const [selectedSeries, setSelectedSeries] = useState('Last Week');

  const currentSeries = chart.series.find((i) => i.name === selectedSeries);

  const chartColors = chart.colors ?? [
    theme.palette.primary.dark,
    theme.palette.warning.main,
    theme.palette.info.main,
  ];

  const chartOptions = useChart({
    stroke: { width: 2, colors: ['transparent'] },
    colors: chartColors,
    xaxis: { categories: currentSeries?.categories },
    tooltip: { y: { formatter: (value: number) => fCurrency(value) } },
    ...chart.options,
  });

  const handleChangeSeries = useCallback((newValue: string) => {
    setSelectedSeries(newValue);
  }, []);

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <ChartSelect
            options={chart.series.map((item) => item.name)}
            value={selectedSeries}
            onChange={handleChangeSeries}
          />
        }
        sx={{ mb: 3 }}
      />

      <ChartLegends
        colors={chartOptions?.colors}
        labels={chart.series[0].data.map((item) => item.name)}
        sublabels={[`+${43}`, `+${3}`, `+${8}`]}
        // values={[fCurrency(6789), fCurrency(1234), fCurrency(1012)]}
        sx={{ px: 3, gap: 3 }}
      />

      <Chart
        type="bar"
        series={currentSeries?.data}
        options={chartOptions}
        height={320}
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
}
