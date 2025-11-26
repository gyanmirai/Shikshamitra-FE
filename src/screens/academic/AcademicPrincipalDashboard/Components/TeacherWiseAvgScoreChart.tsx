import React from 'react';
import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';

const TeacherWiseAvgScoreChart = () => {
  const series = [{ name: 'Average Score', data: [85, 82, 78, 75, 72, 70, 68, 65] }];

  const chartOptions = useChart({
    xaxis: {
      categories: [
        'Mr. Sharma',
        'Ms. Gupta',
        'Mrs. Singh',
        'Mr. Patel',
        'Ms. Rao',
        'Mr. Kumar',
        'Mrs. Devi',
        'Mr. Verma',
      ],
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val}%`,
      },
    },
  });

  return (
    <Card>
      <CardHeader title="Teacher-wise Average Score" subheader="Student performance by teacher" />
      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <Chart type="bar" series={series} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
};

export default TeacherWiseAvgScoreChart;
