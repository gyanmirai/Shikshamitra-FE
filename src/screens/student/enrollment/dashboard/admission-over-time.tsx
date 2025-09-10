import type { CardProps } from '@mui/material';
import type { ChartOptions } from 'src/components/chart';

import { useTheme } from '@mui/material/styles';
import React, { useState, useCallback } from 'react';
import { Card, Grid, CardHeader, Typography } from '@mui/material';
import { Chart, useChart, ChartSelect, ChartLegends } from 'src/components/chart';

const AdmissionOverTime = () => {
  const theme = useTheme();
  const chartOptions = useChart({
    colors: [theme.palette.warning.main, theme.palette.success.main, theme.palette.info.main],
    xaxis: {
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
    },
  });
  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <Card sx={{ p: 3, boxShadow: 'var(--shadows-4)', height: '100%' }}>
        <Typography variant="h6">Enrollment Trend</Typography>
        <Chart
          type="area"
          series={[
            { name: 'Admission', data: [51, 35, 41, 10, 91, 69, 62, 148, 91, 69, 62, 49] },
            { name: 'Inquiry', data: [60, 47, 55, 59, 49, 69, 69, 91, 18, 35, 51, 50] },
            { name: 'Registration', data: [40, 67, 58, 59, 49, 77, 88, 99, 98, 36, 55, 51] },
          ]}
          options={chartOptions}
          height={320}
          loadingProps={{ sx: { p: 2.5 } }}
          sx={{ py: 2.5, pl: 1, pr: 2.5 }}
        />
      </Card>
    </Grid>
  );
};

export default AdmissionOverTime;

type Props3 = CardProps & {
  title?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    categories?: string[];
    series: { name: string; data: { name: string; data: number[] }[] }[];
    options?: ChartOptions;
  };
};

export function EcommerceYearlySales({ title, subheader, chart, ...other }: Props3) {
  const theme = useTheme();

  const [selectedSeries, setSelectedSeries] = useState('2023');

  const chartColors = chart.colors ?? [theme.palette.primary.main, theme.palette.warning.main];

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: { categories: chart.categories },
    ...chart.options,
  });

  const handleChangeSeries = useCallback((newValue: string) => {
    setSelectedSeries(newValue);
  }, []);

  const currentSeries = chart.series.find((i) => i.name === selectedSeries);

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
        // values={[fShortenNumber(1234), fShortenNumber(6789)]}
        sx={{ px: 3, gap: 3 }}
      />

      <Chart
        type="area"
        series={currentSeries?.data}
        options={chartOptions}
        height={320}
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
}
