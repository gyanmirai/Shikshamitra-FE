import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import { Box } from '@mui/material';
import CardHeader from '@mui/material/CardHeader';
import { useTheme, alpha as hexAlpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title?: string;
  icon?: string;
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
  icon,
  subheader,
  chart,
  firstDropdownLabel,
  firstDropdownOnChange,
  firstDropdownOptions = [],
  firstDropdownValue,
  ...other
}: Props) {
  // Get the current theme from Material-UI
  const theme = useTheme();

  // Define chart colors with fallback to default color palette using alpha transparency
  const chartColors = chart.colors ?? [
    hexAlpha(theme.palette.primary.dark, 0.8),
    hexAlpha(theme.palette.warning.main, 0.8),
    hexAlpha(theme.palette.error.main, 0.8),
  ];

  // Configure chart options by merging default settings with custom options
  const chartOptions = useChart({
    // Set the color scheme for the chart
    colors: chartColors,
    // Configure stroke settings for chart elements
    stroke: {
      width: 2,
      colors: ['transparent'],
    },
    // Set up x-axis configuration with categories
    xaxis: {
      categories: chart.categories,
    },
    // Enable legend display
    legend: {
      show: true,
    },
    // Configure tooltip formatting
    tooltip: {
      y: {
        formatter: (value: number) => `${value}`,
      },
    },
    // Spread additional custom options from chart.options
    ...chart.options,
  });
  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" pr="20px" pt="10px">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, ml: 3 }}>
          <Iconify icon={icon || ''} width={32} height={32} sx={{ color: 'primary.main' }} />
          <CardHeader title={title} subheader={subheader} mb={3} />
        </Box>
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
