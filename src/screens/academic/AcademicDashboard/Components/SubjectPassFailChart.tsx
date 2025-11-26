import React from 'react';
import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';

const SubjectPassFailChart = () => {
  const series = [
    { name: 'Passed', data: [45, 52, 38, 24, 33, 26, 21] },
    { name: 'Failed', data: [35, 41, 62, 42, 13, 18, 29] },
  ];

  const chartOptions = useChart({
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: ['Math', 'Science', 'English', 'History', 'Geography', 'Physics', 'Chemistry'],
    },
    colors: ['#00AB55', '#FF4842'], // Success, Error
    tooltip: {
      y: {
        formatter: (val: number) => `${val} students`,
      },
    },
  });

  return (
    <Card>
      <CardHeader title="Subject-wise Pass/Fail Rate" subheader="Student Performance by Subject" />
      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <Chart type="bar" series={series} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
};

export default SubjectPassFailChart;
