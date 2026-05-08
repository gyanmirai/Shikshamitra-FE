'use client';

import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';

import { BaseChart } from '../base/BaseChart';
import { getGaugeChartOptions, getRadialProgressOptions } from '../base/optionGenerators';

import type { BaseChartProps } from '../base/BaseChart';

type Props = Omit<BaseChartProps, 'options'> & {
  value: number;
  min?: number;
  max?: number;
  color?: string;
  label?: string;
  variant?: 'gauge' | 'radial';
};

export function GaugeChart({ value, min, max, color, label, variant = 'gauge', ...rest }: Props) {
  const theme = useTheme();
  const options = useMemo(
    () =>
      variant === 'radial'
        ? getRadialProgressOptions({ theme, value, color })
        : getGaugeChartOptions({ theme, value, min, max, color, label }),
    [theme, value, min, max, color, label, variant]
  );
  return <BaseChart options={options} {...rest} />;
}
