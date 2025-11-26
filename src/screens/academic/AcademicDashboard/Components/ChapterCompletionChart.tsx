import React from 'react';
import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';

// Mock data: max 15 chapters per subject
const ChapterCompletionChart = () => {
  const series = [
    { name: 'Completed', data: [12, 10, 13, 11, 9, 14] },
    { name: 'Pending', data: [3, 5, 2, 4, 6, 1] },
  ];

  const chartOptions = useChart({
    chart: { stacked: true },
    xaxis: { categories: ['Math', 'Science', 'English', 'History', 'Geography', 'Physics'] },
    plotOptions: { bar: { horizontal: false, columnWidth: '40%' } },
    colors: ['#00AB55', '#FFAB00'], // Success, Warning
    tooltip: { y: { formatter: (val: number) => `${val}` } },
  });

  return (
    <Card>
      <CardHeader title="Chapter Completion" subheader="Progress by Subject" />
      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <Chart type="bar" series={series} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
};

export default ChapterCompletionChart;
