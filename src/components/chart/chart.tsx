'use client';

import './styles.css';

import type { BoxProps } from '@mui/material/Box';

import { useMemo } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { BaseChart } from 'src/components/charts/base/BaseChart';
import { apexToHighcharts } from 'src/components/charts/base/apexCompat';

import type { ChartProps } from './types';

// ----------------------------------------------------------------------
// Backwards-compatible <Chart /> component.
//
// Historically this rendered react-apexcharts. The dashboard has been
// migrated to Highcharts, but to avoid touching ~100+ consumer files we
// keep the same public API (`type`, `series`, `options`) and translate
// the ApexCharts-style options into Highcharts options at render time
// using the apexCompat translator.
// ----------------------------------------------------------------------

export function Chart({
  sx,
  type,
  series,
  height,
  options,
  loadingProps,
  width = '100%',
  ...other
}: BoxProps & ChartProps) {
  const theme = useTheme();

  const hcOptions = useMemo(
    () => apexToHighcharts(type as any, series, options, theme),
    [type, series, options, theme]
  );

  const isEmpty = useMemo(() => {
    if (Array.isArray(series) && series.length === 0) return true;
    if (
      Array.isArray(series) &&
      series.every((s: any) => Array.isArray(s?.data) && s.data.length === 0)
    )
      return true;
    return false;
  }, [series]);

  return (
    <Box
      dir="ltr"
      sx={{
        width,
        height,
        flexShrink: 0,
        borderRadius: 1.5,
        position: 'relative',
        ...sx,
      }}
      {...other}
    >
      <BaseChart
        options={hcOptions}
        height="100%"
        width="100%"
        empty={isEmpty}
        loading={false}
        loaderVariant={
          ['donut', 'pie', 'radialBar', 'polarArea'].includes(type) ? 'circular' : 'rectangular'
        }
        sx={loadingProps?.sx}
      />
    </Box>
  );
}
