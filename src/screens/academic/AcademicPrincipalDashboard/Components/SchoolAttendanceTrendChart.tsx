import React from 'react';
import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';

const SchoolAttendanceTrendChart = () => {
  const series = [{ name: 'Attendance', data: [92, 94, 91, 95, 93, 96, 92] }];

  const chartOptions = useChart({
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val}%`,
      },
    },
  });

  return (
    <Card>
      <CardHeader title="School Attendance Trend" subheader="Daily attendance percentage" />
      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <Chart type="area" series={series} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
};

export default SchoolAttendanceTrendChart;
