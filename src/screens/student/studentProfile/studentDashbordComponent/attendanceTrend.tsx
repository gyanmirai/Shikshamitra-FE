import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Chart, useChart } from 'src/components/chart';
import { Box, Card, Grid, Typography } from '@mui/material';

const AttendanceTrend = () => {
  const theme = useTheme();
  const chartOptions = useChart({
    colors: [theme.palette.primary.main, theme.palette.error.main],
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
    },
  });
  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <Card sx={{ p: 3, boxShadow: 'var(--shadows-4)', height: '100%' }}>
        <Typography variant="h6">Attendance Trend (Last 6 Month)</Typography>
        <Chart
          type="area"
          series={[
            { name: 'Total Present', data: [22, 25, 28, 24, 26, 27, 25, 23, 24, 26, 28, 25] },
            { name: 'Total Absent', data: [3, 2, 4, 1, 3, 2, 4, 2, 1, 3, 2, 3] },
          ]}
          options={chartOptions}
          height={320}
          loadingProps={{ sx: { p: 2.5 } }}
          sx={{ py: 2.5, pl: 1, pr: 2.5 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle2">Total Present Days</Typography>
            <Typography
              color={theme.palette.primary.main}
              variant="subtitle1"
              sx={{ fontWeight: 700 }}
            >
              22 Present
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle2">Total Present Days</Typography>
            <Typography
              color={theme.palette.error.main}
              variant="subtitle1"
              sx={{ fontWeight: 700 }}
            >
              02 Absent
            </Typography>
          </Box>
        </Box>
      </Card>
    </Grid>
  );
};

export default AttendanceTrend;
