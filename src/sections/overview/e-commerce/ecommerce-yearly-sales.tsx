import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import { useState, useCallback } from 'react';

import { Box } from '@mui/material';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';

import { fShortenNumber } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart, ChartSelect, ChartLegends } from 'src/components/chart';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title?: string;
  icon?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    categories?: string[];
    series: {
      name: string;
      data: {
        name: string;
        data: number[];
      }[];
    }[];
    options?: ChartOptions;
  };
  isShowChartLegend?: boolean;
};

export function EcommerceYearlySales({
  title,
  subheader,
  chart,
  isShowChartLegend = true,
  ...other
}: Props) {
  // Get the current theme
  const theme = useTheme();

  // State to track the currently selected data series
  const [selectedSeries, setSelectedSeries] = useState(chart.series[0].name);

  // Define chart colors - use provided colors or fallback to theme defaults
  const chartColors = chart.colors ?? [theme.palette.primary.main, theme.palette.warning.main];

  // Configure chart options with colors, categories and any additional options
  const chartOptions = useChart({
    colors: chartColors,
    xaxis: { categories: chart.categories },
    ...chart.options,
  });

  // Handler for series selection change
  const handleChangeSeries = useCallback((newValue: string) => {
    setSelectedSeries(newValue);
  }, []);

  // Find the currently selected series data
  const currentSeries = chart.series.find((i) => i.name === selectedSeries);
  return (
    <Card {...other}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, ml: 3 }}>
        <Iconify icon="mdi:trending-up" width={32} height={32} sx={{ color: 'primary.main' }} />
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
      </Box>

      {isShowChartLegend ? (
        <ChartLegends
          colors={chartOptions?.colors}
          labels={chart.series[0].data.map((item) => item.name)}
          values={[fShortenNumber(1234), fShortenNumber(6789)]}
          sx={{ px: 3, gap: 3 }}
        />
      ) : (
        <ChartLegends
          colors={chartOptions?.colors}
          labels={chart.series[0].data.map((item) => item.name)}
          sx={{ px: 3, gap: 3 }}
        />
      )}

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
