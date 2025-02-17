import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import { Box } from '@mui/material';
import CardHeader from '@mui/material/CardHeader';
import { useTheme, alpha as hexAlpha } from '@mui/material/styles';

import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    categories?: string[];
    series: ApexAxisChartSeries | ApexNonAxisChartSeries | undefined;
    options?: ChartOptions;
  };
  firstDropdownOptions?: { value: string; label: string }[];
  firstDropdownValue?: string;
  firstDropdownOnChange?: (value: string) => void;
  firstDropdownLabel?: string;
};

export function AnalyticsWebsiteVisits({
  title,
  subheader,
  chart,
  firstDropdownLabel,
  firstDropdownOnChange,
  firstDropdownOptions = [],
  firstDropdownValue,
  ...other
}: Props) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [
    hexAlpha(theme.palette.primary.dark, 0.8),
    hexAlpha(theme.palette.warning.main, 0.8),
    hexAlpha(theme.palette.error.main, 0.8),
  ];

  const chartOptions = useChart({
    colors: chartColors,
    stroke: {
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: chart.categories,
    },
    legend: {
      show: true,
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value}`,
      },
    },
    ...chart.options,
  });

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" pr="20px" pt="10px">
        <CardHeader title={title} subheader={subheader} />
        {firstDropdownOptions.length > 0 && firstDropdownOnChange && (
          <CustomSelect
            label={firstDropdownLabel}
            options={firstDropdownOptions}
            onChange={(e) => firstDropdownOnChange(e as string)}
            value={firstDropdownValue ?? ''}
            formControlProps={{
              sx: { width: '100%', maxWidth: '200px' },
            }}
          />
        )}
      </Box>

      <Chart
        type="bar"
        series={chart.series}
        options={chartOptions}
        height={364}
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Box>
  );
}
