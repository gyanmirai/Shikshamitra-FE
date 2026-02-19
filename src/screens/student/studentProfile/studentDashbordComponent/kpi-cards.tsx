import React, { useState } from 'react';
import { useRouter } from 'src/routes/hooks';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Grid, Card, Stack, Typography, CircularProgress } from '@mui/material';

// ----------------------------------------------------------------------

interface StudentCompactKPICardProps {
  title: string;
  value: string | number;
  icon: string;
  percentChange?: number;
  trendData?: number[];
  status?: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary';
  sx?: any;
  path?: string;
  tooltip?: string;
  trendLabel?: string;
  showPercent?: boolean;
}

function StudentCompactKPICard({
  title,
  value,
  icon,
  percentChange = 0,
  trendData = [5, 10, 5, 15, 10, 20, 15, 25],
  status = 'info',
  path,
  tooltip,
  trendLabel,
  showPercent = true,
  sx,
}: StudentCompactKPICardProps) {
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

  const chartOptions = useChart({
    colors: [theme.palette[status].main],
    fill: {
      type: 'gradient',
      gradient: {
        colorStops: [
          { offset: 0, color: theme.palette[status].light, opacity: 1 },
          { offset: 100, color: theme.palette[status].main, opacity: 1 },
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
          {showPercent && (
            <>
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
            </>
          )}
          <Typography
            variant="body2"
            component="span"
            sx={{ color: 'text.secondary', ml: showPercent ? 0.5 : 0 }}
          >
            {trendLabel || 'vs last month'}
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

export const studentKpiData = [
  {
    id: 'ACADEMIC_PERF',
    title: 'Academic Performance',
    value: '86%',
    percent: 3,
    chart: { data: [70, 75, 72, 78, 80, 85, 82, 86] },
    icon: 'hugeicons:chart-evaluation',
    status: 'success' as const,
    path: '/performance',
    tooltip: 'Class Rank: 5 / 45. Last Exam: 83%',
    trendLabel: 'vs last exam',
  },
  {
    id: 'ATTENDANCE_SUM',
    title: 'Attendance Summary',
    value: '92%',
    percent: -2,
    chart: { data: [95, 96, 98, 92, 90, 88, 90, 92] },
    icon: 'lucide:user-round-check',
    status: 'success' as const,
    path: '/attendance',
    tooltip: 'Total Present: 200, Absent: 18. Warning: Keep above 75%.',
    trendLabel: 'vs last month',
  },
  {
    id: 'FEE_STATUS',
    title: 'Fee Status - Pending',
    value: '₹2,500',
    percent: 0,
    showPercent: false,
    chart: { data: [5000, 4500, 4000, 3500, 3000, 2500, 2500, 2500] },
    icon: 'streamline-plump:payment-recieve-7-remix',
    status: 'warning' as const,
    path: '/fees',
    tooltip: 'Total: ₹12,000 | Paid: ₹9,500 | Due Date: 15 Aug 2025',
    trendLabel: 'View Details',
  },
  {
    id: 'HOMEWORK_STATUS',
    title: 'Homework Completion',
    value: '95%',
    percent: 0,
    showPercent: false,
    chart: { data: [80, 85, 82, 88, 90, 92, 94, 95] },
    icon: 'mdi:book-open-page-variant-outline',
    status: 'success' as const,
    path: '/homework',
    tooltip: 'Total: 50 | Completed: 47 | Pending: 3 | Overdue: 0',
    trendLabel: '2 due this week',
  },
];

export const StudentProfileKPICards = () => (
  <Grid container spacing={1}>
    {studentKpiData.map((kpi) => (
      <Grid size={{ xs: 12, sm: 6, md: 3 }} key={kpi.id}>
        <StudentCompactKPICard
          title={kpi.title}
          value={kpi.value}
          icon={kpi.icon}
          percentChange={kpi.percent}
          trendData={kpi.chart.data}
          path={kpi.path}
          tooltip={kpi.tooltip}
          status={kpi.status}
          trendLabel={kpi.trendLabel}
          showPercent={kpi.showPercent}
        />
      </Grid>
    ))}
  </Grid>
);

export default StudentProfileKPICards;
