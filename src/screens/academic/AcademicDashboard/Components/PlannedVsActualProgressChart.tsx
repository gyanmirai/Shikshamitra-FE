import React from 'react';
import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';

const PlannedVsActualProgressChart = () => {
  const series = [
    { name: 'Planned', data: [100, 100, 100, 100, 100, 100] },
    { name: 'Actual', data: [85, 90, 75, 95, 80, 88] },
  ];

  const chartOptions = useChart({
    stroke: {
      show: true,
      width: 4,
      colors: ['transparent'],
    },
    xaxis: {
      categories: ['Math', 'Science', 'English', 'History', 'Geography', 'Physics'],
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val}%`,
      },
    },
  });

  return (
    <Card>
      <CardHeader title="Planned vs Actual Progress" subheader="Syllabus Coverage" />
      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <Chart type="bar" series={series} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
};

export default PlannedVsActualProgressChart;
