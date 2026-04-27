import React, { useState } from 'react';
import { useRouter } from 'src/routes/hooks';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { varAlpha } from 'src/theme/styles/utils';
import { Chart, useChart } from 'src/components/chart';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Stack, Typography, CircularProgress } from '@mui/material';

interface CompactKPICardProps {
  title: string;
  value: string | number;
  trendData?: number[];
  status?: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary';
  sx?: any;
  path?: string;
  tooltip?: string;
  icon?: string;

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
  trendData,
  status = 'info',
  path,
  tooltip,
  icon,
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
    colors: chart?.colors || [lightColor],

    chart: {
      animations: { enabled: false },
      sparkline: { enabled: true },
    },

    // Hide the y-axis to keep the KPI sparkline compact and free of chart chrome.
    yaxis: {
      show: false,
    },

    xaxis: {
      categories: chart?.labels || [],
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },

    grid: {
      show: false,
    },

    tooltip: {
      x: { show: false },
      y: {
        formatter: (val: number) => `${val}`,
        title: {
          formatter: (seriesName: string, opts?: any) => {
            const cats = opts?.w?.config?.xaxis?.categories;
            const idx = opts?.dataPointIndex ?? 0;
            const label = cats?.[idx] ?? seriesName;
            return label ? `${label}: ` : '';
          },
        },
      },
    },

    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.2,
        opacityFrom: 0.7,
        opacityTo: 0.4,
        stops: [0, 100],
      },
    },

    ...(!isRadialChart ? chart?.options : {}),
  });

  const donutOptions = useChart({
    colors: chart?.colors || [lightColor, lighterColor],
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
      fixed: {
        enabled: false,
      },
    },
    stroke: { lineCap: 'round', width: 0 },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'horizontal',
        shadeIntensity: 0.4,
        opacityFrom: 1,
        opacityTo: 0.75,
        stops: [0, 100],
      },
    },
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

  return (
    <Card
      onClick={handleClick}
      sx={{
        overflow: 'visible', // allows native apex tooltip to render outside without clipping
        display: 'flex',
        alignItems: 'center',
        px: 2,
        py: 1.5,
        height: '100%',
        position: 'relative',
        cursor: path ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '& .apexcharts-tooltip': {
          pointerEvents: 'none !important', // Fixes lingering
          zIndex: 9999, // Brings above other elements
        },
        '& .apexcharts-tooltip.apexcharts-active': {
          opacity: 1,
        },
        '&:hover': path
          ? {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[8],
              zIndex: 10,
            }
          : { zIndex: 10 },
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
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.25 }}>
          {icon && (
            <Box
              sx={{
                width: 32,
                height: 32,
                display: 'flex',
                borderRadius: '8px',
                alignItems: 'center',
                justifyContent: 'center',
                color: `${status}.main`,
                bgcolor: (t) => varAlpha(t.vars.palette[status].mainChannel, 0.16),
              }}
            >
              <Iconify icon={icon} width={20} />
            </Box>
          )}

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
                series={[
                  {
                    name: '',
                    data: (chart.series as number[]).map((v, i) => ({
                      x: chart.labels?.[i] ?? i,
                      y: v,
                    })),
                  },
                ]}
                options={{
                  ...sparklineOptions,
                  plotOptions: {
                    bar: {
                      distributed: !!(chart.colors && chart.colors.length > 1),
                      borderRadius: 4,
                      columnWidth: '60%',
                    },
                  },
                }}
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
