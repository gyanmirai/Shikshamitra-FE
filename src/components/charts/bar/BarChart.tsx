'use client';

import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';

import { BaseChart } from '../base/BaseChart';
import { getBarChartOptions } from '../base/optionGenerators';

import type { BaseChartProps } from '../base/BaseChart';
import type { SeriesPoint, CommonGenInput } from '../base/optionGenerators';

type Props = Omit<BaseChartProps, 'options'> &
  Omit<CommonGenInput, 'theme'> & {
    series: Array<{ name: string; data: SeriesPoint[]; color?: string }>;
    horizontal?: boolean;
    gradient?: boolean;
  };

export function BarChart({
  series,
  categories,
  colors,
  horizontal,
  gradient,
  dataLabels,
  legend,
  stacked,
  ...rest
}: Props) {
  const theme = useTheme();
  const options = useMemo(
    () =>
      getBarChartOptions({
        theme,
        series,
        categories,
        colors,
        horizontal,
        gradient,
        dataLabels,
        legend,
        stacked,
      }),
    [theme, series, categories, colors, horizontal, gradient, dataLabels, legend, stacked]
  );
  return <BaseChart options={options} {...rest} />;
}
