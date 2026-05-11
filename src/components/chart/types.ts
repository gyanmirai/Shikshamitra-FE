import type { Theme, SxProps } from '@mui/material/styles';

// ----------------------------------------------------------------------
// Backwards-compatible types. Previously these aliased react-apexcharts
// `Props`, but the chart engine has been migrated to Highcharts. We keep
// the same names and shapes so existing dashboard code continues to type
// check unchanged. Internally the legacy `Chart` component translates
// these ApexCharts-style options into Highcharts options at render time.
// ----------------------------------------------------------------------

export type ChartType =
  | 'line'
  | 'area'
  | 'bar'
  | 'pie'
  | 'donut'
  | 'radialBar'
  | 'scatter'
  | 'bubble'
  | 'heatmap'
  | 'candlestick'
  | 'boxPlot'
  | 'radar'
  | 'polarArea'
  | 'rangeBar'
  | 'rangeArea'
  | 'treemap';

export type ChartSeries = any;
export type ChartOptions = Record<string, any>;

export type ChartProps = {
  type: ChartType;
  series: ChartSeries;
  options?: ChartOptions;
  loadingProps?: ChartLoadingProps;
};

export type ChartBaseProps = {
  type?: ChartType;
  series?: ChartSeries;
  options?: ChartOptions;
};

export type ChartLoadingProps = {
  disabled?: boolean;
  sx?: SxProps<Theme>;
};
