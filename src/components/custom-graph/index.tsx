'use client';

import type { ApexOptions } from 'apexcharts';

import React from 'react';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface CustomChartProps {
  options: ApexOptions;
  series: any;
  type:
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
  <Chart options={options} series={series} type={type} width={width} height={height} {...props} />
);

export default CustomChart;
