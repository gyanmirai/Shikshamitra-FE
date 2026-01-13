import React from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { Chart, useChart } from 'src/components/chart';
import { Box, Card, Stack, Typography } from '@mui/material';

const AttendanceTrend = () => {
  const theme = useTheme();

  const chartOptions = useChart({
    colors: [theme.palette.primary.main, theme.palette.error.main],
    fill: {
      type: 'gradient',
      gradient: {
        colorStops: [
          [
            { offset: 0, color: theme.palette.primary.light, opacity: 0.3 },
            { offset: 100, color: theme.palette.primary.light, opacity: 0.05 },
          ],
          [
            { offset: 0, color: theme.palette.error.light, opacity: 0.3 },
            { offset: 100, color: theme.palette.error.light, opacity: 0.05 },
          ],
        ],
      },
    },
    chart: {
      toolbar: { show: false },
      sparkline: { enabled: false },
    },
    grid: {
      strokeDashArray: 3,
      borderColor: theme.palette.divider,
      xaxis: { lines: { show: false } },
    },
    stroke: {
      show: true,
      width: 3,
      curve: 'smooth',
      lineCap: 'round',
    },
    xaxis: {
      categories: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: { show: false }, // Custom legend used in stats if needed, or keep top legend
  });

  return (
    <Card
      sx={{
        p: 3,
        height: '100%',
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Attendance Trend
        </Typography>
        {/* Optional: Add a select dropdown for Year/Month if functionality allowed, but restricted here. */}
      </Box>

      <Chart
        type="area"
        series={[
          { name: 'Total Present', data: [22, 25, 28, 24, 26, 27, 25, 23, 24, 26, 28, 25] },
          { name: 'Total Absent', data: [3, 2, 4, 1, 3, 2, 4, 2, 1, 3, 2, 3] },
        ]}
        options={chartOptions}
        height={320}
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ width: '100%' }} // Ensure full width
      />

      <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'center' }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 1.5,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            width: '100%',
            textAlign: 'center',
          }}
        >
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
            Total Present
          </Typography>
          <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 700 }}>
            22 Days
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2,
            borderRadius: 1.5,
            bgcolor: alpha(theme.palette.error.main, 0.08),
            width: '100%',
            textAlign: 'center',
          }}
        >
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
            Total Absent
          </Typography>
          <Typography variant="h5" sx={{ color: 'error.main', fontWeight: 700 }}>
            02 Days
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
};

export default AttendanceTrend;
