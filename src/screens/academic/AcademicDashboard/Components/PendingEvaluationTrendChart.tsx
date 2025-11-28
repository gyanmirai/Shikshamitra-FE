import React from 'react';
import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';

const PendingEvaluationTrendChart = () => {
  const series = [
    { name: 'Homework Pending', data: [10, 15, 8, 12, 20, 10] },
    { name: 'Assignments Pending', data: [5, 8, 12, 5, 10, 8] },
  ];

  const chartOptions = useChart({
    xaxis: {
      categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    },
    colors: ['#FFAB00', '#FF4842'], // Warning, Error
  });

  return (
    <Card>
      <CardHeader title="Pending Evaluation Trend" subheader="Teacher Workload" />
      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <Chart type="bar" series={series} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
};

export default PendingEvaluationTrendChart;
