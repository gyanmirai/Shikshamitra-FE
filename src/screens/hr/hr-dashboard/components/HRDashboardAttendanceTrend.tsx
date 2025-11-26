import React from 'react';
import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';

const HRDashboardAttendanceTrend = () => {
  const series = [
    {
      name: 'Present',
      data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43],
    },
    {
      name: 'Leave',
      data: [13, 23, 20, 8, 13, 27, 33, 12, 19, 14, 20],
    },
    {
      name: 'Absent',
      data: [11, 17, 15, 15, 21, 14, 15, 13, 10, 12, 17],
    },
  ];

  const chartOptions = useChart({
    colors: ['#00AB55', '#FFAB00', '#FF5630'],
    stroke: {
      width: 2,
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value} Staff`,
      },
    },
  });

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title="Attendance Overview" />
      <Box sx={{ mt: 3, mx: 3 }} dir="ltr">
        <Chart type="area" series={series} options={chartOptions} height={320} />
      </Box>
    </Card>
  );
};

export default HRDashboardAttendanceTrend;
