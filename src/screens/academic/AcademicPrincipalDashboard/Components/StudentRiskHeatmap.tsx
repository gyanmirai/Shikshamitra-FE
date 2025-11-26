import React from 'react';
import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';

const StudentRiskHeatmap = () => {
  const series = [
    { name: 'Math', data: [10, 20, 30, 40, 50] },
    { name: 'Science', data: [20, 30, 40, 50, 60] },
    { name: 'English', data: [30, 40, 50, 60, 70] },
    { name: 'History', data: [40, 50, 60, 70, 80] },
    { name: 'Geography', data: [50, 60, 70, 80, 90] },
  ];

  const chartOptions = useChart({
    xaxis: {
      categories: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} students at risk`,
      },
    },
  });

  return (
    <Card>
      <CardHeader title="Student Risk Heatmap" subheader="Subjects with high failure rates" />
      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <Chart type="heatmap" series={series} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
};

export default StudentRiskHeatmap;
