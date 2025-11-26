import React from 'react';
import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';

const TeacherEffectivenessChart = () => {
  const series = [
    { name: 'Teacher A', data: [80, 50, 30, 40, 100, 20] },
    { name: 'Teacher B', data: [20, 30, 40, 80, 20, 80] },
    { name: 'Teacher C', data: [44, 76, 78, 13, 43, 10] },
  ];

  const chartOptions = useChart({
    xaxis: {
      categories: ['Performance', 'Improvement', 'Timeliness', 'Engagement', 'Feedback', 'Results'],
    },
  });

  return (
    <Card>
      <CardHeader title="Teacher Effectiveness" subheader="Comparison across metrics" />
      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <Chart type="radar" series={series} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
};

export default TeacherEffectivenessChart;
