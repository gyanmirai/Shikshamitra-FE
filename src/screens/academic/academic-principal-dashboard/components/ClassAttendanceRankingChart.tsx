import React from 'react';
import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';

const ClassAttendanceRankingChart = () => {
  const series = [{ data: [98, 96, 95, 94, 92, 88, 85, 82, 80, 78] }];

  const chartOptions = useChart({
    tooltip: {
      marker: { show: false },
      y: {
        formatter: (value: number) => `${value}%`,
        title: {
          formatter: () => '',
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '28%',
        borderRadius: 2,
      },
    },
    xaxis: {
      categories: [
        'Class 12-A',
        'Class 10-B',
        'Class 11-A',
        'Class 9-C',
        'Class 8-A',
        'Class 7-B',
        'Class 6-A',
        'Class 5-C',
        'Class 4-B',
        'Class 3-A',
      ],
    },
  });

  return (
    <Card>
      <CardHeader title="Class Attendance Ranking" subheader="Best to worst attendance" />
      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <Chart type="bar" series={series} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
};

export default ClassAttendanceRankingChart;
