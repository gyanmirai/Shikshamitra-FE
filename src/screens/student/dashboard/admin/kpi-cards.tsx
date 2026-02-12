import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { fPercent } from 'src/utils/format-number';
import { Chart, useChart } from 'src/components/chart';
import { Box, Card, Grid, Stack, Typography } from '@mui/material';

// ----------------------------------------------------------------------

interface Props {
  title: string;
  value: string | number;
  icon: string;
  percent: number;
  color?: string;
  bgColor?: string;
  chart: {
    data: number[];
  };
}

function EnhancedDashboardCard({ title, value, icon, percent, color, bgColor, chart }: Props) {
  const theme = useTheme();

  const chartOptions = useChart({
    chart: {
      sparkline: {
        enabled: true,
      },
    },
    stroke: {
      width: 2,
      curve: 'smooth', // Smooth curve for sparkline
    },
    colors: [theme.palette.success.main], // Default green, can be dynamic
    tooltip: {
      fixed: {
        enabled: false,
      },
      x: {
        show: false,
      },
      y: {
        title: {
          formatter: () => '',
        },
      },
      marker: {
        show: false,
      },
    },
  });

  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 2, // Keep padding consistent
        pl: 2.5,
        borderRadius: 2,
        height: '100%',
        position: 'relative',
        boxShadow: theme.shadows[2], // Consistent shadow
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
          {title}
        </Typography>

        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          {value}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
          <Iconify
            width={20}
            icon={percent < 0 ? 'eva:trending-down-fill' : 'eva:trending-up-fill'}
            sx={{
              color: percent < 0 ? 'error.main' : 'success.main',
            }}
          />

          <Typography component="div" variant="subtitle2">
            {percent > 0 && '+'}
            {fPercent(percent)}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
            vs last month
          </Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          width: 80,
          height: 50,
          lineHeight: 0,
          borderRadius: '50%',
          bgcolor: 'background.neutral',
        }}
      >
        <Chart
          dir="ltr"
          type="line"
          series={[{ data: chart.data }]}
          options={{
            ...chartOptions,
            colors: [percent < 0 ? theme.palette.error.main : theme.palette.success.main],
          }}
          width={80}
          height={50}
        />
      </Box>

      {/* Absolute positioned Icon for watermark effect or distinct placement if requested, 
            but for now keeping layout simple as per sparkline request */}
    </Card>
  );
}

// ----------------------------------------------------------------------

const kpiData = [
  {
    id: 'ENQ_TOTAL',
    title: 'Total Inquiries',
    value: '1,250',
    percent: 12.5,
    chart: { data: [20, 41, 63, 33, 28, 35, 50, 46, 11, 26] },
    icon: 'mdi:clipboard-text-outline',
    color: 'success.main',
    bgColor: 'success.lighter',
  },
  {
    id: 'REG_TOTAL',
    title: 'Total Registration',
    value: '980',
    percent: 8.2,
    chart: { data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35] },
    icon: 'mdi:account-plus-outline',
    color: 'info.main',
    bgColor: 'info.lighter',
  },
  {
    id: 'ADM_TOTAL',
    title: 'Total Admission',
    value: '850',
    percent: -2.4,
    chart: { data: [100, 40, 30, 70, 40, 20, 80, 40, 10, 20] },
    icon: 'mdi:file-document-edit-outline',
    color: 'warning.main',
    bgColor: 'warning.lighter',
  },
  {
    id: 'STU_TOTAL',
    title: 'Total Students',
    value: '3,500',
    percent: 5.1,
    chart: { data: [15, 35, 50, 40, 60, 45, 80, 70, 90, 100] },
    icon: 'mdi:school-outline',
    color: 'primary.main',
    bgColor: 'primary.lighter',
  },
  {
    id: 'STU_LEFT',
    title: 'Students Left',
    value: '45',
    percent: 1.2,
    chart: { data: [5, 10, 5, 15, 8, 12, 10, 15, 18, 20] }, // Positive trend in "Left" is actually bad, usually represented Red.
    icon: 'mdi:account-minus-outline',
    color: 'error.main',
    bgColor: 'error.lighter',
  },
  {
    id: 'RTE_STUDENTS',
    title: 'RTE Students',
    value: '120',
    percent: 0.5,
    chart: { data: [110, 112, 114, 115, 116, 118, 119, 120, 120, 120] },
    icon: 'mdi:account-check-outline',
    color: 'info.dark',
    bgColor: 'info.light',
  },
];

const AdminKPICards = () => (
  <Grid container spacing={1}>
    {kpiData.map((kpi) => (
      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={kpi.id}>
        <EnhancedDashboardCard
          title={kpi.title}
          value={kpi.value}
          icon={kpi.icon}
          percent={kpi.percent}
          color={kpi.color}
          bgColor={kpi.bgColor}
          chart={kpi.chart}
        />
      </Grid>
    ))}
  </Grid>
);

export default AdminKPICards;
