'use client';

import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';

import { BaseChart } from '../base/BaseChart';
import { getHeatmapOptions } from '../base/optionGenerators';

import type { BaseChartProps } from '../base/BaseChart';

type Props = Omit<BaseChartProps, 'options'> & {
  xCategories: string[];
  yCategories: string[];
  data: Array<[number, number, number]>;
  minColor?: string;
  maxColor?: string;
  legend?: boolean;
};

export function HeatmapChart({
  xCategories,
  yCategories,
  data,
  minColor,
  maxColor,
  legend,
  ...rest
}: Props) {
  const theme = useTheme();
  const options = useMemo(
    () => getHeatmapOptions({ theme, xCategories, yCategories, data, minColor, maxColor, legend }),
    [theme, xCategories, yCategories, data, minColor, maxColor, legend]
  );
  return <BaseChart options={options} {...rest} />;
}
