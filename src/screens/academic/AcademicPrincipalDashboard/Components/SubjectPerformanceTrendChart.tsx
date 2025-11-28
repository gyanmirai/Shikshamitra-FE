import React from 'react';
import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';

const SubjectPerformanceTrendChart = () => {
  const series = [
    { name: 'Math', data: [75, 78, 80, 82, 85] },
    { name: 'Science', data: [70, 72, 75, 78, 80] },
    { name: 'English', data: [80, 82, 83, 85, 88] },
  ];

  const chartOptions = useChart({
    xaxis: {
      categories: ['Exam 1', 'Exam 2', 'Exam 3', 'Exam 4', 'Exam 5'],
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val}%`,
      },
    },
  });

  return (
    <Card>
      <CardHeader title="Subject Performance Trend" subheader="Average scores across exams" />
      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <Chart type="line" series={series} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
};

export default SubjectPerformanceTrendChart;
