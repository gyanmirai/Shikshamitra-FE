import React from 'react';
import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';

const SyllabusGapAnalysisChart = () => {
  const series = [
    { name: 'Planned', data: [80, 85, 90, 75, 88] },
    { name: 'Actual', data: [75, 80, 85, 70, 82] },
  ];

  const chartOptions = useChart({
    xaxis: {
      categories: ['Math', 'Science', 'English', 'History', 'Geography'],
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val}%`,
      },
    },
  });

  return (
    <Card>
      <CardHeader title="Syllabus Gap Analysis" subheader="Planned vs Actual Progress" />
      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <Chart type="bar" series={series} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
};

export default SyllabusGapAnalysisChart;
