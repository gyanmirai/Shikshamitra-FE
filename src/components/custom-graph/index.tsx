'use client';

import type { ChartType, ChartOptions } from 'src/components/chart';

import React from 'react';
import { Chart } from 'src/components/chart';

// Backwards-compatible custom chart component. Internally uses the
// migrated Highcharts <Chart /> wrapper which accepts ApexCharts-shaped
// options and translates them on the fly.

interface CustomChartProps {
  options: ChartOptions;
  series: any;
  type: ChartType;
  width?: string | number;
  height?: string | number;
}

const CustomChart: React.FC<CustomChartProps> = ({
  options,
  series,
  type,
  width = '100%',
  height = 350,
  ...props
}) => (
  <Chart
    type={type}
    series={series}
    options={options}
    width={width}
    height={typeof height === 'number' ? height : 350}
    {...props}
  />
);

export default CustomChart;
