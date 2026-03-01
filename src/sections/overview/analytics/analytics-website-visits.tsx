import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import { Box } from '@mui/material';
import CardHeader from '@mui/material/CardHeader';
import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';
import { useTheme, alpha as hexAlpha } from '@mui/material/styles';

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
  secondDropdownOptions?: { value: string; label: string }[];
  secondDropdownValue?: string;
  secondDropdownOnChange?: (value: string) => void;
  secondDropdownLabel?: string;
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
  secondDropdownLabel,
  secondDropdownOnChange,
  secondDropdownOptions = [],
  secondDropdownValue,
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
    stroke: { width: 2, colors: ['transparent'] },
    // Set up x-axis configuration with categories
    xaxis: { categories: chart.categories },
    // Enable legend display at the bottom
    legend: { show: true, position: 'bottom', horizontalAlign: 'center' },
    // Configure tooltip formatting
    tooltip: { y: { formatter: (value: number) => `${value}` } },
    // Spread additional custom options from chart.options
    ...chart.options,
  });
  const hasHeader = !!(
    title ||
    subheader ||
    (firstDropdownOptions.length > 0 && firstDropdownOnChange) ||
    (secondDropdownOptions.length > 0 && secondDropdownOnChange)
  );

  return (
    <Box>
      {hasHeader && (
        <CardHeader
          title={title}
          subheader={subheader}
          action={
            <Box display="flex" alignItems="center" gap={1}>
              {firstDropdownOptions.length > 0 && firstDropdownOnChange && (
                <CustomSelect
                  label={firstDropdownLabel}
                  options={firstDropdownOptions}
                  onChange={(e) => firstDropdownOnChange(e as string)}
                  value={firstDropdownValue ?? ''}
                  formControlProps={{ sx: { width: '100%', minWidth: '120px' } }}
                />
              )}
              {secondDropdownOptions.length > 0 && secondDropdownOnChange && (
                <CustomSelect
                  label={secondDropdownLabel}
                  options={secondDropdownOptions}
                  onChange={(e) => secondDropdownOnChange(e as string)}
                  value={secondDropdownValue ?? ''}
                  formControlProps={{ sx: { width: '100%', minWidth: '120px' } }}
                />
              )}
            </Box>
          }
          sx={{ p: 0 }}
        />
      )}

      <Chart
        type="bar"
        series={chart.series}
        options={chartOptions}
        height={364}
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ pl: 1, pr: 2.5 }}
      />
    </Box>
  );
}
