'use client';

import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';

import { BaseChart } from '../base/BaseChart';
import { getAreaChartOptions } from '../base/optionGenerators';

import type { BaseChartProps } from '../base/BaseChart';
import type { SeriesPoint, CommonGenInput } from '../base/optionGenerators';

type Props = Omit<BaseChartProps, 'options'> &
  Omit<CommonGenInput, 'theme'> & {
    series: Array<{ name: string; data: SeriesPoint[]; color?: string }>;
    smooth?: boolean;
  };

export function AreaChart({
  series,
  categories,
  colors,
  smooth = true,
  dataLabels,
  legend,
  stacked,
  ...rest
}: Props) {
  const theme = useTheme();
  const options = useMemo(
    () =>
      getAreaChartOptions({
        theme,
        series,
        categories,
        colors,
        smooth,
        dataLabels,
        legend,
        stacked,
      }),
    [theme, series, categories, colors, smooth, dataLabels, legend, stacked]
  );
  return <BaseChart options={options} {...rest} />;
}
