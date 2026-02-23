import React, { useState } from 'react';
import { useRouter } from 'src/routes/hooks';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import CustomTooltip from 'src/components/custom-tooltip';
import { fNumber, fPercent } from 'src/utils/format-number';
import { Box, Grid, Card, Stack, Typography, CircularProgress } from '@mui/material';

// ----------------------------------------------------------------------

interface CompactKPICardProps {
  title: string;
  value: string;
  percentChange?: number;
  trendData?: number[];
  status?: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary';
  sx?: any;
  path?: string;
  tooltip?: string;
}

function CompactKPICard({
  title,
  value,
  percentChange = 0,
  trendData = [],
  status = 'info',
  path,
  tooltip,
  sx,
}: CompactKPICardProps) {
  const theme = useTheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.tooltip-icon')) return;

    if (path) {
      setIsLoading(true);
      router.push(path);
    }
  };

  const mainColor = theme.palette[status].main;
  const lightColor = theme.palette[status].light;

  const chartOptions = useChart({
    colors: [mainColor],
    fill: {
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
          formatter: () => '',
        },
      },
      marker: { show: false },
    },
    stroke: { width: 2, curve: 'smooth' },
    plotOptions: { bar: { columnWidth: '80%', borderRadius: 2 } },
  });

  const isPositive = percentChange >= 0;

  return (
    <Card
      onClick={handleClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 2,
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
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(2px)',
            borderRadius: 2,
          }}
        >
          <CircularProgress color="primary" size={24} />
        </Box>
      )}

      <Box sx={{ flexGrow: 1 }}>
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {title}
          </Typography>
          {tooltip && (
            <CustomTooltip title={tooltip} arrow placement="top">
              <Box component="span" className="tooltip-icon" sx={{ display: 'inline-flex' }}>
                <Iconify
                  icon="eva:info-outline"
                  width={16}
                  sx={{ color: 'text.disabled', cursor: 'help' }}
                />
              </Box>
            </CustomTooltip>
          )}
        </Stack>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
          {value}
        </Typography>

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
            vs last month
          </Typography>
        </Stack>
      </Box>

      <Box sx={{ width: 80, height: 40 }}>
        <Chart
          type="line"
          series={[{ data: trendData }]}
          options={chartOptions}
          width={80}
          height={40}
          dir="ltr"
        />
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------

export default function KPIOverview() {
  const cards = [
    {
      id: 'total-classes',
      title: 'Total Classes',
      value: fNumber(24),
      percent: 5.2,
      trendData: [20, 22, 21, 23, 24, 24, 25, 24],
      status: 'primary',
      tooltip: 'Total active classes in the current academic year',
    },
    {
      id: 'total-divisions',
      title: 'Total Divisions',
      value: fNumber(48),
      percent: 2.1,
      trendData: [40, 42, 45, 46, 47, 48, 48, 48],
      status: 'info',
      tooltip: 'Total divisions across all classes',
    },
    {
      id: 'total-students',
      title: 'Total Students',
      value: fNumber(2450),
      percent: 8.5,
      trendData: [2200, 2300, 2350, 2400, 2420, 2450, 2450, 2450],
      status: 'success',
      tooltip: 'Active students count',
    },
    {
      id: 'avg-attendance',
      title: 'Avg. Attendance',
      value: fPercent(88),
      percent: -1.2,
      trendData: [90, 89, 88, 87, 88, 89, 88, 88],
      status: 'warning',
      tooltip: 'Average daily attendance percentage',
    },
    {
      id: 'no-teacher',
      title: 'Classes w/o Teacher',
      value: fNumber(3),
      percent: 12.5,
      trendData: [1, 2, 1, 2, 3, 3, 4, 3],
      status: 'error',
      tooltip: 'Classes currently without an assigned class teacher',
    },
    {
      id: 'low-performing',
      title: 'Low Performing',
      value: fNumber(5),
      percent: -5.0,
      trendData: [8, 7, 7, 6, 6, 5, 5, 5],
      status: 'error',
      tooltip: 'Classes with average performance below 60%',
    },
  ];

  return (
    <Grid container spacing={1}>
      {cards.map((card) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={card.id}>
          <CompactKPICard
            title={card.title}
            value={card.value}
            percentChange={card.percent}
            trendData={card.trendData}
            // @ts-ignore
            status={card.status}
            tooltip={card.tooltip}
          />
        </Grid>
      ))}
    </Grid>
  );
}
