'use client';

import type Highcharts from 'highcharts';
import type { BoxProps } from '@mui/material/Box';

import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { useRef, useMemo, useEffect } from 'react';

import { mergeDeep } from './deepMerge';
import { ChartLoader } from './ChartLoader';
import { buildChartTheme } from './chartTheme';
import { ChartEmptyState } from './ChartEmptyState';

// ----------------------------------------------------------------------

const HighchartsClient = dynamic(
  () => import('./HighchartsClient').then((m) => m.HighchartsClient),
  { ssr: false }
);

// ----------------------------------------------------------------------

export type BaseChartProps = BoxProps & {
  options: Highcharts.Options;
  height?: number | string;
  width?: number | string;
  loading?: boolean;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  loaderVariant?: 'rectangular' | 'circular';
  /** Optional callback receiving the Highcharts chart instance. */
  onChartReady?: (chart: Highcharts.Chart) => void;
};

export function BaseChart({
  options,
  height = '100%',
  width = '100%',
  loading,
  empty,
  emptyTitle,
  emptyDescription,
  loaderVariant,
  onChartReady,
  sx,
  ...other
}: BaseChartProps) {
  const theme = useTheme();
  const chartRef = useRef<any>(null);

  // Memoize the merged options. The deep merge ensures the global premium
  // theme is always applied while the caller's options override anything.
  const mergedOptions = useMemo<Highcharts.Options>(() => {
    const base = buildChartTheme(theme);
    return mergeDeep(base, options ?? {});
  }, [theme, options]);

  useEffect(() => {
    if (chartRef.current?.chart && onChartReady) {
      onChartReady(chartRef.current.chart);
    }
  }, [onChartReady, mergedOptions]);

  return (
    <Box
      dir="ltr"
      sx={{
        position: 'relative',
        width,
        height,
        flexShrink: 0,
        borderRadius: 1.5,
        '& .highcharts-container, & .highcharts-root': {
          fontFamily: theme.typography.fontFamily,
          overflow: 'visible !important',
        },
        '& .highcharts-background': { fill: 'transparent' },
        '& .highcharts-credits': { display: 'none' },
        ...sx,
      }}
      {...other}
    >
      {!empty && (
        <HighchartsClient
          ref={chartRef}
          options={mergedOptions}
          containerProps={{ style: { width: '100%', height: '100%' } }}
        />
      )}

      {loading && <ChartLoader variant={loaderVariant} />}
      {!loading && empty && <ChartEmptyState title={emptyTitle} description={emptyDescription} />}
    </Box>
  );
}
