'use client';

import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';

import { BaseChart } from '../base/BaseChart';
import { getPieChartOptions } from '../base/optionGenerators';

import type { BaseChartProps } from '../base/BaseChart';

type Props = Omit<BaseChartProps, 'options'> & {
  data: Array<{ name: string; y: number; color?: string }>;
  colors?: string[];
  donut?: boolean;
  innerSize?: string;
  showLabels?: boolean;
  legend?: boolean;
};

export function PieChart({ data, colors, donut, innerSize, showLabels, legend, ...rest }: Props) {
  const theme = useTheme();
  const options = useMemo(
    () => getPieChartOptions({ theme, data, colors, donut, innerSize, showLabels, legend }),
    [theme, data, colors, donut, innerSize, showLabels, legend]
  );
  return <BaseChart options={options} {...rest} />;
}
