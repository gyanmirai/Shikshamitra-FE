import React, { useState } from 'react';
import { useRouter } from 'src/routes/hooks';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Stack, Typography, CircularProgress } from '@mui/material';

interface CompactKPICardProps {
  title: string;
  value: string | number;
  icon: string;
  percentChange?: number;
  trendData?: number[];
  status?: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary';
  sx?: any;
  path?: string;
  tooltip?: string;
  comparisonLabel?: string;
  chart?: {
    type?: 'line' | 'bar' | 'area' | 'donut' | 'pie' | 'radialBar';
    series?: any[];
    colors?: string[];
    options?: any;
    width?: number;
    height?: number;
    labels?: string[];
  };
}

const RADIAL_TYPES = ['donut', 'pie', 'radialBar'];

export default function CompactKPICard({
  title,
  value,
  icon,
  percentChange,
  trendData,
  status = 'info',
  path,
  tooltip,
  comparisonLabel,
  chart,
  sx,
}: CompactKPICardProps) {
  const theme = useTheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on tooltip
    if ((e.target as HTMLElement).closest('.tooltip-icon')) return;

    if (path) {
      setIsLoading(true);
      router.push(path);
    }
  };

  const mainColor = theme.palette[status].main;
  const lightColor = theme.palette[status].light;
  const lighterColor = theme.palette[status].lighter;

  const isRadialChart = RADIAL_TYPES.includes(chart?.type || '');

  const sparklineOptions = useChart({
    colors: chart?.colors || [mainColor],
    fill:
      chart?.type === 'bar'
        ? { type: 'solid' }
        : {
            type: 'gradient',
            gradient: {
              colorStops: [
                { offset: 0, color: lightColor, opacity: 1 },
                { offset: 100, color: mainColor, opacity: 1 },
              ],
            },
          },
    chart: {
      animations: { enabled: false },
      sparkline: { enabled: true },
    },
    tooltip: {
      x: { show: false },
      y: {
        formatter: (val: number) => `${val}`,
        title: {
          formatter: (_s: string, opts?: any) =>
            chart?.labels?.[opts?.dataPointIndex] ? `${chart.labels[opts.dataPointIndex]}: ` : '',
        },
      },
      marker: { show: true },
    },
    stroke: {
      show: true,
      width: chart?.type === 'bar' ? 4 : 2,
      colors: chart?.type === 'bar' ? ['transparent'] : undefined,
      curve: 'smooth',
    },
    plotOptions: {
      bar: { columnWidth: '60%', borderRadius: 2, distributed: chart?.type === 'bar' },
    },
    xaxis: {
      categories: chart?.labels || [],
    },
    ...(!isRadialChart ? chart?.options : {}),
  });

  const donutOptions = useChart({
    colors: chart?.colors || [mainColor, lighterColor],
    labels: chart?.labels || [],
    chart: {
      animations: { enabled: false },
      sparkline: { enabled: true },
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      fillSeriesColor: false,
      style: { fontSize: '11px' },
      y: {
        formatter: (val: number) => `${val}`,
        title: { formatter: (name: string) => `${name}: ` },
      },
      marker: { show: true },
    },
    stroke: { width: 0 },
    plotOptions: {
      pie: {
        donut: {
          size: '60%',
          labels: {
            show: false,
            total: { show: false },
          },
        },
      },
      radialBar: {
        hollow: { size: '40%' },
        dataLabels: { show: false },
        track: { background: lighterColor },
      },
    },
    ...(isRadialChart ? chart?.options : {}),
  });

  // Keep backward-compat alias
  const chartOptions = sparklineOptions;

  const isPositive = percentChange !== undefined && percentChange >= 0;

  return (
    <Card
      onClick={handleClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 2,
        py: 1.5,
        height: '100%',
        position: 'relative',
        cursor: path ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': path
          ? {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[8],
            }
          : {},
        ...sx,
      }}
    >
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (t) => t.vars.palette.background.paper,
            opacity: 0.8,
            backdropFilter: 'blur(2px)',
            borderRadius: 2,
          }}
        >
          <CircularProgress color="primary" size={24} />
        </Box>
      )}

      <Box sx={{ flexGrow: 1 }}>
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.25 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {title}
          </Typography>
          {tooltip && (
            <CustomTooltip title={tooltip} arrow placement="top">
              <Box component="span" className="tooltip-icon" sx={{ display: 'inline-flex' }}>
                <Iconify icon="eva:info-outline" width={16} sx={{ color: 'text.disabled' }} />
              </Box>
            </CustomTooltip>
          )}
        </Stack>
        <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 700 }}>
          {value}
        </Typography>

        {percentChange && (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Iconify
              icon={isPositive ? 'eva:trending-up-fill' : 'eva:trending-down-fill'}
              sx={{
                color: isPositive ? 'success.main' : 'error.main',
                width: 18,
                height: 18,
              }}
            />
            <Typography
              variant="subtitle2"
              component="span"
              sx={{ color: isPositive ? 'success.main' : 'error.main' }}
            >
              {Math.abs(percentChange)}%
            </Typography>
            <Typography variant="body2" component="span" sx={{ color: 'text.secondary', ml: 0.5 }}>
              Compare to last year
            </Typography>
          </Stack>
        )}
      </Box>

      {chart?.series &&
        isRadialChart &&
        (() => {
          const w = chart.width ?? 64;
          const h = chart.height ?? 64;
          return (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                flexShrink: 0,
              }}
            >
              <Chart
                type={chart.type as any}
                series={chart.series}
                options={donutOptions}
                width={w}
                height={h}
                dir="ltr"
              />
            </Box>
          );
        })()}

      {chart?.series &&
        !isRadialChart &&
        (() => {
          const w = chart.width ?? 80;
          const h = chart.height ?? 40;
          return (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                flexShrink: 0,
              }}
            >
              <Chart
                type={(chart.type || 'line') as any}
                series={[{ data: chart.series as number[] }]}
                options={sparklineOptions}
                width={w}
                height={h}
                dir="ltr"
              />
            </Box>
          );
        })()}

      {!chart?.series && trendData && (
        <Box sx={{ width: 80, height: 40, flexShrink: 0 }}>
          <Chart
            type="line"
            series={[{ data: trendData }]}
            options={chartOptions}
            width={80}
            height={40}
            dir="ltr"
          />
        </Box>
      )}
    </Card>
  );
}
