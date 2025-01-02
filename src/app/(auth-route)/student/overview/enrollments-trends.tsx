import type { CardProps } from '@mui/material';
import type { ChartOptions } from 'src/components/chart';

import React, { useState, useCallback } from 'react';

import Grid2 from '@mui/material/Unstable_Grid2';
import { Card, useTheme, CardHeader } from '@mui/material';

import { fCurrency } from 'src/utils/format-number';

import { Chart, useChart, ChartSelect } from 'src/components/chart';

const EnrollmentsTrends = () => (
  <Grid2 xs={12} md={6}>
    <AttendanceGraph
      title="Enrollment Trends"
      // subheader="Statistics on balance over time"
      selectedSeriesName="Last 6 Months"
      chart={{
        series: [
          {
            name: 'Last 12 Months',
            categories: [
              'Jan',
              'Feb',
              'Mar',
              'Apr',
              'May',
              'Jun',
              'Jul',
              'Aug',
              'Sep',
              'Oct',
              'Nov',
              'Dec',
            ],
            data: [
              { name: '', data: [24, 41, 35, 151, 49, 151, 49, 151, 49, 151, 49, 151] },
              // { name: 'Savings', data: [24, 56, 77, 88, 99] },
              // { name: 'Investment', data: [40, 34, 77, 88, 99] },
            ],
          },
          {
            name: 'Last 6 Months',
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
            data: [
              { name: '', data: [83, 112, 119, 88, 103, 112] },
              // { name: 'Savings', data: [46, 46, 43, 58, 40, 59, 54, 42, 51] },
              // { name: 'Investment', data: [25, 40, 38, 35, 20, 32, 27, 40, 21] },
            ],
          },
        ],
      }}
      sx={{ height: '100%' }}
    />
  </Grid2>
);

export default EnrollmentsTrends;

type Props3 = CardProps & {
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
  selectedSeriesName?: string;
};

export function AttendanceGraph({ title, subheader, chart, selectedSeriesName, ...other }: Props3) {
  const theme = useTheme();

  const [selectedSeries, setSelectedSeries] = useState(selectedSeriesName || 'Yearly');

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

      {/* <ChartLegends
          colors={chartOptions?.colors}
          labels={chart.series[0].data.map((item) => item.name)}
          sublabels={[`+${fPercent(43)}`, `+${fPercent(3)}`, `+${fPercent(8)}`]}
          values={[fCurrency(6789), fCurrency(1234), fCurrency(1012)]}
          sx={{ px: 3, gap: 3 }}
        /> */}

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
